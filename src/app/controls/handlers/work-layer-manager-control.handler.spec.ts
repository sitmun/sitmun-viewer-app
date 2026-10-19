import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import type { AppCfg, AppTasks } from '@api/model/app-cfg';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';


import { WorkLayerManagerControlHandler } from './work-layer-manager-control.handler';
import { AppConfigService } from '../../services/app-config.service';
import { ConfigLookupService } from '../../services/config-lookup.service';
import { SitnaApiService } from '../../services/sitna-api.service';

function createWlmRow(layerId: string, opts?: { withInfo?: boolean }): HTMLLIElement {
  const li = document.createElement('li');
  li.className = 'tc-ctl-wlm-elm';
  li.dataset['layerId'] = layerId;
  li.innerHTML = `
    <div class="tc-ctl-wlm-input">
      <div class="tc-ctl-wlm-tools">
        ${opts?.withInfo !== false ? '<sitna-toggle class="tc-ctl-wlm-cb-info"></sitna-toggle>' : ''}
        <sitna-toggle class="tc-ctl-wlm-cb-visibility"></sitna-toggle>
      </div>
    </div>
  `;
  return li;
}

describe('WorkLayerManagerControlHandler', () => {
  let handler: WorkLayerManagerControlHandler;
  let mockSitnaApi: jest.Mocked<SitnaApiService>;
  let mockAppConfig: jest.Mocked<AppConfigService>;
  let mockConfigLookup: jest.Mocked<
    Pick<ConfigLookupService, 'isQueryableLeaf' | 'findNode'>
  >;
  let langChange$: Subject<{ lang: string }>;

  beforeEach(() => {
    langChange$ = new Subject<{ lang: string }>();
    const mockGetRenderedHtml = jest.fn().mockResolvedValue('<li></li>');
    class WorkLayerManager {
      getRenderedHtml = mockGetRenderedHtml;
    }
    WorkLayerManager.prototype.getRenderedHtml = mockGetRenderedHtml;

    const mockTC = {
      control: {
        WorkLayerManager
      }
    };
    mockSitnaApi = {
      getTC: jest.fn().mockReturnValue(mockTC as any),
      getSITNA: jest.fn().mockReturnValue({} as any),
      getTCProperty: jest.fn(),
      getGlobal: jest.fn().mockReturnValue(undefined),
      isReady: jest.fn().mockReturnValue(true)
    } as Partial<jest.Mocked<SitnaApiService>> as jest.Mocked<SitnaApiService>;
    mockAppConfig = {
      getControlDefault: jest.fn().mockReturnValue({
        div: 'workLayerManager'
      })
    } as Partial<
      jest.Mocked<AppConfigService>
    > as jest.Mocked<AppConfigService>;
    mockConfigLookup = {
      isQueryableLeaf: jest.fn().mockReturnValue(false),
      findNode: jest.fn().mockReturnValue(undefined)
    };

    TestBed.configureTestingModule({
            providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        WorkLayerManagerControlHandler,
        { provide: SitnaApiService, useValue: mockSitnaApi },
        { provide: AppConfigService, useValue: mockAppConfig },
        { provide: ConfigLookupService, useValue: mockConfigLookup },
        {
          provide: TranslateService,
          useValue: {
            instant: (key: string) => key,
            onLangChange: langChange$.asObservable()
          }
        }
      ]
    });

    handler = TestBed.inject(WorkLayerManagerControlHandler);
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });

  describe('controlIdentifier', () => {
    it('should have correct control identifier', () => {
      expect(handler.controlIdentifier).toBe('sitna.workLayerManager');
    });
  });

  describe('requiredPatches', () => {
    it('should have no required patches', () => {
      expect(handler.requiredPatches).toBeUndefined();
    });
  });

  describe('buildConfiguration()', () => {
    it('should return configuration with default div', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.workLayerManager',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({ div: 'workLayerManager' });
    });

    it('should merge task parameters', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.workLayerManager',
        parameters: {
          position: 'left',
          collapsible: true
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        div: 'workLayerManager',
        position: 'left',
        collapsible: true
      });
    });

    it('should allow parameters to override div', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.workLayerManager',
        parameters: {
          div: 'custom-toc-div'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.div).toBe('custom-toc-div');
    });
  });

  describe('loadPatches()', () => {
    it('patches WorkLayerManager to collapse catalog composite display paths', async () => {
      const context: AppCfg = {} as any;
      const TC = mockSitnaApi.getTC();
      const wlmProto = TC.control.WorkLayerManager.prototype;

      await handler.loadPatches(context);

      const control = {
        map: {
          getLayer: jest.fn().mockReturnValue({
            options: { nodeId: 'node/illes' },
            names: ['CONSTRU', 'TXCONSTRU']
          })
        }
      };
      const layerData = {
        id: 'layer-1',
        path: [
          ['Adreces', 'Illes urbanes'],
          ['Adreces', 'Illes urbanes']
        ]
      };

      await wlmProto.getRenderedHtml.call(control, 'tc-ctl-wlm-elm', layerData);

      expect(layerData.path).toEqual([['Adreces', 'Illes urbanes']]);
    });

    it('does not settle elm HTML when the layer was already removed from the map', async () => {
      const context: AppCfg = {} as any;
      const TC = mockSitnaApi.getTC();
      const wlmProto = TC.control.WorkLayerManager.prototype;

      await handler.loadPatches(context);

      const control = {
        map: {
          getLayer: jest.fn().mockReturnValue(undefined)
        }
      };
      const pending = wlmProto.getRenderedHtml.call(control, 'tc-ctl-wlm-elm', {
        id: 'lcat-1-2',
        path: [['Folder', 'Layer']]
      });

      let settled = false;
      void Promise.resolve(pending).then(
        () => {
          settled = true;
        },
        () => {
          settled = true;
        }
      );
      await Promise.resolve();
      await Promise.resolve();

      expect(settled).toBe(false);
    });

    it('restores WorkLayerManager.getRenderedHtml on cleanup', async () => {
      const context: AppCfg = {} as any;
      const TC = mockSitnaApi.getTC();
      const wlmProto = TC.control.WorkLayerManager.prototype;
      const originalGetRenderedHtml = wlmProto.getRenderedHtml;

      await handler.loadPatches(context);
      expect(wlmProto.getRenderedHtml).not.toBe(originalGetRenderedHtml);

      const control = {
        map: {
          getLayer: jest.fn().mockReturnValue({
            options: { nodeId: 'node/illes' },
            names: ['CONSTRU', 'TXCONSTRU']
          })
        }
      };
      const layerData = {
        id: 'layer-1',
        path: [
          ['Adreces', 'Illes urbanes'],
          ['Adreces', 'Illes urbanes']
        ]
      };

      await wlmProto.getRenderedHtml.call(control, 'tc-ctl-wlm-elm', layerData);
      expect(layerData.path).toEqual([['Adreces', 'Illes urbanes']]);

      handler.cleanup();
      expect(wlmProto.getRenderedHtml).toBe(originalGetRenderedHtml);

      const uncollapsedLayerData = {
        id: 'layer-1',
        path: [
          ['Adreces', 'Illes urbanes'],
          ['Adreces', 'Illes urbanes']
        ]
      };
      await wlmProto.getRenderedHtml.call(
        control,
        'tc-ctl-wlm-elm',
        uncollapsedLayerData
      );
      expect(uncollapsedLayerData.path).toEqual([
        ['Adreces', 'Illes urbanes'],
        ['Adreces', 'Illes urbanes']
      ]);
    });

    it('reapplies WorkLayerManager patch after cleanup', async () => {
      const context: AppCfg = {} as any;
      const TC = mockSitnaApi.getTC();
      const wlmProto = TC.control.WorkLayerManager.prototype;
      const originalGetRenderedHtml = wlmProto.getRenderedHtml;

      await handler.loadPatches(context);
      handler.cleanup();
      expect(wlmProto.getRenderedHtml).toBe(originalGetRenderedHtml);

      await handler.loadPatches(context);
      expect(wlmProto.getRenderedHtml).not.toBe(originalGetRenderedHtml);

      const control = {
        map: {
          getLayer: jest.fn().mockReturnValue({
            options: { nodeId: 'node/illes' },
            names: ['CONSTRU', 'TXCONSTRU']
          })
        }
      };
      const layerData = {
        id: 'layer-1',
        path: [
          ['Adreces', 'Illes urbanes'],
          ['Adreces', 'Illes urbanes']
        ]
      };

      await wlmProto.getRenderedHtml.call(control, 'tc-ctl-wlm-elm', layerData);
      expect(layerData.path).toEqual([['Adreces', 'Illes urbanes']]);
    });

    it('does not collapse paths for external WMS layers without nodeId', async () => {
      const context: AppCfg = {} as any;
      const TC = mockSitnaApi.getTC();
      const wlmProto = TC.control.WorkLayerManager.prototype;

      await handler.loadPatches(context);

      const control = {
        map: {
          getLayer: jest.fn().mockReturnValue({
            options: {},
            names: ['A', 'B']
          })
        }
      };
      const layerData = {
        id: 'layer-2',
        path: [
          ['Service', 'LayerA'],
          ['Service', 'LayerB']
        ]
      };

      await wlmProto.getRenderedHtml.call(control, 'tc-ctl-wlm-elm', layerData);

      expect(layerData.path).toEqual([
        ['Service', 'LayerA'],
        ['Service', 'LayerB']
      ]);
    });
  });

  describe('Integration', () => {
    it('should handle full lifecycle', async () => {
      const context: AppCfg = {} as any;

      // Load patches (catalog composite display path normalization)
      await handler.loadPatches(context);

      // Build config
      const task: AppTasks = {
        'ui-control': 'sitna.workLayerManager',
        parameters: { custom: 'value' }
      } as any;

      const config = handler.buildConfiguration(task, context);
      expect(config).toBeDefined();
      expect(config?.div).toBe('workLayerManager');
    });
  });

  describe('GFI toggle', () => {
    it('injects interactive sitmun-wlm-gfi before meta for queryable leaves', () => {
      mockConfigLookup.isQueryableLeaf.mockImplementation(
        (id) => id === 'node/queryable'
      );
      const div = document.createElement('div');
      const li = createWlmRow('layer-q');
      div.appendChild(li);
      const layer = {
        options: { nodeId: 'node/queryable' } as {
          nodeId: string;
          sitmunGfiEnabled?: boolean;
        },
        getVisibility: () => true
      };
      const wlm = {
        div,
        map: {
          getLayer: jest.fn().mockReturnValue(layer)
        }
      };

      (handler as any).decorateGfiIndicators(wlm);

      const gfi = li.querySelector('.sitmun-wlm-gfi') as HTMLElement | null;
      const meta = li.querySelector('.tc-ctl-wlm-cb-info');
      expect(gfi).toBeTruthy();
      expect(gfi?.tagName).toBe('SITNA-TOGGLE');
      expect(gfi?.getAttribute('checked-icon-text')).toBe('\ue923');
      expect(gfi?.hasAttribute('checked')).toBe(true);
      expect(gfi?.hasAttribute('disabled')).toBe(false);
      expect(gfi?.getAttribute('data-sitmun-wlm-gfi')).toBe('enabled');
      expect(gfi?.getAttribute('aria-disabled')).toBe('false');
      expect(gfi?.getAttribute('aria-label')).toBe('workLayerManager.gfi.label');
      expect(gfi?.title).toBe('workLayerManager.gfi.on');
      expect(gfi?.nextElementSibling).toBe(meta);
      expect(meta?.getAttribute('checked-icon-text')).toBe('article');
      expect(layer.options.sitmunGfiEnabled).toBe(true);
    });

    it('change sets layer.options.sitmunGfiEnabled and leaves toggle unchecked', () => {
      mockConfigLookup.isQueryableLeaf.mockReturnValue(true);
      const div = document.createElement('div');
      const li = createWlmRow('layer-q');
      div.appendChild(li);
      const layer = {
        options: {
          nodeId: 'node/queryable',
          sitmunGfiEnabled: true
        } as { nodeId: string; sitmunGfiEnabled?: boolean },
        getVisibility: () => true
      };
      const wlm = {
        div,
        map: {
          getLayer: jest.fn().mockReturnValue(layer)
        }
      };

      (handler as any).decorateGfiIndicators(wlm);
      const gfi = li.querySelector('.sitmun-wlm-gfi') as HTMLElement;
      expect(gfi.hasAttribute('disabled')).toBe(false);

      gfi.removeAttribute('checked');
      gfi.dispatchEvent(new Event('change', { bubbles: true }));

      expect(layer.options.sitmunGfiEnabled).toBe(false);
      expect(gfi.hasAttribute('checked')).toBe(false);

      (handler as any).decorateGfiIndicators(wlm);
      expect(gfi.hasAttribute('checked')).toBe(false);
      expect(layer.options.sitmunGfiEnabled).toBe(false);
    });

    it('omits sitmun-wlm-gfi and clears sitmunGfiEnabled when node consultable is off', () => {
      mockConfigLookup.isQueryableLeaf.mockReturnValue(false);
      const div = document.createElement('div');
      const li = createWlmRow('layer-nq');
      div.appendChild(li);
      const layer = {
        options: {
          nodeId: 'node/other',
          sitmunGfiEnabled: true
        } as { nodeId: string; sitmunGfiEnabled?: boolean },
        getVisibility: () => true
      };
      const wlm = {
        div,
        map: {
          getLayer: jest.fn().mockReturnValue(layer)
        }
      };

      (handler as any).decorateGfiIndicators(wlm);

      expect(li.querySelector('.sitmun-wlm-gfi')).toBeNull();
      expect(layer.options.sitmunGfiEnabled).toBe(false);
    });

    it('blocks interaction when out of scale but preserves sitmunGfiEnabled', () => {
      mockConfigLookup.isQueryableLeaf.mockReturnValue(true);
      const div = document.createElement('div');
      const li = createWlmRow('layer-q');
      li.classList.add('tc-ctl-wlm-elm-notvisible');
      div.appendChild(li);
      const layer = {
        options: {
          nodeId: 'node/queryable',
          sitmunGfiEnabled: true
        } as { nodeId: string; sitmunGfiEnabled?: boolean },
        getVisibility: () => true
      };
      const wlm = {
        div,
        map: {
          getLayer: jest.fn().mockReturnValue(layer)
        }
      };

      (handler as any).decorateGfiIndicators(wlm);

      const gfi = li.querySelector('.sitmun-wlm-gfi') as HTMLElement;
      expect(gfi.getAttribute('data-sitmun-wlm-gfi')).toBe('disabled');
      expect(gfi.getAttribute('aria-disabled')).toBe('true');
      expect(gfi.hasAttribute('disabled')).toBe(true);
      expect(layer.options.sitmunGfiEnabled).toBe(true);

      gfi.removeAttribute('checked');
      gfi.dispatchEvent(new Event('change', { bubbles: true }));
      expect(layer.options.sitmunGfiEnabled).toBe(true);
    });

    it('blocks interaction when the layer is not visible', () => {
      mockConfigLookup.isQueryableLeaf.mockReturnValue(true);
      const div = document.createElement('div');
      const li = createWlmRow('layer-q');
      div.appendChild(li);
      const wlm = {
        div,
        map: {
          getLayer: jest.fn().mockReturnValue({
            options: { nodeId: 'node/queryable', sitmunGfiEnabled: true },
            getVisibility: () => false
          })
        }
      };

      (handler as any).decorateGfiIndicators(wlm);

      const gfi = li.querySelector('.sitmun-wlm-gfi');
      expect(gfi?.getAttribute('data-sitmun-wlm-gfi')).toBe('disabled');
      expect(gfi?.hasAttribute('disabled')).toBe(true);
    });

    it('removes GFI markers on cleanup after loadPatches', async () => {
      mockConfigLookup.isQueryableLeaf.mockReturnValue(true);
      const div = document.createElement('div');
      const li = createWlmRow('layer-q');
      div.appendChild(li);
      const wlm = {
        div,
        map: {
          getLayer: jest.fn().mockReturnValue({
            options: { nodeId: 'node/queryable' },
            getVisibility: () => true
          })
        }
      };

      await handler.loadPatches({} as AppCfg);
      (handler as any).decorateGfiIndicators(wlm);
      expect(li.querySelector('.sitmun-wlm-gfi')).toBeTruthy();

      handler.cleanup();
      expect(li.querySelector('.sitmun-wlm-gfi')).toBeNull();
    });

    it('change updates feature.showsPopup from sitmunGfiEnabled', () => {
      mockConfigLookup.isQueryableLeaf.mockReturnValue(true);
      const div = document.createElement('div');
      const li = createWlmRow('layer-q');
      div.appendChild(li);
      const feature = { showsPopup: true };
      const layer = {
        type: 'WFS',
        options: {
          nodeId: 'node/queryable',
          sitmunGfiEnabled: true
        } as { nodeId: string; sitmunGfiEnabled?: boolean },
        features: [feature],
        getVisibility: () => true
      };
      const wlm = {
        div,
        map: {
          getLayer: jest.fn().mockReturnValue(layer)
        }
      };

      (handler as any).decorateGfiIndicators(wlm);
      const gfi = li.querySelector('.sitmun-wlm-gfi') as HTMLElement;
      gfi.removeAttribute('checked');
      gfi.dispatchEvent(new Event('change', { bubbles: true }));

      expect(layer.options.sitmunGfiEnabled).toBe(false);
      expect(feature.showsPopup).toBe(false);
    });
  });

  describe('WFS scale row', () => {
    it('toggles elm-notvisible for a nameless WFS layer from its resolution bounds', async () => {
      const TC = mockSitnaApi.getTC();
      const wlmProto = TC.control.WorkLayerManager.prototype as {
        updateScale?: (this: {
          CLASS: string;
          map: {
            getLayer: (id: string) => unknown;
            getResolution: () => number;
          };
          getLayerUIElements: () => HTMLElement[];
        }) => void;
        CLASS?: string;
      };
      wlmProto.CLASS = 'tc-ctl-wlm';
      wlmProto.updateScale = function () {
        this.getLayerUIElements().forEach((li) => {
          const layer = this.map.getLayer(li.dataset['layerId'] ?? '') as
            | { names?: string[] }
            | undefined;
          if (layer?.names) {
            li.classList.toggle(this.CLASS + '-elm-notvisible', false);
          }
        });
      };

      await handler.loadPatches({} as AppCfg);

      const li = document.createElement('li');
      li.className = 'tc-ctl-wlm-elm';
      li.dataset['layerId'] = 'wfs-1';
      const layer = {
        type: 'WFS',
        options: { minResolution: 0.28, maxResolution: 140 }
      };
      let resolution = 0.01;
      const control = Object.create(wlmProto) as {
        CLASS: string;
        updateScale: () => void;
        map: {
          getLayer: () => typeof layer;
          getResolution: () => number;
        };
        getLayerUIElements: () => HTMLElement[];
      };
      control.CLASS = 'tc-ctl-wlm';
      control.map = {
        getLayer: () => layer,
        getResolution: () => resolution
      };
      control.getLayerUIElements = () => [li];

      control.updateScale();
      expect(li.classList.contains('tc-ctl-wlm-elm-notvisible')).toBe(true);

      resolution = 1;
      control.updateScale();
      expect(li.classList.contains('tc-ctl-wlm-elm-notvisible')).toBe(false);

      resolution = 200;
      control.updateScale();
      expect(li.classList.contains('tc-ctl-wlm-elm-notvisible')).toBe(true);
    });
  });

  describe('WFS catalog leaf row', () => {
    it('shows the root folder heading, the folder path, and the leaf title', () => {
      mockConfigLookup.findNode.mockImplementation((id: string) =>
        id === 'node/9401' ? ({ title: 'Fars' } as never) : undefined
      );
      mockSitnaApi.getGlobal.mockImplementation((key: string) =>
        key === 'currentAppCfg'
          ? ({
              trees: [
                {
                  id: 'tree',
                  title: 'Tree',
                  image: null,
                  rootNode: 'root',
                  nodes: {
                    root: {
                      title: 'Root',
                      children: ['folder-turisme']
                    },
                    'folder-turisme': {
                      title: 'Turisme i patrimoni',
                      children: ['folder-rutes']
                    },
                    'folder-rutes': {
                      title: 'Rutes turístiques',
                      children: ['node/9401']
                    },
                    'node/9401': {
                      title: 'Fars',
                      children: []
                    }
                  }
                }
              ]
            } as never)
          : undefined
      );
      const div = document.createElement('div');
      const li = document.createElement('li');
      li.className = 'tc-ctl-wlm-elm';
      li.dataset['layerId'] = 'wfs-fars';
      li.innerHTML = `
        <div class="tc-ctl-wlm-lyr" title="Fars">Fars</div>
        <div class="tc-ctl-wlm-path" title="Turisme i patrimoni">Turisme i patrimoni</div>
        <div class="tc-ctl-wlm-input">
          <div class="tc-ctl-wlm-tools">
            <sitna-toggle class="sitmun-wlm-gfi"></sitna-toggle>
            <sitna-toggle class="tc-ctl-wlm-cb-info"></sitna-toggle>
            <sitna-toggle class="tc-ctl-wlm-cb-visibility"></sitna-toggle>
            <sitna-button class="tc-ctl-wlm-btn-zoom"></sitna-button>
            <sitna-button></sitna-button>
            <sitna-button class="tc-ctl-wlm-btn-del tc-item-tool-last"></sitna-button>
            <sitna-button class="tc-ctl-wlm-btn-more"></sitna-button>
          </div>
        </div>
      `;
      div.append(li);
      document.body.append(div);
      const layer = {
        id: 'wfs-fars',
        type: 'WFS',
        title: 'Turisme i patrimoni',
        tree: { title: 'Turisme i patrimoni' },
        options: { type: 'WFS', nodeId: 'node/9401' },
        getVisibility: () => true
      };
      try {
        (handler as any).decorateGfiIndicators({
          div,
          map: { getLayer: () => layer }
        });

        const lyr = li.querySelector('.tc-ctl-wlm-lyr');
        expect(lyr?.textContent).toBe('Turisme i patrimoni');
        expect(lyr?.getAttribute('title')).toBe('Turisme i patrimoni');
        expect(li.querySelector('.tc-ctl-wlm-path')?.textContent).toBe(
          'Rutes turístiques › Fars'
        );
        expect(li.querySelector('.tc-ctl-wlm-path')?.getAttribute('title')).toBe(
          'Rutes turístiques › Fars'
        );
        expect(layer.title).toBe('Fars');
        expect(layer.tree).toBeNull();
        const tools = li.querySelector('.tc-ctl-wlm-tools');
        expect(tools?.querySelector('.tc-ctl-wlm-btn-dl')).toBeTruthy();
      } finally {
        div.remove();
      }
    });
  });

  describe('WFS legend hierarchy', () => {
    const farsTree = {
      trees: [
        {
          id: 'tree',
          title: 'Tree',
          image: null,
          rootNode: 'root',
          nodes: {
            root: {
              title: 'Root',
              children: ['folder-turisme']
            },
            'folder-turisme': {
              title: 'Turisme i patrimoni',
              children: ['folder-rutes']
            },
            'folder-rutes': {
              title: 'Rutes turístiques',
              children: ['node/9401']
            },
            'node/9401': {
              title: 'Fars',
              children: []
            }
          }
        }
      ]
    };

    function legendTitles(node: {
      title?: string;
      children?: Array<{ title?: string; children?: unknown[] }>;
    } | null): string[] {
      if (!node) {
        return [];
      }
      const titles = node.title ? [node.title] : [];
      for (const child of node.children ?? []) {
        titles.push(
          ...legendTitles(
            child as {
              title?: string;
              children?: Array<{ title?: string; children?: unknown[] }>;
            }
          )
        );
      }
      return titles;
    }

    it('nests ancestor folders above the WFS leaf and keeps the point swatch', async () => {
      const TC = mockSitnaApi.getTC() as {
        layer?: {
          Vector: { prototype: { getTree: () => unknown } };
        };
      };
      function Vector(this: { title?: string; tree?: unknown }) {
        this.tree = undefined;
      }
      Vector.prototype.getTree = function (this: {
        title?: string;
        tree?: {
          title?: string;
          children: unknown[];
          legend: Array<{ src: string }>;
        } | null;
      }) {
        if (this.tree) {
          return this.tree;
        }
        this.tree = {
          title: this.title,
          children: [],
          legend: [{ src: 'data:image/png;base64,fars-point' }]
        };
        return this.tree;
      };
      TC.layer = { Vector: Vector as unknown as { prototype: { getTree: () => unknown } } };

      mockSitnaApi.getGlobal.mockImplementation((key: string) =>
        key === 'currentAppCfg' ? (farsTree as never) : undefined
      );

      await handler.loadPatches({} as AppCfg);

      const layer = Object.create(TC.layer!.Vector.prototype) as {
        title: string;
        type: string;
        options: { type: string; nodeId: string };
        tree: unknown;
        getTree: () => {
          title?: string;
          legend?: unknown;
          children?: Array<{
            title?: string;
            legend?: unknown;
            children?: Array<{ title?: string; legend?: unknown; children?: unknown[] }>;
          }>;
        };
      };
      layer.title = 'Fars';
      layer.type = 'WFS';
      layer.options = { type: 'WFS', nodeId: 'node/9401' };
      layer.tree = null;

      const tree = layer.getTree();
      expect(legendTitles(tree)).toEqual([
        'Turisme i patrimoni',
        'Rutes turístiques',
        'Fars'
      ]);
      expect(tree.legend).toBeUndefined();
      expect(tree.children?.[0]?.children?.[0]?.legend).toEqual([
        { src: 'data:image/png;base64,fars-point' }
      ]);
      expect(tree.children?.[0]?.children?.[0]?.children).toEqual([]);
    });
  });

  describe('WFS legend swatch', () => {
    it('paints a WFS legend swatch when features arrive after the Capas row', async () => {
      const TC = mockSitnaApi.getTC();
      const wlmProto = TC.control.WorkLayerManager.prototype as {
        updateLayerTree?: () => void;
      };
      wlmProto.updateLayerTree = function () {
        return undefined;
      };

      await handler.loadPatches({} as AppCfg);

      const li = document.createElement('li');
      li.className = 'tc-ctl-wlm-elm';
      li.dataset['layerId'] = 'wfs-1';
      const src = 'data:image/png;base64,e2e-wfs-swatch';
      const layer = {
        type: 'WFS',
        getTree: () => ({ legend: [{ src }] })
      };
      const control = Object.create(wlmProto) as {
        updateLayerTree: () => void;
        map: { getLayer: () => typeof layer };
        getLayerUIElements: () => HTMLElement[];
      };
      control.map = { getLayer: () => layer };
      control.getLayerUIElements = () => [li];

      control.updateLayerTree();

      const img = li.querySelector('.tc-ctl-wlm-legend img');
      expect(img?.getAttribute('data-img')).toBe(src);
    });
  });
});
