import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { TCNamespaceService } from '../../services/tc-namespace.service';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

/**
 * Handler for the native SITNA search control.
 * Simple control with no patches required.
 *
 * Control Type: sitna.search
 * Patches: None (native SITNA control)
 * Configuration: Simple div + optional parameters
 */
@Injectable({
  providedIn: 'root'
})
export class SearchControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.search.silme.extension';
  readonly sitnaConfigKey = 'search';
  readonly requiredPatches = undefined; // No patches needed

  constructor(tcNamespaceService: TCNamespaceService) {
    super(tcNamespaceService);
  }

  /**
   * Build configuration for search control.
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
   * Check if native search control is ready.
   * Verifies that TC.control.Search exists (native SITNA control).
   */
  override isReady(): boolean {
    const TC = this.tcNamespaceService.getTC();
    return !!TC?.control?.Search;
  }
}
