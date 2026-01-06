import { Injectable } from '@angular/core';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';
import { AppCfg, AppTasks } from '@api/model/app-cfg';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import { UIStateService } from '../../services/ui-state.service';

/**
 * Handler for the native SITNA download control.
 * Allows users to download map images and data.
 *
 * Control Type: sitna.download
 * Patches: None (native SITNA control)
 * Configuration: div + optional parameters (e.g., deselectableTab)
 */
@Injectable({
  providedIn: 'root'
})
export class DownloadControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.download';
  readonly sitnaConfigKey = 'download';
  readonly requiredPatches = undefined; // No patches needed

  constructor(
    tcNamespaceService: TCNamespaceService,
    private uiStateService: UIStateService
  ) {
    super(tcNamespaceService);
  }

  /**
   * Build configuration for download control.
   * Uses default div if no parameters provided, otherwise merges parameters.
   * Enables tools button when download control is configured.
   */
  buildConfiguration(
    task: AppTasks,
    context: AppCfg
  ): SitnaControlConfig | null {
    const defaultConfig = this.getDefaultConfig();
    const config = this.mergeWithParameters(defaultConfig, task.parameters);

    // Enable tools button when download control is configured
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
