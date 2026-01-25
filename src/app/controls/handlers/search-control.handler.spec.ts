import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { SearchControlHandler } from './search-control.handler';
import { AppConfigService } from '../../services/app-config.service';
import { SitnaApiService } from '../../services/sitna-api.service';

describe('SearchControlHandler', () => {
  let handler: SearchControlHandler;
  let mockSitnaApi: jest.Mocked<SitnaApiService>;
  let mockAppConfig: jest.Mocked<AppConfigService>;
  let _mockAppCfg: AppCfg;

  beforeEach(() => {
    mockSitnaApi = {
      getTC: jest.fn(),
      getSITNA: jest.fn().mockReturnValue({} as any),
      getTCProperty: jest.fn(),
      isReady: jest.fn().mockReturnValue(true)
    } as Partial<jest.Mocked<SitnaApiService>> as jest.Mocked<SitnaApiService>;
    mockAppConfig = {
      getControlDefault: jest.fn().mockReturnValue({ div: 'tc-slot-search' })
    } as Partial<
      jest.Mocked<AppConfigService>
    > as jest.Mocked<AppConfigService>;

    const mockTC = {
      control: { Search: {} }
    };
    (window as any).TC = mockTC;
    mockSitnaApi.getTC.mockReturnValue(mockTC as any);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SearchControlHandler,
        { provide: SitnaApiService, useValue: mockSitnaApi },
        { provide: AppConfigService, useValue: mockAppConfig }
      ]
    });

    handler = TestBed.inject(SearchControlHandler);

    _mockAppCfg = {
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
      expect(handler.controlIdentifier).toBe('sitna.search');
    });
  });

  describe('requiredPatches', () => {
    it('should have no patches (native control)', () => {
      expect(handler.requiredPatches).toBeUndefined();
    });
  });

  describe('buildConfiguration()', () => {
    it('should return configuration with default div', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.search',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({ div: 'tc-slot-search' });
    });

    it('should merge search-specific parameters', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.search',
        parameters: {
          searchUrl: 'https://api.example.com/search',
          searchFields: ['name', 'description'],
          minLength: 3
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        div: 'tc-slot-search',
        searchUrl: 'https://api.example.com/search',
        searchFields: ['name', 'description'],
        minLength: 3
      });
    });

    it('should allow parameters to override div', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.search',
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
    it('should return true when native control exists', () => {
      expect(handler.isReady()).toBe(true);
    });

    it('should return false when native control missing', () => {
      mockSitnaApi.getTC.mockReturnValue({ control: {} } as any);

      expect(handler.isReady()).toBe(false);
    });

    it('should return false when TC namespace not available', () => {
      mockSitnaApi.getTC.mockReturnValue(null);

      expect(handler.isReady()).toBe(false);
    });
  });

  describe('Integration', () => {
    it('should handle full native search workflow', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.search',
        parameters: {
          searchUrl: 'https://api.example.com/search',
          minLength: 3
        }
      } as any;
      const context: AppCfg = {} as any;

      // Should be ready (native control)
      expect(handler.isReady()).toBe(true);

      // Build config
      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config?.div).toBe('tc-slot-search');
      expect(config?.searchUrl).toBe('https://api.example.com/search');
      expect(config?.minLength).toBe(3);
    });
  });
});
