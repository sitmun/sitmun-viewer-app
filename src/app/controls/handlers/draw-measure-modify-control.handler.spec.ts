import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { DrawMeasureModifyControlHandler } from './draw-measure-modify-control.handler';
import { AppConfigService } from '../../services/app-config.service';
import { SitnaApiService } from '../../services/sitna-api.service';
import { UIStateService } from '../../services/ui-state.service';

describe('DrawMeasureModifyControlHandler', () => {
  let handler: DrawMeasureModifyControlHandler;
  let mockSitnaApi: jest.Mocked<SitnaApiService>;
  let mockUIStateService: jest.Mocked<UIStateService>;
  let mockAppConfigService: jest.Mocked<AppConfigService>;
  let mockAppCfg: AppCfg;

  beforeEach(() => {
    mockSitnaApi = {
      getTC: jest.fn(),
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
      div: 'tc-slot-drawmeasuremodify'
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DrawMeasureModifyControlHandler,
        { provide: SitnaApiService, useValue: mockSitnaApi },
        { provide: UIStateService, useValue: mockUIStateService },
        { provide: AppConfigService, useValue: mockAppConfigService }
      ]
    });

    handler = TestBed.inject(DrawMeasureModifyControlHandler);

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
      expect(handler.controlIdentifier).toBe('sitna.drawMeasureModify');
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
        'ui-control': 'sitna.drawMeasureModify',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({ div: 'tc-slot-drawmeasuremodify' });
      expect(mockUIStateService.enableToolsButton).toHaveBeenCalled();
    });

    it('should merge task parameters', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.drawMeasureModify',
        parameters: {
          customOption: 'value',
          anotherOption: true
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        div: 'tc-slot-drawmeasuremodify',
        customOption: 'value',
        anotherOption: true
      });
      expect(mockUIStateService.enableToolsButton).toHaveBeenCalled();
    });

    it('should allow parameters to override div', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.drawMeasureModify',
        parameters: {
          div: 'custom-div'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.div).toBe('custom-div');
      expect(mockUIStateService.enableToolsButton).toHaveBeenCalled();
    });

    it('should always enable tools button', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.drawMeasureModify',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      handler.buildConfiguration(task, context);

      expect(mockUIStateService.enableToolsButton).toHaveBeenCalledTimes(1);
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

  describe('Integration', () => {
    it('should handle full lifecycle', async () => {
      // Load patches (no-op for native control)
      await handler.loadPatches(mockAppCfg);

      // Build config
      const task: AppTasks = {
        'ui-control': 'sitna.drawMeasureModify',
        parameters: { customOption: true }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);
      expect(config).toBeDefined();
      expect(config?.div).toBe('tc-slot-drawmeasuremodify');
      expect(config?.['customOption']).toBe(true);
      expect(mockUIStateService.enableToolsButton).toHaveBeenCalled();
    });
  });
});
