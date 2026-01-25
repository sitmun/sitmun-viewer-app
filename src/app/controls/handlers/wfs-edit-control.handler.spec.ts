import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { WFSEditControlHandler } from './wfs-edit-control.handler';
import { AppConfigService } from '../../services/app-config.service';
import { SitnaApiService } from '../../services/sitna-api.service';

describe('WFSEditControlHandler', () => {
  let handler: WFSEditControlHandler;
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
        WFSEditControlHandler,
        { provide: SitnaApiService, useValue: mockSitnaApi },
        { provide: AppConfigService, useValue: mockAppConfigService }
      ]
    });

    handler = TestBed.inject(WFSEditControlHandler);

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
      expect(handler.controlIdentifier).toBe('sitna.WFSEdit');
    });
  });

  describe('sitnaConfigKey', () => {
    it('should have correct sitna config key', () => {
      expect(handler.sitnaConfigKey).toBe('WFSEdit');
    });
  });

  describe('requiredPatches', () => {
    it('should have no required patches', () => {
      expect(handler.requiredPatches).toBeUndefined();
    });
  });

  describe('buildConfiguration()', () => {
    it('should return configuration with default div when available', () => {
      mockAppConfigService.getControlDefault.mockReturnValue({
        div: 'wfsedit'
      });

      const task: AppTasks = {
        'ui-control': 'sitna.WFSEdit',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config?.div).toBe('wfsedit');
    });

    it('should return empty config when no default div configured', () => {
      mockAppConfigService.getControlDefault.mockReturnValue(null);

      const task: AppTasks = {
        'ui-control': 'sitna.WFSEdit',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config).toEqual({});
    });

    it('should merge task parameters', () => {
      mockAppConfigService.getControlDefault.mockReturnValue({
        div: 'wfsedit'
      });

      const task: AppTasks = {
        'ui-control': 'sitna.WFSEdit',
        parameters: {
          div: 'custom-wfsedit-div',
          customOption: 'value'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config?.div).toBe('custom-wfsedit-div');
      expect(config?.['customOption']).toBe('value');
    });

    it('should allow parameters to override default div', () => {
      mockAppConfigService.getControlDefault.mockReturnValue({
        div: 'wfsedit'
      });

      const task: AppTasks = {
        'ui-control': 'sitna.WFSEdit',
        parameters: {
          div: 'overridden-wfsedit-div'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.div).toBe('overridden-wfsedit-div');
    });

    it('should pass through downloadElevation option', () => {
      mockAppConfigService.getControlDefault.mockReturnValue({
        div: 'wfsedit'
      });

      const task: AppTasks = {
        'ui-control': 'sitna.WFSEdit',
        parameters: {
          downloadElevation: {
            resolution: 20
          }
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.['downloadElevation']).toEqual({ resolution: 20 });
    });

    it('should pass through highlightChanges option', () => {
      mockAppConfigService.getControlDefault.mockReturnValue({
        div: 'wfsedit'
      });

      const task: AppTasks = {
        'ui-control': 'sitna.WFSEdit',
        parameters: {
          highlightChanges: false
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.['highlightChanges']).toBe(false);
    });

    it('should pass through showOriginalFeatures option', () => {
      mockAppConfigService.getControlDefault.mockReturnValue({
        div: 'wfsedit'
      });

      const task: AppTasks = {
        'ui-control': 'sitna.WFSEdit',
        parameters: {
          showOriginalFeatures: true
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.['showOriginalFeatures']).toBe(true);
    });

    it('should pass through snapping option', () => {
      mockAppConfigService.getControlDefault.mockReturnValue({
        div: 'wfsedit'
      });

      const task: AppTasks = {
        'ui-control': 'sitna.WFSEdit',
        parameters: {
          snapping: false
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.['snapping']).toBe(false);
    });

    it('should pass through styles option', () => {
      mockAppConfigService.getControlDefault.mockReturnValue({
        div: 'wfsedit'
      });

      const task: AppTasks = {
        'ui-control': 'sitna.WFSEdit',
        parameters: {
          styles: {
            point: {
              fillColor: '#0000aa',
              radius: 6
            },
            polygon: {
              strokeColor: '#0000aa',
              strokeWidth: 2
            }
          }
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.['styles']).toBeDefined();
      expect(config?.['styles']?.['point']?.fillColor).toBe('#0000aa');
      expect(config?.['styles']?.['polygon']?.strokeColor).toBe('#0000aa');
    });

    it('should pass through all WFSEdit options together', () => {
      mockAppConfigService.getControlDefault.mockReturnValue({
        div: 'wfsedit'
      });

      const task: AppTasks = {
        'ui-control': 'sitna.WFSEdit',
        parameters: {
          div: 'custom-wfsedit',
          downloadElevation: true,
          highlightChanges: false,
          showOriginalFeatures: true,
          snapping: false,
          styles: {
            point: { fillColor: '#ff0000' }
          }
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.div).toBe('custom-wfsedit');
      expect(config?.['downloadElevation']).toBe(true);
      expect(config?.['highlightChanges']).toBe(false);
      expect(config?.['showOriginalFeatures']).toBe(true);
      expect(config?.['snapping']).toBe(false);
      expect(config?.['styles']).toBeDefined();
    });
  });

  describe('Integration', () => {
    it('should handle full lifecycle', async () => {
      mockAppConfigService.getControlDefault.mockReturnValue({
        div: 'wfsedit'
      });

      // Load patches (no-op for native control)
      await handler.loadPatches(mockAppCfg);

      // Build config
      const task: AppTasks = {
        'ui-control': 'sitna.WFSEdit',
        parameters: { custom: 'value' }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);
      expect(config).toBeDefined();
      expect(config?.['custom']).toBe('value');
    });
  });
});
