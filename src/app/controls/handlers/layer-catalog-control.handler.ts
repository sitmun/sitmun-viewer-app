import { Injectable, inject } from '@angular/core';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';
import {
  AppCfg,
  AppTasks,
  AppTree,
  AppNodeInfo,
  AppLayer,
  AppService
} from '@api/model/app-cfg';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import {
  VirtualWmsCapabilitiesService,
  RealLayerConfig
} from '../../services/virtual-wms-capabilities.service';
import { WMSCapabilities } from '../../types/wms-capabilities';
import { ConfigLookupService } from '../../services/config-lookup.service';
import { SitnaNamespaceService } from '../../services/sitna-namespace.service';
import { LanguageService } from '../../services/language.service';
import type { Meld, MeldJoinPoint } from '../../types/meld.types';

// Declare require for CommonJS module import
declare function require(module: string): any;

// meld is a CommonJS module, so we use require with proper typing
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const meld = require('meld') as Meld;

/**
 * Handler for standard SITNA layerCatalog control using virtual WMS capabilities.
 * This is the "new way" - standard SITNA control displaying SITMUN trees.
 *
 * Control Type: sitna.layerCatalog
 * Patches: Applied programmatically (not via JS files)
 * Configuration: Uses VirtualWmsCapabilitiesService to generate capabilities
 *
 * Note: For legacy Silme extension, see LayerCatalogSilmeControlHandler.
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
  private readonly languageService = inject(LanguageService);

  // Store AppCfg for use in patches
  // Set in loadPatches() before patches are applied, so it's guaranteed to be non-null when patches execute
  private currentAppCfg: AppCfg | null = null;

  // Store task from buildConfiguration for use in loadPatches
  private currentTask: AppTasks | null = null;

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
   * Setup global state for catalog switching.
   * Builds catalogs array from trees and sets up window.layerCatalogsForModal.
   * Uses tree ID as the catalog identifier (not index or root node ID).
   *
   * Logic:
   * - If 1 tree: use that tree's ID as currentTreeId
   * - If multiple trees: check global state for existing currentTreeId, validate it exists, fallback to first tree if not
   */
  private setupCatalogGlobalState(
    context: AppCfg,
    rootNodeIds: string[]
  ): void {
    // Get actual trees from rootNodeIds
    const trees = rootNodeIds
      .map((nodeId) => this.configLookup.findTreeContainingNode(nodeId))
      .filter((tree): tree is AppTree => tree !== undefined);

    if (trees.length === 0) {
      console.warn('[LayerCatalog] No trees found for catalog setup');
      return;
    }

    // Build catalogs array from trees - use tree ID as identifier
    const catalogs = trees.map((tree) => ({
      id: tree.id,
      catalog: tree.title
    }));

    // Determine current tree ID based on tree count
    let currentTreeId: string;

    if (trees.length === 1) {
      // Single tree: always use its ID
      currentTreeId = trees[0].id;
    } else {
      // Multiple trees: check for existing selection in global state
      const existingModal = (window as any).layerCatalogsForModal;
      const existingTreeId = existingModal?.currentTreeId;

      // Validate existing tree ID exists in available trees
      if (existingTreeId && trees.some((tree) => tree.id === existingTreeId)) {
        currentTreeId = existingTreeId;
      } else {
        // Fallback to first tree
        currentTreeId = trees[0].id;
      }
    }

    // Set global variable for modal (expected by catalog switching patches)
    (window as any).layerCatalogsForModal = {
      currentTreeId: currentTreeId,
      catalogs: catalogs,
      rootNodeIds: rootNodeIds
    };
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
    this.currentTask = task;

    // Get all root tree nodes first (for setting up global state)
    const allRootNodeIds = this.getAllRootNodeIds(task, context);

    // Filter out empty trees before setting up global state
    // This ensures empty trees are not offered in the modal
    const nonEmptyRootNodeIds = this.filterEmptyTrees(allRootNodeIds, context);

    // If all trees are empty, disable the control
    if (nonEmptyRootNodeIds.length === 0) {
      console.warn('[LayerCatalog] All trees are empty, disabling control');
      return null;
    }

    // Setup global state for catalog switching BEFORE building configuration
    // Always setup global state, even for single tree (ensures consistent behavior)
    // Use filtered list so empty trees are not shown in modal
    this.setupCatalogGlobalState(context, nonEmptyRootNodeIds);

    // Get root tree nodes from parameters (these are the actual root nodes of trees)
    // This will respect catalog selection if switching is enabled
    const rootNodeIds = this.getRootNodeIds(task, context);

    if (rootNodeIds.length === 0) {
      console.warn('[LayerCatalog] No root nodes found, disabling control');
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
      console.warn(
        '[LayerCatalog] No child nodes found for root nodes, disabling control'
      );
      return null;
    }

    // Get default configuration using controlIdentifier
    const defaultConfig = this.getDefaultConfig();

    // Build base configuration with default + layers + specific div override
    const baseConfig: SitnaControlConfig = {
      ...defaultConfig,
      div: 'toc', // Override default div with the expected slot
      layers: wmsLayers
    };

    // Merge with task parameters (allows backend to override div or add other options)
    const config = this.mergeWithParameters(baseConfig, task.parameters);

    return config;
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
    const emptyTrees: Array<{ rootNodeId: string; reason: string }> = [];

    for (const rootNodeId of rootNodeIds) {
      const rootNode = this.configLookup.findNode(rootNodeId);
      if (!rootNode) {
        emptyTrees.push({ rootNodeId, reason: 'Root node not found' });
        continue;
      }

      // Check if root node has children
      if (!rootNode.children || rootNode.children.length === 0) {
        const tree = this.configLookup.findTreeContainingNode(rootNodeId);
        emptyTrees.push({
          rootNodeId,
          reason: `Tree "${tree?.title || rootNodeId}" has no children`
        });
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
        const tree = this.configLookup.findTreeContainingNode(rootNodeId);
        emptyTrees.push({
          rootNodeId,
          reason: `Tree "${
            tree?.title || rootNodeId
          }" has no children with valid capabilities`
        });
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
  private getAllRootNodeIds(task: AppTasks, context: AppCfg): string[] {
    return context.trees.map((tree: AppTree) => tree.rootNode);
  }

  /**
   * Get root node IDs for the layer catalog.
   * If global catalog state is setup, uses only the selected tree (by tree ID).
   * Otherwise, uses all tree root nodes.
   * Empty trees are always filtered out.
   */
  private getRootNodeIds(task: AppTasks, context: AppCfg): string[] {
    // Check if catalog global state is setup with a selected tree
    const layerCatalogsForModal = (window as any).layerCatalogsForModal;
    if (layerCatalogsForModal?.currentTreeId) {
      // Use only the selected tree - find tree by tree ID
      const currentTreeId = layerCatalogsForModal.currentTreeId;

      // Find the tree and return its root node
      const selectedTree = context.trees.find(
        (tree: AppTree) => tree.id === currentTreeId
      );
      if (selectedTree) {
        // Verify the selected tree is not empty
        const filtered = this.filterEmptyTrees(
          [selectedTree.rootNode],
          context
        );
        if (filtered.length === 0) {
          console.warn(
            `[LayerCatalog] Selected tree ${currentTreeId} is empty, falling back to first non-empty tree`
          );
          // Fall through to default behavior
        } else {
          return [selectedTree.rootNode];
        }
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

  /**
   * Identify all unique services used by leaf nodes in the control.
   * Traverses the tree structure starting from root nodes to find all leaf nodes (nodes with resources).
   *
   * @param context - Full application configuration
   * @param task - Task configuration containing root node IDs
   * @returns Map of service keys to service configurations
   */
  private identifyServicesFromControlLeaves(
    context: AppCfg,
    task: AppTasks
  ): Map<string, { url: string; type: string }> {
    const servicesMap = new Map<string, { url: string; type: string }>();

    // Get root node IDs (same method used in buildConfiguration)
    const rootNodeIds = this.getRootNodeIds(task, context);

    // Helper function to recursively traverse nodes
    const traverseNode = (nodeId: string): void => {
      const node = this.configLookup.findNode(nodeId);
      if (!node) {
        return;
      }

      // If node has a resource, it's a leaf node - find its service
      if (node.resource) {
        const layer = this.configLookup.findLayer(node.resource);
        if (layer?.service) {
          const service = this.configLookup.findService(layer.service);
          if (service) {
            // Ensure url and type are strings
            const url = service.url != null ? String(service.url) : '';
            const type = service.type != null ? String(service.type) : '';

            // Create unique key: url|type (or just url if URLs are unique)
            const serviceKey = `${url}|${type}`;

            // Store service if not already stored
            if (!servicesMap.has(serviceKey)) {
              servicesMap.set(serviceKey, { url, type });
            }
          }
        }
      }

      // Recursively traverse children
      if (node.children && node.children.length > 0) {
        for (const childId of node.children) {
          traverseNode(childId);
        }
      }
    };

    // Traverse from each root node
    for (const rootNodeId of rootNodeIds) {
      const rootNode = this.configLookup.findNode(rootNodeId);
      if (rootNode) {
        // Traverse root node's children (root node itself is not a leaf)
        if (rootNode.children && rootNode.children.length > 0) {
          for (const childId of rootNode.children) {
            traverseNode(childId);
          }
        }
      }
    }

    return servicesMap;
  }

  // ============================================================================
  // PATCH METHODS - Ported from sandbox layer-catalog-control.component.ts
  // ============================================================================

  /**
   * Patch Layer.getCapabilitiesOnline to intercept virtual service requests.
   * When a virtual service URL is detected, return generated capabilities instead of fetching from server.
   */
  private async patchLayerGetCapabilitiesOnline(): Promise<void> {
    await this.waitForTCAndApply(async (TC) => {
      const SITNA = await this.sitnaNamespaceService.waitForSITNA();

      // Try to find Layer prototype
      const LayerProto = (SITNA as any)?.layer?.Layer?.prototype;
      if (!LayerProto) {
        console.warn(
          '[LayerCatalog] Layer prototype not found, cannot patch getCapabilitiesOnline'
        );
        return;
      }

      if (typeof LayerProto.getCapabilitiesOnline !== 'function') {
        console.warn(
          '[LayerCatalog] Layer.getCapabilitiesOnline not found, skipping patch'
        );
        return;
      }

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
            handler.virtualWmsService.isVirtualServiceUrl(capabilitiesUrl)
          ) {
            const nodeId =
              handler.virtualWmsService.extractNodeIdFromUrl(capabilitiesUrl);

            if (!nodeId) {
              console.error(
                '[Virtual WMS] Cannot generate capabilities: missing nodeId'
              );
              // Fall back to normal fetch which will likely fail
              return joinPoint.proceed();
            }

            if (!handler.currentAppCfg) {
              console.error(
                '[Virtual WMS] Cannot generate capabilities: currentAppCfg is null'
              );
              return joinPoint.proceed();
            }

            try {
              // Generate virtual capabilities
              const capabilities =
                handler.virtualWmsService.generateCapabilities(
                  nodeId,
                  handler.currentAppCfg
                );
              console.info(
                `[Virtual WMS] ✅ Generated capabilities for node: ${nodeId}`
              );
              return Promise.resolve(capabilities);
            } catch (error) {
              console.error(
                '[Virtual WMS] Failed to generate capabilities',
                error
              );
              // Fall back to normal fetch
              return joinPoint.proceed();
            }
          }

          // Not a virtual service, proceed with normal fetch
          return joinPoint.proceed();
        }
      );

      this.patchManager.add(() => meld.remove(advice));

      // Mark as patched to avoid duplicate patches
      (LayerProto as any).__getCapabilitiesOnlinePatched = true;
    });
  }

  /**
   * Patch LayerCatalog.addLayerToMap to replace virtual layers with real layer configurations.
   * Completely replaces the method to handle virtual layers natively.
   */
  private async patchLayerCatalogAddLayerToMap(): Promise<void> {
    await this.waitForTCAndApply(async (TC) => {
      const handler = this;
      const Util = TC.Util;
      const ctlProto = TC.control.LayerCatalog.prototype;

      if (!ctlProto || typeof ctlProto.addLayerToMap !== 'function') {
        console.warn(
          '[LayerCatalog] LayerCatalog.addLayerToMap not found, cannot patch'
        );
        return;
      }

      // Use meld.around to wrap addLayerToMap
      const advice = meld.around(
        ctlProto,
        'addLayerToMap',
        function (this: any, joinPoint: MeldJoinPoint): unknown {
          const layer = joinPoint.args[0] as any;
          const layerName = joinPoint.args[1] as string;
          const self = this;
          const layerObj = layer;

          // Use layerName as the node ID to find the real layer configuration
          // AppCfg is guaranteed to be non-null (set before patches are applied)
          const realLayerConfig = handler.virtualWmsService.findRealLayerConfig(
            layerName,
            handler.currentAppCfg!
          );

          if (!realLayerConfig) {
            console.warn(
              '[LayerCatalog addLayerToMap] No real config found for node: ' +
                layerName +
                ', cannot add layer'
            );
            return joinPoint.proceed();
          }

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
          layerOptions.id = self.getUID();
          layerOptions.hideTree = true;
          layerOptions.title = layerObj.title;
          // realLayerConfig is typed as RealLayerConfig, so url and type are guaranteed to be strings
          layerOptions.url = realLayerConfig.url;
          layerOptions.type = realLayerConfig.type;
          // layerNames should be an array, SITNA will join them internally
          layerOptions.layerNames = realLayerConfig.layerNames;
          layerOptions.nodeId = layerName;

          const Raster = TC.layer.Raster;

          // Get capabilities from existing layer if available
          let serviceCapabilities: WMSCapabilities | null = null;
          for (let i = 0; i < self.layers.length; i++) {
            const existingLayer = self.layers[i];
            // realLayerConfig is typed as RealLayerConfig, so url and type are guaranteed to be strings
            // existingLayer comes from SITNA, so we need to ensure its url and type are strings for comparison
            const existingUrl =
              existingLayer.url != null ? String(existingLayer.url) : '';
            const existingType =
              existingLayer.type != null ? String(existingLayer.type) : '';
            if (
              existingUrl === realLayerConfig.url &&
              existingType === realLayerConfig.type &&
              existingLayer.capabilities
            ) {
              serviceCapabilities = existingLayer.capabilities;
              break;
            }
          }

          // Update layer title in capabilities to match node title
          // currentAppCfg is guaranteed to be non-null (set before patches are applied)
          if (serviceCapabilities) {
            const nodeTitle = handler.getNodeTitle(
              layerName,
              handler.currentAppCfg!
            );
            if (nodeTitle && serviceCapabilities.Capability?.Layer) {
              handler.updateLayerTitleInCapabilities(
                serviceCapabilities.Capability.Layer,
                realLayerConfig.layerNames,
                nodeTitle
              );
            }
          }

          // Function to proceed with adding the layer once capabilities are available
          const proceedWithLayer = (capabilities: WMSCapabilities | any) => {
            // Set capabilities in layerOptions before creating the layer
            // This ensures capabilities are available when isCompatible is called
            if (capabilities) {
              layerOptions['capabilities'] = capabilities;
            } else {
              console.warn(
                '[LayerCatalog addLayerToMap] No capabilities available for service: ' +
                  realLayerConfig.url
              );
            }

            const newLayer = new Raster(layerOptions);

            // Also set capabilities directly on the layer instance (in case layerOptions.capabilities isn't used)
            if (capabilities) {
              newLayer.capabilities = capabilities;
            }

            if (newLayer.isCompatible(self.map.crs)) {
              self.map.addLayer(layerOptions);
            } else {
              const showProjectionChangeDialog =
                self.showProjectionChangeDialog;
              if (typeof showProjectionChangeDialog === 'function') {
                showProjectionChangeDialog.call(self, newLayer);
              } else {
                console.warn(
                  '[LayerCatalog] Layer ' +
                    layerName +
                    ' is not compatible with map CRS'
                );
              }
            }
          };

          // If we have existing capabilities, use them immediately
          if (serviceCapabilities) {
            proceedWithLayer(serviceCapabilities);
            // Return undefined to prevent original method from executing
            return undefined;
          } else {
            // Load capabilities from the service
            const tempLayer = new Raster({
              url: realLayerConfig.url,
              type: realLayerConfig.type
            });

            // Return a promise that resolves to undefined after layer is added
            return tempLayer
              .getCapabilitiesPromise()
              .then(() => {
                const loadedCapabilities =
                  (tempLayer.capabilities as WMSCapabilities | undefined) ||
                  null;

                // Update layer title in capabilities
                // currentAppCfg is guaranteed to be non-null (set before patches are applied)
                if (loadedCapabilities) {
                  const nodeTitle = handler.getNodeTitle(
                    layerName,
                    handler.currentAppCfg!
                  );
                  if (nodeTitle && loadedCapabilities.Capability?.Layer) {
                    handler.updateLayerTitleInCapabilities(
                      loadedCapabilities.Capability.Layer,
                      realLayerConfig.layerNames,
                      nodeTitle
                    );
                  }
                }

                proceedWithLayer(loadedCapabilities);
                // Return undefined to prevent original method from executing
                return undefined;
              })
              .catch((error: any) => {
                console.error(
                  '[LayerCatalog addLayerToMap] Failed to load capabilities:',
                  error
                );
                proceedWithLayer(null);
                // Return undefined to prevent original method from executing
                return undefined;
              });
          }
        }
      );

      this.patchManager.add(() => meld.remove(advice));
    });
  }

  /**
   * Patch LayerCatalog.addLayer to return a resolved Promise.
   */
  /**
   * Patch LayerCatalog.addLayer to replace it with a resolved Promise.
   * Replaces the original method entirely with a function that returns a resolved Promise.
   * This matches the sandbox implementation.
   */
  private async patchLayerCatalogAddLayer(): Promise<void> {
    await this.waitForTCAndApply(async (TC) => {
      const ctlProto = TC.control.LayerCatalog.prototype;

      if (!ctlProto || typeof ctlProto.addLayer !== 'function') {
        console.warn(
          '[LayerCatalog] LayerCatalog.addLayer not found, cannot patch'
        );
        return;
      }

      // Store original addLayer method for restoration
      const originalAddLayer = ctlProto.addLayer;

      // Replace addLayer with a function that always returns a resolved Promise
      ctlProto.addLayer = function (
        this: unknown,
        layer: unknown
      ): Promise<unknown> {
        return Promise.resolve(null);
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
          const self = this;
          const layer = joinPoint.args[0] as any;
          const layerObj = layer || {};
          const result: Element[] = [];
          const rootNodes = self._roots;

          if (rootNodes && layerObj.nodeId) {
            for (let i = 0; i < rootNodes.length; i++) {
              const rootNode = rootNodes[i];
              const liLayer = rootNode.querySelector(
                `li[data-layer-name="${layerObj.nodeId}"]`
              );
              if (liLayer) {
                result.push(liLayer);
                liLayer.querySelectorAll('li').forEach((li: Element) => {
                  result.push(li);
                });
              }
            }
          }
          return result;
        }
      );

      this.patchManager.add(() => meld.remove(advice));
    });
  }

  /**
   * Patch LayerCatalog.getLayerRootNode to return the correct root node for virtual layers.
   */
  private async patchLayerCatalogGetLayerRootNode(): Promise<void> {
    await this.waitForTCAndApply(async (TC) => {
      const handler = this;
      const ctlProto = TC.control.LayerCatalog.prototype;

      const advice = meld.around(
        ctlProto,
        'getLayerRootNode',
        function (this: any, joinPoint: MeldJoinPoint): unknown {
          const self = this;
          const layer = joinPoint.args[0] as any;
          const layerObj = layer || {};

          console.info(
            '[LayerCatalog getLayerRootNode] Patch called for layer:',
            layerObj
          );

          let nodeId: string | null = null;

          // PRIMARY METHOD: Try reverse lookup from layer properties
          if (layerObj.url && layerObj.type && layerObj.layerNames) {
            nodeId = handler.virtualWmsService.findNodeIdFromLayerProperties(
              layerObj.url,
              layerObj.type,
              layerObj.layerNames,
              handler.currentAppCfg!
            );
          }

          // FALLBACK: Try direct nodeId from layer or layer.options
          if (!nodeId) {
            nodeId = layerObj.nodeId || layerObj.options?.nodeId || null;
          }

          if (!nodeId) {
            return null;
          }

          // Find the root service nodeId that contains this nodeId
          // currentAppCfg is guaranteed to be non-null (set before patches are applied)
          const rootServiceNodeId = handler.findRootServiceNodeId(
            nodeId,
            handler.currentAppCfg!
          );
          if (!rootServiceNodeId) {
            return null;
          }

          // Get root nodes from _roots
          const rootNodes = self._roots as NodeListOf<Element> | undefined;
          if (!rootNodes) {
            return null;
          }

          // Convert root service nodeId to virtual format (e.g., "node/tree/37" -> "virtual-node-tree-37")
          const virtualNodeId = `virtual-${rootServiceNodeId.replace(
            /\//g,
            '-'
          )}`;

          // Find the root node that matches the root service nodeId
          for (let i = 0; i < rootNodes.length; i++) {
            const rootNode = rootNodes[i];
            const htmlElement = rootNode as HTMLElement;

            // Log root node attributes for debugging
            const rootNodeId = rootNode.id;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dataLayerId = (htmlElement.dataset as any)?.['layerId'];

            // Check if root node's id matches the virtual format (primary check)
            // Root nodes have id="virtual-node-tree-37" format
            if (rootNodeId === virtualNodeId) {
              return rootNode;
            }

            // Check if root node's data-layer-id matches the virtual format (fallback)
            if (dataLayerId === virtualNodeId) {
              return rootNode;
            }

            // Check if root node has data-layer-name matching the root service nodeId
            const matchingDescendant = rootNode.querySelector(
              `li[data-layer-name="${rootServiceNodeId}"]`
            );
            if (matchingDescendant) {
              // Return the root node, not the descendant
              return rootNode;
            }
          }

          return null;
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
          const layerName = joinPoint.args[0] as string;
          const ignorePrefix = joinPoint.args[1] as boolean | undefined;

          const nodeId = this.options?.nodeId;
          // currentAppCfg is guaranteed to be non-null (set before patches are applied)
          if (nodeId) {
            const parentTitles = handler.getParentNodeTitles(
              nodeId,
              handler.currentAppCfg!
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
   * Find the root service nodeId that contains the given nodeId.
   */
  private findRootServiceNodeId(
    nodeId: string,
    apiConfig: AppCfg
  ): string | null {
    if (!apiConfig?.trees) {
      return null;
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
      if (rootNode?.children?.includes(nodeId)) {
        return nodeId;
      }

      // Traverse up the tree
      let currentNodeId: string | null = nodeId;
      const visited = new Set<string>();

      while (currentNodeId) {
        if (visited.has(currentNodeId)) {
          break;
        }
        visited.add(currentNodeId);

        if (rootNode?.children?.includes(currentNodeId)) {
          return currentNodeId;
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

        currentNodeId = parentId;
      }
    }

    return null;
  }

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
   * Similar to SILME approach - completely replaces loadTemplates method.
   */
  private async patchLayerCatalogTemplate(): Promise<void> {
    await this.waitForTCAndApply(async (TC) => {
      const ctlProto = TC.control.LayerCatalog.prototype;

      if (!ctlProto) {
        console.warn(
          '[LayerCatalog] LayerCatalog prototype not found, cannot patch template'
        );
        return;
      }

      // Store original loadTemplates if it exists
      const originalLoadTemplates = ctlProto.loadTemplates;
      const hasOriginalLoadTemplates =
        typeof originalLoadTemplates === 'function';

      // Completely replace loadTemplates method (like SILME does)
      ctlProto.loadTemplates = async function (this: any) {
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
        console.warn(
          '[LayerCatalog] LayerCatalog prototype not found, cannot patch createSearchAutocomplete'
        );
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
          console.warn(
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
   * Extract language-aware text from WMS Title/Abstract fields that may have xml:lang annotations.
   * Prefers the user's current language, falls back to default or any available language.
   *
   * @param textField - The Title or Abstract field (can be string, object with lang keys, or array)
   * @param preferredLang - Preferred language code (e.g., 'es', 'en', 'ca')
   * @returns The best matching text or null if no text available
   */
  private extractLanguageAwareText(
    textField: any,
    preferredLang: string
  ): string | null {
    if (!textField) {
      return null;
    }

    // If it's a simple string, return it
    if (typeof textField === 'string') {
      return textField;
    }

    // If it's an object with language keys (e.g., { "en": "English", "es": "Spanish" })
    // Or object where keys might be language codes
    if (typeof textField === 'object' && !Array.isArray(textField)) {
      // Try preferred language first (exact match)
      if (textField[preferredLang]) {
        return textField[preferredLang];
      }

      // Try language without region (e.g., 'es-ES' -> 'es')
      const langBase = preferredLang.split('-')[0];
      if (langBase !== preferredLang && textField[langBase]) {
        return textField[langBase];
      }

      // Try matching any key that starts with the language base
      const matchingKey = Object.keys(textField).find(
        (key) =>
          key === preferredLang ||
          key === langBase ||
          key.startsWith(langBase + '-')
      );
      if (matchingKey) {
        return textField[matchingKey];
      }

      // Try common fallbacks in priority order
      const fallbacks = ['es', 'en', 'ca', 'fr', 'de'];
      for (const fallback of fallbacks) {
        const fallbackKey = Object.keys(textField).find(
          (key) => key === fallback || key.startsWith(fallback + '-')
        );
        if (fallbackKey) {
          return textField[fallbackKey];
        }
      }

      // Return first available value as last resort
      const keys = Object.keys(textField);
      if (keys.length > 0) {
        return textField[keys[0]];
      }
    }

    // If it's an array (e.g., [{ xml:lang: "en", _: "English" }, { xml:lang: "es", _: "Spanish" }])
    // Or array of objects where each object represents a language variant
    // Or array of strings (when XML parser doesn't preserve language attributes)
    if (Array.isArray(textField)) {
      // First, try to find items with language attributes (objects) matching preferred language
      for (const item of textField) {
        if (item && typeof item === 'object') {
          // Check xml:lang attribute - try multiple possible property names
          const lang =
            item['xml:lang'] ||
            item['xmlLang'] ||
            item.xmlLang ||
            item.lang ||
            item['@xml:lang'] ||
            item['@xmlLang'] ||
            item['$']?.lang;

          // Get text content - try multiple possible property names
          const text =
            item._ ||
            item.value ||
            item.text ||
            item['#text'] ||
            item['$']?._ ||
            (typeof item === 'string' ? item : null);

          // Exact match
          if (lang === preferredLang && text) {
            return text;
          }
        }
      }

      // Try language base match (e.g., 'es' if preferred is 'es-ES')
      const langBase = preferredLang.split('-')[0];
      if (langBase !== preferredLang) {
        for (const item of textField) {
          if (item && typeof item === 'object') {
            const lang =
              item['xml:lang'] ||
              item['xmlLang'] ||
              item.xmlLang ||
              item.lang ||
              item['@xml:lang'] ||
              item['@xmlLang'] ||
              item['$']?.lang;
            // Match if lang starts with langBase (e.g., 'es-ES', 'es-MX' for 'es')
            if (
              lang &&
              (lang === langBase || lang.startsWith(langBase + '-'))
            ) {
              const text =
                item._ ||
                item.value ||
                item.text ||
                item['#text'] ||
                item['$']?._ ||
                (typeof item === 'string' ? item : null);
              if (text) {
                return text;
              }
            }
          }
        }
      }

      // Try common fallback languages in order
      const fallbacks = ['es', 'en', 'ca', 'fr', 'de'];
      for (const fallback of fallbacks) {
        for (const item of textField) {
          if (item && typeof item === 'object') {
            const lang =
              item['xml:lang'] ||
              item['xmlLang'] ||
              item.xmlLang ||
              item.lang ||
              item['@xml:lang'] ||
              item['@xmlLang'];
            if (
              lang &&
              (lang === fallback || lang.startsWith(fallback + '-'))
            ) {
              const text =
                item._ ||
                item.value ||
                item.text ||
                item['#text'] ||
                (typeof item === 'string' ? item : null);
              if (text) {
                return text;
              }
            }
          }
        }
      }

      // For arrays of strings (when XML parser doesn't preserve language attributes)
      // Just use the first item if multiple are available
      if (textField.length > 0) {
        const first = textField[0];
        if (typeof first === 'string') {
          return first;
        }
        if (first && typeof first === 'object') {
          return (
            first._ || first.value || first.text || first['#text'] || first
          );
        }
      }
    }

    return null;
  }

  /**
   * Patch Raster.getInfo to enrich layer information with app config data.
   * For virtual layers, extracts nodeId from name parameter and merges app config data
   * with WMS capabilities data, with app config taking precedence.
   */
  private async patchRasterGetInfo(): Promise<void> {
    await this.waitForTCAndApply(async (TC) => {
      const handler = this;
      const RasterProto =
        TC.layer?.Raster?.prototype || TC.wrap?.layer?.Raster?.prototype;

      // Capture TC in closure for use in the advice function
      const TCLayer = TC.layer;

      if (!RasterProto) {
        console.warn(
          '[LayerCatalog] Raster prototype not found, cannot patch getInfo'
        );
        return;
      }

      if (typeof RasterProto.getInfo !== 'function') {
        console.warn('[LayerCatalog] Raster.getInfo not found, skipping patch');
        return;
      }

      const advice = meld.around(
        RasterProto,
        'getInfo',
        function (this: any, joinPoint: MeldJoinPoint): any {
          const name = joinPoint.args[0] as string;
          const layer = this;

          // Check if this is a virtual layer
          const layerUrl = layer.url || layer.options?.url;
          if (
            !layerUrl ||
            !handler.virtualWmsService.isVirtualServiceUrl(layerUrl)
          ) {
            // Not a virtual layer, proceed with original getInfo
            return joinPoint.proceed();
          }

          // For virtual layers, name is the nodeId
          const nodeId = name;

          // Ensure we have app config
          if (!handler.currentAppCfg) {
            console.warn(
              '[LayerCatalog getInfo] No app config available, cannot process virtual layer'
            );
            // Return minimal structure with abstract to ensure info button is shown
            return { name: nodeId, abstract: '' };
          }

          // Find real service/layer configuration for this virtual node
          const realLayerConfig = handler.virtualWmsService.findRealLayerConfig(
            nodeId,
            handler.currentAppCfg
          );
          if (!realLayerConfig) {
            console.warn(
              `[LayerCatalog getInfo] Cannot find real layer config for nodeId: ${nodeId}`
            );
            const node = handler.configLookup.findNode(nodeId);
            // Return minimal structure with abstract to ensure info button is shown
            return {
              name: nodeId,
              title: node?.title || nodeId,
              abstract: ''
            };
          }

          // Look up node, layer, and service from app config
          const node = handler.configLookup.findNode(nodeId);
          if (!node) {
            console.warn(
              `[LayerCatalog getInfo] Node ${nodeId} not found in app config`
            );
            // Return minimal structure with abstract to ensure info button is shown
            return {
              name: nodeId,
              title: nodeId,
              abstract: ''
            };
          }

          let layerConfig: AppLayer | undefined;
          let serviceConfig: AppService | undefined;

          if (node.resource) {
            layerConfig = handler.configLookup.findLayer(node.resource);
            if (layerConfig?.service) {
              serviceConfig = handler.configLookup.findService(
                layerConfig.service
              );
            }
          }

          // Initialize enrichedInfo object with app config data first (available synchronously)
          const enrichedInfo: any = {};

          // Set name from real layer config
          if (
            realLayerConfig.layerNames &&
            realLayerConfig.layerNames.length > 0
          ) {
            const realLayerName = realLayerConfig.layerNames[0];
            const cleanLayerName = realLayerName.includes(':')
              ? realLayerName.substring(realLayerName.indexOf(':') + 1)
              : realLayerName;
            enrichedInfo.name = cleanLayerName;
          } else {
            enrichedInfo.name = nodeId;
          }

          // Override with app config data where available (app config takes precedence)
          // Title: node.title
          if (node.title) {
            enrichedInfo.title = node.title;
          }

          // isGroup: check if node has children
          if (node.children && node.children.length > 0) {
            enrichedInfo.isGroup = true;
          } else {
            enrichedInfo.isGroup = false;
          }

          // URL: service.url from app config
          if (serviceConfig?.url) {
            enrichedInfo.url = serviceConfig.url;
          } else {
            enrichedInfo.url = realLayerConfig.url;
          }

          // Metadata: from layer.metadataUrl (if available in app config)
          if (layerConfig && (layerConfig as any).metadataUrl) {
            const metadataUrls = Array.isArray((layerConfig as any).metadataUrl)
              ? (layerConfig as any).metadataUrl
              : [(layerConfig as any).metadataUrl];

            enrichedInfo.metadata = metadataUrls.map((md: any) => ({
              format: md.format || 'text/html',
              type: md.type || 'simple',
              url: typeof md === 'string' ? md : md.url,
              formatDescription: md.formatDescription || 'Metadata'
            }));
          }

          // DataUrl: from layer.datasetURL (if available in app config)
          if (layerConfig && (layerConfig as any).datasetURL) {
            const dataUrls = Array.isArray((layerConfig as any).datasetURL)
              ? (layerConfig as any).datasetURL
              : [(layerConfig as any).datasetURL];

            enrichedInfo.dataUrl = dataUrls.map((du: any) => ({
              format: du.format || 'application/zip',
              type: du.type || 'simple',
              url: typeof du === 'string' ? du : du.url,
              formatDescription: du.formatDescription || 'Download'
            }));
          }

          // Contact information: from app config
          if (serviceConfig) {
            if ((serviceConfig as any).contactPerson) {
              enrichedInfo.contactPerson = (serviceConfig as any).contactPerson;
            }
            if ((serviceConfig as any).contactOrganization) {
              enrichedInfo.contactOrganization = (
                serviceConfig as any
              ).contactOrganization;
            }
            if ((serviceConfig as any).contactMail) {
              enrichedInfo.contactMail = (serviceConfig as any).contactMail;
            }
            if ((serviceConfig as any).contactTelephone) {
              enrichedInfo.contactTelephone = (
                serviceConfig as any
              ).contactTelephone;
            }
            if ((serviceConfig as any).fees) {
              enrichedInfo.fees = (serviceConfig as any).fees;
            }
            if ((serviceConfig as any).accessConstraints) {
              enrichedInfo.accessConstraints = (
                serviceConfig as any
              ).accessConstraints;
            }
          }

          // ParentAbstract: from app config
          const tree = handler.configLookup.findTreeContainingNode(nodeId);
          if (tree && (tree as any).abstract) {
            enrichedInfo.parentAbstract = (tree as any).abstract;
          } else if (serviceConfig && (serviceConfig as any).abstract) {
            enrichedInfo.parentAbstract = (serviceConfig as any).abstract;
          }

          // Try to get WMS capabilities data to enrich Abstract and other fields
          // NOTE: For virtual layers, we cannot use layer.capabilities (they are virtual capabilities)
          // We must always fetch from the real WMS service
          let wmsCapabilities: WMSCapabilities | null = null;

          // Skip virtual layer capabilities - always get from real service
          try {
            const serviceKey = `${realLayerConfig.url}|${realLayerConfig.type}`;
            // Check if we have a cached Raster instance with capabilities
            const cachedRaster = (handler as any).rasterInstancesCache?.get?.(
              serviceKey
            );
            if (cachedRaster?.capabilities) {
              wmsCapabilities = cachedRaster.capabilities;
            } else {
              // Try to get capabilities from the real service (only if already loaded)
              try {
                const tempRaster = new TCLayer.Raster({
                  url: realLayerConfig.url,
                  type: realLayerConfig.type
                });
                if (tempRaster.capabilities) {
                  wmsCapabilities = tempRaster.capabilities;
                }
                // If capabilities are not already loaded, we skip them (they would require async loading)
              } catch (rasterError) {
                console.error(
                  '[LayerCatalog getInfo] Error creating temporary Raster:',
                  rasterError
                );
              }
            }
          } catch (error) {
            console.warn(
              '[LayerCatalog getInfo] Could not load WMS capabilities:',
              error
            );
          }

          // Merge WMS capabilities data (as fallback, app config takes precedence)
          if (wmsCapabilities && wmsCapabilities.Capability?.Layer) {
            const findLayerInCapabilities = (
              capLayer: any,
              layerName: string
            ): any => {
              if (capLayer.Name === layerName) {
                return capLayer;
              }
              if (capLayer.Layer) {
                for (const subLayer of capLayer.Layer) {
                  const found = findLayerInCapabilities(subLayer, layerName);
                  if (found) return found;
                }
              }
              return null;
            };

            const realLayerName =
              realLayerConfig.layerNames &&
              realLayerConfig.layerNames.length > 0
                ? realLayerConfig.layerNames[0]
                : null;

            // Get current user language preference
            const currentLang = handler.languageService.getCurrentLanguage();

            if (realLayerName) {
              const wmsLayer = findLayerInCapabilities(
                wmsCapabilities.Capability.Layer,
                realLayerName
              );
              if (wmsLayer) {
                // Preserve full language structure and resolve preferred language for display
                if (!enrichedInfo.abstract && wmsLayer.Abstract) {
                  // Store full language structure (preserve all variants)
                  enrichedInfo.abstractAll = wmsLayer.Abstract;

                  // Extract preferred language for display
                  const abstractText = handler.extractLanguageAwareText(
                    wmsLayer.Abstract,
                    currentLang
                  );
                  if (abstractText) {
                    enrichedInfo.abstract = abstractText;
                  }
                }
              }
            }

            // Get service-level information from capabilities
            if (wmsCapabilities.Service) {
              // Preserve full language structure and resolve preferred language for display
              if (
                !enrichedInfo.parentAbstract &&
                wmsCapabilities.Service.Abstract
              ) {
                // Store full language structure (preserve all variants)
                enrichedInfo.parentAbstractAll =
                  wmsCapabilities.Service.Abstract;

                // Extract preferred language for display
                const serviceAbstractText = handler.extractLanguageAwareText(
                  wmsCapabilities.Service.Abstract,
                  currentLang
                );
                if (serviceAbstractText) {
                  enrichedInfo.parentAbstract = serviceAbstractText;
                }
              }

              // Use service Title if available, with language preference
              if (wmsCapabilities.Service.Title) {
                const serviceTitleText = handler.extractLanguageAwareText(
                  wmsCapabilities.Service.Title,
                  currentLang
                );
                // Service title can be used as additional context if needed
              }

              // Get contact information from capabilities if not in app config
              if (wmsCapabilities.Service.ContactInformation) {
                const contact = wmsCapabilities.Service.ContactInformation;
                if (
                  !enrichedInfo.contactPerson &&
                  contact.ContactPersonPrimary?.ContactPerson
                ) {
                  enrichedInfo.contactPerson =
                    contact.ContactPersonPrimary.ContactPerson;
                }
                if (
                  !enrichedInfo.contactOrganization &&
                  contact.ContactPersonPrimary?.ContactOrganization
                ) {
                  enrichedInfo.contactOrganization =
                    contact.ContactPersonPrimary.ContactOrganization;
                }
                if (
                  !enrichedInfo.contactMail &&
                  contact.ContactElectronicMailAddress
                ) {
                  enrichedInfo.contactMail =
                    contact.ContactElectronicMailAddress;
                }
                if (
                  !enrichedInfo.contactTelephone &&
                  contact.ContactVoiceTelephone
                ) {
                  enrichedInfo.contactTelephone = contact.ContactVoiceTelephone;
                }
              }

              // Get fees and access constraints from capabilities if not in app config
              if (!enrichedInfo.fees && wmsCapabilities.Service.Fees) {
                enrichedInfo.fees = wmsCapabilities.Service.Fees;
              }
              if (
                !enrichedInfo.accessConstraints &&
                wmsCapabilities.Service.AccessConstraints
              ) {
                enrichedInfo.accessConstraints =
                  wmsCapabilities.Service.AccessConstraints;
              }
            }
          }

          // Ensure abstract is always present (even if empty) so info button shows
          if (!enrichedInfo.abstract) {
            enrichedInfo.abstract = '';
          }

          return enrichedInfo;
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
      const handler = this;
      const ctlProto = TC.control.LayerCatalog.prototype;

      if (!ctlProto) {
        console.warn(
          '[LayerCatalog] LayerCatalog prototype not found, cannot patch catalog switching injection'
        );
        return;
      }

      // Patch renderData to inject button and panel after render
      if (typeof ctlProto.renderData !== 'function') {
        console.warn(
          '[LayerCatalog] LayerCatalog.renderData not found, cannot patch catalog switching injection'
        );
        return;
      }

      const advice = meld.around(
        ctlProto,
        'renderData',
        function (this: any, joinPoint: MeldJoinPoint): unknown {
          const result = joinPoint.proceed();
          const self = this;

          // Use setTimeout to ensure DOM is ready after render
          setTimeout(() => {
            try {
              const layerCatalogsForModal = (window as any)
                .layerCatalogsForModal;

              // Only inject if multiple catalogs exist
              if (
                !layerCatalogsForModal ||
                !layerCatalogsForModal.catalogs ||
                layerCatalogsForModal.catalogs.length <= 1
              ) {
                return;
              }

              if (!self.div) {
                return;
              }

              // Find h2 element
              const h2Element = self.div.querySelector('h2');
              if (!h2Element) {
                return;
              }

              // Check if search button exists (indicates search is enabled)
              const searchButton = h2Element.querySelector(
                'button.tc-ctl-lcat-btn-search'
              );
              if (!searchButton) {
                return;
              }

              // Check if button already exists (avoid duplicates)
              if (self.div.querySelector('#change-catalog-sitmun')) {
                return;
              }

              // Create catalog switching button
              const changeCatalogButton = document.createElement('label');
              changeCatalogButton.id = 'change-catalog-sitmun';
              changeCatalogButton.className = 'tc-ctl-lcat-btn-change-topic';

              // Set tooltip with current topic name
              const currentTopicTooltip = handler.getCurrentTopicTooltip();
              changeCatalogButton.setAttribute('title', currentTopicTooltip);
              changeCatalogButton.textContent =
                self.getLocaleString('changeTopic') || 'Change topic';
              changeCatalogButton.style.cursor = 'pointer';

              // Insert after search button
              if (searchButton.nextSibling) {
                h2Element.insertBefore(
                  changeCatalogButton,
                  searchButton.nextSibling
                );
              } else {
                h2Element.appendChild(changeCatalogButton);
              }

              // Create projects panel if it doesn't exist
              let projectsPanel = document.querySelector(
                '#catalog-projects'
              ) as HTMLElement;
              if (!projectsPanel) {
                projectsPanel = document.createElement('div');
                projectsPanel.id = 'catalog-projects';
                projectsPanel.className = 'tc-ctl-lcat-proj tc-hidden';

                // Append to body for proper fixed positioning (modal overlay)
                // Fixed positioning works better when element is direct child of body
                document.body.appendChild(projectsPanel);
              }

              // Attach event handlers immediately after injecting button
              // Check if handlers already added (avoid duplicates)
              if (
                !(changeCatalogButton as any).__catalogSwitchingHandlersAdded
              ) {
                handler.attachCatalogSwitchingHandlers(
                  self,
                  changeCatalogButton,
                  projectsPanel
                );
                (changeCatalogButton as any).__catalogSwitchingHandlersAdded =
                  true;
              }

              // Update tooltip after button is created (in case catalog was already selected)
              handler.updateChangeTopicButtonTooltip();
            } catch (error) {
              console.error(
                '[LayerCatalog] Error injecting catalog switching elements:',
                error
              );
            }
          }, 0);

          return result;
        }
      );

      this.patchManager.add(() => meld.remove(advice));
    });
  }

  /**
   * Attach event handlers for catalog switching.
   * This is called after the button is injected to ensure handlers are attached to existing elements.
   */
  private attachCatalogSwitchingHandlers(
    control: any,
    changeCatalogButton: HTMLElement,
    projectsPanel: HTMLElement
  ): void {
    const handler = this;
    const TC = this.tcNamespaceService.getTC();
    const layerCatalogsForModal = (window as any).layerCatalogsForModal;

    if (
      !layerCatalogsForModal ||
      !layerCatalogsForModal.catalogs ||
      layerCatalogsForModal.catalogs.length <= 1
    ) {
      return;
    }

    // Click handler for catalog switching button
    changeCatalogButton.addEventListener('click', function (e: Event) {
      e.preventDefault();
      e.stopPropagation();

      // Toggle projects panel
      projectsPanel.classList.toggle(TC.Consts.classes.HIDDEN);

      // Handle responsive behavior (mobile panel management)
      if (window.innerWidth < 760) {
        const toolsPanel = document.querySelector('#tools-panel');
        const silmePanel = document.querySelector('#silme-panel');
        const navHome = document.querySelector('.tc-ctl-nav-home');
        const svBtn = document.querySelector('.tc-ctl-sv-btn');
        const sb = document.querySelector('.tc-ctl-sb');
        const scl = document.querySelector('.tc-ctl-scl');

        if (toolsPanel) {
          toolsPanel.classList.toggle('right-collapsed');
        }
        if (silmePanel) {
          silmePanel.classList.remove('left-opacity');
        }
        if (navHome) {
          navHome.classList.remove(TC.Consts.classes.HIDDEN);
        }
        if (svBtn) {
          svBtn.classList.remove(TC.Consts.classes.HIDDEN);
        }
        if (sb) {
          (sb as HTMLElement).style.visibility = 'visible';
        }
        if (scl) {
          (scl as HTMLElement).style.visibility = 'visible';
        }
      }

      // Render projects template if panel is being shown and not yet rendered
      if (
        !projectsPanel.classList.contains(TC.Consts.classes.HIDDEN) &&
        !projectsPanel.querySelector('.tc-ctl-lcat-proj-content')
      ) {
        handler.renderProjectsPanel(control, projectsPanel);
      }
    });

    // Use event delegation for panel buttons (they may not exist until template is rendered)
    projectsPanel.addEventListener('click', function (e: Event) {
      const target = e.target as HTMLElement;

      // Check if click is on catalog item first (before checking buttons)
      // This ensures catalog selection works even if clicking on label or other child elements
      const catalogElement = target.closest(
        '.tc-ctl-lcat-proj-catalog'
      ) as HTMLElement;
      if (catalogElement) {
        // Don't process if clicking on buttons inside the catalog item
        if (target.closest('button')) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        // Remove selection from previously selected item
        const selected = projectsPanel.querySelector(
          '.tc-ctl-lcat-proj-selected'
        );
        if (selected && selected !== catalogElement) {
          selected.classList.remove('tc-ctl-lcat-proj-selected');
        }

        // Add selection to clicked item
        catalogElement.classList.add('tc-ctl-lcat-proj-selected');
        return;
      }

      // Close button
      if (
        target.classList.contains('tc-ctl-lcat-proj-close') ||
        target.closest('.tc-ctl-lcat-proj-close')
      ) {
        e.preventDefault();
        e.stopPropagation();
        projectsPanel.classList.add(TC.Consts.classes.HIDDEN);
        projectsPanel
          .querySelectorAll('.tc-ctl-lcat-proj-selected')
          .forEach((item: Element) => {
            item.classList.remove('tc-ctl-lcat-proj-selected');
          });
        return;
      }

      // Accept button
      if (
        target.classList.contains('tc-ctl-lcat-proj-accept') ||
        target.closest('.tc-ctl-lcat-proj-accept')
      ) {
        e.preventDefault();
        e.stopPropagation();
        const selectedProject = projectsPanel.querySelector(
          '.tc-ctl-lcat-proj-selected'
        );
        if (selectedProject) {
          const catalogIdInput = selectedProject.querySelector(
            '.tc-ctl-lcat-proj-catalog-id'
          ) as HTMLInputElement;
          if (catalogIdInput) {
            const treeId = catalogIdInput.value; // Tree ID is stored as string
            if (treeId !== layerCatalogsForModal.currentTreeId) {
              handler.handleCatalogSwitch(treeId);
            }
          }
        }
        projectsPanel.classList.add(TC.Consts.classes.HIDDEN);
        return;
      }

      // Cancel button
      if (
        target.classList.contains('tc-ctl-lcat-proj-cancel') ||
        target.closest('.tc-ctl-lcat-proj-cancel')
      ) {
        e.preventDefault();
        e.stopPropagation();
        projectsPanel.classList.add(TC.Consts.classes.HIDDEN);
        projectsPanel
          .querySelectorAll('.tc-ctl-lcat-proj-selected')
          .forEach((item: Element) => {
            item.classList.remove('tc-ctl-lcat-proj-selected');
          });
        return;
      }
    });
  }

  /**
   * Render the projects panel with catalog list.
   */
  private renderProjectsPanel(control: any, projectsPanel: Element): void {
    const layerCatalogsForModal = (window as any).layerCatalogsForModal;
    if (!layerCatalogsForModal || !layerCatalogsForModal.catalogs) {
      return;
    }

    // Load and render the projects template
    const templateKey = control.CLASS + '-proj';
    control
      .getRenderedHtml(templateKey, {
        catalogs: layerCatalogsForModal.catalogs,
        title: 'Catalog Selection'
      })
      .then((html: string) => {
        const template = document.createElement('template');
        template.innerHTML = html;
        const content = template.content || (template as any);
        projectsPanel.innerHTML = '';
        projectsPanel.appendChild(content.cloneNode(true));

        // Mark current catalog as selected (by tree ID)
        const currentTreeId = layerCatalogsForModal.currentTreeId;
        const catalogItems = projectsPanel.querySelectorAll(
          '.tc-ctl-lcat-proj-catalog'
        );
        catalogItems.forEach((item: Element) => {
          const catalogIdInput = item.querySelector(
            '.tc-ctl-lcat-proj-catalog-id'
          ) as HTMLInputElement;
          if (catalogIdInput && catalogIdInput.value === currentTreeId) {
            item.classList.add('tc-ctl-lcat-proj-selected');
          }
        });

        // Re-attach event handlers for newly rendered elements
        const closeButton = projectsPanel.querySelector(
          '.tc-ctl-lcat-proj-close'
        );
        const acceptButton = projectsPanel.querySelector(
          '.tc-ctl-lcat-proj-accept'
        );
        const cancelButton = projectsPanel.querySelector(
          '.tc-ctl-lcat-proj-cancel'
        );
        const catalogItemsNew = projectsPanel.querySelectorAll(
          '.tc-ctl-lcat-proj-catalog'
        );

        if (closeButton) {
          closeButton.addEventListener('click', function () {
            projectsPanel.classList.add('tc-hidden');
            projectsPanel
              .querySelectorAll('.tc-ctl-lcat-proj-selected')
              .forEach((item: Element) => {
                item.classList.remove('tc-ctl-lcat-proj-selected');
              });
          });
        }

        if (acceptButton) {
          const handlerInstance = this;
          acceptButton.addEventListener('click', () => {
            const selectedProject = projectsPanel.querySelector(
              '.tc-ctl-lcat-proj-selected'
            );
            if (selectedProject) {
              const catalogIdInput = selectedProject.querySelector(
                '.tc-ctl-lcat-proj-catalog-id'
              ) as HTMLInputElement;
              if (catalogIdInput) {
                const treeId = catalogIdInput.value; // Tree ID is stored as string
                if (treeId !== layerCatalogsForModal.currentTreeId) {
                  handlerInstance.handleCatalogSwitch(treeId);
                }
              }
            }
            projectsPanel.classList.add('tc-hidden');
          });
        }

        if (cancelButton) {
          cancelButton.addEventListener('click', function () {
            projectsPanel.classList.add('tc-hidden');
            projectsPanel
              .querySelectorAll('.tc-ctl-lcat-proj-selected')
              .forEach((item: Element) => {
                item.classList.remove('tc-ctl-lcat-proj-selected');
              });
          });
        }

        catalogItemsNew.forEach((catalogElement: Element) => {
          catalogElement.addEventListener('click', function (e: Event) {
            e.preventDefault();
            e.stopPropagation();

            const selected = projectsPanel.querySelector(
              '.tc-ctl-lcat-proj-selected'
            );
            if (selected && selected !== catalogElement) {
              selected.classList.remove('tc-ctl-lcat-proj-selected');
            }
            catalogElement.classList.add('tc-ctl-lcat-proj-selected');
          });
        });
      })
      .catch((error: any) => {
        console.error('[LayerCatalog] Error rendering projects panel:', error);
      });
  }

  /**
   * Get tooltip text for the changeTopic button showing current topic.
   */
  private getCurrentTopicTooltip(): string {
    const layerCatalogsForModal = (window as any).layerCatalogsForModal;
    if (
      !layerCatalogsForModal ||
      !layerCatalogsForModal.catalogs ||
      layerCatalogsForModal.catalogs.length === 0
    ) {
      return 'Change topic organization';
    }

    const currentTreeId = layerCatalogsForModal.currentTreeId;
    const currentCatalogInfo = layerCatalogsForModal.catalogs.find(
      (c: any) => c.id === currentTreeId
    );
    const currentTopicName = currentCatalogInfo?.catalog || 'Unknown topic';

    return `Current topic: ${currentTopicName}`;
  }

  /**
   * Update the changeTopic button tooltip with current topic name.
   */
  private updateChangeTopicButtonTooltip(): void {
    const changeCatalogButton = document.querySelector(
      '#change-catalog-sitmun'
    ) as HTMLElement;
    if (changeCatalogButton) {
      const tooltip = this.getCurrentTopicTooltip();
      changeCatalogButton.setAttribute('title', tooltip);
    }
  }

  /**
   * Handle catalog switching.
   * Updates the current catalog and triggers control rebuild.
   * @param selectedTreeId - The tree ID of the selected catalog
   */
  private handleCatalogSwitch(selectedTreeId: string): void {
    const layerCatalogsForModal = (window as any).layerCatalogsForModal;
    if (!layerCatalogsForModal) {
      console.warn(
        '[LayerCatalog] layerCatalogsForModal not found, cannot switch catalog'
      );
      return;
    }

    if (selectedTreeId === layerCatalogsForModal.currentTreeId) {
      return;
    }

    const selectedCatalog = layerCatalogsForModal.catalogs.find(
      (c: any) => c.id === selectedTreeId
    );

    // Update current tree ID BEFORE calling updateCatalog
    // This ensures the value is set when buildConfiguration is called again
    layerCatalogsForModal.currentTreeId = selectedTreeId;

    // Update button tooltip immediately
    this.updateChangeTopicButtonTooltip();

    // Trigger catalog update via AbstractMapComponent if available
    const abstractMapObject = (window as any).abstractMapObject;
    if (
      abstractMapObject &&
      typeof abstractMapObject.updateCatalog === 'function'
    ) {
      abstractMapObject.updateCatalog();
    } else {
      console.warn(
        '[LayerCatalog] abstractMapObject.updateCatalog not available, catalog switch may require manual reload'
      );
    }
  }
}
