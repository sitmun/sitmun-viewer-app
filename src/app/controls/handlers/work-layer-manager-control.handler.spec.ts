import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WorkLayerManagerControlHandler } from './work-layer-manager-control.handler';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import { AppCfg, AppTasks } from '@api/model/app-cfg';

describe('WorkLayerManagerControlHandler', () => {
  let handler: WorkLayerManagerControlHandler;
  let mockTCNamespace: jasmine.SpyObj<TCNamespaceService>;

  beforeEach(() => {
    mockTCNamespace = jasmine.createSpyObj('TCNamespaceService', [
      'waitForTC',
      'getTC'
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        WorkLayerManagerControlHandler,
        { provide: TCNamespaceService, useValue: mockTCNamespace }
      ]
    });

    handler = TestBed.inject(WorkLayerManagerControlHandler);
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });

  describe('controlIdentifier', () => {
    it('should have correct control identifier', () => {
      expect(handler.controlIdentifier).toBe('sitna.workLayerManager');
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
        'ui-control': 'sitna.workLayerManager',
        parameters: {}
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({ div: 'workLayerManager' });
    });

    it('should merge task parameters', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.workLayerManager',
        parameters: {
          position: 'left',
          collapsible: true
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toEqual({
        div: 'workLayerManager',
        position: 'left',
        collapsible: true
      });
    });

    it('should allow parameters to override div', () => {
      const task: AppTasks = {
        'ui-control': 'sitna.workLayerManager',
        parameters: {
          div: 'custom-toc-div'
        }
      } as any;
      const context: AppCfg = {} as any;

      const config = handler.buildConfiguration(task, context);

      expect(config?.div).toBe('custom-toc-div');
    });
  });

  describe('isReady()', () => {
    it('should always return true (no patches)', () => {
      expect(handler.isReady()).toBe(true);
    });
  });

  describe('loadPatches()', () => {
    it('should resolve immediately (no patches to load)', async () => {
      const context: AppCfg = {} as any;
      const start = Date.now();
      await handler.loadPatches(context);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(10); // Should be instant
    });
  });

  describe('Integration', () => {
    it('should handle full lifecycle', async () => {
      const context: AppCfg = {} as any;

      // Load patches (no-op for native control)
      await handler.loadPatches(context);

      // Should be ready immediately
      expect(handler.isReady()).toBe(true);

      // Build config
      const task: AppTasks = {
        'ui-control': 'sitna.workLayerManager',
        parameters: { custom: 'value' }
      } as any;

      const config = handler.buildConfiguration(task, context);
      expect(config).toBeDefined();
      expect(config?.div).toBe('workLayerManager');
    });
  });
});
