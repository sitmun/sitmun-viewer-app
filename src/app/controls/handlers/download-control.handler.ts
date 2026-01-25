import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { SitnaApiService } from '../../services/sitna-api.service';
import { UIStateService } from '../../services/ui-state.service';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

/**
 * Handler for the native SITNA download control.
 * Allows users to download map images and data.
 *
 * Control Type: sitna.download
 * Patches: None (native SITNA control)
 * Configuration: div + optional parameters (e.g., deselectableTab)
 */
@Injectable({
  providedIn: 'root'
})
export class DownloadControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.download';
  readonly sitnaConfigKey = 'download';
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
