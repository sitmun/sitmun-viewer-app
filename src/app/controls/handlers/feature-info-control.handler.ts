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
        fiProto.__sitmunFiRegister = true;
        this.patchManager.add(() => {
          meld.remove(registerAdvice);
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
