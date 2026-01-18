import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { TCNamespaceService } from '../../services/tc-namespace.service';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

/**
 * Handler for the native SITNA scale bar control.
 * Simple control with no patches required.
 *
 * Control Type: sitna.scaleBar
 * Patches: None (native SITNA control)
 * Configuration: Simple div + optional parameters
 */
@Injectable({
  providedIn: 'root'
})
export class ScaleBarControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.scaleBar';
  readonly sitnaConfigKey = 'scaleBar';
  readonly requiredPatches = undefined; // No patches needed

  constructor(tcNamespaceService: TCNamespaceService) {
    super(tcNamespaceService);
  }

  /**
   * Build configuration for scale bar control.
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
