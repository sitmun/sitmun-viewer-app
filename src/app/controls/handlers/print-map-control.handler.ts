import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { SitnaApiService } from '../../services/sitna-api.service';
import { UIStateService } from '../../services/ui-state.service';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

/**
 * Handler for the native SITNA print map control.
 * Allows users to print the current map view with optional logo and legend.
 *
 * Control Type: sitna.printMap
 * Patches: None (native SITNA control)
 * Configuration: div + optional parameters (logo, legend)
 */
@Injectable({
  providedIn: 'root'
})
export class PrintMapControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.printMap';
  readonly sitnaConfigKey = 'printMap';
  readonly requiredPatches = undefined; // No patches needed

  constructor(
    sitnaApi: SitnaApiService,
    private uiStateService: UIStateService
  ) {
    super(sitnaApi);
  }

  /**
   * Build configuration for print map control.
   * Uses default config from app-config.json if no parameters provided, otherwise merges parameters.
   * Enables tools button when print map control is configured.
   * Supports optional parameters: logo, legend
   */
  buildConfiguration(
    task: AppTasks,
    _context: AppCfg
  ): SitnaControlConfig | null {
    const defaultConfig = this.getDefaultConfig();
    const config = this.mergeWithParameters(defaultConfig, task.parameters);

    // Enable tools button when print map control is configured
    this.uiStateService.enableToolsButton();

    return config;
  }

  /**
   * Load patches for native print map control.
   * No patches needed - SITNA handles pdfmake loading internally.
   * Using pdfmake 0.1.70 for compatibility with SITNA's expected module structure.
   */
  override async loadPatches(_context: AppCfg): Promise<void> {
    // TC is guaranteed available after guard - just verify it's accessible
    this.sitnaApi.getTC();
  }

  /**
   * Check if native print map control is ready.
   */
  override isReady(): boolean {
    const TC = this.sitnaApi.getTC();
    return !!TC?.control?.PrintMap;
  }
}
