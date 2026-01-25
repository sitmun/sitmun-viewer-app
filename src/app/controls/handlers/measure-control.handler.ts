import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { SitnaApiService } from '../../services/sitna-api.service';
import { UIStateService } from '../../services/ui-state.service';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

/**
 * Handler for the native SITNA measure control.
 * Allows users to measure distances and areas on the map.
 *
 * Control Type: sitna.measure
 * Patches: None (native SITNA control)
 * Configuration: div + optional parameters
 */
@Injectable({
  providedIn: 'root'
})
export class MeasureControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.measure';
  readonly sitnaConfigKey = 'measure';
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
