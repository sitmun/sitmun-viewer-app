import { Injectable } from '@angular/core';

import { AppCfg } from '@api/model/app-cfg';

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
 * Patches: None (native SITNA control)
 * Configuration: Optional parameters (active, persistentHighlights, displayElevation, etc.)
 *
 * Elevation Display:
 * - Set `displayElevation: true` in controlDefaults or task parameters to enable elevation in popup
 * - Elevation values are fetched from elevation services configured at map level or control level
 * - If `displayElevation` is boolean true, uses map's elevation tool or creates default elevation tool
 * - If `displayElevation` is an object, uses that configuration for elevation services
 */
@Injectable({
  providedIn: 'root'
})
export class FeatureInfoControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.featureInfo';
  readonly sitnaConfigKey = 'featureInfo';
  readonly requiredPatches = undefined; // No patches needed

  constructor(sitnaApi: SitnaApiService) {
    super(sitnaApi);
  }

  /**
   * Load patches for featureInfo control.
   * Patches Map.addControl (featureInfo and featureTools) and FeatureInfo.register so displayElevation from map config is applied.
   */
  override async loadPatches(_context: AppCfg): Promise<void> {
    await this.withTCAsync(async (TC) => {
      const mapProto = TC?.Map?.prototype as any;
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
            const inject =
              needCfg && isFeatureTools
                ? {
                    displayElevation:
                      this.options.controls.featureInfo.displayElevation
                  }
                : needCfg
                ? this.options.controls.featureInfo
                : null;
            const finalOpts =
              inject != null
                ? TC.Util.extend(true, {}, opts || {}, inject)
                : opts;
            return jp.proceedApply([ctrl, finalOpts]);
          }
        );
        mapProto.__sitmunFiAddControl = true;
        this.patchManager.add(() => {
          meld.remove(addControlAdvice);
          delete mapProto.__sitmunFiAddControl;
        });
      }

      const fiProto = TC?.control?.FeatureInfo?.prototype as any;
      if (fiProto?.register && !fiProto.__sitmunFiRegister) {
        const registerAdvice = meld.around(
          fiProto,
          'register',
          function (this: any, jp: MeldJoinPoint) {
            const [map] = jp.args as [any];
            if (
              this.options?.displayElevation === undefined &&
              map?.options?.controls?.featureInfo?.displayElevation !==
                undefined
            ) {
              this.options = TC.Util.extend(
                true,
                {},
                this.options,
                map.options.controls.featureInfo
              );
            }
            return jp.proceedApply(jp.args);
          }
        );
        fiProto.__sitmunFiRegister = true;
        this.patchManager.add(() => {
          meld.remove(registerAdvice);
          delete fiProto.__sitmunFiRegister;
        });
      }
    });
  }
}
