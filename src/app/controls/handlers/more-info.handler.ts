import type { AppCfg } from '@api/model/app-cfg';

import { MoreInfoService } from '../../services/more-info.service';
import { normalizeMoreInfoRows } from '../utils/more-info-data.utils';

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
    private readonly showJsonResult?: (title: string, rows: any[]) => void
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

    const links = container.querySelectorAll('.sitmun-more-info-link');

    links.forEach((link: any) => {
      link.addEventListener('click', (e: Event) => {
        e.preventDefault();

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
          taskText,
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
          taskText,
          task.id,
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
        const key = th.textContent?.trim();
        const value = td.textContent?.trim();
        if (key && value && key !== 'Més informació' && !key.includes('ℹ️')) {
          data[key] = value;
          data[this.normalizeKey(key)] = value;
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
      const message = 'Error: ' + result.error;
      if (placeholderId) {
        if (!this.updatePlaceholder(placeholderId, this.escapeHtml(message))) {
          this.pendingResults.set(placeholderId, { task, result });
        }
        return;
      }
      alert(message);
    } else if (result.data) {
      const rows = normalizeMoreInfoRows(result.data);
      const tableHtml = this.renderTableHtml(rows);
      if (placeholderId) {
        if (!this.updatePlaceholder(placeholderId, tableHtml)) {
          this.pendingResults.set(placeholderId, { task, result });
        }
        return;
      }
      if (this.showJsonResult) {
        const title = task?.name || 'More info';
        this.showJsonResult(title, rows);
        return;
      }
      alert('More info:\n' + JSON.stringify(result.data, null, 2));
    }
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

    element.innerHTML = html;
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
        element.innerHTML = this.escapeHtml('Error: ' + result.error);
      } else if (result?.data) {
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
    let value = currentData[fieldNameToLookup];
    if (value === undefined) {
      value = currentData[this.normalizeKey(fieldNameToLookup)];
    }

    return value;
  }

  private normalizeKey(value: string): string {
    return value.toLowerCase().split(/\s+/g).join('');
  }

  private buildUniqueFieldName(base: string, index: number): string {
    return base + '\u200B'.repeat(index);
  }

  private buildMoreInfoLink(
    url: string,
    taskText: string,
    taskId: string | undefined,
    cartographyId: string,
    taskIndex: number
  ): string {
    const safeTaskId = taskId ?? '';
    return (
      '<a href="' +
      url +
      '" class="sitmun-more-info-link" data-task-id="' +
      safeTaskId +
      '" data-cartography-id="' +
      cartographyId +
      '" data-task-index="' +
      String(taskIndex) +
      '" target="_blank" rel="noopener noreferrer">' +
      taskText +
      '</a>'
    );
  }

  private buildMoreInfoPlaceholder(
    taskText: string,
    taskId: string,
    cartographyId: string,
    placeholderId: string
  ): string {
    return (
      '<span class="sitmun-more-info-placeholder" data-task-id="' +
      taskId +
      '" data-cartography-id="' +
      cartographyId +
      '" data-placeholder-id="' +
      placeholderId +
      '">' +
      this.escapeHtml(taskText) +
      ' (Carregant...)' +
      '</span>'
    );
  }
}
