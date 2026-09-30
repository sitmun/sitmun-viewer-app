import type { AppCfg } from '@api/model/app-cfg';
import { TranslateService } from '@ngx-translate/core';

import { resolveFeaturePath } from './feature-info-fields';
import { MoreInfoService } from '../../services/more-info.service';
import { normalizeMoreInfoRows, normalizeXmlRows } from '../utils/more-info-data.utils';

export class FeatureInfoMoreInfoHandler {
  private placeholderCounter = 0;
  private readonly placeholderIds = new WeakMap<any, Map<string, string>>();
  private readonly inFlightPlaceholderIds = new Set<string>();
  private readonly pendingResults = new Map<
    string,
    { task: any; result: any }
  >();

  constructor(
    private readonly moreInfoService: MoreInfoService,
    private readonly getAppConfig: () => AppCfg | null,
    private readonly translateService: TranslateService
  ) {}

  injectMoreInfoFields(options: any): void {
    if (!options?.services || !Array.isArray(options.services)) return;

    for (const service of options.services) {
      this.processServiceLayers(service);
    }
  }

  executeSqlTasksForFeatures(options: any): void {
    if (!options?.services || !Array.isArray(options.services)) return;

    for (const service of options.services) {
      this.executeSqlTasksForService(service);
    }
  }

  private executeSqlTasksForService(service: any): void {
    if (!service?.layers || !Array.isArray(service.layers)) return;

    for (const layer of service.layers) {
      this.executeSqlTasksForLayer(layer);
    }
  }

  private executeSqlTasksForLayer(layer: any): void {
    if (!layer?.features || !Array.isArray(layer.features)) return;

    const cartographyId = this.getCartographyIdFromLayerName(layer.name);
    if (!cartographyId) return;

    const tasks = this.moreInfoService.getMoreInfoTasks(cartographyId);
    if (tasks.length === 0) return;

    const nonInteractiveTasks = tasks.filter((task: any) =>
      this.isNonInteractiveTask(task)
    );
    if (nonInteractiveTasks.length === 0) return;

    for (const feature of layer.features) {
      this.executeTasksForFeature(feature, nonInteractiveTasks, tasks);
    }
  }

  private executeTasksForFeature(
    feature: any,
    nonInteractiveTasks: any[],
    allTasks: any[]
  ): void {
    const featureData = feature.getData
      ? feature.getData()
      : feature.data || {};

    nonInteractiveTasks.forEach((task: any) => {
      const taskIndex = allTasks.indexOf(task);
      const taskKey = this.getTaskKey(task, taskIndex);
      const placeholderId = this.getPlaceholderId(feature, taskKey);
      this.inFlightPlaceholderIds.add(placeholderId);
      this.moreInfoService.executeMoreInfo(task, featureData).subscribe({
        next: (result: any) => {
          this.inFlightPlaceholderIds.delete(placeholderId);
          this.displayMoreInfoResult(task, result, placeholderId);
        },
        error: (error: any) => {
          this.inFlightPlaceholderIds.delete(placeholderId);
          this.displayMoreInfoResult(
            task,
            { error: error?.message || 'Error obtenint més informació' },
            placeholderId
          );
        }
      });
    });
  }

  attachMoreInfoListeners(featureInfoControl: any): void {
    const container = this.getFeatureInfoContainer(featureInfoControl);
    if (!container) return;

    container.querySelectorAll('.sitmun-more-info-summary').forEach((summary: any) => {
      summary.addEventListener('click', (e: Event) => {
        e.stopPropagation();
      });
    });

    // Delegated listener for resource action buttons (.sitmun-resource-action).
    // Uses capture phase ({ capture: true }) so it fires before SITNA's bubble-phase
    // handlers can call stopPropagation and swallow the event.
    container.addEventListener('click', (e: Event) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>('.sitmun-resource-action[data-action]');
      if (!target) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const action = target.dataset['action'];
      const url = target.dataset['url'] ?? '';
      const filename = target.dataset['filename'] ?? 'file';
      if (action === 'open') {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else if (action === 'download') {
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
      }
    }, { capture: true });

    const links = container.querySelectorAll('.sitmun-more-info-link');

    links.forEach((link: any) => {
      link.addEventListener('click', (e: Event) => {
        e.preventDefault();
        e.stopPropagation();

        const taskId = link.dataset['taskId'];
        const taskIndex = link.dataset['taskIndex'];
        const cartographyId = link.dataset['cartographyId'];

        if (!taskId || !cartographyId) {
          if (!taskIndex || !cartographyId) {
            return;
          }
        }

        const tasks = this.moreInfoService.getMoreInfoTasks(cartographyId);
        const task = taskId
          ? tasks.find((t: any) => t.id === taskId)
          : tasks[Number(taskIndex)];

        if (!task) {
          return;
        }

        const table = link.closest('table.tc-attr') as HTMLElement | null;
        const featureData = this.extractFeatureDataFromTable(table);

        this.moreInfoService.executeMoreInfo(task, featureData).subscribe({
          next: (result: any) => {
            this.displayMoreInfoResult(task, result);
          },
          error: (error: any) => {
            alert('Error obtenint més informació: ' + error.message);
          }
        });
      });
    });

    this.triggerPlaceholderRequestsFromContainer(container);
    this.flushPendingResults(container);
  }

  private triggerPlaceholderRequestsFromContainer(
    container: HTMLElement
  ): void {
    const placeholders = container.querySelectorAll(
      '.sitmun-more-info-placeholder[data-cartography-id][data-placeholder-id]'
    );

    placeholders.forEach((placeholder: any) => {
      const placeholderId = placeholder.dataset?.['placeholderId'];
      const cartographyId = placeholder.dataset?.['cartographyId'];
      const taskKey = placeholder.dataset?.['taskId'];
      if (!placeholderId || !cartographyId || !taskKey) return;

      if (
        this.pendingResults.has(placeholderId) ||
        this.inFlightPlaceholderIds.has(placeholderId)
      ) {
        return;
      }

      const text = (placeholder.textContent || '').trim();
      if (!text.includes('Carregant...')) return;

      const tasks = this.moreInfoService.getMoreInfoTasks(cartographyId);
      const task = this.resolveTaskFromTaskKey(tasks, taskKey) as any;
      if (!task) return;

      const table = placeholder.closest('table.tc-attr') as HTMLElement | null;
      const featureData = this.extractFeatureDataFromTable(table);

      this.inFlightPlaceholderIds.add(placeholderId);
      this.moreInfoService.executeMoreInfo(task, featureData).subscribe({
        next: (result: any) => {
          this.inFlightPlaceholderIds.delete(placeholderId);
          this.displayMoreInfoResult(task, result, placeholderId);
        },
        error: (error: any) => {
          this.inFlightPlaceholderIds.delete(placeholderId);
          this.displayMoreInfoResult(
            task,
            { error: error?.message || 'Error obtenint més informació' },
            placeholderId
          );
        }
      });
    });
  }

  private resolveTaskFromTaskKey(tasks: unknown[], taskKey: string): unknown {
    if (!Array.isArray(tasks) || tasks.length === 0) return undefined;

    if (taskKey.startsWith('idx-')) {
      const index = Number(taskKey.slice(4));
      if (Number.isInteger(index) && index >= 0 && index < tasks.length) {
        return tasks[index];
      }
      return undefined;
    }

    return tasks.find((task: any) => String(task?.id) === taskKey);
  }

  private processServiceLayers(service: any): void {
    if (!service?.layers || !Array.isArray(service.layers)) return;

    for (const layer of service.layers) {
      this.processLayerFeatures(layer);
    }
  }

  private processLayerFeatures(layer: any): void {
    if (!layer?.features || !Array.isArray(layer.features)) return;

    const cartographyId = this.getCartographyIdFromLayerName(layer.name);

    if (!cartographyId) return;

    const tasks = this.moreInfoService.getMoreInfoTasks(cartographyId);
    if (tasks.length === 0) return;

    for (const feature of layer.features) {
      this.addMoreInfoFieldsToFeature(feature, tasks, cartographyId);
    }
  }

  private addMoreInfoFieldsToFeature(
    feature: any,
    tasks: any[],
    cartographyId: string
  ): void {
    if (!Array.isArray(tasks)) return;

    const currentData = feature.getData
      ? feature.getData()
      : feature.data || {};
    const newData = { ...currentData };

    tasks.forEach((task: any, index: number) => {
      const taskText = task.name;
      const fieldName = this.buildUniqueFieldName('ℹ️ ' + taskText, index);
      const nonInteractive = this.isNonInteractiveTask(task);

      if (nonInteractive) {
        const taskKey = this.getTaskKey(task, index);
        const placeholderId = this.getPlaceholderId(feature, taskKey);
        newData[fieldName] = this.buildMoreInfoPlaceholder(
          task,
          taskKey,
          cartographyId,
          placeholderId
        );
        return;
      }

      const urlTemplate = task.url || task.command;
      if (urlTemplate) {
        let url = urlTemplate;
        const taskParameters = this.parseTaskParameters(task.parameters);
        if (taskParameters && typeof taskParameters === 'object') {
          Object.keys(taskParameters).forEach((paramName) => {
            const { label, name, value } = taskParameters[paramName];
            const fieldNameToLookup = value || name || paramName;

            const featureValue = this.lookupFeatureValue(
              currentData,
              fieldNameToLookup
            );

            if (label && featureValue !== undefined) {
              url = url.split(label).join(String(featureValue));
            }
          });
        }
        newData[fieldName] = this.buildMoreInfoLink(
          url,
          task,
          cartographyId,
          index
        );
      } else {
        newData[fieldName] = taskText;
      }
    });

    if (typeof feature.setData === 'function') {
      feature.setData(newData);
    } else {
      feature.data = newData;
    }
  }

  private isNonInteractiveTask(task: any): boolean {
    const taskParameters = this.parseTaskParameters(task?.parameters);
    const queryType = taskParameters?.queryType;
    return (
      task?.scope === 'SQL' ||
      task?.scope === 'API' ||
      task?.scope === 'RESOURCE' ||
      (queryType && queryType !== 'url') ||
      (!!taskParameters?.apiUrl && queryType !== 'url')
    );
  }

  private parseTaskParameters(parameters: any): any {
    if (typeof parameters !== 'string') {
      return parameters;
    }

    try {
      return JSON.parse(parameters);
    } catch {
      return null;
    }
  }

  private getCartographyIdFromLayerName(layerName: string): string | null {
    return this.searchCartographyIdInConfig(layerName);
  }

  private searchCartographyIdInConfig(layerName: string): string | null {
    const appConfig = this.getAppConfig();
    if (!appConfig?.layers) return null;

    for (const layer of appConfig.layers) {
      const cartographyId = this.extractCartographyIdFromLayer(
        layer,
        layerName
      );
      if (cartographyId) {
        return cartographyId;
      }
    }

    return null;
  }

  private extractCartographyIdFromLayer(
    layer: any,
    layerName: string
  ): string | null {
    if (!layer.layers || !Array.isArray(layer.layers)) return null;
    if (!layer.layers.includes(layerName)) return null;
    if (!layer.id || typeof layer.id !== 'string') return null;

    const match = /layer\/(\d+)/.exec(layer.id);
    if (!match) return null;

    return match[1];
  }

  private getFeatureInfoContainer(featureInfoControl: any): HTMLElement | null {
    if (typeof featureInfoControl.getInfoContainer === 'function') {
      return featureInfoControl.getInfoContainer();
    }
    if (typeof featureInfoControl.getContainerElement === 'function') {
      return featureInfoControl.getContainerElement();
    }
    if (featureInfoControl.infoContainer) {
      return featureInfoControl.infoContainer;
    }
    if (featureInfoControl.div) {
      return featureInfoControl.div.querySelector('.tc-ctl-finfo-content');
    }
    return null;
  }

  private extractFeatureDataFromTable(table: HTMLElement | null): any {
    if (!table) return {};

    const data: any = {};
    const rows = table.querySelectorAll('tbody tr');

    rows.forEach((row: any) => {
      const th = row.querySelector('th');
      const td = row.querySelector('td');
      if (th && td) {
        const header = th.textContent?.trim();
        const path = th.getAttribute('data-feature-path')?.trim();
        const key = path || header;
        const value = td.textContent?.trim();
        if (key && value && key !== 'Més informació' && !key.includes('ℹ️')) {
          data[key] = value;
          if (!path && header) {
            data[this.normalizeKey(header)] = value;
          }
        }
      }
    });

    return data;
  }

  private displayMoreInfoResult(
    task: any,
    result: any,
    placeholderId?: string
  ): void {
    if (result.redirected) {
      return;
    }
    if (result.error) {
      this.displayErrorResult(result.error, task, placeholderId);
    } else if (result.directUrl) {
      this.displayDirectUrlResult(result, task, placeholderId);
    } else if (result.blob) {
      this.displayBlobResult(result, task, placeholderId);
    } else if (result.data) {
      this.displayDataResult(result.data, task, placeholderId);
    }
  }

  private displayErrorResult(error: string, task: any, placeholderId?: string): void {
    const message = 'Error: ' + error;
    if (placeholderId) {
      if (!this.updatePlaceholder(placeholderId, this.escapeHtml(message))) {
        this.pendingResults.set(placeholderId, { task, result: { error } });
      }
      return;
    }
    alert(message);
  }

  private displayDirectUrlResult(result: any, task: any, placeholderId?: string): void {
    const html = this.renderDirectUrlHtml(result.directUrl, result.mimeType, result.filename);
    if (placeholderId) {
      const isImage = result.mimeType?.startsWith('image/');
      const success = isImage
        ? this.updatePlaceholder(placeholderId, html)
        : this.replaceCollapsibleWithContent(placeholderId, html);
      if (!success) {
        this.pendingResults.set(placeholderId, { task, result });
      }
      return;
    }
    window.open(result.directUrl, '_blank');
  }

  private static readonly MIME_TYPE_INFO: Record<string, { label: string }> = {
    'application/pdf':  { label: 'PDF' },
    'application/xml':  { label: 'XML' },
    'text/xml':         { label: 'XML' },
    'text/csv':         { label: 'CSV' },
    'application/msword':                                                          { label: 'DOC' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':     { label: 'DOCX' },
    'application/vnd.ms-excel':                                                    { label: 'XLS' },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':           { label: 'XLSX' },
    'application/vnd.oasis.opendocument.text':                                     { label: 'ODT' },
    'application/vnd.oasis.opendocument.spreadsheet':                              { label: 'ODS' },
  };

  private getMimeTypeInfo(mimeType: string): { label: string } {
    const known = FeatureInfoMoreInfoHandler.MIME_TYPE_INFO[mimeType];
    if (known) return known;
    const subtype = mimeType.split('/')[1] ?? mimeType;
    const label = subtype.split(/[.+-]/).pop()?.toUpperCase() ?? 'File';
    return { label };
  }

  private isBinaryBlobMimeType(mimeType: string): boolean {
    return (
      !mimeType.startsWith('image/') &&
      mimeType !== 'application/json' &&
      mimeType !== 'application/xml' &&
      mimeType !== 'text/xml'
    );
  }

  /**
   * Renders a resource item with a plain-text label and action spans.
   * Uses <span> instead of <a> to avoid SITNA's link icon decoration.
   * Click handling is done via delegated listener in attachMoreInfoListeners.
   * The download button is only shown when canDownload is true (blob URLs),
   * since the download attribute is ignored for cross-origin URLs.
   */
  private renderFileActionsHtml(
    name: string,
    openUrl: string,
    downloadUrl: string,
    downloadFilename: string,
    canDownload: boolean
  ): string {
    const openTitle = this.translateService.instant('moreInfo.openLink');
    const downloadTitle = this.translateService.instant('moreInfo.downloadFile');
    const actionStyle = 'style="cursor:pointer;user-select:none;"';
    const downloadBtn = canDownload
      ? '\u00a0<span class="sitmun-resource-action" role="button" tabindex="0" ' + actionStyle +
          ' data-action="download" data-url="' + downloadUrl + '"' +
          ' data-filename="' + this.escapeHtml(downloadFilename) + '"' +
          ' title="' + this.escapeHtml(downloadTitle) + '">\u2B07\uFE0F</span>'
      : '';
    return (
      '<span class="sitmun-resource-item">' +
      '<span class="sitmun-resource-name">' + this.escapeHtml(name) + '</span>\u00a0' +
      '<span class="sitmun-resource-action" role="button" tabindex="0" ' + actionStyle +
        ' data-action="open" data-url="' + openUrl + '"' +
        ' title="' + this.escapeHtml(openTitle) + '">\uD83D\uDD17</span>' +
      downloadBtn +
      '</span>'
    );
  }

  private renderDirectUrlHtml(url: string, mimeType: string, filename: string | null): string {
    if (mimeType?.startsWith('image/')) {
      return '<img src="' + url + '" alt="" style="max-width:100%;height:auto;" />';
    }
    const { label } = this.getMimeTypeInfo(mimeType);
    const name = filename ?? label;
    return this.renderFileActionsHtml(name, url, url, name, false);
  }

  private displayBlobResult(result: any, task: any, placeholderId?: string): void {
    if (placeholderId) {
      const html = this.renderBlobResult(result);
      const success = this.isBinaryBlobMimeType(result.mimeType)
        ? this.replaceCollapsibleWithContent(placeholderId, html)
        : this.updatePlaceholder(placeholderId, html);
      if (!success) {
        this.pendingResults.set(placeholderId, { task, result });
      }
      return;
    }
    this.triggerBlobDownload(result);
  }

  private displayDataResult(data: any, task: any, placeholderId?: string): void {
    const rows = normalizeMoreInfoRows(data);
    const tableHtml = this.renderTableHtml(rows);
    if (placeholderId) {
      if (!this.updatePlaceholder(placeholderId, tableHtml)) {
        this.pendingResults.set(placeholderId, { task, result: { data } });
      }
      return;
    }
    alert('More info:\n' + JSON.stringify(data, null, 2));
  }

  private renderBlobResult(result: { blob: Blob; mimeType: string; filename: string | null }): string {
    const { mimeType } = result;

    if (mimeType.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(result.blob);
      return '<img src="' + objectUrl + '" alt="" style="max-width:100%;height:auto;" />';
    }

    if (mimeType === 'application/json') {
      // Render asynchronously: return a temporary placeholder while we read the blob
      const placeholderId = 'sitmun-blob-json-' + String(++this.placeholderCounter);
      result.blob.text().then((text: string) => {
        try {
          const rows = normalizeMoreInfoRows(JSON.parse(text));
          const el = document.querySelector<HTMLElement>('[data-blob-id="' + placeholderId + '"]');
          if (el) {
            el.outerHTML = this.renderTableHtml(rows);
          }
        } catch {
          const el = document.querySelector<HTMLElement>('[data-blob-id="' + placeholderId + '"]');
          if (el) {
            el.textContent = text;
          }
        }
      });
      return '<span data-blob-id="' + placeholderId + '">Carregant...</span>';
    }

    if (mimeType === 'application/xml' || mimeType === 'text/xml') {
      const placeholderId = 'sitmun-blob-xml-' + String(++this.placeholderCounter);
      result.blob.text().then((text: string) => {
        const rows = normalizeXmlRows(text);
        const el = document.querySelector<HTMLElement>('[data-blob-id="' + placeholderId + '"]');
        if (el) {
          el.outerHTML = rows.length > 0
            ? this.renderTableHtml(rows)
            : '<pre style="white-space:pre-wrap;word-break:break-word">' + this.escapeHtml(text) + '</pre>';
        }
      });
      return '<span data-blob-id="' + placeholderId + '">Carregant...</span>';
    }

    // Binary / PDF / other: render open and download action icons.
    const objectUrl = URL.createObjectURL(result.blob);
    const { label } = this.getMimeTypeInfo(mimeType);
    const name = result.filename ?? label;
    return this.renderFileActionsHtml(name, objectUrl, objectUrl, name, true);
  }

  /** Fallback for non-placeholder blob results: open images/PDFs in new tab, download the rest. */
  private triggerBlobDownload(result: { blob: Blob; mimeType: string; filename: string | null }): void {
    const objectUrl = URL.createObjectURL(result.blob);
    if (result.mimeType.startsWith('image/') || result.mimeType === 'application/pdf') {
      window.open(objectUrl, '_blank');
      return;
    }
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = result.filename ?? 'document';
    anchor.click();
  }

  private renderTableHtml(rows: any[]): string {
    if (!rows || rows.length === 0) {
      return '<div class="sitmun-more-info-empty">Sense dades</div>';
    }

    const columns = Object.keys(rows[0]);
    const header = columns
      .map((column) => '<th>' + this.escapeHtml(column) + '</th>')
      .join('');
    const body = rows
      .map((row) => {
        const cells = columns
          .map((column) => {
            return (
              '<td>' +
              this.escapeHtml(this.stringifyValueForDisplay(row[column])) +
              '</td>'
            );
          })
          .join('');
        return '<tr>' + cells + '</tr>';
      })
      .join('');

    return (
      '<table class="sitmun-json-table">' +
      '<thead><tr>' +
      header +
      '</tr></thead>' +
      '<tbody>' +
      body +
      '</tbody>' +
      '</table>'
    );
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
      .join('&#39;');
  }

  private stringifyValueForDisplay(value: any): string {
    if (value === null || value === undefined) return '';

    if (typeof value === 'object') {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return '[valor no serialitzable]';
      }
    }

    return String(value);
  }

  private updatePlaceholder(placeholderId: string, html: string): boolean {
    const element = document.querySelector<HTMLElement>(
      '[data-placeholder-id="' + placeholderId + '"]'
    );
    if (!element) {
      return false;
    }

    element.classList.remove('sitmun-more-info-loading');
    element.innerHTML = html;
    return true;
  }

  /**
   * Replaces the parent .sitmun-more-info-collapsible <details> element
   * (if present) with the given html, removing the Veure/Amaga wrapper.
   * Falls back to updating innerHTML of the placeholder itself.
   */
  private replaceCollapsibleWithContent(placeholderId: string, html: string): boolean {
    const placeholder = document.querySelector<HTMLElement>(
      '[data-placeholder-id="' + placeholderId + '"]'
    );
    if (!placeholder) return false;

    const collapsible = placeholder.closest<HTMLElement>('.sitmun-more-info-collapsible');
    if (collapsible) {
      collapsible.outerHTML = html;
    } else {
      placeholder.innerHTML = html;
    }
    return true;
  }

  private flushPendingResults(container: HTMLElement): void {
    if (this.pendingResults.size === 0) return;

    Array.from(this.pendingResults.entries()).forEach(([id, payload]) => {
      const element = container.querySelector<HTMLElement>(
        '[data-placeholder-id="' + id + '"]'
      );
      if (!element) return;

      const result = payload.result;
      if (result?.error) {
        element.classList.remove('sitmun-more-info-loading');
        element.innerHTML = this.escapeHtml('Error: ' + result.error);
      } else if (result?.directUrl) {
        const html = this.renderDirectUrlHtml(result.directUrl, result.mimeType, result.filename);
        const isImage = result.mimeType?.startsWith('image/');
        if (!isImage) {
          const collapsible = element.closest<HTMLElement>('.sitmun-more-info-collapsible');
          if (collapsible) { collapsible.outerHTML = html; this.pendingResults.delete(id); return; }
        }
        element.classList.remove('sitmun-more-info-loading');
        element.innerHTML = html;
      } else if (result?.blob) {
        const html = this.renderBlobResult(result);
        if (this.isBinaryBlobMimeType(result.mimeType)) {
          const collapsible = element.closest<HTMLElement>('.sitmun-more-info-collapsible');
          if (collapsible) { collapsible.outerHTML = html; this.pendingResults.delete(id); return; }
        }
        element.classList.remove('sitmun-more-info-loading');
        element.innerHTML = html;
      } else if (result?.data) {
        element.classList.remove('sitmun-more-info-loading');
        const rows = normalizeMoreInfoRows(result.data);
        element.innerHTML = this.renderTableHtml(rows);
      }
      this.pendingResults.delete(id);
    });
  }

  private getTaskKey(task: any, index: number): string {
    return String(task?.id ?? 'idx-' + index);
  }

  private getPlaceholderId(feature: any, taskKey: string): string {
    let featureMap = this.placeholderIds.get(feature);
    if (!featureMap) {
      featureMap = new Map<string, string>();
      this.placeholderIds.set(feature, featureMap);
    }

    const existing = featureMap.get(taskKey);
    if (existing) return existing;

    const id = 'sitmun-more-info-' + String(++this.placeholderCounter);
    featureMap.set(taskKey, id);
    return id;
  }

  private lookupFeatureValue(currentData: any, fieldNameToLookup: string): any {
    const walked = resolveFeaturePath(currentData, fieldNameToLookup);
    if (walked !== undefined) {
      return walked;
    }
    let value = currentData?.[fieldNameToLookup];
    if (value === undefined && typeof fieldNameToLookup === 'string') {
      value = currentData?.[this.normalizeKey(fieldNameToLookup)];
    }

    return value;
  }

  private normalizeKey(value: string): string {
    return value.toLowerCase().split(/\s+/g).join('');
  }

  private buildUniqueFieldName(base: string, index: number): string {
    return base + '\u200B'.repeat(index);
  }

  /**
   * Builds the <summary> element with two spans toggled by CSS:
   * - .sitmun-label-closed visible when <details> is closed  ("Veure contingut")
   * - .sitmun-label-open  visible when <details> is open     ("Amagar contingut")
   */
  private buildCollapsibleSummary(): string {
    const show = this.translateService.instant('moreInfo.show');
    const hide = this.translateService.instant('moreInfo.hide');
    return (
      '<summary class="sitmun-more-info-summary">'
      + '<span class="sitmun-label-closed">' + show + '</span>'
      + '<span class="sitmun-label-open">' + hide + '</span>'
      + '</summary>'
    );
  }

  private buildMoreInfoLink(
    url: string,
    task: any,
    cartographyId: string,
    taskIndex: number
  ): string {
    const safeTaskId = task?.id ?? '';
    return (
      '<a href="' + url +
      '" class="sitmun-more-info-link" target="_blank" rel="noopener noreferrer" data-task-id="' + safeTaskId +
      '" data-cartography-id="' + cartographyId +
      '" data-task-index="' + String(taskIndex) +
      '">' +
      this.escapeHtml(task?.name ?? '') +
      '</a>'
    );
  }

  private buildMoreInfoPlaceholder(
    task: any,
    taskId: string,
    cartographyId: string,
    placeholderId: string
  ): string {
    return (
      '<details class="sitmun-more-info-collapsible">' +
      this.buildCollapsibleSummary() +
      '<div class="sitmun-more-info-placeholder sitmun-more-info-loading" data-task-id="' + taskId +
      '" data-cartography-id="' + cartographyId +
      '" data-placeholder-id="' + placeholderId +
      '">Carregant...</div>' +
      '</details>'
    );
  }
}
