import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PopupSilmeControlHandler } from './popup-silme-control.handler';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import { AppConfigService } from '../../services/app-config.service';
import { AppCfg, AppTasks } from '@api/model/app-cfg';

describe('PopupSilmeControlHandler', () => {
  let handler: PopupSilmeControlHandler;
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

    // Setup window.__patchesLoaded
    (window as any).__patchesLoaded = {};

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PopupSilmeControlHandler,
        { provide: TCNamespaceService, useValue: mockTCNamespace },
        { provide: AppConfigService, useValue: mockAppConfigService }
      ]
    });

    handler = TestBed.inject(PopupSilmeControlHandler);

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

  afterEach(() => {
    delete (window as any).__patchesLoaded;
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });

  describe('controlIdentifier', () => {
    it('should have correct control identifier', () => {
      expect(handler.controlIdentifier).toBe('sitna.popup.silme.patch');
    });
  });

  describe('sitnaConfigKey', () => {
    it('should have correct sitnaConfigKey', () => {
      expect(handler.sitnaConfigKey).toBe('popup');
    });
  });

  describe('requiredPatches', () => {
    it('should have required patch file', () => {
      expect(handler.requiredPatches).toEqual([
        'assets/js/patch/controls/Popup.js'
      ]);
    });
  });

  describe('loadPatches()', () => {
    it('should mark patch as loaded if already loaded', async () => {
      (window as any).__patchesLoaded.Popup = true;

      await handler.loadPatches(mockAppCfg);

      // Should not wait for TC or load script if already loaded
      expect(mockTCNamespace.waitForTC).not.toHaveBeenCalled();
    });

    it('should wait for TC namespace and load script if not loaded', async () => {
      delete (window as any).__patchesLoaded.Popup;

      // Mock script loading
      const scriptElement = document.createElement('script');
      spyOn(document, 'createElement').and.returnValue(scriptElement);
      spyOn(document.head, 'appendChild');

      await handler.loadPatches(mockAppCfg);

      expect(mockTCNamespace.waitForTC).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('script');
      expect(scriptElement.src).toContain('Popup.js');
      expect(scriptElement.async).toBe(false);
    });

    it('should be idempotent - safe to call multiple times', async () => {
      delete (window as any).__patchesLoaded.Popup;

      const scriptElement = document.createElement('script');
      spyOn(document, 'createElement').and.returnValue(scriptElement);
      spyOn(document.head, 'appendChild');

      // First call
      await handler.loadPatches(mockAppCfg);
      const firstCallCount = (document.createElement as jasmine.Spy).calls.count();

      // Second call
      await handler.loadPatches(mockAppCfg);
      const secondCallCount = (document.createElement as jasmine.Spy).calls.count();

      // Should not create additional scripts
      expect(secondCallCount).toBe(firstCallCount);
    });
  });

  describe('buildConfiguration()', () => {
    beforeEach(async () => {
      // Ensure patch is marked as loaded
      (window as any).__patchesLoaded.Popup = true;
      await handler.loadPatches(mockAppCfg);
    });

    it('should return true for empty parameters', () => {
      (handler as any).patchLoaded = true;
      mockTC.control.Popup = {};

      const task: AppTasks = {
        'ui-control': 'sitna.popup.silme.patch',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toBe(true);
    });

    it('should return true for undefined parameters', () => {
      (handler as any).patchLoaded = true;
      mockTC.control.Popup = {};

      const task: AppTasks = {
        'ui-control': 'sitna.popup.silme.patch',
        parameters: undefined
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toBe(true);
    });

    it('should return config object when parameters provided', () => {
      (handler as any).patchLoaded = true;
      mockTC.control.Popup = {};

      const task: AppTasks = {
        'ui-control': 'sitna.popup.silme.patch',
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
    it('should return false if patch not loaded', () => {
      (handler as any).patchLoaded = false;
      expect(handler.isReady()).toBe(false);
    });

    it('should return false if TC.control.Popup not available', () => {
      (handler as any).patchLoaded = true;
      mockTC.control.Popup = undefined;
      expect(handler.isReady()).toBe(false);
    });

    it('should return true if patch loaded and control available', () => {
      (handler as any).patchLoaded = true;
      mockTC.control.Popup = {};
      expect(handler.isReady()).toBe(true);
    });
  });

  describe('Integration', () => {
    it('should handle full lifecycle with empty parameters', async () => {
      // Setup patch as loaded
      (window as any).__patchesLoaded.Popup = true;
      mockTC.control.Popup = {};

      // Load patches
      await handler.loadPatches(mockAppCfg);

      // Should be ready
      expect(handler.isReady()).toBe(true);

      // Build config with empty parameters
      const task: AppTasks = {
        'ui-control': 'sitna.popup.silme.patch',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);
      expect(config).toBe(true);
    });

    it('should handle full lifecycle with custom parameters', async () => {
      // Setup patch as loaded
      (window as any).__patchesLoaded.Popup = true;
      mockTC.control.Popup = {};

      // Load patches
      await handler.loadPatches(mockAppCfg);

      // Should be ready
      expect(handler.isReady()).toBe(true);

      // Build config with custom parameters
      const task: AppTasks = {
        'ui-control': 'sitna.popup.silme.patch',
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

    it('should load Popup.js patch on-demand', async () => {
      // Ensure patch is not loaded
      delete (window as any).__patchesLoaded.Popup;

      const scriptElement = document.createElement('script');
      spyOn(document, 'createElement').and.returnValue(scriptElement);
      spyOn(document.head, 'appendChild');

      await handler.loadPatches(mockAppCfg);

      // Verify Popup.js patch was loaded
      expect(document.createElement).toHaveBeenCalledWith('script');
      expect(scriptElement.src).toContain('Popup.js');
      expect(document.head.appendChild).toHaveBeenCalledWith(scriptElement);
    });
  });
});



