import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { LoadingIndicatorControlHandler } from './loading-indicator-control.handler';
import { AppConfigService } from '../../services/app-config.service';
import { SitnaApiService } from '../../services/sitna-api.service';

describe('LoadingIndicatorControlHandler', () => {
  let handler: LoadingIndicatorControlHandler;
  let mockSitnaApi: jest.Mocked<SitnaApiService>;
  let mockAppConfigService: jest.Mocked<AppConfigService>;
  let mockAppCfg: AppCfg;

  beforeEach(() => {
    mockSitnaApi = {
      getTC: jest.fn(),
      getSITNA: jest.fn().mockReturnValue({} as any),
      getTCProperty: jest.fn(),
      isReady: jest.fn().mockReturnValue(true)
    } as Partial<jest.Mocked<SitnaApiService>> as jest.Mocked<SitnaApiService>;

    mockAppConfigService = {
      getControlDefault: jest.fn()
    } as Partial<
      jest.Mocked<AppConfigService>
    > as jest.Mocked<AppConfigService>;
    mockAppConfigService.getControlDefault.mockReturnValue(null);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LoadingIndicatorControlHandler,
        { provide: SitnaApiService, useValue: mockSitnaApi },
        { provide: AppConfigService, useValue: mockAppConfigService }
      ]
    });

    handler = TestBed.inject(LoadingIndicatorControlHandler);

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
      expect(handler.controlIdentifier).toBe('sitna.loadingIndicator');
    });
  });

  describe('sitnaConfigKey', () => {
    it('should have correct sitna config key', () => {
      expect(handler.sitnaConfigKey).toBe('loadingIndicator');
    });
  });

  describe('requiredPatches', () => {
    it('should have no required patches', () => {
      expect(handler.requiredPatches).toBeUndefined();
    });
  });

  describe('buildConfiguration()', () => {
    it('should return boolean true when no parameters provided (default case)', () => {
      mockAppConfigService.getControlDefault.mockReturnValue(null);

      const task: AppTasks = {
        'ui-control': 'sitna.loadingIndicator',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config as any).toBe(true);
    });

    it('should return boolean true when default config is empty/null (no div in app-config.json)', () => {
      mockAppConfigService.getControlDefault.mockReturnValue({});

      const task: AppTasks = {
        'ui-control': 'sitna.loadingIndicator',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config as any).toBe(true);
    });

    it('should return config object when custom parameters provided', () => {
      mockAppConfigService.getControlDefault.mockReturnValue(null);

      const task: AppTasks = {
        'ui-control': 'sitna.loadingIndicator',
        parameters: {
          customOption: 'value'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config as any).not.toBe(true);
      expect(typeof config).toBe('object');
      expect(config?.['customOption']).toBe('value');
    });

    it('should support optional div property if included in parameters', () => {
      mockAppConfigService.getControlDefault.mockReturnValue(null);

      const task: AppTasks = {
        'ui-control': 'sitna.loadingIndicator',
        parameters: {
          div: 'custom-loading-indicator-div'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
      expect(config?.div).toBe('custom-loading-indicator-div');
    });

    it('should merge default config with task parameters when both provided', () => {
      mockAppConfigService.getControlDefault.mockReturnValue({
        div: 'default-loading-indicator'
      });

      const task: AppTasks = {
        'ui-control': 'sitna.loadingIndicator',
        parameters: {
          customOption: 'value'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
      expect(config?.div).toBe('default-loading-indicator');
      expect(config?.['customOption']).toBe('value');
    });

    it('should allow parameters to override default config', () => {
      mockAppConfigService.getControlDefault.mockReturnValue({
        div: 'default-loading-indicator'
      });

      const task: AppTasks = {
        'ui-control': 'sitna.loadingIndicator',
        parameters: {
          div: 'overridden-loading-indicator-div'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
      expect(config?.div).toBe('overridden-loading-indicator-div');
    });
  });

  describe('isReady()', () => {
    it('should always return true (no patches)', () => {
      expect(handler.isReady()).toBe(true);
    });
  });

  describe('Integration', () => {
    it('should handle full lifecycle', async () => {
      mockAppConfigService.getControlDefault.mockReturnValue(null);

      // Load patches (no-op for native control)
      await handler.loadPatches(mockAppCfg);

      // Should be ready immediately
      expect(handler.isReady()).toBe(true);

      // Build config with no parameters (should return true)
      const task: AppTasks = {
        'ui-control': 'sitna.loadingIndicator',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);
      expect(config as any).toBe(true);
    });

    it('should handle full lifecycle with custom parameters', async () => {
      mockAppConfigService.getControlDefault.mockReturnValue(null);

      // Load patches (no-op for native control)
      await handler.loadPatches(mockAppCfg);

      // Should be ready immediately
      expect(handler.isReady()).toBe(true);

      // Build config with custom parameters
      const task: AppTasks = {
        'ui-control': 'sitna.loadingIndicator',
        parameters: { custom: 'value' }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);
      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
      expect(config?.['custom']).toBe('value');
    });
  });

  describe('getDefaultValueWhenMissing()', () => {
    it('should return false when task is not present (inherits from base class)', () => {
      const defaultValue = (handler as any).getDefaultValueWhenMissing();

      expect(defaultValue).toBe(false);
    });

    it('should never return undefined', () => {
      const defaultValue = (handler as any).getDefaultValueWhenMissing();

      expect(defaultValue).not.toBeUndefined();
      expect(defaultValue).toBeDefined();
    });
  });
});
