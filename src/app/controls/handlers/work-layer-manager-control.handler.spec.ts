import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

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
  let mockConfigLookup: jest.Mocked<Pick<ConfigLookupService, 'isQueryableLeaf'>>;
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
      isQueryableLeaf: jest.fn().mockReturnValue(false)
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

    it('omits sitmun-wlm-gfi when the layer is not queryable', () => {
      mockConfigLookup.isQueryableLeaf.mockReturnValue(false);
      const div = document.createElement('div');
      const li = createWlmRow('layer-nq');
      div.appendChild(li);
      const wlm = {
        div,
        map: {
          getLayer: jest.fn().mockReturnValue({
            options: { nodeId: 'node/other' },
            getVisibility: () => true
          })
        }
      };

      (handler as any).decorateGfiIndicators(wlm);

      expect(li.querySelector('.sitmun-wlm-gfi')).toBeNull();
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
  });
});
