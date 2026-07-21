import { SitnaBaseLayer } from '@api/model/sitna-cfg';

export const NO_BASE_MAP_LAYER_ID = 'sitmun-no-base-map';

const NO_BASE_MAP_THUMBNAIL = 'assets/img/no-basemap-thumbnail.svg';

/** Empty SITNA VECTOR basemap (no url → empty ol.source.Vector). */
export function createNoBaseMapLayer(title: string): SitnaBaseLayer {
  return {
    id: NO_BASE_MAP_LAYER_ID,
    title,
    type: 'vector',
    isBase: true,
    thumbnail: NO_BASE_MAP_THUMBNAIL
  };
}
