import { Injectable, inject } from '@angular/core';

import { AppCfg } from '@api/model/app-cfg';

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
 *
 * Elevation Display:
 * - Set `displayElevation: true` in controlDefaults or task parameters to enable elevation in popup
 * - Elevation values are fetched from elevation services configured at map level or control level
 * - If `displayElevation` is boolean true, uses map's elevation tool or creates default elevation tool
 * - If `displayElevation` is an object, uses that configuration for elevation services
 * More Info Functionality:
 * - Automatically adds "Més informació" field to features when cartography has moreInfo task
 * - Field appears as clickable link with info icon
 * - Executes configured query (URL redirect or SQL query) when clicked
 */
@Injectable({
  providedIn: 'root'
})
export class FeatureInfoControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.featureInfo';
  readonly sitnaConfigKey = 'featureInfo';
  readonly requiredPatches = undefined;
  private readonly moreInfoService = inject(MoreInfoService);
  private readonly mapEventCleanups: Array<() => void> = [];
  private appConfig: AppCfg | null = null;
  private readonly moreInfoHandler = new FeatureInfoMoreInfoHandler(
    this.moreInfoService,
    () => this.appConfig
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
   * Load patches for featureInfo control.
   * Patches:
   * 1. Map.addControl - Apply displayElevation config to featureInfo and featureTools
   * 2. FeatureInfo.register - Apply displayElevation from map config
   * 3. FeatureInfo.responseCallback - Inject "Més informació" field into features
   */
  override async loadPatches(context: AppCfg): Promise<void> {
    // Initialize MoreInfo service and store config
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
          meld.remove(addControlAdvice);
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
        mapProto.__sitmunFiRegister = true;
        this.patchManager.add(() => {
          meld.remove(registerAdvice);
          delete mapProto.__sitmunFiRegister;
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
          meld.remove(responseCallbackAdvice);
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
          meld.remove(displayResultsAdvice);
          delete fiProto.__sitmunMoreInfoDisplayResults;
        });
      }
    });
  }
}
