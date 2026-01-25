import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { SitnaApiService } from '../../services/sitna-api.service';
import { UIStateService } from '../../services/ui-state.service';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

/**
 * Handler for the native SITNA geolocation control.
 * Provides GPS positioning and location tracking capabilities.
 *
 * Control Type: sitna.geolocation
 * Patches: None (native SITNA control)
 * Configuration: div + optional parameters
 */
@Injectable({
  providedIn: 'root'
})
export class GeolocationControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.geolocation';
  readonly sitnaConfigKey = 'geolocation';
  readonly requiredPatches = undefined; // No patches needed

  constructor(
    sitnaApi: SitnaApiService,
    private uiStateService: UIStateService
  ) {
    super(sitnaApi);
  }

  /**
   * Build configuration for geolocation control.
   * Uses default div if no parameters provided, otherwise merges parameters.
   * Enables tools button when geolocation control is configured.
   */
  buildConfiguration(
    task: AppTasks,
    _context: AppCfg
  ): SitnaControlConfig | null {
    const defaultConfig = this.getDefaultConfig();
    const config = this.mergeWithParameters(defaultConfig, task.parameters);

    // Enable tools button when geolocation control is configured
    this.uiStateService.enableToolsButton();

    return config;
  }

  /**
   * Native control is always ready (no patches to load).
   */
  override isReady(): boolean {
    return true;
  }
}
