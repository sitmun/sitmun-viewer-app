import { Injectable } from '@angular/core';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';
import { AppCfg, AppTasks } from '@api/model/app-cfg';
import { TCNamespaceService } from '../../services/tc-namespace.service';

/**
 * Handler for the Silme patched popup control.
 * Loads Popup.js patch on-demand to replace native SITNA popup with Silme-specific behavior.
 *
 * Control Type: sitna.popup.silme.patch
 * Patches: Popup.js (replaces TC.control.Popup with Silme implementation)
 * Configuration: Boolean true or config object
 *
 * Key Principle: Patch is ONLY loaded when this control is explicitly requested.
 */
@Injectable({
  providedIn: 'root'
})
export class PopupSilmeControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.popup.silme.patch';
  readonly sitnaConfigKey = 'popup'; // Same key as native
  readonly requiredPatches = ['assets/js/patch/controls/Popup.js'];

  private patchLoaded = false;

  constructor(tcNamespaceService: TCNamespaceService) {
    super(tcNamespaceService);
  }

  /**
   * Load the Popup.js patch file on-demand.
   * The patch completely replaces TC.control.Popup with Silme implementation.
   */
  override async loadPatches(context: AppCfg): Promise<void> {
    if (this.patchLoaded) {
      return;
    }

    // Check if patch is already loaded
    if ((window as any).__patchesLoaded?.Popup) {
      this.patchLoaded = true;
      return;
    }

    // Wait for TC namespace to be available
    await this.tcNamespaceService.waitForTC();

    // Load Popup.js patch on-demand
    await this.ensureControlLoaded({
      controlName: 'Popup',
      checkLoaded: () => {
        return !!(window as any).__patchesLoaded?.Popup;
      },
      dependencies: ['TC'], // Only wait for TC - patch replaces Popup itself
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
   * Build configuration for patched popup control.
   * Returns true if no parameters, or merges parameters if provided.
   * Same pattern as native popup handler.
   */
  buildConfiguration(
    task: AppTasks,
    context: AppCfg
  ): SitnaControlConfig | null {
    // If no parameters, return true (boolean config)
    if (this.areParametersEmpty(task.parameters)) {
      return true as any; // Cast to satisfy SitnaControlConfig return type
    }
    // Otherwise return parameters as config object
    return task.parameters as SitnaControlConfig;
  }

  /**
   * Check if patched popup control is ready.
   * Verifies that patch is loaded and TC.control.Popup exists (patched version).
   */
  override isReady(): boolean {
    if (!this.patchLoaded) {
      return false;
    }

    const TC = this.tcNamespaceService.getTC();
    return !!TC?.control?.Popup; // Patched version replaces native
  }
}

