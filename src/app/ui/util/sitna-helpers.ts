import {
  SitnaBaseLayer,
  SitnaCadastralSearchOptions,
  SitnaControls,
  SitnaMunicipalitySearchOptions,
  SitnaPlaceNameMunicipalitySearchOptions,
  SitnaPlaceNameSearchOptions,
  SitnaPostalAddressSearchOptions,
  SitnaRoadMilestoneSearchOptions,
  SitnaRoadSearchOptions,
  SitnaStreetSearchOptions,
  SitnaUrbanAreaSearchOptions,
  SitnaViews
} from '@api/model/sitna-cfg';
import { AppCfg, AppGroup, AppNodeInfo } from '@api/model/app-cfg';
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
    if (apiConfig.application.initialExtent) {
      initialExtent = apiConfig.application.initialExtent;
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
      const coordinates = sitnaControlsFilter.find((obj) => {
        return obj['ui-control'] === SitnaControlsEnum.Coordinates;
      });
      if (coordinates) {
        if (coordinates.parameters == null) {
          sitnaControls.coordinates = {
            div: 'coordinates'
          };
        } else {
          sitnaControls.printMap = coordinates.parameters;
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
          sitnaControls.printMap = dataLoader.parameters;
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
    if (
      sitnaControlsFilter.some(
        (x) => x['ui-control'] === SitnaControlsEnum.LayerCatalog
      )
    ) {
      const layerCatalog = sitnaControlsFilter.find((obj) => {
        return obj['ui-control'] === SitnaControlsEnum.LayerCatalog;
      });
      /*
      if (layerCatalog) {
        if (layerCatalog.parameters == null) {
          sitnaControls.layerCatalog = {
            div: 'catalog',
            enableSearch: true,
            layers: SitnaHelper.toWorkLayers(apiConfig)
          };
        } else {
          sitnaControls.layerCatalog = layerCatalog.parameters;
        }
      }
       */
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
          sitnaControls.printMap = featureInfo.parameters;
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
    // sitnaControls.layerCatalogSilme = {
    //   div: 'catalog',
    //   enableSearch: true,
    //   layerTreeGroups: [{ id: 'node99', title: 'Altres serveis' }],
    //   layers: [
    //     {
    //       id: 'ordenacio',
    //       title: "Instruments d'ordenació territorial",
    //       hideTitle: false,
    //       type: 'WMS',
    //       layerNames: ['ordenacio:OR007PTI_solrustic'],
    //       url: 'https://ide.cime.es/geoserver/ordenacio/wms/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node99'
    //     },
    //     {
    //       id: 'AGE_DPMT Costes',
    //       title: 'DPMT Costas',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'http://wms.mapama.es/sig/Costas/DPMT/wms.aspx',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node99'
    //     },
    //     {
    //       id: 'EEA_Natura2000',
    //       title: 'Xarxa Natura 2000',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://bio.discomap.eea.europa.eu/arcgis/services/ProtectedSites/Natura2000Sites/MapServer/WMSServer',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node99'
    //     },
    //     {
    //       id: 'GOIB_EspaisRellAmbiental_IB',
    //       title: 'Espais de rellevancia ambiental',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_Espais_Rellevancia_Ambiental/MapServer/WMSServer',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node99'
    //     },
    //     {
    //       id: 'GOIB_OrdTerr_IB',
    //       title: 'Figures Llei Espais Naturals',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_OrdTerr_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node99'
    //     },
    //     {
    //       id: 'GOIB_RegEspaisNaturals_IB',
    //       title: 'Regulació dels Espais Naturals',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_RegEspaisNaturals_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node99'
    //     },
    //     {
    //       id: 'GOIB_Fotovo_Eol_IB',
    //       title: 'Aptitud fotovoltaica i eòlica',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_Fotovo_Eol_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node99'
    //     }
    //   ]
    // };
    // sitnaControls.BirdEye = {
    //   div: 'BirdEye'
    // };
    // sitnaControls.layerCatalogSilme = {
    //   div: 'catalog',
    //   enableSearch: true,
    //   layerTreeGroups: [
    //     { id: 'node11', title: 'Ordenació del territori i cadastre' },
    //     { id: 'node12', title: 'Urbanisme' },
    //     { id: 'node14', title: 'Turisme, cultura i patrimoni' },
    //     { id: 'node13', title: 'Medi ambient, agricultura i caça' },
    //     { id: 'node15', title: 'Equipaments i infraestructures públiques' },
    //     { id: 'node18', title: 'Cartografia històrica (Cartoteca)' },
    //     { id: 'node16', title: 'Bases i mapes topogràfics' },
    //     { id: 'node99', title: 'Altres serveis' }
    //   ],
    //   layers: [
    //     {
    //       id: 'ordenacio',
    //       title: "Instruments d'ordenació territorial",
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ide.cime.es/geoserver/ordenacio/wms/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node11'
    //     },
    //     {
    //       id: 'AGE_Catastro',
    //       title: 'Cadastre',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node11'
    //     },
    //     {
    //       id: 'AGE_DPMT Costes',
    //       title: 'DPMT Costas',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'http://wms.mapama.es/sig/Costas/DPMT/wms.aspx',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node11'
    //     },
    //     {
    //       id: 'GOIB_EspaisRellAmbiental_IB',
    //       title: 'Espais de rellevancia ambiental',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_Espais_Rellevancia_Ambiental/MapServer/WMSServer',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node11'
    //     },
    //     {
    //       id: 'GOIB_OrdTerr_IB',
    //       title: 'Figures Llei Espais Naturals',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_OrdTerr_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node11'
    //     },
    //     {
    //       id: 'GOIB_RegEspaisNaturals_IB',
    //       title: 'Regulació dels Espais Naturals',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_RegEspaisNaturals_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node11'
    //     },
    //     {
    //       id: 'GOIB_GOIB_PG_CostaEMenorca_PRUG_AlbuferaGrau',
    //       title: 'PG Natura 2000 Costa Est i PRUG del PN Albufera des Grau',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_PG_CostaEMenorca_PRUG_AlbuferaGrau/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node11'
    //     },
    //     {
    //       id: 'GOIB_Fotovo_Eol_IB',
    //       title: 'Aptitud fotovoltaica i eòlica',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_Fotovo_Eol_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node11'
    //     },
    //     {
    //       id: 'GOIB_Mines_IB',
    //       title: 'Perímetres autoritzats mines',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_Mines_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node11'
    //     },
    //     {
    //       id: 'urbanisme',
    //       title: 'Planejaments urbanístics municipals',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ide.cime.es/geoserver/urbanisme/wms',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node12'
    //     },
    //     {
    //       id: 'GOIB_MUIB',
    //       title: 'Mapa urbanístic Illes Balears',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_MUIB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node12'
    //     },
    //     {
    //       id: 'GOIB_SolVacant_IB',
    //       title: 'Sol vacant',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_SolVacant_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node12'
    //     },
    //     {
    //       id: 'turisme',
    //       title: 'Informació local de turisme i patrimoni històric',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ide.cime.es/geoserver/turisme/wms/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node14'
    //     },
    //     {
    //       id: 'GOIB_Itineraris',
    //       title: 'Itineraris als Espais Naturals Protegits',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_Itineraris_ENP_IB/MapServer/WMSServer',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node14'
    //     },
    //     {
    //       id: 'ambiental',
    //       title: 'Medi ambient, agricultura i caça (IDE menorca)',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ide.cime.es/geoserver/ambiental/wms/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node13'
    //     },
    //     {
    //       id: 'GOIB_HabitatsIC2022',
    //       title: 'Habitats interès comunitari de les Illes Balears 2022',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_HIC2022/MapServer/WMSServer',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node13'
    //     },
    //     {
    //       id: 'GOIB_Habitats_IB',
    //       title: 'Habitats IB 2005 (Atlas habitats Espanya)',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_Habitats_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node13'
    //     },
    //     {
    //       id: 'GOIB_AgriRamPes_IB',
    //       title: 'Activitat agrícola, ramadera i pesquera',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_AgriRamPes_IB/MapServer/WMSServer',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node13'
    //     },
    //     {
    //       id: 'AGE_MAPAMA_SIGPAC',
    //       title: 'SIGPAC',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://wms.mapa.gob.es/sigpac/wms',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node13'
    //     },
    //     {
    //       id: 'GOIB_ReservesMar_IB',
    //       title: 'Reserves Marines',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_ReservesMarines/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node13'
    //     },
    //     {
    //       id: 'GOIB_Geologia_IB',
    //       title: 'Geologia',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_Geologia_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node13'
    //     },
    //     {
    //       id: 'GOIB_Meteo_IB',
    //       title: 'Pluviometria Règim Extrem',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_Meteo_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node13'
    //     },
    //     {
    //       id: 'GOIB_RiscIncendi_IB',
    //       title: 'Risc incendi i formació forestal',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_RiscIncendi_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node13'
    //     },
    //     {
    //       id: 'GOIB_InvForestal_IB',
    //       title: 'Inventari forestal Illes Balears',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_InvForestal_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node13'
    //     },
    //     {
    //       id: 'GOIB_MASSES_AIGUA_IB',
    //       title: 'Masses aigua',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_Masses_Aigua_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node13'
    //     },
    //     {
    //       id: 'GOIB_XarxaHidro_RiscInun_IB',
    //       title: 'Xarxa hidrogràfica i risc inundació',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_XarxaHidro_RiscInun_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node13'
    //     },
    //     {
    //       id: 'GOIB_AutCon_AigSubter_IB',
    //       title: 'Autoritzacions i concessions aigües subterrànies',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_AutCon_AigSubter_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node13'
    //     },
    //     {
    //       id: 'AGE_MITECO_ZonesInundacio500',
    //       title: 'Zones inundables amb probabilitat excepcional (500 anys)',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'http://wms.mapama.es/sig/agua/ZI_LaminasQ500/wms.aspx?',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node13'
    //     },
    //     {
    //       id: 'GOIB_HIDRO_ZONESPROT_VULN_IB',
    //       title: 'Zones protegides i vulnerabilitat aqüífers',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_Hidro_ZonesProt_Vuln_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node13'
    //     },
    //     {
    //       id: 'GOIB_INFRA_HIDRIQUES_IB',
    //       title: 'Infraestructures hídriques',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_Infra_Hidriques_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node13'
    //     },
    //     {
    //       id: 'GOIB_OrdRecMiners_IB',
    //       title: 'Recursos miners',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_OrdRecMiners_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node13'
    //     },
    //     {
    //       id: 'GOIB_DistEspecies_IB',
    //       title: "Distribució d'espècies. Bioatles",
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_DistEspecies_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node13'
    //     },
    //     {
    //       id: 'GOIB_SIOSE14_IB',
    //       title: 'Ocupació del sòl 2014',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_SIOSE14_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node13'
    //     },
    //     {
    //       id: 'GOIB_FactorsPastures_IB',
    //       title: 'Factors productius de pastures',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_FactorsPastures_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node13'
    //     },
    //     {
    //       id: 'AGE_MAPAMA_Agroclimatica',
    //       title: 'Variables agroclimàtiques',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'http://wms.mapama.gob.es/sig/Agricultura/CaractAgroClimaticas/wms.aspx',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node13'
    //     },
    //     {
    //       id: 'ambientalMallorcaEivissa',
    //       title: 'Mapa de fons marins de Mallorca, Eivissa i Formentera',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ide.cime.es/geoserver/ambiental_2/wms/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node13'
    //     },
    //     {
    //       id: 'equipaments',
    //       title: 'Equipaments i infraestructures (IDE menorca)',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ide.cime.es/geoserver/equipaments/wms/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node15'
    //     },
    //     {
    //       id: 'GOIB_ProdDistr_energia_IB',
    //       title: 'Producció i distribució energètica',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_ProdDistr_energia_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node15'
    //     },
    //     {
    //       id: 'GOIB_SUPE_IB',
    //       title: 'Equipaments i serveis utilitat pública',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_SUPE_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node15'
    //     },
    //     {
    //       id: 'mapes_antics',
    //       title: 'Mapes antics',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'http://ide.cime.es/geoserver/mapesantics/wms/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node18'
    //     },
    //     {
    //       id: 'base_referencia',
    //       title: 'Base Referència (IDE menorca)',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ide.cime.es/geoserver2/base_referencia/wms/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node16'
    //     },
    //     {
    //       id: 'AGE_PNOA_historic',
    //       title: 'Ortofotos PNOA (IGN)',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://www.ign.es/wms/pnoa-historico',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node16'
    //     },
    //     {
    //       id: 'GOIB_UnitatsEstadist_IB',
    //       title: 'Unitats estadistiques',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_UnitatsEstadist_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node16'
    //     },
    //     {
    //       id: 'GOIB_UnitAdm_IB',
    //       title: 'Unitats admnistratives',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_UnitAdm_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node16'
    //     },
    //     {
    //       id: 'GOIB_Fotocentres_IB',
    //       title: 'Fotocentres de les ortofotos',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/imatges/GOIB_Fotocentres_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node16'
    //     },
    //     {
    //       id: 'GOIB_MTIB1m2005_Me',
    //       title: 'Topogràfic 1:1000 de 2005',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_MTIB1m_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node16'
    //     },
    //     {
    //       id: 'AGE_IDEE_Cartociudad',
    //       title: 'Cartociudad',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://www.cartociudad.es/wms-inspire/direcciones-ccpp',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node16'
    //     },
    //     {
    //       id: 'GOIB_BTIB',
    //       title: 'Topogràfic 1:5000 de 2018 (BTIB)',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_BTIB_CAU_IB/MapServer/WMSServer',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node16'
    //     },
    //     {
    //       id: 'GOIB_MTIB5m2012_Me',
    //       title: 'Topogràfic 1:5000 de 2012 Menorca',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_MTIB5m2012_Me/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node16'
    //     },
    //     {
    //       id: 'GOIB_MTIB5m2008_MeEiFo',
    //       title: 'Topogràfic 1:5000 de 2008 Menorca',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_MTIB5m2008_MeEiFo/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node16'
    //     },
    //     {
    //       id: 'GOIB_MTIB5m2002_MeEiFo',
    //       title: 'Topogràfic 1:5000 2002 de Menorca',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_MTIB5m2002_MeEiFo/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node16'
    //     },
    //     {
    //       id: 'GOIB_Altimetria_IB',
    //       title: 'Altimetria',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_Altimetria_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node16'
    //     },
    //     {
    //       id: 'GOIB_MTB_1995_IB',
    //       title: 'Topogràfic 1:5000 de 1995',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_MTB_1995_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node16'
    //     },
    //     {
    //       id: 'GOIB_ToponimiaImatges_IB',
    //       title: 'Toponimia',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_ToponimiaImatges_IB/MapServer/WMSServer/',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node16'
    //     },
    //     {
    //       id: 'AGE_IGN_base',
    //       title: 'Mapa Base IGN',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://www.ign.es/wms-inspire/ign-base',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node16'
    //     },
    //     {
    //       id: 'AGE_IGN_MTN',
    //       title: 'Mapa Topogràfic Nacional (MTN)',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://www.ign.es/wms/primera-edicion-mtn',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node16'
    //     },
    //     {
    //       id: 'WMS_INE_SECCIONES_G01',
    //       title: 'Seccionado Censo Electoral',
    //       hideTitle: false,
    //       type: 'WMS',
    //       url: 'https://servicios.ine.es/arcgis/services/WMS_INE_SECCIONES_G01/MapServer/WMSServer',
    //       hideTree: false,
    //       format: '',
    //       parentGroupNode: 'node16'
    //     }
    //   ]
    // };
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
    // var a =
    //   document.getElementsByClassName('tc-ctl-edit-mode')[0].children[0].textContent="";
    // console.log('variable a', a);
  }
}
