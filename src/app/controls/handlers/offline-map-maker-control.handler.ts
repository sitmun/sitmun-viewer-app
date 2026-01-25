import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { SitnaApiService } from '../../services/sitna-api.service';
import { UIStateService } from '../../services/ui-state.service';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

/**
 * Handler for the native SITNA offline map maker control.
 * Allows users to create and manage offline maps for use without internet connection.
 *
 * Control Type: sitna.offlineMapMaker
 * Patches: None (native SITNA control)
 * Configuration: div + optional parameters (averageTileSize, offlineMapHintDiv)
 */
@Injectable({
  providedIn: 'root'
})
export class OfflineMapMakerControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.offlineMapMaker';
  readonly sitnaConfigKey = 'offlineMapMaker';
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
