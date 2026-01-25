import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { SitnaApiService } from '../../services/sitna-api.service';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

/**
 * Handler for the native SITNA WFSQuery control.
 * Enables alphanumeric queries on WFS layers from the workLayerManager control.
 *
 * Control Type: sitna.WFSQuery
 * Patches: None (native SITNA control)
 * Configuration: boolean | WFSQueryOptions
 *
 * Supported options (from SITNA 4.8):
 * - styles?: VectorStyleOptions - Style options for query result geometries
 * - highlightStyles?: VectorStyleOptions - Style options for highlighted geometries
 * - highLightStyles?: VectorStyleOptions - Legacy alias (capital L) for highlightStyles
 *
 * If no parameters are provided, returns boolean true to enable the control.
 * If parameters are provided, returns an options object with the provided properties.
 */
@Injectable({
  providedIn: 'root'
})
export class WFSQueryControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.WFSQuery';
  readonly sitnaConfigKey = 'WFSQuery';
  readonly requiredPatches = undefined; // No patches needed

  constructor(sitnaApi: SitnaApiService) {
    super(sitnaApi);
  }

  /**
   * Build configuration for WFSQuery control.
   * Returns boolean true if no parameters, otherwise returns options object.
   * Supports styles, highlightStyles, and legacy highLightStyles alias.
   */
  override buildConfiguration(
    task: AppTasks,
    _context: AppCfg
  ): SitnaControlConfig | null {
    // If parameters exist, return options object (pass through all keys)
    if (!this.areParametersEmpty(task.parameters)) {
      return this.mergeWithParameters({}, task.parameters);
    }
    // Otherwise return boolean true to enable control
    return true as any;
  }
}
