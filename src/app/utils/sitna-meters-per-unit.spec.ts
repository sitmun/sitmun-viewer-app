import {
  coerceMetersPerUnit,
  patchSitnaMapGetMetersPerUnit
} from './sitna-meters-per-unit';

/** SITNA Raster.getOgcScale: resolution * metersPerUnit / 0.00028 */
function ogcScale(resolution: number, metersPerUnit: number | undefined): number {
  return (resolution * (metersPerUnit as number)) / 0.00028;
}

describe('coerceMetersPerUnit', () => {
  it('returns 1 for undefined (WKT metre CRS METERS_PER_UNIT miss)', () => {
    expect(coerceMetersPerUnit(undefined)).toBe(1);
  });

  it('makes GetLegendGraphic SCALE finite when SITNA meters-per-unit is undefined', () => {
    const broken = ogcScale(1, undefined);
    expect(Number.isNaN(broken)).toBe(true);

    const fixed = ogcScale(1, coerceMetersPerUnit(undefined));
    expect(Number.isFinite(fixed)).toBe(true);
    expect(fixed).toBeCloseTo(3571.42857, 4);
  });

  it('returns 1 for null', () => {
    expect(coerceMetersPerUnit(null)).toBe(1);
  });

  it('returns 1 for NaN', () => {
    expect(coerceMetersPerUnit(Number.NaN)).toBe(1);
  });

  it('preserves finite values from SITNA degree / metre lookups', () => {
    expect(coerceMetersPerUnit(1)).toBe(1);
    expect(coerceMetersPerUnit(111319.49079327358)).toBe(111319.49079327358);
  });
});

describe('patchSitnaMapGetMetersPerUnit', () => {
  it('coerces non-finite getMetersPerUnit to 1 and restores on cleanup', () => {
    const original = jest.fn().mockReturnValue(undefined);
    const fakeTC = {
      wrap: {
        Map: {
          prototype: {
            getMetersPerUnit: original
          }
        }
      }
    };

    const restore = patchSitnaMapGetMetersPerUnit(fakeTC);
    expect(fakeTC.wrap.Map.prototype.getMetersPerUnit()).toBe(1);
    expect(original).toHaveBeenCalled();

    restore();
    expect(fakeTC.wrap.Map.prototype.getMetersPerUnit).toBe(original);
    expect(fakeTC.wrap.Map.prototype.getMetersPerUnit()).toBeUndefined();
  });

  it('leaves finite values unchanged', () => {
    const original = jest.fn().mockReturnValue(111194.87);
    const fakeTC = {
      wrap: {
        Map: {
          prototype: {
            getMetersPerUnit: original
          }
        }
      }
    };

    patchSitnaMapGetMetersPerUnit(fakeTC);
    expect(fakeTC.wrap.Map.prototype.getMetersPerUnit()).toBe(111194.87);
  });

  it('is a no-op when TC.wrap.Map.prototype.getMetersPerUnit is missing', () => {
    const restore = patchSitnaMapGetMetersPerUnit({});
    expect(typeof restore).toBe('function');
    restore();
  });
});
