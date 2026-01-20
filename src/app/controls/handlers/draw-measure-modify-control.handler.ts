import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { TCNamespaceService } from '../../services/tc-namespace.service';
import { UIStateService } from '../../services/ui-state.service';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

/**
 * Handler for the native SITNA drawMeasureModify control.
 * Allows users to draw, measure, and modify features on the map.
 *
 * Control Type: sitna.drawMeasureModify
 * Patches: FeatureStyler.setStrokeColorWatch and setFillColorWatch to prevent
 *          errors when called before component rendering completes
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
  buildConfiguration(
    task: AppTasks,
    _context: AppCfg
  ): SitnaControlConfig | null {
    const defaultConfig = this.getDefaultConfig();
    const config = this.mergeWithParameters(defaultConfig, task.parameters);

    // Enable tools button when drawMeasureModify control is configured
    this.uiStateService.enableToolsButton();

    return config;
  }

  /**
   * Load patches for drawMeasureModify control.
   * Patches FeatureStyler to prevent errors when setStrokeColor/setFillColor
   * are called before the component has fully rendered its DOM elements.
   * Also patches Modify.displayLabelText to prevent errors when #textInput is undefined.
   */
  override async loadPatches(_context: AppCfg): Promise<void> {
    await this.waitForTCAndApply(async (TC) => {
      // Patch Modify.displayLabelText to handle case where #textInput is undefined
      // The error occurs inside renderPromise().then() callback, so we patch renderPromise
      // to ensure promise rejections are caught
      const ModifyProto = TC?.control?.Modify?.prototype;
      if (ModifyProto && !(ModifyProto as any).__sitmunModifyPatched) {
        // Patch renderPromise to wrap .then() calls with error handling
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
                  ? function (this: any, value: any) {
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

        // Mark as patched
        (ModifyProto as any).__sitmunModifyPatched = true;

        // Register cleanup
        this.patchManager.add(() => {
          if (originalRenderPromise) {
            ModifyProto.renderPromise = originalRenderPromise;
          }
          delete (ModifyProto as any).__sitmunModifyPatched;
        });
      }

      const FeatureStylerProto = TC?.control?.FeatureStyler?.prototype;
      if (!FeatureStylerProto) {
        return;
      }

      // Guard flag to prevent re-patching
      if ((FeatureStylerProto as any).__sitmunFeatureStylerPatched) {
        return;
      }

      // Patch setStrokeColorWatch to check if color picker exists
      // This prevents errors when setStrokeColor is called before the component renders
      const originalSetStrokeColorWatch =
        FeatureStylerProto.setStrokeColorWatch;
      if (originalSetStrokeColorWatch) {
        FeatureStylerProto.setStrokeColorWatch = function (color: any) {
          const self = this as any;
          // Check if stroke color picker element exists by querying DOM
          // The selector is '.tc-ctl-fstyler-str-c' (from FeatureStyler.js line 179)
          // We check the DOM because the private field #strokeColorPicker might not be set yet
          const strokeColorPicker = self.querySelector?.(
            '.tc-ctl-fstyler-str-c'
          );
          if (!strokeColorPicker) {
            // Color picker not initialized yet, skip silently
            // This prevents "Cannot set properties of undefined (setting 'value')" error
            // The color will be set when the component renders and initializes the pickers
            return self;
          }
          // Element exists, proceed with original method
          return originalSetStrokeColorWatch.call(self, color);
        };
      }

      // Patch setFillColorWatch to check if color picker exists
      // This prevents errors when setFillColor is called before the component renders
      const originalSetFillColorWatch = FeatureStylerProto.setFillColorWatch;
      if (originalSetFillColorWatch) {
        FeatureStylerProto.setFillColorWatch = function (color: any) {
          const self = this as any;
          // Check if fill color picker element exists by querying DOM
          // The selector is '.tc-ctl-fstyler-fll-c' (from FeatureStyler.js line 182)
          // We check the DOM because the private field #fillColorPicker might not be set yet
          const fillColorPicker = self.querySelector?.('.tc-ctl-fstyler-fll-c');
          if (!fillColorPicker) {
            // Color picker not initialized yet, skip silently
            // This prevents "Cannot set properties of undefined (setting 'value')" error
            // The color will be set when the component renders and initializes the pickers
            return self;
          }
          // Element exists, proceed with original method
          return originalSetFillColorWatch.call(self, color);
        };
      }

      // Mark as patched
      (FeatureStylerProto as any).__sitmunFeatureStylerPatched = true;

      // Register cleanup
      this.patchManager.add(() => {
        if (originalSetStrokeColorWatch) {
          FeatureStylerProto.setStrokeColorWatch = originalSetStrokeColorWatch;
        }
        if (originalSetFillColorWatch) {
          FeatureStylerProto.setFillColorWatch = originalSetFillColorWatch;
        }
        delete (FeatureStylerProto as any).__sitmunFeatureStylerPatched;
      });
    });
  }

  /**
   * Native control is always ready (no patches to load).
   */
  override isReady(): boolean {
    return true;
  }
}
