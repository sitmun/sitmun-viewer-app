import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { SitnaApiService } from '../../services/sitna-api.service';
import { UIStateService } from '../../services/ui-state.service';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

/**
 * Handler for the native SITNA drawMeasureModify control.
 * Allows users to draw, measure, and modify features on the map.
 *
 * Control Type: sitna.drawMeasureModify
 * Patches: None (native SITNA control)
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
}
