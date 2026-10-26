import {
  applyChosenGeometryName,
  attachChosenGeometry,
  wfsLayerGeometryOptions
} from './wfs-layer-geometry';

function geometry(type: string) {
  return { getType: () => type };
}

function feature(
  properties: Record<string, unknown>,
  initialGeometryName = 'geometry'
) {
  const values = { ...properties };
  let geometryName = initialGeometryName;
  return {
    get: (name: string) => values[name],
    setGeometryName: (name: string) => {
      geometryName = name;
    },
    geometryName: () => geometryName
  };
}

describe('applyChosenGeometryName', () => {
  it('shows the named geometry when the feature has two geometry properties', () => {
    const drawn = feature(
      {
        Geometría: geometry('MultiPolygon'),
        centrelineGeometry: geometry('LineString')
      },
      'Geometría'
    );

    applyChosenGeometryName([drawn], 'centrelineGeometry');

    expect(drawn.geometryName()).toBe('centrelineGeometry');
  });

  it('leaves the feature unchanged when the name is missing or is not a geometry', () => {
    const missing = feature({ Geometría: geometry('Polygon') }, 'Geometría');
    const text = feature(
      { name: 'road', Geometría: geometry('Polygon') },
      'Geometría'
    );

    applyChosenGeometryName([missing], '  ');
    applyChosenGeometryName([missing], null);
    applyChosenGeometryName([text], 'name');
    applyChosenGeometryName([text], 'absent');

    expect(missing.geometryName()).toBe('Geometría');
    expect(text.geometryName()).toBe('Geometría');
  });
});

describe('wfsLayerGeometryOptions', () => {
  it.each(['Curve', 'MultiCurve', 'Surface', 'MultiSurface'])(
    'requests GML32 for %s',
    (geometryKind) => {
      expect(
        wfsLayerGeometryOptions({
          geometryName: 'centrelineGeometry',
          geometryKind
        })
      ).toEqual({
        geometryName: 'centrelineGeometry',
        outputFormat: 'GML32'
      });
    }
  );

  it.each([
    'Point',
    'MultiPoint',
    'LineString',
    'MultiLineString',
    'Polygon',
    'MultiPolygon',
    'Geometry'
  ])('keeps the default GML2 for %s', (geometryKind) => {
    expect(
      wfsLayerGeometryOptions({
        geometryName: 'the_geom',
        geometryKind,
        preferredGeometryType: geometryKind === 'Geometry' ? 'polygon' : null
      })
    ).toEqual({
      geometryName: 'the_geom',
      ...(geometryKind === 'Geometry' ? { geometryType: 'polygon' } : {})
    });
  });
});

describe('attachChosenGeometry', () => {
  it('selects the named property on FEATURESADD for that layer, including a wrapped feature', () => {
    const listeners: Array<(event: unknown) => void> = [];
    const map = {
      on: (_event: string, listener: (event: unknown) => void) => {
        listeners.push(listener);
      }
    };
    const chosen = feature(
      {
        Geometría: geometry('Polygon'),
        centrelineGeometry: geometry('LineString')
      },
      'Geometría'
    );
    const other = feature(
      { centrelineGeometry: geometry('LineString') },
      'Geometría'
    );
    const layer = { id: 'layer-1' };

    attachChosenGeometry(map, layer, 'centrelineGeometry');
    listeners[0]({ layer: { id: 'other' }, features: [other] });
    listeners[0]({
      layer,
      features: [{ wrap: { feature: chosen } }]
    });

    expect(chosen.geometryName()).toBe('centrelineGeometry');
    expect(other.geometryName()).toBe('Geometría');
  });
});
