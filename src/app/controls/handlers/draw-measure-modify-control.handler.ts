import { Injectable } from '@angular/core';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';
import { AppCfg, AppTasks } from '@api/model/app-cfg';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import { UIStateService } from '../../services/ui-state.service';

/**
 * Handler for the native SITNA drawMeasureModify control.
 * Allows users to draw, measure, and modify features on the map.
 * 
 * Control Type: sitna.drawMeasureModify
 * Patches: None (native SITNA control)
 * Configuration: div + optional parameters
 */
@Injectable({
  providedIn: 'root'
})
export class DrawMeasureModifyControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.drawMeasureModify';
  readonly sitnaConfigKey = 'drawMeasureModify';
  readonly requiredPatches = undefined; // No patches needed

  constructor(
    tcNamespaceService: TCNamespaceService,
    private uiStateService: UIStateService
  ) {
    super(tcNamespaceService);
  }

  /**
   * Build configuration for drawMeasureModify control.
   * Uses default div if no parameters provided, otherwise merges parameters.
   * Enables tools button when drawMeasureModify control is configured.
   */
  buildConfiguration(task: AppTasks, context: AppCfg): SitnaControlConfig | null {
    const defaultConfig = this.getDefaultConfig();
    const config = this.mergeWithParameters(defaultConfig, task.parameters);

    // Enable tools button when drawMeasureModify control is configured
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

