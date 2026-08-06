import { Injectable, inject } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';
import { TranslateService } from '@ngx-translate/core';
import DOMPurify from 'dompurify';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import {
  MoreInfoAdvancedService,
  MiaRenderedTask,
  MiaTask
} from '../../services/more-info-advanced.service';
import { SitnaApiService } from '../../services/sitna-api.service';
import type { Meld, MeldJoinPoint } from '../../types/meld.types';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

declare function require(module: string): unknown;
const meld = require('meld') as Meld;

const MIA_HTML_SANITIZE_OPTIONS: DOMPurify.Config = {
  ADD_TAGS: ['iframe'],
  ADD_ATTR: [
    'allow',
    'allowfullscreen',
    'frameborder',
    'scrolling',
    'src',
    'title',
    'width',
    'height',
    'target',
    'rel',
  ],
};

/** Delay so SITNA FeatureInfo can finish its own popup DOM before MIA opens. */
const MIA_OPEN_DELAY_MS = 350;

const MIA_EMPTY_FALLBACK_HTML = '<div class="sitmun-mia-empty">No data</div>';

export function sanitizeMiaRenderedHtml(
  html: string,
  emptyFallbackHtml: string = MIA_EMPTY_FALLBACK_HTML
): string {
  const sanitized = DOMPurify.sanitize(
    html || emptyFallbackHtml,
    MIA_HTML_SANITIZE_OPTIONS
  );
  return forceMiaOutboundLinksNewTab(String(sanitized));
}

/**
 * Keep the map viewer in place: navigable anchors open in a new tab with noopener.
 * Hash / javascript: hrefs are left unchanged.
 */
export function forceMiaOutboundLinksNewTab(html: string): string {
  const doc = new DOMParser().parseFromString(html || '', 'text/html');
  for (const anchor of Array.from(doc.body.querySelectorAll('a[href]'))) {
    const href = (anchor.getAttribute('href') || '').trim();
    if (!href || href.startsWith('#') || /^javascript:/i.test(href)) {
      continue;
    }
    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('rel', 'noopener noreferrer');
  }
  return doc.body.innerHTML;
}

export interface MiaGfiTarget {
  miaTasks: MiaTask[];
  featureData: Record<string, unknown>;
  featureKey: string;
  layerName: string;
}

export interface MiaGfiResolveDeps {
  getCartographyIdFromLayerName: (layerName: string) => string | null;
  getTasksForCartography: (cartographyId: string) => MiaTask[];
}

function featureDataOf(feature: any): Record<string, unknown> {
  if (!feature) return {};
  if (typeof feature.getData === 'function') {
    return feature.getData() || {};
  }
  return feature.data || {};
}

function featureKeyOf(layerName: string, feature: any): string {
  const data = featureDataOf(feature);
  try {
    return `${layerName}::${JSON.stringify(data)}`;
  } catch {
    return `${layerName}::${String(data?.['id'] ?? '')}`;
  }
}

/**
 * Pick MIA tasks + feature attrs from a FeatureInfo-shaped GFI payload.
 * Only layers that map to a cartography with MIA parents are candidates.
 * Prefer `currentFeature` when it belongs to such a layer; otherwise the first
 * feature of the first MIA-capable layer (skipping earlier non-MIA layers).
 * Match uses reference equality (`Array.includes`); if SITNA hands a cloned
 * feature object, preference fails and the first MIA hit is used instead.
 */
export function resolveMiaGfiTarget(
  options: { services?: any[] } | null | undefined,
  deps: MiaGfiResolveDeps,
  currentFeature?: any
): MiaGfiTarget | null {
  if (!options?.services || !Array.isArray(options.services)) {
    return null;
  }

  type Hit = {
    layerName: string;
    miaTasks: MiaTask[];
    features: any[];
  };
  const hits: Hit[] = [];

  for (const service of options.services) {
    if (!Array.isArray(service?.layers)) continue;
    for (const layer of service.layers) {
      if (!Array.isArray(layer?.features) || layer.features.length === 0) continue;
      const cartographyId = deps.getCartographyIdFromLayerName(layer.name);
      if (!cartographyId) continue;
      const miaTasks = deps.getTasksForCartography(cartographyId);
      if (miaTasks.length === 0) continue;
      hits.push({
        layerName: layer.name,
        miaTasks,
        features: layer.features
      });
    }
  }

  if (hits.length === 0) {
    return null;
  }

  if (currentFeature) {
    for (const hit of hits) {
      if (hit.features.includes(currentFeature)) {
        return {
          miaTasks: hit.miaTasks,
          featureData: featureDataOf(currentFeature),
          featureKey: featureKeyOf(hit.layerName, currentFeature),
          layerName: hit.layerName
        };
      }
    }
  }

  const hit = hits[0];
  const feature = hit.features[0];
  return {
    miaTasks: hit.miaTasks,
    featureData: featureDataOf(feature),
    featureKey: featureKeyOf(hit.layerName, feature),
    layerName: hit.layerName
  };
}

@Injectable({
  providedIn: 'root'
})
export class MoreInfoAdvancedControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.moreInfoAdvanced';
  readonly sitnaConfigKey = undefined;
  readonly requiredPatches = undefined;

  private readonly miaService = inject(MoreInfoAdvancedService);
  private readonly translate = inject(TranslateService);
  private appConfig: AppCfg | null = null;
  private miaOverlayElement: HTMLElement | null = null;
  private floatingZIndex = 10050;
  private renderGeneration = 0;
  private openTimer: ReturnType<typeof setTimeout> | null = null;
  private renderSub: Subscription | null = null;
  private lastGfiOptions: { services?: any[] } | null = null;
  private lastOpenedFeatureKey: string | null = null;
  private readonly mapEventCleanups: Array<() => void> = [];

  constructor(sitnaApi: SitnaApiService) {
    super(sitnaApi);
  }

  /** Abort in-flight open timer / render; bumps generation so late fills are ignored. */
  cancelMiaRender(): void {
    if (this.openTimer != null) {
      clearTimeout(this.openTimer);
      this.openTimer = null;
    }
    this.renderSub?.unsubscribe();
    this.renderSub = null;
    this.renderGeneration++;
  }

  /**
   * Map rebuild / clearMap: abort in-flight work and drop overlay DOM + GFI cache.
   */
  clearOverlayForMapRebuild(): void {
    this.cancelMiaRender();
    this.lastGfiOptions = null;
    this.removeMiaOverlay();
  }

  onMapClear(_map?: object): void {
    this.clearOverlayForMapRebuild();
  }

  /**
   * Test hook: open MIA from a FeatureInfo-shaped payload (optional currentFeature).
   */
  openMiaFromGfiOptionsForTest(
    options: { services?: any[] },
    currentFeature?: any
  ): void {
    this.tryOpenMiaPopup(options, currentFeature);
  }

  override cleanup(): void {
    this.clearOverlayForMapRebuild();
    while (this.mapEventCleanups.length > 0) {
      this.mapEventCleanups.pop()?.();
    }
    super.cleanup();
  }

  private removeMiaOverlay(): void {
    if (this.miaOverlayElement) {
      this.miaOverlayElement.remove();
    }
    this.miaOverlayElement = null;
    this.lastOpenedFeatureKey = null;
  }

  override buildConfiguration(_task: AppTasks, context: AppCfg): SitnaControlConfig | null {
    this.appConfig = context;
    this.miaService.initialize(context);
    return null;
  }

  override async loadPatches(context: AppCfg): Promise<void> {
    this.appConfig = context;
    this.miaService.initialize(context);
    await this.withTCAsync(async (TC) => {
      const mapProto = TC?.Map?.prototype;
      if (mapProto && !mapProto.__sitmunMiaZIndex) {
        const bringFloatingPopupToFront = (event: PointerEvent) => {
          const target = event.target as HTMLElement | null;
          const popup = target?.closest?.(
            '.sitmun-mia-popup-overlay, .tc-ctl-popup'
          ) as HTMLElement | null;
          if (!popup) return;
          popup.style.zIndex = String(++this.floatingZIndex);
        };
        document.addEventListener('pointerdown', bringFloatingPopupToFront, true);
        mapProto.__sitmunMiaZIndex = true;
        this.patchManager.add(() => {
          document.removeEventListener(
            'pointerdown',
            bringFloatingPopupToFront,
            true
          );
          delete mapProto.__sitmunMiaZIndex;
        });
      }

      const fiProto = TC?.control?.FeatureInfo?.prototype;
      if (fiProto?.responseCallback && !fiProto.__sitmunMiaResponseCallback) {
        const responseCallbackAdvice = meld.around(
          fiProto,
          'responseCallback',
          (jp: MeldJoinPoint) => {
            const [options] = jp.args as [any];
            const control = jp.target as any;
            const result = jp.proceedApply(jp.args);

            if (options?.services && this.miaService.hasMiaTasks()) {
              this.lastGfiOptions = options;
              this.ensureFeatureSelectionHook(control);
              this.cancelMiaRender();
              this.openTimer = setTimeout(() => {
                this.openTimer = null;
                this.tryOpenMiaPopup(options);
              }, MIA_OPEN_DELAY_MS);
            }

            return result;
          }
        );
        fiProto.__sitmunMiaResponseCallback = true;
        this.patchManager.add(() => {
          responseCallbackAdvice.remove();
          delete fiProto.__sitmunMiaResponseCallback;
        });
      }
    });
  }

  private ensureFeatureSelectionHook(featureInfoControl: any): void {
    if (!featureInfoControl || featureInfoControl.__sitmunMiaFiEvents) {
      return;
    }
    const map = featureInfoControl.map;
    if (!map?.on) {
      return;
    }

    const onDisplayRender = (e: any) => {
      const displayControl = e?.control;
      if (!displayControl) return;

      const isFromFeatureInfo = displayControl.caller === featureInfoControl;
      const isHighlightedPopup =
        displayControl.currentFeature?.showsPopup === true;
      if (!isFromFeatureInfo && !isHighlightedPopup) {
        return;
      }

      const currentFeature = displayControl.currentFeature;
      if (!currentFeature || !this.lastGfiOptions) {
        return;
      }

      this.tryOpenMiaPopup(this.lastGfiOptions, currentFeature);
    };

    map.on('popup.tc drawtable.tc', onDisplayRender);
    featureInfoControl.__sitmunMiaFiEvents = { map, onDisplayRender };
    this.mapEventCleanups.push(() => {
      map.off?.('popup.tc drawtable.tc', onDisplayRender);
      delete featureInfoControl.__sitmunMiaFiEvents;
    });
  }

  private resolveDeps(): MiaGfiResolveDeps {
    return {
      getCartographyIdFromLayerName: (name) =>
        this.getCartographyIdFromLayerName(name),
      getTasksForCartography: (id) => this.miaService.getTasksForCartography(id)
    };
  }

  private tryOpenMiaPopup(options: any, currentFeature?: any): void {
    const target = resolveMiaGfiTarget(
      options,
      this.resolveDeps(),
      currentFeature
    );
    if (!target) {
      return;
    }

    const overlayVisible = !!this.miaOverlayElement?.classList.contains(
      'sitmun-mia-popup-visible'
    );
    if (
      overlayVisible &&
      this.lastOpenedFeatureKey === target.featureKey
    ) {
      return;
    }

    this.cancelMiaRender();
    this.openMiaPopup(target.miaTasks, target.featureData, target.featureKey);
  }

  private openMiaPopup(
    miaTasks: MiaTask[],
    featureData: Record<string, any>,
    featureKey: string
  ): void {
    this.renderSub?.unsubscribe();
    this.renderSub = null;

    const overlay = this.ensureMiaOverlay();
    if (!overlay) return;

    const popupId = 'mia-popup-' + Date.now();
    const contentDiv = overlay.querySelector(
      '.tc-ctl-popup-content'
    ) as HTMLElement | null;
    if (!contentDiv) return;
    contentDiv.innerHTML = this.buildMiasHtml(popupId, miaTasks);

    const position = this.getInitialMiaOverlayPosition(overlay);
    this.placeMiaOverlayAt(position.left, position.top);
    overlay.classList.add('sitmun-mia-popup-visible');
    overlay.style.zIndex = String(++this.floatingZIndex);

    this.wireTopLevelMiaTabs(popupId, contentDiv);
    this.wireBackendRenderedTabs(contentDiv);

    this.lastOpenedFeatureKey = featureKey;
    const generation = this.renderGeneration;

    this.renderSub = this.miaService
      .renderMiaTasks(miaTasks, featureData)
      .pipe(take(1))
      .subscribe({
        next: (renderedTasks) => {
          if (generation !== this.renderGeneration) return;
          this.fillRenderedMiaTasks(contentDiv, renderedTasks);
        },
        error: (error) => {
          if (generation !== this.renderGeneration) return;
          this.fillRenderedMiaError(
            contentDiv,
            error?.message || 'MIA rendering failed'
          );
        }
      });
  }

  private ensureMiaOverlay(): HTMLElement | null {
    if (this.miaOverlayElement && !this.miaOverlayElement.isConnected) {
      this.miaOverlayElement = null;
    }
    if (this.miaOverlayElement) {
      this.refreshMiaOverlayChrome(this.miaOverlayElement);
      return this.miaOverlayElement;
    }

    const overlay = document.createElement('div');
    overlay.className = 'sitmun-mia-popup-overlay';
    const toolbar = document.createElement('div');
    toolbar.className = 'sitmun-mia-popup-toolbar';
    const title = document.createElement('span');
    title.className = 'sitmun-mia-popup-toolbar-title';
    toolbar.appendChild(title);
    toolbar.appendChild(this.createMiaCloseControl());
    const content = document.createElement('div');
    content.className = 'tc-ctl-popup-content sitmun-mia-popup-content';
    overlay.appendChild(toolbar);
    overlay.appendChild(content);
    this.refreshMiaOverlayChrome(overlay);
    this.addMiaOverlayPointerHandlers(overlay);

    document.body.appendChild(overlay);
    this.miaOverlayElement = overlay;

    return overlay;
  }

  /**
   * Match SITNA FeatureInfo popup close: sitna-button.tc-ctl-popup-close with
   * localized title/label (api-sitna tc-ctl-popup template).
   */
  private createMiaCloseControl(): HTMLElement {
    const useSitnaButton = !!customElements.get('sitna-button');
    const close = document.createElement(
      useSitnaButton ? 'sitna-button' : 'button'
    ) as HTMLElement;
    if (!useSitnaButton) {
      (close as HTMLButtonElement).type = 'button';
    } else {
      close.setAttribute('variant', 'minimal');
    }
    close.className = 'tc-ctl-popup-close sitmun-mia-popup-close';
    // Match SITNA Popup.js (pointerup). Avoid also binding click (would double-fire).
    close.addEventListener('pointerup', () => {
      this.hideMiaOverlay();
    });
    return close;
  }

  private refreshMiaOverlayChrome(overlay: HTMLElement): void {
    const title = overlay.querySelector('.sitmun-mia-popup-toolbar-title');
    if (title) {
      title.textContent = this.translate.instant('mia.popup.title');
    }
    const close = overlay.querySelector('.sitmun-mia-popup-close');
    if (close) {
      const label = this.translate.instant('mia.popup.close');
      close.setAttribute('title', label);
      close.setAttribute('aria-label', label);
      close.textContent = label;
    }
  }

  private addMiaOverlayPointerHandlers(overlay: HTMLElement): void {
    let dragging = false;
    let pointerId: number | null = null;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    overlay.addEventListener('pointerdown', (event: PointerEvent) => {
      event.stopPropagation();
      overlay.style.zIndex = String(++this.floatingZIndex);

      const target = event.target as HTMLElement | null;
      const isDragHandle = !!target?.closest('.sitmun-mia-popup-toolbar');
      // sitna-button is not a native <button>; excluding it avoids setPointerCapture
      // stealing pointerup from .sitmun-mia-popup-close (SITNA close uses pointerup).
      const isInteractive = !!target?.closest(
        'button, a, input, select, textarea, sitna-button, .sitmun-mia-popup-close, .tc-ctl-popup-close'
      );
      if (!isDragHandle || isInteractive) return;

      event.preventDefault();
      dragging = true;
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      startLeft = overlay.offsetLeft;
      startTop = overlay.offsetTop;
      overlay.setPointerCapture?.(event.pointerId);
    });

    overlay.addEventListener('pointermove', (event: PointerEvent) => {
      event.stopPropagation();
      if (!dragging || pointerId !== event.pointerId) return;
      event.preventDefault();
      const nextLeft = startLeft + event.clientX - startX;
      const nextTop = startTop + event.clientY - startY;
      this.placeMiaOverlayAt(nextLeft, nextTop);
    });

    const stopDrag = (event: PointerEvent) => {
      event.stopPropagation();
      if (pointerId === event.pointerId) {
        dragging = false;
        pointerId = null;
      }
    };
    overlay.addEventListener('pointerup', stopDrag);
    overlay.addEventListener('pointercancel', stopDrag);
    overlay.addEventListener('wheel', (event) => event.stopPropagation(), {
      passive: true
    });
    overlay.addEventListener('click', (event) => event.stopPropagation());
  }

  private hideMiaOverlay(): void {
    this.cancelMiaRender();
    if (!this.miaOverlayElement) return;
    this.miaOverlayElement.classList.remove('sitmun-mia-popup-visible');
    const contentDiv = this.miaOverlayElement.querySelector('.tc-ctl-popup-content');
    if (contentDiv) contentDiv.innerHTML = '';
    this.lastOpenedFeatureKey = null;
  }

  private getInitialMiaOverlayPosition(overlay: HTMLElement): {
    left: number;
    top: number;
  } {
    const width = overlay.offsetWidth || 420;
    const height = overlay.offsetHeight || 260;
    const left = Math.round((window.innerWidth - width) / 2);
    const top = Math.round((window.innerHeight - height) * 0.4);
    return { left: Math.max(8, left), top: Math.max(8, top) };
  }

  private placeMiaOverlayAt(left: number, top: number): void {
    if (!this.miaOverlayElement) return;
    const rect = this.clampMiaOverlayPosition(
      left,
      top,
      this.miaOverlayElement.offsetWidth || 420,
      this.miaOverlayElement.offsetHeight || 260
    );
    this.miaOverlayElement.style.left = `${rect.left}px`;
    this.miaOverlayElement.style.top = `${rect.top}px`;
  }

  private clampMiaOverlayPosition(
    left: number,
    top: number,
    width: number,
    height: number
  ): { left: number; top: number } {
    const margin = 12;
    const maxLeft = Math.max(margin, window.innerWidth - width - margin);
    const maxTop = Math.max(margin, window.innerHeight - height - margin);
    return {
      left: Math.min(Math.max(margin, left), maxLeft),
      top: Math.min(Math.max(margin, top), maxTop)
    };
  }

  private buildMiasHtml(popupId: string, miaTasks: MiaTask[]): string {
    if (miaTasks.length === 1) {
      return this.buildMiaHtml(miaTasks[0]);
    }

    const tabs = miaTasks
      .map((miaTask, i) => {
        const title = this.escapeHtml(miaTask.name || `MIA ${i + 1}`);
        const active = i === 0 ? ' sitmun-mia-main-tab-active' : '';
        return `<button class="sitmun-mia-main-tab${active}" data-mia-main-tab="${this.getMiaPanelId(popupId, i)}">${title}</button>`;
      })
      .join('');

    const panels = miaTasks
      .map((miaTask, i) => {
        const hidden = i === 0 ? '' : ' style="display:none"';
        return `<div class="sitmun-mia-main-panel" data-mia-main-panel="${this.getMiaPanelId(popupId, i)}"${hidden}>${this.buildMiaHtml(miaTask)}</div>`;
      })
      .join('');

    return `<div class="sitmun-mia-main-tabs-bar" data-mia-main-tabs="${popupId}">${tabs}</div>${panels}`;
  }

  private buildMiaHtml(miaTask: MiaTask): string {
    const loading = this.escapeHtml(this.translate.instant('mia.popup.loading'));
    return `<div class="sitmun-mia-body" data-mia-task-id="${this.parseTaskId(miaTask.id)}"><div class="sitmun-mia-loading"><span class="sitmun-mia-spinner"></span> ${loading}</div></div>`;
  }

  private wireTopLevelMiaTabs(popupId: string, contentDiv: HTMLElement): void {
    const tabsBar = contentDiv.querySelector(`[data-mia-main-tabs="${popupId}"]`);
    if (!tabsBar) return;

    tabsBar.addEventListener('click', (event: Event) => {
      const btn = (event.target as HTMLElement).closest(
        '[data-mia-main-tab]'
      ) as HTMLElement;
      if (!btn) return;

      const tabId = btn.getAttribute('data-mia-main-tab');
      tabsBar
        .querySelectorAll('.sitmun-mia-main-tab')
        .forEach((tab) => tab.classList.remove('sitmun-mia-main-tab-active'));
      btn.classList.add('sitmun-mia-main-tab-active');

      contentDiv.querySelectorAll('.sitmun-mia-main-panel').forEach((panel) => {
        const panelElement = panel as HTMLElement;
        panelElement.style.display =
          panelElement.getAttribute('data-mia-main-panel') === tabId ? '' : 'none';
      });
    });
  }

  private wireBackendRenderedTabs(contentDiv: HTMLElement): void {
    if ((contentDiv as any).__sitmunMiaBackendTabs) return;
    contentDiv.addEventListener('click', (event: Event) => {
      const btn = (event.target as HTMLElement).closest(
        '[data-mia-tab]'
      ) as HTMLElement;
      if (!btn) return;

      const tabId = btn.getAttribute('data-mia-tab');
      const tabsBar = btn.closest('.sitmun-mia-tabs-bar');
      const container = tabsBar?.parentElement;
      if (!tabsBar || !container) return;

      tabsBar
        .querySelectorAll('.sitmun-mia-tab')
        .forEach((tab) => tab.classList.remove('sitmun-mia-tab-active'));
      btn.classList.add('sitmun-mia-tab-active');

      container.querySelectorAll('.sitmun-mia-tab-panel').forEach((panel) => {
        const panelElement = panel as HTMLElement;
        panelElement.style.display =
          panelElement.getAttribute('data-mia-panel') === tabId ? '' : 'none';
      });
    });
    (contentDiv as any).__sitmunMiaBackendTabs = true;
  }

  private fillRenderedMiaTasks(
    contentDiv: HTMLElement,
    renderedTasks: MiaRenderedTask[]
  ): void {
    renderedTasks.forEach((renderedTask) => {
      const target = contentDiv.querySelector(
        `[data-mia-task-id="${renderedTask.taskId}"]`
      );
      if (!target) return;
      target.innerHTML = renderedTask.error
        ? `<div class="sitmun-mia-error">${this.escapeHtml(renderedTask.error)}</div>`
        : sanitizeMiaRenderedHtml(
            renderedTask.html || '',
            `<div class="sitmun-mia-empty">${this.escapeHtml(this.translate.instant('mia.empty'))}</div>`
          );
    });
  }

  private fillRenderedMiaError(contentDiv: HTMLElement, message: string): void {
    contentDiv.querySelectorAll('[data-mia-task-id]').forEach((target) => {
      target.innerHTML = `<div class="sitmun-mia-error">${this.escapeHtml(message)}</div>`;
    });
  }

  private getMiaPanelId(popupId: string, miaIndex: number): string {
    return `${popupId}-mia-${miaIndex}`;
  }

  private escapeHtml(value: string): string {
    return value
      .split('&')
      .join('&amp;')
      .split('<')
      .join('&lt;')
      .split('>')
      .join('&gt;')
      .split('"')
      .join('&quot;')
      .split("'")
      .join('&#x27;');
  }

  private getCartographyIdFromLayerName(layerName: string): string | null {
    if (!this.appConfig?.layers) {
      return null;
    }

    for (const layer of this.appConfig.layers) {
      if (
        Array.isArray(layer.layers) &&
        layer.layers.includes(layerName) &&
        typeof layer.id === 'string'
      ) {
        const match = /layer\/(\d+)/.exec(layer.id);
        if (match) {
          return match[1];
        }
      }
    }

    return null;
  }

  private parseTaskId(id: string): number {
    const match = /(?:^|\/)\d+$/.exec(id);
    return match ? Number(match[0].replace('/', '')) : Number(id);
  }
}
