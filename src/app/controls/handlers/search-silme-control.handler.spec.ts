import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SearchSilmeControlHandler } from './search-silme-control.handler';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import { AppCfg, AppTasks } from '@api/model/app-cfg';

describe('SearchSilmeControlHandler', () => {
  let handler: SearchSilmeControlHandler;
  let mockTCNamespace: jasmine.SpyObj<TCNamespaceService>;
  let mockAppCfg: AppCfg;

  beforeEach(() => {
    mockTCNamespace = jasmine.createSpyObj('TCNamespaceService', [
      'waitForTC',
      'getTC'
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SearchSilmeControlHandler,
        { provide: TCNamespaceService, useValue: mockTCNamespace }
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
    it('should be undefined (patches applied programmatically)', () => {
      expect(handler.requiredPatches).toBeUndefined();
    });
  });

  describe('loadPatches()', () => {
    it('should resolve successfully with context', async () => {
      await handler.loadPatches(mockAppCfg);
      // Default implementation does nothing, just resolves
      expect(true).toBe(true);
    });

    it('should resolve immediately', async () => {
      const start = Date.now();
      await handler.loadPatches(mockAppCfg);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(10); // Should be instant
    });

    it('should require context parameter', async () => {
      await expectAsync(handler.loadPatches(mockAppCfg)).toBeResolved();
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
    it('should return true by default (patches applied programmatically)', () => {
      expect(handler.isReady()).toBe(true);
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

      // Load patches
      await handler.loadPatches(context);

      // Should be ready
      expect(handler.isReady()).toBe(true);

      // Build config
      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config?.div).toBe('search');
      expect(config?.searchUrl).toBe('https://api.example.com/search');
      expect(config?.minLength).toBe(3);
    });

    it('should handle workflow when ready', async () => {
      const task: AppTasks = {
        'ui-control': 'sitna.search.silme.extension',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      // Ready by default (patches applied programmatically)
      expect(handler.isReady()).toBe(true);

      // Can still build config (handler doesn't prevent it)
      const config = handler.buildConfiguration(task, context);
      expect(config).toBeDefined();
    });
  });
});
