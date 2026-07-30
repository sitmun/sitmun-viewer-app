import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { SitnaApiService } from '../../services/sitna-api.service';
import { UIStateService } from '../../services/ui-state.service';
import type { Meld, MeldJoinPoint } from '../../types/meld.types';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

declare function require(module: string): unknown;
const meld = require('meld') as Meld;

type LegendInfo = { legend?: Array<{ src?: string }> };

type RasterLegendTarget = {
  availableNames?: string[];
  names?: string[] | string;
  getInfo?: (name?: string) => LegendInfo;
  wrap?: { getInfo?: (name?: string) => LegendInfo };
};

/**
 * Handler for the native SITNA legend control.
 *
 * Control Type: sitna.legend
 * Patches: Capas-parity LegendURL fallback when Raster.getLegend fails (#164)
 * Configuration: Simple div + optional parameters
 */
@Injectable({
  providedIn: 'root'
})
export class LegendControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.legend';
  readonly sitnaConfigKey = 'legend';
  readonly requiredPatches = undefined;

  constructor(
    sitnaApi: SitnaApiService,
    private uiStateService: UIStateService
  ) {
    super(sitnaApi);
  }

  private getRasterPrototype(TC: any): any {
    return TC?.layer?.Raster?.prototype || TC?.wrap?.layer?.Raster?.prototype;
  }

  /**
   * Capas “i” uses getInfo().legend (capabilities Style/LegendURL).
   * sitna.legend calls getLegend(), which hard-requires DescribeLayer and
   * GetLegendGraphic on layer.url — broken for DiBa/ArcGIS WMS (#164).
   *
   * Also retries Legend.updateLayerTree when SITNA’s module-private
   * layerLoaded skipped insert (branch <ul> not ready / late LegendURL).
   */
  override async loadPatches(_context: AppCfg): Promise<void> {
    await this.withTCAsync(async (TC) => {
      const RasterProto = this.getRasterPrototype(TC);
      if (RasterProto?.getLegend && !RasterProto.__sitmunLegendUrlFallback) {
        const getLegendAdvice = meld.around(
          RasterProto,
          'getLegend',
          function (this: RasterLegendTarget, jp: MeldJoinPoint): unknown {
            const buildFromCapabilities = (): Promise<unknown[]> => {
              const names = Array.isArray(this.availableNames)
                ? this.availableNames
                : Array.isArray(this.names)
                  ? this.names
                  : typeof this.names === 'string' && this.names
                    ? [this.names]
                    : [];
              const resolveInfo = (name: string): LegendInfo | undefined => {
                if (typeof this.getInfo === 'function') {
                  return this.getInfo(name);
                }
                if (typeof this.wrap?.getInfo === 'function') {
                  return this.wrap.getInfo(name);
                }
                return undefined;
              };
              return Promise.all(
                names.map((name) => {
                  const src = resolveInfo(name)?.legend?.[0]?.src;
                  return src ? [{ layerName: name, src }] : null;
                })
              );
            };

            return Promise.resolve(jp.proceed() as Promise<unknown>)
              .then((result) => {
                if (Array.isArray(result) && result.filter(Boolean).length > 0) {
                  return result;
                }
                return buildFromCapabilities();
              })
              .catch(() => buildFromCapabilities());
          }
        );

        RasterProto.__sitmunLegendUrlFallback = true;
        this.patchManager.add(() => {
          getLegendAdvice.remove();
          delete RasterProto.__sitmunLegendUrlFallback;
        });
      }

      const LegendProto = TC?.control?.Legend?.prototype;
      if (LegendProto?.updateLayerTree && !LegendProto.__sitmunLegendTreeRetry) {
        const treeAdvice = meld.around(
          LegendProto,
          'updateLayerTree',
          function (
            this: {
              div?: HTMLElement;
              removeLayer?: (layer: { id?: string }) => void;
            },
            jp: MeldJoinPoint
          ): unknown {
            const layer = jp.args[0] as {
              id?: string;
              isBase?: boolean;
              options?: { stealth?: boolean };
              availableNames?: string[];
              getInfo?: (name?: string) => LegendInfo;
            };
            const shouldShow = (target: typeof layer): boolean => {
              if (!target || target.isBase || target.options?.stealth) {
                return false;
              }
              if (!target.availableNames) {
                return true;
              }
              return target.availableNames.some(
                (name) => !!target.getInfo?.(name)?.legend?.length
              );
            };

            return Promise.resolve(jp.proceed() as Promise<unknown>).then(
              (result) => {
                const ul = this.div?.querySelector('ul.tc-ctl-legend-branch');
                const existing =
                  layer?.id != null
                    ? this.div?.querySelector(
                        `sitna-layer-legend[data-layer-id="${layer.id}"]`
                      )
                    : null;
                if (!shouldShow(layer) || !ul || existing) {
                  return result;
                }
                // Clears sticky module-private layerLoaded when DOM node missing.
                this.removeLayer?.(layer);
                return jp.proceed();
              }
            );
          }
        );

        LegendProto.__sitmunLegendTreeRetry = true;
        this.patchManager.add(() => {
          treeAdvice.remove();
          delete LegendProto.__sitmunLegendTreeRetry;
        });
      }

      // Issue repro opens Legend after LAYERADD. LayerLegend.getLegend no-ops while
      // the left drawer is off-screen; refresh tree + symbology when it expands.
      this.wireLegendPanelOpenRefresh(TC);
    });
  }

  private wireLegendPanelOpenRefresh(TC: any): void {
    if ((document as any).__sitmunLegendPanelRefreshPending) {
      return;
    }
    (document as any).__sitmunLegendPanelRefreshPending = true;

    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    let attachedPanel: HTMLElement | null = null;
    let panelObserver: MutationObserver | null = null;
    let waitObserver: MutationObserver | null = null;

    const refresh = (leftPanel: HTMLElement): void => {
      if (
        leftPanel.classList.contains('tc-collapsed-left') ||
        leftPanel.classList.contains('tc-collapsed')
      ) {
        return;
      }
      const legendTab = leftPanel.querySelector('#legend-tab');
      const legendCtl = leftPanel.querySelector(
        '#tc-slot-legend.tc-ctl-legend, .tc-ctl-legend'
      );
      if (!legendCtl || legendTab?.classList.contains('tc-hidden')) {
        return;
      }
      const mapEl = document.querySelector('.tc-map');
      if (!TC?.Map?.get || !mapEl) {
        return;
      }
      const map = TC.Map.get(mapEl);
      const legend =
        map.getControlsByClass?.(TC.control.Legend)?.[0] ||
        (map.controls || []).find(
          (c: { CLASS?: string; div?: HTMLElement }) =>
            c?.CLASS === 'tc-ctl-legend' ||
            c?.div?.classList?.contains('tc-ctl-legend')
        );
      if (!legend?.updateLayerTree) {
        return;
      }
      void (async () => {
        for (const layer of [...(map.workLayers || [])]) {
          await legend.updateLayerTree(layer, true);
        }
        await Promise.all(
          Array.from(legendCtl.querySelectorAll('sitna-layer-legend')).map(
            (el) => {
              const node = el as HTMLElement & {
                getLegend?: () => Promise<unknown> | void;
              };
              return Promise.resolve(node.getLegend?.());
            }
          )
        );
      })();
    };

    const scheduleRefresh = (): void => {
      if (!attachedPanel) {
        return;
      }
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
      // After script.js toggles classes / visibility on legend-tab click.
      refreshTimer = setTimeout(() => refresh(attachedPanel!), 150);
    };

    const attach = (leftPanel: HTMLElement): void => {
      if ((leftPanel as any).__sitmunLegendPanelRefresh) {
        return;
      }
      attachedPanel = leftPanel;
      panelObserver = new MutationObserver(scheduleRefresh);
      panelObserver.observe(leftPanel, {
        attributes: true,
        attributeFilter: ['class']
      });
      leftPanel.addEventListener('click', scheduleRefresh, true);
      (leftPanel as any).__sitmunLegendPanelRefresh = true;
      waitObserver?.disconnect();
      waitObserver = null;
    };

    const existing = document.querySelector(
      'section.tc-left-panel, .tc-left-panel'
    ) as HTMLElement | null;
    if (existing) {
      attach(existing);
    } else {
      waitObserver = new MutationObserver(() => {
        const panel = document.querySelector(
          'section.tc-left-panel, .tc-left-panel'
        ) as HTMLElement | null;
        if (panel) {
          attach(panel);
        }
      });
      waitObserver.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    }

    this.patchManager.add(() => {
      panelObserver?.disconnect();
      waitObserver?.disconnect();
      if (attachedPanel) {
        attachedPanel.removeEventListener('click', scheduleRefresh, true);
        delete (attachedPanel as any).__sitmunLegendPanelRefresh;
      }
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
      delete (document as any).__sitmunLegendPanelRefreshPending;
    });
  }

  override buildConfiguration(
    task: AppTasks,
    context: AppCfg
  ): SitnaControlConfig | null {
    const config = super.buildConfiguration(task, context);
    this.uiStateService.enableLegendButton();
    return config;
  }
}
