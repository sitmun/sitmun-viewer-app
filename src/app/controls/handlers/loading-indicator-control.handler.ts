import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { TCNamespaceService } from '../../services/tc-namespace.service';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

/**
 * Handler for the native SITNA loadingIndicator control.
 * Map-level control that displays loading state indicators dynamically on the map.
 *
 * Control Type: sitna.loadingIndicator
 * Patches: None (native SITNA control)
 * Configuration: Boolean true by default, or object with optional parameters
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingIndicatorControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.loadingIndicator';
  readonly sitnaConfigKey = 'loadingIndicator';
  readonly requiredPatches = undefined; // No patches needed

  constructor(tcNamespaceService: TCNamespaceService) {
    super(tcNamespaceService);
  }

  /**
   * Build configuration for loadingIndicator control.
   * Returns boolean true by default (enables loading indicator).
   * Returns config object if custom parameters are provided.
   */
  buildConfiguration(
    task: AppTasks,
    _context: AppCfg
  ): SitnaControlConfig | null {
    // If no parameters provided, return true (boolean) - matches legacy behavior
    if (this.areParametersEmpty(task.parameters)) {
      return true as any; // Cast to satisfy SitnaControlConfig return type
    }

    // If parameters provided, return merged config object
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
