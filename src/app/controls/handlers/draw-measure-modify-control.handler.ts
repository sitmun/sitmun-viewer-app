import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { TCNamespaceService } from '../../services/tc-namespace.service';
import { UIStateService } from '../../services/ui-state.service';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';
import {
  applyFeatureStylerPatches,
  applyModifyPatches
} from '../utils/sitna-patch-helpers';

/**
 * Handler for the native SITNA drawMeasureModify control.
 * Allows users to draw, measure, and modify features on the map.
 *
 * Control Type: sitna.drawMeasureModify
 * Patches: FeatureStyler methods and Modify.renderPromise to prevent
 *          errors when called before component rendering completes
 * Configuration: div + optional parameters
 */
@Injectable({
  providedIn: 'root'
})
export class DrawMeasureModifyControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.drawMeasureModify';
  readonly sitnaConfigKey = 'drawMeasureModify';
  readonly requiredPatches = undefined; // No patches needed

  constructor(
    tcNamespaceService: TCNamespaceService,
    private uiStateService: UIStateService
  ) {
    super(tcNamespaceService);
  }

  /**
   * Build configuration for drawMeasureModify control.
   * Uses default div if no parameters provided, otherwise merges parameters.
   * Enables tools button when drawMeasureModify control is configured.
   */
  buildConfiguration(
    task: AppTasks,
    _context: AppCfg
  ): SitnaControlConfig | null {
    const defaultConfig = this.getDefaultConfig();
    const config = this.mergeWithParameters(defaultConfig, task.parameters);

    // Enable tools button when drawMeasureModify control is configured
    this.uiStateService.enableToolsButton();

    return config;
  }

  /**
   * Load patches for drawMeasureModify control.
   * Patches FeatureStyler to prevent errors when setter methods
   * are called before the component has fully rendered its DOM elements.
   * Also patches Modify.renderPromise to prevent errors when #textInput is undefined.
   */
  override async loadPatches(_context: AppCfg): Promise<void> {
    await this.waitForTCAndApply(async (TC) => {
      // Apply Modify patches with cleanup registration
      applyModifyPatches(TC, { patchManager: this.patchManager });

      // Apply FeatureStyler patches with cleanup registration
      // This now patches all 6 methods (previously only 2)
      applyFeatureStylerPatches(TC, { patchManager: this.patchManager });
    });
  }

  /**
   * Native control is always ready (no patches to load).
   */
  override isReady(): boolean {
    return true;
  }
}
