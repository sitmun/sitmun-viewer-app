export interface SitnaCrs {
  crs: string;
}

//InitialExtent
export interface SitnaInitialExtent {
  initialExtent: [number, number, number, number];
}

//BaseLayers
export interface SitnaBaseLayers {
  baseLayers: SitnaBaseLayer[];
}

export interface SitnaBaseLayer {
  id: string;
  url: string;
  layerNames?: string[];
  thumbnail?: string;
  matrixSet?: string;
  format?: string;
  title?: string;
  type?: string;
  isBase?: boolean;
}

export interface OverviewMapLayer {
  id: string;
  type: string;
  url: string;
  layerNames: [string];
}

//WorkLayers
export interface SitnaWorkLayers {
  workLayers: SitnaWorkLayer[];
}

export interface SitnaWorkLayer {
  id?: string;
  title?: string;
  url?: string;
  layerNames?: string[];
  matrixSet?: string;
  format?: string;
}

//Controls
export interface SitnaControls {
  attribution?: boolean;
  basemapSelector?: SitnaBaseMapSelector;
  click?: boolean;
  coordinates?: SitnaControlsCoordinates;
  dataLoader?: SitnaControlsDataLoader;
  download?: SitnaControlsDownload;
  drawMeasureModify?: SitnaControlsdrawMeasureModify;
  geolocation?: SitnaControlsGeolocation;
  legend: SitnaControlsLegend;
  loadingIndicator?: boolean;
  measure?: SitnaControlsMeasure;
  offlineMapMaker?: SitnaControlsOfflineMapMaker;
  overviewMap?: SitnaControlsOverViewMap;
  popup?: boolean;
  printMap?: SitnaControlsPrintMap;
  workLayerManager?: SitnaWorkLayerManager;
  TOC?: SitnaControlsTOC;
  search?: SitnaControlsSearch;
  share?: SitnaControlsShare;
  controlContainer?: SitnaControlsContainer;
  layerCatalog?: SitnaControlsLayerCatalog;
  multiFeatureInfo?: SitnaControlsMultiFeatureInfo;
  threeD?: boolean;
  featureInfo: SitnaControlsFeatureInfo;
  WFSEdit?: SitnaControlsWFSEdit;
  WFSQuery?: boolean;
}

export interface SitnaBaseMapSelector {
  basemapSelector: boolean;
  div: string;
}

export interface SitnaControlsCoordinates {
  coordinates: boolean;
  div: string;
}

export interface SitnaControlsDataLoader {
  dataLoader: boolean;
  div: string;
}

export interface SitnaControlsDownload {
  download: boolean;
  div: string;
}

export interface SitnaControlsdrawMeasureModify {
  drawMeasureModify: boolean;
  div: string;
}

export interface SitnaControlsGeolocation {
  geolocation: boolean;
  div: string;
}

export interface SitnaControlsLegend {
  div: string;
  legend: boolean;
}

export interface SitnaControlsMeasure {
  measure: boolean;
  div: string;
}

export interface SitnaControlsOfflineMapMaker {
  offlineMapMaker: boolean;
  div: string;
}

export interface SitnaControlsOverViewMap {
  overviewMap: boolean;
  div: string;
  layer: SitnaBaseLayer | string;
}
export interface SitnaControlsPrintMap {
  printMap: boolean;
  div: string;
}

export interface SitnaControlsSearch {
  search: boolean;
  div: string;
}

export interface SitnaControlsShare {
  share: boolean;
  div: string;
}

export interface SitnaControlsTOC {
  TOC: boolean;
  div: string;
}

export interface SitnaWorkLayerManager {
  workLayerManager: boolean;
  div: string;
}

export interface SitnaControlsContainer {
  div: string;
  controls: [SitnaElementsContainer?];
}

export interface SitnaControlsLayerCatalog {
  div: string;
  enableSearch: boolean;
  layers: SitnaWorkLayer[];
}

export interface SitnaControlsMultiFeatureInfo {
  active: true;
}

export interface SitnaControlsFeatureInfo {
  persistentHighlights: boolean;
}

export interface SitnaViews {
  threeD?: SitnaThreeDView;
}
export interface SitnaThreeDView {
  div: string;
}

export interface SitnaControlsWFSEdit {
  div: string;
}

export interface SitnaElementsContainer {
  fullScreen?: boolean;
  navBar?: boolean;
  navBarHome?: boolean;
  position: string;
  scale?: boolean;
  scaleBar?: boolean;
  scaleSelector?: boolean;
  streetView?: boolean;
}
