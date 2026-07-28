import { Injectable } from '@angular/core';

import { AppCfg } from '@api/model/app-cfg';
import { IndexedDbService } from '@auth/services/indexed-db.service';

import { SitnaApiService } from './sitna-api.service';

interface SitnaProxificationPrototype {
  _isServiceWorker?: () => boolean;
  __sitmunPreserveHttpWithServiceWorker?: boolean;
}

/**
 * Service for managing service worker communication for map middleware.
 *
 * Sends proxy URL to service worker for middleware configuration.
 */
@Injectable({
  providedIn: 'root'
})
export class MapServiceWorkerService {
  /**
   * Guards against stacking multiple `controllerchange` listeners when
   * `configureMiddleware()` is called more than once while the service worker has
   * not yet taken control (`navigator.serviceWorker.controller === null`).
   * Without this flag, each call would register another listener and they
   * would all fire on the same `controllerchange` event, triggering multiple
   * `window.location.reload()` calls. Resets implicitly on every page reload
   * because the service instance is destroyed.
   */
  private controllerChangeRegistered = false;

  constructor(
    private readonly indexedDb: IndexedDbService,
    private readonly sitnaApi: SitnaApiService
  ) {}

  /**
   * Persists the proxy URL to IndexedDB and notifies the active service worker.
   * All internal errors are caught and logged; this method always resolves and
   * never rejects. Callers can safely await it without error handling.
   *
   * @param config - Application configuration containing proxy URL
   */
  configureMiddleware(config: AppCfg): Promise<void> {
    if (!config.global?.proxy) {
      console.warn('[SW] No proxy URL in configuration — proxy requests will not work.');
      return Promise.resolve();
    }
    if (!navigator.serviceWorker) {
      console.warn('[SW] Service Worker API unavailable (private browsing?) — proxy requests will not work.');
      return Promise.resolve();
    }

    const proxyUrl = config.global.proxy;
    const sw = navigator.serviceWorker;

    this.preserveHttpMiddlewareProtocol(proxyUrl);
    this.registerControllerChangeListener(sw);

    const persistMiddlewareUrl = this.persistMiddlewareUrl(proxyUrl);
    const sendProxyUrlToSw = this.sendProxyUrlToSw(sw, proxyUrl);

    return Promise.all([persistMiddlewareUrl, sendProxyUrlToSw]).then(() => undefined);
  }

  /**
   * SITNA 4.8 treats any controlling service worker as a reason to upgrade
   * cross-origin HTTP requests to HTTPS. SITMUN's worker only adds proxy
   * authorization, so an HTTP viewer must retain an explicitly HTTP middleware URL.
   */
  private preserveHttpMiddlewareProtocol(proxyUrl: string): void {
    if (
      window.location.protocol !== 'http:' ||
      new URL(proxyUrl, window.location.href).protocol !== 'http:'
    ) {
      return;
    }

    const prototype = this.sitnaApi.getTC()?.tool?.Proxification
      ?.prototype as SitnaProxificationPrototype | undefined;
    if (
      !prototype ||
      prototype.__sitmunPreserveHttpWithServiceWorker ||
      typeof prototype._isServiceWorker !== 'function'
    ) {
      return;
    }

    prototype._isServiceWorker = () => false;
    prototype.__sitmunPreserveHttpWithServiceWorker = true;
  }

  /** Persists the proxy URL to IndexedDB. */
  private persistMiddlewareUrl(proxyUrl: string): Promise<void> {
    return this.indexedDb
      .setConfig('middleware_url', proxyUrl)
      .catch((err) => console.warn('[IDB] Failed to save middleware URL:', err));
  }

  /** Posts the proxy URL to the active service worker registration. */
  private sendProxyUrlToSw(sw: ServiceWorkerContainer, proxyUrl: string): Promise<void> {
    return sw.ready
      .then((registration) => {
        if (registration.active) {
          registration.active.postMessage({ type: 'MIDDLEWARE_URL', url: proxyUrl });
        }
      })
      .catch((err) => console.warn('[SW] Failed to send MIDDLEWARE_URL to service worker:', err));
  }

  /**
   * Registers a one-time `controllerchange` listener that reloads the page
   * when the service worker first takes control. No-op if the SW already
   * controls the page or the listener has already been registered.
   */
  private registerControllerChangeListener(sw: ServiceWorkerContainer): void {
    if (sw.controller || this.controllerChangeRegistered) return;
    this.controllerChangeRegistered = true;
    sw.addEventListener('controllerchange', () => {
      console.debug('[SW] Controller changed. Reloading to apply proxy.');
      window.location.reload();
    }, { once: true });
  }
}
