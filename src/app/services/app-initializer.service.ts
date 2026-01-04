import { Injectable, inject } from '@angular/core';
import { SitnaNamespaceService } from './sitna-namespace.service';

@Injectable({
  providedIn: 'root',
})
export class AppInitializerService {
  private readonly sitnaNamespaceService = inject(SitnaNamespaceService);

  /**
   * Initialize SITNA configuration on app bootstrap.
   * Patches are now applied programmatically by handlers, not loaded from JS files.
   */
  async initialize(): Promise<void> {
    try {
      // Wait for SITNA script to load
      await this.sitnaNamespaceService.waitForSITNA(50, 100);
      console.log('[AppInitializer] SITNA loaded successfully');
    } catch (error: unknown) {
      // Use console directly here as this is bootstrap code before Angular services are fully available
      // eslint-disable-next-line no-console
      console.error('Failed to initialize SITNA', error);
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

