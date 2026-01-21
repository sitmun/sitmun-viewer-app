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
   * Auto-enable attribution when attribution text is configured.
   * Returns default config (if it defines a div) or true to enable with SITNA default.
   */
  override getDefaultValueWhenMissing(): SitnaControlConfig | boolean {
    const attributionText = this.appConfigService.getAttribution?.();
    if (!attributionText) {
      return false;
    }

    const defaultConfig = this.appConfigService.getControlDefault(
      this.controlIdentifier
    );
    if (defaultConfig && defaultConfig.div) {
      return defaultConfig;
    }

    return true;
  }
}
