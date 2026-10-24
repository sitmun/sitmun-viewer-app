const SITNA_WFS_GEOMETRY_TYPES = new Set([
  'point',
  'multipoint',
  'polyline',
  'polygon',
  'multipolyline',
  'multipolygon'
]);

export type WfsLayerGeometrySource = {
  geometryName?: string | null;
  preferredGeometryType?: string | null;
};

/**
 * Options SITNA reads when a WFS layer is added.
 * `geometryName` is the feature property (`ol.format.GeoJSON` and WFS layer options).
 * `geometryType` is a `SITNA.Consts.geom` id, passed only for an explicit override.
 */
export function wfsLayerGeometryOptions(
  layer: WfsLayerGeometrySource
): { geometryName?: string; geometryType?: string } {
  const options: { geometryName?: string; geometryType?: string } = {};
  const name = layer.geometryName?.trim();
  if (name) {
    options.geometryName = name;
  }
  const type = layer.preferredGeometryType?.trim();
  if (type && SITNA_WFS_GEOMETRY_TYPES.has(type)) {
    options.geometryType = type;
  }
  return options;
}
