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
    // Use Promise to properly wait for script execution
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = this.requiredPatches![0];
      script.async = false;
      
      script.onload = () => {
        // Poll for patch to be loaded (script executes synchronously but we need to wait)
        const pollInterval = setInterval(() => {
          if ((window as any).__patchesLoaded?.SearchSilme) {
            clearInterval(pollInterval);
            console.log('[SearchSilme] Patch loaded successfully');
            resolve();
          }
        }, 10);
        
        // Timeout after 5 seconds (increased from 2 seconds)
        setTimeout(() => {
          clearInterval(pollInterval);
          if ((window as any).__patchesLoaded?.SearchSilme) {
            console.log('[SearchSilme] Patch loaded successfully (after timeout check)');
            resolve();
          } else {
            console.error('[SearchSilme] Patch loading timeout - __patchesLoaded:', (window as any).__patchesLoaded);
            reject(new Error('SearchSilme patch failed to load after timeout'));
          }
        }, 5000);
      };
      
      script.onerror = () => {
        reject(new Error(`Failed to load script: ${this.requiredPatches![0]}`));
      };
      
      document.head.appendChild(script);
    });

    this.patchLoaded = true;
  }

  /**
   * Build configuration for SearchSilme control.
   * Uses default div and merges with backend parameters.
   * Explicitly sets type to ensure SITNA uses SearchSilme control class.
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
    const config = this.mergeWithParameters(defaultConfig, task.parameters);

    // Explicitly set type to ensure SITNA instantiates SearchSilme control class
    // This helps SITNA resolve the correct control type when key is 'searchSilme'
    return {
      ...config,
      type: 'SearchSilme'
    };
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
