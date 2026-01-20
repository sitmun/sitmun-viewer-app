import { inject, Injectable } from '@angular/core';

import { AppCfg, AppNodeInfo, AppTasks, AppTree } from '@api/model/app-cfg';

import { CatalogSwitchingService } from '../../services/catalog-switching.service';
import { ConfigLookupService } from '../../services/config-lookup.service';
import { RasterLayerService } from '../../services/raster-layer.service';
import { SitnaNamespaceService } from '../../services/sitna-namespace.service';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import { VirtualWmsCapabilitiesService } from '../../services/virtual-wms-capabilities.service';
import type { Meld, MeldJoinPoint } from '../../types/meld.types';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

// Declare require for CommonJS module import
declare function require(module: string): any;

// meld is a CommonJS module, so we use require with proper typing
const meld = require('meld') as Meld;

/**
 * Handler for standard SITNA layerCatalog control using virtual WMS capabilities.
 * This is the "new way" - standard SITNA control displaying SITMUN trees.
 *
 * Control Type: sitna.layerCatalog
 * Patches: Applied programmatically (not via JS files)
 * Configuration: Uses VirtualWmsCapabilitiesService to generate capabilities
 */
@Injectable({
  providedIn: 'root'
})
export class LayerCatalogControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.layerCatalog';
  readonly sitnaConfigKey = 'layerCatalog';
  readonly requiredPatches = undefined; // Patches applied programmatically

  private readonly virtualWmsService = inject(VirtualWmsCapabilitiesService);
  private readonly configLookup = inject(ConfigLookupService);
  private readonly sitnaNamespaceService = inject(SitnaNamespaceService);
  private readonly catalogSwitching = inject(CatalogSwitchingService);
  private readonly rasterService = inject(RasterLayerService);

  // Store AppCfg for use in patches
  // Set in loadPatches() before patches are applied, so it's guaranteed to be non-null when patches execute
  private currentAppCfg: AppCfg | null = null;

  // Track if patches have been applied to avoid reapplying on map reload
  private patchesApplied = false;

  constructor(tcNamespaceService: TCNamespaceService) {
    super(tcNamespaceService);
  }

  /**
   * Apply foundational patch (Layer.getCapabilitiesOnline) early, before map initialization.
   * This is called as a preload step to ensure virtual WMS interception works.
   *
   * @param context - Full application configuration context (required, must not be null)
   */
  async applyFoundationPatch(context: AppCfg): Promise<void> {
    // Store AppCfg immediately for use in patch closures
    this.currentAppCfg = context;

    // Ensure context is initialized in lookup service
    this.configLookup.initialize(context);

    // Wait for SITNA and TC to be available
    await this.sitnaNamespaceService.waitForSITNA(50, 100);
    await this.tcNamespaceService.waitForTC();

    // Apply ONLY the foundational patch - other patches will be applied in loadPatches()
    await this.patchLayerGetCapabilitiesOnline();
  }

  /**
   * Load and apply all virtual WMS patches programmatically.
   * This replaces the need for standalone JS patch files.
   *
   * Patches are applied only once and persist across map reloads.
   *
   * @param context - Full application configuration context (required, must not be null)
   */
  override async loadPatches(context: AppCfg): Promise<void> {
    // Store AppCfg immediately (needed for patches even if already applied)
    this.currentAppCfg = context;

    // Ensure context is initialized in lookup service
    this.configLookup.initialize(context);

    // Guard: Don't reapply patches on map reload
    if (this.patchesApplied) {
      return;
    }

    // Wait for SITNA and TC to be available
    await this.sitnaNamespaceService.waitForSITNA(50, 100);
    await this.tcNamespaceService.waitForTC();

    // Apply patches in order (matching sandbox sequence)
    await this.patchLayerGetCapabilitiesOnline();
    await this.patchLayerCatalogAddLayerToMap();
    await this.patchLayerCatalogAddLayer();
    await this.patchLayerCatalogGetLayerNodes();
    await this.patchLayerCatalogGetLayerRootNode();
    await this.patchRasterGetPath();
    await this.patchLayerCatalogTemplate();
    await this.patchLayerCatalogCreateSearchAutocomplete();
    await this.patchRasterGetInfo();
    await this.patchLayerCatalogInjectCatalogSwitching();

    // Mark patches as applied
    this.patchesApplied = true;
  }

  /**
   * Build configuration for standard layerCatalog.
   * Generates virtual WMS capabilities for each root tree node.
   */
  buildConfiguration(
    task: AppTasks,
    context: AppCfg
  ): SitnaControlConfig | null {
    // Ensure context is initialized in lookup service
    this.configLookup.initialize(context);

    // Store AppCfg and task for use in patches
    this.currentAppCfg = context;

    // Get all root tree nodes first (for setting up global state)
    const allRootNodeIds = this.getAllRootNodeIds(context);

    // Filter out empty trees before setting up global state
    // This ensures empty trees are not offered in the modal
    const nonEmptyRootNodeIds = this.filterEmptyTrees(allRootNodeIds, context);

    // If all trees are empty, disable the control
    if (nonEmptyRootNodeIds.length === 0) {
      return null;
    }

    // Setup global state for catalog switching BEFORE building configuration
    // Always setup global state, even for single tree (ensures consistent behavior)
    // Use filtered list so empty trees are not shown in modal
    this.catalogSwitching.setupGlobalState(
      nonEmptyRootNodeIds,
      this.configLookup
    );

    // Get root tree nodes from parameters (these are the actual root nodes of trees)
    // This will respect catalog selection if switching is enabled
    const rootNodeIds = this.getRootNodeIds(context);

    if (rootNodeIds.length === 0) {
      return null;
    }

    // Build WMS configuration for each direct child of the root nodes
    // Each child of the root node becomes a separate virtual WMS service
    const wmsLayers: Array<{
      id: string;
      type: string;
      url: string;
      title: string;
      hideTitle: boolean;
      hideTree: boolean;
    }> = [];

    for (const rootNodeId of rootNodeIds) {
      const tree = this.configLookup.findTreeContainingNode(rootNodeId);
      if (!tree) {
        continue;
      }

      const rootNode = this.configLookup.findNode(rootNodeId);
      if (!rootNode) {
        continue;
      }

      // Get direct children of the root node
      if (!rootNode.children || rootNode.children.length === 0) {
        continue;
      }

      // Create a virtual service for each child of the root node
      for (const childId of rootNode.children) {
        const childNode = this.configLookup.findNode(childId);
        if (!childNode) {
          continue;
        }

        // Check if the node can generate valid capabilities before registering it
        if (!this.virtualWmsService.canGenerateCapabilities(childId, context)) {
          continue;
        }

        const virtualUrl = this.virtualWmsService.generateVirtualUrl(childId);

        wmsLayers.push({
          id: `virtual-${childId.replace(/\//g, '-')}`,
          type: 'WMS',
          url: virtualUrl,
          title: childNode.title || `Virtual Service ${childId}`,
          hideTitle: false,
          hideTree: false
        });
      }
    }

    if (wmsLayers.length === 0) {
      return null;
    }

    // Get default configuration using controlIdentifier
    const defaultConfig = this.getDefaultConfig();

    // Build base configuration with default + layers + specific div override
    const baseConfig: SitnaControlConfig = {
      ...defaultConfig,
      div: 'tc-slot-toc', // Override default div with the expected slot
      layers: wmsLayers
    };

    // Merge with task parameters (allows backend to override div or add other options)
    return this.mergeWithParameters(baseConfig, task.parameters);
  }

  /**
   * Filter out empty trees (trees with no valid children for capabilities generation).
   * A tree is considered empty if:
   * - Its root node has no children, OR
   * - None of its children can generate valid capabilities
   *
   * @param rootNodeIds - Array of root node IDs to filter
   * @param context - Application configuration context
   * @returns Array of non-empty tree root node IDs
   */
  private filterEmptyTrees(rootNodeIds: string[], context: AppCfg): string[] {
    const nonEmptyRootNodeIds: string[] = [];

    for (const rootNodeId of rootNodeIds) {
      const rootNode = this.configLookup.findNode(rootNodeId);
      if (!rootNode) {
        continue;
      }

      // Check if root node has children
      if (!rootNode.children || rootNode.children.length === 0) {
        continue;
      }

      // Check if at least one child can generate valid capabilities
      let hasValidChild = false;
      for (const childId of rootNode.children) {
        if (this.virtualWmsService.canGenerateCapabilities(childId, context)) {
          hasValidChild = true;
          break;
        }
      }

      if (!hasValidChild) {
        continue;
      }

      // Tree is not empty, include it
      nonEmptyRootNodeIds.push(rootNodeId);
    }

    return nonEmptyRootNodeIds;
  }

  /**
   * Get all root node IDs (for setting up global state).
   * Returns all top-level tree root nodes.
   */
  private getAllRootNodeIds(context: AppCfg): string[] {
    return context.trees.map((tree: AppTree) => tree.rootNode);
  }

  /**
   * Get root node IDs for the layer catalog.
   * If global catalog state is setup, uses only the selected tree (by tree ID).
   * Otherwise, uses all tree root nodes.
   * Empty trees are always filtered out.
   */
  private getRootNodeIds(context: AppCfg): string[] {
    // Check if catalog global state is setup with a selected tree
    const selectedRootNode =
      this.catalogSwitching.getSelectedTreeRootNode(context);
    if (selectedRootNode) {
      // Verify the selected tree is not empty
      const filtered = this.filterEmptyTrees([selectedRootNode], context);
      if (filtered.length === 0) {
        // Fall through to default behavior
      } else {
        return [selectedRootNode];
      }
    }

    // Default: use the first non-empty tree root node
    const allRootNodeIds = context.trees.map((tree: AppTree) => tree.rootNode);
    const nonEmptyRootNodeIds = this.filterEmptyTrees(allRootNodeIds, context);

    if (nonEmptyRootNodeIds.length > 0) {
      return [nonEmptyRootNodeIds[0]]; // Return only the first non-empty tree
    }

    return []; // No non-empty trees available
  }

  /**
   * Standard control is always ready.
   */
  override isReady(): boolean {
    return true;
  }

  // ============================================================================
  // PATCH METHODS - Ported from sandbox layer-catalog-control.component.ts
  // ============================================================================

  /**
   * Patch Layer.getCapabilitiesOnline to intercept virtual service requests.
   * When a virtual service URL is detected, return generated capabilities instead of fetching from server.
   */
  private async patchLayerGetCapabilitiesOnline(): Promise<void> {
    await this.waitForTCAndApply(async () => {
      const SITNA = await this.sitnaNamespaceService.waitForSITNA();

      // Try to find Layer prototype
      const LayerProto = (SITNA as any)?.layer?.Layer?.prototype;
      if (!LayerProto) {
        return;
      }

      if (typeof LayerProto.getCapabilitiesOnline !== 'function') {
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const handler = this;
      const advice = meld.around(
        LayerProto,
        'getCapabilitiesOnline',
        function (this: any, joinPoint: MeldJoinPoint): any {
          // Get the layer instance
          const layer = this as {
            url?: string;
            getCapabilitiesUrl?: () => string;
            [key: string]: unknown;
          };

          // Try to get the capabilities URL from multiple sources
          // 1. Check if URL is passed as first argument
          // 2. Check layer.getCapabilitiesUrl() method
          // 3. Check layer.url property
          let capabilitiesUrl: string | undefined;
          if (
            joinPoint.args &&
            joinPoint.args.length > 0 &&
            typeof joinPoint.args[0] === 'string'
          ) {
            capabilitiesUrl = joinPoint.args[0];
          } else if (typeof layer.getCapabilitiesUrl === 'function') {
            capabilitiesUrl = layer.getCapabilitiesUrl();
          } else if (layer.url) {
            capabilitiesUrl = layer.url;
          }

          // Check if this is a virtual service
          if (
            capabilitiesUrl &&
            handler.currentAppCfg &&
            handler.virtualWmsService.isVirtualServiceUrl(capabilitiesUrl)
          ) {
            const nodeId =
              handler.virtualWmsService.extractNodeIdFromUrl(capabilitiesUrl);

            if (nodeId) {
              try {
                // Generate virtual capabilities
                const capabilities =
                  handler.virtualWmsService.generateCapabilities(
                    nodeId,
                    handler.currentAppCfg
                  );
                return Promise.resolve(capabilities);
              } catch (error) {
                console.error(
                  '[Virtual WMS] Failed to generate capabilities',
                  error
                );
                // Fall back to normal fetch
              }
            }
          }

          // Not a virtual service, proceed with normal fetch
          const proceedResult = joinPoint.proceed();

          // Handle both Promise and synchronous returns
          if (
            proceedResult &&
            typeof (proceedResult as any).then === 'function'
          ) {
            // It's a Promise
            return (proceedResult as Promise<unknown>).then(
              (result: unknown) => {
                // Process WMTS capabilities if needed and get the processed result
                result = handler.rasterService.processWmtsCapabilitiesResult(
                  layer,
                  capabilitiesUrl,
                  result,
                  handler.currentAppCfg || undefined
                );

                return result;
              }
            );
          } else {
            // Process WMTS capabilities if needed and get the processed result
            return handler.rasterService.processWmtsCapabilitiesResult(
              layer,
              capabilitiesUrl,
              proceedResult,
              handler.currentAppCfg || undefined
            );
          }
        }
      );

      this.patchManager.add(() => meld.remove(advice));
    });
  }

  /**
   * Patch LayerCatalog.addLayerToMap to replace virtual layers with real layer configurations.
   * Completely replaces the method to handle virtual layers natively.
   */
  private async patchLayerCatalogAddLayerToMap(): Promise<void> {
    await this.waitForTCAndApply(async (TC) => {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const handler = this;
      const Util = TC.Util;
      const ctlProto = TC.control.LayerCatalog.prototype;

      if (!ctlProto || typeof ctlProto.addLayerToMap !== 'function') {
        return;
      }

      // Use meld.around to wrap addLayerToMap
      const advice = meld.around(
        ctlProto,
        'addLayerToMap',
        function (this: any, joinPoint: MeldJoinPoint): unknown {
          const layer = joinPoint.args[0] as any;
          const layerName = joinPoint.args[1] as string;
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          const self = this;
          const layerObj = layer;
          // Use layerName as the node ID to find the real layer configuration
          // AppCfg is guaranteed to be non-null (set before patches are applied)
          if (!handler.currentAppCfg) {
            return joinPoint.proceed();
          }
          const realLayerConfig = handler.virtualWmsService.findRealLayerConfig(
            layerName,
            handler.currentAppCfg
          );

          // Create layer options with real configuration
          const layerOptions = Util.extend({}, layerObj.options) as {
            id?: string;
            hideTree?: boolean;
            title?: string;
            url?: string;
            type?: string;
            layerNames?: string | string[];
            nodeId?: string;
            [key: string]: unknown;
          };

          if (realLayerConfig) {
            layerOptions.id = self.getUID();
            layerOptions.hideTree = true;
            layerOptions.title = layerObj.title;
            // realLayerConfig is typed as RealLayerConfig, so url and type are guaranteed to be strings
            layerOptions.url = realLayerConfig.url;
            layerOptions.type = realLayerConfig.type;
            // layerNames should be an array, SITNA will join them internally
            layerOptions.layerNames = Array.isArray(realLayerConfig.layerNames)
              ? realLayerConfig.layerNames
              : [realLayerConfig.layerNames];
            layerOptions.nodeId = layerName;
          } else {
            layerOptions.id = self.getUID();
            layerOptions.hideTree = true;
            layerOptions.title = layerObj.title;
            layerOptions.url = layerObj.url;
            layerOptions.type = layerObj.type;
            layerOptions.layerNames = layerName;
          }

          const effectiveLayerNames: string[] = Array.isArray(
            layerOptions.layerNames
          )
            ? layerOptions.layerNames.filter((name): name is string => true)
            : layerOptions.layerNames != null
            ? [String(layerOptions.layerNames)]
            : [];

          const Raster = TC.layer.Raster;

          const proceedWithLayer = async (): Promise<any> => {
            const newLayer = new Raster(layerOptions);
            await newLayer.getCapabilitiesPromise();

            if (!handler.currentAppCfg) {
              return joinPoint.proceed();
            }
            const nodeTitle = handler.getNodeTitle(
              layerName,
              handler.currentAppCfg
            );

            if (nodeTitle && newLayer.Capability?.Layer) {
              handler.updateLayerTitleInCapabilities(
                newLayer.Capability.Layer,
                effectiveLayerNames,
                nodeTitle
              );
            }

            if (newLayer.isCompatible(self.map.crs)) {
              self.map.addLayer(layerOptions);
              return newLayer;
            } else {
              const showProjectionChangeDialog =
                self.showProjectionChangeDialog;
              if (typeof showProjectionChangeDialog === 'function') {
                showProjectionChangeDialog.call(self, newLayer);
              }
              return newLayer;
            }
          };

          return proceedWithLayer();
        }
      );

      this.patchManager.add(() => meld.remove(advice));
    });
  }

  /**
   * Patch LayerCatalog.addLayer to return a resolved Promise.
   */
  /**
   * Patch LayerCatalog.addLayer to ignore calls for virtual layers (our layers)
   * but allow external WMS layers to be added normally.
   * Uses meld.around to intercept calls and check if layer is virtual.
   */
  private async patchLayerCatalogAddLayer(): Promise<void> {
    await this.waitForTCAndApply(async (TC) => {
      const ctlProto = TC.control.LayerCatalog.prototype;

      if (!ctlProto || typeof ctlProto.addLayer !== 'function') {
        return;
      }

      // Store original addLayer method for restoration
      const originalAddLayer = ctlProto.addLayer;

      // Replace addLayer with a function that always returns a resolved Promise
      ctlProto.addLayer = function (this: any, layer: any): Promise<void> {
        // if layer.id is a string made only of numbers, return resolved promise without proceeding
        if (typeof layer.id === 'string' && /^[0-9]+$/.test(layer.id)) {
          return Promise.resolve();
        }
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this as any;
        return new Promise<void>(function (resolve, reject) {
          let fromLayerCatalog: any[] = [];

          if (self.options?.layers && self.options.layers.length) {
            fromLayerCatalog = self.options.layers.filter(function (l: any) {
              if (Array.isArray(l.url)) {
                return null;
              }
              if (typeof l.url === 'string' && l.url.startsWith('virtual://')) {
                return null;
              }
              const getMap = TC.Util.reqGetMapOnCapabilities(l.url);
              return (
                getMap &&
                getMap.replace(TC.Util.regex.PROTOCOL) ===
                  layer.url.replace(TC.Util.regex.PROTOCOL)
              );
            });
          }

          if (fromLayerCatalog.length === 0) {
            fromLayerCatalog = self.layers.filter(function (l: any) {
              return (
                l.url.replace(TC.Util.regex.PROTOCOL) ===
                layer.url.replace(TC.Util.regex.PROTOCOL)
              );
            });
          }

          if (fromLayerCatalog.length === 0) {
            self.layers.unshift(layer);
            layer
              .getCapabilitiesPromise()
              .then(function () {
                layer.compatibleLayers = layer.wrap.getCompatibleLayers(
                  self.map.crs
                );
                layer.title = layer.title || layer.wrap.getServiceTitle();
                self.renderBranch(layer, function () {
                  resolve();
                });
              })
              .catch(function (error: any) {
                reject(error);
              });
          } else {
            resolve();
          }
        });
      };

      // Mark as patched
      (ctlProto as any).__addLayerPatched = true;

      this.patchManager.add(() => {
        (ctlProto as any).__addLayerPatched = false;
        if (originalAddLayer) {
          ctlProto.addLayer = originalAddLayer;
        } else {
          delete (ctlProto as any).addLayer;
        }
      });
    });
  }

  /**
   * Patch LayerCatalog.getLayerNodes to handle virtual layer nodes.
   */
  private async patchLayerCatalogGetLayerNodes(): Promise<void> {
    await this.waitForTCAndApply(async (TC) => {
      const ctlProto = TC.control.LayerCatalog.prototype;

      const advice = meld.around(
        ctlProto,
        'getLayerNodes',
        function (this: any, joinPoint: MeldJoinPoint): unknown {
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          const self = this;
          const layer = joinPoint.args[0] as any;
          const layerObj = layer || {};
          const result: Element[] = [];
          const selectors = {
            LAYER_ROOT:
              'div.tc-ctl-lcat-tree > ul.tc-ctl-lcat-branch > li.tc-ctl-lcat-node'
          };
          const rootNodes = self.div.querySelectorAll(selectors.LAYER_ROOT);
          if (!rootNodes) {
            return [];
          }

          const selector = layerObj.nodeId
            ? `li[data-layer-name="${layerObj.nodeId}"]`
            : `li[data-layer-name="${layerObj.options.layerNames}"]`;

          for (let i = 0; i < rootNodes.length; i++) {
            const rootNode = rootNodes[i];
            const liLayer = rootNode.querySelector(selector);
            if (liLayer) {
              // This is a workaround to remove the loading class from the node
              liLayer.classList.remove(TC.Consts.classes.LOADING);
              liLayer.querySelectorAll('li').forEach((li: Element) => {
                result.push(li);
              });
            }
            result.push(rootNode);
          }
          return result;
        }
      );

      this.patchManager.add(() => meld.remove(advice));
    });
  }

  /**
   * Patch LayerCatalog.getLayerRootNode to handle virtual layers by nodeId.
   */
  private async patchLayerCatalogGetLayerRootNode(): Promise<void> {
    await this.waitForTCAndApply(async (TC) => {
      const ctlProto = TC.control.LayerCatalog.prototype;

      if (!ctlProto || typeof ctlProto.getLayerRootNode !== 'function') {
        return;
      }

      const advice = meld.around(
        ctlProto,
        'getLayerRootNode',
        function (this: any, joinPoint: MeldJoinPoint): Element | null {
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          const self = this;
          const layer = joinPoint.args[0] as any;
          const layerObj = layer || {};

          // Skip base layers
          if (layerObj.isBase) {
            return joinPoint.proceed() as Element | null;
          }

          // For virtual layers, find by nodeId
          const nodeId = layerObj.options?.nodeId || layerObj.nodeId;
          if (nodeId) {
            const selectors = {
              LAYER_ROOT:
                'div.tc-ctl-lcat-tree > ul.tc-ctl-lcat-branch > li.tc-ctl-lcat-node'
            };
            const rootNodes = self.div.querySelectorAll(selectors.LAYER_ROOT);

            for (let i = 0; i < rootNodes.length; i++) {
              const rootNode = rootNodes[i] as Element;
              const liLayer = rootNode.querySelector(
                `li[data-layer-name="${nodeId}"]`
              );
              if (liLayer) {
                return rootNode;
              }
            }
            return null;
          }

          // For non-virtual layers, use original method
          return joinPoint.proceed() as Element | null;
        }
      );

      this.patchManager.add(() => meld.remove(advice));
    });
  }

  /**
   * Patch Raster.getPath to return parent node titles from SITMUN configuration.
   */
  private async patchRasterGetPath(): Promise<void> {
    await this.waitForTCAndApply(async (TC) => {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const handler = this;
      const RasterProto =
        TC.layer?.Raster?.prototype || TC.wrap?.layer?.Raster?.prototype;

      if (!RasterProto) {
        return;
      }

      if (typeof RasterProto.getPath !== 'function') {
        return;
      }

      const advice = meld.around(
        RasterProto,
        'getPath',
        function (this: any, joinPoint: MeldJoinPoint): unknown {
          const nodeId = this.options?.nodeId;
          // currentAppCfg is guaranteed to be non-null (set before patches are applied)
          if (nodeId && handler.currentAppCfg) {
            const parentTitles = handler.getParentNodeTitles(
              nodeId,
              handler.currentAppCfg
            );
            if (parentTitles.length > 0) {
              return parentTitles;
            }
          }

          return joinPoint.proceed();
        }
      );

      this.patchManager.add(() => meld.remove(advice));
    });
  }

  // ============================================================================
  // HELPER METHODS - Ported from sandbox
  // ============================================================================

  /**
   * Get the title of a node from apiConfig by nodeId.
   */
  private getNodeTitle(nodeId: string, apiConfig: AppCfg): string | null {
    if (!apiConfig?.trees) {
      return null;
    }

    for (const tree of apiConfig.trees) {
      if (!tree.nodes) {
        continue;
      }

      const node = tree.nodes[nodeId];
      if (node?.title) {
        return node.title;
      }
    }

    return null;
  }

  /**
   * Get parent node titles from SITMUN configuration for a given nodeId.
   */
  private getParentNodeTitles(nodeId: string, apiConfig: AppCfg): string[] {
    if (!apiConfig?.trees) {
      return [];
    }

    for (const tree of apiConfig.trees) {
      if (!tree.nodes || !tree.rootNode) {
        continue;
      }

      const node = tree.nodes[nodeId];
      if (!node) {
        continue;
      }

      const rootNode = tree.nodes[tree.rootNode];
      if (!rootNode) {
        continue;
      }

      const parentTitles: string[] = [];
      let currentNodeId: string | null = nodeId;
      const visited = new Set<string>();

      while (currentNodeId) {
        if (visited.has(currentNodeId)) {
          break;
        }
        visited.add(currentNodeId);

        // Stop if current node is a direct child of rootNode
        if (rootNode.children?.includes(currentNodeId)) {
          break;
        }

        // Find parent
        let parentId: string | null = null;
        for (const [parentNodeId, parentNode] of Object.entries(tree.nodes)) {
          const node = parentNode as AppNodeInfo;
          if (node.children?.includes(currentNodeId)) {
            parentId = parentNodeId;
            break;
          }
        }

        if (!parentId || parentId === tree.rootNode) {
          break;
        }

        const parentNode = tree.nodes[parentId] as AppNodeInfo;
        if (parentNode?.title) {
          parentTitles.unshift(parentNode.title);
        }

        currentNodeId = parentId;
      }

      // Add the leaf node's title
      if (node.title) {
        parentTitles.push(node.title);
      }

      return parentTitles;
    }

    return [];
  }

  /**
   * Recursively update layer title in capabilities for layers matching the given layer names.
   */
  private updateLayerTitleInCapabilities(
    layer: any,
    layerNames: string[],
    newTitle: string
  ): void {
    if (Array.isArray(layer)) {
      for (const l of layer) {
        this.updateLayerTitleInCapabilities(l, layerNames, newTitle);
      }
      return;
    }

    if (layer.Name && layerNames.includes(layer.Name)) {
      layer.Title = newTitle;
    }

    if (layer.Layer) {
      this.updateLayerTitleInCapabilities(layer.Layer, layerNames, newTitle);
    }
  }

  /**
   * Patch LayerCatalog to use custom info template.
   * Overrides the template path to use LayerCatalogInfoSitmun.hbs instead of default.
   * Completely replaces loadTemplates method to customize template loading.
   */
  private async patchLayerCatalogTemplate(): Promise<void> {
    await this.waitForTCAndApply(async (TC) => {
      const ctlProto = TC.control.LayerCatalog.prototype;

      if (!ctlProto) {
        return;
      }

      // Store original loadTemplates if it exists
      const originalLoadTemplates = ctlProto.loadTemplates;
      const hasOriginalLoadTemplates =
        typeof originalLoadTemplates === 'function';

      // Completely replace loadTemplates method to customize template loading
      ctlProto.loadTemplates = async function (this: any) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;

        // Call original loadTemplates first if it exists (to load default templates)
        if (hasOriginalLoadTemplates) {
          await originalLoadTemplates.call(self);
        } else {
          // Initialize template object if it doesn't exist
          if (!self.template) {
            self.template = {};
          }
        }

        // Override the info template with custom SITMUN template
        self.template[self.CLASS + '-info'] =
          'assets/js/patch/templates/LayerCatalogInfoSitmun.hbs';

        // Load projects template for catalog switching
        self.template[self.CLASS + '-proj'] =
          'assets/js/patch/templates/LayerCatalogProjSitmun.hbs';
      };

      // Store cleanup function
      this.patchManager.add(() => {
        if (hasOriginalLoadTemplates) {
          ctlProto.loadTemplates = originalLoadTemplates;
        } else {
          delete ctlProto.loadTemplates;
        }
      });
    });
  }

  /**
   * Patch LayerCatalog.createSearchAutocomplete to handle null elements gracefully.
   * Prevents errors when search input element doesn't exist in the DOM.
   */
  private async patchLayerCatalogCreateSearchAutocomplete(): Promise<void> {
    await this.waitForTCAndApply(async (TC) => {
      const ctlProto = TC.control.LayerCatalog.prototype;

      if (!ctlProto) {
        return;
      }

      // Check if createSearchAutocomplete exists
      if (typeof ctlProto.createSearchAutocomplete !== 'function') {
        return;
      }

      // Store original method
      const originalCreateSearchAutocomplete =
        ctlProto.createSearchAutocomplete;

      // Replace with safe version that checks for null elements
      ctlProto.createSearchAutocomplete = function (this: any): void {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;

        // Try to find elements
        self.textInput = self.div?.querySelector('.' + self.CLASS + '-input');
        self.list = self.div?.querySelector('.' + self.CLASS + '-search ul');

        // If elements don't exist, skip initialization (search might be disabled or template not loaded)
        if (!self.textInput || !self.list) {
          return;
        }

        // Call original implementation with null checks
        try {
          originalCreateSearchAutocomplete.call(self);
        } catch (error) {
          console.error(
            '[LayerCatalog] Error initializing search autocomplete:',
            error
          );
        }
      };

      this.patchManager.add(() => {
        // Restore original method
        ctlProto.createSearchAutocomplete = originalCreateSearchAutocomplete;
      });
    });
  }

  /**
   * Patch Raster.getInfo to enrich layer information with app config data.
   * For virtual layers, extracts nodeId from name parameter and merges app config data
   * with WMS capabilities data, with app config taking precedence.
   */
  private async patchRasterGetInfo(): Promise<void> {
    await this.waitForTCAndApply(async (TC) => {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const handler = this;
      const RasterProto =
        TC.layer?.Raster?.prototype || TC.wrap?.layer?.Raster?.prototype;

      // Capture TC in closure for use in the advice function
      const TCLayer = TC.layer;

      if (!RasterProto) {
        return;
      }

      if (typeof RasterProto.getInfo !== 'function') {
        return;
      }

      const advice = meld.around(
        RasterProto,
        'getInfo',
        function (this: any, joinPoint: MeldJoinPoint): any {
          const name = joinPoint.args[0] as string;
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          const layer = this;
          // Check if this is a virtual layer
          // First check by URL (for layers that haven't been added to map yet)
          const layerUrl = layer.url || layer.options?.url;
          const isVirtualByUrl =
            layerUrl && handler.virtualWmsService.isVirtualServiceUrl(layerUrl);

          // Also check by nodeId (for layers already added to map with real URL)
          const nodeIdFromOptions = layer.options?.nodeId;
          const isVirtualByNodeId = !!nodeIdFromOptions;

          if (!isVirtualByUrl && !isVirtualByNodeId) {
            // Not a virtual layer, proceed with original getInfo
            return joinPoint.proceed();
          }

          // For virtual layers, use nodeId from options if available, otherwise use name parameter
          const nodeId = nodeIdFromOptions || name;

          // Ensure we have app config
          if (!handler.currentAppCfg) {
            // Return minimal structure with abstract to ensure info button is shown
            return { name: nodeId, abstract: '' };
          }

          // Find real service/layer configuration for this virtual node
          const realLayerConfig = handler.virtualWmsService.findRealLayerConfig(
            nodeId,
            handler.currentAppCfg
          );
          if (!realLayerConfig) {
            const node = handler.configLookup.findNode(nodeId);
            // Return minimal structure with abstract to ensure info button is shown
            return {
              name: nodeId,
              title: node?.title || nodeId,
              abstract: ''
            };
          }

          // Get original getInfo result first
          const originalInfo = joinPoint.proceed();

          // Get WMS capabilities using service
          const rasterInstancesCache = (handler as any).rasterInstancesCache;
          const wmsCapabilities = handler.rasterService.getRasterCapabilities(
            realLayerConfig,
            rasterInstancesCache,
            TCLayer
          );

          // Enrich layer info using service
          const enrichedInfo = handler.rasterService.enrichRasterLayerInfo(
            nodeId,
            realLayerConfig,
            wmsCapabilities,
            rasterInstancesCache,
            TCLayer
          );

          // Merge original result with enriched data (enriched overrides original)
          // Ensure originalInfo is an object before spreading
          const originalInfoObj =
            originalInfo && typeof originalInfo === 'object'
              ? originalInfo
              : {};
          return { ...originalInfoObj, ...enrichedInfo };
        }
      );

      this.patchManager.add(() => meld.remove(advice));
    });
  }

  /**
   * Patch LayerCatalog to inject catalog switching button and projects panel via DOM manipulation.
   * Injects elements after template renders without modifying the template.
   */
  private async patchLayerCatalogInjectCatalogSwitching(): Promise<void> {
    await this.waitForTCAndApply(async (TC) => {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const handler = this;
      const ctlProto = TC.control.LayerCatalog.prototype;

      if (!ctlProto) {
        return;
      }

      // Patch renderData to inject button and panel after render
      if (typeof ctlProto.renderData !== 'function') {
        return;
      }

      const advice = meld.around(
        ctlProto,
        'renderData',
        function (this: any, joinPoint: MeldJoinPoint): unknown {
          const result = joinPoint.proceed();
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          const self = this;

          // Use retry mechanism to wait for DOM elements to be ready
          // The search button might be rendered asynchronously after renderData completes
          let retryCount = 0;
          const maxRetries = 10;
          const retryDelay = 50; // 50ms between retries

          // Check if injection succeeded, retry if not
          const checkAndRetry = () => {
            // Check if button was already successfully injected
            const buttonExists = self.div?.querySelector(
              '#change-catalog-sitmun'
            );
            if (buttonExists) {
              // Successfully injected, no need to retry
              return;
            }

            // Check if required elements exist
            const h2Element = self.div?.querySelector('h2');

            if (h2Element) {
              // All required elements exist, try injection
              try {
                handler.catalogSwitching.injectCatalogSwitchingButton(
                  self,
                  handler
                );
                // Check again if injection succeeded
                const injected = self.div?.querySelector(
                  '#change-catalog-sitmun'
                );
                if (!injected && retryCount < maxRetries) {
                  // Injection failed (might be due to other conditions), retry
                  retryCount++;
                  setTimeout(checkAndRetry, retryDelay);
                }
              } catch (error) {
                console.error(
                  '[LayerCatalog] Error injecting catalog switching elements:',
                  error
                );
              }
            } else if (retryCount < maxRetries) {
              // Required elements not ready yet, wait and retry
              retryCount++;
              setTimeout(checkAndRetry, retryDelay);
            }
          };

          // Start the retry mechanism
          setTimeout(checkAndRetry, 0);

          return result;
        }
      );

      this.patchManager.add(() => meld.remove(advice));
    });
  }
}
