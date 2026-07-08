import { Injectable } from '@angular/core';

import { AppCfg } from '@api/model/app-cfg';

import { collapseCatalogCompositeWorkLayerPath } from './work-layer-display-path';
import { SitnaApiService } from '../../services/sitna-api.service';
import type { Meld, MeldJoinPoint } from '../../types/meld.types';
import { ControlHandlerBase } from '../control-handler-base';

declare function require(module: string): any;

const meld = require('meld') as Meld;

const WLM_ELEMENT_TEMPLATE_SUFFIX = '-elm';

/**
 * Handler for the native SITNA workLayerManager control.
 * Patches catalog composite layers so Loaded Layers matches single-layer UX (#161).
 */
@Injectable({
  providedIn: 'root'
})
export class WorkLayerManagerControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.workLayerManager';
  readonly sitnaConfigKey = 'workLayerManager';
  readonly requiredPatches = undefined;

  private patchesApplied = false;

  constructor(sitnaApi: SitnaApiService) {
    super(sitnaApi);
  }

  override async loadPatches(_context: AppCfg): Promise<void> {
    if (this.patchesApplied) {
      return;
    }

    await this.patchCatalogCompositeDisplayPath();
    this.patchesApplied = true;
  }

  private async patchCatalogCompositeDisplayPath(): Promise<void> {
    await this.withTCAsync(async (TC) => {
      const wlmProto = TC?.control?.WorkLayerManager?.prototype;
      if (!wlmProto || typeof wlmProto.getRenderedHtml !== 'function') {
        return;
      }

      const advice = meld.around(
        wlmProto,
        'getRenderedHtml',
        function (this: any, joinPoint: MeldJoinPoint): unknown {
          const templateId = joinPoint.args[0] as string;
          const layerData = joinPoint.args[1] as
            | { id?: string; path?: string[][] }
            | undefined;

          if (
            typeof templateId === 'string' &&
            templateId.endsWith(WLM_ELEMENT_TEMPLATE_SUFFIX) &&
            layerData &&
            Array.isArray(layerData.path) &&
            this.map &&
            typeof this.map.getLayer === 'function'
          ) {
            const layer = this.map.getLayer(layerData.id);
            const nodeId = layer?.options?.nodeId as string | undefined;
            const layerNameCount = Array.isArray(layer?.names)
              ? layer.names.length
              : 0;

            if (nodeId && layerNameCount > 1) {
              layerData.path = collapseCatalogCompositeWorkLayerPath(
                layerData.path,
                { nodeId, layerNameCount }
              );
            }
          }

          return joinPoint.proceed();
        }
      );

      this.patchManager.add(() => meld.remove(advice));
    });
  }
}
