import { Injectable } from '@angular/core';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';
import { AppCfg, AppTasks } from '@api/model/app-cfg';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import { loadScript } from '../../utils/script-loader';

/**
 * Handler for the native SITNA coordinates control.
 * Requires TCProjectionDataPatch for proper CRS/projection support.
 *
 * Control Type: sitna.coordinates
 * Patches: TCProjectionDataPatch.js (required for projection data)
 * Configuration: Simple div + optional parameters
 */
@Injectable({
  providedIn: 'root'
})
export class CoordinatesControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.coordinates';
  readonly sitnaConfigKey = 'coordinates';
  readonly requiredPatches = ['assets/js/patch/TCProjectionDataPatch.js'];

  constructor(tcNamespaceService: TCNamespaceService) {
    super(tcNamespaceService);
  }

  /**
   * Load TCProjectionDataPatch required for coordinates control.
   * This patch modifies TC.getProjectionData to support proper CRS/projection handling.
   *
   * @param context - Full application configuration context (required, must not be null)
   */
  override async loadPatches(context: AppCfg): Promise<void> {
    // Check if patch already loaded
    if ((window as any).__patchesLoaded?.TCProjectionDataPatch) {
      return;
    }

    // Load the patch script
    await loadScript('assets/js/patch/TCProjectionDataPatch.js');

    // Wait a tick for script to execute
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  /**
   * Build configuration for coordinates control.
   * Uses default div if no parameters provided.
   */
  buildConfiguration(
    task: AppTasks,
    context: AppCfg
  ): SitnaControlConfig | null {
    const defaultConfig = this.getDefaultConfig();
    return this.mergeWithParameters(defaultConfig, task.parameters);
  }

  /**
   * Check if coordinates control is ready.
   * Verifies that TCProjectionDataPatch is loaded.
   */
  override isReady(): boolean {
    if (!super.isReady()) {
      return false;
    }

    // Verify patch is loaded
    return !!(window as any).__patchesLoaded?.TCProjectionDataPatch;
  }
}
