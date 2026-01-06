/**
 * Control Handlers Index
 *
 * Exports all control handlers for easy registration.
 */

import { CoordinatesControlHandler } from './coordinates-control.handler';
import { ScaleControlHandler } from './scale-control.handler';
import { ScaleBarControlHandler } from './scale-bar-control.handler';
import { ScaleSelectorControlHandler } from './scale-selector-control.handler';
import { BasemapSelectorControlHandler } from './basemap-selector-control.handler';
import { LegendControlHandler } from './legend-control.handler';
import { WorkLayerManagerControlHandler } from './work-layer-manager-control.handler';
import { LayerCatalogControlHandler } from './layer-catalog-control.handler';
import { LayerCatalogSilmeControlHandler } from './layer-catalog-silme-control.handler';
import { SearchSilmeControlHandler } from './search-silme-control.handler';
import { AttributionControlHandler } from './attribution-control.handler';
import { FullScreenControlHandler } from './full-screen-control.handler';
import { ThreeDControlHandler } from './threed-control.handler';
import { DataLoaderControlHandler } from './dataloader-control.handler';
import { DownloadControlHandler } from './download-control.handler';
import { DrawMeasureModifyControlHandler } from './draw-measure-modify-control.handler';
import { DrawMeasureModifySilmeControlHandler } from './draw-measure-modify-silme-control.handler';
import { FeatureInfoSilmeControlHandler } from './feature-info-silme-control.handler';
import { GeolocationControlHandler } from './geolocation-control.handler';
import { LoadingIndicatorControlHandler } from './loading-indicator-control.handler';
import { MeasureControlHandler } from './measure-control.handler';
import { MultiFeatureInfoControlHandler } from './multi-feature-info-control.handler';
import { OfflineMapMakerControlHandler } from './offline-map-maker-control.handler';
import { ClickControlHandler } from './click-control.handler';
import { NavBarControlHandler } from './navbar-control.handler';

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
export { GeolocationControlHandler } from './geolocation-control.handler';
export { LoadingIndicatorControlHandler } from './loading-indicator-control.handler';
export { MeasureControlHandler } from './measure-control.handler';
export { MultiFeatureInfoControlHandler } from './multi-feature-info-control.handler';
export { OfflineMapMakerControlHandler } from './offline-map-maker-control.handler';
export { ClickControlHandler } from './click-control.handler';
export { NavBarControlHandler } from './navbar-control.handler';

// Standard SITNA Controls with Virtual Capabilities
export { LayerCatalogControlHandler } from './layer-catalog-control.handler';

// Legacy Silme Extension Controls
export { LayerCatalogSilmeControlHandler } from './layer-catalog-silme-control.handler';
export { SearchSilmeControlHandler } from './search-silme-control.handler';
export { DrawMeasureModifySilmeControlHandler } from './draw-measure-modify-silme-control.handler';
export { FeatureInfoSilmeControlHandler } from './feature-info-silme-control.handler';

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
  GeolocationControlHandler,
  LoadingIndicatorControlHandler,
  MeasureControlHandler,
  MultiFeatureInfoControlHandler,
  OfflineMapMakerControlHandler,
  ClickControlHandler,
  NavBarControlHandler,

  // Standard with Virtual Capabilities
  LayerCatalogControlHandler,

  // Legacy Silme
  LayerCatalogSilmeControlHandler,
  SearchSilmeControlHandler,
  DrawMeasureModifySilmeControlHandler,
  FeatureInfoSilmeControlHandler
] as const;
