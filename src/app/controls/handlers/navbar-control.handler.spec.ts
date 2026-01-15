import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NavBarControlHandler } from './navbar-control.handler';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import { AppConfigService } from '../../services/app-config.service';
import { AppCfg, AppTasks } from '@api/model/app-cfg';

describe('NavBarControlHandler', () => {
  let handler: NavBarControlHandler;
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
        NavBarControlHandler,
        { provide: TCNamespaceService, useValue: mockTCNamespace },
        { provide: AppConfigService, useValue: mockAppConfigService }
      ]
    });

    handler = TestBed.inject(NavBarControlHandler);

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
      expect(handler.controlIdentifier).toBe('sitna.navBar');
    });
  });

  describe('sitnaConfigKey', () => {
    it('should have correct sitna config key', () => {
      expect(handler.sitnaConfigKey).toBe('navBar');
    });
  });

  describe('requiredPatches', () => {
    it('should have no required patches', () => {
      expect(handler.requiredPatches).toBeUndefined();
    });
  });

  describe('buildConfiguration()', () => {
    it('should return configuration with default div when available', () => {
      mockAppConfigService.getControlDefault.and.returnValue({
        div: 'nav'
      });

      const task: AppTasks = {
        'ui-control': 'sitna.navBar',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config?.div).toBe('nav');
    });

    it('should return empty config when no default div configured', () => {
      mockAppConfigService.getControlDefault.and.returnValue(null);

      const task: AppTasks = {
        'ui-control': 'sitna.navBar',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config).toEqual({});
    });

    it('should merge task parameters', () => {
      mockAppConfigService.getControlDefault.and.returnValue({
        div: 'nav'
      });

      const task: AppTasks = {
        'ui-control': 'sitna.navBar',
        parameters: {
          div: 'custom-nav-div',
          customOption: 'value'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config?.div).toBe('custom-nav-div');
      expect(config?.['customOption']).toBe('value');
    });

    it('should allow parameters to override default div', () => {
      mockAppConfigService.getControlDefault.and.returnValue({
        div: 'nav'
      });

      const task: AppTasks = {
        'ui-control': 'sitna.navBar',
        parameters: {
          div: 'overridden-nav-div'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.div).toBe('overridden-nav-div');
    });
  });

  describe('isReady()', () => {
    it('should always return true (no patches)', () => {
      expect(handler.isReady()).toBe(true);
    });
  });

  describe('Integration', () => {
    it('should handle full lifecycle', async () => {
      mockAppConfigService.getControlDefault.and.returnValue({
        div: 'nav'
      });

      // Load patches (no-op for native control)
      await handler.loadPatches(mockAppCfg);

      // Should be ready immediately
      expect(handler.isReady()).toBe(true);

      // Build config
      const task: AppTasks = {
        'ui-control': 'sitna.navBar',
        parameters: { custom: 'value' }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);
      expect(config).toBeDefined();
      expect(config?.['custom']).toBe('value');
    });
  });
});
