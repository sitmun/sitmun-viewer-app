import { Injectable } from '@angular/core';

/**
 * Service for loading SITNA patches programmatically.
 * Patches must be loaded AFTER SITNA/TC is available since they depend on TC.* objects.
 */
@Injectable({
  providedIn: 'root',
})
export class PatchLoaderService {
  /**
   * Array of patch files to load (matching patch_main.js structure)
   */
  private readonly patchFiles: string[] = [
    // Controls
    'assets/js/patch/controls/SearchSilme.js',
    'assets/js/patch/controls/LayerCatalogSilmeFolders.js',
    'assets/js/patch/controls/WorkLayerManagerSilme.js',
    'assets/js/patch/controls/BasemapSelectorSilme.js',
    'assets/js/patch/controls/ExternalWMSSilme.js',
    'assets/js/patch/controls/StreetViewSilme.js',
    'assets/js/patch/controls/DrawMeasureModifySilme.js',
    'assets/js/patch/controls/FeatureInfoSilme.js',
    'assets/js/patch/controls/Popup.js',
    // Support
    'assets/js/patch/api_patches.js',
    'assets/js/patch/TCProjectionDataPatch.js',
    'assets/js/patch/DefaultsPatch.js',
    'assets/js/patch/SilmeMap.js',
    'assets/js/patch/SilmeModal.js',
    'assets/js/patch/SilmeUtils.js',
    'assets/js/patch/SilmeTree.js'
  ];

  /**
   * Load all patch files.
   * Returns a Promise that resolves when all patches are loaded.
   *
   * @returns Promise that resolves when all patches are loaded
   */
  async loadPatches(): Promise<void> {
    const loadPromises = this.patchFiles.map((fileSrc) => this.loadScript(fileSrc));
    await Promise.all(loadPromises);
  }

  /**
   * Initialize the patches loaded tracking object if it doesn't exist.
   */
  private initializePatchesLoaded(): void {
    if (typeof window !== 'undefined' && typeof (window as any).__patchesLoaded === 'undefined') {
      (window as any).__patchesLoaded = {};
    }
  }

  /**
   * Get a unique identifier for a patch file based on its path.
   *
   * @param src - The source path of the script
   * @returns A unique identifier for the patch
   */
  private getPatchId(src: string): string {
    // Extract filename with path for mapping
    const filename = src.split('/').pop() || src;
    // Map to the same IDs used in existing guards (for backward compatibility)
    const idMap: Record<string, string> = {
      'api_patches.js': 'api_patches',
      'Popup.js': 'Popup',
      'WorkLayerManagerSilme.js': 'WorkLayerManagerSilme',
    };
    // Use mapped ID if available, otherwise use filename without extension
    return idMap[filename] || filename.replace('.js', '');
  }

  /**
   * Load a single script file.
   * Tracks execution state to prevent re-execution even if script tag exists.
   *
   * @param src - The source path of the script to load
   * @returns Promise that resolves when the script is loaded
   */
  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.initializePatchesLoaded();
      const patchId = this.getPatchId(src);
      const patchesLoaded = (window as any).__patchesLoaded;

      // Check if patch has already been executed
      if (patchesLoaded[patchId]) {
        resolve();
        return;
      }

      // Check if script tag already exists (may have been loaded but not executed yet)
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        // Script tag exists but not marked as loaded - wait for it to execute
        // This handles race conditions where script is loading
        const checkInterval = setInterval(() => {
          if (patchesLoaded[patchId]) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 10);

        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          if (!patchesLoaded[patchId]) {
            // Script tag exists but never executed - mark as loaded to prevent infinite wait
            patchesLoaded[patchId] = true;
            resolve();
          }
        }, 5000);
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.type = 'text/javascript';

      script.onload = () => {
        // Mark as loaded after script executes
        patchesLoaded[patchId] = true;
        resolve();
      };
      script.onerror = () => reject(new Error(`Failed to load patch: ${src}`));

      document.head.appendChild(script);
    });
  }
}

