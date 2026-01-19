import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { BasemapSelectorControlHandler } from './basemap-selector-control.handler';
import { AppConfigService } from '../../services/app-config.service';
import { TCNamespaceService } from '../../services/tc-namespace.service';

describe('BasemapSelectorControlHandler', () => {
  let handler: BasemapSelectorControlHandler;
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
    mockAppConfigService.getControlDefault.mockReturnValue({ div: 'bms' });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        BasemapSelectorControlHandler,
        { provide: TCNamespaceService, useValue: mockTCNamespace },
        { provide: AppConfigService, useValue: mockAppConfigService }
      ]
    });

    handler = TestBed.inject(BasemapSelectorControlHandler);

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
      expect(handler.controlIdentifier).toBe('sitna.basemapSelector');
    });
  });

  describe('requiredPatches', () => {
    it('should have no required patches', () => {
      expect(handler.requiredPatches).toBeUndefined();
    });
  });

  describe('buildConfiguration()', () => {
    it('should return configuration with default div', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.basemapSelector',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({ div: 'bms' });
    });

    it('should merge task parameters', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.basemapSelector',
        parameters: {
          position: 'top-right',
          collapsed: true
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        div: 'bms',
        position: 'top-right',
        collapsed: true
      });
    });

    it('should allow parameters to override div', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.basemapSelector',
        parameters: {
          div: 'custom-div'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.div).toBe('custom-div');
    });
  });

  describe('isReady()', () => {
    it('should always return true (no patches)', () => {
      expect(handler.isReady()).toBe(true);
    });
  });

  describe('loadPatches()', () => {
    it('should resolve successfully with context', async () => {
      await handler.loadPatches(mockAppCfg);
      // Default implementation does nothing, just resolves
      expect(true).toBe(true);
    });

    it('should resolve immediately', async () => {
      const start = Date.now();
      await handler.loadPatches({} as AppCfg);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(10); // Should be instant
    });
  });

  describe('Integration', () => {
    it('should handle full lifecycle', async () => {
      // Load patches (no-op for native control)
      await handler.loadPatches({} as AppCfg);

      // Should be ready immediately
      expect(handler.isReady()).toBe(true);

      // Build config
      const task: AppTasks = {
        'ui-control': 'sitna.basemapSelector',
        parameters: { custom: 'value' }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);
      expect(config).toBeDefined();
      expect(config?.div).toBe('bms');
    });
  });
});
