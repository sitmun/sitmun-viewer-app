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
   * Load a single script file.
   *
   * @param src - The source path of the script to load
   * @returns Promise that resolves when the script is loaded
   */
  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.type = 'text/javascript';

      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load patch: ${src}`));

      document.head.appendChild(script);
    });
  }
}

