import { Injectable } from '@angular/core';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';
import { AppCfg, AppTasks } from '@api/model/app-cfg';
import { TCNamespaceService } from '../../services/tc-namespace.service';

/**
 * Handler for the native SITNA threeD control.
 * Creates a toggle button to switch between 2D and 3D map views.
 * 
 * Control Type: sitna.threed
 * SITNA Key: threeD (explicit)
 * Patches: None (native SITNA control)
 * Configuration: Auto-placement (returns true)
 * 
 * The control is auto-placed by SITNA, we don't specify a div.
 * Example: SITNA.Cfg.controls.threeD = true;
 * 
 * Note: This handler only enables the toggle button.
 * The 3D view configuration (SITNA.Cfg.views.threeD) is handled by MapConfigurationService.
 */
@Injectable({
  providedIn: 'root'
})
export class ThreeDControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.threed';
  readonly sitnaConfigKey = 'threeD';  // Explicit SITNA name
  readonly requiredPatches = undefined; // No patches required - native SITNA control

  constructor(tcNamespaceService: TCNamespaceService) {
    super(tcNamespaceService);
  }

  /**
   * Build configuration for threeD control.
   * Returns true to enable with auto-placement (SITNA decides where it goes).
   * 
   * @param task - Task from backend
   * @param context - Full app configuration
   * @returns true (enables control with auto-placement)
   */
  buildConfiguration(task: AppTasks, context: AppCfg): SitnaControlConfig | null {
    // Always return true for auto-placement (no div specification)
    // SITNA will place the control in its default location
    return true as any;
  }
}

