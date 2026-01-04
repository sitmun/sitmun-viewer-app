import { TestBed } from '@angular/core/testing';
import { ControlHandlerBase } from './control-handler-base';
import { ControlHandler, SitnaControlConfig } from './control-handler.interface';
import { PatchLoaderService } from '../services/patch-loader.service';
import { TCNamespaceService } from '../services/tc-namespace.service';
import { AppCfg, AppTasks } from '@api/model/app-cfg';

/**
 * Concrete test implementation of ControlHandlerBase
 */
class TestControlHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'test.control';
  readonly requiredPatches = ['assets/js/patch/test.js'];

  buildConfiguration(task: AppTasks, context: AppCfg): SitnaControlConfig | null {
    return { div: 'test' };
  }
}

/**
 * Handler with no patches
 */
class NoPatchHandler extends ControlHandlerBase {
  readonly controlIdentifier = 'test.nopatch';
  readonly requiredPatches = undefined;

  buildConfiguration(task: AppTasks, context: AppCfg): SitnaControlConfig | null {
    return { div: 'nopatch' };
  }
}

describe('ControlHandlerBase', () => {
  let handler: TestControlHandler;
  let noPatchHandler: NoPatchHandler;
  let mockPatchLoader: jasmine.SpyObj<PatchLoaderService>;
  let mockTCNamespace: jasmine.SpyObj<TCNamespaceService>;

  beforeEach(() => {
    // Create spies
    mockPatchLoader = jasmine.createSpyObj('PatchLoaderService', [
      'loadPatch',
      'isPatchLoaded'
    ]);
    mockTCNamespace = jasmine.createSpyObj('TCNamespaceService', [
      'waitForTC',
      'waitForTCProperty',
      'getTC'
    ]);

    TestBed.configureTestingModule({
      providers: [
        { provide: PatchLoaderService, useValue: mockPatchLoader },
        { provide: TCNamespaceService, useValue: mockTCNamespace }
      ]
    });

    handler = new TestControlHandler(mockPatchLoader, mockTCNamespace);
    noPatchHandler = new NoPatchHandler(mockPatchLoader, mockTCNamespace);
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
    it('should load all required patches', async () => {
      mockPatchLoader.loadPatch.and.returnValue(Promise.resolve());

      await handler.loadPatches();

      expect(mockPatchLoader.loadPatch).toHaveBeenCalledWith('assets/js/patch/test.js');
      expect(mockPatchLoader.loadPatch).toHaveBeenCalledTimes(1);
    });

    it('should handle no patches gracefully', async () => {
      await noPatchHandler.loadPatches();

      expect(mockPatchLoader.loadPatch).not.toHaveBeenCalled();
    });

    it('should handle patch loading errors', async () => {
      mockPatchLoader.loadPatch.and.returnValue(Promise.reject(new Error('Load failed')));

      await expectAsync(handler.loadPatches()).toBeRejected();
    });

    it('should load multiple patches in parallel', async () => {
      class MultiPatchHandler extends ControlHandlerBase {
        readonly controlIdentifier = 'test.multi';
        readonly requiredPatches = ['patch1.js', 'patch2.js', 'patch3.js'];
        buildConfiguration() { return null; }
      }

      const multiHandler = new MultiPatchHandler(mockPatchLoader, mockTCNamespace);
      mockPatchLoader.loadPatch.and.returnValue(Promise.resolve());

      await multiHandler.loadPatches();

      expect(mockPatchLoader.loadPatch).toHaveBeenCalledTimes(3);
      expect(mockPatchLoader.loadPatch).toHaveBeenCalledWith('patch1.js');
      expect(mockPatchLoader.loadPatch).toHaveBeenCalledWith('patch2.js');
      expect(mockPatchLoader.loadPatch).toHaveBeenCalledWith('patch3.js');
    });
  });

  describe('isReady()', () => {
    it('should return true when no patches required', () => {
      expect(noPatchHandler.isReady()).toBe(true);
    });

    it('should return true when all patches are loaded', () => {
      mockPatchLoader.isPatchLoaded.and.returnValue(true);

      expect(handler.isReady()).toBe(true);
      expect(mockPatchLoader.isPatchLoaded).toHaveBeenCalledWith('assets/js/patch/test.js');
    });

    it('should return false when patches are not loaded', () => {
      mockPatchLoader.isPatchLoaded.and.returnValue(false);

      expect(handler.isReady()).toBe(false);
    });

    it('should check all patches for multi-patch handler', () => {
      class MultiPatchHandler extends ControlHandlerBase {
        readonly controlIdentifier = 'test.multi';
        readonly requiredPatches = ['patch1.js', 'patch2.js'];
        buildConfiguration() { return null; }
      }

      const multiHandler = new MultiPatchHandler(mockPatchLoader, mockTCNamespace);
      mockPatchLoader.isPatchLoaded.and.returnValues(true, false);

      expect(multiHandler.isReady()).toBe(false);
      expect(mockPatchLoader.isPatchLoaded).toHaveBeenCalledTimes(2);
    });
  });

  describe('cleanup()', () => {
    it('should restore all patches', () => {
      spyOn(handler['patchManager'], 'restoreAll');

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
      it('should return config with div', () => {
        const config = handler['getDefaultConfig']('testDiv');

        expect(config).toEqual({ div: 'testDiv' });
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

        expect(result).toEqual({ div: 'test', option1: 'value1', option2: 'value2' });
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
      mockTCNamespace.waitForTC.and.returnValue(Promise.resolve(mockTC));

      let scriptLoaded = false;
      await handler['ensureControlLoaded']({
        dependencies: 'TC',
        loadScript: () => { scriptLoaded = true; },
        controlName: 'TestControl'
      });

      expect(mockTCNamespace.waitForTC).toHaveBeenCalled();
      expect(scriptLoaded).toBe(true);
    });

    it('should return immediately if already loaded', async () => {
      let checkCount = 0;
      let scriptLoaded = false;

      await handler['ensureControlLoaded']({
        checkLoaded: () => { checkCount++; return true; },
        loadScript: () => { scriptLoaded = true; },
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
      const mockTC = { control: { SearchSilme: {} } };
      mockTCNamespace.waitForTC.and.returnValue(Promise.resolve(mockTC));
      mockTCNamespace.waitForTCProperty.and.returnValue(Promise.resolve({}));

      await handler['ensureControlLoaded']({
        dependencies: ['TC', 'TC.control.SearchSilme'],
        loadScript: () => {},
        controlName: 'TestControl'
      });

      expect(mockTCNamespace.waitForTC).toHaveBeenCalled();
      expect(mockTCNamespace.waitForTCProperty).toHaveBeenCalledWith('TC.control.SearchSilme');
    });

    it('should handle function dependencies', async () => {
      let depResolved = false;
      const depFunction = async () => { depResolved = true; };

      await handler['ensureControlLoaded']({
        dependencies: depFunction,
        loadScript: () => {},
        controlName: 'TestControl'
      });

      expect(depResolved).toBe(true);
    });
  });

  describe('waitForTCAndApply()', () => {
    it('should wait for TC and execute callback', async () => {
      const mockTC = { control: {} };
      mockTCNamespace.waitForTC.and.returnValue(Promise.resolve(mockTC));

      let callbackExecuted = false;
      let receivedTC: any;

      await handler['waitForTCAndApply'](async (TC) => {
        callbackExecuted = true;
        receivedTC = TC;
      });

      expect(mockTCNamespace.waitForTC).toHaveBeenCalled();
      expect(callbackExecuted).toBe(true);
      expect(receivedTC).toBe(mockTC);
    });

    it('should handle callback errors', async () => {
      const mockTC = { control: {} };
      mockTCNamespace.waitForTC.and.returnValue(Promise.resolve(mockTC));

      await expectAsync(
        handler['waitForTCAndApply'](async () => {
          throw new Error('Callback error');
        })
      ).toBeRejected();
    });
  });

  describe('Integration', () => {
    it('should handle full lifecycle', async () => {
      mockPatchLoader.loadPatch.and.returnValue(Promise.resolve());
      mockPatchLoader.isPatchLoaded.and.returnValue(true);

      // Load patches
      await handler.loadPatches();

      // Check ready
      expect(handler.isReady()).toBe(true);

      // Build config
      const mockTask: AppTasks = {
        'ui-control': 'test.control',
        parameters: { custom: 'value' }
      } as any;
      const mockContext: AppCfg = {} as any;

      const config = handler.buildConfiguration(mockTask, mockContext);
      expect(config).toEqual({ div: 'test' });

      // Cleanup
      spyOn(handler['patchManager'], 'restoreAll');
      handler.cleanup();
      expect(handler['patchManager'].restoreAll).toHaveBeenCalled();
    });
  });
});

