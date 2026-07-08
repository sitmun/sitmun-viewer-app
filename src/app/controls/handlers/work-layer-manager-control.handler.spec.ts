import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { WorkLayerManagerControlHandler } from './work-layer-manager-control.handler';
import { AppConfigService } from '../../services/app-config.service';
import { SitnaApiService } from '../../services/sitna-api.service';

describe('WorkLayerManagerControlHandler', () => {
  let handler: WorkLayerManagerControlHandler;
  let mockSitnaApi: jest.Mocked<SitnaApiService>;
  let mockAppConfig: jest.Mocked<AppConfigService>;

  beforeEach(() => {
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

    TestBed.configureTestingModule({
            providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        WorkLayerManagerControlHandler,
        { provide: SitnaApiService, useValue: mockSitnaApi },
        { provide: AppConfigService, useValue: mockAppConfig }
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
});
