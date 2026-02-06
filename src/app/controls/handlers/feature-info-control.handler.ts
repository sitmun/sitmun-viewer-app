import { Injectable, inject } from '@angular/core';

import { AppCfg } from '@api/model/app-cfg';

import { MoreInfoService } from '../../services/more-info.service';
import { SitnaApiService } from '../../services/sitna-api.service';
import type { Meld, MeldJoinPoint } from '../../types/meld.types';
import { ControlHandlerBase } from '../control-handler-base';

declare function require(module: string): unknown;
const meld = require('meld') as Meld;

/**
 * Handler for the native SITNA featureInfo control.
 * Allows users to click on map features to view their information.
 *
 * Control Type: sitna.featureInfo
 * - Elevation display configuration
 * - More Info functionality: Adds "Més informació" field to features with moreInfo tasks
 * Configuration: Optional parameters (active, persistentHighlights, displayElevation, etc.)
 *
 * Elevation Display:
 * - Set `displayElevation: true` in controlDefaults or task parameters to enable elevation in popup
 * - Elevation values are fetched from elevation services configured at map level or control level
 * - If `displayElevation` is boolean true, uses map's elevation tool or creates default elevation tool
 * - If `displayElevation` is an object, uses that configuration for elevation services
 * More Info Functionality:
 * - Automatically adds "Més informació" field to features when cartography has moreInfo task
 * - Field appears as clickable link with info icon
 * - Executes configured query (URL redirect or SQL query) when clicked
 */
@Injectable({
  providedIn: 'root'
})
export class FeatureInfoControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'sitna.featureInfo';
  readonly sitnaConfigKey = 'featureInfo';
  readonly requiredPatches = undefined;
  private readonly moreInfoService = inject(MoreInfoService);
  private appConfig: AppCfg | null = null;

  constructor(sitnaApi: SitnaApiService) {
    super(sitnaApi);
  }

  /**
   * Load patches for featureInfo control.
   * Patches:
   * 1. Map.addControl - Apply displayElevation config to featureInfo and featureTools
   * 2. FeatureInfo.register - Apply displayElevation from map config
   * 3. FeatureInfo.responseCallback - Inject "Més informació" field into features
   */
  override async loadPatches(context: AppCfg): Promise<void> {
    // Initialize MoreInfo service and store config
    this.moreInfoService.initialize(context);
    this.appConfig = context;
    await this.withTCAsync(async (TC) => {
      const mapProto = TC?.Map?.prototype;
      if (mapProto?.addControl && !mapProto.__sitmunFiAddControl) {
        const addControlAdvice = meld.around(
          mapProto,
          'addControl',
          function (this: any, jp: MeldJoinPoint) {
            const [ctrl, opts] = jp.args as [any, any];
            const isFeatureInfo = ctrl === 'featureInfo';
            const isFeatureTools = ctrl === 'featureTools';
            const needCfg =
              (isFeatureInfo || isFeatureTools) &&
              opts?.displayElevation == null &&
              this.options?.controls?.featureInfo?.displayElevation != null;
            let inject = null;
            if (needCfg && isFeatureTools) {
              inject = {
                displayElevation:
                  this.options.controls.featureInfo.displayElevation
              };
            } else if (needCfg) {
              inject = this.options.controls.featureInfo;
            }
            const finalOpts =
              inject === null
                ? opts
                : TC.Util.extend(true, {}, opts || {}, inject);
            return jp.proceedApply([ctrl, finalOpts]);
          }
        );
        mapProto.__sitmunFiAddControl = true;
        this.patchManager.add(() => {
          meld.remove(addControlAdvice);
          delete mapProto.__sitmunFiAddControl;
        });
      }

      const fiProto = TC?.control?.FeatureInfo?.prototype;
      if (fiProto?.register && !fiProto.__sitmunFiRegister) {
        const registerAdvice = meld.around(
          fiProto,
          'register',
          function (this: any, jp: MeldJoinPoint) {
            const [map] = jp.args as [any];
            if (
              this.options?.displayElevation === undefined &&
              map?.options?.controls?.featureInfo?.displayElevation !==
                undefined
            ) {
              this.options = TC.Util.extend(
                true,
                {},
                this.options,
                map.options.controls.featureInfo
              );
            }
            return jp.proceedApply(jp.args);
          }
        );
        mapProto.__sitmunFiRegister = true;
        this.patchManager.add(() => {
          meld.remove(registerAdvice);
          delete mapProto.__sitmunFiRegister;
        });
      }

      // Patch responseCallback to inject "Més informació" field
      if (fiProto?.responseCallback && !fiProto.__sitmunMoreInfo) {
        const responseCallbackAdvice = meld.around(
          fiProto,
          'responseCallback',
          (jp: MeldJoinPoint) => {
            const [options] = jp.args as [any];

            // Process features BEFORE calling original responseCallback
            if (options?.services && this.moreInfoService.hasMoreInfoTasks()) {
              this.injectMoreInfoFields(options);
            }

            // Call original responseCallback
            const result = jp.proceedApply(jp.args);

            // After render, attach event listeners
            setTimeout(() => {
              this.attachMoreInfoListeners(jp.target);
            }, 100);

            return result;
          }
        );
        fiProto.__sitmunMoreInfo = true;
        this.patchManager.add(() => {
          meld.remove(responseCallbackAdvice);
          delete fiProto.__sitmunMoreInfo;
        });
      }
    });
  }

  /**
   * Inject "Més informació" fields into features before rendering
   */
  private injectMoreInfoFields(options: any): void {
    if (!options.services) return;

    for (const service of options.services) {
      this.processServiceLayers(service);
    }
  }

  /**
   * Process all layers in a service
   */
  private processServiceLayers(service: any): void {
    if (!service.layers) return;

    for (const layer of service.layers) {
      this.processLayerFeatures(layer);
    }
  }

  /**
   * Process all features in a layer
   */
  private processLayerFeatures(layer: any): void {
    if (!layer.features) return;

    const cartographyId = this.getCartographyIdFromLayerName(layer.name);

    if (!cartographyId) return;

    const tasks = this.moreInfoService.getMoreInfoTasks(cartographyId);
    if (tasks.length === 0) return;

    for (const feature of layer.features) {
      this.addMoreInfoFieldsToFeature(feature, tasks, cartographyId);
    }
  }

  /**
   * Add "Més informació" fields to a single feature
   */
  private addMoreInfoFieldsToFeature( feature: any, tasks: any[], cartographyId: string): void {
    const currentData = feature.getData
      ? feature.getData()
      : feature.data || {};
    const newData = { ...currentData };

    tasks.forEach((task: any, index: number) => {
      const taskText = task.name || task.id || 'Més informació';
      const fieldName = 'ℹ️' + ' '.repeat(index);

      // Build URL with parameter substitution for URL and API tasks
      if (task.command && task.parameters) {
        let url = task.command;
        Object.keys(task.parameters).forEach((paramName) => {
          const paramConfig = task.parameters[paramName];
          const fieldNameToLookup =
            paramConfig.value || paramConfig.name || paramName;

          let value = currentData[fieldNameToLookup];
          if (value === undefined) {
            const normalizedFieldName = fieldNameToLookup.toLowerCase().replace(/\s+/g, '');
            value = currentData[normalizedFieldName];
          }
          /**NOMES PER TEST**/
          // Fallback values for API calls when field not found
          if (value === undefined && task.scope === 'API') {
            if (fieldNameToLookup === 'longitud') {
              value = 3.85289;
            } else if (fieldNameToLookup === 'latitud') {
              value = 39.88853;
            }
          }
          if (value !== undefined) {
            const placeholder = paramName.startsWith('${') && paramName.endsWith('}')
              ? paramName
              : '${' + paramName + '}';
            url = url.replace(placeholder, String(value));
          }
        });
        newData[fieldName] =
          '<a href="'+ url +'" target="_blank" rel="noopener noreferrer">' + taskText + '</a>';
      } else {
        newData[fieldName] = taskText;
      }
    });

    // Update feature data
    if (typeof feature.setData === 'function') {
      feature.setData(newData);
    } else {
      feature.data = newData;
    }
  }

  /**
   * Attach click event listeners to "Més informació" links
   */
  private attachMoreInfoListeners(featureInfoControl: any): void {
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

        // Find the specific task by ID
        const tasks = this.moreInfoService.getMoreInfoTasks(cartographyId);
        const task = tasks.find((t: any) => t.id === taskId);

        if (!task) {
          return;
        }

        // Get feature data from the table
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

  /**
   * Get cartography ID from layer name by searching in app config
   */
  private getCartographyIdFromLayerName(layerName: string): string | null {
    return this.searchCartographyIdInConfig(layerName);
  }

  /**
   * Search for cartography ID in app config layers
   */
  private searchCartographyIdInConfig(layerName: string): string | null {
    if (!this.appConfig?.layers) return null;

    for (const layer of this.appConfig.layers) {
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

  /**
   * Extract cartography ID from a config layer if it contains the layer name
   */
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

  /**
   * Get feature info container element
   */
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

  /**
   * Extract feature data from rendered attribute table
   */
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
          // Store with original key
          data[key] = value;
          // Also store with normalized key (lowercase, no spaces)
          const normalizedKey = key.toLowerCase().replace(/\s+/g, '');
          data[normalizedKey] = value;
        }
      }
    });

    return data;
  }

  /**
   * Display More Info result
   * NOTE: Currently shows results in browser alert.
   * Future enhancement: Implement custom popup/dialog component.
   */
  private displayMoreInfoResult(result: any): void {
    if (result.redirected) {
      // URL redirect already opened in new window
      return;
    }

    // Show result in alert (basic implementation)
    if (result.error) {
      alert('Error: ' + result.error);
    } else if (result.data) {
      alert('Més informació:\n' + JSON.stringify(result.data, null, 2));
    }
  }
}
