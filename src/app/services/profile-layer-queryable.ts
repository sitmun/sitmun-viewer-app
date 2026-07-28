import { AppLayer } from '@api/model/app-cfg';

/**
 * Whether GetCapabilities should advertise the layer as queryable (GetFeatureInfo).
 * Missing {@link AppLayer#queryableFeatureEnabled} preserves pre-profile behavior (treat as true).
 */
export function isProfileLayerQueryable(appLayer: AppLayer): boolean {
  const enabled = appLayer.queryableFeatureEnabled;
  if (enabled === undefined) {
    return true;
  }
  return enabled === true;
}

/**
 * Capas / FeatureInfo runtime gate for a catalog work layer.
 * Requires tree {@code queryableActive} (queryable leaf) and cartography
 * {@code queryableFeatureEnabled}; either off blocks map-click GFI.
 */
export function resolveSitmunGfiEnabled(
  isQueryableLeaf: boolean,
  appLayer?: AppLayer | null
): boolean {
  if (!isQueryableLeaf) {
    return false;
  }
  if (!appLayer) {
    return true;
  }
  return isProfileLayerQueryable(appLayer);
}
