import { inject, Injectable } from '@angular/core';

import { AppCfg, AppNodeInfo, AppTasks, AppTree } from '@api/model/app-cfg';

import { ensureLayerCatalogInfoAffordance } from './layer-catalog-info-affordance';
import { CatalogLayerSelectionService } from '../../services/catalog-layer-selection.service';
import { CatalogSwitchingService } from '../../services/catalog-switching.service';
import { ConfigLookupService } from '../../services/config-lookup.service';
import { RasterLayerService } from '../../services/raster-layer.service';
import { SitnaApiService } from '../../services/sitna-api.service';
import { SitnaCapabilitiesInterceptor } from '../../services/sitna-capabilities-interceptor.service';
import { VirtualWmsCapabilitiesService } from '../../services/virtual-wms-capabilities.service';
import type { Meld, MeldJoinPoint } from '../../types/meld.types';
import { ControlHandlerBase } from '../control-handler-base';
import {
  BootstrapEligibilityOptions,
  SitnaControlConfig
} from '../control-handler.interface';

// Declare require for CommonJS module import
declare function require(module: string): any;

// meld is a CommonJS module, so we use require with proper typing
const meld = require('meld') as Meld;

/** Selector for layer-catalog tree root nodes (shared by multiple patches). */
const LAYER_ROOT_SELECTOR =
  'div.tc-ctl-lcat-tree > ul.tc-ctl-lcat-branch > li.tc-ctl-lcat-node';

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
  private readonly catalogSelection = inject(CatalogLayerSelectionService);
  private readonly catalogSwitching = inject(CatalogSwitchingService);
  private readonly rasterService = inject(RasterLayerService);
  private readonly capabilitiesInterceptor = inject(SitnaCapabilitiesInterceptor);

  // Store AppCfg for use in patches
  // Set in loadPatches() before patches are applied, so it's guaranteed to be non-null when patches execute
  private currentAppCfg: AppCfg | null = null;

  // Track if patches have been applied to avoid reapplying on map reload
  private patchesApplied = false;
  private defaultLoadApplied = new WeakMap<object, Set<number>>();
  private mapEventBridges = new WeakMap<object, () => void>();
  private mapEventBridgeDetaches = new Set<() => void>();
  private radioControlCleanups = new WeakMap<object, () => void>();
  private radioControlCleanupFns = new Set<() => void>();
  private radioControlCleanupsByMap = new WeakMap<object, Set<() => void>>();

  constructor(sitnaApi: SitnaApiService) {
    super(sitnaApi);
  }

  /** Run bootstrap only when layerCatalog is requested by a task. */
  needsBootstrap(
    tasks: AppTasks[],
    _options: BootstrapEligibilityOptions
  ): boolean {
    return tasks.some((t) => t['ui-control'] === 'sitna.layerCatalog');
  }

  /**
   * Bootstrap: install the shared SITNA capabilities interceptor so virtual WMS interception works.
   * The interceptor is a root-scoped singleton; the first control handler to call `ensurePatched`
   * installs the around-advice. Subsequent calls (e.g. on language reload) refresh `AppCfg`.
   *
   * @param context - Full application configuration context (required, must not be null)
   */
  async applyBootstrap(context: AppCfg): Promise<void> {
    this.currentAppCfg = context;
    this.configLookup.initialize(context);
    await this.capabilitiesInterceptor.ensurePatched(context);
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

    // Apply patches in order (matching sandbox sequence)
    await this.patchLayerCatalogAddLayerToMap();
    await this.patchLayerCatalogRenderBranch();
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

  override cleanup(): void {
    this.teardownMapState();
    super.cleanup();
    this.patchesApplied = false;
  }

  teardownMapState(map?: object): void {
    if (map) {
      const detach = this.mapEventBridges.get(map);
      detach?.();
      this.teardownRadioControlsForMap(map);
      this.catalogSelection.clearMap(map);
      return;
    }

    for (const detach of [...this.mapEventBridgeDetaches]) {
      detach();
    }
    for (const cleanup of [...this.radioControlCleanupFns]) {
      cleanup();
    }
    this.catalogSelection.clearAll();
    this.defaultLoadApplied = new WeakMap();
    this.mapEventBridges = new WeakMap();
    this.mapEventBridgeDetaches.clear();
    this.radioControlCleanups = new WeakMap();
    this.radioControlCleanupFns.clear();
    this.radioControlCleanupsByMap = new WeakMap();
  }

  /**
   * Build configuration for standard layerCatalog.
   * Generates virtual WMS capabilities for each root tree node.
   */
  override buildConfiguration(
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

      // Sort children by node.order so catalog entries follow admin-defined order.
      const sortedChildren = [...rootNode.children].sort((a, b) => {
        const orderA = this.configLookup.findNode(a)?.order ?? 999;
        const orderB = this.configLookup.findNode(b)?.order ?? 999;
        return orderA - orderB;
      });

      // Create a virtual service for each child of the root node
      for (const childId of sortedChildren) {
        const childNode = this.configLookup.findNode(childId);
        if (!childNode) {
          continue;
        }

        // Check if the node can generate valid capabilities before registering it
        if (!this.virtualWmsService.canGenerateCapabilities(childId, context)) {
          continue;
        }

        const mapLang = this.sitnaApi.getGlobal('currentMapLang') ?? undefined;
        const virtualUrl = this.virtualWmsService.generateVirtualUrl(
          childId,
          mapLang
        );

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

    const baseConfig: SitnaControlConfig = {
      ...defaultConfig,
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
    const allRootNodeIds = this.getAllRootNodeIds(context);
    const nonEmptyRootNodeIds = this.filterEmptyTrees(allRootNodeIds, context);

    if (nonEmptyRootNodeIds.length > 0) {
      return [nonEmptyRootNodeIds[0]]; // Return only the first non-empty tree
    }

    return []; // No non-empty trees available
  }

  // ============================================================================
  // PATCH METHODS - Ported from sandbox layer-catalog-control.component.ts
  // ============================================================================

  /**
   * Patch LayerCatalog.addLayerToMap to replace virtual layers with real layer configurations.
   * Completely replaces the method to handle virtual layers natively.
   */
  private async patchLayerCatalogAddLayerToMap(): Promise<void> {
    await this.withTCAsync(async (TC) => {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const handler = this;
      const Util = TC.Util;
      const ctlProto = TC.control.LayerCatalog.prototype;

      if (!ctlProto || typeof ctlProto.addLayerToMap !== 'function') {
        return;
      }

      const advice = meld.around(
        ctlProto,
        'addLayerToMap',
        function (this: any, joinPoint: MeldJoinPoint): unknown {
          const layer = joinPoint.args[0] as any;
          const layerName = joinPoint.args[1] as string;
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          const self = this;
          const layerObj = layer;
          const appCfgAdd =
            handler.sitnaApi.getGlobal('currentAppCfg') ??
            handler.currentAppCfg;
          if (!appCfgAdd) {
            return joinPoint.proceed();
          }

          handler.attachMapEventBridge(self.map, TC);

          const catalogNode = handler.configLookup.findNode(layerName);
          const realLayerConfig = handler.virtualWmsService.findRealLayerConfig(
            layerName,
            appCfgAdd
          );
          if (catalogNode && !realLayerConfig) {
            console.warn(
              '[LayerCatalogControlHandler] Skipping unresolved catalog node',
              layerName
            );
            return Promise.resolve(undefined);
          }

          const resource = catalogNode?.resource;
          const radioParent = handler.configLookup.getRadioGroupParent(layerName);
          const prepared = handler.catalogSelection.prepareSelection(
            self.map,
            layerName,
            resource,
            handler.configLookup
          );

          if (prepared.action === 'deselect') {
            return handler.removeLayerClaims(self.map, [layerName], self);
          }

          if (prepared.action === 'skip') {
            return Promise.resolve(
              handler.findRepresentativeWorkLayer(
                self.map,
                resource,
                layerName
              )
            );
          }

          const layerOptions = Util.extend({}, layerObj.options) as {
            id?: string;
            hideTree?: boolean;
            title?: string;
            url?: string;
            type?: string;
            layerNames?: string | string[];
            nodeId?: string;
            serviceId?: string;
            [key: string]: unknown;
          };

          const transparency = realLayerConfig?.transparency;

          if (realLayerConfig) {
            layerOptions.id = self.getUID();
            layerOptions.hideTree = true;
            layerOptions.title = layerObj.title;
            layerOptions.url = realLayerConfig.url;
            layerOptions.type = realLayerConfig.type;
            layerOptions.layerNames = Array.isArray(realLayerConfig.layerNames)
              ? realLayerConfig.layerNames
              : [realLayerConfig.layerNames];
            layerOptions.nodeId = layerName;
            if (realLayerConfig.serviceId) {
              layerOptions.serviceId = realLayerConfig.serviceId;
            }
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
            ? layerOptions.layerNames.filter((_name): _name is string => true)
            : layerOptions.layerNames != null
            ? [String(layerOptions.layerNames)]
            : [];

          const Raster = TC.layer.Raster;

          const runAdd = async (): Promise<any> => {
            try {
              if (!prepared.needsPhysicalAdd) {
                const removed = handler.catalogSelection.commitSelection(
                  self.map,
                  layerName,
                  resource,
                  true
                );
                await handler.catalogSelection.runWithSelfCommit(
                  self.map,
                  async () => {
                    await handler.removePhysicalResources(
                      self.map,
                      removed.removeResources,
                      self,
                      layerName
                    );
                  }
                );
                handler.syncRadioCheckedState(self);
                return handler.findRepresentativeWorkLayer(
                  self.map,
                  resource,
                  layerName
                );
              }

              const newLayer = new Raster(layerOptions);
              await newLayer.getCapabilitiesPromise();

              if (!appCfgAdd) {
                return joinPoint.proceed();
              }
              const nodeTitle = handler.getNodeTitle(layerName, appCfgAdd);

              if (nodeTitle && newLayer.Capability?.Layer) {
                handler.updateLayerTitleInCapabilities(
                  newLayer.Capability.Layer,
                  effectiveLayerNames,
                  nodeTitle
                );
              }

              if (newLayer.isCompatible(self.map.crs)) {
                const profileOpacity =
                  typeof transparency === 'number' && transparency > 0
                    ? (100 - transparency) / 100
                    : undefined;

                if (profileOpacity != null) {
                  const prev = layerOptions['renderOptions'] as
                    | Record<string, unknown>
                    | undefined;
                  layerOptions['renderOptions'] = {
                    ...(typeof prev === 'object' && prev !== null ? prev : {}),
                    opacity: profileOpacity
                  };
                }

                layerOptions['zIndex'] = realLayerConfig?.order ?? 0;

                const addedLayer = await handler.catalogSelection.runWithSelfCommit(
                  self.map,
                  () => self.map.addLayer(layerOptions)
                );

                if (
                  addedLayer != null &&
                  profileOpacity != null &&
                  typeof addedLayer.setOpacity === 'function'
                ) {
                  await addedLayer.setOpacity(profileOpacity);
                  const ro = addedLayer.renderOptions as
                    | Record<string, unknown>
                    | undefined;
                  addedLayer.renderOptions = {
                    ...(typeof ro === 'object' && ro !== null ? ro : {}),
                    opacity: profileOpacity
                  };
                }

                const removed = handler.catalogSelection.commitSelection(
                  self.map,
                  layerName,
                  resource,
                  true
                );
                await handler.catalogSelection.runWithSelfCommit(
                  self.map,
                  async () => {
                    await handler.removePhysicalResources(
                      self.map,
                      removed.removeResources,
                      self,
                      layerName
                    );
                  }
                );
                handler.syncRadioCheckedState(self);
                return addedLayer ?? newLayer;
              }

              handler.catalogSelection.commitSelection(
                self.map,
                layerName,
                resource,
                false
              );
              handler.syncRadioCheckedState(self);
              const showProjectionChangeDialog = self.showProjectionChangeDialog;
              if (typeof showProjectionChangeDialog === 'function') {
                showProjectionChangeDialog.call(self, newLayer);
              }
              return newLayer;
            } catch (error) {
              handler.catalogSelection.clearPendingReplacement(
                self.map,
                layerName
              );
              throw error;
            }
          };

          if (radioParent) {
            return handler.catalogSelection.withRadioGroupLock(
              self.map,
              radioParent,
              runAdd
            );
          }
          return runAdd();
        }
      );

      this.patchManager.add(() => advice.remove());
    });
  }

  private async patchLayerCatalogRenderBranch(): Promise<void> {
    await this.withTCAsync(async (TC) => {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const handler = this;
      const ctlProto = TC.control.LayerCatalog.prototype;

      if (!ctlProto || typeof ctlProto.renderBranch !== 'function') {
        return;
      }

      const advice = meld.around(
        ctlProto,
        'renderBranch',
        function (this: any, joinPoint: MeldJoinPoint): unknown {
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          const self = this;
          const callback = joinPoint.args[1] as (() => void) | undefined;
          if (typeof callback === 'function') {
            joinPoint.args[1] = function (this: unknown) {
              callback.call(this);
              handler.decorateRadioControls(self);
            };
          }
          const result = joinPoint.proceed();
          if (typeof callback !== 'function') {
            handler.decorateRadioControls(self);
          }
          return result;
        }
      );

      this.patchManager.add(() => advice.remove());
    });
  }

  private attachMapEventBridge(map: any, TC: any): void {
    if (!map || this.mapEventBridges.has(map)) {
      return;
    }

    const events = TC?.Consts?.event ?? {};
    const layerAdd = events.LAYERADD ?? 'layeradd';
    const layerRemove = events.LAYERREMOVE ?? 'layerremove';
    const layerError = events.LAYERERROR ?? 'layererror';

    const onAdd = (layer: any) => {
      if (this.catalogSelection.isSelfCommit(map)) {
        return;
      }
      const nodeId = this.catalogSelection.resolveNodeId(layer ?? {});
      if (!nodeId) {
        return;
      }
      const catalogNode = this.configLookup.findNode(nodeId);
      const resource = catalogNode?.resource;
      const radioParent = this.configLookup.getRadioGroupParent(nodeId);

      const register = (): void => {
        const removed = this.catalogSelection.registerExternalClaim(
          map,
          nodeId,
          resource,
          this.configLookup
        );
        void this.catalogSelection.runWithSelfCommit(map, async () => {
          await this.removePhysicalResources(
            map,
            removed.removeResources,
            undefined,
            nodeId
          );
        });
        const catalog = this.findLayerCatalogControl(map, TC);
        if (catalog) {
          this.syncRadioCheckedState(catalog);
        }
      };

      if (radioParent) {
        void this.catalogSelection.withRadioGroupLock(
          map,
          radioParent,
          async () => {
            register();
          }
        );
      } else {
        register();
      }
    };

    const onRemove = (layer: any) => {
      if (this.catalogSelection.isSelfCommit(map)) {
        return;
      }
      const removedLayer = layer?.layer ?? layer;
      const nodeId = this.catalogSelection.resolveNodeId(removedLayer ?? {});
      if (!nodeId) {
        return;
      }
      const resource = this.configLookup.findNode(nodeId)?.resource;
      if (resource) {
        this.catalogSelection.clearClaimsForResource(map, resource);
      } else {
        this.catalogSelection.deselectNode(map, nodeId);
      }
      const catalog = this.findLayerCatalogControl(map, TC);
      if (catalog) {
        this.syncRadioCheckedState(catalog);
      }
    };

    const onError = (layer: any) => {
      if (this.catalogSelection.isSelfCommit(map)) {
        return;
      }
      const nodeId = this.catalogSelection.resolveNodeId(layer ?? {});
      if (!nodeId) {
        return;
      }
      this.catalogSelection.commitSelection(
        map,
        nodeId,
        this.configLookup.findNode(nodeId)?.resource,
        false
      );
      const catalog = this.findLayerCatalogControl(map, TC);
      if (catalog) {
        this.syncRadioCheckedState(catalog);
      }
    };

    if (typeof map.on === 'function') {
      map.on(layerAdd, onAdd);
      map.on(layerRemove, onRemove);
      map.on(layerError, onError);
    }

    const detach = () => {
      if (typeof map.off === 'function') {
        map.off(layerAdd, onAdd);
        map.off(layerRemove, onRemove);
        map.off(layerError, onError);
      } else if (typeof map.un === 'function') {
        map.un(layerAdd, onAdd);
        map.un(layerRemove, onRemove);
        map.un(layerError, onError);
      }
      this.catalogSelection.clearMap(map);
      this.mapEventBridges.delete(map);
      this.mapEventBridgeDetaches.delete(detach);
    };

    this.mapEventBridges.set(map, detach);
    this.mapEventBridgeDetaches.add(detach);
  }

  private findLayerCatalogControl(map: any, TC: any): any | undefined {
    if (typeof map?.getControlsByClass !== 'function') {
      return undefined;
    }
    const controls = map.getControlsByClass(TC.control.LayerCatalog);
    return Array.isArray(controls) ? controls[0] : undefined;
  }

  private radioSearchObservers = new WeakMap<object, MutationObserver>();
  private catalogTreeObservers = new WeakMap<object, MutationObserver>();
  private radioGroupSequence = 0;

  private decorateRadioControls(catalogControl: any): void {
    const div = catalogControl?.div;
    const map = catalogControl?.map;
    if (!div || !map) {
      return;
    }

    const previousCleanup = this.radioControlCleanups.get(catalogControl);
    previousCleanup?.();

    const inputHandler = (event: Event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target?.matches('input[type="radio"].sitmun-lcat-radio')) {
        return;
      }
      event.stopPropagation();
      const nodeId = target.dataset['layerName'];
      if (!nodeId) {
        return;
      }
      const wasChecked = this.catalogSelection.isNodeSelected(map, nodeId);
      void this.handleRadioInputSelection(catalogControl, nodeId, wasChecked);
    };

    const folderHandler = (event: Event) => {
      const target = event.target as Element | null;
      const folder = target?.closest(
        'li.tc-ctl-lcat-node[data-sitmun-radio-folder="true"]'
      ) as HTMLElement | null;
      if (!folder || !folder.contains(target)) {
        return;
      }
      const title = folder.querySelector('.tc-ctl-lcat-node-title, span');
      if (!title?.contains(target as Node) && target !== title) {
        return;
      }
      const folderId = folder.dataset['layerName'];
      if (!folderId) {
        return;
      }
      const firstChild = this.configLookup.getFirstRadioChildId(folderId);
      if (!firstChild) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      // No-op when first child is already selected: prevent re-entering prepareSelection
      // which would toggle the selection off as a deselect action.
      if (this.catalogSelection.isNodeSelected(map, firstChild)) {
        return;
      }
      void this.handleRadioInputSelection(catalogControl, firstChild, false);
    };

    div.addEventListener('click', inputHandler, true);
    div.addEventListener('click', folderHandler, true);

    this.injectRadioInputs(catalogControl, div);
    this.syncRadioCheckedState(catalogControl);

    this.catalogTreeObservers.get(catalogControl)?.disconnect();
    const treeObserver = new MutationObserver(() => {
      this.injectRadioInputs(catalogControl, div);
      this.syncRadioCheckedState(catalogControl);
    });
    treeObserver.observe(div, { childList: true, subtree: true });
    this.catalogTreeObservers.set(catalogControl, treeObserver);

    const searchList = div.querySelector('.tc-ctl-lcat-search ul');
    const previousObserver = this.radioSearchObservers.get(catalogControl);
    previousObserver?.disconnect();
    if (searchList) {
      const observer = new MutationObserver(() => {
        this.injectRadioInputs(catalogControl, searchList);
      });
      observer.observe(searchList, { childList: true, subtree: true });
      this.radioSearchObservers.set(catalogControl, observer);
    }

    const cleanup = () => {
      div.removeEventListener('click', inputHandler, true);
      div.removeEventListener('click', folderHandler, true);
      div
        .querySelectorAll('input.sitmun-lcat-radio')
        .forEach((input: Element) => input.remove());
      this.radioSearchObservers.get(catalogControl)?.disconnect();
      this.radioSearchObservers.delete(catalogControl);
      this.catalogTreeObservers.get(catalogControl)?.disconnect();
      this.catalogTreeObservers.delete(catalogControl);
      this.radioControlCleanups.delete(catalogControl);
      this.radioControlCleanupFns.delete(cleanup);
      this.radioControlCleanupsByMap.get(map)?.delete(cleanup);
    };
    this.radioControlCleanups.set(catalogControl, cleanup);
    this.radioControlCleanupFns.add(cleanup);
    const mapCleanups =
      this.radioControlCleanupsByMap.get(map) ?? new Set<() => void>();
    mapCleanups.add(cleanup);
    this.radioControlCleanupsByMap.set(map, mapCleanups);
  }

  private injectRadioInputs(catalogControl: any, root: ParentNode): void {
    const map = catalogControl?.map;
    if (!map) {
      return;
    }

    const folderIds = new Set<string>();
    root.querySelectorAll('li[data-layer-name]').forEach((li: Element) => {
      const nodeId = (li as HTMLElement).dataset['layerName'];
      if (!nodeId) {
        return;
      }
      if (this.configLookup.isRadioFolder(nodeId)) {
        folderIds.add(nodeId);
      }
      const radioParent = this.configLookup.getRadioGroupParent(nodeId);
      if (radioParent) {
        folderIds.add(radioParent);
      }
    });

    for (const folderId of folderIds) {
      const folderLi = root.querySelector(
        `li[data-layer-name="${folderId}"]`
      ) as HTMLElement | null;
      if (folderLi) {
        folderLi.dataset['sitmunRadioFolder'] = 'true';
      }
      const groupName =
        folderLi?.dataset['sitmunRadioGroup'] ??
        `sitmun-radio-${folderId}-${++this.radioGroupSequence}`;
      if (folderLi) {
        folderLi.dataset['sitmunRadioGroup'] = groupName;
      }
      for (const childId of this.configLookup.getDirectChildIds(folderId)) {
        const childLi = root.querySelector(
          `li[data-layer-name="${childId}"]`
        ) as HTMLElement | null;
        if (!childLi || childLi.querySelector('input.sitmun-lcat-radio')) {
          continue;
        }
        const childNode = this.configLookup.findNode(childId);
        const input = document.createElement('input');
        input.type = 'radio';
        input.className = 'sitmun-lcat-radio';
        input.name = groupName;
        input.dataset['layerName'] = childId;
        input.setAttribute('aria-checked', 'false');
        input.setAttribute('aria-label', childNode?.title ?? childId);
        const label = document.createElement('label');
        label.className = 'sitmun-lcat-radio-label';
        label.appendChild(input);
        const titleSpan =
          childLi.querySelector('.tc-ctl-lcat-node-title, span') ??
          childLi.firstElementChild;
        if (titleSpan) {
          titleSpan.insertBefore(label, titleSpan.firstChild);
        } else {
          childLi.insertBefore(label, childLi.firstChild);
        }
      }
    }

    this.syncRadioCheckedState(catalogControl);
  }

  private async handleRadioInputSelection(
    catalogControl: any,
    nodeId: string,
    wasChecked: boolean
  ): Promise<void> {
    const node = this.configLookup.findNode(nodeId);
    if (!node || typeof catalogControl.addLayerToMap !== 'function') {
      return;
    }
    if (wasChecked && this.configLookup.getRadioGroupParent(nodeId)) {
      await this.removeLayerClaims(catalogControl.map, [nodeId], catalogControl);
      this.syncRadioCheckedState(catalogControl);
      return;
    }
    const context =
      this.sitnaApi.getGlobal('currentAppCfg') ?? this.currentAppCfg;
    const configuredLayer = context
      ? this.findConfiguredCatalogLayer(catalogControl, context, nodeId)
      : undefined;
    await catalogControl.addLayerToMap(
      configuredLayer ?? { title: node.title, options: {} },
      nodeId
    );
    this.syncRadioCheckedState(catalogControl);
  }

  private syncRadioCheckedState(catalogControl: any): void {
    const div = catalogControl?.div;
    const map = catalogControl?.map;
    if (!div || !map) {
      return;
    }
    const catalogNodes = div.querySelectorAll('li[data-layer-name]');
    catalogNodes.forEach((node: Element) => {
      node.classList.remove('tc-checked');
    });
    catalogNodes.forEach((node: Element) => {
      const nodeId = (node as HTMLElement).dataset['layerName'];
      if (!nodeId || !this.catalogSelection.isNodeSelected(map, nodeId)) {
        return;
      }
      let current: Element | null = node;
      while (current?.matches('li[data-layer-name]')) {
        current.classList.add('tc-checked');
        current = current.parentElement?.closest('li[data-layer-name]') ?? null;
      }
    });
    div.querySelectorAll('input.sitmun-lcat-radio').forEach((input: Element) => {
      const element = input as HTMLInputElement;
      const nodeId = element.dataset['layerName'];
      const checked = !!nodeId && this.catalogSelection.isNodeSelected(map, nodeId);
      element.checked = checked;
      element.setAttribute('aria-checked', String(checked));
      const li = element.closest('li.tc-ctl-lcat-node');
      if (li) {
        li.classList.toggle('tc-checked', checked);
      }
    });
  }

  private findRepresentativeWorkLayer(
    map: any,
    resource: string | undefined,
    nodeId: string
  ): any | undefined {
    const layers = Array.isArray(map?.workLayers)
      ? map.workLayers
      : Array.isArray(map?.layers)
      ? map.layers
      : [];
    for (const layer of layers) {
      const layerNodeId = this.catalogSelection.resolveNodeId(layer ?? {});
      if (!layerNodeId) {
        continue;
      }
      const layerResource = this.configLookup.findNode(layerNodeId)?.resource;
      if (resource && layerResource === resource) {
        return layer;
      }
      if (layerNodeId === nodeId) {
        return layer;
      }
    }
    return undefined;
  }

  private teardownRadioControlsForMap(map: object): void {
    const cleanups = this.radioControlCleanupsByMap.get(map);
    if (!cleanups) {
      return;
    }
    for (const cleanup of [...cleanups]) {
      cleanup();
    }
    this.radioControlCleanupsByMap.delete(map);
  }

  private async removeLayerClaims(
    map: any,
    nodeIds: string[],
    catalogControl: any | undefined
  ): Promise<void> {
    const removeResources = new Set<string>();
    for (const nodeId of nodeIds) {
      const removed = this.catalogSelection.deselectNode(map, nodeId);
      for (const resource of removed.removeResources) {
        removeResources.add(resource);
      }
    }
    await this.removePhysicalResources(
      map,
      [...removeResources],
      catalogControl
    );
  }

  private async removePhysicalResources(
    map: any,
    resources: string[],
    catalogControl: any | undefined,
    keepNodeId?: string
  ): Promise<void> {
    if (!map || resources.length === 0) {
      return;
    }
    const layers = Array.isArray(map.workLayers)
      ? map.workLayers
      : Array.isArray(map.layers)
      ? map.layers
      : [];
    for (const layer of layers) {
      const nodeId = this.catalogSelection.resolveNodeId(layer ?? {});
      if (!nodeId || nodeId === keepNodeId) {
        continue;
      }
      const resource = this.configLookup.findNode(nodeId)?.resource;
      if (resource && resources.includes(resource)) {
        if (typeof map.removeLayer === 'function') {
          await this.catalogSelection.runWithSelfCommit(map, () =>
            map.removeLayer(layer)
          );
        }
      }
    }
    if (catalogControl) {
      this.syncRadioCheckedState(catalogControl);
    }
  }

  /**
   * Patch LayerCatalog.addLayer to return a resolved Promise and ignore calls
   * for virtual layers (our layers), while allowing external WMS layers.
   * Uses meld.around to intercept calls and check if layer is virtual.
   */
  private async patchLayerCatalogAddLayer(): Promise<void> {
    await this.withTCAsync(async (TC) => {
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
    await this.withTCAsync(async (TC) => {
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
          const rootNodes = self.div.querySelectorAll(LAYER_ROOT_SELECTOR);
          if (!rootNodes) {
            return [];
          }

          const nodeId = layerObj.options?.nodeId ?? layerObj.nodeId;
          if (!nodeId) {
            return joinPoint.proceed() as Element[];
          }
          const selector = `li[data-layer-name="${nodeId}"]`;

          for (let i = 0; i < rootNodes.length; i++) {
            const rootNode = rootNodes[i];
            const liLayer = rootNode.querySelector(selector);
            if (liLayer) {
              liLayer.classList.remove(TC.Consts.classes.LOADING);
              result.push(liLayer);
              liLayer.querySelectorAll('li').forEach((li: Element) => {
                result.push(li);
              });
            }
            result.push(rootNode);
          }
          return result;
        }
      );

      this.patchManager.add(() => advice.remove());
    });
  }

  /**
   * Patch LayerCatalog.getLayerRootNode to handle virtual layers by nodeId.
   */
  private async patchLayerCatalogGetLayerRootNode(): Promise<void> {
    await this.withTCAsync(async (TC) => {
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
            const rootNodes = self.div.querySelectorAll(LAYER_ROOT_SELECTOR);

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

      this.patchManager.add(() => advice.remove());
    });
  }

  /**
   * Patch Raster.getPath to return parent node titles from SITMUN configuration.
   */
  private async patchRasterGetPath(): Promise<void> {
    await this.withTCAsync(async (TC) => {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const handler = this;
      const RasterProto = this.getRasterPrototype(TC);

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
          const appCfgPath =
            handler.sitnaApi.getGlobal('currentAppCfg') ??
            handler.currentAppCfg;
          if (nodeId && appCfgPath) {
            const parentTitles = handler.getParentNodeTitles(
              nodeId,
              appCfgPath
            );
            if (parentTitles.length > 0) {
              return parentTitles;
            }
          }

          return joinPoint.proceed();
        }
      );

      this.patchManager.add(() => advice.remove());
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
   * Get the Raster prototype from SITNA/TC, if present.
   */
  private getRasterPrototype(TC: any): any {
    return TC?.layer?.Raster?.prototype || TC?.wrap?.layer?.Raster?.prototype;
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
    await this.withTCAsync(async (TC) => {
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
    await this.withTCAsync(async (TC) => {
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
    await this.withTCAsync(async (TC) => {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const handler = this;
      const RasterProto = this.getRasterPrototype(TC);

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
            return ensureLayerCatalogInfoAffordance(joinPoint.proceed());
          }

          // For virtual layers, use nodeId from options if available, otherwise use name parameter
          const nodeId = nodeIdFromOptions || name;

          const appCfgInfo =
            handler.sitnaApi.getGlobal('currentAppCfg') ??
            handler.currentAppCfg;
          if (!appCfgInfo) {
            return { name: nodeId, abstract: '' };
          }

          const realLayerConfig = handler.virtualWmsService.findRealLayerConfig(
            nodeId,
            appCfgInfo
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
            rasterInstancesCache
          );

          // Enrich layer info using service
          const enrichedInfo = handler.rasterService.enrichRasterLayerInfo(
            nodeId,
            realLayerConfig,
            wmsCapabilities,
            rasterInstancesCache
          );

          // Merge original result with enriched data (enriched overrides original)
          // Ensure originalInfo is an object before spreading
          const originalInfoObj =
            originalInfo && typeof originalInfo === 'object'
              ? originalInfo
              : {};
          return ensureLayerCatalogInfoAffordance({
            ...originalInfoObj,
            ...enrichedInfo
          });
        }
      );

      this.patchManager.add(() => advice.remove());
    });
  }

  /**
   * Patch LayerCatalog to inject catalog switching button and projects panel via DOM manipulation.
   * Injects elements after template renders without modifying the template.
   */
  private async patchLayerCatalogInjectCatalogSwitching(): Promise<void> {
    await this.withTCAsync(async (TC) => {
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

      this.patchManager.add(() => advice.remove());
    });
  }

  collectDefaultLayerNodes(
    context: AppCfg
  ): Array<{ nodeId: string; title: string; order: number }> {
    const rootNodeIds = this.getRootNodeIds(context);
    const collected: Array<{ nodeId: string; title: string; order: number }> =
      [];
    const seenResources = new Set<string>();
    const seenRadioGroups = new Set<string>();

    for (const rootNodeId of rootNodeIds) {
      this.collectDefaultLayerNodesFromNode(
        context,
        rootNodeId,
        collected,
        seenResources,
        seenRadioGroups
      );
    }

    return collected;
  }

  private collectDefaultLayerNodesFromNode(
    context: AppCfg,
    nodeId: string,
    collected: Array<{ nodeId: string; title: string; order: number }>,
    seenResources: Set<string>,
    seenRadioGroups: Set<string>
  ): void {
    const tree = context.trees?.find(
      (candidate) => candidate.nodes && candidate.nodes[nodeId]
    );
    if (!tree?.nodes) {
      return;
    }

    const node = tree.nodes[nodeId] as AppNodeInfo | undefined;
    if (!node) {
      return;
    }

    if (node.loadByDefault === true && node.resource && !node.action) {
      const radioParent = this.configLookup.getRadioGroupParent(nodeId);
      const skipRadio =
        !!radioParent && seenRadioGroups.has(radioParent);
      const skipResource = seenResources.has(node.resource);
      if (!skipRadio && !skipResource) {
        if (radioParent) {
          seenRadioGroups.add(radioParent);
        }
        seenResources.add(node.resource);
        collected.push({
          nodeId,
          title: node.title,
          order: node.order
        });
      }
    }

    for (const childId of node.children ?? []) {
      this.collectDefaultLayerNodesFromNode(
        context,
        childId,
        collected,
        seenResources,
        seenRadioGroups
      );
    }
  }

  private subtreeContainsNode(
    rootNodeId: string,
    targetNodeId: string,
    visited = new Set<string>()
  ): boolean {
    if (rootNodeId === targetNodeId) {
      return true;
    }
    if (visited.has(rootNodeId)) {
      return false;
    }
    visited.add(rootNodeId);
    return this.configLookup
      .getDirectChildIds(rootNodeId)
      .some((childId) =>
        this.subtreeContainsNode(childId, targetNodeId, visited)
      );
  }

  private findConfiguredCatalogLayer(
    catalogControl: any,
    context: AppCfg,
    nodeId: string
  ): any | undefined {
    const branchNodeId = this.getRootNodeIds(context)
      .flatMap((rootNodeId) =>
        this.configLookup.getDirectChildIds(rootNodeId)
      )
      .find((candidateId) => this.subtreeContainsNode(candidateId, nodeId));
    return catalogControl.options?.layers?.find(
      (candidate: any) =>
        typeof candidate?.url === 'string' &&
        !!branchNodeId &&
        candidate.url.endsWith(`/${branchNodeId}`)
    );
  }

  async applyDefaultWorkingLayers(
    map: { getControlsByClass?: (type: unknown) => unknown[] },
    context: AppCfg | null | undefined,
    loadId: number
  ): Promise<void> {
    if (!context || !this.needsBootstrap(context.tasks, { isEnabledByDefault: () => false })) {
      return;
    }

    const applied = this.defaultLoadApplied.get(map) ?? new Set<number>();
    if (applied.has(loadId)) {
      return;
    }

    const defaultNodes = this.collectDefaultLayerNodes(context);
    if (defaultNodes.length === 0) {
      applied.add(loadId);
      this.defaultLoadApplied.set(map, applied);
      return;
    }

    await this.withTCAsync(async (TC) => {
      const catalogs =
        typeof map.getControlsByClass === 'function'
          ? (map.getControlsByClass(TC.control.LayerCatalog) as Array<{
              addLayerToMap?: (
                layer: { title: string; options: Record<string, unknown> },
                nodeId: string
              ) => Promise<unknown>;
              map?: object;
            }>)
          : [];
      const catalog = catalogs[0];
      if (!catalog?.addLayerToMap) {
        return;
      }

      this.attachMapEventBridge(catalog.map ?? map, TC);

      for (const { nodeId, title } of defaultNodes) {
        const realLayerConfig = this.virtualWmsService.findRealLayerConfig(
          nodeId,
          context
        );
        if (!realLayerConfig) {
          console.warn(
            '[LayerCatalogControlHandler] Skipping default layer without profile config',
            nodeId
          );
          continue;
        }

        try {
          const configuredLayer = this.findConfiguredCatalogLayer(
            catalog,
            context,
            nodeId
          );
          await catalog.addLayerToMap(
            configuredLayer ?? { title, options: {} },
            nodeId
          );
        } catch (error) {
          console.error(
            '[LayerCatalogControlHandler] Failed to apply default layer',
            nodeId,
            error
          );
        }
      }

      applied.add(loadId);
      this.defaultLoadApplied.set(map, applied);
    });
  }
}
