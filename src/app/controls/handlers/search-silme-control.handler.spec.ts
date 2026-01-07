import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SearchSilmeControlHandler } from './search-silme-control.handler';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import { AppConfigService } from '../../services/app-config.service';
import { AppCfg, AppTasks } from '@api/model/app-cfg';

describe('SearchSilmeControlHandler', () => {
  let handler: SearchSilmeControlHandler;
  let mockTCNamespace: jasmine.SpyObj<TCNamespaceService>;
  let mockAppConfig: jasmine.SpyObj<AppConfigService>;
  let mockAppCfg: AppCfg;

  beforeEach(() => {
    // Reset window patches
    (window as any).__patchesLoaded = {};
    
    mockTCNamespace = jasmine.createSpyObj('TCNamespaceService', [
      'waitForTC',
      'getTC'
    ]);
    mockAppConfig = jasmine.createSpyObj('AppConfigService', [
      'getControlDefault'
    ]);
    mockAppConfig.getControlDefault.and.returnValue({ div: 'search' });
    
    const mockTC = {
      control: { SearchSilme: {} },
      syncLoadJS: jasmine.createSpy('syncLoadJS')
    };
    (window as any).TC = mockTC;
    mockTCNamespace.waitForTC.and.returnValue(Promise.resolve(mockTC as any));
    mockTCNamespace.getTC.and.returnValue(mockTC as any);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SearchSilmeControlHandler,
        { provide: TCNamespaceService, useValue: mockTCNamespace },
        { provide: AppConfigService, useValue: mockAppConfig }
      ]
    });

    handler = TestBed.inject(SearchSilmeControlHandler);

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
    it('should have correct control type', () => {
      expect(handler.controlIdentifier).toBe('sitna.search.silme.extension');
    });
  });

  describe('requiredPatches', () => {
    it('should have SearchSilme.js patch file', () => {
      expect(handler.requiredPatches).toEqual([
        'assets/js/patch/controls/SearchSilme.js'
      ]);
    });
  });

  describe('loadPatches()', () => {
    beforeEach(() => {
      // Mock script loading
      spyOn(document, 'createElement').and.returnValue({
        src: '',
        async: false,
        onload: null,
        onerror: null
      } as any);
      spyOn(document.head, 'appendChild');
    });

    it('should load patch file when not already loaded', async () => {
      (window as any).__patchesLoaded = {};
      
      await handler.loadPatches(mockAppCfg);
      
      expect(mockTCNamespace.waitForTC).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('script');
    });

    it('should skip loading if patch already loaded', async () => {
      (window as any).__patchesLoaded = { SearchSilme: true };
      
      await handler.loadPatches(mockAppCfg);
      
      // Should not create script element if already loaded
      expect(document.createElement).not.toHaveBeenCalled();
    });

    it('should mark patch as loaded after loading', async () => {
      (window as any).__patchesLoaded = {};
      const script = document.createElement('script') as any;
      (document.createElement as jasmine.Spy).and.returnValue(script);
      
      await handler.loadPatches(mockAppCfg);
      
      // Simulate script load
      if (script.onload) {
        script.onload();
      }
      
      expect((window as any).__patchesLoaded.SearchSilme).toBeDefined();
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
    it('should return false when patch not loaded', () => {
      expect(handler.isReady()).toBe(false);
    });

    it('should return true when patch is loaded and control exists', async () => {
      (window as any).__patchesLoaded = { SearchSilme: true };
      
      await handler.loadPatches(mockAppCfg);
      
      expect(handler.isReady()).toBe(true);
    });

    it('should return false when patch loaded but control missing', async () => {
      (window as any).__patchesLoaded = { SearchSilme: true };
      mockTCNamespace.getTC.and.returnValue({ control: {} } as any);
      
      await handler.loadPatches(mockAppCfg);
      
      expect(handler.isReady()).toBe(false);
    });
  });

  describe('Integration', () => {
    beforeEach(() => {
      // Mock script loading
      spyOn(document, 'createElement').and.returnValue({
        src: '',
        async: false,
        onload: null,
        onerror: null
      } as any);
      spyOn(document.head, 'appendChild');
    });

    it('should handle full SearchSilme workflow', async () => {
      const task: AppTasks = {
        'ui-control': 'sitna.search.silme.extension',
        parameters: {
          searchUrl: 'https://api.example.com/search',
          minLength: 3
        }
      } as any;
      const context: AppCfg = {} as any;

      (window as any).__patchesLoaded = {};
      const script = document.createElement('script') as any;
      (document.createElement as jasmine.Spy).and.returnValue(script);

      // Load patches
      await handler.loadPatches(context);
      
      // Wait for ensureControlLoaded to complete (uses timeout internally)
      await new Promise(resolve => setTimeout(resolve, 0));

      // Should be ready
      expect(handler.isReady()).toBe(true);

      // Build config
      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config?.div).toBe('search');
      expect(config?.searchUrl).toBe('https://api.example.com/search');
      expect(config?.minLength).toBe(3);
    });

    it('should handle workflow when patch already loaded', async () => {
      const task: AppTasks = {
        'ui-control': 'sitna.search.silme.extension',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      (window as any).__patchesLoaded = { SearchSilme: true };

      // Load patches (should skip actual loading)
      await handler.loadPatches(context);

      // Should be ready
      expect(handler.isReady()).toBe(true);

      // Can build config
      const config = handler.buildConfiguration(task, context);
      expect(config).toBeDefined();
    });
  });
});
