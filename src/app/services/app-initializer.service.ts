import { Injectable, inject } from '@angular/core';
import { SitnaNamespaceService } from './sitna-namespace.service';
import { PatchLoaderService } from './patch-loader.service';

@Injectable({
  providedIn: 'root',
})
export class AppInitializerService {
  private readonly sitnaNamespaceService = inject(SitnaNamespaceService);
  private readonly patchLoaderService = inject(PatchLoaderService);

  /**
   * Initialize SITNA configuration on app bootstrap
   */
  async initialize(): Promise<void> {
    try {
      // Wait for SITNA script to load
      await this.sitnaNamespaceService.waitForSITNA(50, 100);

      // Load patches AFTER SITNA is available (patches depend on TC/SITNA objects)
      await this.patchLoaderService.loadPatches();
    } catch (error: unknown) {
      // Use console directly here as this is bootstrap code before Angular services are fully available
      // eslint-disable-next-line no-console
      console.error('Failed to initialize SITNA or load patches', error);
      throw error;
    }
  }
}

/**
 * Factory function for APP_INITIALIZER
 */
export function initializeApp(
  initializer: AppInitializerService
): () => Promise<void> {
  return () => initializer.initialize();
}

