import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { FeatureInfoControlHandler } from './feature-info-control.handler';
import { AppConfigService } from '../../services/app-config.service';
import { SitnaApiService } from '../../services/sitna-api.service';

describe('FeatureInfoControlHandler', () => {
  let handler: FeatureInfoControlHandler;
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
      getControlDefault: jest.fn().mockReturnValue({
        displayElevation: true,
        persistentHighlights: true
      })
    } as Partial<
      jest.Mocked<AppConfigService>
    > as jest.Mocked<AppConfigService>;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        FeatureInfoControlHandler,
        { provide: SitnaApiService, useValue: mockSitnaApi },
        { provide: AppConfigService, useValue: mockAppConfigService }
      ]
    });

    handler = TestBed.inject(FeatureInfoControlHandler);
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });

  describe('controlIdentifier', () => {
    it('should have correct control identifier', () => {
      expect(handler.controlIdentifier).toBe('sitna.featureInfo');
    });
  });

  describe('sitnaConfigKey', () => {
    it('should have correct SITNA config key', () => {
      expect(handler.sitnaConfigKey).toBe('featureInfo');
    });
  });

  describe('requiredPatches', () => {
    it('should have no required patches', () => {
      expect(handler.requiredPatches).toBeUndefined();
    });
  });

  describe('buildConfiguration()', () => {
    it('should return default configuration with displayElevation when parameters are empty', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.featureInfo',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        displayElevation: true,
        persistentHighlights: true
      });
      expect(mockAppConfigService.getControlDefault).toHaveBeenCalledWith(
        'sitna.featureInfo'
      );
    });

    it('should include displayElevation from default config', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.featureInfo',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).not.toBeNull();
      expect(config).toHaveProperty('displayElevation', true);
      expect(config).toHaveProperty('persistentHighlights', true);
    });

    it('should merge task parameters with defaults, preserving displayElevation', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.featureInfo',
        parameters: {
          active: true
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        displayElevation: true, // From default config
        persistentHighlights: true, // From default config
        active: true // From task parameters
      });
    });

    it('should allow task parameters to override displayElevation', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.featureInfo',
        parameters: {
          displayElevation: false
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        displayElevation: false, // Overridden by task parameters
        persistentHighlights: true // Kept from default config
      });
    });

    it('should handle displayElevation as object configuration', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.featureInfo',
        parameters: {
          displayElevation: {
            resolution: 20,
            sampleNumber: 10,
            services: ['elevationServiceIDENA']
          }
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        displayElevation: {
          resolution: 20,
          sampleNumber: 10,
          services: ['elevationServiceIDENA']
        },
        persistentHighlights: true // Kept from default config
      });
    });

    it('should return null when default config is not found and parameters are empty', () => {
      mockAppConfigService.getControlDefault.mockReturnValue(null);

      const task: AppTasks = {
        'ui-control': 'sitna.featureInfo',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({});
    });
  });
});
