/**
 * Characterization of the api-sitna / OpenLayers units mismatch behind
 * sitmun-viewer-app#152 (blank WMS legend SCALE=NaN on EPSG:3763).
 *
 * Reproduces SITNA’s registration path (WKT preferred over proj4) and the
 * lookup used by TC/ol getMetersPerUnit. Keep this failing-assertion shape so
 * an upstream fix makes the suite fail and we can drop the viewer workaround.
 *
 * Report against: https://github.com/sitna/api-sitna
 * Viewer issue: https://github.com/sitmun/sitmun-viewer-app/issues/152
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { get as getProjection, METERS_PER_UNIT } from 'ol/proj';

/** Same formula as SITNA Raster.getOgcScale */
function sitnaGetOgcScale(
  resolution: number,
  metersPerUnit: number | undefined
): number {
  return (resolution * (metersPerUnit as number)) / 0.00028;
}

/** Same lookup as api-sitna TC/ol/ol.js getMetersPerUnit (non-degree branch). */
function sitnaMetersPerUnitLookup(
  units: string | undefined
): number | undefined {
  if (!units || units === 'degrees') {
    return undefined;
  }
  return METERS_PER_UNIT[units as keyof typeof METERS_PER_UNIT];
}

describe('api-sitna upstream: WKT metre CRS METERS_PER_UNIT miss (#152)', () => {
  const crsPath = join(
    __dirname,
    '../../../node_modules/api-sitna/resources/data/crs/763.json'
  );

  it('documents EPSG:3763 WKT registration → units "meter" → SCALE NaN', () => {
    const data = JSON.parse(readFileSync(crsPath, 'utf8'))['3763'] as {
      name: string;
      wkt: string;
      proj4: string;
    };
    expect(data.name).toBe('ETRS89 / Portugal TM06');

    // SITNA TC.loadProjDef: loadDef(data.code, data.wkt || data.proj4, ...)
    const code = 'EPSG:3763-upstream-char';
    proj4.defs(code, data.wkt || data.proj4);
    register(proj4);

    const proj = getProjection(code);
    expect(proj).toBeTruthy();

    const units = proj!.getUnits();
    expect(units).toBe('meter');
    expect(Object.keys(METERS_PER_UNIT)).toEqual(
      expect.arrayContaining(['m', 'degrees', 'ft', 'radians', 'us-ft'])
    );
    expect(METERS_PER_UNIT).not.toHaveProperty('meter');
    expect(METERS_PER_UNIT).not.toHaveProperty('metre');

    // Broken SITNA path (do not use Projection.getMetersPerUnit here)
    const lookup = sitnaMetersPerUnitLookup(units);
    expect(lookup).toBeUndefined();

    const scale = sitnaGetOgcScale(1, lookup);
    expect(Number.isNaN(scale)).toBe(true);

    // Correct OpenLayers API still knows metres-per-unit
    expect(proj!.getMetersPerUnit()).toBe(1);

    // Contrast: same CRS via +units=m proj4 string is fine
    const viaProj4 = 'EPSG:3763-via-proj4';
    proj4.defs(viaProj4, data.proj4);
    register(proj4);
    const proj4Proj = getProjection(viaProj4)!;
    expect(proj4Proj.getUnits()).toBe('m');
    expect(sitnaMetersPerUnitLookup(proj4Proj.getUnits())).toBe(1);
    expect(
      Number.isFinite(sitnaGetOgcScale(1, sitnaMetersPerUnitLookup('m')))
    ).toBe(true);
  });
});
