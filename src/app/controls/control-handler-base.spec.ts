import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { ControlHandlerBase } from './control-handler-base';
import { SitnaControlConfig } from './control-handler.interface';
import { AppConfigService } from '../services/app-config.service';
import { SitnaApiService } from '../services/sitna-api.service';

/**
 * Concrete test implementation of ControlHandlerBase
 */
class TestControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'test.control';
  readonly requiredPatches = ['assets/js/patch/test.js'];

  override buildConfiguration(
    _task: AppTasks,
    _context: AppCfg
  ): SitnaControlConfig | null {
    return { div: 'test' };
  }
}

/**
 * Handler with no patches
 */
class NoPatchHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'test.nopatch';
  readonly requiredPatches = undefined;

  override buildConfiguration(
    _task: AppTasks,
    _context: AppCfg
  ): SitnaControlConfig | null {
    return { div: 'nopatch' };
  }
}

describe('ControlHandlerBase', () => {
  let handler: TestControlHandler;
  let noPatchHandler: NoPatchHandler;
  let mockSitnaApi: jest.Mocked<SitnaApiService>;
  let mockAppCfg: AppCfg;

  beforeEach(() => {
    // Create spy
    mockSitnaApi = {
      getTC: jest.fn(),
      getSITNA: jest.fn(),
      getTCProperty: jest.fn(),
      isReady: jest.fn().mockReturnValue(true)
    } as Partial<jest.Mocked<SitnaApiService>> as jest.Mocked<SitnaApiService>;

    const mockAppConfigService = {
      getControlDefault: jest.fn().mockReturnValue(null)
    } as Partial<
      jest.Mocked<AppConfigService>
    > as jest.Mocked<AppConfigService>;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: SitnaApiService, useValue: mockSitnaApi },
        { provide: AppConfigService, useValue: mockAppConfigService }
      ]
    });

    handler = TestBed.runInInjectionContext(
      () => new TestControlHandler(mockSitnaApi)
    );
    noPatchHandler = TestBed.runInInjectionContext(
      () => new NoPatchHandler(mockSitnaApi)
    );

    // Create mock AppCfg for loadPatches context
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

  describe('Initialization', () => {
    it('should create handler with correct control identifier', () => {
      expect(handler.controlIdentifier).toBe('test.control');
    });

    it('should initialize with patch manager', () => {
      expect(handler['patchManager']).toBeDefined();
    });

    it('should initialize with empty load cache', () => {
      expect(handler['loadPromiseCache'].size).toBe(0);
    });
  });

  describe('loadPatches()', () => {
    it('should resolve successfully with context', async () => {
      await handler.loadPatches(mockAppCfg);
      // Default implementation does nothing, just resolves
      expect(true).toBe(true);
    });

    it('should handle no patches gracefully', async () => {
      await noPatchHandler.loadPatches(mockAppCfg);
      // Default implementation does nothing, just resolves
      expect(true).toBe(true);
    });

    it('should require context parameter', async () => {
      // TypeScript will catch this, but we test runtime behavior
      await expect(handler.loadPatches(mockAppCfg)).resolves.toBeUndefined();
    });

    it('should work with multi-patch handler', async () => {
      class MultiPatchHandler extends ControlHandlerBase {
        readonly controlIdentifier = 'test.multi';
        readonly requiredPatches = ['patch1.js', 'patch2.js', 'patch3.js'];
        override buildConfiguration() {
          return null;
        }
      }

      const multiHandler = TestBed.runInInjectionContext(
        () => new MultiPatchHandler(mockSitnaApi)
      );
      await multiHandler.loadPatches(mockAppCfg);
      // Default implementation does nothing, just resolves
      expect(true).toBe(true);
    });
  });

  describe('cleanup()', () => {
    it('should restore all patches', () => {
      jest.spyOn(handler['patchManager'], 'restoreAll');

      handler.cleanup();

      expect(handler['patchManager'].restoreAll).toHaveBeenCalled();
    });

    it('should clear load cache', () => {
      handler['loadPromiseCache'].set('test', Promise.resolve());

      handler.cleanup();

      expect(handler['loadPromiseCache'].size).toBe(0);
    });
  });

  describe('Helper Methods', () => {
    describe('areParametersEmpty()', () => {
      it('should return true for undefined', () => {
        expect(handler['areParametersEmpty'](undefined)).toBe(true);
      });

      it('should return true for null', () => {
        expect(handler['areParametersEmpty'](null)).toBe(true);
      });

      it('should return true for empty object', () => {
        expect(handler['areParametersEmpty']({})).toBe(true);
      });

      it('should return false for object with properties', () => {
        expect(handler['areParametersEmpty']({ key: 'value' })).toBe(false);
      });
    });

    describe('getDefaultConfig()', () => {
      it('should return config from appConfigService', () => {
        const config = handler['getDefaultConfig']();
        // Returns config from appConfigService or empty object
        expect(config).toBeDefined();
        expect(typeof config).toBe('object');
      });
    });

    describe('mergeWithParameters()', () => {
      it('should return defaults when parameters are empty', () => {
        const defaults = { div: 'test', option: 'value' };
        const result = handler['mergeWithParameters'](defaults, {});

        expect(result).toEqual(defaults);
      });

      it('should merge parameters with defaults', () => {
        const defaults = { div: 'test', option1: 'value1' };
        const params = { option2: 'value2' };
        const result = handler['mergeWithParameters'](defaults, params);

        expect(result).toEqual({
          div: 'test',
          option1: 'value1',
          option2: 'value2'
        });
      });

      it('should allow parameters to override defaults', () => {
        const defaults = { div: 'test', option: 'default' };
        const params = { option: 'override' };
        const result = handler['mergeWithParameters'](defaults, params);

        expect(result).toEqual({ div: 'test', option: 'override' });
      });
    });
  });

  describe('ensureControlLoaded()', () => {
    it('should load control with dependencies', async () => {
      const mockTC = { control: {} };
      mockSitnaApi.getTC.mockReturnValue(mockTC);

      let scriptLoaded = false;
      await handler['ensureControlLoaded']({
        dependencies: 'TC',
        loadScript: () => {
          scriptLoaded = true;
        },
        controlName: 'TestControl'
      });

      expect(mockSitnaApi.getTC).toHaveBeenCalled();
      expect(scriptLoaded).toBe(true);
    });

    it('should return immediately if already loaded', async () => {
      let checkCount = 0;
      let scriptLoaded = false;

      await handler['ensureControlLoaded']({
        checkLoaded: () => {
          checkCount++;
          return true;
        },
        loadScript: () => {
          scriptLoaded = true;
        },
        controlName: 'TestControl'
      });

      expect(checkCount).toBe(1);
      expect(scriptLoaded).toBe(false);
    });

    it('should cache load promises', async () => {
      const loadPromise = handler['ensureControlLoaded']({
         
        loadScript: () => {},
        controlName: 'TestControl'
      });

      expect(handler['loadPromiseCache'].has('TestControl')).toBe(true);

      await loadPromise;

      // Cache should be cleared after completion
      expect(handler['loadPromiseCache'].has('TestControl')).toBe(false);
    });

    it('should handle array of dependencies', async () => {
      const mockTC = { control: { Search: {} } };
      mockSitnaApi.getTC.mockReturnValue(mockTC);
      mockSitnaApi.getTCProperty.mockReturnValue({});

      await handler['ensureControlLoaded']({
        dependencies: ['TC', 'TC.control.Search'],
         
        loadScript: () => {},
        controlName: 'TestControl'
      });

      expect(mockSitnaApi.getTC).toHaveBeenCalled();
      expect(mockSitnaApi.getTCProperty).toHaveBeenCalledWith(
        'TC.control.Search'
      );
    });

    it('should handle function dependencies', async () => {
      let depResolved = false;
      const depFunction = async () => {
        depResolved = true;
      };

      await handler['ensureControlLoaded']({
        dependencies: depFunction,
         
        loadScript: () => {},
        controlName: 'TestControl'
      });

      expect(depResolved).toBe(true);
    });
  });

  describe('withTCAsync()', () => {
    it('should run callback with TC', async () => {
      const mockTC = { control: {} };
      mockSitnaApi.getTC.mockReturnValue(mockTC);

      let callbackExecuted = false;
      let receivedTC: any;

      await handler['withTCAsync'](async (TC) => {
        callbackExecuted = true;
        receivedTC = TC;
      });

      expect(mockSitnaApi.getTC).toHaveBeenCalled();
      expect(callbackExecuted).toBe(true);
      expect(receivedTC).toBe(mockTC);
    });

    it('should propagate callback errors', async () => {
      const mockTC = { control: {} };
      mockSitnaApi.getTC.mockReturnValue(mockTC);

      await expect(
        handler['withTCAsync'](async () => {
          throw new Error('Callback error');
        })
      ).rejects.toThrow();
    });
  });

  describe('Integration', () => {
    it('should handle full lifecycle', async () => {
      // Load patches
      await handler.loadPatches(mockAppCfg);

      // Build config
      const mockTask: AppTasks = {
        'ui-control': 'test.control',
        parameters: { custom: 'value' }
      } as any;

      const config = handler.buildConfiguration(mockTask, mockAppCfg);
      expect(config).toEqual({ div: 'test' });

      // Cleanup
      jest.spyOn(handler['patchManager'], 'restoreAll');
      handler.cleanup();
      expect(handler['patchManager'].restoreAll).toHaveBeenCalled();
    });
  });
});
