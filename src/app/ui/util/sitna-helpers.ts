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

enum SitnaControlsEnum {
  Attribution = 'sitna.attribution',
  BasemapSelector = 'sitna.basemapSelector',
  Click = 'sitna.click',
  Coordinates = 'sitna.coordinates',
  DataLoader = 'sitna.dataLoader',
  Download = 'sitna.download',
  DrawMeasureModify = 'sitna.drawMeasureModify',
  FullScreen = 'sitna.fullScreen',
  Geolocation = 'sitna.geolocation',
  Legend = 'sitna.legend',
  LoadingIndicator = 'sitna.loadingIndicator',
  Measure = 'sitna.measure',
  NavBar = 'sitna.navBar',
  OfflineMapMaker = 'sitna.offlineMapMaker',
  OverviewMap = 'sitna.overviewMap',
  PopUp = 'sitna.popup',
  PrintMap = 'sitna.printMap',
  Scale = 'sitna.scale',
  ScaleBar = 'sitna.scaleBar',
  ScaleSelector = 'sitna.scaleSelector',
  Search = 'sitna.search',
  Share = 'sitna.share',
  StreetView = 'sitna.streetView',
  TOC = 'sitna.TOC',
  WorkLayerManager = 'sitna.workLayerManager',
  LayerCatalog = 'sitna.layerCatalog',
  MultiFeatureInfo = 'sitna.multiFeatureInfo',
  ThreeD = 'sitna.threed',
  FeatureInfo = 'sitna.featureInfo',
  WFSEdit = 'sitna.WFSEdit',
  WFSQuery = 'sitna.WFSQuery'
}
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
    const sitnaControlsFilter = apiConfig.tasks.filter((x) =>
      x['ui-control'].startsWith('sitna.')
    );
    sitnaControls.controlContainer = {
      div: 'ccontainer',
      controls: []
    };
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.Attribution
      )
    ) {
      sitnaControls.attribution = true;
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.BasemapSelector
      )
    ) {
      sitnaControls.basemapSelector = {
        basemapSelector: true,
        div: 'bms'
      };
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.Click
      )
    ) {
      sitnaControls.click = true;
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.Coordinates
      )
    ) {
      sitnaControls.coordinates = {
        coordinates: true,
        div: 'coordinates'
      };
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.DataLoader
      )
    ) {
      sitnaControls.dataLoader = {
        dataLoader: true,
        div: 'dataloader'
      };
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.Download
      )
    ) {
      sitnaControls.download = {
        download: true,
        div: 'download'
      };
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.DrawMeasureModify
      )
    ) {
      sitnaControls.drawMeasureModify = {
        drawMeasureModify: true,
        div: 'drawmeasuremodify'
      };
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.FullScreen
      )
    ) {
      sitnaControls.controlContainer.controls.push({
        position: 'left',
        fullScreen: true
      });
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.Geolocation
      )
    ) {
      sitnaControls.geolocation = {
        geolocation: true,
        div: 'share'
      };
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.Legend
      )
    ) {
      sitnaControls.legend = {
        legend: true,
        div: 'legend'
      };
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.LoadingIndicator
      )
    ) {
      sitnaControls.loadingIndicator = true;
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.Measure
      )
    ) {
      sitnaControls.measure = {
        measure: true,
        div: 'measure'
      };
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.NavBar
      )
    ) {
      sitnaControls.controlContainer.controls.push({
        position: 'left',
        navBar: true
      });
      sitnaControls.controlContainer.controls.push({
        position: 'left',
        navBarHome: true
      });
    }
    //TODO
    // if (
    //   sitnaControlsFilter.some(
    //     (x) => x['ui-control'] === SitnaControlsEnum.OfflineMapMaker
    //   )
    // ) {
    //   sitnaControls.offlineMapMaker = {
    //     offlineMapMaker: true,
    //     div: 'offlinemapmaker'
    //   };
    // }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.OverviewMap
      )
    ) {
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
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.PopUp
      )
    ) {
      sitnaControls.popup = true;
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.PrintMap
      )
    ) {
      sitnaControls.printMap = {
        printMap: true,
        div: 'print'
      };
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.Scale
      )
    ) {
      sitnaControls.controlContainer.controls.push({
        position: 'right',
        scale: true
      });
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.ScaleBar
      )
    ) {
      sitnaControls.controlContainer.controls.push({
        position: 'right',
        scaleBar: true
      });
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.ScaleSelector
      )
    ) {
      sitnaControls.controlContainer.controls.push({
        position: 'right',
        scaleSelector: true
      });
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.Search
      )
    ) {
      sitnaControls.search = {
        search: true,
        div: 'search'
      };
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.Share
      )
    ) {
      sitnaControls.share = {
        share: true,
        div: 'shared'
      };
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.StreetView
      )
    ) {
      sitnaControls.controlContainer.controls.push({
        position: 'left',
        streetView: true
      });
    }
    if (
      sitnaControlsFilter.some((x) => x['ui-control'] === SitnaControlsEnum.TOC)
    ) {
      sitnaControls.TOC = {
        TOC: true,
        div: 'toc'
      };
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.WorkLayerManager
      )
    ) {
      sitnaControls.workLayerManager = {
        workLayerManager: true,
        div: 'wlm'
      };
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.LayerCatalog
      )
    ) {
      sitnaControls.layerCatalog = {
        div: 'layercatalog',
        enableSearch: true,
        layers: SitnaControlsHelper.toWorkLayers(apiConfig).workLayers
      };
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.MultiFeatureInfo
      )
    ) {
      sitnaControls.multiFeatureInfo = {
        active: true
      };
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.ThreeD
      )
    ) {
      sitnaControls.threeD = true;
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.FeatureInfo
      )
    ) {
      sitnaControls.featureInfo = {
        persistentHighlights: true
      };
    }
    //TODO
    // if (
    //   sitnaControlsFilter.some(
    //     (x) => x['ui-control'] === SitnaControlsEnum.WFSEdit
    //   )
    // ) {
    //   sitnaControls.WFSEdit = {
    //     div: 'wfsedit'
    //   };
    // }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.WFSQuery
      )
    ) {
      sitnaControls.WFSQuery = true;
    }
    return sitnaControls;
  }

  static toViews(apiConfig: AppCfg) {
    const sitnaViews = {} as SitnaViews;
    if (
      apiConfig.tasks.some((x) => x['ui-control'] === SitnaControlsEnum.ThreeD)
    ) {
      sitnaViews.threeD = {
        div: 'vista3d'
      };
    }
    return sitnaViews;
  }
}
