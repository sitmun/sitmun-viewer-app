import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OverviewMapControlHandler } from './overview-map-control.handler';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import { ConfigLookupService } from '../../services/config-lookup.service';
import { UIStateService } from '../../services/ui-state.service';
import { AppConfigService } from '../../services/app-config.service';
import { AppCfg, AppTasks } from '@api/model/app-cfg';

describe('OverviewMapControlHandler', () => {
  let handler: OverviewMapControlHandler;
  let mockTCNamespace: jasmine.SpyObj<TCNamespaceService>;
  let mockConfigLookup: jasmine.SpyObj<ConfigLookupService>;
  let mockUIStateService: jasmine.SpyObj<UIStateService>;
  let mockAppConfigService: jasmine.SpyObj<AppConfigService>;
  let mockAppCfg: AppCfg;

  beforeEach(() => {
    mockTCNamespace = jasmine.createSpyObj('TCNamespaceService', [
      'waitForTC',
      'getTC'
    ]);

    mockConfigLookup = jasmine.createSpyObj('ConfigLookupService', [
      'initialize',
      'findGroup',
      'findLayer',
      'findService'
    ]);

    mockUIStateService = jasmine.createSpyObj('UIStateService', [
      'enableOverviewMapButton'
    ]);

    mockAppConfigService = jasmine.createSpyObj('AppConfigService', [
      'getControlDefault'
    ]);
    mockAppConfigService.getControlDefault.and.returnValue({
      div: 'ovmap'
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        OverviewMapControlHandler,
        { provide: TCNamespaceService, useValue: mockTCNamespace },
        { provide: ConfigLookupService, useValue: mockConfigLookup },
        { provide: UIStateService, useValue: mockUIStateService },
        { provide: AppConfigService, useValue: mockAppConfigService }
      ]
    });

    handler = TestBed.inject(OverviewMapControlHandler);

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
      groups: [],
      layers: [],
      services: [],
      tasks: [],
      trees: []
    };
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });

  describe('controlIdentifier', () => {
    it('should have correct control identifier', () => {
      expect(handler.controlIdentifier).toBe('sitna.overviewMap');
    });
  });

  describe('sitnaConfigKey', () => {
    it('should have correct SITNA config key', () => {
      expect(handler.sitnaConfigKey).toBe('overviewMap');
    });
  });

  describe('requiredPatches', () => {
    it('should have no required patches', () => {
      expect(handler.requiredPatches).toBeUndefined();
    });
  });

  describe('buildConfiguration()', () => {
    it('should initialize ConfigLookupService', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.overviewMap',
        parameters: {}
      } as any;
      const context: AppCfg = { ...mockAppCfg };

      handler.buildConfiguration(task, context);

      expect(mockConfigLookup.initialize).toHaveBeenCalledWith(context);
    });

    it('should enable UI button when configured', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.overviewMap',
        parameters: {}
      } as any;
      const context: AppCfg = { ...mockAppCfg };

      handler.buildConfiguration(task, context);

      expect(mockUIStateService.enableOverviewMapButton).toHaveBeenCalled();
    });

    it('should return parameters AS-IS without merge', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.overviewMap',
        parameters: {
          div: 'custom-div',
          layer: 'custom-layer'
        }
      } as any;
      const context: AppCfg = { ...mockAppCfg };

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        div: 'custom-div',
        layer: 'custom-layer'
      });
      // Should not merge with default div
      expect(config?.div).toBe('custom-div');
    });

    it('should return default mapabase when no situation-map and no parameters', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.overviewMap',
        parameters: {}
      } as any;
      const context: AppCfg = {
        ...mockAppCfg,
        application: {
          ...mockAppCfg.application,
          'situation-map': undefined
        }
      };

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        div: 'ovmap',
        layer: 'mapabase'
      });
    });

    it('should successfully resolve layer from situation-map', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.overviewMap',
        parameters: {}
      } as any;

      const mockService = {
        id: 'service1',
        url: 'https://example.com/wms',
        type: 'WMS',
        parameters: {}
      };

      const mockLayer = {
        id: 'layer1',
        title: 'Test Layer',
        service: 'service1',
        layers: ['layer1']
      };

      const mockGroup = {
        id: 'group1',
        layers: ['layer1']
      };

      mockConfigLookup.findGroup.and.returnValue(mockGroup);
      mockConfigLookup.findLayer.and.returnValue(mockLayer);
      mockConfigLookup.findService.and.returnValue(mockService);

      const context: AppCfg = {
        ...mockAppCfg,
        application: {
          ...mockAppCfg.application,
          'situation-map': 'group1'
        }
      };

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        div: 'ovmap',
        layer: {
          id: 'Test Layer',
          url: 'https://example.com/wms',
          layerNames: ['layer1']
        }
      });
    });

    it('should return null when group not found', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.overviewMap',
        parameters: {}
      } as any;

      mockConfigLookup.findGroup.and.returnValue(undefined);

      const context: AppCfg = {
        ...mockAppCfg,
        application: {
          ...mockAppCfg.application,
          'situation-map': 'nonexistent-group'
        },
        groups: []
      };

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeNull();
    });

    it('should return null when group has no layers', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.overviewMap',
        parameters: {}
      } as any;

      const mockGroup = {
        id: 'group1',
        layers: []
      };

      mockConfigLookup.findGroup.and.returnValue(mockGroup);

      const context: AppCfg = {
        ...mockAppCfg,
        application: {
          ...mockAppCfg.application,
          'situation-map': 'group1'
        }
      };

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeNull();
    });

    it('should return null when layer not found', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.overviewMap',
        parameters: {}
      } as any;

      const mockGroup = {
        id: 'group1',
        layers: ['nonexistent-layer']
      };

      mockConfigLookup.findGroup.and.returnValue(mockGroup);
      mockConfigLookup.findLayer.and.returnValue(undefined);

      const context: AppCfg = {
        ...mockAppCfg,
        application: {
          ...mockAppCfg.application,
          'situation-map': 'group1'
        },
        layers: []
      };

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeNull();
    });

    it('should return null when service not found', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.overviewMap',
        parameters: {}
      } as any;

      const mockLayer = {
        id: 'layer1',
        title: 'Test Layer',
        service: 'nonexistent-service',
        layers: ['layer1']
      };

      const mockGroup = {
        id: 'group1',
        layers: ['layer1']
      };

      mockConfigLookup.findGroup.and.returnValue(mockGroup);
      mockConfigLookup.findLayer.and.returnValue(mockLayer);
      mockConfigLookup.findService.and.returnValue(undefined);

      const context: AppCfg = {
        ...mockAppCfg,
        application: {
          ...mockAppCfg.application,
          'situation-map': 'group1'
        },
        services: []
      };

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeNull();
    });

    it('should return null when service has no URL', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.overviewMap',
        parameters: {}
      } as any;

      const mockService = {
        id: 'service1',
        url: undefined,
        type: 'WMS',
        parameters: {}
      } as any;

      const mockLayer = {
        id: 'layer1',
        title: 'Test Layer',
        service: 'service1',
        layers: ['layer1']
      };

      const mockGroup = {
        id: 'group1',
        layers: ['layer1']
      };

      mockConfigLookup.findGroup.and.returnValue(mockGroup);
      mockConfigLookup.findLayer.and.returnValue(mockLayer);
      mockConfigLookup.findService.and.returnValue(mockService);

      const context: AppCfg = {
        ...mockAppCfg,
        application: {
          ...mockAppCfg.application,
          'situation-map': 'group1'
        }
      };

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeNull();
    });

    it('should build correct SitnaBaseLayer structure', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.overviewMap',
        parameters: {}
      } as any;

      const mockService = {
        id: 'service1',
        url: 'https://example.com/wms',
        type: 'WMS',
        parameters: {}
      };

      const mockLayer = {
        id: 'layer1',
        title: 'My Test Layer',
        service: 'service1',
        layers: ['layer1', 'layer2']
      };

      const mockGroup = {
        id: 'group1',
        layers: ['layer1']
      };

      mockConfigLookup.findGroup.and.returnValue(mockGroup);
      mockConfigLookup.findLayer.and.returnValue(mockLayer);
      mockConfigLookup.findService.and.returnValue(mockService);

      const context: AppCfg = {
        ...mockAppCfg,
        application: {
          ...mockAppCfg.application,
          'situation-map': 'group1'
        }
      };

      const config = handler.buildConfiguration(task, context);

      expect(config).not.toBeNull();
      if (config && typeof config['layer'] === 'object') {
        expect(config['layer'].id).toBe('My Test Layer');
        expect(config['layer'].url).toBe('https://example.com/wms');
        expect(config['layer'].layerNames).toEqual(['layer1', 'layer2']);
      } else {
        fail('Expected layer to be an object');
      }
    });

    it('should use first layer from group', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.overviewMap',
        parameters: {}
      } as any;

      const mockService = {
        id: 'service1',
        url: 'https://example.com/wms',
        type: 'WMS',
        parameters: {}
      };

      const mockLayer = {
        id: 'first-layer',
        title: 'First Layer',
        service: 'service1',
        layers: ['first-layer']
      };

      const mockGroup = {
        id: 'group1',
        layers: ['first-layer', 'second-layer', 'third-layer']
      };

      mockConfigLookup.findGroup.and.returnValue(mockGroup);
      mockConfigLookup.findLayer.and.returnValue(mockLayer);
      mockConfigLookup.findService.and.returnValue(mockService);

      const context: AppCfg = {
        ...mockAppCfg,
        application: {
          ...mockAppCfg.application,
          'situation-map': 'group1'
        }
      };

      const config = handler.buildConfiguration(task, context);

      expect(mockConfigLookup.findLayer).toHaveBeenCalledWith('first-layer');
      expect(config).not.toBeNull();
      if (config && typeof config['layer'] === 'object') {
        expect(config['layer'].id).toBe('First Layer');
      }
    });
  });

  describe('isReady()', () => {
    it('should always return true (no patches)', () => {
      expect(handler.isReady()).toBe(true);
    });
  });
});
