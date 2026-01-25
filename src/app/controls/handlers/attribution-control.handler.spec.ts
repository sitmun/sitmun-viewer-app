import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { AttributionControlHandler } from './attribution-control.handler';
import { AppConfigService } from '../../services/app-config.service';
import { SitnaApiService } from '../../services/sitna-api.service';

describe('AttributionControlHandler', () => {
  let handler: AttributionControlHandler;
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
      getControlDefault: jest.fn().mockReturnValue(null),
      getAttribution: jest.fn().mockReturnValue(null)
    } as Partial<
      jest.Mocked<AppConfigService>
    > as jest.Mocked<AppConfigService>;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AttributionControlHandler,
        { provide: SitnaApiService, useValue: mockSitnaApi },
        { provide: AppConfigService, useValue: mockAppConfigService }
      ]
    });

    handler = TestBed.inject(AttributionControlHandler);

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
      expect(handler.controlIdentifier).toBe('sitna.attribution');
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
        div: 'attribution'
      });

      const task: AppTasks = {
        'ui-control': 'sitna.attribution',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config?.div).toBe('attribution');
    });

    it('should return empty config when no default div configured', () => {
      mockAppConfigService.getControlDefault.mockReturnValue(null);

      const task: AppTasks = {
        'ui-control': 'sitna.attribution',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config).toEqual({});
    });

    it('should merge task parameters', () => {
      mockAppConfigService.getControlDefault.mockReturnValue({
        div: 'attribution'
      });

      const task: AppTasks = {
        'ui-control': 'sitna.attribution',
        parameters: {
          div: 'custom-attribution-div',
          dataAttributions: [{ name: 'Custom', site: 'https://example.com' }]
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config?.div).toBe('custom-attribution-div');
      expect(config?.['dataAttributions']).toBeDefined();
    });

    it('should allow parameters to override default div', () => {
      mockAppConfigService.getControlDefault.mockReturnValue({
        div: 'default-attribution'
      });

      const task: AppTasks = {
        'ui-control': 'sitna.attribution',
        parameters: {
          div: 'overridden-attribution-div'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.div).toBe('overridden-attribution-div');
    });
  });

  describe('Integration', () => {
    it('should handle full lifecycle', async () => {
      mockAppConfigService.getControlDefault.mockReturnValue({
        div: 'attribution'
      });

      // Load patches (no-op for native control)
      await handler.loadPatches(mockAppCfg);

      // Build config
      const task: AppTasks = {
        'ui-control': 'sitna.attribution',
        parameters: { custom: 'value' }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);
      expect(config).toBeDefined();
      expect(config?.['custom']).toBe('value');
    });
  });

  describe('getDefaultValueWhenMissing()', () => {
    it('should return false when attribution text is not configured', () => {
      mockAppConfigService.getAttribution.mockReturnValue(null);

      const defaultValue = (handler as any).getDefaultValueWhenMissing();

      expect(defaultValue).toBe(false);
    });

    it('should return true when attribution text is configured but no default div', () => {
      mockAppConfigService.getAttribution.mockReturnValue(
        '<a href="https://github.com/sitmun" target="_blank">SITMUN</a>'
      );
      mockAppConfigService.getControlDefault.mockReturnValue(null);

      const defaultValue = (handler as any).getDefaultValueWhenMissing();

      expect(defaultValue).toBe(true);
    });

    it('should return config object when attribution text is configured with default div', () => {
      mockAppConfigService.getAttribution.mockReturnValue(
        '<a href="https://github.com/sitmun" target="_blank">SITMUN</a>'
      );
      mockAppConfigService.getControlDefault.mockReturnValue({
        div: 'attribution'
      });

      const defaultValue = (handler as any).getDefaultValueWhenMissing();

      expect(defaultValue).toBeDefined();
      expect(typeof defaultValue).toBe('object');
      expect(defaultValue.div).toBe('attribution');
    });

    it('should return false when attribution text is empty string', () => {
      mockAppConfigService.getAttribution.mockReturnValue('');

      const defaultValue = (handler as any).getDefaultValueWhenMissing();

      expect(defaultValue).toBe(false);
    });
  });
});
