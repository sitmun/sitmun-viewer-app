export interface SitnaBaseLayer {
  id: string;
  url: string;
  layerNames?: string[] | string;
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
  workLayers: SitnaLayerOptions[];
}

export interface SitnaLayerOptions {
  id?: string;
  filter?: string;
  format?: string;
  hideTree?: boolean;
  isBase?: boolean;
  layerNames?: [string];
  matrixSet?: string;
  overviewMapLayer?: string | SitnaLayerOptions;
  stealth?: boolean;
  styles?: SitnaStyleOptions;
  thumbnail?: string;
  title?: string;
  type?: string;
  url?: string;
}

//Controls
export interface SitnaControls {
  attribution?: boolean | SitnaControlOptions;
  basemapSelector?: boolean | SitnaControlOptions;
  BirdEye?: SitnaControlOptions;
  click?: boolean;
  coordinates?: boolean | SitnaControlsCoordinates;
  dataLoader?: boolean | SitnaControlsDataLoader;
  download?: boolean | SitnaControlsDownload;
  drawMeasureModify?: boolean | SitnaControlsDrawMeasureModify;
  featureInfo?: boolean | SitnaFeatureInfoOptions;
  fullScreen?: boolean | SitnaControlOptions;
  geolocation?: boolean | SitnaControlsGeolocation;
  layerCatalog?: boolean | SitnaLayerCatalogOptions;
  layerCatalogSilme?: any;
  externalWMSSilme?: any;
  workLayerManagerSilme?: any;
  drawMeasureModifySilme?: any;
  searchSilme?: any;
  //basemapSelectorSilme?: any;
  streetViewSilme?: any;
  legend: boolean | SitnaControlOptions;
  loadingIndicator?: boolean | SitnaControlOptions;
  //measure?: boolean | SitnaControlOptions;
  multiFeatureInfo?: boolean | SitnaMultiFeatureInfoOptions;
  navBar?: boolean | SitnaControlOptions;
  offlineMapMaker?: boolean | SitnaControlsOfflineMapMaker;
  overviewMap?: boolean | SitnaControlsOverViewMap;
  popup?: boolean | SitnaControlOptions;
  printMap?: boolean | SitnaControlsPrintMap;
  scale?: boolean | SitnaControlOptions;
  scaleBar?: boolean | SitnaControlOptions;
  scaleSelector?: boolean | SitnaControlOptions;
  search?: SitnaControlsSearch;
  share?: boolean | SitnaControlOptions;
  streetView?: boolean | SitnaStreetViewOptions;
  TOC?: SitnaControlsTOC;
  //threeD?: boolean;
  //WFSEdit?: SitnaControlsWFSEdit;
  WFSQuery?: boolean;
  workLayerManager?: boolean | SitnaControlOptions;
  controlContainer?: boolean | SitnaControlContainerOptions;
}

export interface SitnaControlOptions {
  div?: string;
}

export interface SitnaControlContainerOptions extends SitnaControlOptions {
  controls: [SitnaElementsContainer?];
}

export interface SitnaBaseMapSelector {
  basemapSelector: boolean;
  div: string;
}

export interface SitnaControlsCoordinates extends SitnaControlOptions {
  showGeo?: boolean;
}

export interface SitnaControlsDataLoader extends SitnaControlOptions {
  enableDragAndDrop?: boolean;
  wmsSuggestions?: Array<SitnaWmsGroupOptions>;
}

export interface SitnaWmsGroupOptions {
  group?: string;
  items: Array<SitnaWmsOptions>;
}

export interface SitnaWmsOptions {
  name: string;
  url: string;
}

export interface SitnaControlsDownload extends SitnaControlOptions {
  deselectableTab?: boolean;
}

export interface SitnaControlsDrawMeasureModify extends SitnaControlOptions {
  displayElevation?: boolean | SitnaElevationOptions;
  mode?: string;
}
export interface SitnaElevationOptions {
  resolution?: number;
  sampleNumber?: number;
  services: string[] | SitnaElevationServiceOptions[];
}
export interface SitnaElevationServiceOptions {
  allowedGeometryTypes?: string[];
  googleMapsKey?: string;
  name: string; // Valor SITNA.Consts.elevationService
  url?: string;
}

export interface SitnaFeatureInfoOptions {
  active?: boolean;
  persistentHighlights?: boolean;
}
export interface SitnaGeometryFeatureInfoOptions
  extends SitnaFeatureInfoOptions {
  filterStyle?: SitnaLineStyleOptions | SitnaPolygonStyleOptions;
}
export interface SitnaStyleOptions {
  point?: SitnaPointStyleOptions;
  line?: SitnaLineStyleOptions;
  polygon?: SitnaPolygonStyleOptions;
  // marker?: SitnaMarkerStyleOptions;
  // cluster?: SitnaClusterStyleOptions;
  // heatMap?: SitnaHeatmapStyleOptions;
}
export interface SitnaPointStyleOptions {
  angle?: string;
  fillColor?: number;
  fillOpacity?: number;
  fontSize?: number;
  label?: string;
  labelOutlineColor?: string;
  labelOutlineWidth?: number;
  radius?: number;
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWidth?: number;
}
export interface SitnaLineStyleOptions {
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWidth?: number;
}
export interface SitnaPolygonStyleOptions extends SitnaLineStyleOptions {
  fillColor?: string;
  fillOpacity?: number;
}

export interface SitnaControlsGeolocation extends SitnaControlOptions {
  displayElevation?: boolean;
}

export interface SitnaLayerCatalogOptions extends SitnaControlOptions {
  enableSearch?: boolean;
  layers: any[];
}

export interface SitnaMultiFeatureInfoOptions extends SitnaControlOptions {
  active?: boolean;
  modes?: SitnaMultiFeatureInfoModeOptions;
  persistentHighlights?: boolean;
  share?: boolean;
}
export interface SitnaMultiFeatureInfoModeOptions {
  point?: SitnaFeatureInfoOptions;
  polyline?: SitnaGeometryFeatureInfoOptions;
  polygon?: SitnaGeometryFeatureInfoOptions;
}

export interface SitnaControlsOfflineMapMaker extends SitnaControlOptions {
  averageTileSize?: number;
  offlineMapHintDiv?: string;
}

export interface SitnaControlsOverViewMap extends SitnaControlOptions {
  overviewMap?: boolean;
  layer: SitnaBaseLayer | string;
}
export interface SitnaControlsPrintMap extends SitnaControlOptions {
  logo?: string;
  legend?: SitnaPrintMapLegendOptions;
}
export interface SitnaPrintMapLegendOptions {
  visible?: boolean;
  orientation?: string; // portrait/landscape.
}

export interface SitnaControlsSearch extends SitnaControlOptions {
  div: string;
  cadastralParcel?: boolean | SitnaCadastralSearchOptions;
  coordinates?: boolean;
  instructions?: string; // sets the title of the searchbox
  municipality?: boolean | SitnaMunicipalitySearchOptions;
  placeName?: boolean | SitnaPlaceNameSearchOptions;
  placeNameMunicipality?: boolean | SitnaPlaceNameMunicipalitySearchOptions;
  postalAddress?: boolean | SitnaPostalAddressSearchOptions;
  road?: boolean | SitnaRoadSearchOptions;
  roadMilestone?: boolean | SitnaRoadMilestoneSearchOptions;
  street?: boolean | SitnaStreetSearchOptions;
  town?: boolean | SitnaUrbanAreaSearchOptions;
}

export interface SitnaSearchOptions {
  featurePrefix: string;
  featureType: string[];
  geometryName: string;
  outputFormat?: string;
  queryProperties: SitnaSearchQueryPropertyOptions;
  styles: SitnaStyleOptions[];
  suggesiontListHead: SitnaSearchSuggestionHeaderOptions;
  url: string;
}
export interface SitnaSearchQueryPropertyOptions {
  firstQueryWord: string[];
  secondQueryWord: string[];
  thirdQueryWord: string[];
}
export interface SitnaSearchSuggestionHeaderOptions {
  label: string;
  color: string; // property in pointstyle, linestyle or polygonstyle
}
export interface SitnaCadastralSearchOptions extends SitnaSearchOptions {
  municipality: SitnaCadastralSearchOptionsExt;
}
export interface SitnaCadastralSearchOptionsExt {
  featureType: string[];
  idProperty: string;
  labelProperty: string;
}
export interface SitnaMunicipalitySearchOptions extends SitnaSearchOptions {
  dataIdProperty: string[];
  outputFormatLabel: string;
  outputProperties: string[];
}
export interface SitnaPlaceNameSearchOptions extends SitnaSearchOptions {
  dataIdProperty: string[];
  outputFormatLabel: string;
  outputProperties: string[];
  renderFeatureType: string[];
}
export interface SitnaPlaceNameMunicipalitySearchOptions
  extends SitnaSearchOptions {
  dataIdProperty: string[];
  outputFormatLabel: string;
  outputProperties: string[];
  renderFeatureType: string[];
}
export interface SitnaPostalAddressSearchOptions extends SitnaSearchOptions {
  dataIdProperty: string[];
  outputFormatLabel: string;
  outputProperties: string[];
}
export interface SitnaRoadSearchOptions extends SitnaSearchOptions {
  dataIdProperty: string[];
  outputFormatLabel: string;
  outputProperties: string[];
}
export interface SitnaRoadMilestoneSearchOptions extends SitnaSearchOptions {
  dataIdProperty: string[];
  outputFormatLabel: string;
  outputProperties: string[];
  renderFeatureType: string[];
}
export interface SitnaStreetSearchOptions extends SitnaSearchOptions {
  dataIdProperty: string[];
  outputFormatLabel: string;
  outputProperties: string[];
  renderFeatureType: string[];
}
export interface SitnaUrbanAreaSearchOptions extends SitnaSearchOptions {
  dataIdProperty: string[];
  outputFormatLabel: string;
  outputProperties: string[];
}

export interface SitnaStreetViewOptions extends SitnaControlOptions {
  googleMapsKey?: string;
  viewDiv?: string;
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
  layers: SitnaWorkLayers[];
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
  controls?: string[];
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
