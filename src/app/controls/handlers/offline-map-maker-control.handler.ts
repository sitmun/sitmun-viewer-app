import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { TCNamespaceService } from '../../services/tc-namespace.service';
import { UIStateService } from '../../services/ui-state.service';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

/**
 * Handler for the native SITNA offline map maker control.
 * Allows users to create and manage offline maps for use without internet connection.
 *
 * Control Type: sitna.offlineMapMaker
 * Patches: None (native SITNA control)
 * Configuration: div + optional parameters (averageTileSize, offlineMapHintDiv)
 */
@Injectable({
  providedIn: 'root'
})
export class OfflineMapMakerControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.offlineMapMaker';
  readonly sitnaConfigKey = 'offlineMapMaker';
  readonly requiredPatches = undefined; // No patches needed

  constructor(
    tcNamespaceService: TCNamespaceService,
    private uiStateService: UIStateService
  ) {
    super(tcNamespaceService);
  }

  /**
   * Build configuration for offline map maker control.
   * Uses default div if no parameters provided, otherwise merges parameters.
   * Enables tools button when offline map maker control is configured.
   * Supports optional parameters: averageTileSize, offlineMapHintDiv
   */
  buildConfiguration(
    task: AppTasks,
    _context: AppCfg
  ): SitnaControlConfig | null {
    const defaultConfig = this.getDefaultConfig();
    const config = this.mergeWithParameters(defaultConfig, task.parameters);

    // Enable tools button when offline map maker control is configured
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
