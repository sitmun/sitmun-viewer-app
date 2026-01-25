import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { SitnaApiService } from '../../services/sitna-api.service';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

/**
 * Handler for the native SITNA streetView control.
 * Simple control with no patches required.
 *
 * Control Type: sitna.streetView
 * Patches: None (native SITNA control)
 * Configuration: Simple div + optional parameters (e.g., googleMapsKey, viewDiv)
 */
@Injectable({
  providedIn: 'root'
})
export class StreetViewControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.streetView';
  readonly sitnaConfigKey = 'streetView';
  readonly requiredPatches = undefined; // No patches needed

  constructor(sitnaApi: SitnaApiService) {
    super(sitnaApi);
  }

  /**
   * Build configuration for streetView control.
   * Uses default div if no parameters provided.
   */
  buildConfiguration(
    task: AppTasks,
    _context: AppCfg
  ): SitnaControlConfig | null {
    const defaultConfig = this.getDefaultConfig();
    return this.mergeWithParameters(defaultConfig, task.parameters);
  }

  /**
   * Native control is always ready (no patches to load).
   */
  override isReady(): boolean {
    return true;
  }
}
