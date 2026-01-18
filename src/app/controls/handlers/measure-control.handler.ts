import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { TCNamespaceService } from '../../services/tc-namespace.service';
import { UIStateService } from '../../services/ui-state.service';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

/**
 * Handler for the native SITNA measure control.
 * Allows users to measure distances and areas on the map.
 *
 * Control Type: sitna.measure
 * Patches: None (native SITNA control)
 * Configuration: div + optional parameters
 */
@Injectable({
  providedIn: 'root'
})
export class MeasureControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.measure';
  readonly sitnaConfigKey = 'measure';
  readonly requiredPatches = undefined; // No patches needed

  constructor(
    tcNamespaceService: TCNamespaceService,
    private uiStateService: UIStateService
  ) {
    super(tcNamespaceService);
  }

  /**
   * Build configuration for measure control.
   * Uses default div if no parameters provided, otherwise merges parameters.
   * Enables tools button when measure control is configured.
   */
  buildConfiguration(
    task: AppTasks,
    _context: AppCfg
  ): SitnaControlConfig | null {
    const defaultConfig = this.getDefaultConfig();
    const config = this.mergeWithParameters(defaultConfig, task.parameters);

    // Enable tools button when measure control is configured
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
