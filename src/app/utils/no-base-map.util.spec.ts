import {
  createNoBaseMapLayer,
  NO_BASE_MAP_LAYER_ID
} from './no-base-map.util';

describe('createNoBaseMapLayer', () => {
  it('returns an empty VECTOR basemap without url', () => {
    const layer = createNoBaseMapLayer('No base map');

    expect(layer.id).toBe(NO_BASE_MAP_LAYER_ID);
    expect(layer.title).toBe('No base map');
    expect(layer.type).toBe('vector');
    expect(layer.isBase).toBe(true);
    expect(layer.thumbnail).toBe('assets/img/no-basemap-thumbnail.svg');
    expect('url' in layer).toBe(false);
  });
});
