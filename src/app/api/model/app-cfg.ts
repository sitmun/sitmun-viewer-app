import {
  SitnaBaseLayer,
  SitnaControls,
  SitnaViews
} from '@api/model/sitna-cfg';

export interface AppCfg {
  application: AppApplication;
  backgrounds: AppBackground[];
  groups: AppGroup[];
  layers: AppLayer[];
  services: AppService[];
  tasks: AppTasks[];
  trees: AppTree[];
  global?: AppGlobalConfiguration;
}

export interface GeneralCfg {
  locale?: string;
  crs?: string;
  initialExtent?: [number, number, number, number];
  /** OpenLayers zoom level from territory profile; applied after initial extent on map load. */
  defaultZoomLevel?: number;
  attribution?: string;
  layout: {
    config: string;
    markup: string;
    style: string;
    script: string;
    i18n: string;
  };
  baseLayers: SitnaBaseLayer[];
  controls: SitnaControls;
  views: SitnaViews;
}

export interface AppApplication {
  id: number;
  title: string;
  type: string;
  theme: string;
  srs: string;
  'situation-map'?: string;
  initialExtent: [number, number, number, number];
  /** OpenLayers zoom level from territory profile; applied after initial extent on map load. */
  defaultZoomLevel?: number;
  pointOfInterest?: { x: number; y: number };
  territoryCode?: string;
  territoryName?: string;
  territoryDescription?: string;
  territorialAuthorityName?: string;
  territorialAuthorityAddress?: string;
  territoryTypeName?: string;
}

export interface AppBackground {
  id: string;
  title: string;
  thumbnail: string;
  /** Application-background order from admin (`ApplicationBackground.order` / `ABC_ORDER`). */
  order?: number;
}
export interface AppGroup {
  id?: string;
  title?: string;
  layers?: string[];
}

export interface AppLayer {
  id: string;
  /**
   * Profile layer title; merged as OGC `Title` on matched real WMS/WMTS capability layers in
   * `RasterLayerService` when the key exists in the profile JSON (non-empty replaces, empty removes,
   * omitted leaves the service value).
   */
  title: string;
  /**
   * Profile text merged as OGC `Abstract` when the key exists (non-empty replaces, empty removes,
   * omitted leaves the service value).
   */
  description?: string;
  layers: string[];
  service: string;
  /** Profile JSON key; omitted when unset (merged onto GetCapabilities in RasterLayerService). */
  minScaleDenominator?: number;
  /** Profile JSON key; omitted when unset (merged onto GetCapabilities in RasterLayerService). */
  maxScaleDenominator?: number;
  /** Layer transparency 0..100 (0 = opaque, 100 = fully transparent); omitted when unset. */
  transparency?: number;
  /**
   * Profile order; applied as SITNA `zIndex` when the layer is added to the working layers via
   * `LayerCatalog.addLayerToMap`. Higher values render above lower; absent/null is treated as
   * `zIndex` 0 (the same default applied to externally loaded layers without a profile entry).
   * Caveats:
   * - SITNA keeps raster layers below vector layers regardless of `order`.
   * - Subsequent user-driven reorder via the WorkLayerManager control bypasses `zIndex` and is
   *   not persisted back to this field.
   */
  order?: number;
  /**
   * OGC MetadataURL href; when the key exists, merged onto matched real or virtual WMS/WMTS layers
   * (non-empty replaces, empty removes, omitted unchanged).
   */
  metadataURL?: string;
  /**
   * OGC DataURL href; when the key exists, merged onto matched real or virtual WMS/WMTS layers
   * (non-empty replaces, empty removes, omitted unchanged).
   */
  datasetURL?: string;
  /**
   * When false, merged WMS GetCapabilities set `queryable` false for this profile layer.
   * Omitted or undefined: legacy profiles behave as queryable (true).
   */
  queryableFeatureEnabled?: boolean;
}

export interface AppService {
  id: string;
  url: string;
  type: string;
  /** Profile service title; may be language-keyed after i18n expansion. */
  title?: unknown;
  /** Profile service description; may be language-keyed after i18n expansion. */
  description?: unknown;
  /** Profile service abstract; used when description is absent. */
  abstract?: unknown;
  parameters: AppParameters;
}

export interface AppParameters {
  matrixSet?: string;
  format?: string;
  SRS?: string;
  VERSION?: string;
}

export interface AppTasks {
  id: string;
  parameters: any;
  'ui-control': string;
  typeId?: number;
  name?: string;
  cartographyId?: string;
}

export interface AppTree {
  id: string;
  title: string;
  image: string | null;
  rootNode: string;
  nodes: any;
}

export interface AppNodeInfo {
  title: string;
  resource?: string;
  action?: string;
  loadData?: boolean;
  loadByDefault?: boolean;
  /**
   * When true on a cartography leaf, viewer shows the SITNA-style GFI `i`
   * marker. Missing/false: no marker. Admin gates enabling this on layer
   * {@code queryableFeatureEnabled}.
   */
  queryableActive?: boolean;
  isRadio: boolean;
  children: string[];
  order: number;
  /** Optional folder-level metadata URL from tree node (client profile). */
  metadataURL?: string;
  /** Optional folder-level dataset URL from tree node (client profile). */
  datasetURL?: string;
}

export interface AppGlobalConfiguration {
  proxy: string;
  language: {
    default: string;
  };
  srs: {
    default: {
      identifier: string;
      x: number;
      y: number;
      proj4: string;
    };
  };
}
