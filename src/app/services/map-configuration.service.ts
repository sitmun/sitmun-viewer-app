import { Injectable } from '@angular/core';
import { SitnaBaseLayer, SitnaViews } from '@api/model/sitna-cfg';
import { AppCfg, AppGroup } from '@api/model/app-cfg';
import { ConfigLookupService } from './config-lookup.service';
import { AppConfigService } from './app-config.service';

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
    private appConfigService: AppConfigService
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
    let baseLayers: SitnaBaseLayer[] = [];
    if (apiConfig.backgrounds.length) {
      let backgrounds: string[] = [];
      let groups: AppGroup[] = [];
      let layers: string[] = [];
      let thumbnail: string = ''; // TODO-redo
      for (let background of apiConfig.backgrounds) {
        backgrounds.push(background.id);
        // if(typeof background.thumbnail!='undefined' && background.thumbnail) { // TODO-redo
        //   thumbnail = background.thumbnail;
        // }
      }
      for (let background of backgrounds) {
        const group =
          this.configLookup.findGroup(background) ||
          apiConfig.groups.find((elem) => elem.id === background);
        if (group != undefined) {
          groups.push(group);
        }
      }
      for (let group of groups) {
        if (group.layers != undefined) {
          for (let layer of group.layers) {
            layers.push(layer);
          }
        }
      }
      for (let layerElement of layers) {
        const layer =
          this.configLookup.findLayer(layerElement) ||
          apiConfig.layers.find((elem) => elem.id === layerElement);
        if (layer != undefined) {
          const service =
            this.configLookup.findService(layer.service) ||
            apiConfig.services.find((service) => service.id === layer.service);
          for (let background of apiConfig.backgrounds) {
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
            let a: SitnaBaseLayer = {
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
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'sitna.threed')) {
      sitnaViews.threeD = {
        div: 'threedMap',
        controls: [
          'threeD',
          'navBar',
          'navBarHome',
          'basemapSelector',
          'layerCatalogSilme',
          'workLayerManagerSilme',
          'drawMeasureModifySilme',
          'legend'
        ]
      };
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
   * Get attribution text from app configuration
   * @returns Attribution string or undefined if not configured
   */
  toAttribution(): string | undefined {
    const attribution = this.appConfigService.getAttribution();
    return attribution || undefined;
  }
}
