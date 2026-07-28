import { Injectable, inject } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';
import { TranslateService } from '@ngx-translate/core';
import DOMPurify from 'dompurify';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { MoreInfoAdvancedService, MiaExportAction, MiaRenderedTask, MiaTask, MiaViewerContext, TemplateExportResult } from '../../services/more-info-advanced.service';
import { SitnaApiService } from '../../services/sitna-api.service';
import type { Meld, MeldJoinPoint } from '../../types/meld.types';
import { ControlHandlerBase } from '../control-handler-base';
import { SitnaControlConfig } from '../control-handler.interface';

declare function require(module: string): unknown;
const meld = require('meld') as Meld;

interface MiaFeatureInfoOptions {
  services?: MiaFeatureInfoService[];
}

interface MiaFeatureInfoService {
  layers?: MiaFeatureInfoLayer[];
}

interface MiaFeatureInfoLayer {
  name?: string;
  features?: unknown[];
}

interface MiaTabsContainer extends HTMLElement {
  __sitmunMiaBackendTabs?: boolean;
}

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
    'data-mia-export-template',
    'data-mia-template-task-id',
    'data-sitmun-pdf-template-scope',
    'target'
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
    MIA_HTML_SANITIZE_OPTIONS,
  );
  const document = new DOMParser().parseFromString(sanitized, 'text/html');
  document.querySelectorAll('iframe').forEach((iframe) => {
    iframe.removeAttribute('allow');
    iframe.removeAttribute('allowfullscreen');
    iframe.removeAttribute('srcdoc');
    iframe.setAttribute('sandbox', '');
  });
  return document.body.innerHTML;
}

export interface MiaGfiTarget {
  miaTasks: MiaTask[];
  featureData: Record<string, unknown>;
  featureKey: string;
  features: unknown[];
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
          features: hit.features,
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
    features: hit.features,
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
  private static readonly EXPORT_BUTTON_CONFIG: Record<MiaExportAction['output'], { label: string; ariaLabel: string; icon: string; loadingLabel: string }> = {
    pdf: {
      label: 'Exportar PDF',
      ariaLabel: 'Exportar plantilla en PDF',
      icon: 'pdf',
      loadingLabel: 'Generant PDF...'
    }
  };
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
            const [options] = jp.args as [MiaFeatureInfoOptions];
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
    const viewerContext = this.buildMiaViewerContext({
      name: target.layerName,
      features: target.features
    });
    this.openMiaPopup(
      target.miaTasks,
      target.featureData,
      target.featureKey,
      viewerContext
    );
  }

  private openMiaPopup(
    miaTasks: MiaTask[],
    featureData: Record<string, unknown>,
    featureKey: string,
    viewerContext: MiaViewerContext | null
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
    const exportActions = Array.from(new Map(
      miaTasks
        .flatMap((miaTask) => this.miaService.getExportActionsForCartography(miaTask.cartographyId))
        .map((action) => [`${action.taskId}:${action.output}`, action])
    ).values());

    this.renderSub = this.miaService
      .renderMiaTasks(miaTasks, featureData, viewerContext ?? undefined)
      .pipe(take(1))
      .subscribe({
        next: (renderedTasks) => {
          if (generation !== this.renderGeneration) return;
          this.fillRenderedMiaTasks(contentDiv, renderedTasks, exportActions);
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

  private buildMiaViewerContext(layer: MiaFeatureInfoLayer): MiaViewerContext | null {
    const applicationId = this.appConfig?.application.id;
    const territoryId = this.appConfig?.application.territoryId;
    if (applicationId == null || territoryId == null) {
      return null;
    }
    return {
      featureBbox: this.getFeatureCollectionBbox(layer?.features),
      applicationId,
      territoryId
    };
  }

  private getFeatureCollectionBbox(features: unknown): number[] | null {
    if (!Array.isArray(features) || features.length === 0) {
      return null;
    }

    let combinedBbox: number[] | null = null;
    for (const feature of features) {
      const featureBbox = this.getFeatureBbox(feature);
      if (featureBbox == null) {
        continue;
      }
      combinedBbox = combinedBbox == null
        ? featureBbox
        : [
            Math.min(combinedBbox[0], featureBbox[0]),
            Math.min(combinedBbox[1], featureBbox[1]),
            Math.max(combinedBbox[2], featureBbox[2]),
            Math.max(combinedBbox[3], featureBbox[3])
          ];
    }

    return combinedBbox;
  }

  private getFeatureBbox(feature: unknown): number[] | null {
    const featureRecord = this.asRecord(feature);
    const runtimeExtent = this.getRuntimeFeatureExtent(feature);
    if (runtimeExtent != null) {
      return runtimeExtent;
    }

    return this.getGeoJsonGeometryBbox(
      featureRecord['geometry']
      ?? this.asRecord(featureRecord['feature'])['geometry']
      ?? this.asRecord(this.asRecord(featureRecord['wrap'])['feature'])['geometry']
      ?? this.asRecord(this.callUnknownFunction(featureRecord['getData'], feature))['geometry']
      ?? this.asRecord(featureRecord['data'])['geometry']
    );
  }

  private getRuntimeFeatureExtent(feature: unknown): number[] | null {
    const featureRecord = this.asRecord(feature);
    const wrappedFeature = this.asRecord(this.asRecord(featureRecord['wrap'])['feature']);
    const extent = this.readGeometryExtent(this.callUnknownFunction(featureRecord['getGeometry'], feature))
      ?? this.readGeometryExtent(featureRecord['geometry'])
      ?? this.readGeometryExtent(this.callUnknownFunction(wrappedFeature['getGeometry'], wrappedFeature));

    return this.normalizeExtent(extent);
  }

  private getGeoJsonGeometryBbox(geometry: unknown): number[] | null {
    if (!geometry || typeof geometry !== 'object' || Array.isArray(geometry)) {
      return null;
    }

    const geometryRecord = geometry as Record<string, unknown>;

    if (geometryRecord['type'] === 'GeometryCollection' && Array.isArray(geometryRecord['geometries'])) {
      return this.getFeatureCollectionBbox(geometryRecord['geometries'].map((item) => ({ geometry: item })));
    }

    const bboxState = {
      minX: Number.POSITIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY
    };
    this.collectCoordinateBounds(geometryRecord['coordinates'], bboxState);

    if (!Number.isFinite(bboxState.minX) || !Number.isFinite(bboxState.minY)
      || !Number.isFinite(bboxState.maxX) || !Number.isFinite(bboxState.maxY)) {
      return null;
    }

    return [bboxState.minX, bboxState.minY, bboxState.maxX, bboxState.maxY];
  }

  private collectCoordinateBounds(
    coordinates: unknown,
    bboxState: { minX: number; minY: number; maxX: number; maxY: number }
  ): void {
    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      return;
    }

    if (typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
      const x = Number(coordinates[0]);
      const y = Number(coordinates[1]);
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return;
      }
      bboxState.minX = Math.min(bboxState.minX, x);
      bboxState.minY = Math.min(bboxState.minY, y);
      bboxState.maxX = Math.max(bboxState.maxX, x);
      bboxState.maxY = Math.max(bboxState.maxY, y);
      return;
    }

    coordinates.forEach((item) => this.collectCoordinateBounds(item, bboxState));
  }

  private normalizeExtent(extent: unknown): number[] | null {
    if (!Array.isArray(extent) || extent.length !== 4) {
      return null;
    }

    if (!extent.every((value) => typeof value === 'number' && Number.isFinite(value))) {
      return null;
    }
    const values = extent as number[];
    return values[0] <= values[2] && values[1] <= values[3] ? values : null;
  }

  private readGeometryExtent(geometry: unknown): unknown {
    const getExtent = this.asRecord(geometry)['getExtent'];
    return this.callUnknownFunction(getExtent, geometry);
  }

  private callUnknownFunction(value: unknown, owner: unknown): unknown {
    return typeof value === 'function' ? value.call(owner) : undefined;
  }

  private asRecord(value: unknown): Record<string, unknown> {
    return value != null && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, unknown>
      : {};
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
    const tabsContainer = contentDiv as MiaTabsContainer;
    if (tabsContainer.__sitmunMiaBackendTabs) return;
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
    tabsContainer.__sitmunMiaBackendTabs = true;
  }

  private fillRenderedMiaTasks(
    contentDiv: HTMLElement,
    renderedTasks: MiaRenderedTask[],
    exportActions: MiaExportAction[]
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
      this.injectDownloadButtons(target as HTMLElement, exportActions);
    });
  }

  private fillRenderedMiaError(contentDiv: HTMLElement, message: string): void {
    contentDiv.querySelectorAll('[data-mia-task-id]').forEach((target) => {
      target.innerHTML = `<div class="sitmun-mia-error">${this.escapeHtml(message)}</div>`;
    });
  }

  // ---------------------------------------------------------------------------
  // Download button injection
  // ---------------------------------------------------------------------------

  /**
   * Scans rendered template wrappers and injects one dropdown with all available export actions.
   */
  private injectDownloadButtons(container: HTMLElement, fallbackExportActions: MiaExportAction[] = []): void {
    const exportWrappers = container.querySelectorAll<HTMLElement>('[data-mia-export-template]');
    exportWrappers.forEach((wrapper) => {
      if (wrapper.querySelector('.sitmun-mia-download-bar')) {
        // Already injected (guard against double calls)
        return;
      }

      const actions = fallbackExportActions;
      if (actions.length === 0) {
        return;
      }

      const bar = document.createElement('div');
      bar.className = 'sitmun-mia-download-bar';

      const menu = document.createElement('details');
      menu.className = 'sitmun-mia-download-menu';
      menu.addEventListener('click', (event) => event.stopPropagation());

      const toggle = document.createElement('summary');
      toggle.className = 'sitmun-mia-download-toggle sitmun-mia-download-btn sitmun-mia-download-btn--generic';
      toggle.setAttribute('role', 'button');
      toggle.setAttribute('aria-label', 'Mostrar opcions d\'exportacio');
      toggle.innerHTML = '<span class="sitmun-mia-download-btn-icon" aria-hidden="true"></span><span class="sitmun-mia-download-btn-label">Exportar</span>';

      const options = document.createElement('div');
      options.className = 'sitmun-mia-download-options';

      actions.forEach((action) => {
        const descriptor = this.getExportButtonDescriptor(action.output, action.label);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `sitmun-mia-download-btn sitmun-mia-download-btn--${descriptor.icon}`;
        btn.dataset['miaExportButtonOutput'] = action.output;
        btn.setAttribute('aria-label', descriptor.ariaLabel);
        btn.innerHTML = `<span class="sitmun-mia-download-btn-icon" aria-hidden="true"></span><span class="sitmun-mia-download-btn-label">${this.escapeHtml(descriptor.label)}</span>`;

        btn.addEventListener('click', (event) => {
          event.stopPropagation();
          menu.open = false;
          this.triggerMiaExport(wrapper, action, btn, descriptor);
        });

        options.appendChild(btn);
      });

      menu.appendChild(toggle);
      menu.appendChild(options);
      bar.appendChild(menu);

      wrapper.insertBefore(bar, wrapper.firstChild);
    });
  }

  /**
   * Calls the backend export endpoint and triggers a browser file download.
   */
  private triggerMiaExport(
    wrapper: HTMLElement,
    action: MiaExportAction,
    btn: HTMLButtonElement,
    descriptor: { label: string; loadingLabel: string }
  ): void {
    btn.disabled = true;
    const btnLabel = btn.querySelector<HTMLElement>('.sitmun-mia-download-btn-label');
    if (btnLabel) {
      btnLabel.textContent = descriptor.loadingLabel;
    }

    const downloadBar = wrapper.querySelector('.sitmun-mia-download-bar');
    const htmlContent = downloadBar
      ? wrapper.innerHTML.replace(downloadBar.outerHTML, '')
      : wrapper.innerHTML;
    const templateTaskId = this.resolveRenderedTemplateTaskId(wrapper);
    const applicationId = this.appConfig?.application.id;
    const territoryId = this.appConfig?.application.territoryId;
    if (applicationId == null || territoryId == null) {
      this.restoreExportButton(btn, btnLabel, descriptor.label);
      return;
    }
    const export$ = this.miaService.exportTemplate({
      template: htmlContent,
      output: action.output,
      taskId: action.taskId,
      templateTaskId,
      applicationId,
      territoryId
    });

    export$.subscribe({
      next: (result: TemplateExportResult) => {
        const url = URL.createObjectURL(result.blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = result.filename || `report.${action.output}`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);

        this.restoreExportButton(btn, btnLabel, descriptor.label);
      },
      error: (err: unknown) => {
        console.error('[MIA] Export failed', err);
        this.restoreExportButton(btn, btnLabel, descriptor.label);
      }
    });
  }

  private restoreExportButton(
    button: HTMLButtonElement,
    label: HTMLElement | null,
    text: string
  ): void {
    button.disabled = false;
    if (label) {
      label.textContent = text;
    }
  }

  private resolveRenderedTemplateTaskId(wrapper: HTMLElement): number | null {
    const rawTaskId = wrapper.getAttribute('data-mia-template-task-id');
    if (!rawTaskId) {
      return null;
    }

    const parsedTaskId = Number(rawTaskId);
    return Number.isFinite(parsedTaskId) ? parsedTaskId : null;
  }

  private getExportButtonDescriptor(output: MiaExportAction['output'], label?: string | null): { label: string; ariaLabel: string; icon: string; loadingLabel: string } {
    const defaultDescriptor = MoreInfoAdvancedControlHandler.EXPORT_BUTTON_CONFIG[output];
    if (!label) {
      return defaultDescriptor;
    }
    return {
      ...defaultDescriptor,
      label,
      ariaLabel: `${defaultDescriptor.ariaLabel} (${label})`
    };
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
