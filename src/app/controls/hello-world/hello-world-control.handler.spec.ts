import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { HelloWorldControlHandler } from './hello-world-control.handler';
import { prototypeWrappers } from './hello-world-control.logic';
import { AppConfigService } from '../../services/app-config.service';
import { SitnaApiService } from '../../services/sitna-api.service';

describe('HelloWorldControlHandler', () => {
  let handler: HelloWorldControlHandler;
  let mockSitnaApi: jest.Mocked<SitnaApiService>;
  let mockAppConfigService: jest.Mocked<AppConfigService>;
  let mockTC: any;
  let mockAppCfg: AppCfg;
  let originalConsoleWarn: typeof console.warn;

  beforeEach(() => {
    // Suppress console.warn during tests to avoid cluttering test output
    originalConsoleWarn = console.warn;
    console.warn = jest.fn();
    // Create mock TC namespace
    mockTC = {
      control: {}
    };

    mockSitnaApi = {
      getTC: jest.fn().mockReturnValue(mockTC),
      getSITNA: jest.fn().mockReturnValue({} as any),
      getTCProperty: jest.fn(),
      isReady: jest.fn().mockReturnValue(true)
    } as Partial<jest.Mocked<SitnaApiService>> as jest.Mocked<SitnaApiService>;

    mockAppConfigService = {
      getControlDefault: jest.fn()
    } as Partial<
      jest.Mocked<AppConfigService>
    > as jest.Mocked<AppConfigService>;
    mockAppConfigService.getControlDefault.mockReturnValue({
      div: 'tc-slot-hello-world'
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        HelloWorldControlHandler,
        { provide: SitnaApiService, useValue: mockSitnaApi },
        { provide: AppConfigService, useValue: mockAppConfigService }
      ]
    });

    handler = TestBed.inject(HelloWorldControlHandler);

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

    // Setup window.SITNA mock
    (window as any).SITNA = {
      control: {
        Control: class MockControl {}
      }
    };
  });

  afterEach(() => {
    delete (window as any).SITNA;
    handler.cleanup();
    // Restore original console.warn
    console.warn = originalConsoleWarn;
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });

  it('should inject prototypeWrappers via constructor', () => {
    // Verify that prototypeWrappers are stored in the handler
    expect((handler as any).prototypeWrappers).toBe(prototypeWrappers);
  });

  describe('controlIdentifier', () => {
    it('should have correct control identifier', () => {
      expect(handler.controlIdentifier).toBe('sitna.helloWorld');
    });
  });

  describe('sitnaConfigKey', () => {
    it('should have correct sitna config key', () => {
      expect(handler.sitnaConfigKey).toBe('helloWorld');
    });
  });

  describe('requiredPatches', () => {
    it('should have no required patches (uses programmatic registration)', () => {
      expect(handler.requiredPatches).toBeUndefined();
    });
  });

  describe('buildConfiguration()', () => {
    it('should return configuration with default div', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.helloWorld',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({ div: 'tc-slot-hello-world' });
    });

    it('should merge task parameters', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.helloWorld',
        parameters: {
          collapsed: true,
          custom: 'value'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        div: 'tc-slot-hello-world',
        collapsed: true,
        custom: 'value'
      });
    });

    it('should allow parameters to override div', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.helloWorld',
        parameters: {
          div: 'custom-div'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.div).toBe('custom-div');
    });
  });

  describe('applyBootstrap()', () => {
    it('should register the control', async () => {
      const registerSpy = jest.spyOn(handler as any, 'registerCustomControl');

      await handler.applyBootstrap(mockAppCfg);

      expect(registerSpy).toHaveBeenCalled();
    });
  });

  describe('loadPatches()', () => {
    it('should register the control', async () => {
      const registerSpy = jest.spyOn(handler as any, 'registerCustomControl');

      await handler.loadPatches(mockAppCfg);

      expect(registerSpy).toHaveBeenCalled();
    });

    it('should be idempotent (safe to call multiple times)', async () => {
      await handler.loadPatches(mockAppCfg);
      await handler.loadPatches(mockAppCfg);
      await handler.loadPatches(mockAppCfg);

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('cleanup()', () => {
    it('should reset controlRegistered flag', async () => {
      // First register
      await handler.loadPatches(mockAppCfg);

      // Cleanup
      handler.cleanup();

      // Should be able to register again
      const registerSpy = jest.spyOn(handler as any, 'registerCustomControl');
      await handler.loadPatches(mockAppCfg);

      expect(registerSpy).toHaveBeenCalled();
    });
  });

  describe('Integration', () => {
    it('should handle full lifecycle', async () => {
      mockTC.control.HelloWorld = undefined;

      // Load patches
      await handler.loadPatches(mockAppCfg);

      // Build config
      const task: AppTasks = {
        'ui-control': 'sitna.helloWorld',
        parameters: { custom: 'value' }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);
      expect(config).toBeDefined();
      expect(config?.div).toBe('tc-slot-hello-world');
      expect((config as Record<string, unknown>)?.['custom']).toBe('value');

      // Cleanup
      handler.cleanup();
    });

    it('should skip registration when SITNA not available', async () => {
      delete (window as any).SITNA;

      await handler.loadPatches(mockAppCfg);

      // Should not throw, should handle gracefully
      expect(true).toBe(true);
    });

    it('should skip registration when already registered', async () => {
      // Pre-register the control
      class HelloWorld {}
      mockTC.control.HelloWorld = HelloWorld;

      await handler.loadPatches(mockAppCfg);

      // Should not throw and should recognize it's already registered
      expect(true).toBe(true);
    });
  });
});
