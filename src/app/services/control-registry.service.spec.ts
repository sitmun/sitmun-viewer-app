import { TestBed } from '@angular/core/testing';
import { ControlRegistryService } from './control-registry.service';
import { ControlHandler, SitnaControlConfig } from '../controls/control-handler.interface';
import { AppCfg, AppTasks } from '@api/model/app-cfg';

/**
 * Mock handler for testing
 */
class MockHandler implements ControlHandler {
  readonly controlIdentifier: string;
  readonly requiredPatches?: string[];
  
  loadPatchesCalled = false;
  buildConfigCalled = false;
  cleanupCalled = false;

  constructor(controlIdentifier: string, patches?: string[]) {
    this.controlIdentifier = controlIdentifier;
    this.requiredPatches = patches;
  }

  async loadPatches(): Promise<void> {
    this.loadPatchesCalled = true;
  }

  buildConfiguration(task: AppTasks, context: AppCfg): SitnaControlConfig | null {
    this.buildConfigCalled = true;
    return { div: this.controlIdentifier.replace('sitna.', '') };
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

  async loadPatches(): Promise<void> {}
  buildConfiguration(): null { return null; }
  isReady(): boolean { return true; }
}

/**
 * Handler that throws error during patch loading
 */
class ErrorHandler implements ControlHandler {
  readonly controlIdentifier = 'sitna.error';

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

  beforeEach(() => {
    TestBed.configureTestingModule({});
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
      const handler = new MockHandler('sitna.coordinates');
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
      const handler1 = new MockHandler('sitna.coordinates');
      const handler2 = new MockHandler('sitna.scale');
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
      const goodHandler = new MockHandler('sitna.scale');
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
      const handler = new MockHandler('sitna.coordinates');
      service.register(handler);

      const tasks: AppTasks[] = [
        { 'ui-control': 'sitna.coordinates', parameters: {} } as any
      ];
      const context: AppCfg = {} as any;

      const result = await service.processControls(tasks, context);

      expect(result.coordinates).toBeDefined();
    });

    it('should convert dotted names to camelCase', async () => {
      const handler = new MockHandler('sitna.search.silme.extension');
      service.register(handler);

      const tasks: AppTasks[] = [
        { 'ui-control': 'sitna.search.silme.extension', parameters: {} } as any
      ];
      const context: AppCfg = {} as any;

      const result = await service.processControls(tasks, context);

      expect((result as any)['searchSilmeExtension']).toBeDefined();
    });

    it('should handle layerCatalog correctly', async () => {
      const handler = new MockHandler('sitna.layerCatalog');
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
        isReady() { return true; }
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
});

