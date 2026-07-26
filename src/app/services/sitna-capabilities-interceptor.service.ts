import { inject, Injectable } from '@angular/core';

import { AppCfg } from '@api/model/app-cfg';

import { ConfigLookupService } from './config-lookup.service';
import { RasterLayerService } from './raster-layer.service';
import { SitnaApiService } from './sitna-api.service';
import { VirtualWmsCapabilitiesService } from './virtual-wms-capabilities.service';
import type { Meld, MeldJoinPoint } from '../types/meld.types';

declare function require(module: string): any;

const meld = require('meld') as Meld;

/**
 * Owns the global `meld.around` advice on `SITNA.layer.Layer.prototype.getCapabilitiesOnline`.
 *
 * Multiple control handlers (basemap selector, layer catalog, ...) call {@link ensurePatched}
 * during their `applyBootstrap`; the first call installs the advice, subsequent calls only
 * refresh the {@link AppCfg} reference (e.g. on language reload). Concurrent callers from the
 * registry's `Promise.all` collapse to a single install via the cached `installPromise`.
 *
 * Real fetched capabilities are post-processed by {@link RasterLayerService#processWmtCapabilitiesResult}
 * (profile `title`, `description`, `metadataURL`, and `datasetURL` applied to the matched **WMS**
 * or **WMTS** capability layer: each field, if present in the profile layer, replaces when
 * non-empty or is removed when empty; omitted keys leave GetCapabilities unchanged; plus scale
 * denominators where configured). `virtual://` URLs are
 * short-circuited with a synthetic document from {@link VirtualWmsCapabilitiesService#generateCapabilities}
 * merged with profile scale denominators via {@link RasterLayerService#applyVirtualCatalogProfileScaleDenominators}.
 */
@Injectable({
  providedIn: 'root'
})
export class SitnaCapabilitiesInterceptor {
  private readonly sitnaApi = inject(SitnaApiService);
  private readonly virtualWmsService = inject(VirtualWmsCapabilitiesService);
  private readonly rasterService = inject(RasterLayerService);
  private readonly configLookup = inject(ConfigLookupService);

  /** Latest AppCfg seen by `ensurePatched`; refreshed on every call. */
  private currentAppCfg: AppCfg | null = null;

  /** Cached install promise; collapses concurrent `ensurePatched` calls into one install. */
  private installPromise: Promise<void> | null = null;

  /** Restore callback returned by the installed advice handle (test-only `restore`). */
  private removeAdvice: (() => void) | null = null;

  /**
   * Refresh the AppCfg reference and install the around-advice the first time it is called.
   * Idempotent: subsequent calls only update `currentAppCfg` and re-initialize `ConfigLookupService`.
   */
  async ensurePatched(context: AppCfg): Promise<void> {
    this.currentAppCfg = context;
    this.configLookup.initialize(context);

    if (this.installPromise) {
      return this.installPromise;
    }

    this.installPromise = this.installAdvice();
    return this.installPromise;
  }

  /**
   * Remove the installed advice and reset state. Intended for tests; not called in production.
   */
  restore(): void {
    if (this.removeAdvice) {
      this.removeAdvice();
    }
    this.removeAdvice = null;
    this.installPromise = null;
    this.currentAppCfg = null;
  }

  private async installAdvice(): Promise<void> {
    const SITNA = this.sitnaApi.getSITNA();
    const LayerProto = (SITNA as any)?.layer?.Layer?.prototype;
    if (!LayerProto || typeof LayerProto.getCapabilitiesOnline !== 'function') {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const interceptor = this;
    const advice = meld.around(
      LayerProto,
      'getCapabilitiesOnline',
      function (this: unknown, joinPoint: MeldJoinPoint): unknown {
        const layer = this as {
          url?: string;
          getCapabilitiesUrl?: () => string;
          [key: string]: unknown;
        };

        let capabilitiesUrl: string | undefined;
        if (
          joinPoint.args &&
          joinPoint.args.length > 0 &&
          typeof joinPoint.args[0] === 'string'
        ) {
          capabilitiesUrl = joinPoint.args[0];
        } else if (typeof layer.getCapabilitiesUrl === 'function') {
          capabilitiesUrl = layer.getCapabilitiesUrl();
        } else if (layer.url) {
          capabilitiesUrl = layer.url;
        }

        const appCfg =
          interceptor.sitnaApi.getGlobal('currentAppCfg') ??
          interceptor.currentAppCfg;

        if (
          capabilitiesUrl &&
          appCfg &&
          interceptor.virtualWmsService.isVirtualServiceUrl(capabilitiesUrl)
        ) {
          const nodeId =
            interceptor.virtualWmsService.extractNodeIdFromUrl(capabilitiesUrl);
          if (nodeId) {
            try {
              const capabilities =
                interceptor.virtualWmsService.generateCapabilities(
                  nodeId,
                  appCfg
                );
              return Promise.resolve(
                interceptor.rasterService.applyVirtualCatalogProfileScaleDenominators(
                  capabilities,
                  appCfg
                )
              );
            } catch (error) {
              console.error(
                '[Virtual WMS] Failed to generate capabilities',
                error
              );
              // fall through to real fetch
            }
          }
        }

        const proceedResult = joinPoint.proceed();
        const appCfgForResult =
          interceptor.sitnaApi.getGlobal('currentAppCfg') ??
          interceptor.currentAppCfg;

        if (
          proceedResult &&
          typeof (proceedResult as { then?: unknown }).then === 'function'
        ) {
          return (proceedResult as Promise<unknown>).then((result: unknown) =>
            interceptor.rasterService.processWmtCapabilitiesResult(
              layer,
              capabilitiesUrl,
              result,
              appCfgForResult || undefined
            )
          );
        }
        return interceptor.rasterService.processWmtCapabilitiesResult(
          layer,
          capabilitiesUrl,
          proceedResult,
          appCfgForResult || undefined
        );
      }
    );

    this.removeAdvice = () => advice.remove();
  }
}
