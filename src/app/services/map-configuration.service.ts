import { Injectable } from '@angular/core';

import { AppCfg, AppGroup } from '@api/model/app-cfg';
import { SitnaBaseLayer, SitnaViews } from '@api/model/sitna-cfg';

import { AppConfigService } from './app-config.service';
import { ConfigLookupService } from './config-lookup.service';
import { ControlRegistryService } from './control-registry.service';

/**
 * Service for converting AppCfg to SITNA map-level configuration.
 * Handles base layers, CRS, extent, views, and layout configuration.
 */
@Injectable({
  providedIn: 'root'
})
export class MapConfigurationService {
  private static readonly DEFAULT_THUMBNAIL_URL =
    'assets/img/dummy_map_thumbnail.jpg';

  constructor(
    private configLookup: ConfigLookupService,
    private appConfigService: AppConfigService,
    private controlRegistry: ControlRegistryService
  ) {}

  /**
   * Get coordinate reference system from application config
   */
  toCrs(apiConfig: AppCfg): string | undefined {
    let crs;
    if (apiConfig.application?.srs) {
      crs = apiConfig.application.srs;
    }
    return crs;
  }

  /**
   * Get initial map extent from application config
   */
  toInitialExtent(
    apiConfig: AppCfg
  ): [number, number, number, number] | undefined {
    let initialExtent;
    if (apiConfig.application.initialExtent) {
      initialExtent = apiConfig.application.initialExtent;
    }
    return initialExtent;
  }

  /**
   * Convert AppCfg backgrounds to SITNA base layers
   *
   * WARNING
   * Thumbnails coming from backgrounds, but backgrounds may contain more than one layer.
   * This has to be rethought from the admin, once done, the code marked with 'TODO-redo' must be reviewed.
   */
  toBaseLayers(apiConfig: AppCfg): SitnaBaseLayer[] {
    const baseLayers: SitnaBaseLayer[] = [];
    if (apiConfig.backgrounds.length) {
      const backgrounds: string[] = [];
      const groups: AppGroup[] = [];
      const layers: string[] = [];
      let thumbnail = ''; // TODO-redo
      for (const background of apiConfig.backgrounds) {
        backgrounds.push(background.id);
        // if(typeof background.thumbnail!='undefined' && background.thumbnail) { // TODO-redo
        //   thumbnail = background.thumbnail;
        // }
      }
      for (const background of backgrounds) {
        const group =
          this.configLookup.findGroup(background) ||
          apiConfig.groups.find((elem) => elem.id === background);
        if (group != undefined) {
          groups.push(group);
        }
      }
      for (const group of groups) {
        if (group.layers != undefined) {
          for (const layer of group.layers) {
            layers.push(layer);
          }
        }
      }
      for (const layerElement of layers) {
        const layer =
          this.configLookup.findLayer(layerElement) ||
          apiConfig.layers.find((elem) => elem.id === layerElement);
        if (layer != undefined) {
          const service =
            this.configLookup.findService(layer.service) ||
            apiConfig.services.find((service) => service.id === layer.service);
          for (const background of apiConfig.backgrounds) {
            thumbnail = '';
            if (
              typeof background.thumbnail != 'undefined' &&
              background.thumbnail &&
              groups.find(
                (x) => x.id == background.id && x.layers?.includes(layerElement)
              )
            ) {
              // TODO-redo
              thumbnail = background.thumbnail;
              break;
            }
          }
          if (service != undefined) {
            const a: SitnaBaseLayer = {
              id: layer.title,
              title: layer.title,
              url: service.url,
              type: service.type,
              layerNames: layer.layers,
              matrixSet: service.parameters.matrixSet,
              format: service.parameters.format,
              isBase: true,
              thumbnail:
                thumbnail || MapConfigurationService.DEFAULT_THUMBNAIL_URL
            };
            if (service.type == 'WMTS') {
              a.layerNames = layer.layers[0];
            }
            baseLayers.push(a);
          }
        }
      }
    }
    return baseLayers;
  }

  /**
   * Convert AppCfg to SITNA views configuration
   */
  toViews(apiConfig: AppCfg): SitnaViews {
    const sitnaViews = {} as SitnaViews;

    // Check for 3D view task
    const threeDTask = apiConfig.tasks.find(
      (x) => x['ui-control'] === 'sitna.threed'
    );
    if (threeDTask) {
      // Get controls array from app-config.json (backend names)
      const threeDConfig =
        this.appConfigService.getControlDefault('sitna.threed');
      const backendControls = threeDConfig?.['controls'] as
        | string[]
        | undefined;

      // Translate backend names to SITNA names using handlers' sitnaConfigKey
      const sitnaControls = backendControls
        ? backendControls
            .map((backendName) => {
              const handler = this.controlRegistry.getHandler(backendName);
              if (!handler?.sitnaConfigKey) {
                console.warn(
                  `[MapConfiguration] No handler or sitnaConfigKey found for '${backendName}', skipping`
                );
                return null;
              }
              return handler.sitnaConfigKey;
            })
            .filter((key): key is string => key !== null)
        : [];

      // Get div from task parameters, default config, or fallback to 'tc-slot-threed'
      const divFromParams = threeDTask.parameters?.div;
      const divFromConfig = threeDConfig?.['div'] as string | undefined;
      const div = divFromParams || divFromConfig || 'tc-slot-threed';

      // Build view configuration
      sitnaViews.threeD = {
        div: div
      };

      // Only add controls array if we have controls (otherwise SITNA uses defaults)
      if (sitnaControls.length > 0) {
        sitnaViews.threeD.controls = sitnaControls;
      }
    }

    return sitnaViews;
  }

  /**
   * Get map layout/theme configuration
   */
  toLayout(appCfg: AppCfg): {
    config: string;
    markup: string;
    style: string;
    script: string;
    i18n: string;
  } {
    let theme = 'sitmun-base';
    if (appCfg.application?.theme) {
      theme = appCfg.application.theme;
    }

    return {
      config: 'assets/map-styles/' + theme + '/config.json',
      markup: 'assets/map-styles/' + theme + '/markup.html',
      style: 'assets/map-styles/' + theme + '/style.css',
      script: 'assets/map-styles/' + theme + '/script.js',
      i18n: 'assets/map-styles/' + theme + '/resources'
    };
  }

  /**
   * Get attribution text from app configuration.
   *
   * **Note:** This is the attribution TEXT (HTML content), not the control.
   * The attribution control is handled separately by AttributionControlHandler.
   * Both are needed for attribution to display:
   * - Attribution text (this method) → SITNA map options.attribution
   * - Attribution control → SITNA controls.attribution
   *
   * @returns Attribution string or undefined if not configured
   */
  toAttribution(): string | undefined {
    const attribution = this.appConfigService.getAttribution();
    return attribution || undefined;
  }
}
