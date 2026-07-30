import { inject, Injectable } from '@angular/core';

import { AppCfg } from '@api/model/app-cfg';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';


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
      const observer = new MutationObserver(() => {
        this.scrubOrphanWorkLayerRows(wlmControl);
        this.decorateGfiIndicators(wlmControl);
      });
      observer.observe(div, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
      });
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
      if (!this.configLookup.isQueryableLeaf(nodeId)) {
        // Consultable off on the tree node: hide Capas GFI and block identify.
        li.querySelector(`:scope .${WLM_GFI_CLASS}`)?.remove();
        if (layer?.options) {
          layer.options.sitmunGfiEnabled = false;
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
}
