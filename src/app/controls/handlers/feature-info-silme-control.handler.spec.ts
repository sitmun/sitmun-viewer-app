import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FeatureInfoSilmeControlHandler } from './feature-info-silme-control.handler';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import { AppConfigService } from '../../services/app-config.service';
import { AppCfg, AppTasks } from '@api/model/app-cfg';

describe('FeatureInfoSilmeControlHandler', () => {
  let handler: FeatureInfoSilmeControlHandler;
  let mockTCNamespace: jasmine.SpyObj<TCNamespaceService>;
  let mockAppConfigService: jasmine.SpyObj<AppConfigService>;
  let mockAppCfg: AppCfg;
  let mockTC: any;

  beforeEach(() => {
    mockTC = {
      control: {
        FeatureInfo: {},
        FeatureInfoSilme: {}
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
    mockAppConfigService.getControlDefault.and.returnValue({
      persistentHighlights: true
    });

    // Setup window.__patchesLoaded
    (window as any).__patchesLoaded = {
      FeatureInfoSilme: true
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        FeatureInfoSilmeControlHandler,
        { provide: TCNamespaceService, useValue: mockTCNamespace },
        { provide: AppConfigService, useValue: mockAppConfigService }
      ]
    });

    handler = TestBed.inject(FeatureInfoSilmeControlHandler);

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
      expect(handler.controlIdentifier).toBe(
        'sitna.featureInfo.silme.extension'
      );
    });
  });

  describe('sitnaConfigKey', () => {
    it('should have default sitnaConfigKey', () => {
      expect(handler.sitnaConfigKey).toBe('featureInfoSilme');
    });
  });

  describe('getSitnaConfigKey()', () => {
    it('should return featureInfoSilme for empty parameters', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.featureInfo.silme.extension',
        parameters: {}
      } as any;

      const key = handler.getSitnaConfigKey(task);
      expect(key).toBe('featureInfoSilme');
    });

    it('should return featureInfoSilme for undefined parameters', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.featureInfo.silme.extension',
        parameters: undefined
      } as any;

      const key = handler.getSitnaConfigKey(task);
      expect(key).toBe('featureInfoSilme');
    });

    it('should return featureInfo for custom parameters', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.featureInfo.silme.extension',
        parameters: {
          active: true,
          persistentHighlights: false
        }
      } as any;

      const key = handler.getSitnaConfigKey(task);
      expect(key).toBe('featureInfo');
    });

    it('should return featureInfoSilme when no task provided', () => {
      const key = handler.getSitnaConfigKey();
      expect(key).toBe('featureInfoSilme');
    });
  });

  describe('requiredPatches', () => {
    it('should have required patch file', () => {
      expect(handler.requiredPatches).toEqual([
        'assets/js/patch/controls/FeatureInfoSilme.js'
      ]);
    });
  });

  describe('loadPatches()', () => {
    it('should mark patch as loaded if already loaded', async () => {
      (window as any).__patchesLoaded.FeatureInfoSilme = true;

      await handler.loadPatches(mockAppCfg);

      expect(mockTCNamespace.waitForTC).not.toHaveBeenCalled();
    });

    it('should wait for TC namespace and load script if not loaded', async () => {
      delete (window as any).__patchesLoaded.FeatureInfoSilme;

      // Mock script loading
      const scriptElement = document.createElement('script');
      spyOn(document, 'createElement').and.returnValue(scriptElement);
      spyOn(document.head, 'appendChild');

      await handler.loadPatches(mockAppCfg);

      expect(mockTCNamespace.waitForTC).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('script');
      expect(scriptElement.src).toContain('FeatureInfoSilme.js');
      expect(scriptElement.async).toBe(false);
    });
  });

  describe('buildConfiguration()', () => {
    beforeEach(async () => {
      // Ensure patch is marked as loaded
      (window as any).__patchesLoaded.FeatureInfoSilme = true;
      await handler.loadPatches(mockAppCfg);
    });

    it('should return configuration with persistentHighlights for empty parameters', () => {
      (handler as any).patchLoaded = true;
      mockTC.control.FeatureInfoSilme = {};

      const task: AppTasks = {
        'ui-control': 'sitna.featureInfo.silme.extension',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        persistentHighlights: true
      });
    });

    it('should return configuration with persistentHighlights for undefined parameters', () => {
      (handler as any).patchLoaded = true;
      mockTC.control.FeatureInfoSilme = {};

      const task: AppTasks = {
        'ui-control': 'sitna.featureInfo.silme.extension',
        parameters: undefined
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        persistentHighlights: true
      });
    });

    it('should return custom parameters for featureInfo key when parameters provided', () => {
      (handler as any).patchLoaded = true;
      mockTC.control.FeatureInfoSilme = {};

      const task: AppTasks = {
        'ui-control': 'sitna.featureInfo.silme.extension',
        parameters: {
          active: true,
          persistentHighlights: false
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        active: true,
        persistentHighlights: false
      });
    });

    it('should store current task for getSitnaConfigKey', () => {
      (handler as any).patchLoaded = true;
      mockTC.control.FeatureInfoSilme = {};

      const task: AppTasks = {
        'ui-control': 'sitna.featureInfo.silme.extension',
        parameters: { active: true }
      } as any;
      const context: AppCfg = {} as any;

      handler.buildConfiguration(task, context);

      expect((handler as any).currentTask).toBe(task);
    });
  });

  describe('isReady()', () => {
    it('should return false if patch not loaded', () => {
      (handler as any).patchLoaded = false;
      expect(handler.isReady()).toBe(false);
    });

    it('should return false if TC.control.FeatureInfoSilme not available', () => {
      (handler as any).patchLoaded = true;
      mockTC.control.FeatureInfoSilme = undefined;
      expect(handler.isReady()).toBe(false);
    });

    it('should return true if patch loaded and control available', () => {
      (handler as any).patchLoaded = true;
      mockTC.control.FeatureInfoSilme = {};
      expect(handler.isReady()).toBe(true);
    });
  });

  describe('Integration', () => {
    it('should handle full lifecycle with empty parameters', async () => {
      // Setup patch as loaded
      (window as any).__patchesLoaded.FeatureInfoSilme = true;
      mockTC.control.FeatureInfoSilme = {};

      // Load patches
      await handler.loadPatches(mockAppCfg);

      // Should be ready
      expect(handler.isReady()).toBe(true);

      // Build config with empty parameters
      const task: AppTasks = {
        'ui-control': 'sitna.featureInfo.silme.extension',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);
      expect(config).toBeDefined();
      expect(config).toEqual({ persistentHighlights: true });

      // Should use featureInfoSilme key
      const configKey = handler.getSitnaConfigKey(task);
      expect(configKey).toBe('featureInfoSilme');
    });

    it('should handle full lifecycle with custom parameters', async () => {
      // Setup patch as loaded
      (window as any).__patchesLoaded.FeatureInfoSilme = true;
      mockTC.control.FeatureInfoSilme = {};

      // Load patches
      await handler.loadPatches(mockAppCfg);

      // Should be ready
      expect(handler.isReady()).toBe(true);

      // Build config with custom parameters
      const task: AppTasks = {
        'ui-control': 'sitna.featureInfo.silme.extension',
        parameters: {
          active: true,
          persistentHighlights: false
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);
      expect(config).toBeDefined();
      expect(config).toEqual({
        active: true,
        persistentHighlights: false
      });

      // Should use featureInfo key
      const configKey = handler.getSitnaConfigKey(task);
      expect(configKey).toBe('featureInfo');
    });
  });
});
