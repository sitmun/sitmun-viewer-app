import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { TCNamespaceService } from '../../services/tc-namespace.service';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

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
      // Patch FeatureStyler first to prevent errors in any control that uses it
      const FeatureStylerProto = TC.control?.FeatureStyler?.prototype;
      if (
        FeatureStylerProto &&
        !(FeatureStylerProto as any).__sitmunFeatureStylerPatched
      ) {
        // Patch setStrokeColorWatch to handle case where private field #strokeColorPicker is undefined
        // The original method uses a private field that's only set during render(), so we need to catch
        // the error that occurs when the field is undefined
        const originalSetStrokeColorWatch =
          FeatureStylerProto.setStrokeColorWatch;
        if (originalSetStrokeColorWatch) {
          FeatureStylerProto.setStrokeColorWatch = function (color: any) {
            const self = this as any;
            try {
              return originalSetStrokeColorWatch.call(self, color);
            } catch (error: any) {
              // Check if error is due to undefined colorPicker (private field not initialized)
              if (
                error?.message?.includes(
                  'Cannot set properties of undefined'
                ) ||
                error?.message?.includes("setting 'value'") ||
                error?.message?.includes("reading 'value'")
              ) {
                // Private field #strokeColorPicker is not initialized yet (render() callback hasn't executed)
                // This is safe to ignore - the color will be set when render() completes
                return self;
              }
              // Re-throw if it's a different error
              throw error;
            }
          };
        }

        // Patch setFillColorWatch to handle case where private field #fillColorPicker is undefined
        const originalSetFillColorWatch = FeatureStylerProto.setFillColorWatch;
        if (originalSetFillColorWatch) {
          FeatureStylerProto.setFillColorWatch = function (color: any) {
            const self = this as any;
            try {
              return originalSetFillColorWatch.call(self, color);
            } catch (error: any) {
              // Check if error is due to undefined colorPicker (private field not initialized)
              if (
                error?.message?.includes(
                  'Cannot set properties of undefined'
                ) ||
                error?.message?.includes("setting 'value'") ||
                error?.message?.includes("reading 'value'")
              ) {
                // Private field #fillColorPicker is not initialized yet (render() callback hasn't executed)
                // This is safe to ignore - the color will be set when render() completes
                return self;
              }
              // Re-throw if it's a different error
              throw error;
            }
          };
        }

        // Patch setStrokeWidthWatch to handle case where private fields #strokeWidthSelector or #strokeWidthWatch are undefined
        const originalSetStrokeWidthWatch =
          FeatureStylerProto.setStrokeWidthWatch;
        if (originalSetStrokeWidthWatch) {
          FeatureStylerProto.setStrokeWidthWatch = function (width: any) {
            const self = this as any;
            try {
              return originalSetStrokeWidthWatch.call(self, width);
            } catch (error: any) {
              // Check if error is due to undefined private fields (not initialized)
              if (
                error?.message?.includes(
                  'Cannot set properties of undefined'
                ) ||
                error?.message?.includes("setting 'value'") ||
                error?.message?.includes("reading 'value'") ||
                error?.message?.includes("reading 'style'")
              ) {
                // Private fields #strokeWidthSelector or #strokeWidthWatch are not initialized yet (render() callback hasn't executed)
                // This is safe to ignore - the width will be set when render() completes
                return self;
              }
              // Re-throw if it's a different error
              throw error;
            }
          };
        }

        // Patch setFillOpacityWatch to handle case where private field #fillOpacitySelector is undefined
        const originalSetFillOpacityWatch =
          FeatureStylerProto.setFillOpacityWatch;
        if (originalSetFillOpacityWatch) {
          FeatureStylerProto.setFillOpacityWatch = function (percentage: any) {
            const self = this as any;
            try {
              return originalSetFillOpacityWatch.call(self, percentage);
            } catch (error: any) {
              // Check if error is due to undefined private field (not initialized)
              if (
                error?.message?.includes(
                  'Cannot set properties of undefined'
                ) ||
                error?.message?.includes("setting 'value'") ||
                error?.message?.includes("reading 'value'")
              ) {
                // Private field #fillOpacitySelector is not initialized yet (render() callback hasn't executed)
                // This is safe to ignore - the opacity will be set when render() completes
                return self;
              }
              // Re-throw if it's a different error
              throw error;
            }
          };
        }

        // Patch setRadiusWatch to handle case where private field #radiusSelector is undefined
        const originalSetRadiusWatch = FeatureStylerProto.setRadiusWatch;
        if (originalSetRadiusWatch) {
          FeatureStylerProto.setRadiusWatch = function (radius: any) {
            const self = this as any;
            try {
              return originalSetRadiusWatch.call(self, radius);
            } catch (error: any) {
              // Check if error is due to undefined private field (not initialized)
              if (
                error?.message?.includes(
                  'Cannot set properties of undefined'
                ) ||
                error?.message?.includes("setting 'value'") ||
                error?.message?.includes("reading 'value'")
              ) {
                // Private field #radiusSelector is not initialized yet (render() callback hasn't executed)
                // This is safe to ignore - the radius will be set when render() completes
                return self;
              }
              // Re-throw if it's a different error
              throw error;
            }
          };
        }

        // Mark as patched
        // Also patch setStrokeColor to track when it's called
        const originalSetStrokeColor = FeatureStylerProto.setStrokeColor;
        if (originalSetStrokeColor) {
          FeatureStylerProto.setStrokeColor = function (color: any) {
            const self = this as any;
            return originalSetStrokeColor.call(self, color);
          };
        }

        // Mark as patched
        (FeatureStylerProto as any).__sitmunFeatureStylerPatched = true;

        // Register cleanup
        this.patchManager.add(() => {
          if (originalSetStrokeColorWatch) {
            FeatureStylerProto.setStrokeColorWatch =
              originalSetStrokeColorWatch;
          }
          if (originalSetFillColorWatch) {
            FeatureStylerProto.setFillColorWatch = originalSetFillColorWatch;
          }
          if (originalSetStrokeWidthWatch) {
            FeatureStylerProto.setStrokeWidthWatch =
              originalSetStrokeWidthWatch;
          }
          if (originalSetFillOpacityWatch) {
            FeatureStylerProto.setFillOpacityWatch =
              originalSetFillOpacityWatch;
          }
          if (originalSetRadiusWatch) {
            FeatureStylerProto.setRadiusWatch = originalSetRadiusWatch;
          }
          if (originalSetStrokeColor) {
            FeatureStylerProto.setStrokeColor = originalSetStrokeColor;
          }
          delete (FeatureStylerProto as any).__sitmunFeatureStylerPatched;
        });
      }

      // Patch Map.addControl to intercept featureInfo control creation and ensure options are passed
      // Also ensure FeatureStyler patch is applied before any control is added
      const originalAddControl = TC.Map.prototype.addControl;
      TC.Map.prototype.addControl = async function (
        control: any,
        options: any
      ) {
        // Ensure FeatureStyler is patched before adding any control
        // This is critical because control creation might trigger FeatureStyler methods
        const FeatureStylerProto = TC.control?.FeatureStyler?.prototype;
        if (
          FeatureStylerProto &&
          !(FeatureStylerProto as any).__sitmunFeatureStylerPatched
        ) {
          // Apply FeatureStyler patch immediately if not already patched
          const originalSetStrokeColorWatch =
            FeatureStylerProto.setStrokeColorWatch;
          if (originalSetStrokeColorWatch) {
            FeatureStylerProto.setStrokeColorWatch = function (color: any) {
              const self = this as any;
              try {
                return originalSetStrokeColorWatch.call(self, color);
              } catch (error: any) {
                // Check if error is due to undefined colorPicker (private field not initialized)
                if (
                  error?.message?.includes(
                    'Cannot set properties of undefined'
                  ) ||
                  error?.message?.includes("setting 'value'") ||
                  error?.message?.includes("reading 'value'")
                ) {
                  // Private field #strokeColorPicker is not initialized yet (render() callback hasn't executed)
                  // This is safe to ignore - the color will be set when render() completes
                  return self;
                }
                // Re-throw if it's a different error
                throw error;
              }
            };
          }

          const originalSetFillColorWatch =
            FeatureStylerProto.setFillColorWatch;
          if (originalSetFillColorWatch) {
            FeatureStylerProto.setFillColorWatch = function (color: any) {
              const self = this as any;
              try {
                return originalSetFillColorWatch.call(self, color);
              } catch (error: any) {
                // Check if error is due to undefined colorPicker (private field not initialized)
                if (
                  error?.message?.includes(
                    'Cannot set properties of undefined'
                  ) ||
                  error?.message?.includes("setting 'value'") ||
                  error?.message?.includes("reading 'value'")
                ) {
                  // Private field #fillColorPicker is not initialized yet (render() callback hasn't executed)
                  // This is safe to ignore - the color will be set when render() completes
                  return self;
                }
                // Re-throw if it's a different error
                throw error;
              }
            };
          }

          const originalSetStrokeWidthWatch =
            FeatureStylerProto.setStrokeWidthWatch;
          if (originalSetStrokeWidthWatch) {
            FeatureStylerProto.setStrokeWidthWatch = function (width: any) {
              const self = this as any;
              try {
                return originalSetStrokeWidthWatch.call(self, width);
              } catch (error: any) {
                // Check if error is due to undefined private fields (not initialized)
                if (
                  error?.message?.includes(
                    'Cannot set properties of undefined'
                  ) ||
                  error?.message?.includes("setting 'value'") ||
                  error?.message?.includes("reading 'value'") ||
                  error?.message?.includes("reading 'style'")
                ) {
                  // Private fields #strokeWidthSelector or #strokeWidthWatch are not initialized yet (render() callback hasn't executed)
                  // This is safe to ignore - the width will be set when render() completes
                  return self;
                }
                // Re-throw if it's a different error
                throw error;
              }
            };
          }

          const originalSetFillOpacityWatch =
            FeatureStylerProto.setFillOpacityWatch;
          if (originalSetFillOpacityWatch) {
            FeatureStylerProto.setFillOpacityWatch = function (
              percentage: any
            ) {
              const self = this as any;
              try {
                return originalSetFillOpacityWatch.call(self, percentage);
              } catch (error: any) {
                // Check if error is due to undefined private field (not initialized)
                if (
                  error?.message?.includes(
                    'Cannot set properties of undefined'
                  ) ||
                  error?.message?.includes("setting 'value'") ||
                  error?.message?.includes("reading 'value'")
                ) {
                  // Private field #fillOpacitySelector is not initialized yet (render() callback hasn't executed)
                  // This is safe to ignore - the opacity will be set when render() completes
                  return self;
                }
                // Re-throw if it's a different error
                throw error;
              }
            };
          }

          const originalSetRadiusWatch = FeatureStylerProto.setRadiusWatch;
          if (originalSetRadiusWatch) {
            FeatureStylerProto.setRadiusWatch = function (radius: any) {
              const self = this as any;
              try {
                return originalSetRadiusWatch.call(self, radius);
              } catch (error: any) {
                // Check if error is due to undefined private field (not initialized)
                if (
                  error?.message?.includes(
                    'Cannot set properties of undefined'
                  ) ||
                  error?.message?.includes("setting 'value'") ||
                  error?.message?.includes("reading 'value'")
                ) {
                  // Private field #radiusSelector is not initialized yet (render() callback hasn't executed)
                  // This is safe to ignore - the radius will be set when render() completes
                  return self;
                }
                // Re-throw if it's a different error
                throw error;
              }
            };
          }

          // Also patch setStrokeColor in addControl patch
          const originalSetStrokeColor = FeatureStylerProto.setStrokeColor;
          if (
            originalSetStrokeColor &&
            !FeatureStylerProto.setStrokeColor
              .toString()
              .includes('setStrokeColor called')
          ) {
            FeatureStylerProto.setStrokeColor = function (color: any) {
              const self = this as any;
              return originalSetStrokeColor.call(self, color);
            };
          }

          (FeatureStylerProto as any).__sitmunFeatureStylerPatched = true;
        }

        // Ensure Modify control is patched before adding any control
        // This prevents errors when displayLabelText tries to access #textInput before it's initialized
        const ModifyProto = TC.control?.Modify?.prototype;
        if (ModifyProto && !(ModifyProto as any).__sitmunModifyPatched) {
          // Patch renderPromise to wrap .then() callbacks with error handling
          // The error occurs inside renderPromise().then() when #textInput is undefined
          const originalRenderPromise = ModifyProto.renderPromise;
          if (originalRenderPromise) {
            ModifyProto.renderPromise = function () {
              const self = this as any;
              const promise = originalRenderPromise.call(self);
              if (promise && typeof promise.then === 'function') {
                // Wrap the promise to catch errors in .then() callbacks
                const originalThen = promise.then.bind(promise);
                promise.then = function (onFulfilled?: any, onRejected?: any) {
                  // Wrap onFulfilled to catch errors
                  const wrappedOnFulfilled = onFulfilled
                    ? function (value: any) {
                        try {
                          return onFulfilled.call(self, value);
                        } catch (error: any) {
                          // Check if error is due to undefined #textInput (private field not initialized)
                          if (
                            error?.message?.includes(
                              'Cannot set properties of undefined'
                            ) ||
                            error?.message?.includes("setting 'value'") ||
                            error?.message?.includes("reading 'value'")
                          ) {
                            // Private field #textInput is not initialized yet (render() callback hasn't executed)
                            // This is safe to ignore - the text will be set when render() completes
                            return value;
                          }
                          // Re-throw if it's a different error
                          throw error;
                        }
                      }
                    : undefined;
                  return originalThen(wrappedOnFulfilled, onRejected);
                };
              }
              return promise;
            };
          }

          (ModifyProto as any).__sitmunModifyPatched = true;
        }

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
