import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { StreetViewControlHandler } from './street-view-control.handler';
import { AppConfigService } from '../../services/app-config.service';
import { TCNamespaceService } from '../../services/tc-namespace.service';

describe('StreetViewControlHandler', () => {
  let handler: StreetViewControlHandler;
  let mockTCNamespace: jest.Mocked<TCNamespaceService>;
  let mockAppConfigService: jest.Mocked<AppConfigService>;
  let mockAppCfg: AppCfg;

  beforeEach(() => {
    mockTCNamespace = {
      waitForTC: jest.fn(),
      waitForTCProperty: jest.fn(),
      getTC: jest.fn(),
      isTCReady: jest.fn().mockReturnValue(true)
    } as Partial<
      jest.Mocked<TCNamespaceService>
    > as jest.Mocked<TCNamespaceService>;

    mockAppConfigService = {
      getControlDefault: jest.fn()
    } as Partial<
      jest.Mocked<AppConfigService>
    > as jest.Mocked<AppConfigService>;
    mockAppConfigService.getControlDefault.mockReturnValue(null);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        StreetViewControlHandler,
        { provide: TCNamespaceService, useValue: mockTCNamespace },
        { provide: AppConfigService, useValue: mockAppConfigService }
      ]
    });

    handler = TestBed.inject(StreetViewControlHandler);

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
      expect(handler.controlIdentifier).toBe('sitna.streetView');
    });
  });

  describe('sitnaConfigKey', () => {
    it('should have correct sitna config key', () => {
      expect(handler.sitnaConfigKey).toBe('streetView');
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
        div: 'streetview'
      });

      const task: AppTasks = {
        'ui-control': 'sitna.streetView',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config?.div).toBe('streetview');
    });

    it('should return empty config when no default div configured', () => {
      mockAppConfigService.getControlDefault.mockReturnValue(null);

      const task: AppTasks = {
        'ui-control': 'sitna.streetView',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config).toEqual({});
    });

    it('should merge task parameters including streetView-specific options', () => {
      mockAppConfigService.getControlDefault.mockReturnValue({
        div: 'streetview'
      });

      const task: AppTasks = {
        'ui-control': 'sitna.streetView',
        parameters: {
          div: 'custom-streetview-div',
          googleMapsKey: 'AIzaSyExampleKey',
          viewDiv: 'streetview-container'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config?.div).toBe('custom-streetview-div');
      expect(config?.['googleMapsKey']).toBe('AIzaSyExampleKey');
      expect(config?.['viewDiv']).toBe('streetview-container');
    });

    it('should allow parameters to override default div', () => {
      mockAppConfigService.getControlDefault.mockReturnValue({
        div: 'streetview'
      });

      const task: AppTasks = {
        'ui-control': 'sitna.streetView',
        parameters: {
          div: 'overridden-streetview-div'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.div).toBe('overridden-streetview-div');
    });
  });

  describe('isReady()', () => {
    it('should always return true (no patches)', () => {
      expect(handler.isReady()).toBe(true);
    });
  });

  describe('Integration', () => {
    it('should handle full lifecycle', async () => {
      mockAppConfigService.getControlDefault.mockReturnValue({
        div: 'streetview'
      });

      // Load patches (no-op for native control)
      await handler.loadPatches(mockAppCfg);

      // Should be ready immediately
      expect(handler.isReady()).toBe(true);

      // Build config
      const task: AppTasks = {
        'ui-control': 'sitna.streetView',
        parameters: {
          googleMapsKey: 'AIzaSyExampleKey',
          viewDiv: 'streetview-container'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);
      expect(config).toBeDefined();
      expect(config?.['googleMapsKey']).toBe('AIzaSyExampleKey');
      expect(config?.['viewDiv']).toBe('streetview-container');
    });
  });
});
