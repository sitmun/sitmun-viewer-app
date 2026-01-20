import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { TCNamespaceService } from '../../services/tc-namespace.service';
import type { Meld, MeldJoinPoint } from '../../types/meld.types';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

// Declare require for CommonJS module import
declare function require(module: string): any;

// meld is a CommonJS module, so we use require with proper typing
const meld = require('meld') as Meld;

/**
 * Handler for the native SITNA search control.
 * Simple control with a small patch to avoid recursive events.
 *
 * Control Type: sitna.search
 * Patches: Apply guard to prevent recursive FEATURESADD triggers
 * Configuration: Simple div + optional parameters
 */
@Injectable({
  providedIn: 'root'
})
export class SearchControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.search';
  readonly sitnaConfigKey = 'search';
  readonly requiredPatches = undefined; // Patches applied programmatically

  constructor(tcNamespaceService: TCNamespaceService) {
    super(tcNamespaceService);
  }

  /**
   * Apply patches to avoid recursive FEATURESADD events in SITNA Search.
   */
  override async loadPatches(_context: AppCfg): Promise<void> {
    await this.waitForTCAndApply(async (TC) => {
      const MapProto = TC?.Map?.prototype as
        | {
            trigger?: (type: string, options?: any) => void;
            __sitmunFeaturesAddPatched?: boolean;
          }
        | undefined;
      if (!MapProto || typeof MapProto.trigger !== 'function') {
        return;
      }

      if (MapProto.__sitmunFeaturesAddPatched) {
        return;
      }

      const advice = meld.around(
        MapProto,
        'trigger',
        function (this: any, joinPoint: MeldJoinPoint): any {
          const [type, _options] = joinPoint.args as [string, any];
          const featuresAddEvent = TC?.Consts?.event?.FEATURESADD;
          if (type !== featuresAddEvent) {
            return joinPoint.proceedApply(joinPoint.args);
          }

          const map = this as {
            __sitmunFeaturesAddDepth?: number;
          };

          if (map.__sitmunFeaturesAddDepth) {
            setTimeout(() => {
              joinPoint.proceedApply(joinPoint.args);
            }, 0);
            return;
          }

          map.__sitmunFeaturesAddDepth = 1;
          try {
            return joinPoint.proceedApply(joinPoint.args);
          } finally {
            delete map.__sitmunFeaturesAddDepth;
          }
        }
      );

      MapProto.__sitmunFeaturesAddPatched = true;
      this.patchManager.add(() => {
        meld.remove(advice);
        delete MapProto.__sitmunFeaturesAddPatched;
      });
    });
  }

  /**
   * Build configuration for search control.
   * Uses default div if no parameters provided.
   */
  buildConfiguration(
    task: AppTasks,
    _context: AppCfg
  ): SitnaControlConfig | null {
    const defaultConfig = this.getDefaultConfig();
    return this.mergeWithParameters(defaultConfig, task.parameters);
  }

  /**
   * Check if native search control is ready.
   * Verifies that TC.control.Search exists (native SITNA control).
   */
  override isReady(): boolean {
    const TC = this.tcNamespaceService.getTC();
    return !!TC?.control?.Search;
  }
}
