import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { SitnaApiService } from '../../services/sitna-api.service';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

/**
 * Handler for the native SITNA coordinates control.
 *
 * Control Type: sitna.coordinates
 * Configuration: Simple div + optional parameters
 */
@Injectable({
  providedIn: 'root'
})
export class CoordinatesControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.coordinates';
  readonly sitnaConfigKey = 'coordinates';
  readonly requiredPatches = undefined;

  constructor(sitnaApi: SitnaApiService) {
    super(sitnaApi);
  }

  /**
   * Build configuration for coordinates control.
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
   * Check if coordinates control is ready.
   */
  override isReady(): boolean {
    return super.isReady();
  }
}
