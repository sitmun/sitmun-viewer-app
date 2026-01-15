import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PopupControlHandler } from './popup-control.handler';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import { AppConfigService } from '../../services/app-config.service';
import { AppCfg, AppTasks } from '@api/model/app-cfg';

describe('PopupControlHandler', () => {
  let handler: PopupControlHandler;
  let mockTCNamespace: jasmine.SpyObj<TCNamespaceService>;
  let mockAppConfigService: jasmine.SpyObj<AppConfigService>;
  let mockAppCfg: AppCfg;
  let mockTC: any;

  beforeEach(() => {
    mockTC = {
      control: {
        Popup: {}
      }
    };

    mockTCNamespace = jasmine.createSpyObj('TCNamespaceService', [
      'waitForTC',
      'getTC'
    ]);
    mockTCNamespace.waitForTC.and.returnValue(Promise.resolve(mockTC));
    mockTCNamespace.getTC.and.returnValue(mockTC);

    mockAppConfigService = jasmine.createSpyObj('AppConfigService', [
      'getControlDefault'
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PopupControlHandler,
        { provide: TCNamespaceService, useValue: mockTCNamespace },
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

      expect(mockTCNamespace.waitForTC).toHaveBeenCalled();
    });

    it('should not load any patch scripts', async () => {
      const createElementSpy = spyOn(document, 'createElement');

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

  describe('isReady()', () => {
    it('should return false if TC.control.Popup not available', () => {
      mockTC.control.Popup = undefined;
      expect(handler.isReady()).toBe(false);
    });

    it('should return true if TC.control.Popup exists', () => {
      mockTC.control.Popup = {};
      expect(handler.isReady()).toBe(true);
    });
  });

  describe('Integration', () => {
    it('should handle full lifecycle with empty parameters', async () => {
      // Load patches (waits for TC)
      await handler.loadPatches(mockAppCfg);

      // Should be ready (native control)
      expect(handler.isReady()).toBe(true);

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

      // Should be ready (native control)
      expect(handler.isReady()).toBe(true);

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
