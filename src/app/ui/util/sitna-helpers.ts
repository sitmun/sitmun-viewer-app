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
  //WFSEdit = 'sitna.WFSEdit',
  WFSQuery = 'sitna.WFSQuery'
}
let showLegendButton = false;
let showOverViewMapButton = false;
let showToolsButton = false;

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
    /**
     * WARNING
     * Thumbnails coming from backgorunds, but backgrounds may contain more than one layer.
     * This has to be rethought from the admin, once done, the code marked with 'TODO-redo' must be reviewed.     *
     */
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
              thumbnail: thumbnail // TODO-redo
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
    const sitnaControlsFilter = apiConfig.tasks.filter(
      (x) => x['ui-control'] != null && x['ui-control'].startsWith('sitna.')
    );

    // Initialize control container
    sitnaControls.controlContainer = {
      div: 'ccontainer',
      controls: []
    };

    // Process each control type
    this.processAttributionControl(sitnaControls, sitnaControlsFilter);
    this.processBasemapSelectorControl(sitnaControls, sitnaControlsFilter);
    this.processClickControl(sitnaControls, sitnaControlsFilter);
    this.processCoordinatesControl(sitnaControls, sitnaControlsFilter);
    this.processDataLoaderControl(sitnaControls, sitnaControlsFilter);
    this.processDownloadControl(sitnaControls, sitnaControlsFilter);
    this.processDrawMeasureModifyControl(sitnaControls, sitnaControlsFilter);
    this.processFullScreenControl(sitnaControls, sitnaControlsFilter);
    this.processGeolocationControl(sitnaControls, sitnaControlsFilter);
    this.processLegendControl(sitnaControls, sitnaControlsFilter);
    this.processLoadingIndicatorControl(sitnaControls, sitnaControlsFilter);
    this.processMeasureControl(sitnaControls, sitnaControlsFilter);
    this.processMultiFeatureInfoControl(sitnaControls, sitnaControlsFilter);
    this.processNavBarControl(sitnaControls, sitnaControlsFilter);
    this.processOfflineMapMakerControl(sitnaControls, sitnaControlsFilter);
    this.processOverviewMapControl(
      sitnaControls,
      sitnaControlsFilter,
      apiConfig
    );
    this.processPopupControl(sitnaControls, sitnaControlsFilter);
    this.processPrintMapControl(sitnaControls, sitnaControlsFilter);
    this.processScaleControl(sitnaControls, sitnaControlsFilter);
    this.processScaleBarControl(sitnaControls, sitnaControlsFilter);
    this.processScaleSelectorControl(sitnaControls, sitnaControlsFilter);
    this.processSearchControl(sitnaControls, sitnaControlsFilter);
    this.processSearchControlOriginal(sitnaControls, sitnaControlsFilter);
    this.processShareControl(sitnaControls, sitnaControlsFilter);
    this.processStreetViewControl(sitnaControls, sitnaControlsFilter);
    this.processTOCControl(sitnaControls, sitnaControlsFilter);
    this.processThreeDControl(sitnaControls, sitnaControlsFilter);
    this.processWorkLayerManagerControl(sitnaControls, sitnaControlsFilter);
    this.processFeatureInfoControl(sitnaControls, sitnaControlsFilter);
    this.processWFSEditControl(sitnaControls, sitnaControlsFilter);
    this.processWFSQueryControl(sitnaControls, sitnaControlsFilter);
    this.processBirdEyeControl(sitnaControls);

    return sitnaControls;
  }

  /**
   * Helper method to check if a control is present in the filter
   */
  private static isControlPresent(
    sitnaControlsFilter: any[],
    controlType: SitnaControlsEnum
  ): boolean {
    return sitnaControlsFilter.some((x) => x['ui-control'] === controlType);
  }

  /**
   * Helper method to find a specific control in the filter
   */
  private static findControl(
    sitnaControlsFilter: any[],
    controlType: SitnaControlsEnum
  ) {
    return sitnaControlsFilter.find((obj) => obj['ui-control'] === controlType);
  }

  /**
   * Helper method to check if parameters are empty or undefined
   */
  private static areParametersEmpty(parameters: any): boolean {
    return !parameters || Object.keys(parameters).length === 0;
  }

  /**
   * Process attribution control
   */
  private static processAttributionControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[]
  ) {
    sitnaControls.attribution = this.isControlPresent(
      sitnaControlsFilter,
      SitnaControlsEnum.Attribution
    );
  }

  /**
   * Process basemap selector control
   */
  private static processBasemapSelectorControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[]
  ) {
    if (
      this.isControlPresent(
        sitnaControlsFilter,
        SitnaControlsEnum.BasemapSelector
      )
    ) {
      sitnaControls.basemapSelectorSilme = {
        div: 'bms'
      };
    }
  }

  /**
   * Process click control
   */
  private static processClickControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[]
  ) {
    if (this.isControlPresent(sitnaControlsFilter, SitnaControlsEnum.Click)) {
      sitnaControls.click = true;
    }
  }

  /**
   * Process coordinates control
   */
  private static processCoordinatesControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[]
  ) {
    if (
      this.isControlPresent(sitnaControlsFilter, SitnaControlsEnum.Coordinates)
    ) {
      const coordinates = this.findControl(
        sitnaControlsFilter,
        SitnaControlsEnum.Coordinates
      );
      if (coordinates) {
        if (this.areParametersEmpty(coordinates.parameters)) {
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
  }

  /**
   * Process data loader control
   */
  private static processDataLoaderControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[]
  ) {
    if (
      this.isControlPresent(sitnaControlsFilter, SitnaControlsEnum.DataLoader)
    ) {
      const dataLoader = this.findControl(
        sitnaControlsFilter,
        SitnaControlsEnum.DataLoader
      );
      if (dataLoader) {
        if (this.areParametersEmpty(dataLoader.parameters)) {
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
          } else {
            // If the dataloader is enabled, drag and drop is enabled by default
            sitnaControls.dataLoader.enableDragAndDrop = true;
          }
        }
      }
      showToolsButton = true;
    }
  }

  /**
   * Process download control
   */
  private static processDownloadControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[]
  ) {
    if (
      this.isControlPresent(sitnaControlsFilter, SitnaControlsEnum.Download)
    ) {
      const download = this.findControl(
        sitnaControlsFilter,
        SitnaControlsEnum.Download
      );
      if (download) {
        if (this.areParametersEmpty(download.parameters)) {
          sitnaControls.download = {
            div: 'download'
          };
        } else {
          sitnaControls.download = download.parameters;
        }
      }
      showToolsButton = true;
    }
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

  /**
   * Process full screen control
   */
  private static processFullScreenControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[]
  ) {
    if (
      this.isControlPresent(sitnaControlsFilter, SitnaControlsEnum.FullScreen)
    ) {
      sitnaControls.fullScreen = {
        div: 'FuScreen'
      };
    }
  }

  /**
   * Process geolocation control
   */
  private static processGeolocationControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[]
  ) {
    if (
      this.isControlPresent(sitnaControlsFilter, SitnaControlsEnum.Geolocation)
    ) {
      const geolocation = this.findControl(
        sitnaControlsFilter,
        SitnaControlsEnum.Geolocation
      );
      if (geolocation) {
        if (this.areParametersEmpty(geolocation.parameters)) {
          sitnaControls.geolocation = {
            div: 'geolocation'
          };
        } else {
          sitnaControls.geolocation = geolocation.parameters;
        }
      }
      showToolsButton = true;
    }
  }

  /**
   * Process legend control
   */
  private static processLegendControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[]
  ) {
    if (this.isControlPresent(sitnaControlsFilter, SitnaControlsEnum.Legend)) {
      sitnaControls.legend = {
        div: 'legend'
      };
      showLegendButton = true;
    }
  }

  /**
   * Process loading indicator control
   */
  private static processLoadingIndicatorControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[]
  ) {
    sitnaControls.loadingIndicator = this.isControlPresent(
      sitnaControlsFilter,
      SitnaControlsEnum.LoadingIndicator
    );
  }

  /**
   * Process measure control (commented out in original)
   */
  private static processMeasureControl(
    _sitnaControls: SitnaControls,
    _sitnaControlsFilter: any[]
  ) {
    /*
    if (this.isControlPresent(sitnaControlsFilter, SitnaControlsEnum.Measure)) {
      sitnaControls.measure = {
        div: 'measure'
      };
      showToolsButton = true;
    }
    */
  }

  /**
   * Process nav bar control
   */
  private static processNavBarControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[]
  ) {
    if (this.isControlPresent(sitnaControlsFilter, SitnaControlsEnum.NavBar)) {
      sitnaControls.navBar = {
        div: 'nav'
      };
      // sitnaControls.controlContainer.controls.push({
      //   position: 'left',
      //   navBarHome: true
      // });
    }
  }

  /**
   * Process offline map maker control (commented out in original)
   */
  private static processOfflineMapMakerControl(
    _sitnaControls: SitnaControls,
    _sitnaControlsFilter: any[]
  ) {
    /*
    if (this.isControlPresent(sitnaControlsFilter, SitnaControlsEnum.OfflineMapMaker)) {
      // TODO
      // const offlineMapMaker = sitnaControlsFilter.find((obj) => {
      //   return obj['ui-control'] === SitnaControlsEnum.OfflineMapMaker;
      // });
      // if (offlineMapMaker) {
      //   if (!offlineMapMaker.parameters || Object.keys(offlineMapMaker.parameters).length === 0) {
      //     sitnaControls.offlineMapMaker = {
      //       div: 'offline'
      //     };
      //   } else {
      //     sitnaControls.offlineMapMaker = offlineMapMaker.parameters;
      //   }
      // }
      // showToolsButton = true;
    }
    */
  }

  /**
   * Process overview map control
   */
  private static processOverviewMapControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[],
    apiConfig: AppCfg
  ) {
    if (
      this.isControlPresent(sitnaControlsFilter, SitnaControlsEnum.OverviewMap)
    ) {
      const overviewMap = this.findControl(
        sitnaControlsFilter,
        SitnaControlsEnum.OverviewMap
      );
      if (overviewMap) {
        if (this.areParametersEmpty(overviewMap.parameters)) {
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
  }

  /**
   * Process popup control
   */
  private static processPopupControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[]
  ) {
    if (this.isControlPresent(sitnaControlsFilter, SitnaControlsEnum.PopUp)) {
      sitnaControls.popup = true;
    }
  }

  /**
   * Process print map control
   */
  private static processPrintMapControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[]
  ) {
    if (
      this.isControlPresent(sitnaControlsFilter, SitnaControlsEnum.PrintMap)
    ) {
      const print = this.findControl(
        sitnaControlsFilter,
        SitnaControlsEnum.PrintMap
      );
      if (print) {
        if (this.areParametersEmpty(print.parameters)) {
          sitnaControls.printMap = {
            div: 'print',
            logo: 'assets/logos/logo_black.png',
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
  }

  /**
   * Process scale control
   */
  private static processScaleControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[]
  ) {
    if (this.isControlPresent(sitnaControlsFilter, SitnaControlsEnum.Scale)) {
      sitnaControls.scale = true;
    }
  }

  /**
   * Process scale bar control
   */
  private static processScaleBarControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[]
  ) {
    if (
      this.isControlPresent(sitnaControlsFilter, SitnaControlsEnum.ScaleBar)
    ) {
      sitnaControls.scaleBar = true;
    }
  }

  /**
   * Process scale selector control (commented out in original)
   */
  private static processScaleSelectorControl(
    _sitnaControls: SitnaControls,
    _sitnaControlsFilter: any[]
  ) {
    // if (this.isControlPresent(sitnaControlsFilter, SitnaControlsEnum.ScaleSelector)) {
    //   //TODO
    //   // sitnaControls.scaleSelector = true;
    // }
  }

  /**
   * Process search control (original implementation - commented out)
   */
  private static processSearchControlOriginal(
    _sitnaControls: SitnaControls,
    _sitnaControlsFilter: any[]
  ) {
    /*
    if (this.isControlPresent(sitnaControlsFilter, SitnaControlsEnum.Search)) {
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
  }

  /**
   * Process share control
   */
  private static processShareControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[]
  ) {
    if (this.isControlPresent(sitnaControlsFilter, SitnaControlsEnum.Share)) {
      sitnaControls.share = {
        div: 'share'
      };
      showToolsButton = true;
    }
  }

  /**
   * Process street view control
   */
  private static processStreetViewControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[]
  ) {
    if (
      this.isControlPresent(sitnaControlsFilter, SitnaControlsEnum.StreetView)
    ) {
      const streetView = this.findControl(
        sitnaControlsFilter,
        SitnaControlsEnum.StreetView
      );
      if (streetView) {
        if (this.areParametersEmpty(streetView.parameters)) {
          sitnaControls.streetViewSilme = {
            div: 'StreetView'
          };
        } else {
          sitnaControls.streetViewSilme = streetView.parameters;
        }
      }
    }
  }

  /**
   * Process TOC control (commented out in original)
   */
  private static processTOCControl(
    _sitnaControls: SitnaControls,
    _sitnaControlsFilter: any[]
  ) {
    // if (this.isControlPresent(sitnaControlsFilter, SitnaControlsEnum.TOC)) {
    //   sitnaControls.TOC = {
    //     TOC: true,
    //     div: 'toc'
    //   };
    // }
  }

  /**
   * Process work layer manager control
   */
  private static processWorkLayerManagerControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[]
  ) {
    if (
      this.isControlPresent(
        sitnaControlsFilter,
        SitnaControlsEnum.WorkLayerManager
      )
    ) {
      sitnaControls.workLayerManagerSilme = {
        div: 'toc'
      };
    }
  }

  /**
   * Process draw measure modify control
   */
  private static processDrawMeasureModifyControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[]
  ) {
    if (
      this.isControlPresent(
        sitnaControlsFilter,
        SitnaControlsEnum.DrawMeasureModify
      )
    ) {
      sitnaControls.drawMeasureModifySilme = {
        div: 'measure',
        displayElevation: {
          displayOn: 'controlContainer'
        }
      };
    }
  }

  /**
   * Process search control
   */
  private static processSearchControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[]
  ) {
    if (this.isControlPresent(sitnaControlsFilter, SitnaControlsEnum.Search)) {
      const search = this.findControl(
        sitnaControlsFilter,
        SitnaControlsEnum.Search
      );

      if (search) {
        sitnaControls.searchSilme = {
          div: 'search'
        };
        if (
          search.parameters != null &&
          Object.keys(search.parameters).length > 0
        ) {
          sitnaControls.search = search.parameters;
        }
      }
    }
  }

  /**
   * Process multi feature info control
   */
  private static processMultiFeatureInfoControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[]
  ) {
    if (
      this.isControlPresent(
        sitnaControlsFilter,
        SitnaControlsEnum.MultiFeatureInfo
      )
    ) {
      const multiFeatureInfo = this.findControl(
        sitnaControlsFilter,
        SitnaControlsEnum.MultiFeatureInfo
      );
      if (multiFeatureInfo) {
        if (this.areParametersEmpty(multiFeatureInfo.parameters)) {
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
  }

  /**
   * Process three D control (commented out in original)
   */
  private static processThreeDControl(
    _sitnaControls: SitnaControls,
    _sitnaControlsFilter: any[]
  ) {
    /*
      if (this.isControlPresent(sitnaControlsFilter, SitnaControlsEnum.ThreeD)) {
        sitnaControls.threeD = true;
      }
      */
  }

  /**
   * Process feature info control
   */
  private static processFeatureInfoControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[]
  ) {
    if (
      this.isControlPresent(sitnaControlsFilter, SitnaControlsEnum.FeatureInfo)
    ) {
      const featureInfo = this.findControl(
        sitnaControlsFilter,
        SitnaControlsEnum.FeatureInfo
      );
      if (featureInfo) {
        if (this.areParametersEmpty(featureInfo.parameters)) {
          sitnaControls.featureInfoSilme = {
            persistentHighlights: true
          };
        } else {
          sitnaControls.featureInfo = featureInfo.parameters;
        }
      }
    } else {
      sitnaControls.featureInfo = false;
    }
  }

  /**
   * Process WFS edit control (commented out in original)
   */
  private static processWFSEditControl(
    _sitnaControls: SitnaControls,
    _sitnaControlsFilter: any[]
  ) {
    /*
    if (this.isControlPresent(sitnaControlsFilter, SitnaControlsEnum.WFSEdit)) {
      const wfsEdit = sitnaControlsFilter.find((obj) => {
        return obj['ui-control'] === SitnaControlsEnum.WFSEdit;
      });
      if (wfsEdit) {
        if (!wfsEdit.parameters || Object.keys(wfsEdit.parameters).length === 0) {
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
  }

  /**
   * Process WFS query control
   */
  private static processWFSQueryControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[]
  ) {
    if (
      this.isControlPresent(sitnaControlsFilter, SitnaControlsEnum.WFSQuery)
    ) {
      sitnaControls.WFSQuery = true;
    }
  }

  /**
   * Process bird eye control (commented out in original)
   */
  private static processBirdEyeControl(_sitnaControls: SitnaControls) {
    // sitnaControls.BirdEye = {
    //   div: 'BirdEye'
    // };
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
    const catalogs = [];
    const sitnaControlsFilter = apiConfig.tasks.filter(
      (x) => x['ui-control'] != null && x['ui-control'].startsWith('sitna.')
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
              //Si el currentNode es el nodo raíz lo establecemos como padre
              if (currentNode[0] == currentTree.rootNode) {
                parentNode = currentNode[0];
              }

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
                        order: currentNode[1].order,
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
                        order: currentNode[1].order,
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
              }
            } else {
              if (parentNode) {
                ltg.push({
                  id: currentNode[0].replace('/', ''),
                  order: currentNode[1].order,
                  title: currentNode[1].title,
                  parentNode: parentNode.replace('/', ''),
                  // TODO
                  carpeta: ![
                    'node12103',
                    'node12102',
                    'node12336',
                    'node12243',
                    'node12130'
                  ].includes(currentNode[0].replace('/', ''))
                  // Afegir-ho a Altres serveis?
                });
              }
            }
          }
          ltg.push({ id: 'node99', title: 'Altres serveis' });
          if (lays.length > 0) {
            catalogs.push({
              title: currentTree.title,
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
      const backgroundCoverElements =
        document.getElementsByClassName('background-cover');

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
      apiConfig.global?.proxy &&
      navigator.serviceWorker &&
      navigator.serviceWorker.controller
    ) {
      navigator.serviceWorker.controller.postMessage({
        type: 'MIDDLEWARE_URL',
        url: apiConfig.global.proxy
      });
    }
  }
}

