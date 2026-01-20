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
  legend: boolean | SitnaControlOptions;
  loadingIndicator?: boolean | SitnaControlOptions;
  measure?: boolean | SitnaControlsMeasure;
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
  WFSEdit?: boolean | SitnaControlsWFSEdit;
  WFSQuery?: boolean | SitnaControlsWFSQuery;
  workLayerManager?: boolean | SitnaControlOptions;
  controlContainer?: boolean | SitnaControlContainerOptions;
}

export interface SitnaControlOptions {
  div?: string;
}

export interface SitnaControlContainerOptions extends SitnaControlOptions {
  controls: [SitnaElementsContainer?];
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
  deselectableTabs?: boolean; // Note: plural "Tabs" matches TabContainerOptions
  dialogDiv?: string; // Dialog container div
}

export interface SitnaControlsDrawMeasureModify extends SitnaControlOptions {
  displayElevation?: boolean | SitnaElevationOptions;
  mode?: string;
  snapping?: boolean | any | any[]; // boolean | SITNA.layer.Vector | Array<SITNA.feature.Feature>
}
export interface SitnaElevationOptions {
  resolution?: number;
  sampleNumber?: number;
  services: string[] | SitnaElevationServiceOptions[];
  displayOn?: string; // CSS selector or predefined value: 'controlContainer', '.tc-ctl-cctr-left', '.tc-ctl-cctr-right', etc.
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
  displayElevation?: boolean | SitnaElevationOptions;
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

export interface SitnaControlsMeasure extends SitnaControlOptions {
  snapping?: boolean | any | any[]; // boolean | SITNA.layer.Vector | Array<SITNA.feature.Feature>
  displayElevation?: boolean | SitnaElevationOptions;
  mode?: string; // Drawing mode: point, line, or polygon
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
  displayElevation?: boolean | SitnaElevationOptions;
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
  customSearchTypes?: SitnaSearchTypeOptions[];
  instructions?: string; // sets the title of the searchbox
  municipality?: boolean | SitnaMunicipalitySearchOptions;
  placeHolder?: string; // Text shown in search input placeholder
  placeName?: boolean | SitnaPlaceNameSearchOptions;
  placeNameMunicipality?: boolean | SitnaPlaceNameMunicipalitySearchOptions;
  postalAddress?: boolean | SitnaPostalAddressSearchOptions;
  road?: boolean | SitnaRoadSearchOptions;
  roadMilestone?: boolean | SitnaRoadMilestoneSearchOptions;
  share?: boolean; // Enable share functionality in search results
  street?: boolean | SitnaStreetSearchOptions;
  town?: boolean | SitnaUrbanAreaSearchOptions;
  dialogDiv?: string; // Dialog container div
  allowedSearchTypes?: Record<string, boolean>; // Filter enabled search types
  minimumPatternLength?: number; // Minimum input length
  queryableFeatures?: boolean; // Enable querying features
  url?: string; // WFS endpoint URL
  version?: string; // WFS version
  featurePrefix?: string; // WFS feature prefix
}

export interface SitnaSearchOptions {
  featurePrefix: string;
  featureType: string[];
  geometryName: string;
  outputFormat?: string;
  queryProperties: SitnaSearchQueryPropertyOptions;
  styles: SitnaStyleOptions[];
  suggestionListHead?: SitnaSearchSuggestionHeaderOptions; // Obsolete, use suggestionListHeader
  suggestionListHeader?: SitnaSearchSuggestionHeaderOptions; // New format
  url: string;
  dataIdProperty?: string[]; // Fields to uniquely identify results
  outputProperties?: string[]; // Fields to display in suggestions
  suggestionTemplate?: string; // Template for suggestion display
  renderFeatureType?: string[]; // Auxiliary layers to add to results
  version?: string; // WFS version
}
export interface SitnaSearchQueryPropertyOptions {
  firstQueryWord: string[];
  secondQueryWord?: string[];
  thirdQueryWord?: string[];
}

export interface SitnaSearchResultColorSourceOptions {
  geometryType: string; // e.g., 'point', 'line', 'polygon'
  propertyName: string; // e.g., 'strokeColor', 'fillColor', 'fontColor'
}

export interface SitnaSearchTypeOptions {
  dataIdProperty?: string[];
  featurePrefix: string;
  featureType: string[];
  geometryName: string;
  outputFormat?: string;
  outputProperties?: string[];
  parser?: (pattern: string) => string[] | null; // Function to parse search pattern
  queryProperties: SitnaSearchQueryPropertyOptions;
  renderFeatureType?: string[];
  styles: SitnaStyleOptions[];
  suggestionListHeader?: SitnaSearchSuggestionHeaderOptions;
  suggestionTemplate?: string;
  url: string;
  version?: string;
}
export interface SitnaSearchSuggestionHeaderOptions {
  /** @deprecated Use labelKey instead */
  label?: string;
  /** @deprecated Use colorSource instead */
  color?: string; // property in pointstyle, linestyle or polygonstyle
  labelKey?: string; // Translation key for suggestion header label
  colorSource?: string | SitnaSearchResultColorSourceOptions; // Color source configuration
}
export interface SitnaCadastralSearchOptions
  extends Omit<SitnaSearchOptions, 'suggestionListHeader'> {
  municipality: SitnaCadastralSearchOptionsExt;
  suggestionListHeader?: SitnaCadastralSearchSuggestionHeaderOptions;
}

export interface SitnaCadastralSearchSuggestionHeaderOptions {
  labelKey: string;
  colorSource: SitnaSearchSuggestionMutipleColorSourceOptions[];
}

export interface SitnaSearchSuggestionMutipleColorSourceOptions {
  featureType: string;
  tooltipKey: string;
  colorSource: SitnaSearchResultColorSourceOptions;
}
export interface SitnaCadastralSearchOptionsExt {
  featureType: string[];
  idProperty: string;
  labelProperty: string;
}
export interface SitnaMunicipalitySearchOptions extends SitnaSearchOptions {
  dataIdProperty: string[];
  /** @deprecated Use suggestionTemplate instead */
  outputFormatLabel?: string;
  outputProperties: string[];
  suggestionTemplate?: string;
  suggestionListHeader?: SitnaSearchSuggestionHeaderOptions;
}
export interface SitnaPlaceNameSearchOptions extends SitnaSearchOptions {
  dataIdProperty: string[];
  /** @deprecated Use suggestionTemplate instead */
  outputFormatLabel?: string;
  outputProperties: string[];
  renderFeatureType: string[];
  suggestionTemplate?: string;
  suggestionListHeader?: SitnaSearchSuggestionHeaderOptions;
}
export interface SitnaPlaceNameMunicipalitySearchOptions
  extends SitnaSearchOptions {
  dataIdProperty: string[];
  /** @deprecated Use suggestionTemplate instead */
  outputFormatLabel?: string;
  outputProperties: string[];
  renderFeatureType: string[];
  suggestionTemplate?: string;
  suggestionListHeader?: SitnaSearchSuggestionHeaderOptions;
}
export interface SitnaPostalAddressSearchOptions extends SitnaSearchOptions {
  dataIdProperty: string[];
  /** @deprecated Use suggestionTemplate instead */
  outputFormatLabel?: string;
  outputProperties: string[];
  suggestionTemplate?: string;
  suggestionListHeader?: SitnaSearchSuggestionHeaderOptions;
}
export interface SitnaRoadSearchOptions extends SitnaSearchOptions {
  dataIdProperty: string[];
  /** @deprecated Use suggestionTemplate instead */
  outputFormatLabel?: string;
  outputProperties: string[];
  suggestionTemplate?: string;
  suggestionListHeader?: SitnaSearchSuggestionHeaderOptions;
}
export interface SitnaRoadMilestoneSearchOptions extends SitnaSearchOptions {
  dataIdProperty: string[];
  /** @deprecated Use suggestionTemplate instead */
  outputFormatLabel?: string;
  outputProperties: string[];
  renderFeatureType: string[];
  suggestionTemplate?: string;
  suggestionListHeader?: SitnaSearchSuggestionHeaderOptions;
}
export interface SitnaStreetSearchOptions extends SitnaSearchOptions {
  dataIdProperty: string[];
  /** @deprecated Use suggestionTemplate instead */
  outputFormatLabel?: string;
  outputProperties: string[];
  renderFeatureType: string[];
  suggestionTemplate?: string;
  suggestionListHeader?: SitnaSearchSuggestionHeaderOptions;
}
export interface SitnaUrbanAreaSearchOptions extends SitnaSearchOptions {
  dataIdProperty: string[];
  /** @deprecated Use suggestionTemplate instead */
  outputFormatLabel?: string;
  outputProperties: string[];
  suggestionTemplate?: string;
  suggestionListHeader?: SitnaSearchSuggestionHeaderOptions;
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

export interface SitnaControlsWFSEdit extends SitnaControlOptions {
  downloadElevation?: boolean | SitnaElevationOptions;
  highlightChanges?: boolean;
  showOriginalFeatures?: boolean;
  snapping?: boolean;
  styles?: SitnaStyleOptions;
}

export interface SitnaControlsWFSQuery {
  styles?: SitnaStyleOptions;
  highlightStyles?: SitnaStyleOptions;
  highLightStyles?: SitnaStyleOptions; // Legacy alias (capital L) supported by SITNA 4.8
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
