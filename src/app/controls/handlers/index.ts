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
import { ThreeDControlHandler } from './threed-control.handler';
import { DataLoaderControlHandler } from './dataloader-control.handler';
import { DownloadControlHandler } from './download-control.handler';

// Native SITNA Controls
export { CoordinatesControlHandler } from './coordinates-control.handler';
export { ScaleControlHandler } from './scale-control.handler';
export { ScaleBarControlHandler } from './scale-bar-control.handler';
export { ScaleSelectorControlHandler } from './scale-selector-control.handler';
export { BasemapSelectorControlHandler } from './basemap-selector-control.handler';
export { LegendControlHandler } from './legend-control.handler';
export { WorkLayerManagerControlHandler } from './work-layer-manager-control.handler';
export { AttributionControlHandler } from './attribution-control.handler';
export { ThreeDControlHandler } from './threed-control.handler';
export { DataLoaderControlHandler } from './dataloader-control.handler';
export { DownloadControlHandler } from './download-control.handler';

// Standard SITNA Controls with Virtual Capabilities
export { LayerCatalogControlHandler } from './layer-catalog-control.handler';

// Legacy Silme Extension Controls
export { LayerCatalogSilmeControlHandler } from './layer-catalog-silme-control.handler';
export { SearchSilmeControlHandler } from './search-silme-control.handler';

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
  ThreeDControlHandler,
  DataLoaderControlHandler,
  DownloadControlHandler,

  // Standard with Virtual Capabilities
  LayerCatalogControlHandler,

  // Legacy Silme
  LayerCatalogSilmeControlHandler,
  SearchSilmeControlHandler
] as const;
