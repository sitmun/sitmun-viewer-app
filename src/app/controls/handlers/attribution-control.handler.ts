import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { TCNamespaceService } from '../../services/tc-namespace.service';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

/**
 * Handler for the native SITNA attribution control.
 * Simple control with no patches required.
 *
 * Control Type: sitna.attribution
 * Patches: None (native SITNA control)
 * Configuration: Simple div + optional parameters
 *
 * **Attribution Text vs Control:**
 * - Attribution text is configured separately in app-config.json and passed to SITNA map options
 * - Attribution control (this handler) enables/disables the SITNA attribution widget
 * - The control can work with or without a div parameter (SITNA uses default if not provided)
 * - Auto-enable: If attribution text exists in app-config.json but no backend task exists,
 *   ControlRegistryService will automatically enable this control
 */
@Injectable({
  providedIn: 'root'
})
export class AttributionControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.attribution';
  readonly sitnaConfigKey = 'attribution';
  readonly requiredPatches = undefined; // No patches needed

  constructor(tcNamespaceService: TCNamespaceService) {
    super(tcNamespaceService);
  }

  /**
   * Build configuration for attribution control.
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

  /**
   * Attribution has special auto-enable logic:
   * If attribution TEXT is configured in app-config.json (not just a div),
   * auto-enable the control even without a backend task.
   * Otherwise, explicitly disable it.
   */
  override getDefaultValueWhenMissing(): any {
    // Check if attribution TEXT is configured in app-config.json
    const attribution = this.appConfigService.getAttribution();

    if (attribution) {
      // Attribution text exists → auto-enable control with default config
      const defaultConfig = this.getDefaultConfig(); // Gets div if configured
      return defaultConfig && Object.keys(defaultConfig).length > 0
        ? defaultConfig
        : true; // Return config with div, or just true
    }

    // No attribution text → explicitly disable control
    return false;
  }
}
