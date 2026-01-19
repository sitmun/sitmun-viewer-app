import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { MultiFeatureInfoControlHandler } from './multi-feature-info-control.handler';
import { AppConfigService } from '../../services/app-config.service';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import { UIStateService } from '../../services/ui-state.service';

describe('MultiFeatureInfoControlHandler', () => {
  let handler: MultiFeatureInfoControlHandler;
  let mockTCNamespace: jest.Mocked<TCNamespaceService>;
  let mockUIStateService: jest.Mocked<UIStateService>;
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

    mockUIStateService = {
      enableToolsButton: jest.fn()
    } as Partial<jest.Mocked<UIStateService>> as jest.Mocked<UIStateService>;

    mockAppConfigService = {
      getControlDefault: jest.fn().mockReturnValue({
        div: 'multifeatureinfo'
      })
    } as Partial<
      jest.Mocked<AppConfigService>
    > as jest.Mocked<AppConfigService>;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        MultiFeatureInfoControlHandler,
        { provide: TCNamespaceService, useValue: mockTCNamespace },
        { provide: UIStateService, useValue: mockUIStateService },
        { provide: AppConfigService, useValue: mockAppConfigService }
      ]
    });

    handler = TestBed.inject(MultiFeatureInfoControlHandler);

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
      expect(handler.controlIdentifier).toBe('sitna.multiFeatureInfo');
    });
  });

  describe('sitnaConfigKey', () => {
    it('should have correct SITNA config key', () => {
      expect(handler.sitnaConfigKey).toBe('multiFeatureInfo');
    });
  });

  describe('requiredPatches', () => {
    it('should have no required patches', () => {
      expect(handler.requiredPatches).toBeUndefined();
    });
  });

  describe('buildConfiguration()', () => {
    it('should return complete default configuration when parameters are empty', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.multiFeatureInfo',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        div: 'multifeatureinfo',
        active: true,
        persistentHighlights: true,
        share: true,
        modes: {
          point: { active: true },
          polyline: { active: true },
          polygon: { active: true }
        }
      });
      expect(mockUIStateService.enableToolsButton).toHaveBeenCalled();
    });

    it('should merge task parameters with defaults', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.multiFeatureInfo',
        parameters: {
          active: false,
          share: false
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        div: 'multifeatureinfo',
        active: false, // Overridden
        persistentHighlights: true, // Kept from default
        share: false, // Overridden
        modes: {
          point: { active: true },
          polyline: { active: true },
          polygon: { active: true }
        }
      });
      expect(mockUIStateService.enableToolsButton).toHaveBeenCalled();
    });

    it('should allow overriding modes configuration', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.multiFeatureInfo',
        parameters: {
          modes: {
            point: { active: false },
            polyline: { active: true }
          }
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.['modes']).toEqual({
        point: { active: false },
        polyline: { active: true }
      });
      expect(config?.div).toBe('multifeatureinfo');
      expect(config?.['active']).toBe(true);
      expect(mockUIStateService.enableToolsButton).toHaveBeenCalled();
    });

    it('should allow parameters to override div', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.multiFeatureInfo',
        parameters: {
          div: 'custom-div'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.div).toBe('custom-div');
      expect(config?.['active']).toBe(true);
      expect(config?.['modes']).toBeDefined();
      expect(mockUIStateService.enableToolsButton).toHaveBeenCalled();
    });

    it('should always enable tools button', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.multiFeatureInfo',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      handler.buildConfiguration(task, context);

      expect(mockUIStateService.enableToolsButton).toHaveBeenCalledTimes(1);
    });

    it('should preserve complex nested modes structure', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.multiFeatureInfo',
        parameters: {
          modes: {
            polygon: {
              active: true,
              filterStyle: {
                fillColor: '#ff0000',
                fillOpacity: 0.5
              }
            }
          }
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.['modes']?.['polygon']).toEqual({
        active: true,
        filterStyle: {
          fillColor: '#ff0000',
          fillOpacity: 0.5
        }
      });
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
        'ui-control': 'sitna.multiFeatureInfo',
        parameters: {
          active: false,
          customOption: true
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);
      expect(config).toBeDefined();
      expect(config?.div).toBe('multifeatureinfo');
      expect(config?.['active']).toBe(false);
      expect(config?.['customOption']).toBe(true);
      expect(config?.['modes']).toBeDefined();
      expect(mockUIStateService.enableToolsButton).toHaveBeenCalled();
    });
  });
});
