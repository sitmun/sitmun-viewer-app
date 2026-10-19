const OGC_METERS_PER_PIXEL = 0.00028;

export function resolutionFromScaleDenominator(
  denominator: unknown,
  metersPerUnit: number
): number | undefined {
  if (
    typeof denominator !== 'number' ||
    !Number.isFinite(denominator) ||
    denominator <= 0
  ) {
    return undefined;
  }
  const units =
    Number.isFinite(metersPerUnit) && metersPerUnit > 0 ? metersPerUnit : 1;
  return (denominator * OGC_METERS_PER_PIXEL) / units;
}
