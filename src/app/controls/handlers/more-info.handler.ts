import type { AppCfg } from '@api/model/app-cfg';

import { MoreInfoService } from '../../services/more-info.service';

export class FeatureInfoMoreInfoHandler {
  private placeholderCounter = 0;
  private readonly placeholderIds = new WeakMap<any, Map<string, string>>();
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
      if (!service?.layers || !Array.isArray(service.layers)) continue;

      for (const layer of service.layers) {
        if (!layer?.features || !Array.isArray(layer.features)) continue;

        const cartographyId = this.getCartographyIdFromLayerName(layer.name);
        if (!cartographyId) continue;

        const tasks = this.moreInfoService.getMoreInfoTasks(cartographyId);
        if (tasks.length === 0) continue;

        const nonInteractiveTasks = tasks.filter((task: any) =>
          this.isNonInteractiveTask(task)
        );
        if (nonInteractiveTasks.length === 0) continue;

        for (const feature of layer.features) {
          const featureData = feature.getData
            ? feature.getData()
            : feature.data || {};

          nonInteractiveTasks.forEach((task: any) => {
            const taskIndex = tasks.indexOf(task);
            const taskKey = this.getTaskKey(task, taskIndex);
            const placeholderId = this.getPlaceholderId(feature, taskKey);
            this.moreInfoService.executeMoreInfo(task, featureData).subscribe({
              next: (result: any) => {
                this.displayMoreInfoResult(task, result, placeholderId);
              },
              error: (error: any) => {
                this.displayMoreInfoResult(
                  task,
                  { error: error?.message || 'Error obtenint més informació' },
                  placeholderId
                );
              }
            });
          });
        }
      }
    }
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

    this.flushPendingResults(container);
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

    const currentData = feature.getData ? feature.getData() : feature.data || {};
    const newData = { ...currentData };

    tasks.forEach((task: any, index: number) => {
      const taskText = task.name;
      const fieldName = 'ℹ️' + ' '.repeat(index);
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

      if (task.command) {
        let url = task.command;
        if (task.parameters) {
          Object.keys(task.parameters).forEach((paramName) => {
            const { label, name, value } = task.parameters[paramName];
            const fieldNameToLookup = value || name || paramName;

            const featureValue = this.lookupFeatureValue(
              currentData,
              fieldNameToLookup
            );

            if (featureValue !== undefined) {
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

  private parseTaskParameters(parameters: any): any | null {
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
      const rows = this.normalizeRows(result.data);
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

  private normalizeRows(data: any): any[] {
    if (data == null) return [];

    if (typeof data === 'string') {
      const trimmed = data.trim();
      if (
        (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))
      ) {
        try {
          const parsed = JSON.parse(trimmed);
          return this.normalizeRows(parsed);
        } catch {
          return [{ value: data }];
        }
      }
      return [{ value: data }];
    }

    if (Array.isArray(data)) {
      if (data.length === 0) return [];
      if (data.every((item) => item && typeof item === 'object')) {
        return data;
      }
      return data.map((item) => ({ value: item }));
    }

    if (typeof data === 'object') {
      return [data];
    }

    return [{ value: data }];
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
          .map((column) =>
            '<td>' + this.escapeHtml(String(row[column] ?? '')) + '</td>'
          )
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
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private updatePlaceholder(placeholderId: string, html: string): boolean {
    const element = document.querySelector(
      '[data-placeholder-id="' + placeholderId + '"]'
    ) as HTMLElement | null;
    if (!element) {
      return false;
    }

    element.innerHTML = html;
    return true;
  }

  private flushPendingResults(container: HTMLElement): void {
    if (this.pendingResults.size === 0) return;

    Array.from(this.pendingResults.entries()).forEach(([id, payload]) => {
      const element = container.querySelector(
        '[data-placeholder-id="' + id + '"]'
      ) as HTMLElement | null;
      if (!element) return;

      const result = payload.result;
      if (result?.error) {
        element.innerHTML = this.escapeHtml('Error: ' + result.error);
      } else if (result?.data) {
        const rows = this.normalizeRows(result.data);
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
    return value.toLowerCase().replace(/\s+/g, '');
  }

  private buildMoreInfoLink(
    url: string,
    taskText: string,
    taskId: string | undefined,
    cartographyId: string,
    taskIndex: number
  ): string {
    const safeTaskId = taskId ? taskId : '';
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
