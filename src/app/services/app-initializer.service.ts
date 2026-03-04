import { Injectable, inject } from '@angular/core';

import { SitnaApiService } from './sitna-api.service';

@Injectable({
  providedIn: 'root'
})
export class AppInitializerService {
  private readonly sitnaApi = inject(SitnaApiService);

  /**
   * Initialize SITNA configuration on app bootstrap.
   * Patches are now applied programmatically by handlers, not loaded from JS files.
   */
  async initialize(): Promise<void> {
    try {
      // Verify SITNA is available (synchronous check)
      this.sitnaApi.getSITNA();
    } catch (error: unknown) {
      // Use console directly here as this is bootstrap code before Angular services are fully available
       
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
