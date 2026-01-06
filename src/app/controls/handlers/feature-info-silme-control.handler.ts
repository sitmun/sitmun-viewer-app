import { Injectable } from '@angular/core';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';
import { AppCfg, AppTasks } from '@api/model/app-cfg';
import { TCNamespaceService } from '../../services/tc-namespace.service';

/**
 * Handler for the Silme extension of featureInfo control.
 * Extended version with Silme-specific template and behavior.
 *
 * Control Type: sitna.featureInfo.silme.extension
 * Patches: FeatureInfoSilme.js
 * Configuration: Map-level click handler (no div) - displays feature info in popups
 *
 * Special behavior: When parameters are empty, uses 'featureInfoSilme' config key.
 * When custom parameters are provided, uses 'featureInfo' config key to configure
 * the base FeatureInfo behavior that the Silme extension inherits.
 */
@Injectable({
  providedIn: 'root'
})
export class FeatureInfoSilmeControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.featureInfo.silme.extension';
  readonly sitnaConfigKey = 'featureInfoSilme'; // Default key (can be overridden dynamically)
  readonly requiredPatches = ['assets/js/patch/controls/FeatureInfoSilme.js'];

  private patchLoaded = false;
  private currentTask: AppTasks | null = null;

  constructor(tcNamespaceService: TCNamespaceService) {
    super(tcNamespaceService);
  }

  /**
   * Get the SITNA config key based on task parameters.
   * Returns 'featureInfo' if custom parameters are provided, 'featureInfoSilme' otherwise.
   * This matches the legacy behavior where custom parameters configure the base FeatureInfo.
   */
  getSitnaConfigKey(task?: AppTasks): string {
    if (task && !this.areParametersEmpty(task.parameters)) {
      return 'featureInfo';
    }
    return 'featureInfoSilme';
  }

  /**
   * Load the FeatureInfoSilme patch file.
   * The patch extends TC.control.FeatureInfo with Silme-specific template.
   */
  override async loadPatches(context: AppCfg): Promise<void> {
    if (this.patchLoaded) {
      return;
    }

    // Check if patch is already loaded
    if ((window as any).__patchesLoaded?.FeatureInfoSilme) {
      this.patchLoaded = true;
      return;
    }

    // Wait for TC namespace to be available
    await this.tcNamespaceService.waitForTC();

    // Load the patch script
    // The patch file itself loads TC.control.FeatureInfo if needed
    await this.ensureControlLoaded({
      controlName: 'FeatureInfoSilme',
      checkLoaded: () => {
        return !!(window as any).__patchesLoaded?.FeatureInfoSilme;
      },
      dependencies: ['TC'], // Only wait for TC - patch loads FeatureInfo itself
      loadScript: () => {
        const script = document.createElement('script');
        script.src = this.requiredPatches![0];
        script.async = false;
        document.head.appendChild(script);
      }
    });

    this.patchLoaded = true;
  }

  /**
   * Build configuration for FeatureInfoSilme control.
   *
   * Special logic matching legacy behavior (lines 918-944 in sitna-helpers.ts):
   * - Empty parameters → returns { persistentHighlights: true } for 'featureInfoSilme' key
   * - Custom parameters → returns parameters for 'featureInfo' key (configures base class)
   *
   * Note: The registry will use getSitnaConfigKey() to determine which key to use.
   */
  buildConfiguration(
    task: AppTasks,
    context: AppCfg
  ): SitnaControlConfig | null {
    // Store current task for getSitnaConfigKey()
    this.currentTask = task;

    // Check if parameters are empty
    if (this.areParametersEmpty(task.parameters)) {
      // No custom parameters → use Silme defaults
      return {
        persistentHighlights: true
      };
    } else {
      // Custom parameters → configure base FeatureInfo behavior
      // Return parameters as-is (they configure the base FeatureInfo that Silme extends)
      return task.parameters as SitnaControlConfig;
    }
  }

  /**
   * Check if FeatureInfoSilme control is ready.
   * Verifies that patch is loaded and TC.control.FeatureInfoSilme exists.
   */
  override isReady(): boolean {
    if (!this.patchLoaded) {
      return false;
    }

    const TC = this.tcNamespaceService.getTC();
    return !!TC?.control?.FeatureInfoSilme;
  }
}
