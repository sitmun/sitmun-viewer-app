import { TestBed } from '@angular/core/testing';
import { ControlRegistryService } from './control-registry.service';
import {
  ControlHandler,
  SitnaControlConfig
} from '../controls/control-handler.interface';
import { AppCfg, AppTasks } from '@api/model/app-cfg';
import { NotificationService } from '../notifications/services/NotificationService';
import { AppConfigService } from './app-config.service';

/**
 * Mock handler for testing
 */
class MockHandler implements ControlHandler {
  readonly controlIdentifier: string;
  readonly sitnaConfigKey: string;
  readonly requiredPatches?: string[];
  private customDiv?: string;

  loadPatchesCalled = false;
  buildConfigCalled = false;
  cleanupCalled = false;

  constructor(
    controlIdentifier: string,
    patches?: string[],
    customDiv?: string,
    sitnaConfigKey?: string
  ) {
    this.controlIdentifier = controlIdentifier;
    this.requiredPatches = patches;
    this.customDiv = customDiv;
    // Use provided sitnaConfigKey or derive from controlIdentifier
    this.sitnaConfigKey =
      sitnaConfigKey || controlIdentifier.replace('sitna.', '');
  }

  async loadPatches(): Promise<void> {
    this.loadPatchesCalled = true;
  }

  buildConfiguration(
    task: AppTasks,
    context: AppCfg
  ): SitnaControlConfig | null {
    this.buildConfigCalled = true;
    // Use task parameters if provided, otherwise use customDiv or default
    const div =
      task.parameters?.div ||
      this.customDiv ||
      this.controlIdentifier.replace('sitna.', '');
    const config: SitnaControlConfig = { div };
    // Merge any other task parameters
    if (task.parameters) {
      Object.assign(config, task.parameters);
    }
    return config;
  }

  isReady(): boolean {
    return this.loadPatchesCalled;
  }

  cleanup(): void {
    this.cleanupCalled = true;
  }
}

/**
 * Handler that returns null config
 */
class NullConfigHandler implements ControlHandler {
  readonly controlIdentifier = 'sitna.null';
  readonly sitnaConfigKey = 'null';

  async loadPatches(): Promise<void> {}
  buildConfiguration(): null {
    return null;
  }
  isReady(): boolean {
    return true;
  }
}

/**
 * Handler that throws error during patch loading
 */
class ErrorHandler implements ControlHandler {
  readonly controlIdentifier = 'sitna.error';
  readonly sitnaConfigKey = 'error';

  async loadPatches(): Promise<void> {
    throw new Error('Patch load failed');
  }

  buildConfiguration(): SitnaControlConfig {
    return { div: 'error' };
  }

  isReady(): boolean {
    return false;
  }
}

describe('ControlRegistryService', () => {
  let service: ControlRegistryService;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let appConfigService: jasmine.SpyObj<AppConfigService>;

  beforeEach(() => {
    notificationService = jasmine.createSpyObj('NotificationService', [
      'warning',
      'success',
      'error'
    ]);
    appConfigService = jasmine.createSpyObj('AppConfigService', [
      'getAttribution'
    ]);
    appConfigService.getAttribution.and.returnValue(null);

    TestBed.configureTestingModule({
      providers: [
        { provide: NotificationService, useValue: notificationService },
        { provide: AppConfigService, useValue: appConfigService }
      ]
    });
    service = TestBed.inject(ControlRegistryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register()', () => {
    it('should register a handler', () => {
      const handler = new MockHandler('sitna.test');

      service.register(handler);

      expect(service.hasHandler('sitna.test')).toBe(true);
      expect(service.getHandler('sitna.test')).toBe(handler);
    });

    it('should replace existing handler with warning', () => {
      const handler1 = new MockHandler('sitna.test');
      const handler2 = new MockHandler('sitna.test');
      spyOn(console, 'warn');

      service.register(handler1);
      service.register(handler2);

      expect(service.getHandler('sitna.test')).toBe(handler2);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('registerAll()', () => {
    it('should register multiple handlers', () => {
      const handlers = [
        new MockHandler('sitna.test1'),
        new MockHandler('sitna.test2'),
        new MockHandler('sitna.test3')
      ];

      service.registerAll(handlers);

      expect(service.hasHandler('sitna.test1')).toBe(true);
      expect(service.hasHandler('sitna.test2')).toBe(true);
      expect(service.hasHandler('sitna.test3')).toBe(true);
    });

    it('should handle empty array', () => {
      service.registerAll([]);

      expect(service.getRegisteredTypes().length).toBe(0);
    });
  });

  describe('getHandler()', () => {
    it('should return handler by control type', () => {
      const handler = new MockHandler('sitna.test');
      service.register(handler);

      const retrieved = service.getHandler('sitna.test');

      expect(retrieved).toBe(handler);
    });

    it('should return undefined for unregistered type', () => {
      const retrieved = service.getHandler('sitna.nonexistent');

      expect(retrieved).toBeUndefined();
    });
  });

  describe('hasHandler()', () => {
    it('should return true for registered handler', () => {
      const handler = new MockHandler('sitna.test');
      service.register(handler);

      expect(service.hasHandler('sitna.test')).toBe(true);
    });

    it('should return false for unregistered handler', () => {
      expect(service.hasHandler('sitna.nonexistent')).toBe(false);
    });
  });

  describe('getRegisteredTypes()', () => {
    it('should return empty array initially', () => {
      expect(service.getRegisteredTypes()).toEqual([]);
    });

    it('should return all registered types', () => {
      service.register(new MockHandler('sitna.test1'));
      service.register(new MockHandler('sitna.test2'));

      const types = service.getRegisteredTypes();

      expect(types).toContain('sitna.test1');
      expect(types).toContain('sitna.test2');
      expect(types.length).toBe(2);
    });
  });

  describe('processControls()', () => {
    it('should process controls with handlers', async () => {
      const handler = new MockHandler(
        'sitna.coordinates',
        undefined,
        undefined,
        'coordinates'
      );
      service.register(handler);

      const tasks: AppTasks[] = [
        { 'ui-control': 'sitna.coordinates', parameters: {} } as any
      ];
      const context: AppCfg = {} as any;

      const result = await service.processControls(tasks, context);

      expect(handler.loadPatchesCalled).toBe(true);
      expect(handler.buildConfigCalled).toBe(true);
      expect(result.coordinates).toEqual({ div: 'coordinates' });
    });

    it('should handle multiple controls', async () => {
      const handler1 = new MockHandler(
        'sitna.coordinates',
        undefined,
        undefined,
        'coordinates'
      );
      const handler2 = new MockHandler(
        'sitna.scale',
        undefined,
        undefined,
        'scale'
      );
      service.register(handler1);
      service.register(handler2);

      const tasks: AppTasks[] = [
        { 'ui-control': 'sitna.coordinates', parameters: {} } as any,
        { 'ui-control': 'sitna.scale', parameters: {} } as any
      ];
      const context: AppCfg = {} as any;

      const result = await service.processControls(tasks, context);

      expect(result.coordinates).toBeDefined();
      expect(result.scale).toBeDefined();
    });

    it('should skip controls without handlers', async () => {
      const tasks: AppTasks[] = [
        { 'ui-control': 'sitna.unregistered', parameters: {} } as any
      ];
      const context: AppCfg = {} as any;
      spyOn(console, 'warn');

      const result = await service.processControls(tasks, context);

      expect(Object.keys(result).length).toBe(0);
    });

    it('should skip controls that return null config', async () => {
      const handler = new NullConfigHandler();
      service.register(handler);

      const tasks: AppTasks[] = [
        { 'ui-control': 'sitna.null', parameters: {} } as any
      ];
      const context: AppCfg = {} as any;
      spyOn(console, 'log');

      const result = await service.processControls(tasks, context);

      expect(Object.keys(result).length).toBe(0);
      expect(console.log).toHaveBeenCalledWith(
        jasmine.stringMatching(/returned null config/)
      );
    });

    it('should continue on patch loading errors', async () => {
      const errorHandler = new ErrorHandler();
      const goodHandler = new MockHandler(
        'sitna.scale',
        undefined,
        undefined,
        'scale'
      );
      service.register(errorHandler);
      service.register(goodHandler);

      const tasks: AppTasks[] = [
        { 'ui-control': 'sitna.error', parameters: {} } as any,
        { 'ui-control': 'sitna.scale', parameters: {} } as any
      ];
      const context: AppCfg = {} as any;
      spyOn(console, 'error');

      const result = await service.processControls(tasks, context);

      expect(console.error).toHaveBeenCalled();
      expect(result.scale).toBeDefined();
    });

    it('should skip non-sitna controls', async () => {
      const tasks: AppTasks[] = [
        { 'ui-control': 'other.control', parameters: {} } as any
      ];
      const context: AppCfg = {} as any;

      const result = await service.processControls(tasks, context);

      expect(Object.keys(result).length).toBe(0);
    });

    it('should return empty config when no active controls', async () => {
      const tasks: AppTasks[] = [];
      const context: AppCfg = {} as any;
      spyOn(console, 'warn');

      const result = await service.processControls(tasks, context);

      expect(result).toEqual({});
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('Control Key Generation', () => {
    it('should convert simple control names', async () => {
      const handler = new MockHandler(
        'sitna.coordinates',
        undefined,
        undefined,
        'coordinates'
      );
      service.register(handler);

      const tasks: AppTasks[] = [
        { 'ui-control': 'sitna.coordinates', parameters: {} } as any
      ];
      const context: AppCfg = {} as any;

      const result = await service.processControls(tasks, context);

      expect(result.coordinates).toBeDefined();
    });

    it('should convert dotted names to camelCase', async () => {
      const handler = new MockHandler(
        'sitna.search',
        undefined,
        undefined,
        'search'
      );
      service.register(handler);

      const tasks: AppTasks[] = [
        { 'ui-control': 'sitna.search', parameters: {} } as any
      ];
      const context: AppCfg = {} as any;

      const result = await service.processControls(tasks, context);

      expect((result as any)['search']).toBeDefined();
    });

    it('should handle layerCatalog correctly', async () => {
      const handler = new MockHandler(
        'sitna.layerCatalog',
        undefined,
        undefined,
        'layerCatalog'
      );
      service.register(handler);

      const tasks: AppTasks[] = [
        { 'ui-control': 'sitna.layerCatalog', parameters: {} } as any
      ];
      const context: AppCfg = {} as any;

      const result = await service.processControls(tasks, context);

      expect(result.layerCatalog).toBeDefined();
    });
  });

  describe('unregister()', () => {
    it('should unregister handler and call cleanup', () => {
      const handler = new MockHandler('sitna.test');
      service.register(handler);

      const result = service.unregister('sitna.test');

      expect(result).toBe(true);
      expect(service.hasHandler('sitna.test')).toBe(false);
      expect(handler.cleanupCalled).toBe(true);
    });

    it('should return false for non-existent handler', () => {
      const result = service.unregister('sitna.nonexistent');

      expect(result).toBe(false);
    });

    it('should not crash if handler has no cleanup', () => {
      const handler = new MockHandler('sitna.test');
      delete (handler as any).cleanup; // Remove cleanup method

      service.register(handler);

      expect(() => service.unregister('sitna.test')).not.toThrow();
    });
  });

  describe('unregisterAll()', () => {
    it('should unregister all handlers', () => {
      const handler1 = new MockHandler('sitna.test1');
      const handler2 = new MockHandler('sitna.test2');
      service.register(handler1);
      service.register(handler2);

      service.unregisterAll();

      expect(service.getRegisteredTypes().length).toBe(0);
      expect(handler1.cleanupCalled).toBe(true);
      expect(handler2.cleanupCalled).toBe(true);
    });

    it('should handle empty registry', () => {
      expect(() => service.unregisterAll()).not.toThrow();
    });
  });

  describe('getStatistics()', () => {
    it('should return zero stats initially', () => {
      const stats = service.getStatistics();

      expect(stats.totalHandlers).toBe(0);
      expect(stats.handlerTypes).toEqual([]);
      expect(stats.handlersWithPatches).toBe(0);
    });

    it('should return correct stats', () => {
      service.register(new MockHandler('sitna.test1'));
      service.register(new MockHandler('sitna.test2', ['patch.js']));
      service.register(new MockHandler('sitna.test3', ['p1.js', 'p2.js']));

      const stats = service.getStatistics();

      expect(stats.totalHandlers).toBe(3);
      expect(stats.handlerTypes.length).toBe(3);
      expect(stats.handlersWithPatches).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle buildConfiguration errors', async () => {
      class ThrowingHandler implements ControlHandler {
        readonly controlIdentifier = 'sitna.throwing';
        async loadPatches() {}
        buildConfiguration(): SitnaControlConfig | null {
          throw new Error('Build error');
        }
        isReady() {
          return true;
        }
      }

      const handler = new ThrowingHandler();
      service.register(handler);

      const tasks: AppTasks[] = [
        { 'ui-control': 'sitna.throwing', parameters: {} } as any
      ];
      const context: AppCfg = {} as any;
      spyOn(console, 'error');

      const result = await service.processControls(tasks, context);

      expect(console.error).toHaveBeenCalled();
      expect(Object.keys(result).length).toBe(0);
    });
  });

  describe('Div Validation', () => {
    it('should not warn when controls use different divs', async () => {
      const handler1 = new MockHandler(
        'sitna.scale',
        undefined,
        'scale',
        'scale'
      );
      const handler2 = new MockHandler(
        'sitna.coordinates',
        undefined,
        'coordinates',
        'coordinates'
      );
      service.register(handler1);
      service.register(handler2);

      const tasks: AppTasks[] = [
        { 'ui-control': 'sitna.scale', parameters: {} } as any,
        { 'ui-control': 'sitna.coordinates', parameters: {} } as any
      ];
      const context: AppCfg = {} as any;

      await service.processControls(tasks, context);

      expect(notificationService.warning).not.toHaveBeenCalled();
    });

    it('should warn when multiple controls use the same div', async () => {
      const handler1 = new MockHandler(
        'sitna.scale',
        undefined,
        'scale',
        'scale'
      );
      const handler2 = new MockHandler(
        'sitna.scaleBar',
        undefined,
        'scale',
        'scaleBar'
      );
      const handler3 = new MockHandler(
        'sitna.scaleSelector',
        undefined,
        'scale',
        'scaleSelector'
      );
      service.register(handler1);
      service.register(handler2);
      service.register(handler3);

      const tasks: AppTasks[] = [
        { 'ui-control': 'sitna.scale', parameters: {} } as any,
        { 'ui-control': 'sitna.scaleBar', parameters: {} } as any,
        { 'ui-control': 'sitna.scaleSelector', parameters: {} } as any
      ];
      const context: AppCfg = {} as any;

      await service.processControls(tasks, context);

      expect(notificationService.warning).toHaveBeenCalledTimes(1);
      expect(notificationService.warning).toHaveBeenCalledWith(
        jasmine.stringContaining(
          "Configuration conflict: Multiple controls are using the same div 'scale'"
        )
      );
      expect(notificationService.warning).toHaveBeenCalledWith(
        jasmine.stringContaining('scale, scaleBar, scaleSelector')
      );
    });

    it('should warn for each duplicate div separately', async () => {
      const handler1 = new MockHandler(
        'sitna.scale',
        undefined,
        'scale',
        'scale'
      );
      const handler2 = new MockHandler(
        'sitna.scaleBar',
        undefined,
        'scale',
        'scaleBar'
      );
      const handler3 = new MockHandler(
        'sitna.coordinates',
        undefined,
        'coordinates',
        'coordinates'
      );
      const handler4 = new MockHandler(
        'sitna.legend',
        undefined,
        'coordinates',
        'legend'
      );
      service.register(handler1);
      service.register(handler2);
      service.register(handler3);
      service.register(handler4);

      const tasks: AppTasks[] = [
        { 'ui-control': 'sitna.scale', parameters: {} } as any,
        { 'ui-control': 'sitna.scaleBar', parameters: {} } as any,
        { 'ui-control': 'sitna.coordinates', parameters: {} } as any,
        { 'ui-control': 'sitna.legend', parameters: {} } as any
      ];
      const context: AppCfg = {} as any;

      await service.processControls(tasks, context);

      expect(notificationService.warning).toHaveBeenCalledTimes(2);
      expect(notificationService.warning).toHaveBeenCalledWith(
        jasmine.stringContaining("div 'scale'")
      );
      expect(notificationService.warning).toHaveBeenCalledWith(
        jasmine.stringContaining("div 'coordinates'")
      );
    });

    it('should handle controls without div property', async () => {
      class NoDivHandler implements ControlHandler {
        readonly controlIdentifier = 'sitna.noDiv';
        async loadPatches() {}
        buildConfiguration(): SitnaControlConfig | null {
          return { someOtherProp: 'value' } as any;
        }
        isReady() {
          return true;
        }
      }

      const handler = new NoDivHandler();
      service.register(handler);

      const tasks: AppTasks[] = [
        { 'ui-control': 'sitna.noDiv', parameters: {} } as any
      ];
      const context: AppCfg = {} as any;

      await service.processControls(tasks, context);

      expect(notificationService.warning).not.toHaveBeenCalled();
    });

    it('should handle boolean control configs', async () => {
      class BooleanHandler implements ControlHandler {
        readonly controlIdentifier = 'sitna.boolean';
        async loadPatches() {}
        buildConfiguration(): SitnaControlConfig | null {
          return true as any; // Some controls return boolean
        }
        isReady() {
          return true;
        }
      }

      const handler = new BooleanHandler();
      service.register(handler);

      const tasks: AppTasks[] = [
        { 'ui-control': 'sitna.boolean', parameters: {} } as any
      ];
      const context: AppCfg = {} as any;

      await service.processControls(tasks, context);

      expect(notificationService.warning).not.toHaveBeenCalled();
    });
  });

  describe('ensureAttributionControl', () => {
    it('should auto-enable attribution control when attribution is configured', async () => {
      appConfigService.getAttribution.and.returnValue(
        '<a href="https://github.com/sitmun" target="_blank">SITMUN</a>'
      );

      const attributionHandler = new MockHandler(
        'sitna.attribution',
        undefined,
        undefined,
        'attribution'
      );
      service.register(attributionHandler);

      const tasks: AppTasks[] = [];
      const context: AppCfg = {} as any;

      const result = await service.processControls(tasks, context);

      expect(result.attribution).toBeDefined();
      expect(attributionHandler.buildConfigCalled).toBe(true);
    });

    it('should not auto-enable attribution control when attribution is not configured', async () => {
      appConfigService.getAttribution.and.returnValue(null);

      const attributionHandler = new MockHandler(
        'sitna.attribution',
        undefined,
        undefined,
        'attribution'
      );
      service.register(attributionHandler);

      const tasks: AppTasks[] = [];
      const context: AppCfg = {} as any;

      const result = await service.processControls(tasks, context);

      expect(result.attribution).toBeUndefined();
      expect(attributionHandler.buildConfigCalled).toBe(false);
    });

    it('should not override existing attribution control from backend task', async () => {
      appConfigService.getAttribution.and.returnValue(
        '<a href="https://github.com/sitmun" target="_blank">SITMUN</a>'
      );

      const attributionHandler = new MockHandler(
        'sitna.attribution',
        undefined,
        'custom-attribution',
        'attribution'
      );
      service.register(attributionHandler);

      const tasks: AppTasks[] = [
        {
          'ui-control': 'sitna.attribution',
          parameters: { div: 'backend-attribution' }
        } as any
      ];
      const context: AppCfg = {} as any;

      const result = await service.processControls(tasks, context);

      expect(result.attribution).toBeDefined();
      const attributionConfig = result.attribution as any;
      expect(attributionConfig?.div).toBe('backend-attribution');
      // Should only be called once (from backend task, not from auto-enable)
      expect(attributionHandler.buildConfigCalled).toBe(true);
    });

    it('should handle missing attribution handler gracefully', async () => {
      appConfigService.getAttribution.and.returnValue(
        '<a href="https://github.com/sitmun" target="_blank">SITMUN</a>'
      );
      spyOn(console, 'warn');

      const tasks: AppTasks[] = [];
      const context: AppCfg = {} as any;

      const result = await service.processControls(tasks, context);

      expect(result.attribution).toBeUndefined();
      expect(console.warn).toHaveBeenCalledWith(
        jasmine.stringContaining('Attribution handler not found')
      );
    });

    it('should handle buildConfiguration errors in auto-enable', async () => {
      appConfigService.getAttribution.and.returnValue(
        '<a href="https://github.com/sitmun" target="_blank">SITMUN</a>'
      );

      class ThrowingAttributionHandler extends MockHandler {
        constructor() {
          super('sitna.attribution');
        }
        override buildConfiguration(): SitnaControlConfig | null {
          throw new Error('Build error');
        }
      }

      const attributionHandler = new ThrowingAttributionHandler();
      service.register(attributionHandler);
      spyOn(console, 'warn');

      const tasks: AppTasks[] = [];
      const context: AppCfg = {} as any;

      const result = await service.processControls(tasks, context);

      expect(result.attribution).toBeUndefined();
      // console.warn is called with message and error, check first argument
      expect(console.warn).toHaveBeenCalledWith(
        jasmine.stringContaining('Failed to auto-enable attribution control'),
        jasmine.any(Error)
      );
    });
  });
});
