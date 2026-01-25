import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { SitnaApiService } from '../../services/sitna-api.service';
import { UIStateService } from '../../services/ui-state.service';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

/**
 * Handler for the native SITNA multiFeatureInfo control.
 * Displays feature information for multiple features with different interaction modes.
 *
 * Control Type: sitna.multiFeatureInfo
 * Patches: None (native SITNA control)
 * Configuration: div + optional parameters (active, persistentHighlights, share, modes)
 */
@Injectable({
  providedIn: 'root'
})
export class MultiFeatureInfoControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.multiFeatureInfo';
  readonly sitnaConfigKey = 'multiFeatureInfo';
  readonly requiredPatches = undefined; // No patches needed

  constructor(
    sitnaApi: SitnaApiService,
    private uiStateService: UIStateService
  ) {
    super(sitnaApi);
  }

  /**
   * Build configuration for multiFeatureInfo control.
   * Uses default div from app-config.json and merges with task parameters.
   * Enables tools button when multiFeatureInfo control is configured.
   */
  override buildConfiguration(
    task: AppTasks,
    _context: AppCfg
  ): SitnaControlConfig | null {
    const config = this.mergeWithParameters(
      this.getDefaultConfig(),
      task.parameters
    );
    this.uiStateService.enableToolsButton();
    return config;
  }
}
