import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CoordinatesControlHandler } from './coordinates-control.handler';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import { AppCfg, AppTasks } from '@api/model/app-cfg';

describe('CoordinatesControlHandler', () => {
  let handler: CoordinatesControlHandler;
  let mockTCNamespace: jasmine.SpyObj<TCNamespaceService>;
  let mockAppCfg: AppCfg;
  let originalPatchesLoaded: any;

  beforeEach(() => {
    mockTCNamespace = jasmine.createSpyObj('TCNamespaceService', [
      'waitForTC',
      'getTC'
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CoordinatesControlHandler,
        { provide: TCNamespaceService, useValue: mockTCNamespace }
      ]
    });

    handler = TestBed.inject(CoordinatesControlHandler);

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

    // Save and reset window.__patchesLoaded
    originalPatchesLoaded = (window as any).__patchesLoaded;
    (window as any).__patchesLoaded = {};

    // Remove any existing script tags
    document.querySelectorAll('script[src*="TCProjectionDataPatch"]').forEach(s => s.remove());
  });

  afterEach(() => {
    // Restore original patches loaded state
    (window as any).__patchesLoaded = originalPatchesLoaded;
    // Clean up script tags
    document.querySelectorAll('script[src*="TCProjectionDataPatch"]').forEach(s => s.remove());
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
    it('should require TCProjectionDataPatch', () => {
      expect(handler.requiredPatches).toEqual(['assets/js/patch/TCProjectionDataPatch.js']);
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
    it('should return false if patch not loaded', () => {
      (window as any).__patchesLoaded = {};
      expect(handler.isReady()).toBe(false);
    });

    it('should return true if patch is loaded', () => {
      (window as any).__patchesLoaded = { TCProjectionDataPatch: true };
      expect(handler.isReady()).toBe(true);
    });
  });

  describe('loadPatches()', () => {
    it('should not reload if patch already loaded', async () => {
      (window as any).__patchesLoaded = { TCProjectionDataPatch: true };
      
      await handler.loadPatches(mockAppCfg);
      
      // Should not add duplicate script
      const scripts = document.querySelectorAll('script[src*="TCProjectionDataPatch"]');
      expect(scripts.length).toBe(0);
    });

    it('should load TCProjectionDataPatch script when not loaded', async () => {
      (window as any).__patchesLoaded = {};
      
      // Mock script loading by intercepting appendChild
      const appendChildSpy = spyOn(document.head, 'appendChild').and.callFake((node: any) => {
        // Simulate script loading by immediately calling onload
        if (node.tagName === 'SCRIPT' && node.src.includes('TCProjectionDataPatch')) {
          // Mark patch as loaded to simulate successful load
          (window as any).__patchesLoaded.TCProjectionDataPatch = true;
          // Call onload if it exists
          if (node.onload) {
            setTimeout(() => node.onload(), 0);
          }
        }
        return node;
      });

      await handler.loadPatches(mockAppCfg);
      
      expect(appendChildSpy).toHaveBeenCalled();
      const scriptCall = appendChildSpy.calls.all().find((call: any) => 
        call.args[0]?.src?.includes('TCProjectionDataPatch')
      );
      expect(scriptCall).toBeDefined();
    });
  });

  describe('Integration', () => {
    it('should handle full lifecycle', async () => {
      // Mark patch as loaded for integration test
      (window as any).__patchesLoaded = { TCProjectionDataPatch: true };

      // Load patches
      await handler.loadPatches(mockAppCfg);

      // Should be ready after patch is loaded
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
