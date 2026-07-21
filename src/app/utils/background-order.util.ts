import { AppBackground } from '@api/model/app-cfg';
import { SitnaBaseLayer } from '@api/model/sitna-cfg';

import { NO_BASE_MAP_LAYER_ID } from './no-base-map.util';

/**
 * Sort application backgrounds by profile `order` ascending.
 * Missing/null `order` values sort last; ties preserve original input order.
 */
export function sortBackgroundsByOrder<T extends Pick<AppBackground, 'order'>>(
  backgrounds: T[]
): T[] {
  return backgrounds
    .map((background, index) => ({ background, index }))
    .sort((left, right) => compareBackgroundOrder(left, right))
    .map(({ background }) => background);
}

function compareBackgroundOrder(
  left: { background: Pick<AppBackground, 'order'>; index: number },
  right: { background: Pick<AppBackground, 'order'>; index: number }
): number {
  const leftOrder = left.background.order;
  const rightOrder = right.background.order;
  const leftMissing = leftOrder == null;
  const rightMissing = rightOrder == null;

  if (leftMissing && rightMissing) {
    return left.index - right.index;
  }
  if (leftMissing) {
    return 1;
  }
  if (rightMissing) {
    return -1;
  }
  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }
  return left.index - right.index;
}

/**
 * SITNA `defaultBaseLayer` accepts a base layer id or index into `baseLayers`.
 * Use the first ordered base layer id so the initial basemap matches admin order.
 */
export function toDefaultBaseLayer(
  baseLayers: SitnaBaseLayer[]
): string | undefined {
  return baseLayers.find((layer) => layer.id !== NO_BASE_MAP_LAYER_ID)?.id;
}
