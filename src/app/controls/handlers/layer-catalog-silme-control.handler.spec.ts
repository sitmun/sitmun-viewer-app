import { TestBed } from '@angular/core/testing';
import { LayerCatalogSilmeControlHandler } from './layer-catalog-silme-control.handler';
import { PatchLoaderService } from '../../services/patch-loader.service';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import { ConfigLookupService } from '../../services/config-lookup.service';
import { AppCfg, AppTasks, AppTree, AppNodeInfo } from '@api/model/app-cfg';

describe('LayerCatalogSilmeControlHandler', () => {
  let handler: LayerCatalogSilmeControlHandler;
  let mockPatchLoader: jasmine.SpyObj<PatchLoaderService>;
  let mockTCNamespace: jasmine.SpyObj<TCNamespaceService>;
  let mockConfigLookup: jasmine.SpyObj<ConfigLookupService>;

  beforeEach(() => {
    mockPatchLoader = jasmine.createSpyObj('PatchLoaderService', ['loadPatch', 'isPatchLoaded']);
    mockTCNamespace = jasmine.createSpyObj('TCNamespaceService', ['waitForTC', 'getTC']);
    mockConfigLookup = jasmine.createSpyObj('ConfigLookupService', [
      'initialize',
      'findNode'
    ]);

    TestBed.configureTestingModule({
      providers: [
        LayerCatalogSilmeControlHandler,
        { provide: PatchLoaderService, useValue: mockPatchLoader },
        { provide: TCNamespaceService, useValue: mockTCNamespace },
        { provide: ConfigLookupService, useValue: mockConfigLookup }
      ]
    });

    handler = TestBed.inject(LayerCatalogSilmeControlHandler);
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });

  describe('controlIdentifier', () => {
    it('should have correct control type', () => {
      expect(handler.controlIdentifier).toBe('sitna.layerCatalog.silme.extension');
    });
  });

  describe('requiredPatches', () => {
    it('should have correct patch files', () => {
      expect(handler.requiredPatches).toEqual([
        'assets/js/patch/controls/LayerCatalogSilme.js',
        'assets/js/patch/controls/LayerCatalogSilmeFolders.js'
      ]);
    });
  });

  describe('loadPatches()', () => {
    it('should wait for TC before loading patches', async () => {
      const mockTC = { control: {} };
      mockTCNamespace.waitForTC.and.returnValue(Promise.resolve(mockTC));
      mockPatchLoader.loadPatch.and.returnValue(Promise.resolve());

      await handler.loadPatches();

      expect(mockTCNamespace.waitForTC).toHaveBeenCalled();
      expect(mockPatchLoader.loadPatch).toHaveBeenCalledTimes(2);
    });

    it('should load patches sequentially', async () => {
      const mockTC = { control: {} };
      const loadOrder: string[] = [];

      mockTCNamespace.waitForTC.and.returnValue(Promise.resolve(mockTC));
      mockPatchLoader.loadPatch.and.callFake((path: string) => {
        loadOrder.push(path);
        return Promise.resolve();
      });

      await handler.loadPatches();

      expect(loadOrder).toEqual([
        'assets/js/patch/controls/LayerCatalogSilme.js',
        'assets/js/patch/controls/LayerCatalogSilmeFolders.js'
      ]);
    });

    it('should propagate patch loading errors', async () => {
      const mockTC = { control: {} };
      mockTCNamespace.waitForTC.and.returnValue(Promise.resolve(mockTC));
      mockPatchLoader.loadPatch.and.returnValue(Promise.reject(new Error('Load failed')));

      await expectAsync(handler.loadPatches()).toBeRejected();
    });
  });

  describe('buildConfiguration()', () => {
    it('should initialize config lookup', () => {
      const context: AppCfg = {
        trees: [
          { id: 'tree1', rootNode: 'node1', nodes: {}, title: 'Tree 1', image: null }
        ]
      } as any;
      const task: AppTasks = {
        'ui-control': 'sitna.layerCatalog.silme.extension',
        parameters: {}
      } as any;

      mockConfigLookup.findNode.and.returnValue({ title: 'Node' } as AppNodeInfo);

      handler.buildConfiguration(task, context);

      expect(mockConfigLookup.initialize).toHaveBeenCalledWith(context);
    });

    it('should create Silme node configuration', () => {
      const context: AppCfg = {
        trees: [
          { id: 'tree1', rootNode: 'node1', nodes: {}, title: 'Tree 1', image: null }
        ]
      } as any;
      const task: AppTasks = {
        'ui-control': 'sitna.layerCatalog.silme.extension',
        parameters: {}
      } as any;

      const mockNode: AppNodeInfo = { title: 'Test Node' } as AppNodeInfo;
      mockConfigLookup.findNode.and.returnValue(mockNode);

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config?.div).toBe('layerCatalog');
      expect(config?.silmeNodes).toBeDefined();
      expect(config!.silmeNodes!.length).toBe(1);
      expect(config!.silmeNodes![0].nodeId).toBe('node1');
      expect(config!.silmeNodes![0].node).toBe(mockNode);
    });

    it('should handle custom root nodes from parameters', () => {
      const context: AppCfg = {
        trees: []
      } as any;
      const task: AppTasks = {
        'ui-control': 'sitna.layerCatalog.silme.extension',
        parameters: {
          rootNodes: ['custom1', 'custom2']
        }
      } as any;

      const mockNode: AppNodeInfo = { title: 'Custom' } as AppNodeInfo;
      mockConfigLookup.findNode.and.returnValue(mockNode);

      const config = handler.buildConfiguration(task, context);

      expect(config!.silmeNodes!.length).toBe(2);
      expect(config!.silmeNodes![0].nodeId).toBe('custom1');
      expect(config!.silmeNodes![1].nodeId).toBe('custom2');
    });

    it('should handle single root node string', () => {
      const context: AppCfg = { trees: [] } as any;
      const task: AppTasks = {
        'ui-control': 'sitna.layerCatalog.silme.extension',
        parameters: {
          rootNodes: 'singleNode'
        }
      } as any;

      const mockNode: AppNodeInfo = { title: 'Single' } as AppNodeInfo;
      mockConfigLookup.findNode.and.returnValue(mockNode);

      const config = handler.buildConfiguration(task, context);

      expect(config!.silmeNodes!.length).toBe(1);
      expect(config!.silmeNodes![0].nodeId).toBe('singleNode');
    });

    it('should return null if no root nodes', () => {
      const context: AppCfg = { trees: [] } as any;
      const task: AppTasks = {
        'ui-control': 'sitna.layerCatalog.silme.extension',
        parameters: {}
      } as any;
      spyOn(console, 'warn');

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeNull();
      expect(console.warn).toHaveBeenCalled();
    });

    it('should merge task parameters', () => {
      const context: AppCfg = {
        trees: [
          { id: 'tree1', rootNode: 'node1', nodes: {}, title: 'Tree 1', image: null }
        ]
      } as any;
      const task: AppTasks = {
        'ui-control': 'sitna.layerCatalog.silme.extension',
        parameters: {
          enableSearch: true,
          collapsed: false
        }
      } as any;

      mockConfigLookup.findNode.and.returnValue({ title: 'Test' } as AppNodeInfo);

      const config = handler.buildConfiguration(task, context);

      expect(config?.enableSearch).toBe(true);
      expect(config?.collapsed).toBe(false);
    });
  });

  describe('isReady()', () => {
    it('should return false when patches not loaded', () => {
      mockPatchLoader.isPatchLoaded.and.returnValue(false);

      expect(handler.isReady()).toBe(false);
    });

    it('should return false when TC.control.LayerCatalogSilme not available', () => {
      mockPatchLoader.isPatchLoaded.and.returnValue(true);
      mockTCNamespace.getTC.and.returnValue({ control: {} } as any);

      expect(handler.isReady()).toBe(false);
    });

    it('should return true when patches loaded and control available', () => {
      mockPatchLoader.isPatchLoaded.and.returnValue(true);
      mockTCNamespace.getTC.and.returnValue({
        control: { LayerCatalogSilme: {} }
      } as any);

      expect(handler.isReady()).toBe(true);
    });

    it('should return false when TC is undefined', () => {
      mockPatchLoader.isPatchLoaded.and.returnValue(true);
      mockTCNamespace.getTC.and.returnValue(undefined);

      expect(handler.isReady()).toBe(false);
    });
  });

  describe('Integration', () => {
    it('should handle full Silme workflow', async () => {
      const context: AppCfg = {
        trees: [
          { 
            id: 'tree1', 
            rootNode: 'node1', 
            nodes: { node1: { title: 'Root' } as any }, 
            title: 'Tree 1', 
            image: null 
          }
        ]
      } as any;
      const task: AppTasks = {
        'ui-control': 'sitna.layerCatalog.silme.extension',
        parameters: { enableSearch: true }
      } as any;

      const mockTC = { control: { LayerCatalogSilme: {} } };
      mockTCNamespace.waitForTC.and.returnValue(Promise.resolve(mockTC as any));
      mockTCNamespace.getTC.and.returnValue(mockTC as any);
      mockPatchLoader.loadPatch.and.returnValue(Promise.resolve());
      mockPatchLoader.isPatchLoaded.and.returnValue(true);
      mockConfigLookup.findNode.and.returnValue({ title: 'Root Node' } as AppNodeInfo);

      // Load patches
      await handler.loadPatches();
      expect(mockTCNamespace.waitForTC).toHaveBeenCalled();
      expect(mockPatchLoader.loadPatch).toHaveBeenCalledTimes(2);

      // Should be ready
      expect(handler.isReady()).toBe(true);

      // Build config
      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config?.div).toBe('layerCatalog');
      expect(config!.silmeNodes!.length).toBe(1);
      expect(config!.silmeNodes![0].nodeId).toBe('node1');
      expect(config?.enableSearch).toBe(true);
    });
  });
});

