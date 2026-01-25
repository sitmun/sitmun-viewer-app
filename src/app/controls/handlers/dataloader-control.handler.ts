import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { SitnaApiService } from '../../services/sitna-api.service';
import { UIStateService } from '../../services/ui-state.service';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

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
    sitnaApi: SitnaApiService,
    private uiStateService: UIStateService
  ) {
    super(sitnaApi);
  }

  /**
   * Build configuration for dataLoader control.
   * Defaults (div, enableDragAndDrop) from app-config; task parameters override.
   */
  override buildConfiguration(
    task: AppTasks,
    _context: AppCfg
  ): SitnaControlConfig | null {
    const config = this.mergeWithParameters(
      this.getDefaultConfig(),
      task.parameters
    );
    this.uiStateService.enableToolsButton();
    return config;
  }
}
