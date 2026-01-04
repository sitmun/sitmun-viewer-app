import { TestBed } from '@angular/core/testing';
import { SearchSilmeControlHandler } from './search-silme-control.handler';
import { PatchLoaderService } from '../../services/patch-loader.service';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import { AppCfg, AppTasks } from '@api/model/app-cfg';

describe('SearchSilmeControlHandler', () => {
  let handler: SearchSilmeControlHandler;
  let mockPatchLoader: jasmine.SpyObj<PatchLoaderService>;
  let mockTCNamespace: jasmine.SpyObj<TCNamespaceService>;

  beforeEach(() => {
    mockPatchLoader = jasmine.createSpyObj('PatchLoaderService', ['loadPatch', 'isPatchLoaded']);
    mockTCNamespace = jasmine.createSpyObj('TCNamespaceService', ['waitForTC', 'getTC']);

    TestBed.configureTestingModule({
      providers: [
        SearchSilmeControlHandler,
        { provide: PatchLoaderService, useValue: mockPatchLoader },
        { provide: TCNamespaceService, useValue: mockTCNamespace }
      ]
    });

    handler = TestBed.inject(SearchSilmeControlHandler);
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });

  describe('controlIdentifier', () => {
    it('should have correct control type', () => {
      expect(handler.controlIdentifier).toBe('sitna.search.silme.extension');
    });
  });

  describe('requiredPatches', () => {
    it('should have correct patch file', () => {
      expect(handler.requiredPatches).toEqual([
        'assets/js/patch/controls/SearchSilme.js'
      ]);
    });
  });

  describe('loadPatches()', () => {
    it('should wait for TC before loading patches', async () => {
      const mockTC = { control: {} };
      mockTCNamespace.waitForTC.and.returnValue(Promise.resolve(mockTC));
      mockPatchLoader.loadPatch.and.returnValue(Promise.resolve());

      await handler.loadPatches();

      expect(mockTCNamespace.waitForTC).toHaveBeenCalled();
      expect(mockPatchLoader.loadPatch).toHaveBeenCalledWith(
        'assets/js/patch/controls/SearchSilme.js'
      );
    });

    it('should propagate errors', async () => {
      const mockTC = { control: {} };
      mockTCNamespace.waitForTC.and.returnValue(Promise.resolve(mockTC));
      mockPatchLoader.loadPatch.and.returnValue(Promise.reject(new Error('Load failed')));

      await expectAsync(handler.loadPatches()).toBeRejected();
    });

    it('should handle TC wait failure', async () => {
      mockTCNamespace.waitForTC.and.returnValue(Promise.reject(new Error('TC not available')));

      await expectAsync(handler.loadPatches()).toBeRejected();
    });
  });

  describe('buildConfiguration()', () => {
    it('should return configuration with default div', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.search.silme.extension',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({ div: 'search' });
    });

    it('should merge search-specific parameters', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.search.silme.extension',
        parameters: {
          searchUrl: 'https://api.example.com/search',
          searchFields: ['name', 'description'],
          minLength: 3
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        div: 'search',
        searchUrl: 'https://api.example.com/search',
        searchFields: ['name', 'description'],
        minLength: 3
      });
    });

    it('should allow parameters to override div', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.search.silme.extension',
        parameters: {
          div: 'custom-search'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.div).toBe('custom-search');
    });
  });

  describe('isReady()', () => {
    it('should return false when patches not loaded', () => {
      mockPatchLoader.isPatchLoaded.and.returnValue(false);

      expect(handler.isReady()).toBe(false);
    });

    it('should return false when TC.control.SearchSilme not available', () => {
      mockPatchLoader.isPatchLoaded.and.returnValue(true);
      mockTCNamespace.getTC.and.returnValue({ control: {} } as any);

      expect(handler.isReady()).toBe(false);
    });

    it('should return true when patches loaded and control available', () => {
      mockPatchLoader.isPatchLoaded.and.returnValue(true);
      mockTCNamespace.getTC.and.returnValue({
        control: { SearchSilme: {} }
      } as any);

      expect(handler.isReady()).toBe(true);
    });

    it('should return false when TC is undefined', () => {
      mockPatchLoader.isPatchLoaded.and.returnValue(true);
      mockTCNamespace.getTC.and.returnValue(undefined);

      expect(handler.isReady()).toBe(false);
    });

    it('should return false when TC.control is undefined', () => {
      mockPatchLoader.isPatchLoaded.and.returnValue(true);
      mockTCNamespace.getTC.and.returnValue({} as any);

      expect(handler.isReady()).toBe(false);
    });
  });

  describe('Integration', () => {
    it('should handle full SearchSilme workflow', async () => {
      const task: AppTasks = {
        'ui-control': 'sitna.search.silme.extension',
        parameters: {
          searchUrl: 'https://api.example.com/search',
          minLength: 3
        }
      } as any;
      const context: AppCfg = {} as any;

      const mockTC = { control: { SearchSilme: {} } };
      mockTCNamespace.waitForTC.and.returnValue(Promise.resolve(mockTC as any));
      mockTCNamespace.getTC.and.returnValue(mockTC as any);
      mockPatchLoader.loadPatch.and.returnValue(Promise.resolve());
      mockPatchLoader.isPatchLoaded.and.returnValue(true);

      // Load patches
      await handler.loadPatches();
      expect(mockTCNamespace.waitForTC).toHaveBeenCalled();
      expect(mockPatchLoader.loadPatch).toHaveBeenCalled();

      // Should be ready
      expect(handler.isReady()).toBe(true);

      // Build config
      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config?.div).toBe('search');
      expect(config?.searchUrl).toBe('https://api.example.com/search');
      expect(config?.minLength).toBe(3);
    });

    it('should handle workflow when not ready', async () => {
      const task: AppTasks = {
        'ui-control': 'sitna.search.silme.extension',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      mockPatchLoader.isPatchLoaded.and.returnValue(false);
      mockTCNamespace.getTC.and.returnValue(undefined);

      // Not ready
      expect(handler.isReady()).toBe(false);

      // Can still build config (handler doesn't prevent it)
      const config = handler.buildConfiguration(task, context);
      expect(config).toBeDefined();
    });
  });
});

