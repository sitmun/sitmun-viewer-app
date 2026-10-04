import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { ShareControlHandler } from './share-control.handler';
import { decodeMapState, encodeMapState } from '../../map/map-view-snapshot';
import { AppConfigService } from '../../services/app-config.service';
import { SitnaApiService } from '../../services/sitna-api.service';

describe('ShareControlHandler', () => {
  let handler: ShareControlHandler;
  let mockSitnaApi: jest.Mocked<SitnaApiService>;
  let mockAppConfigService: jest.Mocked<AppConfigService>;
  let mockAppCfg: AppCfg;

  beforeEach(() => {
    mockSitnaApi = {
      getTC: jest.fn(),
      getSITNA: jest.fn().mockReturnValue({} as any),
      getTCProperty: jest.fn(),
      isReady: jest.fn().mockReturnValue(true)
    } as Partial<jest.Mocked<SitnaApiService>> as jest.Mocked<SitnaApiService>;

    mockAppConfigService = {
      getControlDefault: jest.fn()
    } as Partial<
      jest.Mocked<AppConfigService>
    > as jest.Mocked<AppConfigService>;
    mockAppConfigService.getControlDefault.mockReturnValue(null);

    TestBed.configureTestingModule({
            providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ShareControlHandler,
        { provide: SitnaApiService, useValue: mockSitnaApi },
        { provide: AppConfigService, useValue: mockAppConfigService }
      ]
    });

    handler = TestBed.inject(ShareControlHandler);

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
      expect(handler.controlIdentifier).toBe('sitna.share');
    });
  });

  describe('sitnaConfigKey', () => {
    it('should have correct sitna config key', () => {
      expect(handler.sitnaConfigKey).toBe('share');
    });
  });

  describe('requiredPatches', () => {
    it('should have no required patches', () => {
      expect(handler.requiredPatches).toBeUndefined();
    });
  });

  describe('buildConfiguration()', () => {
    it('should return configuration with default div when available', () => {
      mockAppConfigService.getControlDefault.mockReturnValue({
        div: 'share'
      });

      const task: AppTasks = {
        'ui-control': 'sitna.share',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config?.div).toBe('share');
    });

    it('should return empty config when no default div configured', () => {
      mockAppConfigService.getControlDefault.mockReturnValue(null);

      const task: AppTasks = {
        'ui-control': 'sitna.share',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config).toEqual({});
    });

    it('should merge task parameters', () => {
      mockAppConfigService.getControlDefault.mockReturnValue({
        div: 'share'
      });

      const task: AppTasks = {
        'ui-control': 'sitna.share',
        parameters: {
          div: 'custom-share-div',
          customOption: 'value'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config?.div).toBe('custom-share-div');
      expect(config?.['customOption']).toBe('value');
    });

    it('should allow parameters to override default div', () => {
      mockAppConfigService.getControlDefault.mockReturnValue({
        div: 'share'
      });

      const task: AppTasks = {
        'ui-control': 'sitna.share',
        parameters: {
          div: 'overridden-share-div'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.div).toBe('overridden-share-div');
    });
  });

  describe('mapState link', () => {
    it('keeps the current route and does not call TinyURL', async () => {
      const proto: {
        generateLink?: (this: unknown) => Promise<string>;
        __sitmunMapStateLink?: boolean;
      } = {};
      mockSitnaApi.getTC.mockReturnValue({
        control: { MapInfo: { prototype: proto } }
      } as never);
      await handler.loadPatches({
        ...mockAppCfg,
        layers: [
          {
            id: '10',
            title: 'Topo',
            layers: [],
            service: 's'
          }
        ]
      });

      const url = await proto.generateLink!.call({
        map: {
          getExtent: () => [1, 2, 3, 4],
          baseLayer: { id: 'Topo' },
          options: { defaultBaseLayer: 'Topo' },
          workLayers: []
        },
        manageMaxLengthExceed: jest.fn()
      });

      expect(url).not.toContain('tinyurl.com');
      const token = new URL(url).searchParams.get('mapState');
      expect(decodeMapState(token ?? '')).toEqual({ ext: [1, 2, 3, 4] });
    });

    it('toasts a map-language message and hides the backend detail', async () => {
      const proto: {
        shortenedLink?: (this: unknown) => Promise<string>;
        __sitmunMapStateLink?: boolean;
      } = {};
      mockSitnaApi.getTC.mockReturnValue({
        control: { MapInfo: { prototype: proto } },
        Consts: { msgType: { ERROR: 'error' } }
      } as never);
      await handler.loadPatches(mockAppCfg);
      const toast = jest.fn();
      const fetchMock = jest.fn().mockResolvedValue({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        json: async () => ({
          detail: 'connect to tinyurl.example failed'
        })
      });
      const originalFetch = global.fetch;
      global.fetch = fetchMock as unknown as typeof fetch;

      try {
        await expect(
          proto.shortenedLink!.call({
            generateLink: async () => 'http://lvh.me:4200/public/map/12/4',
            getLocaleString: (key: string) =>
              key === 'shortUrlFailed'
                ? 'The map link could not be shortened.'
                : key,
            map: { toast }
          })
        ).rejects.toThrow('The map link could not be shortened.');
      } finally {
        global.fetch = originalFetch;
      }

      expect(toast).toHaveBeenCalledWith(
        'The map link could not be shortened.',
        { type: 'error' }
      );
    });

    it('stores a drawing and a feature share, then puts both back', async () => {
      await handler.loadPatches(mockAppCfg);
      const drawing = { id: 'draw', layer: { features: ['line'] } };
      const feature = { id: 'search', queryResult: '{"id":"55053"}' };
      const importControlStates = jest.fn();
      const ensureLayers = jest.fn().mockResolvedValue(undefined);
      const snapshot = handler.capture({
        includeControls: false,
        generateLink: async () => '',
        caller: { exportState: () => feature },
        map: {
          getExtent: () => [1, 2, 3, 4],
          workLayers: [],
          controls: [
            { exportState: () => drawing },
            { exportState: () => ({ id: 'share' }) }
          ]
        }
      });

      expect(snapshot.draw).toEqual([drawing]);
      expect(snapshot.feature).toEqual(feature);

      const restored = await handler.restore(
        {
          workLayers: [],
          importControlStates,
          controls: []
        },
        encodeMapState({
          ...snapshot,
          layers: [{ id: '9', visible: true }]
        }),
        ensureLayers
      );

      expect(restored).toBe(true);
      expect(ensureLayers).toHaveBeenCalledWith(['9']);
      expect(importControlStates).toHaveBeenNthCalledWith(1, [drawing]);
      expect(importControlStates).toHaveBeenNthCalledWith(2, [feature]);
    });

    it('keeps an imported file and still restores when a layer or file is missing', async () => {
      await handler.loadPatches({
        ...mockAppCfg,
        trees: [
          {
            nodes: {
              one: { loadByDefault: true, resource: '1' }
            }
          }
        ]
      } as AppCfg);
      const file = { id: 'file-1', layers: [{ title: 'parcels.geojson' }] };
      const feature = { id: 'search', queryResult: '{}' };
      const snapshot = handler.capture({
        includeControls: false,
        generateLink: async () => '',
        caller: { exportState: () => feature },
        map: {
          getExtent: () => [1, 2, 3, 4],
          baseLayer: { id: 'Topo' },
          options: { defaultBaseLayer: 'Topo' },
          workLayers: [{ options: { profileLayerId: '1' }, getOpacity: () => 0.4, getVisibility: () => true }],
          controls: [
            {
              exportState() {
                throw new Error('control gone');
              }
            },
            { exportState: () => file }
          ]
        }
      });

      expect(snapshot.layers).toEqual([{ id: '1', opacity: 0.4 }]);
      expect(snapshot.draw).toEqual([file]);

      const setExtent = jest.fn();
      const ensureLayers = jest.fn(async (ids: string[]) => {
        if (ids.includes('missing')) {
          throw new Error('missing layer');
        }
      });
      const importControlStates = jest.fn((states: unknown[]) => {
        const first = states[0] as { id?: string } | undefined;
        if (first?.id === 'file-1') {
          throw new Error('missing file');
        }
      });

      const restored = await handler.restore(
        { setExtent, workLayers: [], importControlStates, controls: [] },
        encodeMapState({
          ext: [1, 2, 3, 4],
          layers: [
            { id: 'missing', visible: true },
            { id: 'keep', visible: true }
          ],
          draw: [file],
          feature
        }),
        ensureLayers
      );

      expect(restored).toBe(true);
      expect(setExtent).toHaveBeenCalledWith([1, 2, 3, 4], { animate: false });
      expect(ensureLayers).toHaveBeenCalledWith(['keep']);
      expect(importControlStates).toHaveBeenCalledWith([feature]);
    });

    it('leaves stacking order out when the tree walk still matches the map', async () => {
      await handler.loadPatches({
        trees: [
          {
            nodes: {
              child: { loadByDefault: true, resource: '2' },
              parent: {
                loadByDefault: true,
                resource: '1',
                children: ['child']
              }
            }
          }
        ]
      } as AppCfg);
      const layer = (id: string) => ({
        options: { profileLayerId: id }
      });
      const snapshot = handler.capture({
        generateLink: async () => '',
        map: {
          getExtent: () => [1, 2, 3, 4],
          workLayers: [layer('1'), layer('2')]
        }
      });

      expect(snapshot.order).toBeUndefined();
    });

    it('keeps the first radio layer as the default stack', async () => {
      await loadRadioTree(handler);
      const snapshot = handler.capture({
        generateLink: async () => '',
        map: {
          getExtent: () => [1, 2, 3, 4],
          workLayers: [radioLayer('1'), radioLayer('2')]
        }
      });

      expect(snapshot.order).toBeUndefined();
      expect(snapshot.layers).toBeUndefined();
    });

    it('restores the radio layer the person selected, in that stack position', async () => {
      await loadRadioTree(handler);
      const snapshot = handler.capture({
        generateLink: async () => '',
        map: {
          getExtent: () => [1, 2, 3, 4],
          workLayers: [radioLayer('9'), radioLayer('2')]
        }
      });

      expect(snapshot.order).toEqual(['9', '2']);
      expect(snapshot.layers).toEqual([
        { id: '9', visible: true },
        { id: '1', visible: false }
      ]);

      type Slot = {
        isBase?: boolean;
        options?: { profileLayerId?: string };
        visible: boolean;
        setVisibility: (visible: boolean) => void;
      };
      const slot = (id: string): Slot => {
        const layer: Slot = {
          isBase: false,
          options: { profileLayerId: id },
          visible: true,
          setVisibility(visible: boolean) {
            layer.visible = visible;
          }
        };
        return layer;
      };
      const base = { isBase: true, visible: true, setVisibility() {} };
      const work = [slot('1'), slot('2')];
      const map = {
        layers: [base, ...work],
        workLayers: [...work],
        insertLayer(moved: { isBase?: boolean }, index: number) {
          const before = map.layers.indexOf(moved as (typeof map.layers)[number]);
          if (before >= 0) {
            map.layers.splice(before, 1);
          }
          map.layers.splice(index, 0, moved as (typeof map.layers)[number]);
          map.workLayers = map.layers.filter((item) => !item.isBase);
        }
      };

      await handler.restore(map, encodeMapState(snapshot), async (ids) => {
        for (const id of ids) {
          map.layers.push(slot(id));
        }
        map.workLayers = map.layers.filter((item) => !item.isBase);
      });

      expect(map.workLayers.map((item) => item.options?.profileLayerId)).toEqual([
        '9',
        '2',
        '1'
      ]);
      expect(map.workLayers.map((item) => item.visible)).toEqual([
        true,
        true,
        false
      ]);
    });

    it('stores a reordered stack and puts the layers back in that order', async () => {
      await handler.loadPatches({
        trees: [
          {
            nodes: {
              a: { loadByDefault: true, resource: '1' },
              b: { loadByDefault: true, resource: '2' }
            }
          }
        ]
      } as AppCfg);
      type Slot = { isBase?: boolean; options?: { profileLayerId?: string } };
      const layer = (id: string): Slot => ({
        isBase: false,
        options: { profileLayerId: id }
      });
      const snapshot = handler.capture({
        generateLink: async () => '',
        map: {
          getExtent: () => [1, 2, 3, 4],
          workLayers: [layer('1'), layer('9'), layer('2')]
        }
      });

      expect(snapshot.order).toEqual(['1', '9', '2']);

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

      await handler.restore(map, encodeMapState(snapshot));

      expect(map.workLayers.map((item) => item.options?.profileLayerId)).toEqual(
        ['1', '9', '2']
      );
    });
  });

  describe('Integration', () => {
    it('should handle full lifecycle', async () => {
      mockAppConfigService.getControlDefault.mockReturnValue({
        div: 'share'
      });

      await handler.loadPatches(mockAppCfg);

      // Build config
      const task: AppTasks = {
        'ui-control': 'sitna.share',
        parameters: { custom: 'value' }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);
      expect(config).toBeDefined();
      expect(config?.['custom']).toBe('value');
    });
  });
});

function radioLayer(id: string): {
  options: { profileLayerId: string };
  getVisibility: () => boolean;
} {
  return {
    options: { profileLayerId: id },
    getVisibility: () => true
  };
}

async function loadRadioTree(handler: ShareControlHandler): Promise<void> {
  await handler.loadPatches({
    trees: [
      {
        nodes: {
          root: { children: ['radio', 'later'] },
          radio: { isRadio: true, children: ['first', 'second'] },
          first: { loadByDefault: true, resource: '1' },
          second: { loadByDefault: true, resource: '9' },
          later: { loadByDefault: true, resource: '2' }
        }
      }
    ]
  } as AppCfg);
}
