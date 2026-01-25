import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { OverviewMapControlHandler } from './overview-map-control.handler';
import { AppConfigService } from '../../services/app-config.service';
import { ConfigLookupService } from '../../services/config-lookup.service';
import { SitnaApiService } from '../../services/sitna-api.service';
import { UIStateService } from '../../services/ui-state.service';

describe('OverviewMapControlHandler', () => {
  let handler: OverviewMapControlHandler;
  let mockSitnaApi: jest.Mocked<SitnaApiService>;
  let mockConfigLookup: jest.Mocked<ConfigLookupService>;
  let mockUIStateService: jest.Mocked<UIStateService>;
  let mockAppConfigService: jest.Mocked<AppConfigService>;
  let mockAppCfg: AppCfg;

  beforeEach(() => {
    mockSitnaApi = {
      getTC: jest.fn(),
      getSITNA: jest.fn().mockReturnValue({} as any),
      getTCProperty: jest.fn(),
      isReady: jest.fn().mockReturnValue(true)
    } as Partial<jest.Mocked<SitnaApiService>> as jest.Mocked<SitnaApiService>;

    mockConfigLookup = {
      initialize: jest.fn(),
      findGroup: jest.fn(),
      findLayer: jest.fn(),
      findService: jest.fn()
    } as Partial<
      jest.Mocked<ConfigLookupService>
    > as jest.Mocked<ConfigLookupService>;

    mockUIStateService = {
      enableOverviewMapButton: jest.fn()
    } as Partial<jest.Mocked<UIStateService>> as jest.Mocked<UIStateService>;

    mockAppConfigService = {
      getControlDefault: jest.fn()
    } as Partial<
      jest.Mocked<AppConfigService>
    > as jest.Mocked<AppConfigService>;
    mockAppConfigService.getControlDefault.mockReturnValue({
      div: 'tc-slot-ovmap'
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        OverviewMapControlHandler,
        { provide: SitnaApiService, useValue: mockSitnaApi },
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

    it('should return first basemap when no situation-map and no parameters', () => {
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
        id: 'baselayer1',
        title: 'Base Layer',
        service: 'service1',
        layers: ['baselayer1']
      };

      const mockGroup = {
        id: 'background1',
        layers: ['baselayer1']
      };

      mockConfigLookup.findGroup.mockReturnValue(mockGroup);
      mockConfigLookup.findLayer.mockReturnValue(mockLayer);
      mockConfigLookup.findService.mockReturnValue(mockService);

      const context: AppCfg = {
        ...mockAppCfg,
        application: {
          ...mockAppCfg.application,
          'situation-map': undefined
        },
        backgrounds: [
          { id: 'background1', title: 'Background 1', thumbnail: '' }
        ],
        groups: [mockGroup],
        layers: [mockLayer],
        services: [mockService]
      };

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        div: 'tc-slot-ovmap',
        layer: {
          id: 'Base Layer',
          title: 'Base Layer',
          url: 'https://example.com/wms',
          type: 'WMS',
          layerNames: ['baselayer1']
        }
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

      mockConfigLookup.findGroup.mockReturnValue(mockGroup);
      mockConfigLookup.findLayer.mockReturnValue(mockLayer);
      mockConfigLookup.findService.mockReturnValue(mockService);

      const context: AppCfg = {
        ...mockAppCfg,
        application: {
          ...mockAppCfg.application,
          'situation-map': 'group1'
        }
      };

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        div: 'tc-slot-ovmap',
        layer: {
          id: 'Test Layer',
          title: 'Test Layer',
          url: 'https://example.com/wms',
          type: 'WMS',
          layerNames: ['layer1']
        }
      });
    });

    it('should return first basemap when group not found', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.overviewMap',
        parameters: {}
      } as any;

      mockConfigLookup.findGroup.mockReturnValue(undefined);

      const mockService = {
        id: 'service1',
        url: 'https://example.com/wms',
        type: 'WMS',
        parameters: {}
      };

      const mockLayer = {
        id: 'baselayer1',
        title: 'Base Layer',
        service: 'service1',
        layers: ['baselayer1']
      };

      const mockBasemapGroup = {
        id: 'background1',
        layers: ['baselayer1']
      };

      mockConfigLookup.findGroup
        .mockReturnValueOnce(undefined) // situation-map group not found
        .mockReturnValueOnce(mockBasemapGroup); // basemap group found
      mockConfigLookup.findLayer.mockReturnValue(mockLayer);
      mockConfigLookup.findService.mockReturnValue(mockService);

      const context: AppCfg = {
        ...mockAppCfg,
        application: {
          ...mockAppCfg.application,
          'situation-map': 'nonexistent-group'
        },
        backgrounds: [
          { id: 'background1', title: 'Background 1', thumbnail: '' }
        ],
        groups: [mockBasemapGroup],
        layers: [mockLayer],
        services: [mockService]
      };

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        div: 'tc-slot-ovmap',
        layer: {
          id: 'Base Layer',
          title: 'Base Layer',
          url: 'https://example.com/wms',
          type: 'WMS',
          layerNames: ['baselayer1']
        }
      });
    });

    it('should return first basemap when group has no layers', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.overviewMap',
        parameters: {}
      } as any;

      const mockGroup = {
        id: 'group1',
        layers: []
      };

      const mockService = {
        id: 'service1',
        url: 'https://example.com/wms',
        type: 'WMS',
        parameters: {}
      };

      const mockLayer = {
        id: 'baselayer1',
        title: 'Base Layer',
        service: 'service1',
        layers: ['baselayer1']
      };

      const mockBasemapGroup = {
        id: 'background1',
        layers: ['baselayer1']
      };

      mockConfigLookup.findGroup
        .mockReturnValueOnce(mockGroup) // situation-map group found but empty
        .mockReturnValueOnce(mockBasemapGroup); // basemap group found
      mockConfigLookup.findLayer.mockReturnValue(mockLayer);
      mockConfigLookup.findService.mockReturnValue(mockService);

      const context: AppCfg = {
        ...mockAppCfg,
        application: {
          ...mockAppCfg.application,
          'situation-map': 'group1'
        },
        backgrounds: [
          { id: 'background1', title: 'Background 1', thumbnail: '' }
        ],
        groups: [mockGroup, mockBasemapGroup],
        layers: [mockLayer],
        services: [mockService]
      };

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        div: 'tc-slot-ovmap',
        layer: {
          id: 'Base Layer',
          title: 'Base Layer',
          url: 'https://example.com/wms',
          type: 'WMS',
          layerNames: ['baselayer1']
        }
      });
    });

    it('should return first basemap when layer not found', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.overviewMap',
        parameters: {}
      } as any;

      const mockGroup = {
        id: 'group1',
        layers: ['nonexistent-layer']
      };

      const mockService = {
        id: 'service1',
        url: 'https://example.com/wms',
        type: 'WMS',
        parameters: {}
      };

      const mockLayer = {
        id: 'baselayer1',
        title: 'Base Layer',
        service: 'service1',
        layers: ['baselayer1']
      };

      const mockBasemapGroup = {
        id: 'background1',
        layers: ['baselayer1']
      };

      mockConfigLookup.findGroup
        .mockReturnValueOnce(mockGroup) // situation-map group
        .mockReturnValueOnce(mockBasemapGroup); // basemap group
      mockConfigLookup.findLayer
        .mockReturnValueOnce(undefined) // situation-map layer not found
        .mockReturnValueOnce(mockLayer); // basemap layer found
      mockConfigLookup.findService.mockReturnValue(mockService);

      const context: AppCfg = {
        ...mockAppCfg,
        application: {
          ...mockAppCfg.application,
          'situation-map': 'group1'
        },
        backgrounds: [
          { id: 'background1', title: 'Background 1', thumbnail: '' }
        ],
        groups: [mockGroup, mockBasemapGroup],
        layers: [mockLayer],
        services: [mockService]
      };

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        div: 'tc-slot-ovmap',
        layer: {
          id: 'Base Layer',
          title: 'Base Layer',
          url: 'https://example.com/wms',
          type: 'WMS',
          layerNames: ['baselayer1']
        }
      });
    });

    it('should return null when service not found and no basemap fallback', () => {
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

      mockConfigLookup.findGroup.mockReturnValue(mockGroup);
      mockConfigLookup.findLayer.mockReturnValue(mockLayer);
      mockConfigLookup.findService.mockReturnValue(undefined);

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

    it('should return minimal config with div when service has no URL', () => {
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

      mockConfigLookup.findGroup.mockReturnValue(mockGroup);
      mockConfigLookup.findLayer.mockReturnValue(mockLayer);
      mockConfigLookup.findService.mockReturnValue(mockService);

      const mockBasemapService = {
        id: 'basemapService',
        url: 'https://example.com/wms',
        type: 'WMS',
        parameters: {}
      };

      const mockBasemapLayer = {
        id: 'baselayer1',
        title: 'Base Layer',
        service: 'basemapService',
        layers: ['baselayer1']
      };

      const mockBasemapGroup = {
        id: 'background1',
        layers: ['baselayer1']
      };

      mockConfigLookup.findGroup
        .mockReturnValueOnce(mockGroup) // situation-map group
        .mockReturnValueOnce(mockBasemapGroup); // basemap group
      mockConfigLookup.findLayer
        .mockReturnValueOnce(mockLayer) // situation-map layer
        .mockReturnValueOnce(mockBasemapLayer); // basemap layer
      mockConfigLookup.findService
        .mockReturnValueOnce(mockService) // situation-map service (no URL)
        .mockReturnValueOnce(mockBasemapService); // basemap service

      const context: AppCfg = {
        ...mockAppCfg,
        application: {
          ...mockAppCfg.application,
          'situation-map': 'group1'
        },
        backgrounds: [
          { id: 'background1', title: 'Background 1', thumbnail: '' }
        ],
        groups: [mockGroup, mockBasemapGroup],
        layers: [mockLayer, mockBasemapLayer],
        services: [mockService, mockBasemapService]
      };

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        div: 'tc-slot-ovmap',
        layer: {
          id: 'Base Layer',
          title: 'Base Layer',
          url: 'https://example.com/wms',
          type: 'WMS',
          layerNames: ['baselayer1']
        }
      });
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

      mockConfigLookup.findGroup.mockReturnValue(mockGroup);
      mockConfigLookup.findLayer.mockReturnValue(mockLayer);
      mockConfigLookup.findService.mockReturnValue(mockService);

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
        expect(config['layer']).toEqual({
          id: 'My Test Layer',
          title: 'My Test Layer',
          url: 'https://example.com/wms',
          type: 'WMS',
          layerNames: ['layer1', 'layer2']
        });
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

      mockConfigLookup.findGroup.mockReturnValue(mockGroup);
      mockConfigLookup.findLayer.mockReturnValue(mockLayer);
      mockConfigLookup.findService.mockReturnValue(mockService);

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
        expect(config['layer']).toEqual({
          id: 'First Layer',
          title: 'First Layer',
          url: 'https://example.com/wms',
          type: 'WMS',
          layerNames: ['first-layer']
        });
      }
    });
  });
});
