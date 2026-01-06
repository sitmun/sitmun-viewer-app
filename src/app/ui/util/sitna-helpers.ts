import {
  SitnaBaseLayer,
  SitnaControls,
  SitnaViews
} from '@api/model/sitna-cfg';
import {
  AppCfg,
  AppGroup,
  AppLayer,
  AppNodeInfo,
  AppService,
  AppTree
} from '@api/model/app-cfg';
import { Injectable } from '@angular/core';
import { ConfigLookupService } from '../../services/config-lookup.service';
import { UIStateService } from '../../services/ui-state.service';
import { DomUtilsService } from '../../services/dom-utils.service';

enum SitnaControlsEnum {
  Attribution = 'sitna.attribution',
  BasemapSelector = 'sitna.basemapSelector',
  BasemapSelectorSilme = 'sitna.basemapSelector.silme.extension',
  Click = 'sitna.click',
  Coordinates = 'sitna.coordinates',
  DataLoader = 'sitna.dataLoader',
  Download = 'sitna.download',
  DrawMeasureModify = 'sitna.drawMeasureModify',
  DrawMeasureModifySilme = 'sitna.drawMeasureModify.silme.extension',
  FullScreen = 'sitna.fullScreen',
  Geolocation = 'sitna.geolocation',
  Legend = 'sitna.legend',
  LoadingIndicator = 'sitna.loadingIndicator',
  Measure = 'sitna.measure',
  NavBar = 'sitna.navBar',
  OfflineMapMaker = 'sitna.offlineMapMaker',
  OverviewMap = 'sitna.overviewMap',
  PopUp = 'sitna.popup',
  PopupSilmePatch = 'sitna.popup.silme.patch',
  PrintMap = 'sitna.printMap',
  Scale = 'sitna.scale',
  ScaleBar = 'sitna.scaleBar',
  ScaleSelector = 'sitna.scaleSelector',
  Search = 'sitna.search',
  SearchSilme = 'sitna.search.silme.extension',
  Share = 'sitna.share',
  StreetView = 'sitna.streetView',
  StreetViewSilme = 'sitna.streetView.silme.extension',
  TOC = 'sitna.TOC',
  WorkLayerManager = 'sitna.workLayerManager',
  WorkLayerManagerSilme = 'sitna.workLayerManager.silme.extension',
  LayerCatalog = 'sitna.layerCatalog',
  LayerCatalogSilmeFolders = 'sitna.layerCatalog.silme.extension',
  MultiFeatureInfo = 'sitna.multiFeatureInfo',
  ThreeD = 'sitna.threed',
  FeatureInfo = 'sitna.featureInfo',
  FeatureInfoSilme = 'sitna.featureInfo.silme.extension',
  //WFSEdit = 'sitna.WFSEdit',
  WFSQuery = 'sitna.WFSQuery',
  ExternalWMSSilme = 'sitna.externalWMS.silme.extension'
}

@Injectable({
  providedIn: 'root'
})
export class SitnaHelper {
  private static readonly DEFAULT_THUMBNAIL_URL =
    'assets/img/dummy_map_thumbnail.jpg';
  private static readonly OTHER_SERVICES_NODE_ID = 'node99';
  private static readonly OTHER_SERVICES_TITLE = 'Altres serveis';
  private static readonly CATALOG_DIV = 'catalog';

  // Service instance holder for static method access (transitional)
  private static instance: SitnaHelper;

  constructor(
    private configLookup: ConfigLookupService,
    private uiState: UIStateService,
    private domUtils: DomUtilsService
  ) {
    // Store instance for static method access
    SitnaHelper.instance = this;
  }

  /**
   * Initialize services with configuration (call before using static methods)
   */
  initializeServices(apiConfig: AppCfg): void {
    this.configLookup.initialize(apiConfig);
    this.uiState.reset();
  }

  /**
   * Get UI state service for checking button visibility
   */
  getUIState(): UIStateService {
    return this.uiState;
  }

  /**
   * Get DOM utils service
   */
  getDomUtils(): DomUtilsService {
    return this.domUtils;
  }

  /**
   * Get config lookup service
   */
  getConfigLookup(): ConfigLookupService {
    return this.configLookup;
  }

  // Map configuration methods moved to MapConfigurationService
  // Use MapConfigurationService.toCrs(), toInitialExtent(), toBaseLayers(), toViews(), toLayout()
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
    this.processBasemapSelectorSilmeControl(sitnaControls, sitnaControlsFilter);
    this.processClickControl(sitnaControls, sitnaControlsFilter);
    this.processCoordinatesControl(sitnaControls, sitnaControlsFilter);
    this.processDataLoaderControl(sitnaControls, sitnaControlsFilter);
    this.processDownloadControl(sitnaControls, sitnaControlsFilter);
    this.processDrawMeasureModifySilmeControl(
      sitnaControls,
      sitnaControlsFilter
    );
    this.processFullScreenControl(sitnaControls, sitnaControlsFilter);
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
    this.processSearchSilmeControl(sitnaControls, sitnaControlsFilter);
    this.processSearchControlOriginal(sitnaControls, sitnaControlsFilter);
    this.processShareControl(sitnaControls, sitnaControlsFilter);
    this.processStreetViewSilmeControl(sitnaControls, sitnaControlsFilter);
    this.processTOCControl(sitnaControls, sitnaControlsFilter);
    this.processThreeDControl(sitnaControls, sitnaControlsFilter);
    this.processWorkLayerManagerSilmeControl(
      sitnaControls,
      sitnaControlsFilter
    );
    this.processFeatureInfoSilmeControl(sitnaControls, sitnaControlsFilter);
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
      sitnaControls.basemapSelector = {
        div: 'bms'
      };
    }
  }

  /**
   * Process basemap selector silme control
   */
  private static processBasemapSelectorSilmeControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[]
  ) {
    if (
      this.isControlPresent(
        sitnaControlsFilter,
        SitnaControlsEnum.BasemapSelectorSilme
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
      if (SitnaHelper.instance) {
        SitnaHelper.instance.uiState.enableToolsButton();
      }
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
      if (SitnaHelper.instance) {
        SitnaHelper.instance.uiState.enableToolsButton();
      }
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
      if (SitnaHelper.instance) {
        SitnaHelper.instance.uiState.enableToolsButton();
      }
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
      if (SitnaHelper.instance) {
        SitnaHelper.instance.uiState.enableLegendButton();
      }
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
      if (SitnaHelper.instance) {
        SitnaHelper.instance.uiState.enableToolsButton();
      }
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
            const group =
              SitnaHelper.instance?.configLookup.findGroup(
                apiConfig.application['situation-map']
              ) ||
              apiConfig.groups.find(
                (elem) => elem.id === apiConfig.application['situation-map']
              );
            if (
              group != undefined &&
              group.layers != undefined &&
              group.layers?.length > 0
            ) {
              const layer = group.layers[0];
              const layerObject =
                SitnaHelper.instance?.configLookup.findLayer(layer) ||
                apiConfig.layers.find((elem) => elem.id === layer);
              if (layerObject != undefined) {
                const service =
                  SitnaHelper.instance?.configLookup.findService(
                    layerObject.service
                  ) ||
                  apiConfig.services.find(
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
      if (SitnaHelper.instance) {
        SitnaHelper.instance.uiState.enableOverviewMapButton();
      }
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
      if (SitnaHelper.instance) {
        SitnaHelper.instance.uiState.enableToolsButton();
      }
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
      if (SitnaHelper.instance) {
        SitnaHelper.instance.uiState.enableToolsButton();
      }
    }
  }

  /**
   * Process street view silme control
   */
  private static processStreetViewSilmeControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[]
  ) {
    if (
      this.isControlPresent(
        sitnaControlsFilter,
        SitnaControlsEnum.StreetViewSilme
      )
    ) {
      const streetView = this.findControl(
        sitnaControlsFilter,
        SitnaControlsEnum.StreetViewSilme
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
   * Process work layer manager silme control
   */
  private static processWorkLayerManagerSilmeControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[]
  ) {
    if (
      this.isControlPresent(
        sitnaControlsFilter,
        SitnaControlsEnum.WorkLayerManagerSilme
      )
    ) {
      sitnaControls.workLayerManagerSilme = {
        div: 'toc'
      };
    }
  }

  /**
   * Process draw measure modify silme control
   */
  private static processDrawMeasureModifySilmeControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[]
  ) {
    if (
      this.isControlPresent(
        sitnaControlsFilter,
        SitnaControlsEnum.DrawMeasureModifySilme
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
   * Process search silme control
   */
  private static processSearchSilmeControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[]
  ) {
    if (
      this.isControlPresent(sitnaControlsFilter, SitnaControlsEnum.SearchSilme)
    ) {
      const search = this.findControl(
        sitnaControlsFilter,
        SitnaControlsEnum.SearchSilme
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
      if (SitnaHelper.instance) {
        SitnaHelper.instance.uiState.enableToolsButton();
      }
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
   * Process feature info silme control
   */
  private static processFeatureInfoSilmeControl(
    sitnaControls: SitnaControls,
    sitnaControlsFilter: any[]
  ) {
    if (
      this.isControlPresent(
        sitnaControlsFilter,
        SitnaControlsEnum.FeatureInfoSilme
      )
    ) {
      const featureInfo = this.findControl(
        sitnaControlsFilter,
        SitnaControlsEnum.FeatureInfoSilme
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
      if (SitnaHelper.instance) {
        SitnaHelper.instance.uiState.enableToolsButton();
      }
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
   * Normalizes node ID by removing leading slash
   */
  private static normalizeNodeId(nodeId: string): string {
    return nodeId.replace('/', '');
  }

  /**
   * Builds a parent-child map for efficient parent node lookups
   */
  private static buildParentNodeMap(
    nodes: [string, AppNodeInfo][],
    rootNode: string
  ): Map<string, string> {
    const parentMap = new Map<string, string>();

    for (const [nodeId, nodeInfo] of nodes) {
      if (nodeInfo.children) {
        for (const childId of nodeInfo.children) {
          // If parent is rootNode, child's parent is itself
          // Otherwise, child's parent is the nodeId
          const parentId = nodeId === rootNode ? childId : nodeId;
          parentMap.set(childId, parentId);
        }
      }
    }

    // Handle root node and nodes not found in children
    for (const [nodeId] of nodes) {
      if (!parentMap.has(nodeId)) {
        if (nodeId === rootNode) {
          parentMap.set(nodeId, nodeId);
        } else {
          parentMap.set(nodeId, nodeId);
        }
      }
    }

    return parentMap;
  }

  /**
   * Creates a layer entry for the catalog
   */
  private static createLayerEntry(
    layer: AppLayer,
    service: AppService,
    order: number,
    parentNode: string
  ) {
    return {
      id: layer.id,
      order: order,
      title: layer.title,
      hideTitle: false,
      type: service.type,
      url: service.url,
      hideTree: layer.layers.length > 0,
      format: '',
      layerNames: layer.layers,
      parentGroupNode: this.normalizeNodeId(parentNode)
    };
  }

  /**
   * Creates a group entry for the layer tree
   */
  private static createGroupEntry(
    nodeId: string,
    nodeInfo: AppNodeInfo,
    parentNode: string
  ) {
    return {
      id: this.normalizeNodeId(nodeId),
      order: nodeInfo.order,
      title: nodeInfo.title,
      parentNode: this.normalizeNodeId(parentNode),
      carpeta: true
    };
  }

  /**
   * Processes a single tree and returns catalog data
   */
  private static processTree(
    currentTree: AppTree,
    layers: AppLayer[],
    services: AppService[]
  ): { layerTreeGroups: any[]; layers: any[] } | null {
    const ltg: any[] = [];
    const lays: any[] = [];

    const nodes = Object.entries(currentTree.nodes) as [string, AppNodeInfo][];
    const parentMap = this.buildParentNodeMap(nodes, currentTree.rootNode);

    for (const [nodeId, nodeInfo] of nodes) {
      const parentNode = parentMap.get(nodeId);

      // If node has no children and has a resource, it's a layer
      if (nodeInfo.children == null && nodeInfo.resource != null) {
        const layer = layers.find((l) => l.id == nodeInfo.resource);
        if (!layer) continue;

        const service = services.find((s) => s.id == layer.service);
        if (!service || !parentNode) continue;

        lays.push(
          this.createLayerEntry(layer, service, nodeInfo.order, parentNode)
        );
      } else if (parentNode) {
        // It's a group node
        ltg.push(this.createGroupEntry(nodeId, nodeInfo, parentNode));
      }
    }

    if (lays.length === 0) {
      return null;
    }

    ltg.push({
      id: this.OTHER_SERVICES_NODE_ID,
      title: this.OTHER_SERVICES_TITLE
    });

    return { layerTreeGroups: ltg, layers: lays };
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
    const catalogs: Array<{
      title: string;
      catalog: {
        div: string;
        enableSearch: boolean;
        layerTreeGroups: any[];
        layers: any[];
      };
    }> = [];

    const sitnaControlsFilter = apiConfig.tasks.filter(
      (x) => x['ui-control'] != null && x['ui-control'].startsWith('sitna.')
    );

    const layerCatalog = this.findControl(
      sitnaControlsFilter,
      SitnaControlsEnum.LayerCatalogSilmeFolders
    );

    if (!layerCatalog) {
      return catalogs;
    }

    const layers = apiConfig.layers;
    const services = apiConfig.services;

    if (!layers.length || !services.length || !apiConfig.trees.length) {
      return catalogs;
    }

    for (const currentTree of apiConfig.trees) {
      const result = this.processTree(currentTree, layers, services);
      if (result) {
        catalogs.push({
          title: currentTree.title,
          catalog: {
            div: this.CATALOG_DIV,
            enableSearch: true,
            layerTreeGroups: result.layerTreeGroups,
            layers: result.layers
          }
        });
      }
    }

    return catalogs;
  }
  // Removed: toViews() - moved to MapConfigurationService
  // Removed: toLayout() - moved to MapConfigurationService
  // Removed: toWelcome() - welcome panel is now theme-managed (silme-base, demo-jiide)
  // Removed: toHelp() - help panel is now theme-managed (silme-base, demo-jiide)
  static toInterface() {
    if (!SitnaHelper.instance) {
      return; // Services not initialized
    }

    const { uiState, domUtils } = SitnaHelper.instance;

    if (!uiState.isLegendButtonEnabled()) {
      domUtils.hideElementById('legend-tab');
    }
    if (!uiState.isOverviewMapButtonEnabled()) {
      domUtils.hideElementById('ovmap-tab');
    }
    if (!uiState.isToolsButtonEnabled()) {
      domUtils.hideElementById('silme-tab');
    }
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
