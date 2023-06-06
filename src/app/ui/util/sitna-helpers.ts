import {
  SitnaBaseLayer,
  SitnaControls,
  SitnaViews
} from '@api/model/sitna-cfg';
import { AppCfg, AppGroup } from '@api/model/app-cfg';
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

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
var showLegendButton = false;
var showOverViewMapButton = false;
var showToolsButton = false;

@Injectable()
export class SitnaHelper {
  constructor(@Inject(DOCUMENT) private document: Document) {}
  static toCrs(apiConfig: AppCfg): string | undefined {
    let crs;
    if (apiConfig.application?.srs) {
      crs = apiConfig.application.srs;
    }
    return crs;
  }

  static toInitialExtent(
    apiConfig: AppCfg
  ): [number, number, number, number] | undefined {
    let initialExtent;
    if (apiConfig.territory.initialExtent) {
      initialExtent = apiConfig.territory.initialExtent;
    }
    return initialExtent;
  }

  static toBaseLayers(apiConfig: AppCfg): SitnaBaseLayer[] {
    let baseLayers: SitnaBaseLayer[] = [];
    if (apiConfig.backgrounds) {
      let backgrounds: string[] = [];
      let groups: AppGroup[] = [];
      let layers: string[] = [];
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
          baseLayers.push(a);
        }
      }
    }
    return baseLayers;
  }
  static toWorkLayers(apiConfig: AppCfg): SitnaBaseLayer[] {
    let sitnaWorkLayers: SitnaBaseLayer[] = [];
    if (apiConfig.layers) {
      sitnaWorkLayers = apiConfig.layers.map((layer): SitnaBaseLayer => {
        return {
          id: layer.id,
          title: layer.title,
          url: layer.service.url,
          layerNames: layer.layers,
          matrixSet: layer.service.parameters.matrixSet,
          format: layer.service.parameters.format
        };
      });
    }
    return sitnaWorkLayers;
  }
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
    } else {
      sitnaControls.attribution = false;
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.BasemapSelector
      )
    ) {
      sitnaControls.basemapSelector = {
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
        div: 'coordinates'
      };
    } else {
      sitnaControls.coordinates = false;
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.DataLoader
      )
    ) {
      sitnaControls.dataLoader = {
        div: 'dataloader'
      };
      showToolsButton = true;
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.Download
      )
    ) {
      sitnaControls.download = {
        div: 'download'
      };
      showToolsButton = true;
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.DrawMeasureModify
      )
    ) {
      sitnaControls.drawMeasureModify = {
        div: 'drawmeasuremodify'
      };
      showToolsButton = true;
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.FullScreen
      )
    ) {
      sitnaControls.fullScreen = {
        div: 'FuScreen'
      };
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.Geolocation
      )
    ) {
      sitnaControls.geolocation = {
        div: 'geolocation'
      };
      showToolsButton = true;
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.Legend
      )
    ) {
      sitnaControls.legend = {
        div: 'legend'
      };
      showLegendButton = true;
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.LoadingIndicator
      )
    ) {
      sitnaControls.loadingIndicator = true;
    } else {
      sitnaControls.loadingIndicator = false;
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.Measure
      )
    ) {
      sitnaControls.measure = {
        div: 'measure'
      };
      showToolsButton = true;
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.NavBar
      )
    ) {
      sitnaControls.navBar = {
        div: 'nav'
      };
      // sitnaControls.controlContainer.controls.push({
      //   position: 'left',
      //   navBarHome: true
      // });
    }

    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.OfflineMapMaker
      )
    ) {
      //TODO
      // sitnaControls.offlineMapMaker = {
      //   div: 'offline'
      // };
    }
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
          div: 'ovmap',
          layer: 'mapabase'
        };
      }
      showOverViewMapButton = true;
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
        div: 'print'
      };
      showToolsButton = true;
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.Scale
      )
    ) {
      sitnaControls.scale = true;
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.ScaleBar
      )
    ) {
      sitnaControls.scaleBar = true;
    }
    // if (
    //   sitnaControlsFilter.some(
    //     (x) => x['ui-control'] === SitnaControlsEnum.ScaleSelector
    //   )
    // ) {
    //   //TODO
    //   // sitnaControls.scaleSelector = true;
    // }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.Search
      )
    ) {
      //TODO
      // sitnaControls.search = {
      //   div: 'search'
      // };
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.Share
      )
    ) {
      sitnaControls.share = {
        div: 'shared'
      };
      showToolsButton = true;
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.StreetView
      )
    ) {
      sitnaControls.streetView = {
        div: 'StreetView'
      };
    }
    // if (
    //   sitnaControlsFilter.some((x) => x['ui-control'] === SitnaControlsEnum.TOC)
    // ) {
    //   sitnaControls.TOC = {
    //     TOC: true,
    //     div: 'toc'
    //   };
    // }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.WorkLayerManager
      )
    ) {
      sitnaControls.workLayerManager = {
        div: 'wlm'
      };
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.LayerCatalog
      )
    ) {
      sitnaControls.layerCatalog = {
        div: 'catalog',
        enableSearch: true,
        layers: SitnaHelper.toWorkLayers(apiConfig)
      };
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.MultiFeatureInfo
      )
    ) {
      sitnaControls.multiFeatureInfo = {
        div: 'multifeatureinfo',
        active: true
      };
      showToolsButton = true;
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
    } else {
      sitnaControls.featureInfo = false;
    }

    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.WFSEdit
      )
    ) {
      //TODO
      // sitnaControls.WFSEdit = {
      //   div: 'wfsedit'
      // };
      // showToolsButton = true;
    }
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
        div: 'threedMap'
      };
    }
    return sitnaViews;
  }

  static toLayout(appCfg: AppCfg) {
    let theme = 'sitmun-base';
    if (appCfg.application?.theme) {
      theme = appCfg.application.theme;
    }

    return {
      config: '/assets/map-styles/' + theme + '/config.json',
      markup: '/assets/map-styles/' + theme + '/markup.html',
      style: '/assets/map-styles/' + theme + '/style.css',
      script: '/assets/map-styles/' + theme + '/script.js',
      i18n: '/assets/map-styles/' + theme + '/resources'
    };
  }
  static toWelcome(apiConfig: AppCfg) {
    if (
      apiConfig.tasks.some((x) => x['ui-control'] === 'markup-welcome-panel')
    ) {
      // (
      //   document.getElementsByClassName('welcome-panel')[0] as HTMLElement
      // ).classList.add('tc-hidden');
    } else {
      (
        document.getElementsByClassName('welcome-panel')[0] as HTMLElement
      ).classList.add('tc-hidden');
      (
        document.getElementsByClassName('background-cover')[0] as HTMLElement
      ).classList.add('tc-hidden');
    }
  }
  static toHelp(apiConfig: AppCfg) {
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'markup-help-panel')) {
      (
        document.getElementsByClassName('help-links')[0] as HTMLElement
      ).style.display = 'block';
    } else {
      (
        document.getElementsByClassName('help-links')[0] as HTMLElement
      ).style.display = 'none';
    }
  }
  static toInterface() {
    if (!showLegendButton) {
      const legendElement = document.getElementById('legend-tab');
      if (legendElement != null) {
        legendElement.classList.add('tc-hidden');
      }
    }
    if (!showOverViewMapButton) {
      const overViewMapElement = document.getElementById('ovmap-tab');
      if (overViewMapElement != null) {
        overViewMapElement.classList.add('tc-hidden');
      }
    }
    if (!showToolsButton) {
      const toolsElement = document.getElementById('silme-tab');
      if (toolsElement != null) {
        toolsElement.classList.add('tc-hidden');
      }
    }
  }
}
