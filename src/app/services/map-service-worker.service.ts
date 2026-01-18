import { Injectable } from '@angular/core';

import { AppCfg } from '@api/model/app-cfg';

/**
 * Service for managing service worker communication for map middleware.
 *
 * Replaces SitnaHelper.loadMiddleware() static method.
 * Sends proxy URL to service worker for middleware configuration.
 * TODO: Add unit tests (map-service-worker.service.spec.ts)
 */
@Injectable({
  providedIn: 'root'
})
export class MapServiceWorkerService {
  /**
   * Load middleware configuration by sending proxy URL to service worker.
   *
   * @param apiConfig - Application configuration containing proxy URL
   */
  loadMiddleware(apiConfig: AppCfg): void {
    if (
      apiConfig.global?.proxy &&
      navigator.serviceWorker &&
      navigator.serviceWorker.controller
    ) {
      navigator.serviceWorker.controller.postMessage({
        type: 'MIDDLEWARE_URL',
        url: apiConfig.global.proxy
      });
    }
  }
}
