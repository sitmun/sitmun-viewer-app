import { Injectable } from '@angular/core';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';
import { AppCfg, AppTasks } from '@api/model/app-cfg';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import { UIStateService } from '../../services/ui-state.service';

/**
 * Handler for the native SITNA multiFeatureInfo control.
 * Displays feature information for multiple features with different interaction modes.
 *
 * Control Type: sitna.multiFeatureInfo
 * Patches: None (native SITNA control)
 * Configuration: div + optional parameters (active, persistentHighlights, share, modes)
 */
@Injectable({
  providedIn: 'root'
})
export class MultiFeatureInfoControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.multiFeatureInfo';
  readonly sitnaConfigKey = 'multiFeatureInfo';
  readonly requiredPatches = undefined; // No patches needed

  constructor(
    tcNamespaceService: TCNamespaceService,
    private uiStateService: UIStateService
  ) {
    super(tcNamespaceService);
  }

  /**
   * Build configuration for multiFeatureInfo control.
   * Uses default div from app-config.json and merges with task parameters.
   * Enables tools button when multiFeatureInfo control is configured.
   */
  buildConfiguration(
    task: AppTasks,
    context: AppCfg
  ): SitnaControlConfig | null {
    // Get structural config (div) from app-config.json
    const defaultConfig = this.getDefaultConfig();

    // Build complete default configuration with hardcoded behavior defaults
    const completeDefaultConfig: SitnaControlConfig = {
      ...defaultConfig,
      active: true,
      persistentHighlights: true,
      share: true,
      modes: {
        point: {
          active: true
        },
        polyline: {
          active: true
        },
        polygon: {
          active: true
        }
      }
    };

    // Merge with task parameters (allows backend to override specific fields)
    const config = this.mergeWithParameters(
      completeDefaultConfig,
      task.parameters
    );

    // Enable tools button when multiFeatureInfo control is configured
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
