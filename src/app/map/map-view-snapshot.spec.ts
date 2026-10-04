import {
  applyLayerOrder,
  applyMapSnapshot,
  applySharedView3D,
  buildMapStateUrl,
  decodeMapState,
  encodeMapState,
  layerDeltas,
  layerOrder,
  profileLayerIdForBase,
  profileLayerIdsToAdd,
  sitnaBaseIdForProfile,
  snapshotFrom
} from './map-view-snapshot';

describe('map view snapshot', () => {
  const extent: [number, number, number, number] = [1, 2, 3, 4];

  it('keeps a hash route and writes mapState inside the fragment', () => {
    const href = 'http://localhost:9000/viewer/#/public/map/12/4';
    const url = buildMapStateUrl(href, 'tok');
    expect(url).toBe(
      'http://localhost:9000/viewer/#/public/map/12/4?mapState=tok'
    );
  });

  it('keeps a path route and writes mapState on the query', () => {
    const href = 'http://localhost:9000/viewer/public/map/12/4';
    const url = buildMapStateUrl(href, 'tok');
    expect(url).toBe(
      'http://localhost:9000/viewer/public/map/12/4?mapState=tok'
    );
    expect(url.includes('#')).toBe(false);
  });

  it('replaces an existing mapState and keeps the route', () => {
    const href =
      'http://localhost:9000/viewer/#/user/map/12/34?mapState=old&lang=ca';
    const url = buildMapStateUrl(href, 'new');
    expect(url.startsWith('http://localhost:9000/viewer/#/user/map/12/34?')).toBe(
      true
    );
    expect(url).toContain('mapState=new');
    expect(url).toContain('lang=ca');
    expect(url).not.toContain('mapState=old');
  });

  it('round-trips the extent and omits an unchanged background', () => {
    const token = encodeMapState(
      snapshotFrom({
        extent,
        baseLayerId: '10',
        defaultBaseLayerId: '10'
      })
    );
    expect(decodeMapState(token)).toEqual({ ext: extent });
  });

  it('keeps a background, layer override, drawing, feature, and 3D camera', () => {
    const snapshot = snapshotFrom({
      extent,
      baseLayerId: '20',
      defaultBaseLayerId: '10',
      layers: [{ id: '30', visible: true }],
      draw: { features: 1 },
      feature: { id: 'f' },
      vw3: { cp: [0, 0, 1] }
    });
    expect(decodeMapState(encodeMapState(snapshot))).toEqual(snapshot);
  });

  it('rejects a token without an extent', () => {
    expect(decodeMapState('not-a-token')).toBeNull();
  });

  it('maps a SITNA base title to the profile layer id', () => {
    const layers = [{ id: '20', title: 'Ortofoto' }];
    expect(profileLayerIdForBase(layers, 'Ortofoto')).toBe('20');
    expect(sitnaBaseIdForProfile(layers, '20')).toBe('Ortofoto');
    expect(profileLayerIdForBase(layers, 'sitmun-no-base-map')).toBeUndefined();
  });

  it('omits stacking order when extras stay above the profile layers that remain', () => {
    expect(layerOrder(['1', '3'], ['1', '2', '3'])).toBeUndefined();
    expect(layerOrder(['1', '2', '9'], ['1', '2'])).toBeUndefined();
  });

  it('records loaded layers when their order differs from the catalog', () => {
    expect(layerOrder(['4658', '1325'], [], ['1325', '4658'])).toEqual([
      '4658',
      '1325'
    ]);
    expect(
      layerOrder(['1325', '4658'], [], ['1325', '4658'])
    ).toBeUndefined();
  });

  it('records stacking order when a catalog layer moves between profile layers', () => {
    expect(layerOrder(['1', '9', '2'], ['1', '2'])).toEqual(['1', '9', '2']);
    expect(layerOrder(['2', '1'], ['1', '2'])).toEqual(['2', '1']);
  });

  it('puts work layers back in the stored stacking order', async () => {
    type Slot = { isBase?: boolean; options?: { profileLayerId?: string } };
    const layer = (id: string): Slot => ({
      isBase: false,
      options: { profileLayerId: id }
    });
    const base: Slot = { isBase: true };
    const work = [layer('1'), layer('2'), layer('9')];
    const map = {
      layers: [base, ...work],
      workLayers: [...work],
      insertLayer(moved: { isBase?: boolean }, index: number) {
        const before = map.layers.indexOf(moved as Slot);
        if (before >= 0) {
          map.layers.splice(before, 1);
        }
        map.layers.splice(index, 0, moved as Slot);
        map.workLayers = map.layers.filter((item) => !item.isBase);
      }
    };

    await applyLayerOrder(map, ['1', '9', '2']);

    expect(map.workLayers.map((item) => item.options?.profileLayerId)).toEqual([
      '1',
      '9',
      '2'
    ]);

    const raised = [layer('1'), layer('2'), layer('9')];
    const raisedMap = {
      layers: [base, ...raised],
      workLayers: [...raised],
      insertLayer(moved: { isBase?: boolean }, index: number) {
        const before = raisedMap.layers.indexOf(moved as Slot);
        if (before >= 0) {
          raisedMap.layers.splice(before, 1);
        }
        raisedMap.layers.splice(index, 0, moved as Slot);
        raisedMap.workLayers = raisedMap.layers.filter((item) => !item.isBase);
      }
    };

    await applyLayerOrder(raisedMap, ['2', '9', '1']);

    expect(
      raisedMap.workLayers.map((item) => item.options?.profileLayerId)
    ).toEqual(['2', '9', '1']);
  });

  it('records opacity when a profile layer is not fully opaque', () => {
    expect(
      layerDeltas(
        [{ profileLayerId: '1', visible: true, opacity: 0.25 }],
        [{ profileLayerId: '1', visible: true }]
      )
    ).toEqual([{ id: '1', opacity: 0.25 }]);
  });

  it('omits opacity when a profile layer stays fully opaque', () => {
    expect(
      layerDeltas(
        [{ profileLayerId: '1', visible: true, opacity: 1 }],
        [{ profileLayerId: '1', visible: true }]
      )
    ).toBeUndefined();
  });

  it('keeps later layers when a background or a layer cannot be applied', () => {
    const setVisibility = jest.fn();
    expect(() =>
      applyMapSnapshot(
        {
          setBaseLayer() {
            throw new Error('missing background');
          },
          workLayers: [
            {
              options: { profileLayerId: '1' },
              setOpacity() {
                throw new Error('missing layer');
              }
            },
            {
              options: { profileLayerId: '2' },
              setVisibility
            }
          ]
        },
        {
          ext: extent,
          base: '20',
          layers: [
            { id: '1', opacity: 0.2 },
            { id: 'gone', visible: false },
            { id: '2', visible: false }
          ]
        },
        'Missing'
      )
    ).not.toThrow();
    expect(setVisibility).toHaveBeenCalledWith(false);
  });

  it('records only catalog layers that differ from the profile', () => {
    expect(
      layerDeltas(
        [
          { profileLayerId: '1', visible: true, opacity: 1 },
          { profileLayerId: '2', visible: true, opacity: 0.4 }
        ],
        [
          { profileLayerId: '1', visible: true, opacity: 1 },
          { profileLayerId: '3', visible: true, opacity: 1 }
        ]
      )
    ).toEqual([
      { id: '2', opacity: 0.4, visible: true },
      { id: '3', visible: false }
    ]);
  });

  it('applies the extent and a non-default background', () => {
    const setExtent = jest.fn();
    const setBaseLayer = jest.fn();
    applyMapSnapshot(
      { setExtent, setBaseLayer },
      { ext: extent, base: '20' },
      'Ortofoto'
    );
    expect(setExtent).toHaveBeenCalledWith(extent, { animate: false });
    expect(setBaseLayer).toHaveBeenCalledWith('Ortofoto');
  });

  it('applies sublayer names on a layer that is already on the map', () => {
    const setLayerNames = jest.fn();
    applyMapSnapshot(
      {
        workLayers: [
          { options: { profileLayerId: '2' }, setLayerNames }
        ]
      },
      { ext: extent, layers: [{ id: '2', sublayers: ['a', 'b'] }] }
    );
    expect(setLayerNames).toHaveBeenCalledWith(['a', 'b']);
  });

  it('adds a catalog layer that is not on the map and leaves a hidden one off', () => {
    expect(
      profileLayerIdsToAdd(
        {
          ext: extent,
          layers: [
            { id: '9', visible: true },
            { id: '3', visible: false }
          ]
        },
        ['3']
      )
    ).toEqual(['9']);
  });

  it('turns 3D on before applying the camera', async () => {
    const setCameraState = jest.fn();
    const map: {
      on3DView: boolean;
      view3D?: { cameraControls: { setCameraState: jest.Mock } };
      controls: Array<{ set3D: () => void }>;
    } = {
      on3DView: false,
      controls: [
        {
          set3D() {
            map.on3DView = true;
            map.view3D = { cameraControls: { setCameraState } };
          }
        }
      ]
    };
    await applySharedView3D(map, { cp: [1, 2, 3] });
    expect(setCameraState).toHaveBeenCalledWith({ cp: [1, 2, 3] });
  });
});
