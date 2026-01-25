import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { PrintMapControlHandler } from './print-map-control.handler';
import { AppConfigService } from '../../services/app-config.service';
import { SitnaApiService } from '../../services/sitna-api.service';
import { UIStateService } from '../../services/ui-state.service';

describe('PrintMapControlHandler', () => {
  let handler: PrintMapControlHandler;
  let mockSitnaApi: jest.Mocked<SitnaApiService>;
  let mockUIStateService: jest.Mocked<UIStateService>;
  let mockAppConfigService: jest.Mocked<AppConfigService>;
  let mockAppCfg: AppCfg;

  beforeEach(() => {
    const mockTC = {
      control: {
        PrintMap: {}
      }
    };
    mockSitnaApi = {
      getTC: jest.fn().mockReturnValue(mockTC),
      getSITNA: jest.fn().mockReturnValue({} as any),
      getTCProperty: jest.fn(),
      isReady: jest.fn().mockReturnValue(true)
    } as Partial<jest.Mocked<SitnaApiService>> as jest.Mocked<SitnaApiService>;

    mockUIStateService = {
      enableToolsButton: jest.fn()
    } as Partial<jest.Mocked<UIStateService>> as jest.Mocked<UIStateService>;

    mockAppConfigService = {
      getControlDefault: jest.fn()
    } as Partial<
      jest.Mocked<AppConfigService>
    > as jest.Mocked<AppConfigService>;
    mockAppConfigService.getControlDefault.mockReturnValue({
      div: 'tc-slot-print',
      logo: 'assets/logos/logo_orange.png',
      legend: {
        visible: true
      }
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PrintMapControlHandler,
        { provide: SitnaApiService, useValue: mockSitnaApi },
        { provide: UIStateService, useValue: mockUIStateService },
        { provide: AppConfigService, useValue: mockAppConfigService }
      ]
    });

    handler = TestBed.inject(PrintMapControlHandler);

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
      expect(handler.controlIdentifier).toBe('sitna.printMap');
    });
  });

  describe('sitnaConfigKey', () => {
    it('should have correct SITNA config key', () => {
      expect(handler.sitnaConfigKey).toBe('printMap');
    });
  });

  describe('requiredPatches', () => {
    it('should have no required patches', () => {
      expect(handler.requiredPatches).toBeUndefined();
    });
  });

  describe('buildConfiguration()', () => {
    it('should return full default config when parameters are empty', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.printMap',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        div: 'tc-slot-print',
        logo: 'assets/logos/logo_orange.png',
        legend: {
          visible: true
        }
      });
      expect(mockUIStateService.enableToolsButton).toHaveBeenCalled();
    });

    it('should merge task parameters with defaults', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.printMap',
        parameters: {
          customOption: 'value',
          anotherOption: true
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        div: 'tc-slot-print',
        logo: 'assets/logos/logo_orange.png',
        legend: {
          visible: true
        },
        customOption: 'value',
        anotherOption: true
      });
      expect(mockUIStateService.enableToolsButton).toHaveBeenCalled();
    });

    it('should allow parameters to override div', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.printMap',
        parameters: {
          div: 'custom-print-div'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.div).toBe('custom-print-div');
      expect(config?.['logo']).toBe('assets/logos/logo_orange.png');
      expect(config?.['legend']).toEqual({ visible: true });
      expect(mockUIStateService.enableToolsButton).toHaveBeenCalled();
    });

    it('should allow parameters to override logo', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.printMap',
        parameters: {
          logo: 'assets/logos/custom-logo.png'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.['logo']).toBe('assets/logos/custom-logo.png');
      expect(config?.div).toBe('tc-slot-print');
      expect(config?.['legend']).toEqual({ visible: true });
      expect(mockUIStateService.enableToolsButton).toHaveBeenCalled();
    });

    it('should allow parameters to override legend properties', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.printMap',
        parameters: {
          legend: {
            visible: false,
            orientation: 'landscape'
          }
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.['legend']).toEqual({
        visible: false,
        orientation: 'landscape'
      });
      expect(config?.div).toBe('tc-slot-print');
      expect(config?.['logo']).toBe('assets/logos/logo_orange.png');
      expect(mockUIStateService.enableToolsButton).toHaveBeenCalled();
    });

    it('should support partial legend override', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.printMap',
        parameters: {
          legend: {
            visible: false
          }
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      // Standard object spread merge means legend is completely replaced
      expect(config?.['legend']).toEqual({
        visible: false
      });
      expect(mockUIStateService.enableToolsButton).toHaveBeenCalled();
    });

    it('should always call enableToolsButton', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.printMap',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      handler.buildConfiguration(task, context);

      expect(mockUIStateService.enableToolsButton).toHaveBeenCalledTimes(1);
    });
  });

  describe('Nested Object Tests', () => {
    it('should preserve default legend when not overridden', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.printMap',
        parameters: {
          logo: 'custom-logo.png'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.['legend']).toEqual({ visible: true });
    });

    it('should completely replace legend when fully specified', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.printMap',
        parameters: {
          legend: {
            visible: false,
            orientation: 'portrait'
          }
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.['legend']).toEqual({
        visible: false,
        orientation: 'portrait'
      });
      // Should not have default visible: true
      expect(config?.['legend']?.['visible']).toBe(false);
    });

    it('should handle legend object replacement (not deep merge)', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.printMap',
        parameters: {
          legend: {
            visible: false
          }
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      // Standard object spread means complete replacement, not deep merge
      expect(config?.['legend']).toEqual({ visible: false });
      expect(Object.keys(config?.['legend'] || {})).toEqual(['visible']);
    });
  });

  describe('loadPatches()', () => {
    it('should resolve (base no-op)', async () => {
      await expect(handler.loadPatches(mockAppCfg)).resolves.toBeUndefined();
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

      // Build config
      const task: AppTasks = {
        'ui-control': 'sitna.printMap',
        parameters: { logo: 'custom-logo.png' }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);
      expect(config).toBeDefined();
      expect(config?.div).toBe('tc-slot-print');
      expect(config?.['logo']).toBe('custom-logo.png');
      expect(config?.['legend']).toEqual({ visible: true });
      expect(mockUIStateService.enableToolsButton).toHaveBeenCalled();
    });
  });
});
