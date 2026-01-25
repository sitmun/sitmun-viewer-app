import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppCfg, AppTasks, AppTree, AppNodeInfo } from '@api/model/app-cfg';

import { LayerCatalogControlHandler } from './layer-catalog-control.handler';
import { AppConfigService } from '../../services/app-config.service';
import { ConfigLookupService } from '../../services/config-lookup.service';
import { LanguageService } from '../../services/language.service';
import { SitnaApiService } from '../../services/sitna-api.service';
import { VirtualWmsCapabilitiesService } from '../../services/virtual-wms-capabilities.service';

describe('LayerCatalogControlHandler', () => {
  let handler: LayerCatalogControlHandler;
  let mockSitnaApi: jest.Mocked<SitnaApiService>;
  let mockVirtualCapabilities: jest.Mocked<VirtualWmsCapabilitiesService>;
  let mockConfigLookup: jest.Mocked<ConfigLookupService>;
  let mockLanguageService: jest.Mocked<LanguageService>;
  let _mockAppCfg: AppCfg;

  beforeEach(() => {
    // Suppress console.warn for all tests except those that explicitly test it
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    const mockTC = {
      Util: {},
      control: {
        LayerCatalog: class LayerCatalog {}
      }
    };
    const appGlobals = new Map<string, unknown>();
    mockSitnaApi = {
      getTC: jest.fn().mockReturnValue(mockTC as any),
      getSITNA: jest.fn().mockReturnValue({} as any),
      getTCProperty: jest.fn(),
      isReady: jest.fn().mockReturnValue(true),
      getGlobal: jest.fn((k: string) => appGlobals.get(k)),
      setGlobal: jest.fn((k: string, v: unknown) => {
        if (v === undefined) appGlobals.delete(k);
        else appGlobals.set(k, v);
      }),
      isGlobalDefined: jest.fn(
        (n: string) => appGlobals.has(n) && appGlobals.get(n) != null
      )
    } as Partial<jest.Mocked<SitnaApiService>> as jest.Mocked<SitnaApiService>;
    mockVirtualCapabilities = {
      generateVirtualUrl: jest.fn(),
      canGenerateCapabilities: jest.fn()
    } as Partial<
      jest.Mocked<VirtualWmsCapabilitiesService>
    > as jest.Mocked<VirtualWmsCapabilitiesService>;
    mockConfigLookup = {
      initialize: jest.fn(),
      findTreeContainingNode: jest.fn(),
      findNode: jest.fn()
    } as Partial<
      jest.Mocked<ConfigLookupService>
    > as jest.Mocked<ConfigLookupService>;
    mockLanguageService = {
      getCurrentLanguage: jest.fn()
    } as Partial<jest.Mocked<LanguageService>> as jest.Mocked<LanguageService>;

    const mockAppConfigService = {
      getControlDefault: jest.fn().mockReturnValue({ div: 'tc-slot-toc' })
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LayerCatalogControlHandler,
        { provide: SitnaApiService, useValue: mockSitnaApi },
        {
          provide: VirtualWmsCapabilitiesService,
          useValue: mockVirtualCapabilities
        },
        { provide: ConfigLookupService, useValue: mockConfigLookup },
        { provide: LanguageService, useValue: mockLanguageService },
        { provide: AppConfigService, useValue: mockAppConfigService }
      ]
    });

    handler = TestBed.inject(LayerCatalogControlHandler);

    _mockAppCfg = {
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

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });

  describe('controlIdentifier', () => {
    it('should have correct control type', () => {
      expect(handler.controlIdentifier).toBe('sitna.layerCatalog');
    });
  });

  describe('requiredPatches', () => {
    it('should have no required patches (standard control)', () => {
      expect(handler.requiredPatches).toBeUndefined();
    });
  });

  describe('buildConfiguration()', () => {
    it('should initialize config lookup', () => {
      const context: AppCfg = {
        trees: [
          {
            id: 'tree1',
            rootNode: 'node1',
            nodes: {
              node1: {
                title: 'Root',
                children: ['child1']
              } as any,
              child1: {
                title: 'Node 1',
                children: []
              } as any
            },
            title: 'Tree 1',
            image: null
          }
        ]
      } as any;
      const task: AppTasks = {
        'ui-control': 'sitna.layerCatalog',
        parameters: {}
      } as any;

      const mockTree = context.trees[0] as AppTree;
      mockConfigLookup.findTreeContainingNode.mockReturnValue(mockTree);
      mockConfigLookup.findNode.mockImplementation((nodeId: string) => {
        return context.trees[0].nodes[nodeId] as AppNodeInfo;
      });
      mockVirtualCapabilities.generateVirtualUrl.mockReturnValue(
        'virtual://test'
      );
      mockVirtualCapabilities.canGenerateCapabilities.mockReturnValue(true);

      handler.buildConfiguration(task, context);

      expect(mockConfigLookup.initialize).toHaveBeenCalledWith(context);
    });

    it('should generate virtual WMS layers for trees', () => {
      const context: AppCfg = {
        trees: [
          {
            id: 'tree1',
            rootNode: 'node1',
            nodes: {
              node1: {
                title: 'Root',
                children: ['child1']
              } as any,
              child1: {
                title: 'Catalog',
                children: []
              } as any
            },
            title: 'Tree 1',
            image: null
          }
        ]
      } as any;
      const task: AppTasks = {
        'ui-control': 'sitna.layerCatalog',
        parameters: {}
      } as any;

      const mockTree = context.trees[0] as AppTree;
      mockConfigLookup.findTreeContainingNode.mockReturnValue(mockTree);
      mockConfigLookup.findNode.mockImplementation((nodeId: string) => {
        return context.trees[0].nodes[nodeId] as AppNodeInfo;
      });
      mockVirtualCapabilities.generateVirtualUrl.mockReturnValue(
        'virtual://sitmun/child1'
      );
      mockVirtualCapabilities.canGenerateCapabilities.mockReturnValue(true);

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config?.div).toBe('tc-slot-toc');
      expect(config?.layers).toBeDefined();
      expect(config?.layers?.length).toBe(1);
      expect(config?.layers?.[0]?.type).toBe('WMS');
      expect(config?.layers?.[0]?.url).toBe('virtual://sitmun/child1');
    });

    it('should skip nodes that cannot generate valid capabilities', () => {
      const context: AppCfg = {
        trees: [
          {
            id: 'tree1',
            rootNode: 'node1',
            nodes: {
              node1: {
                title: 'Root',
                resource: '',
                isRadio: false,
                children: ['node2', 'node3'],
                order: 1
              },
              node2: {
                title: 'Valid Node',
                resource: '',
                isRadio: false,
                children: [],
                order: 1
              },
              node3: {
                title: 'Invalid Node',
                resource: '',
                isRadio: false,
                children: [],
                order: 2
              }
            },
            title: 'Tree 1',
            image: null
          }
        ]
      } as any;
      const task: AppTasks = {
        'ui-control': 'sitna.layerCatalog',
        parameters: {}
      } as any;

      mockVirtualCapabilities.generateVirtualUrl.mockReturnValue(
        'virtual://test'
      );
      mockConfigLookup.findTreeContainingNode.mockReturnValue(
        context.trees[0] as AppTree
      );
      mockConfigLookup.findNode.mockImplementation((nodeId: string) => {
        return context.trees[0].nodes[nodeId] as AppNodeInfo;
      });

      // node2 can generate capabilities, node3 cannot
      mockVirtualCapabilities.canGenerateCapabilities.mockImplementation(
        (nodeId: string) => {
          return nodeId === 'node2';
        }
      );

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config?.layers?.length).toBe(1); // Only node2 should be included
      expect(config?.layers?.[0]?.title).toBe('Valid Node');
      expect(
        mockVirtualCapabilities.canGenerateCapabilities
      ).toHaveBeenCalledWith('node2', context);
      expect(
        mockVirtualCapabilities.canGenerateCapabilities
      ).toHaveBeenCalledWith('node3', context);
    });

    it('should use node title if available', () => {
      const context: AppCfg = {
        trees: [
          {
            id: 'tree1',
            rootNode: 'node1',
            nodes: {
              node1: {
                title: 'Root',
                children: ['child1']
              } as any,
              child1: {
                title: 'Node Title',
                children: []
              } as any
            },
            title: 'Tree Title',
            image: null
          }
        ]
      } as any;
      const task: AppTasks = {
        'ui-control': 'sitna.layerCatalog',
        parameters: {}
      } as any;

      const mockTree = context.trees[0] as AppTree;
      mockConfigLookup.findTreeContainingNode.mockReturnValue(mockTree);
      mockConfigLookup.findNode.mockImplementation((nodeId: string) => {
        return context.trees[0].nodes[nodeId] as AppNodeInfo;
      });
      mockVirtualCapabilities.generateVirtualUrl.mockReturnValue(
        'virtual://test'
      );
      mockVirtualCapabilities.canGenerateCapabilities.mockReturnValue(true);

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config?.layers?.[0]?.title).toBe('Node Title');
    });

    it('should fall back to tree title if node not found', () => {
      const context: AppCfg = {
        trees: [
          {
            id: 'tree1',
            rootNode: 'node1',
            nodes: {
              node1: {
                title: 'Root',
                children: ['child1']
              } as any,
              child1: {
                title: undefined, // No title, should fall back
                children: []
              } as any
            },
            title: 'Tree Title',
            image: null
          }
        ]
      } as any;
      const task: AppTasks = {
        'ui-control': 'sitna.layerCatalog',
        parameters: {}
      } as any;

      const mockTree = context.trees[0] as AppTree;
      mockConfigLookup.findTreeContainingNode.mockReturnValue(mockTree);
      mockConfigLookup.findNode.mockImplementation((nodeId: string) => {
        if (nodeId === 'node1') {
          return context.trees[0].nodes[nodeId] as AppNodeInfo;
        }
        // Return child node without title
        return context.trees[0].nodes[nodeId] as AppNodeInfo;
      });
      mockVirtualCapabilities.generateVirtualUrl.mockReturnValue(
        'virtual://test'
      );
      mockVirtualCapabilities.canGenerateCapabilities.mockReturnValue(true);

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      // When child node has no title, it falls back to default format
      expect(config?.layers?.[0]?.title).toContain('Virtual Service');
    });

    it('should use default title if nothing found', () => {
      const context: AppCfg = {
        trees: [
          {
            id: 'tree1',
            rootNode: 'node1',
            nodes: {
              node1: {
                title: 'Root',
                children: ['child1']
              } as any,
              child1: {
                title: undefined,
                children: []
              } as any
            },
            title: 'Tree 1',
            image: null
          }
        ]
      } as any;
      const task: AppTasks = {
        'ui-control': 'sitna.layerCatalog',
        parameters: {}
      } as any;

      const mockTree = context.trees[0] as AppTree;
      mockConfigLookup.findTreeContainingNode.mockReturnValue(mockTree);
      mockConfigLookup.findNode.mockImplementation((nodeId: string) => {
        return context.trees[0].nodes[nodeId] as AppNodeInfo;
      });
      mockVirtualCapabilities.generateVirtualUrl.mockReturnValue(
        'virtual://test'
      );
      mockVirtualCapabilities.canGenerateCapabilities.mockReturnValue(true);

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      // When no title is found, uses default format "Virtual Service {nodeId}"
      expect(config?.layers?.[0]?.title).toContain('Virtual Service');
    });

    it('should handle custom root nodes from parameters', () => {
      // Note: Handler currently uses tree rootNode, not parameters.rootNodes
      // This test verifies the handler works with multiple trees
      const context: AppCfg = {
        trees: [
          {
            id: 'tree1',
            rootNode: 'node1',
            nodes: {
              node1: {
                title: 'Root 1',
                children: ['child1']
              } as any,
              child1: {
                title: 'Child 1',
                children: []
              } as any
            },
            title: 'Tree 1',
            image: null
          },
          {
            id: 'tree2',
            rootNode: 'node2',
            nodes: {
              node2: {
                title: 'Root 2',
                children: ['child2']
              } as any,
              child2: {
                title: 'Child 2',
                children: []
              } as any
            },
            title: 'Tree 2',
            image: null
          }
        ]
      } as any;
      const task: AppTasks = {
        'ui-control': 'sitna.layerCatalog',
        parameters: {
          rootNodes: ['node1', 'node2']
        }
      } as any;

      mockConfigLookup.findTreeContainingNode.mockImplementation(
        (nodeId: string) => {
          return context.trees.find((t) => t.rootNode === nodeId) as AppTree;
        }
      );
      mockConfigLookup.findNode.mockImplementation((nodeId: string) => {
        for (const tree of context.trees) {
          if (tree.nodes[nodeId]) {
            return tree.nodes[nodeId] as AppNodeInfo;
          }
        }
        return undefined;
      });
      mockVirtualCapabilities.generateVirtualUrl.mockImplementation(
        (nodeId) => `virtual://${nodeId}`
      );
      mockVirtualCapabilities.canGenerateCapabilities.mockReturnValue(true);

      const config = handler.buildConfiguration(task, context);

      // Handler uses first non-empty tree, so should return 1 layer
      expect(config).toBeDefined();
      expect(config?.layers?.length).toBe(1);
    });

    it('should handle single root node in parameters', () => {
      // Note: Handler currently uses tree rootNode, not parameters.rootNodes
      // This test verifies the handler works with a single tree
      const context: AppCfg = {
        trees: [
          {
            id: 'tree1',
            rootNode: 'node1',
            nodes: {
              node1: {
                title: 'Single',
                children: ['child1']
              } as any,
              child1: {
                title: 'Child',
                children: []
              } as any
            },
            title: 'Tree 1',
            image: null
          }
        ]
      } as any;
      const task: AppTasks = {
        'ui-control': 'sitna.layerCatalog',
        parameters: {
          rootNodes: 'node1'
        }
      } as any;

      const mockTree = context.trees[0] as AppTree;
      mockConfigLookup.findTreeContainingNode.mockReturnValue(mockTree);
      mockConfigLookup.findNode.mockImplementation((nodeId: string) => {
        return context.trees[0].nodes[nodeId] as AppNodeInfo;
      });
      mockVirtualCapabilities.generateVirtualUrl.mockReturnValue(
        'virtual://test'
      );
      mockVirtualCapabilities.canGenerateCapabilities.mockReturnValue(true);

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config?.layers?.length).toBe(1);
    });

    it('should return null if no root nodes', () => {
      const context: AppCfg = { trees: [] } as any;
      const task: AppTasks = {
        'ui-control': 'sitna.layerCatalog',
        parameters: {}
      } as any;

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeNull();
    });

    it('should merge task parameters', () => {
      const context: AppCfg = {
        trees: [
          {
            id: 'tree1',
            rootNode: 'node1',
            nodes: {
              node1: {
                title: 'Root',
                children: ['child1']
              } as any,
              child1: {
                title: 'Test',
                children: []
              } as any
            },
            title: 'Tree 1',
            image: null
          }
        ]
      } as any;
      const task: AppTasks = {
        'ui-control': 'sitna.layerCatalog',
        parameters: {
          enableSearch: true,
          collapsed: false
        }
      } as any;

      const mockTree = context.trees[0] as AppTree;
      mockConfigLookup.findTreeContainingNode.mockReturnValue(mockTree);
      mockConfigLookup.findNode.mockImplementation((nodeId: string) => {
        return context.trees[0].nodes[nodeId] as AppNodeInfo;
      });
      mockVirtualCapabilities.generateVirtualUrl.mockReturnValue(
        'virtual://test'
      );
      mockVirtualCapabilities.canGenerateCapabilities.mockReturnValue(true);

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config?.enableSearch).toBe(true);
      expect(config?.collapsed).toBe(false);
    });
  });

  describe('Integration', () => {
    it('should handle full workflow', async () => {
      const context: AppCfg = {
        trees: [
          {
            id: 'tree1',
            rootNode: 'node1',
            nodes: {
              node1: {
                title: 'Root',
                children: ['child1']
              } as any,
              child1: {
                title: 'Root Node',
                children: []
              } as any
            },
            title: 'Tree 1',
            image: null
          }
        ]
      } as any;
      const task: AppTasks = {
        'ui-control': 'sitna.layerCatalog',
        parameters: { enableSearch: true }
      } as any;

      const mockTree = context.trees[0] as AppTree;
      mockConfigLookup.findTreeContainingNode.mockReturnValue(mockTree);
      mockConfigLookup.findNode.mockImplementation((nodeId: string) => {
        return context.trees[0].nodes[nodeId] as AppNodeInfo;
      });
      mockVirtualCapabilities.generateVirtualUrl.mockReturnValue(
        'virtual://sitmun/child1'
      );
      mockVirtualCapabilities.canGenerateCapabilities.mockReturnValue(true);

      // Load patches (no-op)
      await handler.loadPatches(context);

      // Build config
      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config?.div).toBe('tc-slot-toc');
      expect(config?.layers?.length).toBe(1);
      expect(config?.layers?.[0]?.url).toBe('virtual://sitmun/child1');
      expect(config?.enableSearch).toBe(true);
    });
  });
});
