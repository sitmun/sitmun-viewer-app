import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ClickControlHandler } from './click-control.handler';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import { AppConfigService } from '../../services/app-config.service';
import { AppCfg, AppTasks } from '@api/model/app-cfg';

describe('ClickControlHandler', () => {
  let handler: ClickControlHandler;
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
        ClickControlHandler,
        { provide: TCNamespaceService, useValue: mockTCNamespace },
        { provide: AppConfigService, useValue: mockAppConfigService }
      ]
    });

    handler = TestBed.inject(ClickControlHandler);

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
      expect(handler.controlIdentifier).toBe('sitna.click');
    });
  });

  describe('sitnaConfigKey', () => {
    it('should have correct SITNA config key', () => {
      expect(handler.sitnaConfigKey).toBe('click');
    });
  });

  describe('requiredPatches', () => {
    it('should have no required patches', () => {
      expect(handler.requiredPatches).toBeUndefined();
    });
  });

  describe('buildConfiguration()', () => {
    it('should return boolean true when task is present', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.click',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config as any).toBe(true);
    });

    it('should return true even with parameters (parameters are ignored)', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.click',
        parameters: {
          someParam: 'value'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config as any).toBe(true);
    });

    it('should return true with empty parameters', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.click',
        parameters: null
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config as any).toBe(true);
    });
  });

  describe('isReady()', () => {
    it('should always return true (no patches)', () => {
      expect(handler.isReady()).toBe(true);
    });
  });

  describe('getDefaultValueWhenMissing()', () => {
    it('should return false via base class when control is not requested', () => {
      // Base class returns false by default
      const defaultValue = (handler as any).getDefaultValueWhenMissing();
      expect(defaultValue).toBe(false);
    });
  });

  describe('Integration', () => {
    it('should handle full lifecycle', async () => {
      // Load patches (no-op for native control)
      await handler.loadPatches(mockAppCfg);

      // Should be ready immediately
      expect(handler.isReady()).toBe(true);

      // Build config
      const task: AppTasks = {
        'ui-control': 'sitna.click',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);
      expect(config as any).toBe(true);
    });
  });
});
