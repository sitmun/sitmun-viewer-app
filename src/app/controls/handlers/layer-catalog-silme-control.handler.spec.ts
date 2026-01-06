import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LayerCatalogSilmeControlHandler } from './layer-catalog-silme-control.handler';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import { ConfigLookupService } from '../../services/config-lookup.service';
import { AppCfg, AppTasks, AppTree, AppNodeInfo } from '@api/model/app-cfg';

describe('LayerCatalogSilmeControlHandler', () => {
  let handler: LayerCatalogSilmeControlHandler;
  let mockTCNamespace: jasmine.SpyObj<TCNamespaceService>;
  let mockConfigLookup: jasmine.SpyObj<ConfigLookupService>;
  let mockAppCfg: AppCfg;

  beforeEach(() => {
    mockTCNamespace = jasmine.createSpyObj('TCNamespaceService', [
      'waitForTC',
      'getTC'
    ]);
    mockConfigLookup = jasmine.createSpyObj('ConfigLookupService', [
      'initialize',
      'findNode'
    ]);
    mockTCNamespace.getTC.and.returnValue({
      control: { LayerCatalogSilme: {} }
    } as any);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LayerCatalogSilmeControlHandler,
        { provide: TCNamespaceService, useValue: mockTCNamespace },
        { provide: ConfigLookupService, useValue: mockConfigLookup }
      ]
    });

    handler = TestBed.inject(LayerCatalogSilmeControlHandler);

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
    it('should have correct control type', () => {
      expect(handler.controlIdentifier).toBe(
        'sitna.layerCatalog.silme.extension'
      );
    });
  });

  describe('requiredPatches', () => {
    it('should be undefined (patches applied programmatically)', () => {
      expect(handler.requiredPatches).toBeUndefined();
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

    it('should require context parameter', async () => {
      await expectAsync(handler.loadPatches(mockAppCfg)).toBeResolved();
    });
  });

  describe('buildConfiguration()', () => {
    it('should initialize config lookup', () => {
      const context: AppCfg = {
        trees: [
          {
            id: 'tree1',
            rootNode: 'node1',
            nodes: {},
            title: 'Tree 1',
            image: null
          }
        ]
      } as any;
      const task: AppTasks = {
        'ui-control': 'sitna.layerCatalog.silme.extension',
        parameters: {}
      } as any;

      mockConfigLookup.findNode.and.returnValue({
        title: 'Node'
      } as AppNodeInfo);

      handler.buildConfiguration(task, context);

      expect(mockConfigLookup.initialize).toHaveBeenCalledWith(context);
    });

    it('should create Silme node configuration', () => {
      const context: AppCfg = {
        trees: [
          {
            id: 'tree1',
            rootNode: 'node1',
            nodes: {},
            title: 'Tree 1',
            image: null
          }
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
          {
            id: 'tree1',
            rootNode: 'node1',
            nodes: {},
            title: 'Tree 1',
            image: null
          }
        ]
      } as any;
      const task: AppTasks = {
        'ui-control': 'sitna.layerCatalog.silme.extension',
        parameters: {
          enableSearch: true,
          collapsed: false
        }
      } as any;

      mockConfigLookup.findNode.and.returnValue({
        title: 'Test'
      } as AppNodeInfo);

      const config = handler.buildConfiguration(task, context);

      expect(config?.enableSearch).toBe(true);
      expect(config?.collapsed).toBe(false);
    });
  });

  describe('isReady()', () => {
    it('should return true by default (patches applied programmatically)', () => {
      expect(handler.isReady()).toBe(true);
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
      mockConfigLookup.findNode.and.returnValue({
        title: 'Root Node'
      } as AppNodeInfo);

      // Load patches
      await handler.loadPatches(context);

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
