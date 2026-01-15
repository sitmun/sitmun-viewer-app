import { Injectable } from '@angular/core';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';
import { AppCfg, AppTasks } from '@api/model/app-cfg';
import { TCNamespaceService } from '../../services/tc-namespace.service';

/**
 * Handler for the native SITNA featureInfo control.
 * Allows users to click on map features to view their information.
 *
 * Control Type: sitna.featureInfo
 * Patches: None (native SITNA control)
 * Configuration: Optional parameters (active, persistentHighlights, etc.)
 */
@Injectable({
  providedIn: 'root'
})
export class FeatureInfoControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.featureInfo';
  readonly sitnaConfigKey = 'featureInfo';
  readonly requiredPatches = undefined; // No patches needed

  constructor(tcNamespaceService: TCNamespaceService) {
    super(tcNamespaceService);
  }

  /**
   * Build configuration for featureInfo control.
   * Uses default config if no parameters provided, otherwise merges parameters.
   */
  buildConfiguration(
    task: AppTasks,
    context: AppCfg
  ): SitnaControlConfig | null {
    const defaultConfig = this.getDefaultConfig();
    const config = this.mergeWithParameters(defaultConfig, task.parameters);

    return config;
  }

  /**
   * Native control is always ready (no patches to load).
   */
  override isReady(): boolean {
    return true;
  }
}
