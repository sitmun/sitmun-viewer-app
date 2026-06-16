import { Injectable, inject } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';
import DOMPurify from 'dompurify';


import { MoreInfoAdvancedService, MiaExportAction, MiaRenderedTask, MiaTask, TemplateExportResult } from '../../services/more-info-advanced.service';
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
    'data-mia-export-template',
    'data-mia-template-task-id'
  ],
};

export function sanitizeMiaRenderedHtml(html: string): string {
  return DOMPurify.sanitize(html || '<div class="sitmun-mia-empty">Sense dades</div>', MIA_HTML_SANITIZE_OPTIONS);
}

@Injectable({
  providedIn: 'root'
})
export class MoreInfoAdvancedControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.moreInfoAdvanced';
  readonly sitnaConfigKey = undefined;
  readonly requiredPatches = undefined;

  private readonly miaService = inject(MoreInfoAdvancedService);
  private appConfig: AppCfg | null = null;
  private miaOverlayElement: HTMLElement | null = null;
  private floatingZIndex = 10050;
  private static readonly EXPORT_BUTTON_CONFIG: Record<string, { label: string; ariaLabel: string; icon: string; loadingLabel: string }> = {
    pdf: {
      label: 'Exportar PDF',
      ariaLabel: 'Exportar plantilla en PDF',
      icon: 'pdf',
      loadingLabel: 'Generant PDF...'
    },
    xml: {
      label: 'Descarregar XML',
      ariaLabel: 'Descarregar plantilla en XML',
      icon: 'xml',
      loadingLabel: 'Preparant XML...'
    }
  };

  constructor(sitnaApi: SitnaApiService) {
    super(sitnaApi);
  }

  override cleanup(): void {
    this.removeMiaOverlay();
    super.cleanup();
  }

  private removeMiaOverlay(): void {
    if (this.miaOverlayElement) {
      this.miaOverlayElement.remove();
      this.miaOverlayElement = null;
    }
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
          const popup = target?.closest?.('.sitmun-mia-popup-overlay, .tc-ctl-popup') as HTMLElement | null;
          if (!popup) return;
          popup.style.zIndex = String(++this.floatingZIndex);
        };
        document.addEventListener('pointerdown', bringFloatingPopupToFront, true);
        mapProto.__sitmunMiaZIndex = true;
        this.patchManager.add(() => {
          document.removeEventListener('pointerdown', bringFloatingPopupToFront, true);
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
            const result = jp.proceedApply(jp.args);

            if (options?.services && this.miaService.hasMiaTasks()) {
              setTimeout(() => this.tryOpenMiaPopup(options), 350);
            }

            return result;
          }
        );
        fiProto.__sitmunMiaResponseCallback = true;
        this.patchManager.add(() => {
          meld.remove(responseCallbackAdvice);
          delete fiProto.__sitmunMiaResponseCallback;
        });
      }
    });
  }

  private ensureMiaOverlay(): HTMLElement | null {
    if (this.miaOverlayElement && !this.miaOverlayElement.isConnected) {
      this.miaOverlayElement = null;
    }
    if (this.miaOverlayElement) return this.miaOverlayElement;

    const overlay = document.createElement('div');
    overlay.className = 'sitmun-mia-popup-overlay';
    overlay.innerHTML = `
      <div class="sitmun-mia-popup-toolbar">
        <span class="sitmun-mia-popup-toolbar-title">Informació avançada</span>
        <button type="button" class="sitmun-mia-popup-close" aria-label="Tancar">×</button>
      </div>
      <div class="tc-ctl-popup-content sitmun-mia-popup-content"></div>
    `;
    overlay.querySelector('.sitmun-mia-popup-close')?.addEventListener('click', () => {
      this.hideMiaOverlay();
    });
    this.addMiaOverlayPointerHandlers(overlay);

    document.body.appendChild(overlay);
    this.miaOverlayElement = overlay;

    return overlay;
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
      const isButton = !!target?.closest('button, a, input, select, textarea');
      if (!isDragHandle || isButton) return;

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
    overlay.addEventListener('wheel', (event) => event.stopPropagation(), { passive: true });
    overlay.addEventListener('click', (event) => event.stopPropagation());
  }

  private tryOpenMiaPopup(options: any): void {
    if (!options?.services || !Array.isArray(options.services)) return;

    for (const service of options.services) {
      if (!Array.isArray(service?.layers)) continue;

      for (const layer of service.layers) {
        if (!Array.isArray(layer?.features) || layer.features.length === 0) continue;

        const cartographyId = this.getCartographyIdFromLayerName(layer.name);
        if (!cartographyId) continue;

        const miaTasks = this.miaService.getTasksForCartography(cartographyId);
        if (miaTasks.length === 0) continue;

        const featureData = layer.features[0].getData ? layer.features[0].getData() : layer.features[0].data || {};
        this.openMiaPopup(miaTasks, featureData);
        return;
      }
    }
  }

  private openMiaPopup(
    miaTasks: MiaTask[],
    featureData: Record<string, any>
  ): void {
    const overlay = this.ensureMiaOverlay();
    if (!overlay) return;

    const popupId = 'mia-popup-' + Date.now();
    const contentDiv = overlay.querySelector('.tc-ctl-popup-content') as HTMLElement | null;
    if (!contentDiv) return;
    contentDiv.innerHTML = this.buildMiasHtml(popupId, miaTasks);
      const exportActions = Array.from(new Map(
        miaTasks
          .flatMap((miaTask) => this.miaService.getExportActionsForCartography(miaTask.cartographyId))
          .map((action) => [`${action.taskId ?? 'none'}:${action.output}`, action])
      ).values());

    const position = this.getInitialMiaOverlayPosition(overlay);
    this.placeMiaOverlayAt(position.left, position.top);
    overlay.classList.add('sitmun-mia-popup-visible');
    overlay.style.zIndex = String(++this.floatingZIndex);

    this.wireTopLevelMiaTabs(popupId, contentDiv);
    this.wireBackendRenderedTabs(contentDiv);

    this.miaService.renderMiaTasks(miaTasks, featureData).subscribe({
      next: (renderedTasks) => this.fillRenderedMiaTasks(contentDiv, renderedTasks, exportActions),
      error: (error) => this.fillRenderedMiaError(contentDiv, error?.message || 'MIA rendering failed')
    });
  }

  private hideMiaOverlay(): void {
    if (!this.miaOverlayElement) return;
    this.miaOverlayElement.classList.remove('sitmun-mia-popup-visible');
    const contentDiv = this.miaOverlayElement.querySelector('.tc-ctl-popup-content');
    if (contentDiv) contentDiv.innerHTML = '';
  }

  private getInitialMiaOverlayPosition(overlay: HTMLElement): { left: number; top: number } {
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
    return `<div class="sitmun-mia-body" data-mia-task-id="${this.parseTaskId(miaTask.id)}"><div class="sitmun-mia-loading"><span class="sitmun-mia-spinner"></span> Carregant...</div></div>`;
  }

  private wireTopLevelMiaTabs(popupId: string, contentDiv: HTMLElement): void {
    const tabsBar = contentDiv.querySelector(`[data-mia-main-tabs="${popupId}"]`);
    if (!tabsBar) return;

    tabsBar.addEventListener('click', (event: Event) => {
      const btn = (event.target as HTMLElement).closest('[data-mia-main-tab]') as HTMLElement;
      if (!btn) return;

      const tabId = btn.getAttribute('data-mia-main-tab');
      tabsBar.querySelectorAll('.sitmun-mia-main-tab').forEach((tab) => tab.classList.remove('sitmun-mia-main-tab-active'));
      btn.classList.add('sitmun-mia-main-tab-active');

      contentDiv.querySelectorAll('.sitmun-mia-main-panel').forEach((panel) => {
        const panelElement = panel as HTMLElement;
        panelElement.style.display = panelElement.getAttribute('data-mia-main-panel') === tabId ? '' : 'none';
      });
    });
  }

  private wireBackendRenderedTabs(contentDiv: HTMLElement): void {
    if ((contentDiv as any).__sitmunMiaBackendTabs) return;
    contentDiv.addEventListener('click', (event: Event) => {
      const btn = (event.target as HTMLElement).closest('[data-mia-tab]') as HTMLElement;
      if (!btn) return;

      const tabId = btn.getAttribute('data-mia-tab');
      const tabsBar = btn.closest('.sitmun-mia-tabs-bar');
      const container = tabsBar?.parentElement;
      if (!tabsBar || !container) return;

      tabsBar.querySelectorAll('.sitmun-mia-tab').forEach((tab) => tab.classList.remove('sitmun-mia-tab-active'));
      btn.classList.add('sitmun-mia-tab-active');

      container.querySelectorAll('.sitmun-mia-tab-panel').forEach((panel) => {
        const panelElement = panel as HTMLElement;
        panelElement.style.display = panelElement.getAttribute('data-mia-panel') === tabId ? '' : 'none';
      });
    });
    (contentDiv as any).__sitmunMiaBackendTabs = true;
  }

  private fillRenderedMiaTasks(
    contentDiv: HTMLElement,
    renderedTasks: MiaRenderedTask[],
    fallbackExportActions: MiaExportAction[]
  ): void {
    renderedTasks.forEach((renderedTask) => {
      const target = contentDiv.querySelector(`[data-mia-task-id="${renderedTask.taskId}"]`);
      if (!target) return;
      target.innerHTML = renderedTask.error
        ? `<div class="sitmun-mia-error">${this.escapeHtml(renderedTask.error)}</div>`
        : sanitizeMiaRenderedHtml(renderedTask.html || '');

      this.injectDownloadButtons(target as HTMLElement, fallbackExportActions);
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
   * Scans the given container for rendered template wrappers and injects one button per available
   * document export action before each template content block.
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
          this.triggerMiaExport(wrapper, action, btn, descriptor);
        });

        bar.appendChild(btn);
      });

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
    const exportTemplate = action.output === 'xml' ? '' : htmlContent;
    const templateTaskId = this.resolveRenderedTemplateTaskId(wrapper);
    const export$ = this.miaService.exportTemplate(exportTemplate, action.output, action.taskId, templateTaskId);

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

        btn.disabled = false;
        if (btnLabel) {
          btnLabel.textContent = descriptor.label;
        }
      },
      error: (err: any) => {
        console.error('[MIA] Export failed', err);
        btn.disabled = false;
        if (btnLabel) {
          btnLabel.textContent = descriptor.label;
        }
      }
    });
  }

  private resolveRenderedTemplateTaskId(wrapper: HTMLElement): number | null {
    const rawTaskId = wrapper.getAttribute('data-mia-template-task-id');
    if (!rawTaskId) {
      return null;
    }

    const parsedTaskId = Number(rawTaskId);
    return Number.isFinite(parsedTaskId) ? parsedTaskId : null;
  }

  private getExportButtonDescriptor(output: string, label?: string | null): { label: string; ariaLabel: string; icon: string; loadingLabel: string } {
    const defaultDescriptor = MoreInfoAdvancedControlHandler.EXPORT_BUTTON_CONFIG[output] || {
      label: `Exportar ${output.toUpperCase()}`,
      ariaLabel: `Exportar plantilla en format ${output.toUpperCase()}`,
      icon: 'generic',
      loadingLabel: `Preparant ${output.toUpperCase()}...`
    };
    if (!label) {
      return defaultDescriptor;
    }
    return {
      ...defaultDescriptor,
      ariaLabel: `${defaultDescriptor.ariaLabel} (${label})`
    };
  }

  private getMiaPanelId(popupId: string, miaIndex: number): string {
    return `${popupId}-mia-${miaIndex}`;
  }

  private escapeHtml(value: string): string {
    return value
      .split('&').join('&amp;')
      .split('<').join('&lt;')
      .split('>').join('&gt;')
      .split('"').join('&quot;')
      .split("'").join('&#39;');
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
