import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { OfflineMapMakerControlHandler } from './offline-map-maker-control.handler';
import { AppConfigService } from '../../services/app-config.service';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import { UIStateService } from '../../services/ui-state.service';

describe('OfflineMapMakerControlHandler', () => {
  let handler: OfflineMapMakerControlHandler;
  let mockTCNamespace: jasmine.SpyObj<TCNamespaceService>;
  let mockUIStateService: jasmine.SpyObj<UIStateService>;
  let mockAppConfigService: jasmine.SpyObj<AppConfigService>;
  let mockAppCfg: AppCfg;

  beforeEach(() => {
    mockTCNamespace = jasmine.createSpyObj('TCNamespaceService', [
      'waitForTC',
      'getTC'
    ]);

    mockUIStateService = jasmine.createSpyObj('UIStateService', [
      'enableToolsButton'
    ]);

    mockAppConfigService = jasmine.createSpyObj('AppConfigService', [
      'getControlDefault'
    ]);
    mockAppConfigService.getControlDefault.and.returnValue({
      div: 'offline'
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        OfflineMapMakerControlHandler,
        { provide: TCNamespaceService, useValue: mockTCNamespace },
        { provide: UIStateService, useValue: mockUIStateService },
        { provide: AppConfigService, useValue: mockAppConfigService }
      ]
    });

    handler = TestBed.inject(OfflineMapMakerControlHandler);

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
      expect(handler.controlIdentifier).toBe('sitna.offlineMapMaker');
    });
  });

  describe('sitnaConfigKey', () => {
    it('should have correct SITNA config key', () => {
      expect(handler.sitnaConfigKey).toBe('offlineMapMaker');
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
        'ui-control': 'sitna.offlineMapMaker',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({ div: 'offline' });
      expect(mockUIStateService.enableToolsButton).toHaveBeenCalled();
    });

    it('should merge task parameters', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.offlineMapMaker',
        parameters: {
          averageTileSize: 50000,
          offlineMapHintDiv: 'hint-div'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        div: 'offline',
        averageTileSize: 50000,
        offlineMapHintDiv: 'hint-div'
      });
      expect(mockUIStateService.enableToolsButton).toHaveBeenCalled();
    });

    it('should allow parameters to override div', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.offlineMapMaker',
        parameters: {
          div: 'custom-offline-div'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.div).toBe('custom-offline-div');
      expect(mockUIStateService.enableToolsButton).toHaveBeenCalled();
    });

    it('should support averageTileSize parameter', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.offlineMapMaker',
        parameters: {
          averageTileSize: 75000
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.div).toBe('offline');
      expect(config?.['averageTileSize']).toBe(75000);
      expect(mockUIStateService.enableToolsButton).toHaveBeenCalled();
    });

    it('should support offlineMapHintDiv parameter', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.offlineMapMaker',
        parameters: {
          offlineMapHintDiv: 'custom-hint'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.div).toBe('offline');
      expect(config?.['offlineMapHintDiv']).toBe('custom-hint');
      expect(mockUIStateService.enableToolsButton).toHaveBeenCalled();
    });

    it('should always enable tools button', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.offlineMapMaker',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      handler.buildConfiguration(task, context);

      expect(mockUIStateService.enableToolsButton).toHaveBeenCalledTimes(1);
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
      await handler.loadPatches(mockAppCfg);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(10); // Should be instant
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
        'ui-control': 'sitna.offlineMapMaker',
        parameters: {
          averageTileSize: 60000,
          offlineMapHintDiv: 'hint'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);
      expect(config).toBeDefined();
      expect(config?.div).toBe('offline');
      expect(config?.['averageTileSize']).toBe(60000);
      expect(config?.['offlineMapHintDiv']).toBe('hint');
      expect(mockUIStateService.enableToolsButton).toHaveBeenCalled();
    });
  });
});
