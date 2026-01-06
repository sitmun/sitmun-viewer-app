import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoadingIndicatorControlHandler } from './loading-indicator-control.handler';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import { AppConfigService } from '../../services/app-config.service';
import { AppCfg, AppTasks } from '@api/model/app-cfg';

describe('LoadingIndicatorControlHandler', () => {
  let handler: LoadingIndicatorControlHandler;
  let mockTCNamespace: jasmine.SpyObj<TCNamespaceService>;
  let mockAppConfigService: jasmine.SpyObj<AppConfigService>;
  let mockAppCfg: AppCfg;

  beforeEach(() => {
    mockTCNamespace = jasmine.createSpyObj('TCNamespaceService', [
      'waitForTC',
      'getTC'
    ]);

    mockAppConfigService = jasmine.createSpyObj('AppConfigService', [
      'getControlDefault'
    ]);
    mockAppConfigService.getControlDefault.and.returnValue(null);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LoadingIndicatorControlHandler,
        { provide: TCNamespaceService, useValue: mockTCNamespace },
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
      mockAppConfigService.getControlDefault.and.returnValue(null);

      const task: AppTasks = {
        'ui-control': 'sitna.loadingIndicator',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toBe(true);
    });

    it('should return boolean true when default config is empty/null (no div in app-config.json)', () => {
      mockAppConfigService.getControlDefault.and.returnValue({});

      const task: AppTasks = {
        'ui-control': 'sitna.loadingIndicator',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toBe(true);
    });

    it('should return config object when custom parameters provided', () => {
      mockAppConfigService.getControlDefault.and.returnValue(null);

      const task: AppTasks = {
        'ui-control': 'sitna.loadingIndicator',
        parameters: {
          customOption: 'value'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config).not.toBe(true);
      expect(typeof config).toBe('object');
      expect(config?.['customOption']).toBe('value');
    });

    it('should support optional div property if included in parameters', () => {
      mockAppConfigService.getControlDefault.and.returnValue(null);

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
      mockAppConfigService.getControlDefault.and.returnValue({
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
      mockAppConfigService.getControlDefault.and.returnValue({
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
      mockAppConfigService.getControlDefault.and.returnValue(null);

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
      expect(config).toBe(true);
    });

    it('should handle full lifecycle with custom parameters', async () => {
      mockAppConfigService.getControlDefault.and.returnValue(null);

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

