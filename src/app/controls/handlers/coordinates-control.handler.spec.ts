import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { CoordinatesControlHandler } from './coordinates-control.handler';
import { AppConfigService } from '../../services/app-config.service';
import { SitnaApiService } from '../../services/sitna-api.service';

describe('CoordinatesControlHandler', () => {
  let handler: CoordinatesControlHandler;
  let mockSitnaApi: jest.Mocked<SitnaApiService>;
  let mockAppCfg: AppCfg;
  beforeEach(() => {
    mockSitnaApi = {
      getTC: jest.fn(),
      getSITNA: jest.fn().mockReturnValue({} as any),
      getTCProperty: jest.fn(),
      isReady: jest.fn().mockReturnValue(true)
    } as Partial<jest.Mocked<SitnaApiService>> as jest.Mocked<SitnaApiService>;

    const mockAppConfigService = {
      getControlDefault: jest.fn().mockReturnValue({
        div: 'tc-slot-coordinates',
        position: 'bottom-right',
        showElevation: true
      })
    } as Partial<
      jest.Mocked<AppConfigService>
    > as jest.Mocked<AppConfigService>;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CoordinatesControlHandler,
        { provide: SitnaApiService, useValue: mockSitnaApi },
        { provide: AppConfigService, useValue: mockAppConfigService }
      ]
    });

    handler = TestBed.inject(CoordinatesControlHandler);

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
      expect(handler.controlIdentifier).toBe('sitna.coordinates');
    });
  });

  describe('requiredPatches', () => {
    it('should not require patches', () => {
      expect(handler.requiredPatches).toBeUndefined();
    });
  });

  describe('buildConfiguration()', () => {
    it('should return configuration with default div', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.coordinates',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        div: 'tc-slot-coordinates',
        position: 'bottom-right',
        showElevation: true
      });
    });

    it('should merge task parameters', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.coordinates',
        parameters: {
          position: 'bottom-right',
          showElevation: true
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        div: 'tc-slot-coordinates',
        position: 'bottom-right',
        showElevation: true
      });
    });

    it('should allow parameters to override div', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.coordinates',
        parameters: {
          div: 'custom-div'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.div).toBe('custom-div');
    });
  });

  describe('loadPatches()', () => {
    it('should resolve without loading scripts', async () => {
      await expect(handler.loadPatches(mockAppCfg)).resolves.toBeUndefined();
    });
  });

  describe('Integration', () => {
    it('should handle full lifecycle', async () => {
      // Load patches
      await handler.loadPatches(mockAppCfg);

      // Build config
      const task: AppTasks = {
        'ui-control': 'sitna.coordinates',
        parameters: { custom: 'value' }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);
      expect(config).toBeDefined();
      expect(config?.div).toBe('tc-slot-coordinates');
    });
  });
});
