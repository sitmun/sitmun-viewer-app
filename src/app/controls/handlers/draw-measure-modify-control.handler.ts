import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { SitnaApiService } from '../../services/sitna-api.service';
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
    sitnaApi: SitnaApiService,
    private uiStateService: UIStateService
  ) {
    super(sitnaApi);
  }

  override buildConfiguration(
    task: AppTasks,
    context: AppCfg
  ): SitnaControlConfig | null {
    const config = super.buildConfiguration(task, context);
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
    this.withTC((TC) => {
      // Apply Modify patches with cleanup registration
      applyModifyPatches(TC, { patchManager: this.patchManager });

      // Apply FeatureStyler patches with cleanup registration
      // This now patches all 6 methods (previously only 2)
      applyFeatureStylerPatches(TC, { patchManager: this.patchManager });
    });
  }
}
