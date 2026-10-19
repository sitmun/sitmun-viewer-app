import { inject, Injectable } from '@angular/core';

import type { AppCfg } from '@api/model/app-cfg';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';


import { catalogLayerPathTitles } from './catalog-layer-path';
import {
  collapseCatalogCompositeWorkLayerPath,
  removeOrphanWorkLayerElements
} from './work-layer-display-path';
import { ConfigLookupService } from '../../services/config-lookup.service';
import { SitnaApiService } from '../../services/sitna-api.service';
import type { Meld, MeldJoinPoint } from '../../types/meld.types';
import { ControlHandlerBase } from '../control-handler-base';

declare function require(module: string): any;

const meld = require('meld') as Meld;

const WLM_ELEMENT_TEMPLATE_SUFFIX = '-elm';
const WLM_GFI_CLASS = 'sitmun-wlm-gfi';
/** Sitna icon font `--icon-info` (PUA). SITMUN 2 associates “i” with GetFeatureInfo. */
const SITNA_ICON_INFO = '\ue923';
/** Material Icons ligature for layer metadata (not Sitna “i” / GFI). */
const MATERIAL_ICON_ARTICLE = 'article';

type CatalogLegendNode = {
  title?: string;
  name?: string;
  uid?: unknown;
  children?: CatalogLegendNode[];
  legend?: unknown;
};

function nestCatalogLegendTree(
  leaf: CatalogLegendNode | null | undefined,
  titles: string[]
): CatalogLegendNode | null | undefined {
  if (!leaf || titles.length <= 1) {
    return leaf;
  }
  const leafTitle = titles[titles.length - 1];
  let node: CatalogLegendNode = {
    ...leaf,
    title: leafTitle,
    name: typeof leaf.name === 'string' ? leaf.name : leafTitle,
    children: Array.isArray(leaf.children) ? leaf.children.slice() : []
  };
  for (let index = titles.length - 2; index >= 0; index -= 1) {
    const isRoot = index === 0;
    node = {
      title: titles[index],
      name: titles[index],
      uid: isRoot ? leaf.uid : undefined,
      children: [node]
    };
  }
  return node;
}

function wfsLegendSources(legend: unknown): string[] {
  const sources: string[] = [];
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (!value || typeof value !== 'object') {
      return;
    }
    const record = value as { src?: unknown; symbols?: unknown };
    if (typeof record.src === 'string' && record.src.length > 0) {
      sources.push(record.src);
    }
    if (record.symbols) {
      walk(record.symbols);
    }
  };
  walk(legend);
  return sources;
}

function wfsTreeLegendSources(tree: unknown): string[] {
  if (!tree || typeof tree !== 'object') {
    return [];
  }
  const record = tree as { legend?: unknown; children?: unknown };
  const sources = wfsLegendSources(record.legend);
  if (Array.isArray(record.children)) {
    for (const child of record.children) {
      sources.push(...wfsTreeLegendSources(child));
    }
  }
  return sources;
}

function setFeatureShowsPopup(
  layer: { features?: Array<{ showsPopup?: boolean }> },
  enabled: boolean
): void {
  for (const feature of layer.features ?? []) {
    feature.showsPopup = enabled;
  }
}

const WLM_PATH_SEPARATOR = ' \u203A ';

const GFI_I18N = {
  label: 'workLayerManager.gfi.label',
  on: 'workLayerManager.gfi.on',
  off: 'workLayerManager.gfi.off',
  unavailable: 'workLayerManager.gfi.unavailable'
} as const;

/**
 * Handler for the native SITNA workLayerManager control.
 * Patches catalog composite layers so Loaded Layers matches single-layer UX (#161).
 * Capas GFI toggle (Sitna info / “i” glyph) controls per-layer GetFeatureInfo via
 * `layer.options.sitmunGfiEnabled`.
 */
@Injectable({
  providedIn: 'root'
})
export class WorkLayerManagerControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.workLayerManager';
  readonly sitnaConfigKey = 'workLayerManager';
  readonly requiredPatches = undefined;

  private readonly configLookup = inject(ConfigLookupService);
  private readonly translate = inject(TranslateService);
  private patchesApplied = false;
  private readonly wlmGfiObservers = new WeakMap<object, MutationObserver>();
  private readonly wlmGfiVisibilityHooks = new WeakSet<object>();
  private readonly wlmGfiTracked = new WeakSet<object>();
  private readonly wlmGfiChangeHooks = new WeakSet<object>();
  private wlmDecorating = false;
  private readonly wlmGfiRoots = new Set<ParentNode>();
  private readonly wlmGfiControls = new Set<object>();
  private langChangeSub?: Subscription;

  constructor(sitnaApi: SitnaApiService) {
    super(sitnaApi);
  }

  override async loadPatches(_context: AppCfg): Promise<void> {
    if (this.patchesApplied) {
      return;
    }

    await this.patchCatalogCompositeDisplayPath();
    await this.patchWfsScaleRow();
    await this.patchWfsLegendTree();
    await this.patchWlmGfiDecoration();
    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      for (const control of this.wlmGfiControls) {
        this.decorateGfiIndicators(control);
      }
    });
    this.patchManager.add(() => {
      this.langChangeSub?.unsubscribe();
      this.langChangeSub = undefined;
    });
    this.patchesApplied = true;
  }

  override cleanup(): void {
    for (const root of this.wlmGfiRoots) {
      root.querySelectorAll(`.${WLM_GFI_CLASS}`).forEach((el) => el.remove());
    }
    this.wlmGfiRoots.clear();
    this.wlmGfiControls.clear();
    super.cleanup();
    this.patchesApplied = false;
  }

  private gfiLabel(): string {
    return this.translate.instant(GFI_I18N.label);
  }

  private gfiTitle(blocked: boolean, enabled: boolean): string {
    const key = blocked
      ? GFI_I18N.unavailable
      : enabled
        ? GFI_I18N.on
        : GFI_I18N.off;
    return this.translate.instant(key);
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

          const rendered = joinPoint.proceed();
          // Abort late elm HTML when the layer was removed during legend fetch.
          if (
            typeof templateId === 'string' &&
            templateId.endsWith(WLM_ELEMENT_TEMPLATE_SUFFIX) &&
            layerData?.id &&
            this.map &&
            typeof this.map.getLayer === 'function'
          ) {
            const map = this.map;
            const layerId = layerData.id;
            return Promise.resolve(rendered).then((html) => {
              if (!map.getLayer(layerId)) {
                // Never settle: SITNA's then() must not insert a Capas LI.
                return new Promise(() => undefined);
              }
              return html;
            });
          }
          return rendered;
        }
      );

      this.patchManager.add(() => advice.remove());
    });
  }

  private async patchWfsScaleRow(): Promise<void> {
    await this.withTCAsync(async (TC) => {
      const wlmProto = TC?.control?.WorkLayerManager?.prototype;
      if (!wlmProto || typeof wlmProto.updateScale !== 'function') {
        return;
      }
      if (wlmProto.__sitmunWfsScale) {
        return;
      }

      const advice = meld.around(
        wlmProto,
        'updateScale',
        function (this: {
          CLASS: string;
          map?: {
            getLayer?: (id: string) =>
              | {
                  type?: string;
                  minResolution?: number;
                  maxResolution?: number;
                  options?: {
                    type?: string;
                    minResolution?: number;
                    maxResolution?: number;
                  };
                }
              | undefined;
            getResolution?: () => number;
          };
          getLayerUIElements?: () => HTMLElement[];
        }, joinPoint: MeldJoinPoint): unknown {
          const result = joinPoint.proceed();
          const resolution = this.map?.getResolution?.();
          const rows = this.getLayerUIElements?.() ?? [];
          for (const li of rows) {
            const layer = this.map?.getLayer?.(li.dataset['layerId'] ?? '');
            if (
              !layer ||
              (layer.type !== 'WFS' && layer.options?.type !== 'WFS')
            ) {
              continue;
            }
            const min = layer.options?.minResolution ?? layer.minResolution;
            const max = layer.options?.maxResolution ?? layer.maxResolution;
            let visible = true;
            if (typeof resolution === 'number') {
              if (typeof min === 'number' && resolution < min) {
                visible = false;
              }
              if (typeof max === 'number' && resolution > max) {
                visible = false;
              }
            }
            li.classList.toggle(this.CLASS + '-elm-notvisible', !visible);
          }
          return result;
        }
      );
      wlmProto.__sitmunWfsScale = true;
      this.patchManager.add(() => {
        advice.remove();
        delete wlmProto.__sitmunWfsScale;
      });
    });
  }

  private async patchWfsLegendTree(): Promise<void> {
    await this.withTCAsync(async (TC) => {
      const vectorProto = TC?.layer?.Vector?.prototype as
        | {
            getTree?: () => unknown;
            __sitmunWfsLegendTree?: boolean;
          }
        | undefined;
      if (
        !vectorProto ||
        typeof vectorProto.getTree !== 'function' ||
        vectorProto.__sitmunWfsLegendTree
      ) {
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const handler = this;
      const advice = meld.around(
        vectorProto,
        'getTree',
        function (
          this: {
            type?: string;
            options?: { type?: string; nodeId?: string };
            __sitmunNestedLegend?: {
              source: CatalogLegendNode;
              key: string;
              tree: CatalogLegendNode;
            };
          },
          joinPoint: MeldJoinPoint
        ): unknown {
          const tree = joinPoint.proceed() as
            | CatalogLegendNode
            | null
            | undefined;
          if (this.type !== 'WFS' && this.options?.type !== 'WFS') {
            return tree;
          }
          const nodeId = this.options?.nodeId;
          if (!nodeId || !tree) {
            return tree;
          }
          const appCfg = handler.sitnaApi.getGlobal('currentAppCfg');
          if (!appCfg) {
            return tree;
          }
          const titles = catalogLayerPathTitles(nodeId, appCfg);
          if (titles.length <= 1) {
            return tree;
          }
          const key = titles.join('\0');
          const cached = this.__sitmunNestedLegend;
          if (cached && cached.source === tree && cached.key === key) {
            return cached.tree;
          }
          const nested = nestCatalogLegendTree(tree, titles);
          if (nested && nested !== tree) {
            this.__sitmunNestedLegend = { source: tree, key, tree: nested };
          }
          return nested;
        }
      );
      vectorProto.__sitmunWfsLegendTree = true;
      this.patchManager.add(() => {
        advice.remove();
        delete vectorProto.__sitmunWfsLegendTree;
      });
    });
  }

  private async patchWlmGfiDecoration(): Promise<void> {
    await this.withTCAsync(async (TC) => {
      const wlmProto = TC?.control?.WorkLayerManager?.prototype;
      if (!wlmProto || typeof wlmProto.updateLayerTree !== 'function') {
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const handler = this;
      const advice = meld.around(
        wlmProto,
        'updateLayerTree',
        function (this: any, joinPoint: MeldJoinPoint): unknown {
          handler.ensureWlmGfiObserver(this);
          const result = joinPoint.proceed();
          handler.paintMissingWfsLegends(this);
          queueMicrotask(() => {
            handler.scrubOrphanWorkLayerRows(this);
            handler.decorateGfiIndicators(this);
          });
          return result;
        }
      );

      this.patchManager.add(() => {
        advice.remove();
      });
    });
  }

  private paintMissingWfsLegends(wlmControl: {
    map?: {
      getLayer?: (id: string) =>
        | {
            type?: string;
            options?: { type?: string };
            getTree?: () => { legend?: unknown };
          }
        | undefined;
    };
    getLayerUIElements?: () => HTMLElement[];
  }): void {
    const rows = wlmControl.getLayerUIElements?.() ?? [];
    for (const li of rows) {
      if (li.querySelector('.tc-ctl-wlm-legend img, .tc-ctl-wlm-custom-legend img')) {
        continue;
      }
      const layer = wlmControl.map?.getLayer?.(li.dataset['layerId'] ?? '');
      if (!layer || (layer.type !== 'WFS' && layer.options?.type !== 'WFS')) {
        continue;
      }
      const sources = wfsTreeLegendSources(layer.getTree?.());
      if (!sources.length) {
        continue;
      }
      const box = document.createElement('div');
      box.className = 'tc-ctl-wlm-legend';
      for (const src of sources) {
        const img = document.createElement('img');
        img.setAttribute('data-img', src);
        box.append(img);
      }
      li.append(box);
    }
  }

  private ensureWlmGfiObserver(wlmControl: any): void {
    const div = wlmControl?.div as HTMLElement | undefined;
    const map = wlmControl?.map;
    if (!div) {
      return;
    }

    if (!this.wlmGfiControls.has(wlmControl)) {
      this.wlmGfiControls.add(wlmControl);
      this.patchManager.add(() => this.wlmGfiControls.delete(wlmControl));
    }

    if (!this.wlmGfiObservers.has(wlmControl)) {
      const observe = (): void => {
        observer.observe(div, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['class']
        });
      };
      const observer = new MutationObserver(() => {
        // Decorating writes the same subtree. Disconnect so those writes
        // cannot schedule another pass.
        observer.disconnect();
        try {
          this.scrubOrphanWorkLayerRows(wlmControl);
          this.decorateGfiIndicators(wlmControl);
        } finally {
          observe();
        }
      });
      observe();
      this.wlmGfiObservers.set(wlmControl, observer);
      this.patchManager.add(() => {
        observer.disconnect();
        this.wlmGfiObservers.delete(wlmControl);
      });
    }

    if (
      map &&
      typeof map.on === 'function' &&
      !this.wlmGfiVisibilityHooks.has(wlmControl)
    ) {
      const onVisibility = () => this.decorateGfiIndicators(wlmControl);
      map.on('layervisibility.tc', onVisibility);
      map.on('layervisibility', onVisibility);
      this.wlmGfiVisibilityHooks.add(wlmControl);
      this.patchManager.add(() => {
        if (typeof map.off === 'function') {
          map.off('layervisibility.tc', onVisibility);
          map.off('layervisibility', onVisibility);
        }
      });
    }

    if (!this.wlmGfiChangeHooks.has(wlmControl)) {
      const onChange = (event: Event) => {
        const target = event.target as HTMLElement | null;
        if (!target?.classList?.contains(WLM_GFI_CLASS)) {
          return;
        }
        const li = target.closest(
          'li.tc-ctl-wlm-elm[data-layer-id]'
        ) as HTMLElement | null;
        const layerId = li?.dataset['layerId'];
        if (!li || !layerId || typeof map?.getLayer !== 'function') {
          return;
        }
        if (
          li.classList.contains('tc-ctl-wlm-elm-notvisible') ||
          target.hasAttribute('disabled')
        ) {
          return;
        }
        const layer = map.getLayer(layerId);
        if (!layer?.options) {
          return;
        }
        const checked = target.hasAttribute('checked');
        layer.options.sitmunGfiEnabled = checked;
        setFeatureShowsPopup(layer, checked);
        target.setAttribute(
          'data-sitmun-wlm-gfi',
          checked ? 'enabled' : 'off'
        );
        target.title = this.gfiTitle(false, checked);
      };
      div.addEventListener('change', onChange);
      this.wlmGfiChangeHooks.add(wlmControl);
      this.patchManager.add(() => {
        div.removeEventListener('change', onChange);
        this.wlmGfiChangeHooks.delete(wlmControl);
      });
    }
  }

  /** Remove Capas LIs left behind by SITNA's async updateLayerTree race. */
  private scrubOrphanWorkLayerRows(wlmControl: any): void {
    const div = wlmControl?.div as ParentNode | undefined;
    const map = wlmControl?.map;
    if (!div || !map || typeof map.getLayer !== 'function') {
      return;
    }
    removeOrphanWorkLayerElements(div, (id) => map.getLayer(id));
  }

  /** Inject / sync Capas GFI toggles for queryable catalog leaves. */
  private decorateGfiIndicators(wlmControl: any): void {
    if (this.wlmDecorating) {
      return;
    }
    this.wlmDecorating = true;
    try {
      this.decorateGfiIndicatorsNow(wlmControl);
    } finally {
      queueMicrotask(() => {
        this.wlmDecorating = false;
      });
    }
  }

  private decorateGfiIndicatorsNow(wlmControl: any): void {
    const div = wlmControl?.div as ParentNode | undefined;
    const map = wlmControl?.map;
    if (!div || !map || typeof map.getLayer !== 'function') {
      return;
    }

    this.ensureWlmGfiObserver(wlmControl);
    this.wlmGfiRoots.add(div);
    if (!this.wlmGfiTracked.has(wlmControl)) {
      this.wlmGfiTracked.add(wlmControl);
      this.patchManager.add(() => {
        div.querySelectorAll(`.${WLM_GFI_CLASS}`).forEach((el) => el.remove());
        this.wlmGfiRoots.delete(div);
      });
    }

    div.querySelectorAll('li.tc-ctl-wlm-elm[data-layer-id]').forEach((node) => {
      const li = node as HTMLElement;
      const layerId = li.dataset['layerId'];
      if (!layerId) {
        return;
      }

      const layer = map.getLayer(layerId);
      const nodeId = layer?.options?.nodeId as string | undefined;
      const tools = li.querySelector('.tc-ctl-wlm-tools');
      if (!tools || !nodeId) {
        return;
      }
      this.syncWfsWorkLayerRow(li, layer);
      if (!this.configLookup.isQueryableLeaf(nodeId)) {
        // Consultable off on the tree node: hide Capas GFI and block identify.
        li.querySelector(`:scope .${WLM_GFI_CLASS}`)?.remove();
        if (layer?.options) {
          layer.options.sitmunGfiEnabled = false;
          setFeatureShowsPopup(layer, false);
        }
        return;
      }

      if (layer.options && layer.options.sitmunGfiEnabled === undefined) {
        layer.options.sitmunGfiEnabled = true;
      }
      const userOn = layer.options?.sitmunGfiEnabled !== false;

      let gfi = tools.querySelector(`:scope > .${WLM_GFI_CLASS}`) as
        | HTMLElement
        | null;
      if (gfi && gfi.tagName !== 'SITNA-TOGGLE') {
        gfi.remove();
        gfi = null;
      }
      const meta = tools.querySelector(
        ':scope > .tc-ctl-wlm-cb-info, :scope > sitna-toggle.tc-ctl-wlm-cb-info'
      ) as HTMLElement | null;
      if (meta) {
        meta.setAttribute('checked-icon-text', MATERIAL_ICON_ARTICLE);
        meta.setAttribute('unchecked-icon-text', MATERIAL_ICON_ARTICLE);
      }
      if (!gfi) {
        gfi = document.createElement('sitna-toggle');
        gfi.className = WLM_GFI_CLASS;
        gfi.setAttribute('checked-icon-text', SITNA_ICON_INFO);
        gfi.setAttribute('unchecked-icon-text', SITNA_ICON_INFO);
        if (meta) {
          tools.insertBefore(gfi, meta);
        } else {
          tools.insertBefore(gfi, tools.firstChild);
        }
      }

      const blocked =
        li.classList.contains('tc-ctl-wlm-elm-notvisible') ||
        (typeof layer?.getVisibility === 'function' &&
          layer.getVisibility() === false);
      const state = blocked ? 'disabled' : userOn ? 'enabled' : 'off';
      if (gfi.getAttribute('data-sitmun-wlm-gfi') !== state) {
        gfi.setAttribute('data-sitmun-wlm-gfi', state);
      }
      gfi.toggleAttribute('disabled', blocked);
      gfi.setAttribute('aria-disabled', blocked ? 'true' : 'false');
      gfi.toggleAttribute('checked', userOn);
      gfi.setAttribute('aria-label', this.gfiLabel());
      gfi.title = this.gfiTitle(blocked, userOn);
    });
  }

  private syncWfsWorkLayerRow(
    li: HTMLElement,
    layer: {
      id?: string;
      type?: string;
      title?: string;
      tree?: unknown;
      options?: { type?: string; nodeId?: string };
    }
  ): void {
    if (layer.type !== 'WFS' && layer.options?.type !== 'WFS') {
      return;
    }
    const nodeId = layer.options?.nodeId;
    const leafTitle = nodeId
      ? this.configLookup.findNode(nodeId)?.title?.trim()
      : undefined;
    if (leafTitle) {
      const heading = this.wfsWorkLayerHeading(nodeId);
      const titleEl = li.querySelector('.tc-ctl-wlm-lyr') as HTMLElement | null;
      if (titleEl && heading) {
        if (titleEl.textContent !== heading) {
          titleEl.textContent = heading;
        }
        if (titleEl.title !== heading) {
          titleEl.title = heading;
        }
      }
      const description = this.wfsWorkLayerDescription(nodeId);
      const pathEl = li.querySelector('.tc-ctl-wlm-path') as HTMLElement | null;
      if (pathEl && description) {
        if (pathEl.textContent !== description) {
          pathEl.textContent = description;
        }
        if (pathEl.title !== description) {
          pathEl.title = description;
        }
      }
      if (layer.title !== leafTitle) {
        layer.title = leafTitle;
        layer.tree = null;
      }
    }

    const tools = li.querySelector('.tc-ctl-wlm-tools');
    if (!tools) {
      return;
    }
    tools.querySelectorAll(':scope > sitna-button').forEach((button) => {
      if (
        button.classList.contains('tc-ctl-wlm-btn-zoom') ||
        button.classList.contains('tc-ctl-wlm-btn-del') ||
        button.classList.contains('tc-ctl-wlm-btn-more')
      ) {
        return;
      }
      button.classList.add('tc-ctl-wlm-btn-dl');
    });
  }

  private wfsWorkLayerHeading(nodeId: string | undefined): string {
    const titles = this.catalogPathTitles(nodeId);
    return titles.length > 1 ? titles[0] : '';
  }

  private wfsWorkLayerDescription(nodeId: string | undefined): string {
    return this.catalogPathTitles(nodeId).slice(1).join(WLM_PATH_SEPARATOR);
  }

  private catalogPathTitles(nodeId: string | undefined): string[] {
    if (!nodeId) {
      return [];
    }
    const appCfg = this.sitnaApi.getGlobal('currentAppCfg');
    if (!appCfg) {
      return [];
    }
    return catalogLayerPathTitles(nodeId, appCfg);
  }
}
