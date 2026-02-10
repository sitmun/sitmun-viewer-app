import type { AppCfg } from '@api/model/app-cfg';

import { MoreInfoService } from '../../services/more-info.service';

export class FeatureInfoMoreInfoHandler {
  constructor(
    private readonly moreInfoService: MoreInfoService,
    private readonly getAppConfig: () => AppCfg | null
  ) {}

  injectMoreInfoFields(options: any): void {
    if (!options?.services || !Array.isArray(options.services)) return;

    for (const service of options.services) {
      this.processServiceLayers(service);
    }
  }

  attachMoreInfoListeners(featureInfoControl: any): void {
    const container = this.getFeatureInfoContainer(featureInfoControl);
    if (!container) return;

    const links = container.querySelectorAll('.sitmun-more-info-link');

    links.forEach((link: any) => {
      link.addEventListener('click', (e: Event) => {
        e.preventDefault();

        const taskId = link.dataset.taskId;
        const cartographyId = link.dataset.cartographyId;

        if (!taskId || !cartographyId) {
          return;
        }

        const tasks = this.moreInfoService.getMoreInfoTasks(cartographyId);
        const task = tasks.find((t: any) => t.id === taskId);

        if (!task) {
          return;
        }

        const table = link.closest('table.tc-attr');
        const featureData = this.extractFeatureDataFromTable(table);

        this.moreInfoService.executeMoreInfo(task, featureData).subscribe({
          next: (result: any) => {
            this.displayMoreInfoResult(result);
          },
          error: (error: any) => {
            alert('Error obtenint més informació: ' + error.message);
          }
        });
      });
    });
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
      this.addMoreInfoFieldsToFeature(feature, tasks);
    }
  }

  private addMoreInfoFieldsToFeature(feature: any, tasks: any[]): void {
    if (!Array.isArray(tasks)) return;

    const currentData = feature.getData ? feature.getData() : feature.data || {};
    const newData = { ...currentData };

    tasks.forEach((task: any, index: number) => {
      const taskText = task.name;
      const fieldName = 'ℹ️' + ' '.repeat(index);

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
        newData[fieldName] = this.buildMoreInfoLink(url, taskText);
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

  private displayMoreInfoResult(result: any): void {
    if (result.redirected) {
      return;
    }

    if (result.error) {
      alert('Error: ' + result.error);
    } else if (result.data) {
      alert('Més informació:\n' + JSON.stringify(result.data, null, 2));
    }
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

  private buildMoreInfoLink(url: string, taskText: string): string {
    return (
      '<a href="' +
      url +
      '" target="_blank" rel="noopener noreferrer">' +
      taskText +
      '</a>'
    );
  }
}
