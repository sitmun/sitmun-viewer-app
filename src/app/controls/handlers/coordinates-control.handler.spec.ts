import { TestBed } from '@angular/core/testing';
import { CoordinatesControlHandler } from './coordinates-control.handler';
import { PatchLoaderService } from '../../services/patch-loader.service';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import { AppCfg, AppTasks } from '@api/model/app-cfg';

describe('CoordinatesControlHandler', () => {
  let handler: CoordinatesControlHandler;
  let mockPatchLoader: jasmine.SpyObj<PatchLoaderService>;
  let mockTCNamespace: jasmine.SpyObj<TCNamespaceService>;

  beforeEach(() => {
    mockPatchLoader = jasmine.createSpyObj('PatchLoaderService', ['loadPatch', 'isPatchLoaded']);
    mockTCNamespace = jasmine.createSpyObj('TCNamespaceService', ['waitForTC', 'getTC']);

    TestBed.configureTestingModule({
      providers: [
        CoordinatesControlHandler,
        { provide: PatchLoaderService, useValue: mockPatchLoader },
        { provide: TCNamespaceService, useValue: mockTCNamespace }
      ]
    });

    handler = TestBed.inject(CoordinatesControlHandler);
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });

  describe('controlIdentifier', () => {
    it('should have correct control identifier', () => {
      expect(handler.controlIdentifier).toBe('sitna.coordinates');
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
        'ui-control': 'sitna.coordinates',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({ div: 'coordinates' });
    });

    it('should merge task parameters', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.coordinates',
        parameters: {
          position: 'bottom-right',
          showElevation: true
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        div: 'coordinates',
        position: 'bottom-right',
        showElevation: true
      });
    });

    it('should allow parameters to override div', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.coordinates',
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
    it('should not call patch loader', async () => {
      await handler.loadPatches();

      expect(mockPatchLoader.loadPatch).not.toHaveBeenCalled();
    });

    it('should resolve immediately', async () => {
      const start = Date.now();
      await handler.loadPatches();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(10); // Should be instant
    });
  });

  describe('Integration', () => {
    it('should handle full lifecycle', async () => {
      // Load patches (no-op for native control)
      await handler.loadPatches();

      // Should be ready immediately
      expect(handler.isReady()).toBe(true);

      // Build config
      const task: AppTasks = {
        'ui-control': 'sitna.coordinates',
        parameters: { custom: 'value' }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);
      expect(config).toBeDefined();
      expect(config?.div).toBe('coordinates');
    });
  });
});

