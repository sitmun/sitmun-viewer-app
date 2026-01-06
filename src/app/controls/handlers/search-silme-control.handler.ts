import { Injectable } from '@angular/core';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';
import { AppCfg, AppTasks } from '@api/model/app-cfg';
import { TCNamespaceService } from '../../services/tc-namespace.service';

/**
 * Handler for legacy Silme search extension.
 * Custom search control for SITMUN-specific search.
 *
 * Control Type: sitna.search.silme.extension
 * Patches: SearchSilme.js
 * Configuration: Custom Silme control for entity search
 */
@Injectable({
  providedIn: 'root'
})
export class SearchSilmeControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.search.silme.extension';
  readonly sitnaConfigKey = 'searchSilme'; // Match old system
  readonly requiredPatches = ['assets/js/patch/controls/SearchSilme.js'];

  private patchLoaded = false;

  constructor(tcNamespaceService: TCNamespaceService) {
    super(tcNamespaceService);
  }

  /**
   * Load the SearchSilme patch file.
   * The patch extends TC.control.Search with Silme-specific template.
   * The patch itself will load TC.control.Search if it's not available.
   */
  override async loadPatches(context: AppCfg): Promise<void> {
    if (this.patchLoaded) {
      return;
    }

    // Check if patch is already loaded
    if ((window as any).__patchesLoaded?.SearchSilme) {
      this.patchLoaded = true;
      return;
    }

    // Wait for TC namespace to be available
    await this.tcNamespaceService.waitForTC();

    // Load the patch script
    // The patch file itself loads TC.control.Search if needed
    await this.ensureControlLoaded({
      controlName: 'SearchSilme',
      checkLoaded: () => {
        return !!(window as any).__patchesLoaded?.SearchSilme;
      },
      dependencies: ['TC'], // Only wait for TC - patch loads Search itself
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
   * Build configuration for SearchSilme control.
   * Uses default div and merges with backend parameters.
   */
  buildConfiguration(
    task: AppTasks,
    context: AppCfg
  ): SitnaControlConfig | null {
    const defaultConfig = this.getDefaultConfig();

    // Merge with parameters, which may include:
    // - searchUrl: URL for search endpoint
    // - searchFields: Fields to search on
    // - etc.
    return this.mergeWithParameters(defaultConfig, task.parameters);
  }

  /**
   * Check if SearchSilme control is ready.
   * Verifies that patch is loaded and TC.control.SearchSilme exists.
   */
  override isReady(): boolean {
    if (!this.patchLoaded) {
      return false;
    }

    const TC = this.tcNamespaceService.getTC();
    return !!TC?.control?.SearchSilme;
  }
}
