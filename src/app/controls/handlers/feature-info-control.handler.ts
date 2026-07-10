import { Injectable, inject } from '@angular/core';

import { AppCfg } from '@api/model/app-cfg';
import { TranslateService } from '@ngx-translate/core';

import { FeatureInfoMoreInfoHandler } from './more-info.handler';
import { MoreInfoService } from '../../services/more-info.service';
import { SitnaApiService } from '../../services/sitna-api.service';
import type { Meld, MeldJoinPoint } from '../../types/meld.types';
import { ControlHandlerBase } from '../control-handler-base';

declare function require(module: string): unknown;
const meld = require('meld') as Meld;

/**
 * Handler for the native SITNA featureInfo control.
 * Allows users to click on map features to view their information.
 *
 * Control Type: sitna.featureInfo
 * - Elevation display configuration
 * - More Info functionality: Adds "Més informació" field to features with moreInfo tasks
 * Configuration: Optional parameters (active, persistentHighlights, displayElevation, etc.)
 */
@Injectable({
  providedIn: 'root'
})
export class FeatureInfoControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.featureInfo';
  readonly sitnaConfigKey = 'featureInfo';
  readonly requiredPatches = undefined;
  private readonly moreInfoService = inject(MoreInfoService);
  private readonly translateService = inject(TranslateService);
  private readonly mapEventCleanups: Array<() => void> = [];
  private appConfig: AppCfg | null = null;
  private readonly moreInfoHandler = new FeatureInfoMoreInfoHandler(
    this.moreInfoService,
    () => this.appConfig,
    this.translateService
  );

  constructor(sitnaApi: SitnaApiService) {
    super(sitnaApi);
  }

  private scheduleAttachMoreInfoListeners(displayControl: any): void {
    setTimeout(() => {
      this.moreInfoHandler.attachMoreInfoListeners(displayControl);
    }, 50);
  }

  /**
   * Get Raster prototype from TC namespace (same pattern as layer-catalog-control.handler).
   */
  private getRasterPrototype(TC: any): any {
    return TC?.layer?.Raster?.prototype || TC?.wrap?.layer?.Raster?.prototype;
  }

  /**
   * Load patches for featureInfo control.
   */
  override async loadPatches(context: AppCfg): Promise<void> {
    this.moreInfoService.initialize(context);
    this.appConfig = context;
    await this.withTCAsync(async (TC) => {
      const mapProto = TC?.Map?.prototype;
      if (mapProto?.addControl && !mapProto.__sitmunFiAddControl) {
        const addControlAdvice = meld.around(
          mapProto,
          'addControl',
          function (this: any, jp: MeldJoinPoint) {
            const [ctrl, opts] = jp.args as [any, any];
            const isFeatureInfo = ctrl === 'featureInfo';
            const isFeatureTools = ctrl === 'featureTools';
            const needCfg =
              (isFeatureInfo || isFeatureTools) &&
              opts?.displayElevation == null &&
              this.options?.controls?.featureInfo?.displayElevation != null;
            let inject = null;
            if (needCfg && isFeatureTools) {
              inject = {
                displayElevation:
                  this.options.controls.featureInfo.displayElevation
              };
            } else if (needCfg) {
              inject = this.options.controls.featureInfo;
            }
            const finalOpts =
              inject === null
                ? opts
                : TC.Util.extend(true, {}, opts || {}, inject);
            return jp.proceedApply([ctrl, finalOpts]);
          }
        );
        mapProto.__sitmunFiAddControl = true;
        this.patchManager.add(() => {
          addControlAdvice.remove();
          delete mapProto.__sitmunFiAddControl;
        });
      }

      const fiProto = TC?.control?.FeatureInfo?.prototype;
      if (fiProto?.register && !fiProto.__sitmunFiRegister) {
        const registerAdvice = meld.around(
          fiProto,
          'register',
          (jp: MeldJoinPoint) => {
            const control = jp.target as any;
            const [map] = jp.args as [any];

            if (
              control.options?.displayElevation === undefined &&
              map?.options?.controls?.featureInfo?.displayElevation !==
                undefined
            ) {
              control.options = TC.Util.extend(
                true,
                {},
                control.options,
                map.options.controls.featureInfo
              );
            }

            const result = jp.proceedApply(jp.args);

            if (map?.on && !control.__sitmunMoreInfoMapEvents) {
              const onDisplayRender = (e: any) => {
                const displayControl = e?.control;
                if (!displayControl) return;

                const isFromFeatureInfo = displayControl.caller === control;
                const isHighlightedPopup =
                  displayControl.currentFeature?.showsPopup === true;

                if (!isFromFeatureInfo && !isHighlightedPopup) {
                  return;
                }

                this.scheduleAttachMoreInfoListeners(displayControl);
              };

              map.on('popup.tc drawtable.tc', onDisplayRender);
              this.mapEventCleanups.push(() => {
                map.off('popup.tc drawtable.tc', onDisplayRender);
              });
              control.__sitmunMoreInfoMapEvents = { map, onDisplayRender };
            }

            return result;
          }
        );
        fiProto.__sitmunFiRegister = true;
        this.patchManager.add(() => {
          registerAdvice.remove();
          delete fiProto.__sitmunFiRegister;
          while (this.mapEventCleanups.length > 0) {
            const cleanup = this.mapEventCleanups.pop();
            cleanup?.();
          }
        });
      }

      // Patch responseCallback to inject "Més informació" field
      if (fiProto?.responseCallback && !fiProto.__sitmunMoreInfo) {
        const responseCallbackAdvice = meld.around(
          fiProto,
          'responseCallback',
          (jp: MeldJoinPoint) => {
            const [options] = jp.args as [any];

            // Process features BEFORE calling original responseCallback
            if (options?.services && this.moreInfoService.hasMoreInfoTasks()) {
              this.moreInfoHandler.injectMoreInfoFields(options);
              this.moreInfoHandler.executeSqlTasksForFeatures(options);
            }

            // Call original responseCallback
            const result = jp.proceedApply(jp.args);

            // After render, attach event listeners
            setTimeout(() => {
              this.moreInfoHandler.attachMoreInfoListeners(jp.target);
            }, 100);

            return result;
          }
        );
        fiProto.__sitmunMoreInfo = true;
        this.patchManager.add(() => {
          responseCallbackAdvice.remove();
          delete fiProto.__sitmunMoreInfo;
        });
      }

      if (
        fiProto?.displayResultsCallback &&
        !fiProto.__sitmunMoreInfoDisplayResults
      ) {
        const displayResultsAdvice = meld.around(
          fiProto,
          'displayResultsCallback',
          (jp: MeldJoinPoint) => {
            const result = jp.proceedApply(jp.args);
            setTimeout(() => {
              this.moreInfoHandler.attachMoreInfoListeners(jp.target);
            }, 50);
            return result;
          }
        );
        fiProto.__sitmunMoreInfoDisplayResults = true;
        this.patchManager.add(() => {
          displayResultsAdvice.remove();
          delete fiProto.__sitmunMoreInfoDisplayResults;
        });
      }

      // --- Patch A: Tolerate DescribeLayer failures (#155) ---
      // SITNA's getFeatureInfo (api-sitna ol.js:7228) does:
      //   const isFromRasterOrigin = (await layer.describeLayer(true)).every(...)
      // without try/catch. WMS servers that don't implement DescribeLayer (e.g. Catastro)
      // reply with a ServiceException, which Raster.describeLayer (Raster.js:2037) re-throws.
      // That throw propagates out of getFeatureInfo and breaks identify for every layer.
      const RasterProto = this.getRasterPrototype(TC);
      if (RasterProto?.describeLayer && !RasterProto.__sitmunDescribeLayerSafe) {
        const describeAdvice = meld.around(
          RasterProto,
          'describeLayer',
          function (this: unknown, jp: MeldJoinPoint): unknown {
            const full = jp.args[0] as boolean | undefined;
            const fallback = full ? [{ owsType: 'WMS' }] : { owsType: 'WMS' };
            return Promise.resolve(jp.proceed() as Promise<unknown>).catch(
              () => fallback
            );
          }
        );
        RasterProto.__sitmunDescribeLayerSafe = true;
        this.patchManager.add(() => {
          describeAdvice.remove();
          delete RasterProto.__sitmunDescribeLayerSafe;
        });
      }

      // --- Patch B: Per-service isolation for GetFeatureInfo (#155) ---
      // SITNA's getFeatureInfo (api-sitna ol.js:7322) aggregates per-service GFI requests
      // with Promise.all. A single rejected request (e.g. Catastro returning HTTP 500 from
      // Proxification.js:1206) collapses the whole identify and triggers the global
      // 'featureInfo.error' toast with featureCount:0.
      // We intercept Proxification.fetch only for URLs whose query string contains
      // REQUEST=GetFeatureInfo, and convert the rejection into an empty response shaped
      // exactly like a real fulfilment ({ responseText, contentType }) so Promise.all resolves
      // and OL renders the successful services normally.
      const ProxProto = TC?.tool?.Proxification?.prototype;
      if (ProxProto?.fetch && !ProxProto.__sitmunGfiIsolation) {
        const fetchAdvice = meld.around(
          ProxProto,
          'fetch',
          function (this: unknown, jp: MeldJoinPoint): unknown {
            const url = jp.args[0];
            if (
              typeof url !== 'string' ||
              !/[?&]REQUEST=GetFeatureInfo\b/i.test(url)
            ) {
              return jp.proceed();
            }
            const formatMatch = url.match(/[?&]INFO_FORMAT=([^&]+)/i);
            const requestedFormat = formatMatch
              ? decodeURIComponent(formatMatch[1])
              : 'application/json';
            // Return a structurally valid empty payload that matches INFO_FORMAT so the OL
            // parser branch at ol.js:7339 (iFormat === requestedFormat) is taken and the
            // try/catch at ol.js:7376 yields zero features, instead of the responseError
            // branch that triggers the global error toast.
            const emptyByFormat: Record<string, string> = {
              'application/json':
                '{"type":"FeatureCollection","features":[]}',
              'application/vnd.ogc.gml':
                '<?xml version="1.0"?><wfs:FeatureCollection xmlns:wfs="http://www.opengis.net/wfs"/>',
              'application/vnd.ogc.gml/3.1.1':
                '<?xml version="1.0"?><wfs:FeatureCollection xmlns:wfs="http://www.opengis.net/wfs"/>',
              'application/vnd.esri.wms_featureinfo_xml':
                '<FeatureInfoResponse/>'
            };
            const responseText = emptyByFormat[requestedFormat] ?? '';
            return Promise.resolve(jp.proceed() as Promise<unknown>).catch(
              () => ({
                responseText,
                contentType: requestedFormat
              })
            );
          }
        );
        ProxProto.__sitmunGfiIsolation = true;
        this.patchManager.add(() => {
          fetchAdvice.remove();
          delete ProxProto.__sitmunGfiIsolation;
        });
      }
    });
  }
}
