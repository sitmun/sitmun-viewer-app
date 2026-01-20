import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppCfg, AppTasks } from '@api/model/app-cfg';

import { LegendControlHandler } from './legend-control.handler';
import { AppConfigService } from '../../services/app-config.service';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import { UIStateService } from '../../services/ui-state.service';

describe('LegendControlHandler', () => {
  let handler: LegendControlHandler;
  let mockTCNamespace: jest.Mocked<TCNamespaceService>;
  let mockAppConfigService: jest.Mocked<AppConfigService>;
  let mockUIStateService: jest.Mocked<UIStateService>;
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
      getControlDefault: jest.fn().mockReturnValue({ div: 'tc-slot-legend' })
    } as Partial<
      jest.Mocked<AppConfigService>
    > as jest.Mocked<AppConfigService>;

    mockUIStateService = {
      enableLegendButton: jest.fn(),
      disableLegendButton: jest.fn(),
      isLegendButtonEnabled: jest.fn()
    } as Partial<jest.Mocked<UIStateService>> as jest.Mocked<UIStateService>;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LegendControlHandler,
        { provide: TCNamespaceService, useValue: mockTCNamespace },
        { provide: AppConfigService, useValue: mockAppConfigService },
        { provide: UIStateService, useValue: mockUIStateService }
      ]
    });

    handler = TestBed.inject(LegendControlHandler);

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
      expect(handler.controlIdentifier).toBe('sitna.legend');
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
        'ui-control': 'sitna.legend',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({ div: 'tc-slot-legend' });
      expect(mockUIStateService.enableLegendButton).toHaveBeenCalled();
    });

    it('should merge task parameters', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.legend',
        parameters: {
          position: 'top-left',
          collapsible: true
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        div: 'tc-slot-legend',
        position: 'top-left',
        collapsible: true
      });
      expect(mockUIStateService.enableLegendButton).toHaveBeenCalled();
    });

    it('should allow parameters to override div', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.legend',
        parameters: {
          div: 'custom-legend-div'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.div).toBe('custom-legend-div');
      expect(mockUIStateService.enableLegendButton).toHaveBeenCalled();
    });

    it('should always call enableLegendButton', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.legend',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      handler.buildConfiguration(task, context);

      expect(mockUIStateService.enableLegendButton).toHaveBeenCalledTimes(1);
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

  describe('Integration', () => {
    it('should handle full lifecycle', async () => {
      // Load patches (no-op for native control)
      await handler.loadPatches(mockAppCfg);

      // Should be ready immediately
      expect(handler.isReady()).toBe(true);

      // Build config
      const task: AppTasks = {
        'ui-control': 'sitna.legend',
        parameters: { custom: 'value' }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);
      expect(config).toBeDefined();
      expect(config?.div).toBe('tc-slot-legend');
      expect(mockUIStateService.enableLegendButton).toHaveBeenCalled();
    });
  });
});
