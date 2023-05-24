import {
  SitnaBaseLayer,
  SitnaBaseLayers,
  SitnaWorkLayers,
  SitnaControls,
  SitnaInitialExtent,
  SitnaWorkLayer,
  SitnaViews
} from '@api/model/sitna-cfg';
import { AppCfg, AppGroup } from '@api/model/app-cfg';
import { SitnaCrs } from '@api/model/sitna-cfg';

export class SitnaControlsHelper {
  static toCrs(apiConfig: AppCfg): SitnaCrs {
    const sitnaCrs = {} as SitnaCrs;
    if (apiConfig.application?.srs) {
      sitnaCrs.crs = apiConfig.application.srs;
    }
    return sitnaCrs;
  }
  static toInitialExtent(apiConfig: AppCfg): SitnaInitialExtent {
    const sitnaInitialExtent = {} as SitnaInitialExtent;
    if (apiConfig.territory.initialExtent) {
      sitnaInitialExtent.initialExtent = apiConfig.territory.initialExtent;
    }
    return sitnaInitialExtent;
  }

  static toBaseLayers(apiConfig: AppCfg) {
    const sitnaBaseLayers = { baseLayers: [] } as SitnaBaseLayers;
    if (apiConfig.backgrounds) {
      let backgrounds: Array<string> = new Array();
      let groups: Array<AppGroup> = new Array();
      let layers: Array<string> = new Array();
      for (let background of apiConfig.backgrounds) {
        backgrounds.push(background.id);
      }
      for (let background of backgrounds) {
        const group = apiConfig.groups.find((elem) => elem.id === background);
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
        const layer = apiConfig.layers.find((elem) => elem.id === layerElement);
        if (layer != undefined) {
          let a: SitnaBaseLayer = {
            id: layer.title,
            title: layer.title,
            url: layer.service.url,
            layerNames: layer.layers,
            matrixSet: layer.service.parameters.matrixSet,
            format: layer.service.parameters.format,
            isBase: true
          };
          sitnaBaseLayers.baseLayers.push(a);
        }
      }
    }
    return sitnaBaseLayers;
  }
  static toWorkLayers(apiConfig: AppCfg) {
    const sitnaWorkLayers = { workLayers: [] } as SitnaWorkLayers;
    for (let layer of apiConfig.layers) {
      let a: SitnaWorkLayer = {
        id: layer.id,
        title: layer.title,
        url: layer.service.url,
        layerNames: layer.layers,
        matrixSet: layer.service.parameters.matrixSet,
        format: layer.service.parameters.format
      };
      sitnaWorkLayers.workLayers.push(a);
    }
    return sitnaWorkLayers;
  }
  /*
  static toWorkLayers(apiConfig: AppCfg) {
    let sitnaWorkLayers;
    if (apiConfig.layers) {
      let variable = apiConfig.layers.map((layer) => {
        return {
          id: layer.id,
          title: layer.title,
          url: layer.service.url,
          layerNames: layer.layers,
          matrixSet: layer.service.parameters.matrixSet,
          format: layer.service.parameters.format
        };
      });
      sitnaWorkLayers = variable;
    }
    return sitnaWorkLayers;
  }
  */
  static toControls(apiConfig: AppCfg) {
    const sitnaControls = {} as SitnaControls;
    sitnaControls.controlContainer = {
      div: 'ccontainer',
      controls: []
    };
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'attribution')) {
      sitnaControls.attribution = true;
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'basemapSelector')) {
      sitnaControls.basemapSelector = {
        basemapSelector: true,
        div: 'bms'
      };
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'click')) {
      sitnaControls.click = true;
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'coordinates')) {
      sitnaControls.coordinates = {
        coordinates: true,
        div: 'coordinates'
      };
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'dataLoader')) {
      sitnaControls.dataLoader = {
        dataLoader: true,
        div: 'dataloader'
      };
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'dataLoader')) {
      sitnaControls.download = {
        download: true,
        div: 'download'
      };
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'drawMeasureModify')) {
      sitnaControls.drawMeasureModify = {
        drawMeasureModify: true,
        div: 'drawmeasuremodify'
      };
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'fullScreen')) {
      sitnaControls.controlContainer.controls.push({
        position: 'left',
        fullScreen: true
      });
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'geolocation')) {
      sitnaControls.geolocation = {
        geolocation: true,
        div: 'share'
      };
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'legend')) {
      sitnaControls.legend = {
        legend: true,
        div: 'legend'
      };
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'loadingIndicator')) {
      sitnaControls.loadingIndicator = true;
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'measure')) {
      sitnaControls.measure = {
        measure: true,
        div: 'measure'
      };
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'navBar')) {
      sitnaControls.controlContainer.controls.push({
        position: 'left',
        navBar: true
      });
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'offlineMapMaker')) {
      sitnaControls.offlineMapMaker = {
        offlineMapMaker: true,
        div: 'offlinemapmaker'
      };
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'overviewMap')) {
      if (apiConfig.application['situation-map']) {
        const group = apiConfig.groups.find(
          (elem) => elem.id === apiConfig.application['situation-map']
        );
        if (
          group != undefined &&
          group.layers != undefined &&
          group.layers?.length > 0
        ) {
          const layer = group.layers[0];
          const layerObject = apiConfig.layers.find(
            (elem) => elem.id === layer
          );
          if (layerObject != undefined) {
            sitnaControls.overviewMap = {
              overviewMap: true,
              div: 'ovmap',
              layer: {
                id: layerObject.title,
                url: layerObject.service.url,
                layerNames: layerObject.layers
              }
            };
          }
        }
      } else {
        sitnaControls.overviewMap = {
          overviewMap: true,
          div: 'ovmap',
          layer: 'mapabase'
        };
      }
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'popup')) {
      sitnaControls.popup = true;
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'printMap')) {
      sitnaControls.printMap = {
        printMap: true,
        div: 'print'
      };
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'scale')) {
      sitnaControls.controlContainer.controls.push({
        position: 'right',
        scale: true
      });
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'scaleBar')) {
      sitnaControls.controlContainer.controls.push({
        position: 'right',
        scaleBar: true
      });
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'scaleSelector')) {
      sitnaControls.controlContainer.controls.push({
        position: 'right',
        scaleSelector: true
      });
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'search')) {
      sitnaControls.search = {
        search: true,
        div: 'search'
      };
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'share')) {
      sitnaControls.share = {
        share: true,
        div: 'share'
      };
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'streetView')) {
      sitnaControls.controlContainer.controls.push({
        position: 'left',
        streetView: true
      });
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'TOC')) {
      sitnaControls.TOC = {
        TOC: true,
        div: 'toc'
      };
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'workLayerManager')) {
      sitnaControls.workLayerManager = {
        workLayerManager: true,
        div: 'wlm'
      };
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'layerCatalog')) {
      sitnaControls.layerCatalog = {
        div: 'layercatalog',
        enableSearch: true,
        layers: SitnaControlsHelper.toWorkLayers(apiConfig).workLayers
      };
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'multiFeatureInfo')) {
      sitnaControls.multiFeatureInfo = {
        active: true
      };
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'threed')) {
      sitnaControls.threeD = true;
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'featureInfo')) {
      sitnaControls.featureInfo = {
        persistentHighlights: true
      };
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'WFSEdit')) {
      sitnaControls.WFSEdit = {
        div: 'wfsedit'
      };
    }
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'WFSQuery')) {
      sitnaControls.WFSQuery = true;
    }
    return sitnaControls;
  }

  static toViews(apiConfig: AppCfg) {
    const sitnaViews = {} as SitnaViews;
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'threed')) {
      sitnaViews.threeD = {
        div: 'vista3d'
      };
    }
    return sitnaViews;
  }
}
