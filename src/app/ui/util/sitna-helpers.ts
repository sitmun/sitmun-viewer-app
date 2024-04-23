import {
  SitnaBaseLayer,
  SitnaControls,
  SitnaViews
} from '@api/model/sitna-cfg';
import { AppCfg, AppGroup, AppNodeInfo, AppTree } from '@api/model/app-cfg';
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
  //WFSEdit = 'sitna.WFSEdit',
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
      //sitnaControls.basemapSelectorSilme = {
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
            div: 'xdata'
          };
        } else {
          sitnaControls.dataLoader = {
            div: 'xdata'
          };
          if (dataLoader.parameters.wmsSuggestions) {
            sitnaControls.dataLoader.wmsSuggestions =
              dataLoader.parameters.wmsSuggestions;
          }
          if (dataLoader.parameters.enableDragAndDrop) {
            sitnaControls.dataLoader.enableDragAndDrop =
              dataLoader.parameters.enableDragAndDrop;
          } else { // If the dataloader is enabled, drag and drop is enabled by default
            sitnaControls.dataLoader.enableDragAndDrop = true;
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
    /*
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
    */
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
    /*
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
    */
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
            div: 'print',
            logo: "assets/logos/logo_black.png",
            legend: {
              visible: true
            }
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
    /*
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
     */
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.Share
      )
    ) {
      sitnaControls.share = {
        div: 'share'
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
          sitnaControls.streetViewSilme = {
            div: 'StreetView'
          };
        } else {
          sitnaControls.streetViewSilme = streetView.parameters;
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
      sitnaControls.workLayerManagerSilme = {
        div: 'toc'
      };
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.DrawMeasureModify
      )
    ) {
      sitnaControls.drawMeasureModifySilme = {
        div: 'measure',
        displayElevation: {
          displayOn: "controlContainer"
        }
      };
    }
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.Search
      )
    ) {
      const search = sitnaControlsFilter.find((obj) => {
        return obj['ui-control'] === SitnaControlsEnum.Search;
      });

      if (search) {
        sitnaControls.searchSilme = {
          div: 'search'
        };
        if (search.parameters != null) {
          sitnaControls.search = search.parameters;
        }
      }
    }

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
            active: true,
            persistentHighlights: true,
            share: true,
            modes: {
              point: {
                active: true
              },
              polyline: {
                active: true
              },
              polygon: {
                active: true
              }
            }
          };
        } else {
          sitnaControls.multiFeatureInfo = multiFeatureInfo.parameters;
        }
      }
      showToolsButton = true;
    }

    /*
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.ThreeD
      )
    ) {
      sitnaControls.threeD = true;
    }
    */
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

    /*
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
     */

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

  /**
   * TODO - Comment method description
   * apiConfig contains viewer configuration received from server
   * - application
   * - backgrounds
   * - groups
   * - layers
   * - services
   * - tasks
   * - trees
   * returns an array of catalogs: [{title: string, catalog: {div: string, enableSearch: boolean, layerTreeGroups: [], layers: []}}]
   */
  static toLayerCatalogSilme(apiConfig: AppCfg) {
    var catalogs = [];
    const sitnaControlsFilter = apiConfig.tasks.filter((x) =>
      x['ui-control'].startsWith('sitna.')
    );
    // if control LayerCatalog is included in config
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.LayerCatalog
      )
    ) {
      const layerCatalog = sitnaControlsFilter.find((obj) => {
        return obj['ui-control'] === SitnaControlsEnum.LayerCatalog;
      });
      // if control LayerCatalog found
      if (layerCatalog) {
        const layers = apiConfig.layers;
        const services = apiConfig.services;

        if (!layers.length || !services.length || !apiConfig.trees.length) {
          return [];
        }

        for (let currentTree of apiConfig.trees) {
          let ltg = [];
          let lays = [];
          let badConfigTree = false;
          const nodes: Map<string, AppNodeInfo> = new Map(
            Object.entries(currentTree.nodes)
          );
          const arrayNodes = Array.from(nodes);
          for (let currentNode of arrayNodes) {
            let parentNode = null;
            for (let i = 0; i < arrayNodes.length; i++) {
              let node = arrayNodes[i];
              // Para cada nodo, si el nodo tiene hijos
              if (node[1].children) {
                for (let j = 0; j < node[1].children.length; j++) {
                  let element = node[1].children[j];
                  // Si el currentNode es un hijo del nodo en el que estamos buscando
                  if (element === currentNode[0]) {
                    // si el nodo padre es el rootNode, establecemos el nodo padre como el mismo currentNode,
                    // es decir, el parentNode del currentNode es el propio currentNode, ya que el rootNode no debe estar presente
                    if (node[0] === currentTree.rootNode)
                      parentNode = currentNode[0];
                    // establecemos el nodo en el que estamos buscando como padre
                    else parentNode = node[0]; // node[0]: nombre del nodo
                    break;
                  }
                }
              }
              if (parentNode) break; // si hemos encontrado padre, salimos del bucle
            }

            // Si el currentNode no es hijo de ningún nodo (no hemos encontrado padre)
            if (!parentNode) {
              // TODO - ✏️Edit. Admin is bugged, it should return a root node with
              //  all sub-root nodes as children, then we should discard the root node
              //  and create all sub-roots nodes as LayerTreeGroups
              //  All this must be done on the code above ⬆️

              // TODO - ❌Delete when admin repaired
              //Si el currentNode es el nodo raíz lo establecemos como padre
              if (currentNode[0] == currentTree.rootNode) {
                parentNode = currentNode[0];
              }

              // Todo - ❌Delete when admin repaired
              if (!parentNode) {
                let isNodeFound;
                for (const property in currentTree.nodes) {
                  if (property === currentNode[0]) {
                    isNodeFound = true;
                    break;
                  }
                  isNodeFound = false;
                }
                if (isNodeFound) parentNode = currentNode[0];
              }
            }
            // si no tiene hijos y tiene resource (una layer),
            // se trata de una capa
            if (
              currentNode[1].children == null &&
              currentNode[1].resource != null
            ) {
              const layer = layers.find(
                (layer) => layer.id == currentNode[1].resource
              );
              if (layer) {
                const service = services.find(
                  (service) => service.id == layer.service
                );
                if (service) {
                  if (parentNode) {
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
                } else {
                  // error, no se ha encontrado service
                }
              } else {
                // error, no se ha encontrado layer
                badConfigTree = true;
              }
            } else {
              if (parentNode) {
                ltg.push({
                  id: currentNode[0].replace('/', ''),
                  title: currentNode[1].title,
                  parentNode: parentNode.replace('/', '')
                });
              }
            }
          }
          ltg.push({ id: 'node99', title: 'Altres serveis' });
          catalogs.push({
            title: currentTree.title,
            badConfigTree: badConfigTree,
            catalog: {
              div: 'catalog',
              enableSearch: true,
              layerTreeGroups: ltg,
              layers: lays
            }
          });
        }
      }
    }
    return catalogs;
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
          'workLayerManagerSilme',
          'drawMeasureModifySilme',
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
      // Do nothing and show the welcome panel as default
    } else {
      const welcomeElements = document.getElementsByClassName('welcome-panel');
      const backgroundCoverElements = document.getElementsByClassName('background-cover');

      if (welcomeElements && welcomeElements[0]) {
        (welcomeElements[0] as HTMLElement).classList.add('tc-hidden');
      }

      if (backgroundCoverElements && backgroundCoverElements[0]) {
        (backgroundCoverElements[0] as HTMLElement).classList.add('tc-hidden');
      }
    }
  }
  static toHelp(apiConfig: AppCfg) {
    if (apiConfig.tasks.some((x) => x['ui-control'] === 'markup-help-panel')) {
      (
        document.getElementsByClassName('help-links')[0] as HTMLElement
      ).style.display = 'inline-flex';
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

  static loadMiddleware(apiConfig: AppCfg) {
    if (
      apiConfig.global?.proxy && navigator.serviceWorker && navigator.serviceWorker.controller
    ) {
      navigator.serviceWorker.controller.postMessage({
        type: 'MIDDLEWARE_URL',
        url: apiConfig.global.proxy
      });
    }
  }
}
