const SITNA_WFS_GEOMETRY_TYPES = new Set([
  'point',
  'multipoint',
  'polyline',
  'polygon',
  'multipolyline',
  'multipolygon'
]);

/** Kinds GML 2 cannot build. SITNA's format id for GML 3.2 is `GML32`. */
const GML32_GEOMETRY_KINDS = new Set([
  'Curve',
  'MultiCurve',
  'Surface',
  'MultiSurface'
]);

const FEATURES_ADD = 'featuresadd.tc';

export type WfsLayerGeometrySource = {
  geometryName?: string | null;
  geometryKind?: string | null;
  preferredGeometryType?: string | null;
};

export type WfsLayerGeometryOptions = {
  geometryName?: string;
  geometryType?: string;
  outputFormat?: string;
};

/**
 * Options SITNA reads when a WFS layer is added.
 * `geometryName` reaches `ol.format.GeoJSON` only. The GML loader keeps the last geometry
 * element, so the chosen property is selected after the read.
 * `outputFormat` is `GML32` for curve and surface kinds. Other kinds stay on SITNA's GML 2 default.
 * `geometryType` is a `SITNA.Consts.geom` id, passed only for an explicit override.
 */
export function wfsLayerGeometryOptions(
  layer: WfsLayerGeometrySource
): WfsLayerGeometryOptions {
  const options: WfsLayerGeometryOptions = {};
  const name = layer.geometryName?.trim();
  if (name) {
    options.geometryName = name;
  }
  const type = layer.preferredGeometryType?.trim();
  if (type && SITNA_WFS_GEOMETRY_TYPES.has(type)) {
    options.geometryType = type;
  }
  const kind = layer.geometryKind?.trim();
  if (kind && GML32_GEOMETRY_KINDS.has(kind)) {
    options.outputFormat = 'GML32';
  }
  return options;
}

type ChosenGeometryFeature = {
  get: (name: string) => unknown;
  setGeometryName: (name: string) => void;
};

/** Selects the profile geometry after GML read, when that property holds an OpenLayers geometry. */
export function applyChosenGeometryName(
  features: readonly ChosenGeometryFeature[],
  geometryName: string | null | undefined
): void {
  const name = geometryName?.trim();
  if (!name) {
    return;
  }
  for (const feature of features) {
    if (isOpenLayersGeometry(feature.get(name))) {
      feature.setGeometryName(name);
    }
  }
}

type ChosenGeometryLayer = {
  id?: string;
};

type ChosenGeometryMap = {
  on?: (type: string, listener: (event: unknown) => void) => void;
};

/** Listens for `FEATURESADD` on one layer and selects its profile geometry. */
export function attachChosenGeometry(
  map: ChosenGeometryMap | null | undefined,
  layer: ChosenGeometryLayer | null | undefined,
  geometryName: string | null | undefined,
  eventName: string | null | undefined = FEATURES_ADD
): void {
  const name = geometryName?.trim();
  if (!name || !layer || typeof map?.on !== 'function') {
    return;
  }
  map.on(eventName || FEATURES_ADD, (event: unknown) => {
    const record =
      event && typeof event === 'object'
        ? (event as { layer?: unknown; features?: unknown })
        : undefined;
    const eventLayer = record?.layer;
    if (
      eventLayer !== layer &&
      !(
        layer.id && (eventLayer as { id?: string } | undefined)?.id === layer.id
      )
    ) {
      return;
    }
    applyChosenGeometryName(openLayersFeatures(record?.features), name);
  });
}

function isOpenLayersGeometry(value: unknown): boolean {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as { getType?: unknown }).getType === 'function'
  );
}

function openLayersFeatures(value: unknown): ChosenGeometryFeature[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => {
    const feature = openLayersFeature(item);
    return feature ? [feature] : [];
  });
}

function openLayersFeature(feature: unknown): ChosenGeometryFeature | null {
  if (!feature || typeof feature !== 'object') {
    return null;
  }
  const record = feature as {
    get?: unknown;
    setGeometryName?: unknown;
    wrap?: { feature?: unknown };
  };
  if (
    typeof record.get === 'function' &&
    typeof record.setGeometryName === 'function'
  ) {
    return record as ChosenGeometryFeature;
  }
  const wrapped = record.wrap?.feature;
  if (!wrapped || typeof wrapped !== 'object') {
    return null;
  }
  const inner = wrapped as { get?: unknown; setGeometryName?: unknown };
  return typeof inner.get === 'function' &&
    typeof inner.setGeometryName === 'function'
    ? (inner as ChosenGeometryFeature)
    : null;
}
