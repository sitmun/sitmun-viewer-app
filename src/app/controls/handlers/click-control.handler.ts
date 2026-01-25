import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { SitnaApiService } from '../../services/sitna-api.service';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

/**
 * Handler for the native SITNA click control.
 * Simple boolean control that enables/disables map click interactions.
 *
 * Control Type: sitna.click
 * Patches: None (native SITNA control)
 * Configuration: Pure boolean (true to enable, false to disable)
 *
 * **Note:** SITNA API documentation indicates there is a `ClickOptions` interface,
 * but SITMUN has always used this control as a pure boolean. If ClickOptions
 * are needed in the future, the handler and TypeScript interfaces would need
 * to be updated to support both boolean and config object patterns.
 */
@Injectable({
  providedIn: 'root'
})
export class ClickControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.click';
  readonly sitnaConfigKey = 'click';
  readonly requiredPatches = undefined; // No patches needed

  constructor(sitnaApi: SitnaApiService) {
    super(sitnaApi);
  }

  /**
   * Build configuration for click control.
   * Returns boolean true to enable click handling.
   * Pure boolean control - no parameters are handled.
   */
  override buildConfiguration(
    _task: AppTasks,
    _context: AppCfg
  ): SitnaControlConfig | null {
    // Pure boolean control - just return true to enable
    return true as any;
  }
}
