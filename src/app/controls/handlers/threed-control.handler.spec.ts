import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { ThreeDControlHandler } from './threed-control.handler';
import { AppConfigService } from '../../services/app-config.service';
import { TCNamespaceService } from '../../services/tc-namespace.service';

describe('ThreeDControlHandler', () => {
  let handler: ThreeDControlHandler;
  let mockTCNamespace: jasmine.SpyObj<TCNamespaceService>;
  let mockAppConfigService: jasmine.SpyObj<AppConfigService>;

  beforeEach(() => {
    mockTCNamespace = jasmine.createSpyObj('TCNamespaceService', [
      'waitForTC',
      'getTC'
    ]);

    mockAppConfigService = jasmine.createSpyObj('AppConfigService', [
      'getControlDefault'
    ]);
    mockAppConfigService.getControlDefault.and.returnValue({
      controls: ['sitna.threeD', 'sitna.navBar']
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ThreeDControlHandler,
        { provide: TCNamespaceService, useValue: mockTCNamespace },
        { provide: AppConfigService, useValue: mockAppConfigService }
      ]
    });

    handler = TestBed.inject(ThreeDControlHandler);
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });

  describe('controlIdentifier', () => {
    it('should have correct control identifier', () => {
      expect(handler.controlIdentifier).toBe('sitna.threed');
    });
  });

  describe('sitnaConfigKey', () => {
    it('should have explicit SITNA config key', () => {
      expect(handler.sitnaConfigKey).toBe('threeD');
    });
  });

  describe('requiredPatches', () => {
    it('should have no required patches', () => {
      expect(handler.requiredPatches).toBeUndefined();
    });
  });

  describe('buildConfiguration()', () => {
    it('should return true for auto-placement', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.threed',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config as any).toBe(true);
    });

    it('should always return true regardless of parameters', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.threed',
        parameters: { someParam: 'value' }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      // Auto-placement pattern always returns true
      expect(config as any).toBe(true);
    });
  });

  describe('isReady()', () => {
    it('should always return true (no patches)', () => {
      expect(handler.isReady()).toBe(true);
    });
  });

  describe('Integration', () => {
    it('should handle full lifecycle', async () => {
      // Load patches (no-op for native control)
      await handler.loadPatches({} as any);
      expect(handler.isReady()).toBe(true);

      const task: AppTasks = {
        'ui-control': 'sitna.threed',
        parameters: {}
      } as any;

      const config = handler.buildConfiguration(task, {} as any);
      expect(config as any).toBe(true);
    });
  });
});
