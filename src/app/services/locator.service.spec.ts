import { TestBed } from '@angular/core/testing';

import { AppCfg } from '@api/model/app-cfg';

import {
  DEFAULT_TASK_CONFIG,
  getByPath,
  getLocatorTasks,
  getTerritoryCode,
  getTerritoryDescription,
  getTerritoryExtent,
  getTerritoryName,
  LocatorService,
  setLocatorTasks
} from './locator.service';

describe('locator.service utilities', () => {
  describe('getByPath()', () => {
    it('returns root object when path is empty', () => {
      const root = { features: [{ id: 1 }] };
      expect(getByPath(root, '')).toBe(root);
    });

    it('resolves nested dot-notation paths', () => {
      expect(getByPath({ a: { b: { c: 42 } } }, 'a.b.c')).toBe(42);
    });

    it('returns undefined when an intermediate key is missing', () => {
      expect(getByPath({ a: { b: 1 } }, 'a.c.d')).toBeUndefined();
    });

    it('returns null/undefined input unchanged', () => {
      expect(getByPath(null, 'a.b')).toBeNull();
      expect(getByPath(undefined, 'a.b')).toBeUndefined();
    });
  });
});

describe('LocatorService', () => {
  let service: LocatorService;

  const baseAppCfg: AppCfg = {
    application: {
      id: 1,
      title: 'Test App',
      type: 'test',
      theme: 'default',
      srs: 'EPSG:25831',
      initialExtent: [10, 20, 110, 120],
      territoryCode: '08019',
      territoryName: 'Barcelona',
      territoryDescription: 'City',
      territorialAuthorityName: 'Ajuntament',
      territorialAuthorityAddress: 'Pl. Sant Jaume',
      territoryTypeName: 'Municipi',
      pointOfInterest: { x: 430000, y: 4580000 }
    },
    backgrounds: [],
    groups: [],
    layers: [],
    services: [],
    tasks: [],
    trees: []
  };

  beforeEach(() => {
    setLocatorTasks([]);
    TestBed.configureTestingModule({
      providers: [LocatorService]
    });
    service = TestBed.inject(LocatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialize()', () => {
    it('stores territory metadata in module-level getters', () => {
      service.initialize(baseAppCfg);

      expect(getTerritoryExtent()).toEqual([10, 20, 110, 120]);
      expect(getTerritoryCode()).toBe('08019');
      expect(getTerritoryName()).toBe('Barcelona');
      expect(getTerritoryDescription()).toBe('City');
    });

    it('parses sitmun.locator tasks and ignores other ui-control values', () => {
      service.initialize({
        ...baseAppCfg,
        tasks: [
          {
            id: 'task/1',
            'ui-control': 'sitna.search',
            parameters: {}
          },
          {
            id: 'task/41',
            name: 'SQL locator',
            url: '/proxy/1/1/SQL/41',
            scope: 'SQL',
            'ui-control': 'sitmun.locator',
            parameters: {
              resultsPath: 'features',
              labelField: 'name',
              geometryField: 'geom',
              filterByExtent: 'true',
              enableServiceParams: 'true',
              municipalityCodeFilters: JSON.stringify([
                { requestParam: 'id_municipi', territoryField: 'territory_code' }
              ])
            }
          }
        ] as any
      });

      expect(getLocatorTasks()).toEqual([
        {
          id: 'task/41',
          name: 'SQL locator',
          url: '/proxy/1/1/SQL/41',
          scope: 'SQL',
          resultsPath: 'features',
          labelField: 'name',
          geometryField: 'geom',
          latField: DEFAULT_TASK_CONFIG.latField,
          lonField: DEFAULT_TASK_CONFIG.lonField,
          srs: DEFAULT_TASK_CONFIG.srs,
          filterByExtent: true,
          enableServiceParams: true,
          municipalityCodeFilters: [
            { requestParam: 'id_municipi', territoryField: 'territory_code' }
          ]
        }
      ]);
    });

    it('applies defaults when locator task parameters are missing', () => {
      service.initialize({
        ...baseAppCfg,
        tasks: [
          {
            id: 'task/99',
            'ui-control': 'sitmun.locator',
            parameters: {}
          }
        ]
      });

      expect(getLocatorTasks()[0]).toMatchObject({
        id: 'task/99',
        name: '',
        url: '',
        scope: '',
        resultsPath: DEFAULT_TASK_CONFIG.resultsPath,
        labelField: DEFAULT_TASK_CONFIG.labelField,
        geometryField: DEFAULT_TASK_CONFIG.geometryField,
        filterByExtent: false,
        enableServiceParams: false,
        municipalityCodeFilters: []
      });
    });

    it('handles missing tasks array without throwing', () => {
      service.initialize({
        ...baseAppCfg,
        tasks: undefined as unknown as AppCfg['tasks']
      });

      expect(getLocatorTasks()).toEqual([]);
      expect(getTerritoryExtent()).toEqual([10, 20, 110, 120]);
    });
  });
});
