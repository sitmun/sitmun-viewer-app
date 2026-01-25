import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { PopupControlHandler } from './popup-control.handler';
import { AppConfigService } from '../../services/app-config.service';
import { SitnaApiService } from '../../services/sitna-api.service';

describe('PopupControlHandler', () => {
  let handler: PopupControlHandler;
  let mockSitnaApi: jest.Mocked<SitnaApiService>;
  let mockAppConfigService: jest.Mocked<AppConfigService>;
  let mockAppCfg: AppCfg;
  let mockTC: any;

  beforeEach(() => {
    mockTC = {
      control: {
        Popup: {}
      }
    };

    mockSitnaApi = {
      getTC: jest.fn().mockReturnValue(mockTC),
      getSITNA: jest.fn().mockReturnValue({} as any),
      getTCProperty: jest.fn(),
      isReady: jest.fn().mockReturnValue(true)
    } as Partial<jest.Mocked<SitnaApiService>> as jest.Mocked<SitnaApiService>;

    mockAppConfigService = {
      getControlDefault: jest.fn()
    } as Partial<
      jest.Mocked<AppConfigService>
    > as jest.Mocked<AppConfigService>;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PopupControlHandler,
        { provide: SitnaApiService, useValue: mockSitnaApi },
        { provide: AppConfigService, useValue: mockAppConfigService }
      ]
    });

    handler = TestBed.inject(PopupControlHandler);

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
      expect(handler.controlIdentifier).toBe('sitna.popup');
    });
  });

  describe('sitnaConfigKey', () => {
    it('should have correct sitnaConfigKey', () => {
      expect(handler.sitnaConfigKey).toBe('popup');
    });
  });

  describe('requiredPatches', () => {
    it('should have no required patches', () => {
      expect(handler.requiredPatches).toBeUndefined();
    });
  });

  describe('loadPatches()', () => {
    it('should wait for TC namespace', async () => {
      await handler.loadPatches(mockAppCfg);

      expect(mockSitnaApi.getTC).toHaveBeenCalled();
    });

    it('should not load any patch scripts', async () => {
      const createElementSpy = jest.spyOn(document, 'createElement');

      await handler.loadPatches(mockAppCfg);

      expect(createElementSpy).not.toHaveBeenCalled();
    });
  });

  describe('buildConfiguration()', () => {
    it('should return true for empty parameters', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.popup',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config as any).toBe(true);
    });

    it('should return true for undefined parameters', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.popup',
        parameters: undefined
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config as any).toBe(true);
    });

    it('should return config object when parameters provided', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.popup',
        parameters: {
          closeButton: true,
          shareButton: false
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        closeButton: true,
        shareButton: false
      });
    });
  });

  describe('Integration', () => {
    it('should handle full lifecycle with empty parameters', async () => {
      // Load patches (waits for TC)
      await handler.loadPatches(mockAppCfg);

      // Build config with empty parameters
      const task: AppTasks = {
        'ui-control': 'sitna.popup',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);
      expect(config as any).toBe(true);
    });

    it('should handle full lifecycle with custom parameters', async () => {
      // Load patches (waits for TC)
      await handler.loadPatches(mockAppCfg);

      // Build config with custom parameters
      const task: AppTasks = {
        'ui-control': 'sitna.popup',
        parameters: {
          closeButton: true,
          shareButton: true
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);
      expect(config).toEqual({
        closeButton: true,
        shareButton: true
      });
    });

    it('should not load Popup.js patch (native control)', async () => {
      // Ensure patch is not loaded
      (window as any).__patchesLoaded = {};

      await handler.loadPatches(mockAppCfg);

      // Verify Popup.js patch was not loaded
      expect((window as any).__patchesLoaded.Popup).toBeUndefined();
    });
  });
});
