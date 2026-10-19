import { readFileSync } from 'fs';
import path from 'path';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import type { AppCfg, AppTasks } from '@api/model/app-cfg';
import { TranslateModule } from '@ngx-translate/core';

import { FeatureInfoControlHandler } from './feature-info-control.handler';
import { AppConfigService } from '../../services/app-config.service';
import { SitnaApiService } from '../../services/sitna-api.service';

describe('FeatureInfoControlHandler', () => {
  let handler: FeatureInfoControlHandler;
  let mockSitnaApi: jest.Mocked<SitnaApiService>;
  let mockAppConfigService: jest.Mocked<AppConfigService>;

  beforeEach(() => {
    mockSitnaApi = {
      getTC: jest.fn(),
      getSITNA: jest.fn().mockReturnValue({} as any),
      getTCProperty: jest.fn(),
      isReady: jest.fn().mockReturnValue(true)
    } as Partial<jest.Mocked<SitnaApiService>> as jest.Mocked<SitnaApiService>;

    mockAppConfigService = {
      getControlDefault: jest.fn().mockReturnValue({
        displayElevation: true,
        persistentHighlights: true
      })
    } as Partial<
      jest.Mocked<AppConfigService>
    > as jest.Mocked<AppConfigService>;

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        FeatureInfoControlHandler,
        { provide: SitnaApiService, useValue: mockSitnaApi },
        { provide: AppConfigService, useValue: mockAppConfigService }
      ]
    });

    handler = TestBed.inject(FeatureInfoControlHandler);
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });

  describe('controlIdentifier', () => {
    it('should have correct control identifier', () => {
      expect(handler.controlIdentifier).toBe('sitna.featureInfo');
    });
  });

  describe('sitnaConfigKey', () => {
    it('should have correct SITNA config key', () => {
      expect(handler.sitnaConfigKey).toBe('featureInfo');
    });
  });

  describe('requiredPatches', () => {
    it('should have no required patches', () => {
      expect(handler.requiredPatches).toBeUndefined();
    });
  });

  describe('buildConfiguration()', () => {
    it('should return default configuration with displayElevation when parameters are empty', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.featureInfo',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        displayElevation: true,
        persistentHighlights: true
      });
      expect(mockAppConfigService.getControlDefault).toHaveBeenCalledWith(
        'sitna.featureInfo'
      );
    });

    it('should include displayElevation from default config', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.featureInfo',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).not.toBeNull();
      expect(config).toHaveProperty('displayElevation', true);
      expect(config).toHaveProperty('persistentHighlights', true);
    });

    it('should merge task parameters with defaults, preserving displayElevation', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.featureInfo',
        parameters: {
          active: true
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        displayElevation: true, // From default config
        persistentHighlights: true, // From default config
        active: true // From task parameters
      });
    });

    it('should allow task parameters to override displayElevation', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.featureInfo',
        parameters: {
          displayElevation: false
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        displayElevation: false, // Overridden by task parameters
        persistentHighlights: true // Kept from default config
      });
    });

    it('should handle displayElevation as object configuration', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.featureInfo',
        parameters: {
          displayElevation: {
            resolution: 20,
            sampleNumber: 10,
            services: ['elevationServiceIDENA']
          }
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        displayElevation: {
          resolution: 20,
          sampleNumber: 10,
          services: ['elevationServiceIDENA']
        },
        persistentHighlights: true // Kept from default config
      });
    });

    it('should return null when default config is not found and parameters are empty', () => {
      mockAppConfigService.getControlDefault.mockReturnValue(null);

      const task: AppTasks = {
        'ui-control': 'sitna.featureInfo',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({});
    });
  });

  describe('loadPatches() — GFI resilience (#155)', () => {
    let TC: any;
    let SITNA: any;

    beforeEach(() => {
      // Build mock TC and SITNA with prototypes that can be wrapped by meld
      TC = {
        Map: { prototype: {} },
        control: {
          FeatureInfo: { prototype: {} }
        },
        layer: {
          Raster: {
            prototype: {
              describeLayer: jest.fn()
            }
          }
        },
        wrap: {
          layer: {
            Raster: {
              prototype: {
                getInfo: jest.fn().mockReturnValue({ queryable: true, title: 'L' })
              }
            }
          }
        },
        tool: {
          Proxification: {
            prototype: {
              fetch: jest.fn()
            }
          }
        }
      };

      SITNA = {
        layer: {
          Raster: {
            prototype: TC.layer.Raster.prototype
          }
        }
      };

      mockSitnaApi.getTC.mockReturnValue(TC);
      mockSitnaApi.getSITNA.mockReturnValue(SITNA);
    });

    it('getInfo returns queryable false when parent.options.sitmunGfiEnabled is false', async () => {
      const wrapProto = TC.wrap.layer.Raster.prototype;
      wrapProto.getInfo.mockReturnValue({ queryable: true, title: 'L' });

      await handler.loadPatches({} as AppCfg);

      const wrap = Object.create(wrapProto);
      wrap.parent = { options: { sitmunGfiEnabled: false } };
      expect(wrap.getInfo('layer-a')).toEqual({
        queryable: false,
        title: 'L'
      });
    });

    it('getInfo keeps capabilities queryable when sitmunGfiEnabled is not false', async () => {
      const wrapProto = TC.wrap.layer.Raster.prototype;
      wrapProto.getInfo.mockReturnValue({ queryable: true, title: 'L' });

      await handler.loadPatches({} as AppCfg);

      const wrap = Object.create(wrapProto);
      wrap.parent = { options: { sitmunGfiEnabled: true } };
      expect(wrap.getInfo('layer-a')).toEqual({
        queryable: true,
        title: 'L'
      });
    });

    it('should wrap Raster.describeLayer to resolve with WMS fallback when full=true and rejection occurs', async () => {
      // Arrange: describeLayer rejects (simulates Catastro ServiceException)
      TC.layer.Raster.prototype.describeLayer.mockRejectedValue(
        new Error('Petición REQUEST no soportada')
      );

      // Act: loadPatches installs meld.around wrapper
      await handler.loadPatches({} as AppCfg);

      // Assert: wrapped describeLayer resolves with layerName for getLegend (#164)
      const layer = Object.create(TC.layer.Raster.prototype);
      layer.availableNames = ['CAE1M_141A'];
      const result = await layer.describeLayer(true);
      expect(result).toEqual([{ owsType: 'WMS', layerName: 'CAE1M_141A' }]);
    });

    it('should wrap Raster.describeLayer to resolve with WMS fallback when full=false and rejection occurs', async () => {
      // Arrange
      TC.layer.Raster.prototype.describeLayer.mockRejectedValue(
        new Error('Petición REQUEST no soportada')
      );

      // Act
      await handler.loadPatches({} as AppCfg);

      // Assert
      const layer = Object.create(TC.layer.Raster.prototype);
      layer.availableNames = ['L1', 'L2'];
      const result = await layer.describeLayer(false);
      expect(result).toEqual({ owsType: 'WMS', layerName: 'L1' });
    });

    it('should wrap Proxification.fetch to resolve with empty JSON when GFI request fails', async () => {
      // Arrange: fetch rejects on GFI URL
      const gfiUrl =
        'http://example.com/wms?SERVICE=WMS&REQUEST=GetFeatureInfo&INFO_FORMAT=application/json';
      TC.tool.Proxification.prototype.fetch.mockImplementation((url: string) => {
        if (url.includes('REQUEST=GetFeatureInfo')) {
          return Promise.reject(new Error('HTTP 500'));
        }
        return Promise.resolve({ responseText: 'ok', contentType: 'text/plain' });
      });

      // Act
      await handler.loadPatches({} as AppCfg);

      // Assert: wrapped fetch resolves with empty FeatureCollection
      const result = await TC.tool.Proxification.prototype.fetch(gfiUrl);
      expect(result).toEqual({
        responseText: '{"type":"FeatureCollection","features":[]}',
        contentType: 'application/json'
      });
    });

    it('should wrap Proxification.fetch to resolve with empty GML when GFI request with GML format fails', async () => {
      // Arrange
      const gfiUrl =
        'http://example.com/wms?SERVICE=WMS&REQUEST=GetFeatureInfo&INFO_FORMAT=application/vnd.ogc.gml';
      TC.tool.Proxification.prototype.fetch.mockImplementation((url: string) => {
        if (url.includes('REQUEST=GetFeatureInfo')) {
          return Promise.reject(new Error('HTTP 500'));
        }
        return Promise.resolve({ responseText: 'ok', contentType: 'text/plain' });
      });

      // Act
      await handler.loadPatches({} as AppCfg);

      // Assert
      const result = await TC.tool.Proxification.prototype.fetch(gfiUrl);
      expect(result).toEqual({
        responseText:
          '<?xml version="1.0"?><wfs:FeatureCollection xmlns:wfs="http://www.opengis.net/wfs"/>',
        contentType: 'application/vnd.ogc.gml'
      });
    });

    it('should NOT wrap non-GFI Proxification.fetch rejections (regression guard)', async () => {
      // Arrange: fetch rejects on GetMap (not GetFeatureInfo)
      const getMapUrl =
        'http://example.com/wms?SERVICE=WMS&REQUEST=GetMap';
      TC.tool.Proxification.prototype.fetch.mockImplementation((_url: string) => {
        return Promise.reject(new Error('HTTP 500'));
      });

      // Act
      await handler.loadPatches({} as AppCfg);

      // Assert: non-GFI rejection still propagates
      await expect(
        TC.tool.Proxification.prototype.fetch(getMapUrl)
      ).rejects.toThrow('HTTP 500');
    });

    it('restores all meld-wrapped prototypes and guard markers on cleanup', async () => {
      TC.Map.prototype.addControl = jest.fn();
      TC.control.FeatureInfo.prototype.register = jest.fn();
      TC.control.FeatureInfo.prototype.responseCallback = jest.fn();
      TC.control.FeatureInfo.prototype.displayResultsCallback = jest.fn();

      const originalAddControl = TC.Map.prototype.addControl;
      const originalRegister = TC.control.FeatureInfo.prototype.register;
      const originalResponseCallback =
        TC.control.FeatureInfo.prototype.responseCallback;
      const originalDisplayResultsCallback =
        TC.control.FeatureInfo.prototype.displayResultsCallback;
      const originalDescribeLayer = TC.layer.Raster.prototype.describeLayer;
      const originalGetInfo = TC.wrap.layer.Raster.prototype.getInfo;
      const originalFetch = TC.tool.Proxification.prototype.fetch;

      await handler.loadPatches({} as AppCfg);

      expect(TC.Map.prototype.addControl).not.toBe(originalAddControl);
      expect(TC.control.FeatureInfo.prototype.register).not.toBe(
        originalRegister
      );
      expect(TC.control.FeatureInfo.prototype.responseCallback).not.toBe(
        originalResponseCallback
      );
      expect(TC.control.FeatureInfo.prototype.displayResultsCallback).not.toBe(
        originalDisplayResultsCallback
      );
      expect(TC.layer.Raster.prototype.describeLayer).not.toBe(
        originalDescribeLayer
      );
      expect(TC.wrap.layer.Raster.prototype.getInfo).not.toBe(originalGetInfo);
      expect(TC.tool.Proxification.prototype.fetch).not.toBe(originalFetch);

      handler.cleanup();

      expect(TC.Map.prototype.addControl).toBe(originalAddControl);
      expect(TC.control.FeatureInfo.prototype.register).toBe(originalRegister);
      expect(TC.control.FeatureInfo.prototype.responseCallback).toBe(
        originalResponseCallback
      );
      expect(TC.control.FeatureInfo.prototype.displayResultsCallback).toBe(
        originalDisplayResultsCallback
      );
      expect(TC.layer.Raster.prototype.describeLayer).toBe(
        originalDescribeLayer
      );
      expect(TC.wrap.layer.Raster.prototype.getInfo).toBe(originalGetInfo);
      expect(TC.tool.Proxification.prototype.fetch).toBe(originalFetch);
      expect(TC.Map.prototype.__sitmunFiAddControl).toBeUndefined();
      expect(TC.control.FeatureInfo.prototype.__sitmunFiRegister).toBeUndefined();
      expect(TC.control.FeatureInfo.prototype.__sitmunMoreInfo).toBeUndefined();
      expect(
        TC.control.FeatureInfo.prototype.__sitmunMoreInfoDisplayResults
      ).toBeUndefined();
      expect(TC.layer.Raster.prototype.__sitmunDescribeLayerSafe).toBeUndefined();
      expect(TC.wrap.layer.Raster.prototype.__sitmunGfiUserGate).toBeUndefined();
      expect(TC.tool.Proxification.prototype.__sitmunGfiIsolation).toBeUndefined();
    });

    it('replaces the WFS popup table when featureInfoFields is non-empty', async () => {
      class Feature {
        data: Record<string, unknown> = { name: 'A', gid: 1 };
        layer: unknown;
        infoControl?: { getContainerElement: () => HTMLElement };
        async showInfo(): Promise<void> {
          const table = document.createElement('table');
          const body = document.createElement('tbody');
          const tr = document.createElement('tr');
          const th = document.createElement('th');
          th.textContent = 'gid';
          const td = document.createElement('td');
          td.textContent = '1';
          tr.append(th, td);
          body.append(tr);
          table.append(body);
          const div = document.createElement('div');
          div.append(table);
          this.infoControl = { getContainerElement: () => div };
        }
      }
      TC.feature = { Feature };
      await handler.loadPatches({
        layers: [
          {
            id: 'layer/1',
            title: 'Parcels',
            layers: ['parcels'],
            service: 'service/1',
            featureInfoFields: [
              { name: 'name', label: 'Name', format: 'T', order: 0 }
            ]
          }
        ],
        trees: [
          {
            id: 'tree/1',
            title: 'Tree',
            image: null,
            rootNode: 'n',
            nodes: {
              n: { title: 'Parcels', resource: 'layer/1', children: [] }
            }
          }
        ]
      } as AppCfg);

      const feature = new Feature();
      feature.layer = {
        type: 'WFS',
        featureType: 'parcels',
        options: { type: 'WFS', nodeId: 'n' }
      };
      const original = { ...feature.data };
      await feature.showInfo();

      const headers = Array.from(
        feature.infoControl!.getContainerElement().querySelectorAll('th')
      ).map((cell) => cell.textContent);
      expect(headers).toEqual(['Name']);
      expect(feature.data).toEqual(original);
    });

    it('leaves the SITNA table when featureInfoFields is empty', async () => {
      class Feature {
        data: Record<string, unknown> = { name: 'A', gid: 1 };
        layer: unknown;
        infoControl?: { getContainerElement: () => HTMLElement };
        async showInfo(): Promise<void> {
          const table = document.createElement('table');
          const body = document.createElement('tbody');
          const tr = document.createElement('tr');
          const th = document.createElement('th');
          th.textContent = 'gid';
          const td = document.createElement('td');
          td.textContent = '1';
          tr.append(th, td);
          body.append(tr);
          table.append(body);
          const div = document.createElement('div');
          div.append(table);
          this.infoControl = { getContainerElement: () => div };
        }
      }
      TC.feature = { Feature };
      await handler.loadPatches({
        layers: [
          {
            id: 'layer/1',
            title: 'Parcels',
            layers: ['parcels'],
            service: 'service/1',
            featureInfoFields: []
          }
        ],
        trees: [
          {
            id: 'tree/1',
            title: 'Tree',
            image: null,
            rootNode: 'n',
            nodes: {
              n: { title: 'Parcels', resource: 'layer/1', children: [] }
            }
          }
        ]
      } as unknown as AppCfg);

      const feature = new Feature();
      feature.layer = {
        type: 'WFS',
        featureType: 'parcels',
        options: { type: 'WFS', nodeId: 'n' }
      };
      await feature.showInfo();

      const headers = Array.from(
        feature.infoControl!.getContainerElement().querySelectorAll('th')
      ).map((cell) => cell.textContent);
      expect(headers).toEqual(['gid']);
    });

    it('sets showsPopup on FEATURESADD so Click._trigger skips GetFeatureInfo', async () => {
      const listeners: Record<string, Array<(event: unknown) => void>> = {};
      TC.Consts = {
        event: { FEATURESADD: 'featuresadd.tc', CLICK: 'click.tc' },
        view: { PRINTING: 2 }
      };
      TC.control.FeatureInfo.prototype.register = function () {
        return undefined;
      };
      await handler.loadPatches({} as AppCfg);

      const feature = { showsPopup: false };
      const layer = {
        type: 'WFS',
        options: { sitmunGfiEnabled: true },
        features: [feature]
      };
      const gfi = jest.fn();
      const map = {
        view: 0,
        on: (event: string, fn: (event: unknown) => void) => {
          (listeners[event] ??= []).push(fn);
        },
        off: jest.fn(),
        options: {},
        trigger: jest.fn(),
        wrap: {
          map: {
            forEachFeatureAtPixel: (
              _pixel: unknown,
              callback: (olFeature: unknown, olLayer: unknown) => void
            ) => {
              callback({ _wrap: { parent: feature } }, null);
            }
          }
        }
      };
      const control = Object.create(TC.control.FeatureInfo.prototype) as {
        register: (map: unknown) => void;
      };
      control.register(map);
      expect(listeners['featuresadd.tc']?.length).toBeGreaterThan(0);
      listeners['featuresadd.tc'][0]({ layer, features: [feature] });
      expect(feature.showsPopup).toBe(true);

      const click = {
        parent: {
          map,
          callback: gfi
        }
      };
      const trigger = sitnaClickTrigger(click, map);
      expect(trigger({ pixel: [1, 1], coordinate: [0, 0] })).toBe(false);
      expect(gfi).not.toHaveBeenCalled();
    });

    it('should be idempotent when loadPatches is called twice', async () => {
      // Arrange
      TC.layer.Raster.prototype.describeLayer.mockRejectedValue(
        new Error('ServiceException')
      );

      // Act: call loadPatches twice
      await handler.loadPatches({} as AppCfg);
      await handler.loadPatches({} as AppCfg);

      // Assert: still works correctly (no double-wrap)
      const result = await TC.layer.Raster.prototype.describeLayer(true);
      expect(result).toEqual([{ owsType: 'WMS', layerName: '' }]);
    });
  });
});

function sitnaClickTrigger(
  self: {
    parent: {
      map: { trigger: (name: string, payload: unknown) => void };
      callback: (coordinate: unknown, pixel: unknown) => void;
    };
  },
  map: unknown
): (event: { pixel: unknown; coordinate: unknown }) => boolean {
  const source = readFileSync(
    path.join(process.cwd(), 'node_modules/api-sitna/TC/ol/ol.js'),
    'utf8'
  );
  const assign = source.indexOf(
    'TC.wrap.control.Click.prototype.register = function (map) {'
  );
  const triggerAssign = source.indexOf('self._trigger = function (e) {', assign);
  const ret = source.indexOf('return featureCount === 0;', triggerAssign);
  const close = source.indexOf('};', ret);
  const body = source.slice(triggerAssign, close + 2);
  const factory = new Function(
    'self',
    'map',
    'Consts',
    'hitTolerance',
    `${body}\nreturn self._trigger;`
  ) as (
    self: unknown,
    map: unknown,
    consts: { view: { PRINTING: number }; event: { CLICK: string } },
    hitTolerance: number
  ) => (event: { pixel: unknown; coordinate: unknown }) => boolean;
  return factory(
    self,
    map,
    { view: { PRINTING: 2 }, event: { CLICK: 'click.tc' } },
    0
  );
}
