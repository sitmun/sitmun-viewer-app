import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppCfg, AppTasks, AppTree, AppNodeInfo } from '@api/model/app-cfg';
import { TranslateService } from '@ngx-translate/core';

import { LayerCatalogControlHandler } from './layer-catalog-control.handler';
import { AppConfigService } from '../../services/app-config.service';
import { CatalogLayerSelectionService } from '../../services/catalog-layer-selection.service';
import { ConfigLookupService } from '../../services/config-lookup.service';
import { LanguageService } from '../../services/language.service';
import { SitnaApiService } from '../../services/sitna-api.service';
import { SitnaCapabilitiesInterceptor } from '../../services/sitna-capabilities-interceptor.service';
import { VirtualWmsCapabilitiesService } from '../../services/virtual-wms-capabilities.service';

describe('LayerCatalogControlHandler', () => {
  let handler: LayerCatalogControlHandler;
  let mockSitnaApi: jest.Mocked<SitnaApiService>;
  let mockVirtualCapabilities: jest.Mocked<VirtualWmsCapabilitiesService>;
  let mockConfigLookup: jest.Mocked<ConfigLookupService>;
  let mockLanguageService: jest.Mocked<LanguageService>;
  let mockInterceptor: jest.Mocked<SitnaCapabilitiesInterceptor>;
  let _mockAppCfg: AppCfg;

  beforeEach(() => {
    // Suppress console.warn for all tests except those that explicitly test it
     
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
      canGenerateCapabilities: jest.fn(),
      findRealLayerConfig: jest.fn()
    } as Partial<
      jest.Mocked<VirtualWmsCapabilitiesService>
    > as jest.Mocked<VirtualWmsCapabilitiesService>;
    mockConfigLookup = {
      initialize: jest.fn(),
      findTreeContainingNode: jest.fn(),
      findNode: jest.fn(),
      findParentNodeId: jest.fn(),
      getDirectChildIds: jest.fn().mockReturnValue([]),
      isRadioFolder: jest.fn().mockReturnValue(false),
      getRadioGroupParent: jest.fn(),
      getFirstRadioChildId: jest.fn()
    } as Partial<
      jest.Mocked<ConfigLookupService>
    > as jest.Mocked<ConfigLookupService>;
    mockLanguageService = {
      getCurrentLanguage: jest.fn()
    } as Partial<jest.Mocked<LanguageService>> as jest.Mocked<LanguageService>;

    mockInterceptor = {
      ensurePatched: jest.fn().mockResolvedValue(undefined),
      restore: jest.fn()
    } as Partial<
      jest.Mocked<SitnaCapabilitiesInterceptor>
    > as jest.Mocked<SitnaCapabilitiesInterceptor>;

    const mockAppConfigService = {
      getControlDefault: jest.fn().mockReturnValue({ div: 'tc-slot-toc' })
    };

    TestBed.configureTestingModule({
            providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        LayerCatalogControlHandler,
        { provide: SitnaApiService, useValue: mockSitnaApi },
        {
          provide: VirtualWmsCapabilitiesService,
          useValue: mockVirtualCapabilities
        },
        { provide: ConfigLookupService, useValue: mockConfigLookup },
        CatalogLayerSelectionService,
        { provide: LanguageService, useValue: mockLanguageService },
        { provide: SitnaCapabilitiesInterceptor, useValue: mockInterceptor },
        {
          provide: TranslateService,
          useValue: { instant: (k: string) => k }
        },
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

  describe('needsBootstrap()', () => {
    const eligibility = { isEnabledByDefault: () => false };

    it('returns true when a layerCatalog task is present', () => {
      const tasks: AppTasks[] = [
        { 'ui-control': 'sitna.layerCatalog' } as any
      ];
      expect(handler.needsBootstrap!(tasks, eligibility)).toBe(true);
    });

    it('returns false when no layerCatalog task is present', () => {
      const tasks: AppTasks[] = [
        { 'ui-control': 'sitna.basemapSelector' } as any
      ];
      expect(handler.needsBootstrap!(tasks, eligibility)).toBe(false);
    });
  });

  describe('applyBootstrap()', () => {
    it('initializes config lookup and delegates to SitnaCapabilitiesInterceptor.ensurePatched', async () => {
      await handler.applyBootstrap!(_mockAppCfg);

      expect(mockConfigLookup.initialize).toHaveBeenCalledWith(_mockAppCfg);
      expect(mockInterceptor.ensurePatched).toHaveBeenCalledTimes(1);
      expect(mockInterceptor.ensurePatched).toHaveBeenCalledWith(_mockAppCfg);
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

    it('should order catalog layers by node order even when children array is scrambled', () => {
      // Array order: ['node3', 'node1', 'node2', 'node4']  (scrambled)
      // Node orders:   node1→1, node2→2, node3→3, node4→4
      // Expected output: node1, node2, node3, node4  (sorted by order, not array position)
      const context: AppCfg = {
        trees: [
          {
            id: 'tree1',
            rootNode: 'root',
            nodes: {
              root: {
                title: 'Root',
                resource: '',
                isRadio: false,
                children: ['node3', 'node1', 'node2', 'node4'],
                order: 0
              } as AppNodeInfo,
              node1: {
                title: 'Node 1',
                resource: '',
                isRadio: false,
                children: [],
                order: 1
              } as AppNodeInfo,
              node2: {
                title: 'Node 2',
                resource: '',
                isRadio: false,
                children: [],
                order: 2
              } as AppNodeInfo,
              node3: {
                title: 'Node 3',
                resource: '',
                isRadio: false,
                children: [],
                order: 3
              } as AppNodeInfo,
              node4: {
                title: 'Node 4',
                resource: '',
                isRadio: false,
                children: [],
                order: 4
              } as AppNodeInfo
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
        return (context.trees[0].nodes as Record<string, AppNodeInfo>)[nodeId];
      });
      mockVirtualCapabilities.generateVirtualUrl.mockImplementation(
        (nodeId: string) => `virtual://sitmun/${nodeId}`
      );
      mockVirtualCapabilities.canGenerateCapabilities.mockReturnValue(true);

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config?.layers).toHaveLength(4);
      expect(config?.layers?.[0]?.url).toBe('virtual://sitmun/node1');
      expect(config?.layers?.[1]?.url).toBe('virtual://sitmun/node2');
      expect(config?.layers?.[2]?.url).toBe('virtual://sitmun/node3');
      expect(config?.layers?.[3]?.url).toBe('virtual://sitmun/node4');
    });
  });

  describe('patchLayerCatalogAddLayerToMap', () => {
    function buildMockTC(addedLayer: any) {
      const newLayerInstance: any = {
        getCapabilitiesPromise: jest.fn().mockResolvedValue(undefined),
        isCompatible: jest.fn().mockReturnValue(true),
        Capability: { Layer: { Name: 'n1' } }
      };
      const Raster = jest.fn().mockImplementation(() => newLayerInstance);
      const LayerCatalog: any = function () {};
      LayerCatalog.prototype.addLayerToMap = function () {};
      return {
        TC: {
          Util: {
            extend: (target: any, ...sources: any[]) =>
              Object.assign(target ?? {}, ...sources)
          },
          layer: { Raster },
          control: { LayerCatalog }
        },
        newLayerInstance,
        addedLayer
      };
    }

    const minimalContext: AppCfg = {
      application: {
        id: 1,
        title: 't',
        type: 'x',
        theme: 'd',
        srs: 'EPSG:25831',
        initialExtent: [0, 0, 1, 1]
      },
      backgrounds: [],
      groups: [],
      layers: [],
      services: [],
      tasks: [],
      trees: []
    } as any;

    it('calls setOpacity((100-transparency)/100) on the layer returned by map.addLayer', async () => {
      const setOpacityMock = jest.fn().mockResolvedValue(undefined);
      const addedLayer: any = { setOpacity: setOpacityMock, renderOptions: {} };
      const { TC } = buildMockTC(addedLayer);
      mockSitnaApi.getTC.mockReturnValue(TC as any);

      mockVirtualCapabilities.findRealLayerConfig = jest
        .fn()
        .mockReturnValue({
          url: 'https://wms.example/',
          type: 'WMS',
          layerNames: ['n1'],
          serviceId: 'service/1',
          transparency: 50
        });

      mockSitnaApi.setGlobal('currentAppCfg', minimalContext);

      await handler['patchLayerCatalogAddLayerToMap']();

      const map = {
        crs: 'EPSG:25831',
        addLayer: jest.fn().mockResolvedValue(addedLayer)
      };
      const ctxThis = {
        map,
        getUID: () => 'uid-1',
        showProjectionChangeDialog: () => undefined
      };
      const layerArg = {
        title: 'L1',
        url: 'https://stale/',
        type: 'WMS',
        options: { url: 'https://stale/', type: 'WMS' }
      };

      await TC.control.LayerCatalog.prototype.addLayerToMap.call(
        ctxThis,
        layerArg,
        'node/1'
      );

      expect(map.addLayer).toHaveBeenCalledTimes(1);
      expect(map.addLayer.mock.calls[0][0]).toMatchObject({
        renderOptions: { opacity: 0.5 }
      });
      expect(setOpacityMock).toHaveBeenCalledTimes(1);
      expect(setOpacityMock).toHaveBeenCalledWith(0.5);
      expect(addedLayer.renderOptions.opacity).toBe(0.5);
    });

    it('skips setOpacity when transparency is 0 (default opaque)', async () => {
      const setOpacityMock = jest.fn();
      const addedLayer: any = { setOpacity: setOpacityMock };
      const { TC } = buildMockTC(addedLayer);
      mockSitnaApi.getTC.mockReturnValue(TC as any);

      mockVirtualCapabilities.findRealLayerConfig = jest
        .fn()
        .mockReturnValue({
          url: 'https://wms.example/',
          type: 'WMS',
          layerNames: ['n1'],
          serviceId: 'service/1',
          transparency: 0
        });

      mockSitnaApi.setGlobal('currentAppCfg', minimalContext);

      await handler['patchLayerCatalogAddLayerToMap']();

      const map = {
        crs: 'EPSG:25831',
        addLayer: jest.fn().mockResolvedValue(addedLayer)
      };
      const ctxThis = {
        map,
        getUID: () => 'uid-1',
        showProjectionChangeDialog: () => undefined
      };

      await TC.control.LayerCatalog.prototype.addLayerToMap.call(
        ctxThis,
        { title: 'L1', options: {} },
        'node/1'
      );

      expect(map.addLayer).toHaveBeenCalledTimes(1);
      expect(setOpacityMock).not.toHaveBeenCalled();
    });

    it('skips setOpacity when transparency is undefined', async () => {
      const setOpacityMock = jest.fn();
      const addedLayer: any = { setOpacity: setOpacityMock };
      const { TC } = buildMockTC(addedLayer);
      mockSitnaApi.getTC.mockReturnValue(TC as any);

      mockVirtualCapabilities.findRealLayerConfig = jest
        .fn()
        .mockReturnValue({
          url: 'https://wms.example/',
          type: 'WMS',
          layerNames: ['n1'],
          serviceId: 'service/1'
        });

      mockSitnaApi.setGlobal('currentAppCfg', minimalContext);

      await handler['patchLayerCatalogAddLayerToMap']();

      const map = {
        crs: 'EPSG:25831',
        addLayer: jest.fn().mockResolvedValue(addedLayer)
      };
      const ctxThis = {
        map,
        getUID: () => 'uid-1',
        showProjectionChangeDialog: () => undefined
      };

      await TC.control.LayerCatalog.prototype.addLayerToMap.call(
        ctxThis,
        { title: 'L1', options: {} },
        'node/1'
      );

      expect(setOpacityMock).not.toHaveBeenCalled();
    });

    it('does not call setOpacity when CRS is incompatible (layer never added)', async () => {
      const setOpacityMock = jest.fn();
      const addedLayer: any = { setOpacity: setOpacityMock };
      const { TC, newLayerInstance } = buildMockTC(addedLayer);
      newLayerInstance.isCompatible = jest.fn().mockReturnValue(false);
      mockSitnaApi.getTC.mockReturnValue(TC as any);

      mockVirtualCapabilities.findRealLayerConfig = jest
        .fn()
        .mockReturnValue({
          url: 'https://wms.example/',
          type: 'WMS',
          layerNames: ['n1'],
          serviceId: 'service/1',
          transparency: 75
        });

      mockSitnaApi.setGlobal('currentAppCfg', minimalContext);

      await handler['patchLayerCatalogAddLayerToMap']();

      const map = {
        crs: 'EPSG:3857',
        addLayer: jest.fn().mockResolvedValue(addedLayer)
      };
      const ctxThis = {
        map,
        getUID: () => 'uid-1',
        showProjectionChangeDialog: jest.fn()
      };

      await TC.control.LayerCatalog.prototype.addLayerToMap.call(
        ctxThis,
        { title: 'L1', options: {} },
        'node/1'
      );

      expect(map.addLayer).not.toHaveBeenCalled();
      expect(setOpacityMock).not.toHaveBeenCalled();
    });

    async function expectZIndexOnAddLayer(
      realLayerConfig: any | null,
      zIndex: number
    ): Promise<void> {
      const addedLayer: any = {};
      const { TC } = buildMockTC(addedLayer);
      mockSitnaApi.getTC.mockReturnValue(TC as any);
      mockVirtualCapabilities.findRealLayerConfig = jest
        .fn()
        .mockReturnValue(realLayerConfig);
      mockSitnaApi.setGlobal('currentAppCfg', minimalContext);
      await handler['patchLayerCatalogAddLayerToMap']();
      const addLayer = jest.fn().mockResolvedValue(addedLayer);
      await TC.control.LayerCatalog.prototype.addLayerToMap.call(
        {
          map: { crs: 'EPSG:25831', addLayer },
          getUID: () => 'uid-1',
          showProjectionChangeDialog: () => undefined
        },
        {
          title: 'L1',
          url: 'https://stale/',
          type: 'WMS',
          options: { url: 'https://stale/', type: 'WMS' }
        },
        'node/1'
      );
      expect(addLayer.mock.calls[0][0]).toMatchObject({ zIndex });
    }

    const baseRealLayer = {
      url: 'https://wms.example/',
      type: 'WMS',
      layerNames: ['n1'],
      serviceId: 'service/1'
    };

    it('maps profile order to addLayer zIndex', async () => {
      await expectZIndexOnAddLayer({ ...baseRealLayer, order: 5 }, 5);
    });

    it('uses zIndex 0 when order is 0', async () => {
      await expectZIndexOnAddLayer({ ...baseRealLayer, order: 0 }, 0);
    });

    it('uses zIndex 0 when order is absent', async () => {
      await expectZIndexOnAddLayer({ ...baseRealLayer }, 0);
    });

    it('uses zIndex 0 without realLayerConfig', async () => {
      await expectZIndexOnAddLayer(null, 0);
    });
  });

  describe('patchLayerCatalogGetLayerNodes', () => {
    const LOADING_CLASS = 'tc-loading';

    function buildMockTCForGetLayerNodes() {
      const LayerCatalog: any = function () {};
      LayerCatalog.prototype.getLayerNodes = function () {};
      return {
        TC: {
          Consts: { classes: { LOADING: LOADING_CLASS } },
          control: { LayerCatalog }
        }
      };
    }

    function buildDiv(nodeId: string, children: string[] = []): HTMLElement {
      const div = document.createElement('div');
      div.classList.add('tc-ctl-lcat-tree');
      const ul = document.createElement('ul');
      ul.classList.add('tc-ctl-lcat-branch');
      const rootLi = document.createElement('li');
      rootLi.classList.add('tc-ctl-lcat-node');

      const leafLi = document.createElement('li');
      leafLi.setAttribute('data-layer-name', nodeId);

      for (const childId of children) {
        const childLi = document.createElement('li');
        childLi.setAttribute('data-layer-name', childId);
        leafLi.appendChild(childLi);
      }

      rootLi.appendChild(leafLi);
      ul.appendChild(rootLi);
      div.appendChild(ul);
      return div;
    }

    it('returns the matched leaf when nodeId is in options.nodeId', async () => {
      const { TC } = buildMockTCForGetLayerNodes();
      mockSitnaApi.getTC.mockReturnValue(TC as any);
      await handler['patchLayerCatalogGetLayerNodes']();

      const div = buildDiv('node/1');
      const ctxThis = { div };

      const result: Element[] = TC.control.LayerCatalog.prototype.getLayerNodes.call(
        ctxThis,
        { options: { nodeId: 'node/1' } }
      );

      const leafLi = div.querySelector('li[data-layer-name="node/1"]');
      expect(result).toContain(leafLi);
    });

    it('returns the matched leaf when nodeId is top-level (backward compatibility)', async () => {
      const { TC } = buildMockTCForGetLayerNodes();
      mockSitnaApi.getTC.mockReturnValue(TC as any);
      await handler['patchLayerCatalogGetLayerNodes']();

      const div = buildDiv('node/1');
      const ctxThis = { div };

      const result: Element[] = TC.control.LayerCatalog.prototype.getLayerNodes.call(
        ctxThis,
        { nodeId: 'node/1' }
      );

      const leafLi = div.querySelector('li[data-layer-name="node/1"]');
      expect(result).toContain(leafLi);
    });

    it('removes the loading class from the matched leaf', async () => {
      const { TC } = buildMockTCForGetLayerNodes();
      mockSitnaApi.getTC.mockReturnValue(TC as any);
      await handler['patchLayerCatalogGetLayerNodes']();

      const div = buildDiv('node/1');
      const leafLi = div.querySelector('li[data-layer-name="node/1"]')!;
      leafLi.classList.add(LOADING_CLASS);
      expect(leafLi.classList.contains(LOADING_CLASS)).toBe(true);

      TC.control.LayerCatalog.prototype.getLayerNodes.call(
        { div },
        { options: { nodeId: 'node/1' } }
      );

      expect(leafLi.classList.contains(LOADING_CLASS)).toBe(false);
    });

    it('includes leaf descendants in the result', async () => {
      const { TC } = buildMockTCForGetLayerNodes();
      mockSitnaApi.getTC.mockReturnValue(TC as any);
      await handler['patchLayerCatalogGetLayerNodes']();

      const div = buildDiv('node/1', ['node/1/sub']);
      const ctxThis = { div };

      const result: Element[] = TC.control.LayerCatalog.prototype.getLayerNodes.call(
        ctxThis,
        { options: { nodeId: 'node/1' } }
      );

      const subLi = div.querySelector('li[data-layer-name="node/1/sub"]');
      expect(result).toContain(subLi);
    });

    it('returns empty list when nodeId does not match any node', async () => {
      const { TC } = buildMockTCForGetLayerNodes();
      mockSitnaApi.getTC.mockReturnValue(TC as any);
      await handler['patchLayerCatalogGetLayerNodes']();

      const div = buildDiv('node/1');
      const ctxThis = { div };

      const result: Element[] = TC.control.LayerCatalog.prototype.getLayerNodes.call(
        ctxThis,
        { options: { nodeId: 'node/99' } }
      );

      const leafLi = div.querySelector('li[data-layer-name="node/1"]');
      expect(result).not.toContain(leafLi);
    });

    it('does not match nodes by layerNames when nodeId is absent', async () => {
      const { TC } = buildMockTCForGetLayerNodes();
      mockSitnaApi.getTC.mockReturnValue(TC as any);

      // Replace original stub with one that tracks invocation and returns a sentinel.
      let originalCalled = false;
      TC.control.LayerCatalog.prototype.getLayerNodes = function () {
        originalCalled = true;
        return [];
      };

      await handler['patchLayerCatalogGetLayerNodes']();

      const div = buildDiv('node/1');
      const result: Element[] = TC.control.LayerCatalog.prototype.getLayerNodes.call(
        { div },
        { options: { layerNames: ['node/1'] } }
      );

      // The layerNames fallback was removed: the original must be called (proceed) and
      // the leaf must not appear in the result (no DOM traversal by layerNames).
      expect(originalCalled).toBe(true);
      const leafLi = div.querySelector('li[data-layer-name="node/1"]');
      expect(result).not.toContain(leafLi);
    });
  });

  describe('loadPatches() cleanup', () => {
    beforeEach(() => {
      handler.cleanup();
    });

    it('restores all meld-wrapped LayerCatalog and Raster targets on cleanup', async () => {
      const layerCatalogMethods = {
        addLayerToMap: jest.fn(),
        addLayer: jest.fn(),
        getLayerNodes: jest.fn(),
        getLayerRootNode: jest.fn(),
        renderData: jest.fn(),
        loadTemplates: jest.fn(),
        createSearchAutocomplete: jest.fn()
      };
      const rasterMethods = {
        getPath: jest.fn(),
        getInfo: jest.fn()
      };

      class LayerCatalog {}
      Object.assign(LayerCatalog.prototype, layerCatalogMethods);

      class Raster {}
      Object.assign(Raster.prototype, rasterMethods);

      const patchableTC = {
        Util: {
          regex: { PROTOCOL: /^https?:/i },
          reqGetMapOnCapabilities: jest.fn(),
          extend: Object.assign
        },
        Consts: { classes: { LOADING: 'tc-loading' } },
        control: { LayerCatalog },
        layer: { Raster }
      };

      mockSitnaApi.getTC.mockReturnValue(patchableTC as any);

      const ctlProto = patchableTC.control.LayerCatalog.prototype as typeof layerCatalogMethods;
      const rasterProto = patchableTC.layer.Raster.prototype as typeof rasterMethods;
      const originalAddLayerToMap = ctlProto.addLayerToMap;
      const originalGetLayerNodes = ctlProto.getLayerNodes;
      const originalGetLayerRootNode = ctlProto.getLayerRootNode;
      const originalRenderData = ctlProto.renderData;
      const originalGetPath = rasterProto.getPath;
      const originalGetInfo = rasterProto.getInfo;

      await handler.loadPatches(_mockAppCfg);

      expect(ctlProto.addLayerToMap).not.toBe(originalAddLayerToMap);
      expect(ctlProto.getLayerNodes).not.toBe(originalGetLayerNodes);
      expect(ctlProto.getLayerRootNode).not.toBe(originalGetLayerRootNode);
      expect(ctlProto.renderData).not.toBe(originalRenderData);
      expect(rasterProto.getPath).not.toBe(originalGetPath);
      expect(rasterProto.getInfo).not.toBe(originalGetInfo);

      handler.cleanup();

      expect(ctlProto.addLayerToMap).toBe(originalAddLayerToMap);
      expect(ctlProto.getLayerNodes).toBe(originalGetLayerNodes);
      expect(ctlProto.getLayerRootNode).toBe(originalGetLayerRootNode);
      expect(ctlProto.renderData).toBe(originalRenderData);
      expect(rasterProto.getPath).toBe(originalGetPath);
      expect(rasterProto.getInfo).toBe(originalGetInfo);
    });

    it('reapplies meld-wrapped LayerCatalog and Raster targets after cleanup', async () => {
      const layerCatalogMethods = {
        addLayerToMap: jest.fn(),
        addLayer: jest.fn(),
        getLayerNodes: jest.fn(),
        getLayerRootNode: jest.fn(),
        renderData: jest.fn(),
        loadTemplates: jest.fn(),
        createSearchAutocomplete: jest.fn()
      };
      const rasterMethods = {
        getPath: jest.fn(),
        getInfo: jest.fn()
      };

      class LayerCatalog {}
      Object.assign(LayerCatalog.prototype, layerCatalogMethods);

      class Raster {}
      Object.assign(Raster.prototype, rasterMethods);

      const patchableTC = {
        Util: {
          regex: { PROTOCOL: /^https?:/i },
          reqGetMapOnCapabilities: jest.fn(),
          extend: Object.assign
        },
        Consts: { classes: { LOADING: 'tc-loading' } },
        control: { LayerCatalog },
        layer: { Raster }
      };

      mockSitnaApi.getTC.mockReturnValue(patchableTC as any);

      const ctlProto = patchableTC.control.LayerCatalog.prototype as typeof layerCatalogMethods;
      const rasterProto = patchableTC.layer.Raster.prototype as typeof rasterMethods;
      const originalAddLayerToMap = ctlProto.addLayerToMap;
      const originalGetLayerNodes = ctlProto.getLayerNodes;
      const originalGetLayerRootNode = ctlProto.getLayerRootNode;
      const originalRenderData = ctlProto.renderData;
      const originalGetPath = rasterProto.getPath;
      const originalGetInfo = rasterProto.getInfo;

      await handler.loadPatches(_mockAppCfg);
      handler.cleanup();

      expect(ctlProto.addLayerToMap).toBe(originalAddLayerToMap);
      expect(rasterProto.getInfo).toBe(originalGetInfo);

      await handler.loadPatches(_mockAppCfg);

      expect(ctlProto.addLayerToMap).not.toBe(originalAddLayerToMap);
      expect(ctlProto.getLayerNodes).not.toBe(originalGetLayerNodes);
      expect(ctlProto.getLayerRootNode).not.toBe(originalGetLayerRootNode);
      expect(ctlProto.renderData).not.toBe(originalRenderData);
      expect(rasterProto.getPath).not.toBe(originalGetPath);
      expect(rasterProto.getInfo).not.toBe(originalGetInfo);
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

  describe('loadByDefault working layers', () => {
    const layerCatalogTask: AppTasks = {
      id: 'task/1',
      name: 'Catalog',
      'ui-control': 'sitna.layerCatalog',
      parameters: {}
    };

    const activeCatalogContext: AppCfg = {
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
      tasks: [layerCatalogTask],
      trees: [
        {
          id: 'tree/1',
          title: 'Catalog A',
          image: null,
          rootNode: 'node/tree/1',
          nodes: {
            'node/tree/1': {
              title: 'Root A',
              isRadio: false,
              children: ['node/1', 'node/2'],
              order: 0
            },
            'node/1': {
              title: 'Default layer',
              resource: 'layer/1',
              loadByDefault: true,
              isRadio: false,
              children: [],
              order: 2
            },
            'node/2': {
              title: 'Manual layer',
              resource: 'layer/2',
              loadByDefault: false,
              isRadio: false,
              children: [],
              order: 1
            }
          }
        },
        {
          id: 'tree/2',
          title: 'Catalog B',
          image: null,
          rootNode: 'node/tree/2',
          nodes: {
            'node/tree/2': {
              title: 'Root B',
              isRadio: false,
              children: ['node/9'],
              order: 0
            },
            'node/9': {
              title: 'Other catalog default',
              resource: 'layer/9',
              loadByDefault: true,
              isRadio: false,
              children: [],
              order: 1
            }
          }
        }
      ]
    };

    beforeEach(() => {
      mockSitnaApi.setGlobal('layerCatalogsForModal', {
        currentTreeId: 'tree/1',
        catalogs: [
          { id: 'tree/1', catalog: 'Catalog A' },
          { id: 'tree/2', catalog: 'Catalog B' }
        ],
        rootNodeIds: ['node/tree/1', 'node/tree/2']
      });
      const realLookup = new ConfigLookupService();
      realLookup.initialize(activeCatalogContext);
      (handler as any).configLookup = realLookup;
      mockVirtualCapabilities.canGenerateCapabilities.mockReturnValue(true);
    });

    it('collects loadByDefault leaves only from the active catalog', () => {
      const collected = handler.collectDefaultLayerNodes(activeCatalogContext);

      expect(collected).toHaveLength(1);
      expect(collected[0]).toEqual({
        nodeId: 'node/1',
        title: 'Default layer',
        order: 2
      });
    });

    it('excludes task leaves even when loadByDefault is true', () => {
      const context: AppCfg = {
        ...activeCatalogContext,
        trees: [
          {
            ...activeCatalogContext.trees[0],
            nodes: {
              'node/tree/1': {
                title: 'Root A',
                isRadio: false,
                children: ['node/task'],
                order: 0
              },
              'node/task': {
                title: 'Task leaf',
                resource: 'layer/1',
                action: 'task/5',
                loadByDefault: true,
                isRadio: false,
                children: [],
                order: 1
              }
            }
          }
        ]
      };

      expect(handler.collectDefaultLayerNodes(context)).toEqual([]);
    });

    it('applies defaults through the catalog control when configured', async () => {
      const addLayerToMap = jest.fn().mockResolvedValue(undefined);
      const configuredLayer = {
        title: 'Catalog branch',
        url: 'virtual://sitmun-layer-catalog/node/1'
      };
      mockVirtualCapabilities.findRealLayerConfig.mockReturnValue({
        url: 'https://example.test/wms',
        type: 'WMS',
        layerNames: ['layer'],
        order: 1
      });

      const map = {
        getControlsByClass: () => [
          {
            addLayerToMap,
            map: {},
            options: { layers: [configuredLayer] }
          }
        ]
      };

      await handler.applyDefaultWorkingLayers(map, activeCatalogContext, 7);
      await handler.applyDefaultWorkingLayers(map, activeCatalogContext, 7);

      expect(addLayerToMap).toHaveBeenCalledTimes(1);
      expect(addLayerToMap).toHaveBeenCalledWith(
        configuredLayer,
        'node/1'
      );
    });

    it('applies defaults independently per map object', async () => {
      const addLayerToMap = jest.fn().mockResolvedValue(undefined);
      mockVirtualCapabilities.findRealLayerConfig.mockReturnValue({
        url: 'https://example.test/wms',
        type: 'WMS',
        layerNames: ['layer'],
        order: 1
      });
      const mapA = { getControlsByClass: () => [{ addLayerToMap, map: {} }] };
      const mapB = { getControlsByClass: () => [{ addLayerToMap, map: {} }] };

      await handler.applyDefaultWorkingLayers(mapA, activeCatalogContext, 1);
      await handler.applyDefaultWorkingLayers(mapB, activeCatalogContext, 1);

      expect(addLayerToMap).toHaveBeenCalledTimes(2);
    });

    it('retries when the catalog control is absent on first call', async () => {
      const addLayerToMap = jest.fn().mockResolvedValue(undefined);
      mockVirtualCapabilities.findRealLayerConfig.mockReturnValue({
        url: 'https://example.test/wms',
        type: 'WMS',
        layerNames: ['layer'],
        order: 1
      });
      const map = {
        getControlsByClass: jest
          .fn()
          .mockReturnValueOnce([])
          .mockReturnValue([{ addLayerToMap, map: {} }])
      };

      await handler.applyDefaultWorkingLayers(map, activeCatalogContext, 3);
      await handler.applyDefaultWorkingLayers(map, activeCatalogContext, 3);

      expect(addLayerToMap).toHaveBeenCalledTimes(1);
    });

    it('deduplicates defaults by resource in DFS order', () => {
      const context: AppCfg = {
        ...activeCatalogContext,
        trees: [
          {
            ...activeCatalogContext.trees[0],
            nodes: {
              'node/tree/1': {
                title: 'Root A',
                isRadio: false,
                children: ['node/branch', 'node/late'],
                order: 0
              },
              'node/branch': {
                title: 'Branch',
                isRadio: false,
                children: ['node/first'],
                order: 1
              },
              'node/first': {
                title: 'First default',
                resource: 'layer/shared',
                loadByDefault: true,
                isRadio: false,
                children: [],
                order: 5
              },
              'node/late': {
                title: 'Late branch',
                isRadio: false,
                children: ['node/dup'],
                order: 10
              },
              'node/dup': {
                title: 'Duplicate resource',
                resource: 'layer/shared',
                loadByDefault: true,
                isRadio: false,
                children: [],
                order: 1
              }
            }
          }
        ]
      };
      const realLookup = new ConfigLookupService();
      realLookup.initialize(context);
      (handler as any).configLookup = realLookup;

      expect(handler.collectDefaultLayerNodes(context)).toEqual([
        {
          nodeId: 'node/first',
          title: 'First default',
          order: 5
        }
      ]);
    });

    it('keeps the first claim in a radio group', () => {
      const context: AppCfg = {
        ...activeCatalogContext,
        trees: [
          {
            ...activeCatalogContext.trees[0],
            nodes: {
              'node/tree/1': {
                title: 'Root',
                isRadio: false,
                children: ['node/radio'],
                order: 0
              },
              'node/radio': {
                title: 'Radio',
                isRadio: true,
                children: ['node/a', 'node/b'],
                order: 1
              },
              'node/a': {
                title: 'A',
                resource: 'layer/a',
                loadByDefault: true,
                isRadio: false,
                children: [],
                order: 2
              },
              'node/b': {
                title: 'B',
                resource: 'layer/b',
                loadByDefault: true,
                isRadio: false,
                children: [],
                order: 1
              }
            }
          }
        ]
      };
      const realLookup = new ConfigLookupService();
      realLookup.initialize(context);
      (handler as any).configLookup = realLookup;

      expect(handler.collectDefaultLayerNodes(context)).toEqual([
        { nodeId: 'node/a', title: 'A', order: 2 }
      ]);
    });

    it('is a no-op when the layer catalog task is absent', async () => {
      const addLayerToMap = jest.fn();
      await handler.applyDefaultWorkingLayers(
        { getControlsByClass: () => [{ addLayerToMap }] },
        { ...activeCatalogContext, tasks: [] },
        1
      );
      expect(addLayerToMap).not.toHaveBeenCalled();
    });
  });

  describe('radio controls and selection orchestration', () => {
    const minimalContext: AppCfg = {
      application: {
        id: 1,
        title: 't',
        type: 'x',
        theme: 'd',
        srs: 'EPSG:25831',
        initialExtent: [0, 0, 1, 1]
      },
      backgrounds: [],
      groups: [],
      layers: [],
      services: [],
      tasks: [],
      trees: [
        {
          id: 'tree/1',
          title: 'Catalog',
          image: null,
          rootNode: 'node/root',
          nodes: {
            'node/root': {
              title: 'Root',
              isRadio: false,
              children: ['node/radio'],
              order: 0
            },
            'node/radio': {
              title: 'Radio',
              isRadio: true,
              children: ['node/a', 'node/b'],
              order: 1
            },
            'node/a': {
              title: 'A',
              resource: 'layer/a',
              isRadio: false,
              children: [],
              order: 1
            },
            'node/b': {
              title: 'B',
              resource: 'layer/b',
              isRadio: false,
              children: [],
              order: 2
            }
          }
        }
      ]
    } as any;

    beforeEach(() => {
      const realLookup = new ConfigLookupService();
      realLookup.initialize(minimalContext);
      (handler as any).configLookup = realLookup;
      mockSitnaApi.setGlobal('currentAppCfg', minimalContext);
    });

    it('decorates radio folder children with native inputs after renderBranch', async () => {
      const LayerCatalog: any = function () {};
      LayerCatalog.prototype.renderBranch = function (
        _layer: unknown,
        callback?: () => void
      ) {
        this.div.innerHTML = `
          <ul>
            <li class="tc-ctl-lcat-node" data-layer-name="node/radio">
              <span class="tc-ctl-lcat-node-title">Radio</span>
              <ul>
                <li class="tc-ctl-lcat-node" data-layer-name="node/a"><span>A</span></li>
                <li class="tc-ctl-lcat-node" data-layer-name="node/b"><span>B</span></li>
              </ul>
            </li>
          </ul>`;
        callback?.();
      };
      LayerCatalog.prototype.getUID = () => 'uid-1';
      const TC = { control: { LayerCatalog } };
      mockSitnaApi.getTC.mockReturnValue(TC);

      await handler['patchLayerCatalogRenderBranch']();

      const div = document.createElement('div');
      const catalog = new LayerCatalog();
      catalog.div = div;
      catalog.map = {};
      catalog.div.innerHTML = LayerCatalog.prototype.renderBranch.call(catalog, {});
      await LayerCatalog.prototype.renderBranch.call(catalog, {}, () => undefined);

      const radios = div.querySelectorAll('input[type="radio"].sitmun-lcat-radio');
      expect(radios).toHaveLength(2);
      expect((radios[0] as HTMLInputElement).name).toBe(
        (radios[1] as HTMLInputElement).name
      );
      expect((radios[0] as HTMLInputElement).name).toContain(
        'sitmun-radio-node/radio-'
      );
    });

    it('passes nodeId to map.addLayer for catalog-managed layers', async () => {
      const addedLayer: any = { options: {}, setOpacity: jest.fn() };
      const newLayerInstance: any = {
        getCapabilitiesPromise: jest.fn().mockResolvedValue(undefined),
        isCompatible: jest.fn().mockReturnValue(true),
        Capability: { Layer: { Name: 'n1' } }
      };
      const Raster = jest.fn().mockImplementation(() => newLayerInstance);
      const LayerCatalog: any = function () {};
      LayerCatalog.prototype.addLayerToMap = function () {};
      const TC = {
        Util: {
          extend: (target: any, ...sources: any[]) =>
            Object.assign(target ?? {}, ...sources)
        },
        layer: { Raster },
        control: { LayerCatalog },
        Consts: { event: { LAYERADD: 'layeradd', LAYERREMOVE: 'layerremove' } }
      };
      mockSitnaApi.getTC.mockReturnValue(TC);
      mockVirtualCapabilities.findRealLayerConfig.mockReturnValue({
        url: 'https://wms.example/',
        type: 'WMS',
        layerNames: ['n1'],
        order: 0
      });

      await handler['patchLayerCatalogAddLayerToMap']();

      const addLayer = jest.fn().mockResolvedValue({
        ...addedLayer,
        options: { nodeId: 'node/a' }
      });
      const map = {
        crs: 'EPSG:25831',
        addLayer,
        on: jest.fn(),
        off: jest.fn(),
        workLayers: []
      };
      await TC.control.LayerCatalog.prototype.addLayerToMap.call(
        {
          map,
          getUID: () => 'uid-1',
          showProjectionChangeDialog: () => undefined
        },
        { title: 'A', options: {} },
        'node/a'
      );

      expect(addLayer.mock.calls[0][0]).toMatchObject({ nodeId: 'node/a' });
    });

    it('keeps the previous radio claim until replacement succeeds', async () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const newLayerInstance: any = {
        getCapabilitiesPromise: jest.fn().mockResolvedValue(undefined),
        isCompatible: jest.fn().mockReturnValue(true),
        Capability: { Layer: { Name: 'n1' } }
      };
      const Raster = jest.fn().mockImplementation(() => newLayerInstance);
      const LayerCatalog: any = function () {};
      LayerCatalog.prototype.addLayerToMap = function () {};
      const TC = {
        Util: {
          extend: (target: any, ...sources: any[]) =>
            Object.assign(target ?? {}, ...sources)
        },
        layer: { Raster },
        control: { LayerCatalog },
        Consts: { event: { LAYERADD: 'layeradd', LAYERREMOVE: 'layerremove' } }
      };
      mockSitnaApi.getTC.mockReturnValue(TC);
      mockVirtualCapabilities.findRealLayerConfig.mockImplementation(
        (nodeId: string) => ({
          url: `https://wms.example/${nodeId}`,
          type: 'WMS',
          layerNames: ['n1'],
          order: 0
        })
      );

      await handler['patchLayerCatalogAddLayerToMap']();

      const map = {
        crs: 'EPSG:25831',
        addLayer: jest.fn().mockResolvedValue({ options: { nodeId: 'node/a' } }),
        on: jest.fn(),
        off: jest.fn(),
        workLayers: []
      };
      const ctx = {
        map,
        getUID: () => 'uid-1',
        showProjectionChangeDialog: () => undefined
      };

      await TC.control.LayerCatalog.prototype.addLayerToMap.call(
        ctx,
        { title: 'A', options: {} },
        'node/a'
      );
      expect(selection.isNodeSelected(map, 'node/a')).toBe(true);

      newLayerInstance.isCompatible = jest.fn().mockReturnValue(false);
      await TC.control.LayerCatalog.prototype.addLayerToMap.call(
        ctx,
        { title: 'B', options: {} },
        'node/b'
      );

      expect(selection.isNodeSelected(map, 'node/a')).toBe(true);
      expect(selection.isNodeSelected(map, 'node/b')).toBe(false);
    });
  });

  describe('TNO remediation: selection and event bridge', () => {
    const minimalContext: AppCfg = {
      application: {
        id: 1,
        title: 't',
        type: 'x',
        theme: 'd',
        srs: 'EPSG:25831',
        initialExtent: [0, 0, 1, 1]
      },
      backgrounds: [],
      groups: [],
      layers: [],
      services: [],
      tasks: [],
      trees: [
        {
          id: 'tree/1',
          title: 'Catalog',
          image: null,
          rootNode: 'node/root',
          nodes: {
            'node/root': {
              title: 'Root',
              isRadio: false,
              children: ['node/radio', 'node/b-preload'],
              order: 0
            },
            'node/radio': {
              title: 'Radio',
              isRadio: true,
              children: ['node/a', 'node/b'],
              order: 1
            },
            'node/a': {
              title: 'Layer A',
              resource: 'layer/a',
              isRadio: false,
              children: [],
              order: 1
            },
            'node/b': {
              title: 'Layer B',
              resource: 'layer/b',
              isRadio: false,
              children: [],
              order: 2
            },
            'node/b-preload': {
              title: 'Preload B',
              resource: 'layer/b',
              isRadio: false,
              children: [],
              order: 3
            },
            'node/shared-a': {
              title: 'Shared A',
              resource: 'layer/shared',
              isRadio: false,
              children: [],
              order: 4
            },
            'node/shared-b': {
              title: 'Shared B',
              resource: 'layer/shared',
              isRadio: false,
              children: [],
              order: 5
            },
            'node/plain-leaf': {
              title: 'Plain leaf',
              resource: 'layer/plain',
              isRadio: false,
              children: [],
              order: 6
            }
          }
        }
      ]
    } as any;

    function buildPatchedHandler() {
      const newLayerInstance: any = {
        getCapabilitiesPromise: jest.fn().mockResolvedValue(undefined),
        isCompatible: jest.fn().mockReturnValue(true),
        Capability: { Layer: { Name: 'n1' } }
      };
      const Raster = jest.fn().mockImplementation(() => newLayerInstance);
      const LayerCatalog: any = function () {};
      LayerCatalog.prototype.addLayerToMap = function () {};
      LayerCatalog.prototype.renderBranch = function (
        _layer: unknown,
        callback?: () => void
      ) {
        callback?.();
      };
      LayerCatalog.prototype.getUID = () => 'uid-1';
      const TC = {
        Util: {
          extend: (target: any, ...sources: any[]) =>
            Object.assign(target ?? {}, ...sources)
        },
        layer: { Raster },
        control: { LayerCatalog },
        Consts: {
          event: {
            LAYERADD: 'layeradd',
            LAYERREMOVE: 'layerremove',
            LAYERERROR: 'layererror'
          }
        }
      };
      mockSitnaApi.getTC.mockReturnValue(TC);
      return { TC, newLayerInstance, LayerCatalog };
    }

    beforeEach(() => {
      const realLookup = new ConfigLookupService();
      realLookup.initialize(minimalContext);
      (handler as any).configLookup = realLookup;
      mockSitnaApi.setGlobal('currentAppCfg', minimalContext);
      mockVirtualCapabilities.findRealLayerConfig.mockImplementation(
        (nodeId: string) => ({
          url: `https://wms.example/${nodeId}`,
          type: 'WMS',
          layerNames: ['n1'],
          order: 0
        })
      );
    });

    async function patchWithTc(TC: any): Promise<void> {
      mockSitnaApi.getTC.mockReturnValue(TC);
      handler.cleanup();
      await handler['patchLayerCatalogAddLayerToMap']();
    }

    it('fast path removes replaced sibling physical resources', async () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const { TC } = buildPatchedHandler();
      await patchWithTc(TC);
      const _layerA = { options: { nodeId: 'node/a' } };
      const workLayers: Array<{ options: { nodeId: string } }> = [];
      const removeLayer = jest.fn().mockResolvedValue(undefined);
      const map = {
        crs: 'EPSG:25831',
        addLayer: jest.fn().mockImplementation(async (opts: { nodeId?: string }) => {
          const layer = { options: { nodeId: opts.nodeId ?? 'unknown' } };
          workLayers.push(layer);
          return layer;
        }),
        removeLayer,
        on: jest.fn(),
        off: jest.fn(),
        get workLayers() {
          return workLayers;
        }
      };
      const ctx = {
        map,
        getUID: () => 'uid-1',
        showProjectionChangeDialog: () => undefined
      };

      await TC.control.LayerCatalog.prototype.addLayerToMap.call(
        ctx,
        { title: 'Preload B', options: {} },
        'node/b-preload'
      );
      await TC.control.LayerCatalog.prototype.addLayerToMap.call(
        ctx,
        { title: 'A', options: {} },
        'node/a'
      );

      removeLayer.mockClear();
      await TC.control.LayerCatalog.prototype.addLayerToMap.call(
        ctx,
        { title: 'B', options: {} },
        'node/b'
      );

      expect(selection.isNodeSelected(map, 'node/a')).toBe(false);
      expect(selection.isNodeSelected(map, 'node/b')).toBe(true);
      expect(removeLayer).toHaveBeenCalledWith(
        expect.objectContaining({ options: { nodeId: 'node/a' } })
      );
    });

    it('suppresses map event bridge during catalog addLayer/removeLayer', async () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const { TC } = buildPatchedHandler();
      await patchWithTc(TC);
      const listeners: Record<string, Array<(layer: any) => void>> = {
        layeradd: [],
        layerremove: []
      };
      const addedLayer = { options: { nodeId: 'node/a' } };
      const map = {
        crs: 'EPSG:25831',
        addLayer: jest.fn().mockImplementation(async () => {
          listeners['layeradd'].forEach((fn) => fn(addedLayer));
          return addedLayer;
        }),
        removeLayer: jest.fn().mockImplementation(async (layer: any) => {
          listeners['layerremove'].forEach((fn) => fn(layer));
        }),
        on: jest.fn((event: string, fn: (layer: any) => void) => {
          listeners[event]?.push(fn);
        }),
        off: jest.fn(),
        workLayers: []
      };
      const ctx = {
        map,
        getUID: () => 'uid-1',
        showProjectionChangeDialog: () => undefined
      };

      await TC.control.LayerCatalog.prototype.addLayerToMap.call(
        ctx,
        { title: 'A', options: {} },
        'node/a'
      );

      expect(selection.isNodeSelected(map, 'node/a')).toBe(true);
      expect(map.addLayer).toHaveBeenCalledTimes(1);
    });

    it('ignores LAYERREMOVE without explicit nodeId', async () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const { TC } = buildPatchedHandler();
      await patchWithTc(TC);
      const listeners: Record<string, Array<(layer: any) => void>> = {
        layerremove: []
      };
      const map = {
        crs: 'EPSG:25831',
        addLayer: jest.fn().mockResolvedValue({ options: { nodeId: 'node/a' } }),
        removeLayer: jest.fn(),
        on: jest.fn((event: string, fn: (layer: any) => void) => {
          listeners[event]?.push(fn);
        }),
        off: jest.fn(),
        workLayers: []
      };
      const ctx = {
        map,
        getUID: () => 'uid-1',
        showProjectionChangeDialog: () => undefined
      };

      await TC.control.LayerCatalog.prototype.addLayerToMap.call(
        ctx,
        { title: 'A', options: {} },
        'node/a'
      );
      expect(selection.isNodeSelected(map, 'node/a')).toBe(true);

      listeners['layerremove'][0]?.({
        options: { layerNames: 'layer/a' }
      });

      expect(selection.isNodeSelected(map, 'node/a')).toBe(true);
    });

    it('external LAYERADD with nodeId enforces radio exclusivity under lock', async () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const { TC } = buildPatchedHandler();
      await patchWithTc(TC);
      const listeners: Record<string, Array<(layer: any) => void>> = {
        layeradd: []
      };
      const layerA = { options: { nodeId: 'node/a' } };
      const layerB = { options: { nodeId: 'node/b' } };
      const map = {
        crs: 'EPSG:25831',
        addLayer: jest.fn().mockResolvedValue(layerA),
        removeLayer: jest.fn(),
        on: jest.fn((event: string, fn: (layer: any) => void) => {
          listeners[event]?.push(fn);
        }),
        off: jest.fn(),
        workLayers: [layerA]
      };
      const ctx = {
        map,
        getUID: () => 'uid-1',
        showProjectionChangeDialog: () => undefined
      };

      await TC.control.LayerCatalog.prototype.addLayerToMap.call(
        ctx,
        { title: 'A', options: {} },
        'node/a'
      );

      await Promise.all([
        Promise.resolve().then(async () => {
          listeners['layeradd'][0]?.(layerB);
          await Promise.resolve();
        }),
        Promise.resolve().then(async () => {
          await Promise.resolve();
          listeners['layeradd'][0]?.(layerB);
          await Promise.resolve();
        })
      ]);
      await Promise.resolve();
      await Promise.resolve();

      expect(selection.isNodeSelected(map, 'node/a')).toBe(false);
      expect(selection.isNodeSelected(map, 'node/b')).toBe(true);
    });

    it('teardownMapState detaches bridge and clears per-map selection', async () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const { TC } = buildPatchedHandler();
      await patchWithTc(TC);
      const map = {
        crs: 'EPSG:25831',
        addLayer: jest.fn().mockResolvedValue({ options: { nodeId: 'node/a' } }),
        on: jest.fn(),
        off: jest.fn(),
        workLayers: []
      };
      const ctx = {
        map,
        getUID: () => 'uid-1',
        showProjectionChangeDialog: () => undefined
      };

      await TC.control.LayerCatalog.prototype.addLayerToMap.call(
        ctx,
        { title: 'A', options: {} },
        'node/a'
      );
      expect(map.on).toHaveBeenCalled();
      expect(selection.isNodeSelected(map, 'node/a')).toBe(true);

      handler.teardownMapState(map);

      expect(map.off).toHaveBeenCalled();
      expect(selection.isNodeSelected(map, 'node/a')).toBe(false);
    });

    it('wrapped LAYERREMOVE with nodeId clears all claims for the shared resource', async () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const { TC } = buildPatchedHandler();
      await patchWithTc(TC);
      const listeners: Record<string, Array<(layer: any) => void>> = {
        layerremove: []
      };
      const sharedLayer = { options: { nodeId: 'node/shared-a' } };
      const map = {
        crs: 'EPSG:25831',
        addLayer: jest.fn().mockResolvedValue(sharedLayer),
        removeLayer: jest.fn(),
        on: jest.fn((event: string, fn: (layer: any) => void) => {
          listeners[event]?.push(fn);
        }),
        off: jest.fn(),
        workLayers: [sharedLayer]
      };
      const ctx = {
        map,
        getUID: () => 'uid-1',
        showProjectionChangeDialog: () => undefined
      };

      await TC.control.LayerCatalog.prototype.addLayerToMap.call(
        ctx,
        { title: 'Shared A', options: {} },
        'node/shared-a'
      );
      await TC.control.LayerCatalog.prototype.addLayerToMap.call(
        ctx,
        { title: 'Shared B', options: {} },
        'node/shared-b'
      );
      expect(selection.isNodeSelected(map, 'node/shared-a')).toBe(true);
      expect(selection.isNodeSelected(map, 'node/shared-b')).toBe(true);

      listeners['layerremove'][0]?.({ layer: sharedLayer });

      expect(selection.isNodeSelected(map, 'node/shared-a')).toBe(false);
      expect(selection.isNodeSelected(map, 'node/shared-b')).toBe(false);
    });

    it('physical add returns the live layer from map.addLayer', async () => {
      const liveLayer = { id: 'live-1', options: { nodeId: 'node/a' } };
      const { TC } = buildPatchedHandler();
      await patchWithTc(TC);
      const map = {
        crs: 'EPSG:25831',
        addLayer: jest.fn().mockResolvedValue(liveLayer),
        on: jest.fn(),
        off: jest.fn(),
        workLayers: []
      };
      const ctx = {
        map,
        getUID: () => 'uid-1',
        showProjectionChangeDialog: () => undefined
      };

      const result = await TC.control.LayerCatalog.prototype.addLayerToMap.call(
        ctx,
        { title: 'A', options: {} },
        'node/a'
      );

      expect(result).toBe(liveLayer);
      expect(result.options.nodeId).toBe('node/a');
    });

    it('fast path returns the existing representative work layer', async () => {
      const existingLayer = { options: { nodeId: 'node/shared-a' } };
      const { TC } = buildPatchedHandler();
      await patchWithTc(TC);
      const map = {
        crs: 'EPSG:25831',
        addLayer: jest.fn().mockResolvedValue(existingLayer),
        removeLayer: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        workLayers: [existingLayer]
      };
      const ctx = {
        map,
        getUID: () => 'uid-1',
        showProjectionChangeDialog: () => undefined
      };

      await TC.control.LayerCatalog.prototype.addLayerToMap.call(
        ctx,
        { title: 'Shared A', options: {} },
        'node/shared-a'
      );
      const result = await TC.control.LayerCatalog.prototype.addLayerToMap.call(
        ctx,
        { title: 'Shared B', options: {} },
        'node/shared-b'
      );

      expect(result).toBe(existingLayer);
    });

    it('non-radio re-click returns the existing layer without adding a duplicate', async () => {
      const originalAdd = jest.fn();
      const { TC } = buildPatchedHandler();
      TC.control.LayerCatalog.prototype.addLayerToMap = originalAdd;
      await patchWithTc(TC);
      const existingLayer = { options: { nodeId: 'node/plain-leaf' } };
      const map = {
        crs: 'EPSG:25831',
        addLayer: jest.fn().mockResolvedValue(existingLayer),
        on: jest.fn(),
        off: jest.fn(),
        workLayers: [] as Array<{ options: { nodeId: string } }>
      };
      const ctx = {
        map,
        getUID: () => 'uid-1',
        showProjectionChangeDialog: () => undefined
      };

      await TC.control.LayerCatalog.prototype.addLayerToMap.call(
        ctx,
        { title: 'Plain', options: {} },
        'node/plain-leaf'
      );
      map.workLayers.push(existingLayer);
      originalAdd.mockClear();

      const result = await TC.control.LayerCatalog.prototype.addLayerToMap.call(
        ctx,
        { title: 'Plain', options: {} },
        'node/plain-leaf'
      );

      expect(originalAdd).not.toHaveBeenCalled();
      expect(map.addLayer).toHaveBeenCalledTimes(1);
      expect(result).toBe(existingLayer);
    });

    it('self-generated LAYERERROR does not mutate catalog claims', async () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const { TC } = buildPatchedHandler();
      await patchWithTc(TC);
      const listeners: Record<string, Array<(layer: any) => void>> = {
        layererror: []
      };
      const failingLayer = { options: { nodeId: 'node/a' } };
      const map = {
        crs: 'EPSG:25831',
        addLayer: jest.fn().mockImplementation(async () => {
          listeners['layererror'].forEach((fn) => fn(failingLayer));
          return failingLayer;
        }),
        removeLayer: jest.fn(),
        on: jest.fn((event: string, fn: (layer: any) => void) => {
          listeners[event]?.push(fn);
        }),
        off: jest.fn(),
        workLayers: []
      };
      const ctx = {
        map,
        getUID: () => 'uid-1',
        showProjectionChangeDialog: () => undefined
      };

      await TC.control.LayerCatalog.prototype.addLayerToMap.call(
        ctx,
        { title: 'A', options: {} },
        'node/a'
      );
      expect(selection.isNodeSelected(map, 'node/a')).toBe(true);
    });

    it('attaches one event bridge per map across repeated adds', async () => {
      const { TC } = buildPatchedHandler();
      await patchWithTc(TC);
      const map = {
        crs: 'EPSG:25831',
        addLayer: jest.fn().mockResolvedValue({ options: { nodeId: 'node/a' } }),
        on: jest.fn(),
        off: jest.fn(),
        workLayers: []
      };
      const ctx = {
        map,
        getUID: () => 'uid-1',
        showProjectionChangeDialog: () => undefined
      };

      await TC.control.LayerCatalog.prototype.addLayerToMap.call(
        ctx,
        { title: 'A', options: {} },
        'node/a'
      );
      await TC.control.LayerCatalog.prototype.addLayerToMap.call(
        ctx,
        { title: 'B', options: {} },
        'node/b'
      );

      expect(map.on).toHaveBeenCalledTimes(3);
    });

    it('teardownMapState cleans per-map radio DOM listeners', async () => {
      const LayerCatalog: any = function () {};
      LayerCatalog.prototype.renderBranch = function (
        _layer: unknown,
        callback?: () => void
      ) {
        callback?.();
      };
      LayerCatalog.prototype.getUID = () => 'uid-1';
      const TC = { control: { LayerCatalog } };
      mockSitnaApi.getTC.mockReturnValue(TC);
      await handler['patchLayerCatalogRenderBranch']();

      const map = { id: 'map-radio' };
      const div = document.createElement('div');
      div.innerHTML = `
        <ul>
          <li class="tc-ctl-lcat-node" data-layer-name="node/radio">
            <span>Radio</span>
            <ul>
              <li class="tc-ctl-lcat-node" data-layer-name="node/a"><span>A</span></li>
            </ul>
          </li>
        </ul>`;
      const catalog = new LayerCatalog();
      catalog.div = div;
      catalog.map = map;

      await LayerCatalog.prototype.renderBranch.call(catalog, {});
      expect(div.querySelectorAll('input.sitmun-lcat-radio')).toHaveLength(1);

      handler.teardownMapState(map);

      expect(div.querySelectorAll('input.sitmun-lcat-radio')).toHaveLength(0);
    });
  });

  describe('TNO remediation: radio DOM and search', () => {
    const minimalContext: AppCfg = {
      application: {
        id: 1,
        title: 't',
        type: 'x',
        theme: 'd',
        srs: 'EPSG:25831',
        initialExtent: [0, 0, 1, 1]
      },
      backgrounds: [],
      groups: [],
      layers: [],
      services: [],
      tasks: [],
      trees: [
        {
          id: 'tree/1',
          title: 'Catalog',
          image: null,
          rootNode: 'node/root',
          nodes: {
            'node/root': {
              title: 'Root',
              isRadio: false,
              children: ['node/radio'],
              order: 0
            },
            'node/radio': {
              title: 'Radio folder',
              isRadio: true,
              children: ['node/a', 'node/b'],
              order: 1
            },
            'node/a': {
              title: 'Alpha layer',
              resource: 'layer/a',
              isRadio: false,
              children: [],
              order: 1
            },
            'node/b': {
              title: 'Beta layer',
              resource: 'layer/b',
              isRadio: false,
              children: [],
              order: 2
            }
          }
        }
      ]
    } as any;

    beforeEach(() => {
      const realLookup = new ConfigLookupService();
      realLookup.initialize(minimalContext);
      (handler as any).configLookup = realLookup;
    });

    it('decorates search results with the same radio inputs as the tree', async () => {
      const LayerCatalog: any = function () {};
      LayerCatalog.prototype.renderBranch = function (
        _layer: unknown,
        callback?: () => void
      ) {
        callback?.();
      };
      LayerCatalog.prototype.getUID = () => 'uid-1';
      const TC = { control: { LayerCatalog } };
      mockSitnaApi.getTC.mockReturnValue(TC);

      await handler['patchLayerCatalogRenderBranch']();

      const div = document.createElement('div');
      div.innerHTML = `
        <ul>
          <li class="tc-ctl-lcat-node" data-layer-name="node/radio">
            <span class="tc-ctl-lcat-node-title">Radio folder</span>
            <ul>
              <li class="tc-ctl-lcat-node" data-layer-name="node/a"><span>Alpha layer</span></li>
            </ul>
          </li>
        </ul>
        <div class="tc-ctl-lcat-search">
          <ul>
            <li class="tc-ctl-lcat-node" data-layer-name="node/b"><span>Beta layer</span></li>
          </ul>
        </div>`;
      const catalog = new LayerCatalog();
      catalog.div = div;
      catalog.map = {};

      await LayerCatalog.prototype.renderBranch.call(catalog, {});

      const searchRadio = div.querySelector(
        '.tc-ctl-lcat-search input.sitmun-lcat-radio'
      ) as HTMLInputElement | null;
      expect(searchRadio).not.toBeNull();
      expect(searchRadio?.dataset['layerName']).toBe('node/b');
      expect(searchRadio?.getAttribute('aria-label')).toBe('Beta layer');
    });

    it('radio decoration is idempotent across rerenders', async () => {
      const LayerCatalog: any = function () {};
      LayerCatalog.prototype.renderBranch = function (
        _layer: unknown,
        callback?: () => void
      ) {
        callback?.();
      };
      LayerCatalog.prototype.getUID = () => 'uid-1';
      const TC = { control: { LayerCatalog } };
      mockSitnaApi.getTC.mockReturnValue(TC);

      await handler['patchLayerCatalogRenderBranch']();

      const div = document.createElement('div');
      div.innerHTML = `
        <ul>
          <li class="tc-ctl-lcat-node" data-layer-name="node/radio">
            <span>Radio</span>
            <ul>
              <li class="tc-ctl-lcat-node" data-layer-name="node/a"><span>Alpha layer</span></li>
            </ul>
          </li>
        </ul>`;
      const catalog = new LayerCatalog();
      catalog.div = div;
      catalog.map = {};

      await LayerCatalog.prototype.renderBranch.call(catalog, {});
      await LayerCatalog.prototype.renderBranch.call(catalog, {});

      expect(div.querySelectorAll('input.sitmun-lcat-radio')).toHaveLength(1);
    });

    it('keeps selection when clicking radio folder title with selected child', async () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const LayerCatalog: any = function () {};
      LayerCatalog.prototype.addLayerToMap = jest.fn().mockResolvedValue(undefined);
      LayerCatalog.prototype.getUID = () => 'uid-1';
      const catalog = new LayerCatalog();
      const map = {};
      catalog.map = map;
      catalog.div = document.createElement('div');
      catalog.div.innerHTML = `
        <ul>
          <li class="tc-ctl-lcat-node" data-layer-name="node/radio">
            <span class="tc-ctl-lcat-node-title">Radio folder</span>
            <ul>
              <li class="tc-ctl-lcat-node" data-layer-name="node/a">
                <span>A</span>
              </li>
            </ul>
          </li>
        </ul>`;

      selection.commitSelection(map, 'node/a', 'layer/a', true);
      (handler as any).decorateRadioControls(catalog);

      const folderTitle = catalog.div.querySelector(
        'li[data-layer-name="node/radio"] .tc-ctl-lcat-node-title'
      ) as HTMLElement;
      folderTitle.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      await Promise.resolve();

      // Folder handler must short-circuit when first child is already selected:
      // addLayerToMap must never be called, so prepareSelection cannot toggle it off.
      expect(catalog.addLayerToMap).not.toHaveBeenCalled();
      expect(selection.isNodeSelected(map, 'node/a')).toBe(true);
    });

    it('deselects when clicking an already-selected radio', async () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const removeLayerClaims = jest
        .spyOn(handler as any, 'removeLayerClaims')
        .mockResolvedValue(undefined);
      const LayerCatalog: any = function () {};
      LayerCatalog.prototype.addLayerToMap = jest.fn().mockResolvedValue(undefined);
      LayerCatalog.prototype.getUID = () => 'uid-1';
      const catalog = new LayerCatalog();
      const map = {};
      catalog.map = map;
      catalog.div = document.createElement('div');
      catalog.div.innerHTML = `
        <ul>
          <li class="tc-ctl-lcat-node" data-layer-name="node/radio">
            <ul>
              <li class="tc-ctl-lcat-node" data-layer-name="node/a">
                <span>A</span>
              </li>
            </ul>
          </li>
        </ul>`;

      selection.commitSelection(map, 'node/a', 'layer/a', true);
      (handler as any).decorateRadioControls(catalog);

      const radio = catalog.div.querySelector(
        'input.sitmun-lcat-radio'
      ) as HTMLInputElement;
      radio.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      await Promise.resolve();

      expect(removeLayerClaims).toHaveBeenCalledWith(map, ['node/a'], catalog);
      removeLayerClaims.mockRestore();
    });
  });
});
