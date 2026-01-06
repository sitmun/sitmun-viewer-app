import { TestBed } from '@angular/core/testing';
import { ConfigLookupService } from './config-lookup.service';
import { AppCfg, AppLayer, AppService, AppGroup } from '@api/model/app-cfg';

describe('ConfigLookupService', () => {
  let service: ConfigLookupService;
  let mockAppCfg: AppCfg;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigLookupService);

    // Create mock AppCfg
    mockAppCfg = {
      application: {
        id: 1,
        title: 'Test App',
        type: 'test',
        theme: 'default',
        srs: 'EPSG:25831',
        initialExtent: [0, 0, 100, 100]
      },
      backgrounds: [],
      groups: [
        { id: 'group-1', title: 'Group 1', layers: ['layer-1', 'layer-2'] },
        { id: 'group-2', title: 'Group 2', layers: ['layer-3'] },
        { id: 'group-3', title: 'Group 3' }
      ],
      layers: [
        {
          id: 'layer-1',
          title: 'Layer 1',
          layers: ['wms-layer-1'],
          service: 'service-1'
        },
        {
          id: 'layer-2',
          title: 'Layer 2',
          layers: ['wms-layer-2'],
          service: 'service-1'
        },
        {
          id: 'layer-3',
          title: 'Layer 3',
          layers: ['wms-layer-3'],
          service: 'service-2'
        }
      ],
      services: [
        {
          id: 'service-1',
          url: 'http://example.com/wms1',
          type: 'WMS',
          parameters: { VERSION: '1.3.0' }
        },
        {
          id: 'service-2',
          url: 'http://example.com/wms2',
          type: 'WMS',
          parameters: { VERSION: '1.1.1' }
        }
      ],
      tasks: [],
      trees: []
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialization', () => {
    it('should not be ready before initialization', () => {
      expect(service.isReady()).toBe(false);
    });

    it('should be ready after initialization', () => {
      service.initialize(mockAppCfg);
      expect(service.isReady()).toBe(true);
    });

    it('should build layer cache', () => {
      service.initialize(mockAppCfg);
      expect(service.findLayer('layer-1')).toEqual(mockAppCfg.layers[0]);
      expect(service.findLayer('layer-2')).toEqual(mockAppCfg.layers[1]);
      expect(service.findLayer('layer-3')).toEqual(mockAppCfg.layers[2]);
    });

    it('should build service cache', () => {
      service.initialize(mockAppCfg);
      expect(service.findService('service-1')).toEqual(mockAppCfg.services[0]);
      expect(service.findService('service-2')).toEqual(mockAppCfg.services[1]);
    });

    it('should build group cache', () => {
      service.initialize(mockAppCfg);
      expect(service.findGroup('group-1')).toEqual(mockAppCfg.groups[0]);
      expect(service.findGroup('group-2')).toEqual(mockAppCfg.groups[1]);
    });

    it('should handle groups without id', () => {
      const configWithMissingId: AppCfg = {
        ...mockAppCfg,
        groups: [
          { title: 'Group without ID', layers: [] }, // No id
          { id: 'group-1', title: 'Group with ID' }
        ]
      };
      service.initialize(configWithMissingId);

      expect(service.findGroup('group-1')).toBeTruthy();
      expect(service.getAllGroups().length).toBe(1); // Only group with id
    });

    it('should clear previous cache on re-initialization', () => {
      service.initialize(mockAppCfg);
      expect(service.findLayer('layer-1')).toBeTruthy();

      const newConfig: AppCfg = {
        ...mockAppCfg,
        layers: [{ id: 'new-layer', title: 'New', layers: [], service: 's1' }]
      };
      service.initialize(newConfig);

      expect(service.findLayer('layer-1')).toBeUndefined();
      expect(service.findLayer('new-layer')).toBeTruthy();
    });
  });

  describe('findLayer', () => {
    beforeEach(() => {
      service.initialize(mockAppCfg);
    });

    it('should find existing layer', () => {
      const layer = service.findLayer('layer-1');
      expect(layer).toBeDefined();
      expect(layer?.id).toBe('layer-1');
      expect(layer?.title).toBe('Layer 1');
    });

    it('should return undefined for non-existent layer', () => {
      expect(service.findLayer('non-existent')).toBeUndefined();
    });

    it('should have O(1) lookup time', () => {
      // This is a conceptual test - Map.get() is O(1)
      const start = performance.now();
      service.findLayer('layer-3');
      const end = performance.now();

      expect(end - start).toBeLessThan(1); // Should be near instant
    });
  });

  describe('findService', () => {
    beforeEach(() => {
      service.initialize(mockAppCfg);
    });

    it('should find existing service', () => {
      const svc = service.findService('service-1');
      expect(svc).toBeDefined();
      expect(svc?.url).toBe('http://example.com/wms1');
    });

    it('should return undefined for non-existent service', () => {
      expect(service.findService('non-existent')).toBeUndefined();
    });
  });

  describe('findGroup', () => {
    beforeEach(() => {
      service.initialize(mockAppCfg);
    });

    it('should find existing group', () => {
      const group = service.findGroup('group-1');
      expect(group).toBeDefined();
      expect(group?.title).toBe('Group 1');
    });

    it('should return undefined for non-existent group', () => {
      expect(service.findGroup('non-existent')).toBeUndefined();
    });
  });

  describe('getAll methods', () => {
    beforeEach(() => {
      service.initialize(mockAppCfg);
    });

    it('should return all layers', () => {
      const layers = service.getAllLayers();
      expect(layers.length).toBe(3);
      expect(layers).toContain(mockAppCfg.layers[0]);
    });

    it('should return all services', () => {
      const services = service.getAllServices();
      expect(services.length).toBe(2);
      expect(services).toContain(mockAppCfg.services[0]);
    });

    it('should return all groups', () => {
      const groups = service.getAllGroups();
      expect(groups.length).toBe(3);
      expect(groups).toContain(mockAppCfg.groups[0]);
    });

    it('should return empty arrays before initialization', () => {
      const uninitializedService = new ConfigLookupService();
      expect(uninitializedService.getAllLayers()).toEqual([]);
      expect(uninitializedService.getAllServices()).toEqual([]);
      expect(uninitializedService.getAllGroups()).toEqual([]);
    });
  });

  describe('clear', () => {
    it('should clear all caches', () => {
      service.initialize(mockAppCfg);
      expect(service.isReady()).toBe(true);
      expect(service.findLayer('layer-1')).toBeDefined();

      service.clear();

      expect(service.isReady()).toBe(false);
      expect(service.findLayer('layer-1')).toBeUndefined();
      expect(service.getAllLayers()).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle empty AppCfg', () => {
      const emptyConfig: AppCfg = {
        application: mockAppCfg.application,
        backgrounds: [],
        groups: [],
        layers: [],
        services: [],
        tasks: [],
        trees: []
      };

      service.initialize(emptyConfig);
      expect(service.isReady()).toBe(true);
      expect(service.getAllLayers()).toEqual([]);
      expect(service.getAllServices()).toEqual([]);
      expect(service.getAllGroups()).toEqual([]);
    });

    it('should handle undefined arrays in AppCfg', () => {
      const partialConfig = {
        ...mockAppCfg,
        layers: undefined,
        services: undefined,
        groups: undefined
      } as any;

      expect(() => service.initialize(partialConfig)).not.toThrow();
      expect(service.isReady()).toBe(true);
    });
  });
});
