import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { SitnaApiService } from '../../services/sitna-api.service';
import { UIStateService } from '../../services/ui-state.service';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

/**
 * Handler for the native SITNA print map control.
 * Allows users to print the current map view with optional logo and legend.
 *
 * Control Type: sitna.printMap
 * Patches: None (native SITNA control)
 * Configuration: div + optional parameters (logo, legend)
 */
@Injectable({
  providedIn: 'root'
})
export class PrintMapControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.printMap';
  readonly sitnaConfigKey = 'printMap';
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
