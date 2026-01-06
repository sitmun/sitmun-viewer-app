import { Injectable, inject } from '@angular/core';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';
import { AppCfg, AppTasks, AppTree } from '@api/model/app-cfg';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import { ConfigLookupService } from '../../services/config-lookup.service';

/**
 * Handler for legacy Silme layerCatalog extension.
 * This is the "old way" - custom Silme control.
 *
 * Control Type: sitna.layerCatalog.silme.extension
 * Patches: Applied programmatically (not loaded from JS files)
 * Configuration: Custom Silme control that directly uses SITMUN tree structures
 *
 * Note: For the new standard control, see LayerCatalogControlHandler.
 */
@Injectable({
  providedIn: 'root'
})
export class LayerCatalogSilmeControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.layerCatalog.silme.extension';
  readonly sitnaConfigKey = 'layerCatalogSilme'; // Match old system
  readonly requiredPatches = undefined; // Patches applied programmatically

  private readonly configLookup = inject(ConfigLookupService);

  constructor(tcNamespaceService: TCNamespaceService) {
    super(tcNamespaceService);
  }

  /**
   * Build configuration for Silme layerCatalog.
   * Uses custom Silme structure with direct tree references.
   * Also sets up global state expected by Silme patches.
   */
  buildConfiguration(
    task: AppTasks,
    context: AppCfg
  ): SitnaControlConfig | null {
    // Ensure context is initialized in lookup service
    this.configLookup.initialize(context);

    // Get root tree nodes
    const rootNodeIds = this.getRootNodeIds(task, context);

    if (rootNodeIds.length === 0) {
      console.warn(
        '[LayerCatalogSilme] No root nodes found, disabling control'
      );
      return null;
    }

    // Silme control uses direct tree node references
    const silmeNodes = rootNodeIds.map((nodeId) => ({
      nodeId,
      node: this.configLookup.findNode(nodeId)
    }));

    // Setup global state required by Silme patches
    this.setupSilmeGlobalState(context, rootNodeIds);

    const config: SitnaControlConfig = {
      div: 'layerCatalog',
      silmeNodes,
      ...task.parameters // Merge any additional parameters
    };

    console.log(
      `[LayerCatalogSilme] Configured with ${rootNodeIds.length} tree nodes`
    );
    return config;
  }

  /**
   * Setup global state that Silme patches expect.
   * This includes layerCatalogsSilmeForModal and SITNA.Cfg.controls.layerCatalogSilmeFolders.
   */
  private setupSilmeGlobalState(context: AppCfg, rootNodeIds: string[]): void {
    // Build simple catalog titles for modal
    const catalogs = rootNodeIds.map((nodeId) => {
      const node = this.configLookup.findNode(nodeId);
      return {
        title: node?.title || 'Catálogo',
        catalog: {}
      };
    });

    // Set global variable for modal (expected by LayerCatalogSilme.js)
    (window as any).layerCatalogsSilmeForModal = {
      currentCatalog: 0,
      catalogs: catalogs.map((cat, idx) => ({ id: idx, catalog: cat.title }))
    };

    // Note: SITNA.Cfg.controls.layerCatalogSilmeFolders is set by old SitnaHelper code
    // That code will eventually be removed when all controls use handlers

    console.log(
      '[LayerCatalogSilme] Global state configured for Silme patches'
    );
  }

  /**
   * Get root node IDs for the layer catalog.
   */
  private getRootNodeIds(task: AppTasks, context: AppCfg): string[] {
    if (task.parameters?.rootNodes) {
      return Array.isArray(task.parameters.rootNodes)
        ? task.parameters.rootNodes
        : [task.parameters.rootNodes];
    }

    return context.trees.map((tree: AppTree) => tree.rootNode);
  }

  /**
   * Check if Silme control is ready.
   * Verifies that patches are loaded and TC.control.LayerCatalogSilme exists.
   */
  override isReady(): boolean {
    if (!super.isReady()) {
      return false;
    }

    // Check if Silme control class is available
    const TC = this.tcNamespaceService.getTC();
    return !!TC?.control?.LayerCatalogSilme;
  }
}
