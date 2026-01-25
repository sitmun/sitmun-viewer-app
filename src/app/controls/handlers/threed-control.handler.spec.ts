import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { ThreeDControlHandler } from './threed-control.handler';
import { AppConfigService } from '../../services/app-config.service';
import { SitnaApiService } from '../../services/sitna-api.service';

describe('ThreeDControlHandler', () => {
  let handler: ThreeDControlHandler;
  let mockSitnaApi: jest.Mocked<SitnaApiService>;
  let mockAppConfigService: jest.Mocked<AppConfigService>;

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
    mockAppConfigService.getControlDefault.mockReturnValue({
      controls: ['sitna.threeD', 'sitna.navBar']
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ThreeDControlHandler,
        { provide: SitnaApiService, useValue: mockSitnaApi },
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
