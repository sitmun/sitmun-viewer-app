/**
 * Workaround for api-sitna GetLegendGraphic SCALE=NaN on WKT-registered metre CRS
 * (e.g. EPSG:3763). SITNA looks up ol.proj.METERS_PER_UNIT[units] where units is
 * "meter", but OpenLayers only defines "m".
 *
 * Upstream characterization (drop this patch when it flips):
 * `api-sitna-meters-per-unit-upstream.spec.ts`
 *
 * @see https://github.com/sitmun/sitmun-viewer-app/issues/152
 */

export type SitnaWrapMapPrototype = {
  getMetersPerUnit?: (this: unknown) => number | undefined | null;
};

export type SitnaTcForMetersPerUnitPatch = {
  wrap?: {
    Map?: {
      prototype?: SitnaWrapMapPrototype;
    };
  };
};

/**
 * Coerce SITNA meters-per-unit to a finite number for OGC scale math.
 * Non-finite values (undefined from the "meter"/"m" miss) become 1 (metre).
 */
export function coerceMetersPerUnit(
  value: number | null | undefined
): number {
  return Number.isFinite(value) ? (value as number) : 1;
}

/**
 * Patch TC.wrap.Map.prototype.getMetersPerUnit so legend getOgcScale stays finite.
 * @returns restore function (no-op when the target method is absent)
 */
export function patchSitnaMapGetMetersPerUnit(
  TC: SitnaTcForMetersPerUnitPatch | null | undefined
): () => void {
  const proto = TC?.wrap?.Map?.prototype;
  const original = proto?.getMetersPerUnit;
  if (!proto || typeof original !== 'function') {
    return () => undefined;
  }

  proto.getMetersPerUnit = function (this: unknown) {
    return coerceMetersPerUnit(original.call(this));
  };

  return () => {
    proto.getMetersPerUnit = original;
  };
}
