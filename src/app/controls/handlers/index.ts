/**
 * Control Handlers Index
 *
 * Exports all control handlers for easy registration.
 */

import { AttributionControlHandler } from './attribution-control.handler';
import { BasemapSelectorControlHandler } from './basemap-selector-control.handler';
import { ClickControlHandler } from './click-control.handler';
import { CoordinatesControlHandler } from './coordinates-control.handler';
import { DataLoaderControlHandler } from './dataloader-control.handler';
import { DownloadControlHandler } from './download-control.handler';
import { DrawMeasureModifyControlHandler } from './draw-measure-modify-control.handler';
import { FeatureInfoControlHandler } from './feature-info-control.handler';
import { FullScreenControlHandler } from './full-screen-control.handler';
import { GeolocationControlHandler } from './geolocation-control.handler';
import { HelloWorldControlHandler } from './hello-world-control.handler';
import { LayerCatalogControlHandler } from './layer-catalog-control.handler';
import { LegendControlHandler } from './legend-control.handler';
import { LoadingIndicatorControlHandler } from './loading-indicator-control.handler';
import { MeasureControlHandler } from './measure-control.handler';
import { MultiFeatureInfoControlHandler } from './multi-feature-info-control.handler';
import { NavBarControlHandler } from './navbar-control.handler';
import { OfflineMapMakerControlHandler } from './offline-map-maker-control.handler';
import { OverviewMapControlHandler } from './overview-map-control.handler';
import { PopupControlHandler } from './popup-control.handler';
import { PrintMapControlHandler } from './print-map-control.handler';
import { ScaleBarControlHandler } from './scale-bar-control.handler';
import { ScaleControlHandler } from './scale-control.handler';
import { ScaleSelectorControlHandler } from './scale-selector-control.handler';
import { SearchControlHandler } from './search-control.handler';
import { ShareControlHandler } from './share-control.handler';
import { StreetViewControlHandler } from './street-view-control.handler';
import { ThreeDControlHandler } from './threed-control.handler';
import { WFSEditControlHandler } from './wfs-edit-control.handler';
import { WFSQueryControlHandler } from './wfs-query-control.handler';
import { WorkLayerManagerControlHandler } from './work-layer-manager-control.handler';

// Native SITNA Controls
export { CoordinatesControlHandler } from './coordinates-control.handler';
export { ScaleControlHandler } from './scale-control.handler';
export { ScaleBarControlHandler } from './scale-bar-control.handler';
export { ScaleSelectorControlHandler } from './scale-selector-control.handler';
export { BasemapSelectorControlHandler } from './basemap-selector-control.handler';
export { LegendControlHandler } from './legend-control.handler';
export { WorkLayerManagerControlHandler } from './work-layer-manager-control.handler';
export { AttributionControlHandler } from './attribution-control.handler';
export { FullScreenControlHandler } from './full-screen-control.handler';
export { ThreeDControlHandler } from './threed-control.handler';
export { DataLoaderControlHandler } from './dataloader-control.handler';
export { DownloadControlHandler } from './download-control.handler';
export { DrawMeasureModifyControlHandler } from './draw-measure-modify-control.handler';
export { FeatureInfoControlHandler } from './feature-info-control.handler';
export { GeolocationControlHandler } from './geolocation-control.handler';
export { LoadingIndicatorControlHandler } from './loading-indicator-control.handler';
export { MeasureControlHandler } from './measure-control.handler';
export { MultiFeatureInfoControlHandler } from './multi-feature-info-control.handler';
export { OfflineMapMakerControlHandler } from './offline-map-maker-control.handler';
export { PrintMapControlHandler } from './print-map-control.handler';
export { ClickControlHandler } from './click-control.handler';
export { NavBarControlHandler } from './navbar-control.handler';
export { OverviewMapControlHandler } from './overview-map-control.handler';
export { PopupControlHandler } from './popup-control.handler';
export { SearchControlHandler } from './search-control.handler';
export { ShareControlHandler } from './share-control.handler';
export { StreetViewControlHandler } from './street-view-control.handler';
export { WFSEditControlHandler } from './wfs-edit-control.handler';
export { WFSQueryControlHandler } from './wfs-query-control.handler';

// Custom Controls
export { HelloWorldControlHandler } from './hello-world-control.handler';

// Standard SITNA Controls with Virtual Capabilities
export { LayerCatalogControlHandler } from './layer-catalog-control.handler';

/**
 * Array of all handler classes for easy registration.
 * Import and use with ControlRegistryService.registerAll()
 */
export const ALL_CONTROL_HANDLERS = [
  // Native
  CoordinatesControlHandler,
  ScaleControlHandler,
  ScaleBarControlHandler,
  ScaleSelectorControlHandler,
  BasemapSelectorControlHandler,
  LegendControlHandler,
  WorkLayerManagerControlHandler,
  AttributionControlHandler,
  FullScreenControlHandler,
  ThreeDControlHandler,
  DataLoaderControlHandler,
  DownloadControlHandler,
  DrawMeasureModifyControlHandler,
  FeatureInfoControlHandler,
  GeolocationControlHandler,
  LoadingIndicatorControlHandler,
  MeasureControlHandler,
  MultiFeatureInfoControlHandler,
  OfflineMapMakerControlHandler,
  PrintMapControlHandler,
  ClickControlHandler,
  NavBarControlHandler,
  OverviewMapControlHandler,
  PopupControlHandler,

  // Standard with Virtual Capabilities
  LayerCatalogControlHandler,

  // Native Search
  SearchControlHandler,

  // Native Share
  ShareControlHandler,

  // Native StreetView
  StreetViewControlHandler,

  // Native WFSEdit
  WFSEditControlHandler,

  // Native WFSQuery
  WFSQueryControlHandler,

  // Custom Controls
  HelloWorldControlHandler
] as const;
