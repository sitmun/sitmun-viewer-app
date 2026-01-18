import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { TCNamespaceService } from '../../services/tc-namespace.service';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

/**
 * Handler for the native SITNA popup control.
 * Simple control with no patches required.
 *
 * Control Type: sitna.popup
 * Patches: None (native SITNA control)
 * Configuration: Boolean true or config object
 */
@Injectable({
  providedIn: 'root'
})
export class PopupControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.popup';
  readonly sitnaConfigKey = 'popup';
  readonly requiredPatches = undefined; // No patches needed

  constructor(tcNamespaceService: TCNamespaceService) {
    super(tcNamespaceService);
  }

  /**
   * Load patches for native popup control.
   * No-op: native control doesn't need patches.
   */
  override async loadPatches(_context: AppCfg): Promise<void> {
    // Wait for TC namespace to ensure SITNA is ready
    await this.tcNamespaceService.waitForTC();
  }

  /**
   * Build configuration for popup control.
   * Returns true if no parameters, or merges parameters if provided.
   */
  buildConfiguration(
    task: AppTasks,
    _context: AppCfg
  ): SitnaControlConfig | null {
    // If no parameters, return true (boolean config)
    if (this.areParametersEmpty(task.parameters)) {
      return true as any; // Cast to satisfy SitnaControlConfig return type
    }
    // Otherwise return parameters as config object
    return task.parameters as SitnaControlConfig;
  }

  /**
   * Check if native popup control is ready.
   * Verifies that TC.control.Popup exists (native SITNA control).
   */
  override isReady(): boolean {
    const TC = this.tcNamespaceService.getTC();
    return !!TC?.control?.Popup;
  }
}
