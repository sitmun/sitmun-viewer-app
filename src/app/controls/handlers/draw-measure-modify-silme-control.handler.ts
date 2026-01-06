import { Injectable } from '@angular/core';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';
import { AppCfg, AppTasks } from '@api/model/app-cfg';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import { UIStateService } from '../../services/ui-state.service';

/**
 * Handler for the Silme extension of drawMeasureModify control.
 * Extended version with Silme-specific behavior and elevation display.
 * 
 * Control Type: sitna.drawMeasureModify.silme.extension
 * Patches: DrawMeasureModifySilme.js
 * Configuration: div + displayElevation configuration
 */
@Injectable({
  providedIn: 'root'
})
export class DrawMeasureModifySilmeControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.drawMeasureModify.silme.extension';
  readonly sitnaConfigKey = 'drawMeasureModifySilme';
  readonly requiredPatches = ['assets/js/patch/controls/DrawMeasureModifySilme.js'];

  private patchLoaded = false;

  constructor(
    tcNamespaceService: TCNamespaceService,
    private uiStateService: UIStateService
  ) {
    super(tcNamespaceService);
  }

  /**
   * Load the DrawMeasureModifySilme patch file.
   * The patch extends TC.control.DrawMeasureModify with Silme-specific functionality.
   * The patch itself will load TC.control.DrawMeasureModify if it's not available.
   */
  override async loadPatches(context: AppCfg): Promise<void> {
    if (this.patchLoaded) {
      return;
    }

    // Check if patch is already loaded
    if ((window as any).__patchesLoaded?.DrawMeasureModifySilme) {
      this.patchLoaded = true;
      return;
    }

    // Wait for TC namespace to be available (patch will load DrawMeasureModify itself)
    await this.tcNamespaceService.waitForTC();

    // Load the patch script
    // Note: The patch file itself loads TC.control.DrawMeasureModify if needed,
    // so we only need to wait for TC, not for DrawMeasureModify
    await this.ensureControlLoaded({
      controlName: 'DrawMeasureModifySilme',
      checkLoaded: () => {
        return !!(window as any).__patchesLoaded?.DrawMeasureModifySilme;
      },
      dependencies: ['TC'], // Only wait for TC - patch loads DrawMeasureModify itself
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
   * Build configuration for DrawMeasureModifySilme control.
   * Uses default div and adds displayElevation configuration.
   * Enables tools button when control is configured.
   * 
   * displayElevation.displayOn can be:
   * - 'controlContainer' (default) - uses SITNA's default container
   * - '.tc-ctl-cctr-left' - displays in left control container
   * - '.tc-ctl-cctr-right' - displays in right control container
   * - Any CSS selector string
   * 
   * Note: Patches are loaded after configuration is built, so we don't check isReady() here.
   */
  buildConfiguration(task: AppTasks, context: AppCfg): SitnaControlConfig | null {
    const defaultConfig = this.getDefaultConfig();
    
    // Check if task parameters specify displayOn, otherwise use default
    const displayOn = task.parameters?.displayElevation?.displayOn || 'controlContainer';
    
    const config: SitnaControlConfig = {
      ...defaultConfig,
      displayElevation: {
        displayOn: displayOn
      }
    };

    // Merge with task parameters (may override displayElevation completely)
    const mergedConfig = this.mergeWithParameters(config, task.parameters);

    // Enable tools button when drawMeasureModifySilme control is configured
    this.uiStateService.enableToolsButton();

    return mergedConfig;
  }

  /**
   * Check if DrawMeasureModifySilme control is ready.
   * Verifies that patch is loaded and TC.control.DrawMeasureModifySilme exists.
   */
  override isReady(): boolean {
    if (!this.patchLoaded) {
      return false;
    }

    const TC = this.tcNamespaceService.getTC();
    return !!(TC?.control?.DrawMeasureModifySilme);
  }
}

