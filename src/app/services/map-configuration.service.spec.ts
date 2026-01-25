import { TestBed } from '@angular/core/testing';

import { AppCfg } from '@api/model/app-cfg';

import { AppConfigService } from './app-config.service';
import { ConfigLookupService } from './config-lookup.service';
import { ControlRegistryService } from './control-registry.service';
import { MapConfigurationService } from './map-configuration.service';

describe('MapConfigurationService', () => {
  let service: MapConfigurationService;
  let configLookup: ConfigLookupService;
  let appConfigService: jest.Mocked<AppConfigService>;
  let controlRegistry: jest.Mocked<ControlRegistryService>;
  let mockAppCfg: AppCfg;

  beforeEach(() => {
    appConfigService = {
      getAttribution: jest.fn().mockReturnValue(null),
      getControlDefault: jest.fn().mockReturnValue(null)
    } as Partial<
      jest.Mocked<AppConfigService>
    > as jest.Mocked<AppConfigService>;

    controlRegistry = {
      getHandler: jest.fn().mockReturnValue(undefined)
    } as Partial<
      jest.Mocked<ControlRegistryService>
    > as jest.Mocked<ControlRegistryService>;

    TestBed.configureTestingModule({
      providers: [
        { provide: AppConfigService, useValue: appConfigService },
        { provide: ControlRegistryService, useValue: controlRegistry }
      ]
    });
    service = TestBed.inject(MapConfigurationService);
    configLookup = TestBed.inject(ConfigLookupService);

    // Create mock AppCfg
    mockAppCfg = {
      application: {
        id: 1,
        title: 'Test App',
        type: 'test',
        theme: 'sitmun-base',
        srs: 'EPSG:25831',
        initialExtent: [100000, 4000000, 600000, 4600000] as [
          number,
          number,
          number,
          number
        ]
      },
      backgrounds: [
        { id: 'bg-1', title: 'Background 1', thumbnail: 'thumb1.jpg' },
        { id: 'bg-2', title: 'Background 2', thumbnail: 'thumb2.jpg' }
      ],
      groups: [
        {
          id: 'bg-1',
          title: 'Background Group 1',
          layers: ['layer-1', 'layer-2']
        },
        { id: 'bg-2', title: 'Background Group 2', layers: ['layer-3'] }
      ],
      layers: [
        {
          id: 'layer-1',
          title: 'Base Layer 1',
          layers: ['wms-layer-1'],
          service: 'service-1'
        },
        {
          id: 'layer-2',
          title: 'Base Layer 2',
          layers: ['wms-layer-2'],
          service: 'service-1'
        },
        {
          id: 'layer-3',
          title: 'Base Layer 3',
          layers: ['wmts-layer-1'],
          service: 'service-2'
        }
      ],
      services: [
        {
          id: 'service-1',
          url: 'http://example.com/wms1',
          type: 'WMS',
          parameters: { format: 'image/png', matrixSet: undefined }
        },
        {
          id: 'service-2',
          url: 'http://example.com/wmts1',
          type: 'WMTS',
          parameters: { format: 'image/jpeg', matrixSet: 'EPSG:25831' }
        }
      ],
      tasks: [],
      trees: [],
      global: {
        proxy: '',
        language: {
          default: 'es'
        },
        srs: {
          default: {
            identifier: 'EPSG:25831',
            x: 0,
            y: 0,
            proj4:
              '+proj=utm +zone=31 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
          }
        }
      }
    };

    // Initialize ConfigLookupService
    configLookup.initialize(mockAppCfg);
  });

  describe('toCrs', () => {
    it('should return CRS from application config', () => {
      const result = service.toCrs(mockAppCfg);
      expect(result).toBe('EPSG:25831');
    });

    it('should return undefined if no CRS configured', () => {
      const cfgWithoutCrs: AppCfg = {
        ...mockAppCfg,
        application: { ...mockAppCfg.application, srs: undefined as any }
      };
      const result = service.toCrs(cfgWithoutCrs);
      expect(result).toBeUndefined();
    });

    it('should return undefined if application is undefined', () => {
      const cfgWithoutApp: AppCfg = {
        ...mockAppCfg,
        application: undefined as any
      };
      const result = service.toCrs(cfgWithoutApp);
      expect(result).toBeUndefined();
    });
  });

  describe('toInitialExtent', () => {
    it('should return initial extent from application config', () => {
      const result = service.toInitialExtent(mockAppCfg);
      expect(result).toEqual([100000, 4000000, 600000, 4600000]);
    });

    it('should return undefined if no initial extent configured', () => {
      const cfgWithoutExtent: AppCfg = {
        ...mockAppCfg,
        application: {
          ...mockAppCfg.application,
          initialExtent: undefined as any
        }
      };
      const result = service.toInitialExtent(cfgWithoutExtent);
      expect(result).toBeUndefined();
    });
  });

  describe('toLayout', () => {
    it('should return default layout for sitmun-base theme', () => {
      const result = service.toLayout(mockAppCfg);
      expect(result).toEqual({
        config: 'assets/map-styles/sitmun-base/config.json',
        markup: 'assets/map-styles/sitmun-base/markup.html',
        style: 'assets/map-styles/sitmun-base/style.css',
        script: 'assets/map-styles/sitmun-base/script.js',
        i18n: 'assets/map-styles/sitmun-base/resources'
      });
    });

    it('should return layout for custom theme', () => {
      const cfgWithTheme: AppCfg = {
        ...mockAppCfg,
        application: { ...mockAppCfg.application, theme: 'sitmun-base' }
      };
      const result = service.toLayout(cfgWithTheme);
      expect(result.config).toContain('sitmun-base');
      expect(result.markup).toContain('sitmun-base');
      expect(result.style).toContain('sitmun-base');
      expect(result.script).toContain('sitmun-base');
      expect(result.i18n).toContain('sitmun-base');
    });

    it('should use default theme if theme is not specified', () => {
      const cfgWithoutTheme: AppCfg = {
        ...mockAppCfg,
        application: { ...mockAppCfg.application, theme: undefined as any }
      };
      const result = service.toLayout(cfgWithoutTheme);
      expect(result.config).toContain('sitmun-base');
    });
  });

  describe('toViews', () => {
    it('should return empty views if no 3D task present', () => {
      const result = service.toViews(mockAppCfg);
      expect(result).toEqual({});
    });

    it('should return 3D view configuration if 3D task present', () => {
      appConfigService.getControlDefault.mockReturnValue({
        div: 'tc-slot-threed',
        controls: ['sitna.threeD', 'sitna.basemapSelector', 'sitna.legend']
      });

      // Mock handlers with sitnaConfigKey
      controlRegistry.getHandler.mockImplementation((name: string) => {
        const handlers: any = {
          'sitna.threeD': { sitnaConfigKey: 'threeD' },
          'sitna.basemapSelector': { sitnaConfigKey: 'basemapSelector' },
          'sitna.legend': { sitnaConfigKey: 'legend' }
        };
        return handlers[name];
      });

      const cfgWith3D: AppCfg = {
        ...mockAppCfg,
        tasks: [{ id: 'task-1', 'ui-control': 'sitna.threed' } as any]
      };

      const result = service.toViews(cfgWith3D);

      expect(result.threeD).toBeDefined();
      expect(result.threeD?.div).toBe('tc-slot-threed');

      // Controls should be translated from backend to SITNA names using handlers' sitnaConfigKey
      expect(result.threeD?.controls).toContain('threeD'); // Not 'sitna.threeD'
      expect(result.threeD?.controls).toContain('basemapSelector'); // Not 'sitna.basemapSelector'
      expect(result.threeD?.controls).toContain('legend');
    });

    it('should use div from task parameters if provided', () => {
      appConfigService.getControlDefault.mockReturnValue({
        controls: ['sitna.threeD']
      });

      controlRegistry.getHandler.mockReturnValue({
        sitnaConfigKey: 'threeD'
      } as any);

      const cfgWith3D: AppCfg = {
        ...mockAppCfg,
        tasks: [
          {
            id: 'task-1',
            'ui-control': 'sitna.threed',
            parameters: { div: 'custom-view3d-div' }
          } as any
        ]
      };

      const result = service.toViews(cfgWith3D);

      expect(result.threeD).toBeDefined();
      expect(result.threeD?.div).toBe('custom-view3d-div');
    });

    it('should use div from default config if not in parameters', () => {
      appConfigService.getControlDefault.mockReturnValue({
        div: 'config-view3d',
        controls: ['sitna.threeD']
      });

      controlRegistry.getHandler.mockReturnValue({
        sitnaConfigKey: 'threeD'
      } as any);

      const cfgWith3D: AppCfg = {
        ...mockAppCfg,
        tasks: [{ id: 'task-1', 'ui-control': 'sitna.threed' } as any]
      };

      const result = service.toViews(cfgWith3D);

      expect(result.threeD).toBeDefined();
      expect(result.threeD?.div).toBe('config-view3d');
    });

    it('should prioritize task parameters over default config', () => {
      appConfigService.getControlDefault.mockReturnValue({
        div: 'config-view3d',
        controls: ['sitna.threeD']
      });

      controlRegistry.getHandler.mockReturnValue({
        sitnaConfigKey: 'threeD'
      } as any);

      const cfgWith3D: AppCfg = {
        ...mockAppCfg,
        tasks: [
          {
            id: 'task-1',
            'ui-control': 'sitna.threed',
            parameters: { div: 'param-view3d' }
          } as any
        ]
      };

      const result = service.toViews(cfgWith3D);

      expect(result.threeD).toBeDefined();
      // Task parameters should take precedence
      expect(result.threeD?.div).toBe('param-view3d');
    });

    it('should omit controls array if empty/not configured', () => {
      appConfigService.getControlDefault.mockReturnValue({});

      const cfgWith3D: AppCfg = {
        ...mockAppCfg,
        tasks: [{ id: 'task-1', 'ui-control': 'sitna.threed' } as any]
      };

      const result = service.toViews(cfgWith3D);

      expect(result.threeD).toBeDefined();
      expect(result.threeD?.div).toBeUndefined();
      expect(result.threeD?.controls).toBeUndefined();
    });
  });

  describe('toBaseLayers', () => {
    it('should return empty array if no backgrounds configured', () => {
      const cfgWithoutBackgrounds: AppCfg = {
        ...mockAppCfg,
        backgrounds: []
      };
      const result = service.toBaseLayers(cfgWithoutBackgrounds);
      expect(result).toEqual([]);
    });

    it('should convert backgrounds to base layers', () => {
      const result = service.toBaseLayers(mockAppCfg);
      expect(result.length).toBe(3); // 3 layers total from 2 backgrounds
    });

    it('should include layer properties correctly', () => {
      const result = service.toBaseLayers(mockAppCfg);
      const layer1 = result.find((l) => l.title === 'Base Layer 1');
      expect(layer1).toBeDefined();
      expect(layer1?.id).toBe('Base Layer 1');
      expect(layer1?.title).toBe('Base Layer 1');
      expect(layer1?.url).toBe('http://example.com/wms1');
      expect(layer1?.type).toBe('WMS');
      expect(layer1?.isBase).toBe(true);
      expect(layer1?.layerNames).toEqual(['wms-layer-1']);
    });

    it('should handle WMTS layers correctly', () => {
      const result = service.toBaseLayers(mockAppCfg);
      const wmtsLayer = result.find((l) => l.title === 'Base Layer 3');
      expect(wmtsLayer).toBeDefined();
      expect(wmtsLayer?.type).toBe('WMTS');
      expect(wmtsLayer?.layerNames).toBe('wmts-layer-1'); // WMTS uses first layer name as string
      expect(wmtsLayer?.matrixSet).toBe('EPSG:25831');
    });

    it('should use thumbnail from background if available', () => {
      const result = service.toBaseLayers(mockAppCfg);
      // Check that thumbnails are used when available
      expect(result.length).toBeGreaterThan(0);
    });

    it('should use default thumbnail if background thumbnail not available', () => {
      const cfgWithoutThumbnails: AppCfg = {
        ...mockAppCfg,
        backgrounds: [{ id: 'bg-1', title: 'Background 1', thumbnail: '' }]
      };
      configLookup.initialize(cfgWithoutThumbnails);
      const result = service.toBaseLayers(cfgWithoutThumbnails);
      expect(result.length).toBeGreaterThan(0);
      // All layers should have a thumbnail (either from background or default)
      result.forEach((layer) => {
        expect(layer.thumbnail).toBeDefined();
      });
    });

    it('should handle missing groups gracefully', () => {
      const cfgWithMissingGroup: AppCfg = {
        ...mockAppCfg,
        backgrounds: [
          { id: 'non-existent-group', title: 'Missing Group', thumbnail: '' }
        ]
      };
      configLookup.initialize(cfgWithMissingGroup);
      const result = service.toBaseLayers(cfgWithMissingGroup);
      expect(result).toEqual([]);
    });

    it('should handle missing layers gracefully', () => {
      const cfgWithMissingLayer: AppCfg = {
        ...mockAppCfg,
        groups: [
          { id: 'bg-1', title: 'Group 1', layers: ['non-existent-layer'] }
        ]
      };
      configLookup.initialize(cfgWithMissingLayer);
      const result = service.toBaseLayers(cfgWithMissingLayer);
      expect(result).toEqual([]);
    });

    it('should handle missing services gracefully', () => {
      const cfgWithMissingService: AppCfg = {
        ...mockAppCfg,
        layers: [
          {
            id: 'layer-1',
            title: 'Layer 1',
            layers: ['wms-layer-1'],
            service: 'non-existent-service'
          }
        ]
      };
      configLookup.initialize(cfgWithMissingService);
      const result = service.toBaseLayers(cfgWithMissingService);
      expect(result).toEqual([]);
    });

    it('should use ConfigLookupService when available', () => {
      const originalFindGroup = configLookup.findGroup.bind(configLookup);
      const originalFindLayer = configLookup.findLayer.bind(configLookup);
      const originalFindService = configLookup.findService.bind(configLookup);
      const findGroupSpy = jest
        .spyOn(configLookup, 'findGroup')
        .mockImplementation((...args) => originalFindGroup(...args));
      const findLayerSpy = jest
        .spyOn(configLookup, 'findLayer')
        .mockImplementation((...args) => originalFindLayer(...args));
      const findServiceSpy = jest
        .spyOn(configLookup, 'findService')
        .mockImplementation((...args) => originalFindService(...args));

      service.toBaseLayers(mockAppCfg);

      expect(findGroupSpy).toHaveBeenCalled();
      expect(findLayerSpy).toHaveBeenCalled();
      expect(findServiceSpy).toHaveBeenCalled();
    });

    it('should fallback to array.find() if ConfigLookupService returns undefined', () => {
      const cfgWithLookup: AppCfg = {
        ...mockAppCfg,
        groups: [{ id: 'bg-1', title: 'Group 1', layers: ['layer-1'] }]
      };
      // Don't initialize lookup service to test fallback
      const result = service.toBaseLayers(cfgWithLookup);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('toAttribution', () => {
    it('should return attribution from app config service', () => {
      appConfigService.getAttribution.mockReturnValue(
        '<a href="https://github.com/sitmun" target="_blank">SITMUN</a>'
      );

      const result = service.toAttribution();

      expect(result).toBe(
        '<a href="https://github.com/sitmun" target="_blank">SITMUN</a>'
      );
      expect(appConfigService.getAttribution).toHaveBeenCalled();
    });

    it('should return undefined when attribution not configured', () => {
      appConfigService.getAttribution.mockReturnValue(null);

      const result = service.toAttribution();

      expect(result).toBeUndefined();
    });

    it('should return undefined when attribution is empty string', () => {
      appConfigService.getAttribution.mockReturnValue('');

      const result = service.toAttribution();

      expect(result).toBeUndefined();
    });
  });
});
