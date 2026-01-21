import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { TCNamespaceService } from '../../services/tc-namespace.service';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';
import {
  applyFeatureStylerPatches,
  applyModifyPatches
} from '../utils/sitna-patch-helpers';

/**
 * Handler for the native SITNA featureInfo control.
 * Allows users to click on map features to view their information.
 *
 * Control Type: sitna.featureInfo
 * Patches: None (native SITNA control)
 * Configuration: Optional parameters (active, persistentHighlights, displayElevation, etc.)
 *
 * Elevation Display:
 * - Set `displayElevation: true` in controlDefaults or task parameters to enable elevation in popup
 * - Elevation values are fetched from elevation services configured at map level or control level
 * - If `displayElevation` is boolean true, uses map's elevation tool or creates default elevation tool
 * - If `displayElevation` is an object, uses that configuration for elevation services
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
   * Load patches for featureInfo control.
   * Adds diagnostic logging to verify displayElevation option is set correctly.
   * Also patches FeatureStyler to prevent errors when setStrokeColor/setFillColor
   * are called before the component has fully rendered its DOM elements.
   */
  override async loadPatches(_context: AppCfg): Promise<void> {
    await this.waitForTCAndApply(async (TC) => {
      // Apply FeatureStyler patches with cleanup registration
      applyFeatureStylerPatches(TC, { patchManager: this.patchManager });

      // Apply Modify patches with cleanup registration
      applyModifyPatches(TC, { patchManager: this.patchManager });

      // Patch Map.addControl to intercept featureInfo control creation and ensure options are passed
      // Also ensure patches are applied before any control is added (race condition guard)
      const originalAddControl = TC.Map.prototype.addControl;
      TC.Map.prototype.addControl = async function (
        control: any,
        options: any
      ) {
        // Ensure FeatureStyler is patched before adding any control
        // This is critical because control creation might trigger FeatureStyler methods
        // No patchManager here - these are guard patches that persist until reload
        applyFeatureStylerPatches(TC, {});
        applyModifyPatches(TC, {});

        // Intercept featureInfo control creation
        if (control === 'featureInfo' || control === 'FeatureInfo') {
          // If options are missing displayElevation, get it from map config
          if (
            (!options || options.displayElevation === undefined) &&
            this.options?.controls?.featureInfo
          ) {
            const mapConfig = this.options.controls.featureInfo;
            if (
              typeof mapConfig === 'object' &&
              mapConfig !== null &&
              (mapConfig as any).displayElevation !== undefined
            ) {
              options = TC.Util.extend(true, {}, options || {}, mapConfig);
            }
          }
        }
        const result = await originalAddControl.call(this, control, options);
        return result;
      };

      // Patch FeatureInfo register to restore displayElevation from map config if still missing
      // This is a fallback in case the constructor patch didn't work
      const originalRegister = TC.control.FeatureInfo.prototype.register;
      TC.control.FeatureInfo.prototype.register = async function (map: any) {
        // If displayElevation is missing but should be set, restore it from map config
        if (
          this.options?.displayElevation === undefined &&
          map?.options?.controls?.featureInfo
        ) {
          const mapConfig = map.options.controls.featureInfo;
          if (
            typeof mapConfig === 'object' &&
            mapConfig !== null &&
            (mapConfig as any).displayElevation !== undefined
          ) {
            // Merge the map config options into control options
            this.options = TC.Util.extend(true, {}, this.options, mapConfig);
          }
        }

        const result = await originalRegister.call(this, map);
        return result;
      };
    });
  }

  /**
   * Build configuration for featureInfo control.
   * Uses default config if no parameters provided, otherwise merges parameters.
   */
  buildConfiguration(
    task: AppTasks,
    _context: AppCfg
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
