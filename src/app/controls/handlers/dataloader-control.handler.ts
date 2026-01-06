import { Injectable } from '@angular/core';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';
import { AppCfg, AppTasks } from '@api/model/app-cfg';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import { UIStateService } from '../../services/ui-state.service';

/**
 * Handler for the native SITNA dataLoader control.
 * Allows users to load data layers via WMS suggestions and drag-and-drop.
 *
 * Control Type: sitna.dataLoader
 * Patches: None (native SITNA control)
 * Configuration: div + optional wmsSuggestions and enableDragAndDrop parameters
 */
@Injectable({
  providedIn: 'root'
})
export class DataLoaderControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.dataLoader';
  readonly sitnaConfigKey = 'dataLoader';
  readonly requiredPatches = undefined; // No patches needed

  constructor(
    tcNamespaceService: TCNamespaceService,
    private uiStateService: UIStateService
  ) {
    super(tcNamespaceService);
  }

  /**
   * Build configuration for dataLoader control.
   * Always sets div to 'xdata' and handles optional parameters:
   * - wmsSuggestions: Array of WMS group options
   * - enableDragAndDrop: Boolean (defaults to true if not specified)
   */
  buildConfiguration(
    task: AppTasks,
    context: AppCfg
  ): SitnaControlConfig | null {
    const defaultConfig = this.getDefaultConfig();

    // Always set div to 'xdata' (required by SITNA)
    const config: SitnaControlConfig = {
      div: 'xdata'
    };

    // If parameters are empty, return minimal config
    if (this.areParametersEmpty(task.parameters)) {
      this.uiStateService.enableToolsButton();
      return config;
    }

    // Include wmsSuggestions if provided
    if (task.parameters.wmsSuggestions) {
      config['wmsSuggestions'] = task.parameters.wmsSuggestions;
    }

    // Handle enableDragAndDrop: use provided value or default to true
    if (task.parameters.enableDragAndDrop !== undefined) {
      config['enableDragAndDrop'] = task.parameters.enableDragAndDrop;
    } else {
      // If the dataloader is enabled, drag and drop is enabled by default
      config['enableDragAndDrop'] = true;
    }

    // Enable tools button when dataLoader is configured
    this.uiStateService.enableToolsButton();

    return config;
  }
}
