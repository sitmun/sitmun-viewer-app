import {
  SitnaBaseLayer,
  SitnaControls,
  SitnaViews
} from '@api/model/sitna-cfg';
import { AppCfg, AppGroup, AppNodeInfo } from '@api/model/app-cfg';
import { Injectable } from '@angular/core';

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
  constructor() {}

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
    if (apiConfig.application.initialExtent) {
      initialExtent = apiConfig.application.initialExtent;
    }
    return initialExtent;
  }

  static toBaseLayers(apiConfig: AppCfg): SitnaBaseLayer[] {
    let baseLayers: SitnaBaseLayer[] = [];
    if (apiConfig.backgrounds.length) {
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
          const service = apiConfig.services.find(
            (service) => service.id === layer.service
          );
          if (service != undefined) {
            let a: SitnaBaseLayer = {
              id: layer.title,
              title: layer.title,
              url: service.url,
              type: service.type,
              layerNames: layer.layers,
              matrixSet: service.parameters.matrixSet,
              format: service.parameters.format,
              isBase: true
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
  // static toWorkLayers(apiConfig: AppCfg): SitnaBaseLayer[] {
  //   let sitnaWorkLayers: SitnaBaseLayer[] = [];
  //   if (apiConfig.layers) {
  //     sitnaWorkLayers = apiConfig.layers.map((layer): SitnaBaseLayer => {
  //       const service = apiConfig.services.find(
  //         (service) => service.id === layer.service
  //       );
  //       if (service != null) {
  //         return {
  //           id: layer.id,
  //           title: layer.title,
  //           url: service.url,
  //           layerNames: layer.layers,
  //           matrixSet: service.parameters.matrixSet,
  //           format: service.parameters.format
  //         };
  //       }
  //     });
  //   }
  //   return sitnaWorkLayers;
  // }
  static toControls(apiConfig: AppCfg) {
    const sitnaControls = {} as SitnaControls;
    const sitnaControlsFilter = apiConfig.tasks.filter((x) =>
      x['ui-control'].startsWith('sitna.')
    );
    sitnaControls.controlContainer = {
      div: 'ccontainer',
      controls: []
    };
    sitnaControls.attribution = sitnaControlsFilter.some(
      (x) => x['ui-control'] === SitnaControlsEnum.Attribution
    );
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
      const coordinates = sitnaControlsFilter.find((obj) => {
        return obj['ui-control'] === SitnaControlsEnum.Coordinates;
      });
      if (coordinates) {
        if (coordinates.parameters == null) {
          sitnaControls.coordinates = {
            div: 'coordinates'
          };
        } else {
          sitnaControls.coordinates = coordinates.parameters;
        }
      }
    } else {
      sitnaControls.coordinates = false;
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.DataLoader
      )
    ) {
      const dataLoader = sitnaControlsFilter.find((obj) => {
        return obj['ui-control'] === SitnaControlsEnum.DataLoader;
      });
      if (dataLoader) {
        if (dataLoader.parameters == null) {
          sitnaControls.dataLoader = {
            div: 'dataloader'
          };
        } else {
          sitnaControls.dataLoader = {
            div: 'dataloader'
          };
          if (dataLoader.parameters.wmsSuggestions) {
            sitnaControls.dataLoader.wmsSuggestions =
              dataLoader.parameters.wmsSuggestions;
          }
          if (dataLoader.parameters.enableDragAndDrop) {
            sitnaControls.dataLoader.enableDragAndDrop =
              dataLoader.parameters.enableDragAndDrop;
          }
        }
      }
      showToolsButton = true;
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.Download
      )
    ) {
      const download = sitnaControlsFilter.find((obj) => {
        return obj['ui-control'] === SitnaControlsEnum.Download;
      });
      if (download) {
        if (download.parameters == null) {
          sitnaControls.download = {
            div: 'download'
          };
        } else {
          sitnaControls.download = download.parameters;
        }
      }
      showToolsButton = true;
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.DrawMeasureModify
      )
    ) {
      const drawMeasureModify = sitnaControlsFilter.find((obj) => {
        return obj['ui-control'] === SitnaControlsEnum.DrawMeasureModify;
      });
      if (drawMeasureModify) {
        if (drawMeasureModify.parameters == null) {
          sitnaControls.drawMeasureModify = {
            div: 'drawmeasuremodify'
          };
        } else {
          sitnaControls.drawMeasureModify = drawMeasureModify.parameters;
        }
      }
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
      const geolocation = sitnaControlsFilter.find((obj) => {
        return obj['ui-control'] === SitnaControlsEnum.Geolocation;
      });
      if (geolocation) {
        if (geolocation.parameters == null) {
          sitnaControls.geolocation = {
            div: 'geolocation'
          };
        } else {
          sitnaControls.geolocation = geolocation.parameters;
        }
      }
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
    sitnaControls.loadingIndicator = sitnaControlsFilter.some(
      (x) => x['ui-control'] === SitnaControlsEnum.LoadingIndicator
    );
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
      // TODO
      // const offlineMapMaker = sitnaControlsFilter.find((obj) => {
      //   return obj['ui-control'] === SitnaControlsEnum.OfflineMapMaker;
      // });
      // if (offlineMapMaker) {
      //   if (offlineMapMaker.parameters == null) {
      //     sitnaControls.offlineMapMaker = {
      //       div: 'offline'
      //     };
      //   } else {
      //     sitnaControls.offlineMapMaker = offlineMapMaker.parameters;
      //   }
      // }
      // showToolsButton = true;
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.OverviewMap
      )
    ) {
      const overviewMap = sitnaControlsFilter.find((obj) => {
        return obj['ui-control'] === SitnaControlsEnum.OverviewMap;
      });
      if (overviewMap) {
        if (overviewMap.parameters == null) {
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
                const service = apiConfig.services.find(
                  (service) => service.id === layerObject.service
                );
                if (service != undefined) {
                  sitnaControls.overviewMap = {
                    div: 'ovmap',
                    layer: {
                      id: layerObject.title,
                      url: service.url,
                      layerNames: layerObject.layers
                    }
                  };
                }
              }
            }
          } else {
            sitnaControls.overviewMap = {
              div: 'ovmap',
              layer: 'mapabase'
            };
          }
        } else {
          sitnaControls.overviewMap = overviewMap.parameters;
        }
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
      const print = sitnaControlsFilter.find((obj) => {
        return obj['ui-control'] === SitnaControlsEnum.PrintMap;
      });
      if (print) {
        if (print.parameters == null) {
          sitnaControls.printMap = {
            div: 'print'
          };
        } else {
          sitnaControls.printMap = print.parameters;
        }
      }
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
      const search = sitnaControlsFilter.find((obj) => {
        return obj['ui-control'] === SitnaControlsEnum.Search;
      });
      if (search && search.parameters) {
        sitnaControls.search = search.parameters;
        if (!search.parameters.div && sitnaControls.search) {
          sitnaControls.search.div = 'search';
        }
      }
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
      const streetView = sitnaControlsFilter.find((obj) => {
        return obj['ui-control'] === SitnaControlsEnum.StreetView;
      });
      if (streetView) {
        if (streetView.parameters == null) {
          sitnaControls.streetView = {
            div: 'StreetView'
          };
        } else {
          sitnaControls.streetView = streetView.parameters;
        }
      }
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
    // if (
    //   sitnaControlsFilter.some(
    //     (x) => x['ui-control'] === SitnaControlsEnum.LayerCatalog
    //   )
    // ) {
    //   const layerCatalog = sitnaControlsFilter.find((obj) => {
    //     return obj['ui-control'] === SitnaControlsEnum.LayerCatalog;
    //   });
    //   if (layerCatalog) {
    //     if (layerCatalog.parameters == null) {
    //       sitnaControls.layerCatalog = {
    //         div: 'catalog',
    //         enableSearch: true,
    //         layers: SitnaHelper.toWorkLayers(apiConfig)
    //       };
    //     } else {
    //       sitnaControls.layerCatalog = layerCatalog.parameters;
    //     }
    //   }
    // }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.MultiFeatureInfo
      )
    ) {
      const multiFeatureInfo = sitnaControlsFilter.find((obj) => {
        return obj['ui-control'] === SitnaControlsEnum.MultiFeatureInfo;
      });
      if (multiFeatureInfo) {
        if (multiFeatureInfo.parameters == null) {
          sitnaControls.multiFeatureInfo = {
            div: 'multifeatureinfo',
            active: true
          };
        } else {
          sitnaControls.multiFeatureInfo = multiFeatureInfo.parameters;
        }
      }
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
      const featureInfo = sitnaControlsFilter.find((obj) => {
        return obj['ui-control'] === SitnaControlsEnum.FeatureInfo;
      });
      if (featureInfo) {
        if (featureInfo.parameters == null) {
          sitnaControls.featureInfo = {
            persistentHighlights: true
          };
        } else {
          sitnaControls.featureInfo = featureInfo.parameters;
        }
      }
    } else {
      sitnaControls.featureInfo = false;
    }

    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.WFSEdit
      )
    ) {
      const wfsEdit = sitnaControlsFilter.find((obj) => {
        return obj['ui-control'] === SitnaControlsEnum.WFSEdit;
      });
      if (wfsEdit) {
        if (wfsEdit.parameters == null) {
          sitnaControls.WFSEdit = {
            div: 'wfsedit'
          };
        } else {
          sitnaControls.WFSEdit = wfsEdit.parameters;
        }
      }
      showToolsButton = true;
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.WFSQuery
      )
    ) {
      sitnaControls.WFSQuery = true;
    }
    // sitnaControls.BirdEye = {
    //   div: 'BirdEye'
    // };
    return sitnaControls;
  }

  static toLayerCatalogSilme(apiConfig: AppCfg) {
    let layerCatalogSilme = null;
    const sitnaControlsFilter = apiConfig.tasks.filter((x) =>
      x['ui-control'].startsWith('sitna.')
    );
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.LayerCatalog
      )
    ) {
      const layerCatalog = sitnaControlsFilter.find((obj) => {
        return obj['ui-control'] === SitnaControlsEnum.LayerCatalog;
      });
      if (layerCatalog) {
        var ltg = new Array();
        var lays = new Array();
        const layers = apiConfig.layers;
        const services = apiConfig.services;

        if (!layers.length || !services.length || !apiConfig.trees.length) {
          return null;
        }

        const nodes: Map<string, AppNodeInfo> = new Map(
          Object.entries(apiConfig.trees[0].nodes)
        );
        const arrayNodes = Array.from(nodes);
        for (let actualNode of arrayNodes) {
          let parentNode = null;
          arrayNodes.forEach((node) => {
            if (node[1].children) {
              node[1].children.find((element) => {
                if (element === actualNode[0]) {
                  //console.log('Nodo padre:', node[0]);
                  parentNode = node[0];
                  return node[0];
                }
                return;
              });
            }
            return;
          });
          if (actualNode[0] == apiConfig.trees[0].rootNode) {
            parentNode = actualNode[0];
            // console.log('nodo raiz: ', parentNode);
          }
          if (
            actualNode[1].children == null &&
            actualNode[1].resource != null
          ) {
            const layer = layers.find(
              (layer) => layer.id == actualNode[1].resource
            );
            if (layer) {
              const service = services.find(
                (service) => service.id == layer.service
              );
              if (service) {
                if (parentNode) {
                  // console.log('layers', layer.layers);
                  if (layer.layers.length > 0) {
                    lays.push({
                      id: layer.id,
                      title: layer.title,
                      hideTitle: false,
                      type: service.type,
                      url: service.url,
                      hideTree: true,
                      format: '',
                      layerNames: layer.layers,
                      parentGroupNode: parentNode.replace('/', '')
                    });
                  } else {
                    lays.push({
                      id: layer.id,
                      title: layer.title,
                      hideTitle: false,
                      type: service.type,
                      url: service.url,
                      hideTree: false,
                      format: '',
                      parentGroupNode: parentNode.replace('/', '')
                    });
                  }
                }
              }
            }
          } else {
            if (parentNode) {
              ltg.push({
                id: actualNode[0].replace('/', ''),
                title: actualNode[1].title,
                parentNode: parentNode.replace('/', '')
              });
            }
          }
        }
        ltg.push({ id: 'node99', title: 'Altres serveis' }); // SILME - MV 20230727
        layerCatalogSilme = {
          div: 'catalog',
          enableSearch: true,
          layerTreeGroups: ltg,
          layers: lays
        };
      }
    }
    return layerCatalogSilme;
  }
  static toViews(apiConfig: AppCfg) {
    const sitnaViews = {} as SitnaViews;
    if (
      apiConfig.tasks.some((x) => x['ui-control'] === SitnaControlsEnum.ThreeD)
    ) {
      sitnaViews.threeD = {
        div: 'threedMap',
        controls: [
          'threeD',
          'navBar',
          'navBarHome',
          'basemapSelector',
          'layerCatalogSilme',
          'workLayerManager',
          'legend'
        ]
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
      config: 'assets/map-styles/' + theme + '/config.json',
      markup: 'assets/map-styles/' + theme + '/markup.html',
      style: 'assets/map-styles/' + theme + '/style.css',
      script: 'assets/map-styles/' + theme + '/script.js',
      i18n: 'assets/map-styles/' + theme + '/resources'
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
    // var a =
    //   document.getElementsByClassName('tc-ctl-edit-mode')[0].children[0].textContent="";
    // console.log('variable a', a);
  }
}
