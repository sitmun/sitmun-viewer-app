import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

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
      getFirstRadioChildId: jest.fn(),
      hasLoadData: jest.fn().mockReturnValue(false),
      isLoadDataFolder: jest.fn().mockReturnValue(false),
      isCheckboxLoadFolder: jest.fn().mockReturnValue(false),
      collectDescendantLeafIds: jest.fn().mockReturnValue([])
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
          useValue: {
            instant: (k: string) => k,
            onLangChange: new Subject<{ lang: string }>().asObservable()
          }
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
              loadData: true,
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
              loadData: true,
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
      await selection.runExclusive(map, async () => undefined);

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

    it('onMapClear delegates to teardownMapState', () => {
      const map = { id: 'map-clear' };
      const spy = jest.spyOn(handler, 'teardownMapState');
      handler.onMapClear(map);
      expect(spy).toHaveBeenCalledWith(map);
    });

    it('wrapped LAYERREMOVE with nodeId clears all claims for the shared resource', async () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const { TC } = buildPatchedHandler();
      await patchWithTc(TC);
      const listeners: Record<string, Array<(layer: any) => void>> = {
        layerremove: []
      };
      const sharedLayer = { options: { nodeId: 'node/shared-a' } };
      const workLayers = [sharedLayer];
      const map = {
        crs: 'EPSG:25831',
        addLayer: jest.fn().mockResolvedValue(sharedLayer),
        removeLayer: jest.fn(),
        on: jest.fn((event: string, fn: (layer: any) => void) => {
          listeners[event]?.push(fn);
        }),
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

      // SITNA splices workLayers before dispatching LAYERREMOVE.
      workLayers.splice(0, 1);
      listeners['layerremove'][0]?.({ layer: sharedLayer });
      await selection.runExclusive(map, async () => undefined);

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

    it('concurrent addLayerToMap for the same node adds only one physical layer', async () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      let releaseCaps!: () => void;
      const capsGate = new Promise<void>((resolve) => {
        releaseCaps = resolve;
      });
      const newLayerInstance: any = {
        getCapabilitiesPromise: jest.fn().mockReturnValue(capsGate),
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
      handler.cleanup();
      await handler['patchLayerCatalogAddLayerToMap']();

      const workLayers: Array<{ options: { nodeId: string } }> = [];
      const addLayer = jest
        .fn()
        .mockImplementation(async (opts: { nodeId?: string }) => {
          const layer = { options: { nodeId: opts.nodeId ?? 'unknown' } };
          workLayers.push(layer);
          return layer;
        });
      const map = {
        crs: 'EPSG:25831',
        addLayer,
        on: jest.fn(),
        off: jest.fn(),
        get workLayers() {
          return workLayers;
        }
      };
      const ctx = {
        map,
        getUID: () => `uid-${addLayer.mock.calls.length + 1}`,
        showProjectionChangeDialog: () => undefined
      };

      const first = TC.control.LayerCatalog.prototype.addLayerToMap.call(
        ctx,
        { title: 'Plain', options: {} },
        'node/plain-leaf'
      );
      const second = TC.control.LayerCatalog.prototype.addLayerToMap.call(
        ctx,
        { title: 'Plain', options: {} },
        'node/plain-leaf'
      );
      releaseCaps();
      await Promise.all([first, second]);

      expect(addLayer).toHaveBeenCalledTimes(1);
      expect(workLayers).toHaveLength(1);
      expect(selection.isNodeSelected(map, 'node/plain-leaf')).toBe(true);
    });

    it('reclaims an orphan work layer without a second physical add', async () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const { TC } = buildPatchedHandler();
      await patchWithTc(TC);
      const orphan = { options: { nodeId: 'node/plain-leaf' } };
      const addLayer = jest.fn();
      const map = {
        crs: 'EPSG:25831',
        addLayer,
        on: jest.fn(),
        off: jest.fn(),
        workLayers: [orphan]
      };
      const ctx = {
        map,
        getUID: () => 'uid-1',
        showProjectionChangeDialog: () => undefined
      };

      const result = await TC.control.LayerCatalog.prototype.addLayerToMap.call(
        ctx,
        { title: 'Plain', options: {} },
        'node/plain-leaf'
      );

      expect(addLayer).not.toHaveBeenCalled();
      expect(result).toBe(orphan);
      expect(selection.isNodeSelected(map, 'node/plain-leaf')).toBe(true);
    });

    it('external LAYERREMOVE cascades remaining duplicates for the same nodeId', async () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const { TC } = buildPatchedHandler();
      await patchWithTc(TC);
      const listeners: Record<string, Array<(layer: any) => void>> = {
        layerremove: []
      };
      const layer1 = { id: 'wl-1', options: { nodeId: 'node/plain-leaf' } };
      const layer2 = { id: 'wl-2', options: { nodeId: 'node/plain-leaf' } };
      const workLayers = [layer1, layer2];
      const removeLayer = jest.fn().mockImplementation(async (layer: any) => {
        const idx = workLayers.indexOf(layer);
        if (idx >= 0) {
          workLayers.splice(idx, 1);
        }
        for (const fn of listeners['layerremove']) {
          fn({ layer });
        }
      });
      const map = {
        crs: 'EPSG:25831',
        addLayer: jest.fn(),
        removeLayer,
        on: jest.fn((event: string, fn: (layer: any) => void) => {
          listeners[event]?.push(fn);
        }),
        off: jest.fn(),
        get workLayers() {
          return workLayers;
        }
      };
      selection.commitSelection(map, 'node/plain-leaf', 'layer/plain', true);
      (handler as any).attachMapEventBridge(map, TC);

      // Capas trash: SITNA removes one row, then we cascade the orphan.
      workLayers.splice(0, 1);
      listeners['layerremove'][0]?.({ layer: layer1 });
      await selection.runExclusive(map, async () => undefined);

      expect(removeLayer).toHaveBeenCalledWith(layer2);
      expect(workLayers).toHaveLength(0);
      expect(selection.isNodeSelected(map, 'node/plain-leaf')).toBe(false);
    });

    it('LAYERERROR during add rolls back Capas and clears the catalog claim', async () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const { TC } = buildPatchedHandler();
      await patchWithTc(TC);
      const listeners: Record<string, Array<(layer: any) => void>> = {
        layererror: [],
        layerremove: []
      };
      const failingLayer = { id: 'fail-1', options: { nodeId: 'node/a' } };
      const workLayers: Array<{ id: string; options: { nodeId: string } }> = [];
      const removeLayer = jest.fn().mockImplementation(async (layer: any) => {
        const idx = workLayers.indexOf(layer);
        if (idx >= 0) {
          workLayers.splice(idx, 1);
        }
      });
      const map = {
        crs: 'EPSG:25831',
        addLayer: jest.fn().mockImplementation(async () => {
          workLayers.push(failingLayer);
          // SITNA delivers CustomEvent detail as { layer, message }.
          listeners['layererror'].forEach((fn) =>
            fn({ layer: failingLayer, message: 'layerNameNotValid' })
          );
          return failingLayer;
        }),
        removeLayer,
        on: jest.fn((event: string, fn: (layer: any) => void) => {
          listeners[event]?.push(fn);
        }),
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

      const result = await TC.control.LayerCatalog.prototype.addLayerToMap.call(
        ctx,
        { title: 'A', options: {} },
        'node/a'
      );
      await selection.runExclusive(map, async () => undefined);

      expect(result).toBeUndefined();
      expect(selection.isNodeSelected(map, 'node/a')).toBe(false);
      expect(removeLayer).toHaveBeenCalledWith(failingLayer);
      expect(workLayers).toHaveLength(0);
    });

    it('TILELOADERROR 401 after add removes the Capas row for the catalog node', async () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const { TC } = buildPatchedHandler();
      (TC.Consts.event as { TILELOADERROR?: string }).TILELOADERROR =
        'tileloaderror.tc';
      await patchWithTc(TC);
      const tileListeners: Array<(event: any) => void> = [];
      const liveLayer = {
        id: 'live-401',
        options: { nodeId: 'node/plain-leaf' },
        wrap: {
          $events: {
            on: jest.fn((event: string, fn: (event: any) => void) => {
              if (event === 'tileloaderror.tc') {
                tileListeners.push(fn);
              }
            }),
            off: jest.fn()
          }
        }
      };
      const workLayers: Array<typeof liveLayer> = [];
      const removeLayer = jest.fn().mockImplementation(async (layer: any) => {
        const idx = workLayers.indexOf(layer);
        if (idx >= 0) {
          workLayers.splice(idx, 1);
        }
      });
      const map = {
        crs: 'EPSG:25831',
        addLayer: jest.fn().mockImplementation(async () => {
          workLayers.push(liveLayer);
          return liveLayer;
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
        { title: 'Plain', options: {} },
        'node/plain-leaf'
      );
      expect(selection.isNodeSelected(map, 'node/plain-leaf')).toBe(true);
      expect(tileListeners.length).toBeGreaterThan(0);

      tileListeners[0]?.({ error: { code: 401, text: null } });
      await selection.runExclusive(map, async () => undefined);

      expect(selection.isNodeSelected(map, 'node/plain-leaf')).toBe(false);
      expect(removeLayer).toHaveBeenCalledWith(liveLayer);
      expect(workLayers).toHaveLength(0);
    });

    it('LAYERERROR after load removes the Capas row for the catalog node', async () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const { TC } = buildPatchedHandler();
      await patchWithTc(TC);
      const listeners: Record<string, Array<(layer: any) => void>> = {
        layererror: []
      };
      const liveLayer = { id: 'live-1', options: { nodeId: 'node/plain-leaf' } };
      const workLayers = [liveLayer];
      const removeLayer = jest.fn().mockImplementation(async (layer: any) => {
        const idx = workLayers.indexOf(layer);
        if (idx >= 0) {
          workLayers.splice(idx, 1);
        }
      });
      const map = {
        crs: 'EPSG:25831',
        addLayer: jest.fn().mockResolvedValue(liveLayer),
        removeLayer,
        on: jest.fn((event: string, fn: (layer: any) => void) => {
          listeners[event]?.push(fn);
        }),
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
        { title: 'Plain', options: {} },
        'node/plain-leaf'
      );
      expect(selection.isNodeSelected(map, 'node/plain-leaf')).toBe(true);

      listeners['layererror'][0]?.({
        layer: liveLayer,
        message: 'layerSrsNotCompatible'
      });
      await selection.runExclusive(map, async () => undefined);

      expect(selection.isNodeSelected(map, 'node/plain-leaf')).toBe(false);
      expect(removeLayer).toHaveBeenCalledWith(liveLayer);
      expect(workLayers).toHaveLength(0);
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
              loadData: true,
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

    it('browse-only folder has no load checkbox and title does not load leaves', async () => {
      const browseContext = {
        ...minimalContext,
        trees: [
          {
            ...minimalContext.trees[0],
            nodes: {
              'node/root': {
                title: 'Root',
                isRadio: false,
                children: ['node/folder'],
                order: 0
              },
              'node/folder': {
                title: 'Folder',
                isRadio: false,
                loadData: false,
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
      } as AppCfg;
      const realLookup = new ConfigLookupService();
      realLookup.initialize(browseContext);
      (handler as any).configLookup = realLookup;

      const LayerCatalog: any = function () {};
      LayerCatalog.prototype.addLayerToMap = jest.fn().mockResolvedValue(undefined);
      const catalog = new LayerCatalog();
      catalog.map = {};
      catalog.div = document.createElement('div');
      catalog.div.innerHTML = `
        <ul>
          <li class="tc-ctl-lcat-node" data-layer-name="node/folder">
            <button type="button" class="tc-ctl-lcat-collapse-btn"></button>
            <span class="tc-ctl-lcat-node-title">Folder</span>
            <ul>
              <li class="tc-ctl-lcat-node" data-layer-name="node/a"><span>A</span></li>
              <li class="tc-ctl-lcat-node" data-layer-name="node/b"><span>B</span></li>
            </ul>
          </li>
        </ul>`;
      const folderLi = catalog.div.querySelector(
        'li[data-layer-name="node/folder"]'
      ) as HTMLElement;
      const collapseBtn = folderLi.querySelector(
        'button.tc-ctl-lcat-collapse-btn'
      ) as HTMLButtonElement;
      const branch = folderLi.querySelector(':scope > ul') as HTMLElement;
      collapseBtn.addEventListener('click', () => {
        folderLi.classList.toggle('tc-collapsed');
        branch.classList.toggle('tc-collapsed');
      });
      (handler as any).decorateRadioControls(catalog);

      expect(catalog.div.querySelector('input.sitmun-lcat-load')).toBeNull();
      const folderTitle = catalog.div.querySelector(
        'li[data-layer-name="node/folder"] .tc-ctl-lcat-node-title'
      ) as HTMLElement;
      folderTitle.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true })
      );
      await Promise.resolve();

      expect(catalog.addLayerToMap).not.toHaveBeenCalled();
      expect(folderLi.classList.contains('tc-collapsed')).toBe(true);
    });

    it('injects load control on loadData ancestor when only leaf LIs have data-layer-name', async () => {
      const nestedContext = {
        ...minimalContext,
        trees: [
          {
            ...minimalContext.trees[0],
            nodes: {
              'node/root': {
                title: 'Gestio',
                isRadio: false,
                loadData: true,
                children: ['node/folder'],
                order: 0
              },
              'node/folder': {
                title: 'Adreces',
                isRadio: false,
                loadData: true,
                children: ['node/a'],
                order: 1
              },
              'node/a': {
                title: 'A',
                resource: 'layer/a',
                isRadio: false,
                children: [],
                order: 1
              }
            }
          }
        ]
      } as AppCfg;
      const realLookup = new ConfigLookupService();
      realLookup.initialize(nestedContext);
      (handler as any).configLookup = realLookup;

      const LayerCatalog: any = function () {};
      const catalog = new LayerCatalog();
      catalog.map = {};
      catalog.div = document.createElement('div');
      // Nested folders omit data-layer-name (SITNA); only the leaf is named.
      catalog.div.innerHTML = `
        <ul>
          <li class="tc-ctl-lcat-node">
            <span class="tc-ctl-lcat-node-title">Gestio</span>
            <ul>
              <li class="tc-ctl-lcat-node">
                <span class="tc-ctl-lcat-node-title">Adreces</span>
                <ul>
                  <li class="tc-ctl-lcat-node" data-layer-name="node/a"><span>A</span></li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>`;
      expect(realLookup.findParentNodeId('node/a')).toBe('node/folder');
      expect(realLookup.findParentNodeId('node/folder')).toBe('node/root');

      (handler as any).decorateRadioControls(catalog);

      const rootLoad = catalog.div.querySelector(
        'input.sitmun-lcat-load[data-layer-name="node/root"]'
      ) as HTMLInputElement | null;
      const folderLoad = catalog.div.querySelector(
        'input.sitmun-lcat-load[data-layer-name="node/folder"]'
      ) as HTMLInputElement | null;
      expect(rootLoad).toBeTruthy();
      expect(rootLoad?.type).toBe('checkbox');
      expect(folderLoad).toBeTruthy();
      expect(folderLoad?.type).toBe('checkbox');
      expect(
        catalog.div
          .querySelector('li[data-layer-name="node/root"]')
          ?.getAttribute('data-sitmun-load-folder')
      ).toBe('true');
    });

    it('places load and radio labels as direct children of the li before the title', async () => {
      const LayerCatalog: any = function () {};
      const catalog = new LayerCatalog();
      catalog.map = {};
      catalog.div = document.createElement('div');
      catalog.div.innerHTML = `
        <ul>
          <li class="tc-ctl-lcat-node" data-layer-name="node/radio">
            <span class="tc-ctl-lcat-node-title">Radio</span>
            <ul>
              <li class="tc-ctl-lcat-node" data-layer-name="node/a">
                <span class="tc-ctl-lcat-node-title">A</span>
              </li>
              <li class="tc-ctl-lcat-node" data-layer-name="node/b">
                <span class="tc-ctl-lcat-node-title">B</span>
              </li>
            </ul>
          </li>
        </ul>`;
      (handler as any).decorateRadioControls(catalog);

      const folderLi = catalog.div.querySelector(
        'li[data-layer-name="node/radio"]'
      ) as HTMLElement;
      const leafLi = catalog.div.querySelector(
        'li[data-layer-name="node/a"]'
      ) as HTMLElement;
      const loadLabel = folderLi.querySelector(
        ':scope > label.sitmun-lcat-load-label'
      );
      const radioLabel = leafLi.querySelector(
        ':scope > label.sitmun-lcat-radio-label'
      );
      const folderTitle = folderLi.querySelector(
        ':scope > .tc-ctl-lcat-node-title'
      );
      const leafTitle = leafLi.querySelector(':scope > .tc-ctl-lcat-node-title');

      expect(loadLabel).toBeTruthy();
      expect(radioLabel).toBeTruthy();
      expect(folderTitle?.contains(loadLabel as Node)).toBe(false);
      expect(leafTitle?.contains(radioLabel as Node)).toBe(false);
      // Absent GFI does not reserve a slot — select sits immediately before title.
      expect(loadLabel?.nextElementSibling).toBe(folderTitle);
      expect(radioLabel?.nextElementSibling).toBe(leafTitle);
      expect(folderLi.querySelector('.sitmun-lcat-gfi-slot, .sitmun-lcat-select-slot')).toBeNull();
      expect(leafLi.querySelector('.sitmun-lcat-gfi-slot, .sitmun-lcat-select-slot')).toBeNull();
      expect(folderLi.getAttribute('data-sitmun-lcat-control')).toBe('true');
      expect(leafLi.getAttribute('data-sitmun-lcat-control')).toBe('true');
    });

    it('does not inject catalog GFI; trails meta after title', async () => {
      const metaContext = {
        ...minimalContext,
        layers: [
          {
            id: 'layer/a',
            title: 'A',
            layers: ['a'],
            service: 'service/1',
            queryableFeatureEnabled: true
          },
          {
            id: 'layer/b',
            title: 'B',
            layers: ['b'],
            service: 'service/1',
            queryableFeatureEnabled: false
          }
        ],
        trees: [
          {
            ...minimalContext.trees[0],
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
                loadData: true,
                children: ['node/a', 'node/b'],
                order: 1
              },
              'node/a': {
                title: 'A',
                resource: 'layer/a',
                queryableActive: true,
                isRadio: false,
                children: [],
                order: 1
              },
              'node/b': {
                title: 'B',
                resource: 'layer/b',
                queryableActive: false,
                isRadio: false,
                children: [],
                order: 2
              }
            }
          }
        ]
      } as AppCfg;
      const realLookup = new ConfigLookupService();
      realLookup.initialize(metaContext);
      (handler as any).configLookup = realLookup;

      const LayerCatalog: any = function () {};
      const catalog = new LayerCatalog();
      catalog.map = {};
      catalog.div = document.createElement('div');
      catalog.div.innerHTML = `
        <ul>
          <li class="tc-ctl-lcat-node" data-layer-name="node/radio">
            <span class="tc-ctl-lcat-node-title">Radio</span>
            <ul>
              <li class="tc-ctl-lcat-node tc-ctl-lcat-leaf" data-layer-name="node/a">
                <span class="tc-ctl-lcat-node-title">A</span>
                <sitna-toggle class="tc-ctl-lcat-btn-info"></sitna-toggle>
              </li>
              <li class="tc-ctl-lcat-node tc-ctl-lcat-leaf" data-layer-name="node/b">
                <span class="tc-ctl-lcat-node-title">B</span>
              </li>
            </ul>
          </li>
        </ul>`;
      (handler as any).decorateRadioControls(catalog);

      const leafA = catalog.div.querySelector(
        'li[data-layer-name="node/a"]'
      ) as HTMLElement;
      const radioA = Array.from(leafA.children).find((c) =>
        (c as HTMLElement).classList?.contains('sitmun-lcat-radio-label')
      );
      const titleA = leafA.querySelector(':scope > .tc-ctl-lcat-node-title');
      const metaA = leafA.querySelector('.tc-ctl-lcat-btn-info') as HTMLElement;

      expect(catalog.div.querySelector('.sitmun-lcat-gfi')).toBeNull();
      expect(radioA?.nextElementSibling).toBe(titleA);
      expect(titleA?.nextElementSibling).toBe(metaA);
      expect(metaA?.getAttribute('data-sitmun-lcat-meta')).toBe('true');
      expect(metaA?.getAttribute('checked-icon-text')).toBe('article');
      expect(leafA.querySelector('span')).toBe(titleA);

      (handler as any).decorateRadioControls(catalog);
      expect(titleA?.nextElementSibling).toBe(metaA);
      expect(catalog.div.querySelector('.sitmun-lcat-gfi')).toBeNull();
    });

    it('shows a spinner until Capas (WLM) renders the work-layer row', () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const realLookup = TestBed.inject(ConfigLookupService);
      realLookup.initialize(minimalContext);
      (handler as any).configLookup = realLookup;

      class WorkLayerManager {}
      const TC = mockSitnaApi.getTC();
      TC.control.WorkLayerManager = WorkLayerManager;

      const wlmDiv = document.createElement('div');
      const workLayer = { id: 'lcat-1', options: { nodeId: 'node/a' } };
      const map = {
        workLayers: [workLayer],
        getControlsByClass: (type: unknown) =>
          type === WorkLayerManager ? [{ div: wlmDiv }] : []
      };

      const LayerCatalog: any = function () {};
      const catalog = new LayerCatalog();
      catalog.map = map;
      catalog.div = document.createElement('div');
      catalog.div.innerHTML = `
        <ul>
          <li class="tc-ctl-lcat-node tc-ctl-lcat-leaf" data-layer-name="node/a">
            <span class="tc-ctl-lcat-node-title">A</span>
            <sitna-toggle class="tc-ctl-lcat-btn-info"></sitna-toggle>
          </li>
        </ul>`;
      (handler as any).decorateRadioControls(catalog);

      const leaf = catalog.div.querySelector(
        'li[data-layer-name="node/a"]'
      ) as HTMLElement;
      const title = leaf.querySelector(':scope > .tc-ctl-lcat-node-title');
      const meta = leaf.querySelector('.tc-ctl-lcat-btn-info');

      selection.prepareSelection(map, 'node/a', 'layer/a', realLookup);
      (handler as any).syncRadioCheckedState(catalog);

      const spinner = leaf.querySelector(
        ':scope > .sitmun-lcat-loading'
      ) as HTMLElement | null;
      expect(spinner).not.toBeNull();
      expect(spinner?.title).toBe('layerCatalog.loading');
      expect(spinner?.getAttribute('aria-label')).toBe('layerCatalog.loading');
      expect(leaf.getAttribute('aria-busy')).toBe('true');

      // Map claim commit alone must not clear the spinner (WLM LI still missing).
      selection.commitSelection(map, 'node/a', 'layer/a', true);
      (handler as any).afterCatalogClaimCommitted(map, catalog);

      expect(selection.isAwaitingWlmUi(map, 'node/a')).toBe(true);
      expect(leaf.querySelector(':scope > .sitmun-lcat-loading')).not.toBeNull();

      const capasRow = document.createElement('li');
      capasRow.className = 'tc-ctl-wlm-elm';
      capasRow.dataset['layerId'] = 'lcat-1';
      wlmDiv.appendChild(capasRow);
      (handler as any).settleAwaitingWlmUi(map, catalog);

      expect(selection.isAwaitingWlmUi(map, 'node/a')).toBe(false);
      expect(leaf.querySelector('.sitmun-lcat-loading')).toBeNull();
      expect(leaf.hasAttribute('aria-busy')).toBe(false);
      expect(title?.nextElementSibling).toBe(meta);
    });

    it('shows a load-failed warning until a later Capas load succeeds', () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const realLookup = TestBed.inject(ConfigLookupService);
      realLookup.initialize(minimalContext);
      (handler as any).configLookup = realLookup;

      class WorkLayerManager {}
      const TC = mockSitnaApi.getTC();
      TC.control.WorkLayerManager = WorkLayerManager;

      const wlmDiv = document.createElement('div');
      const workLayer = { id: 'lcat-1', options: { nodeId: 'node/a' } };
      const map = {
        workLayers: [] as Array<typeof workLayer>,
        getControlsByClass: (type: unknown) =>
          type === WorkLayerManager ? [{ div: wlmDiv }] : []
      };

      const LayerCatalog: any = function () {};
      const catalog = new LayerCatalog();
      catalog.map = map;
      catalog.div = document.createElement('div');
      catalog.div.innerHTML = `
        <ul>
          <li class="tc-ctl-lcat-node tc-ctl-lcat-leaf" data-layer-name="node/a">
            <span class="tc-ctl-lcat-node-title">A</span>
            <sitna-toggle class="tc-ctl-lcat-btn-info"></sitna-toggle>
          </li>
        </ul>`;
      (handler as any).decorateRadioControls(catalog);

      const leaf = catalog.div.querySelector(
        'li[data-layer-name="node/a"]'
      ) as HTMLElement;
      const title = leaf.querySelector(':scope > .tc-ctl-lcat-node-title');
      const meta = leaf.querySelector('.tc-ctl-lcat-btn-info');

      selection.markLoadFailed(map, 'node/a');
      (handler as any).syncLoadFailedWarnings(catalog);

      const warning = leaf.querySelector(
        ':scope > .sitmun-lcat-load-failed'
      ) as HTMLElement | null;
      expect(warning).not.toBeNull();
      expect(warning?.textContent).toBe('warning');
      expect(warning?.title).toBe('layerCatalog.loadFailed');
      expect(warning?.getAttribute('aria-label')).toBe('layerCatalog.loadFailed');
      expect(title?.nextElementSibling).toBe(warning);
      expect(warning?.nextElementSibling).toBe(meta);

      map.workLayers.push(workLayer);
      selection.clearLoadFailed(map, 'node/a');
      selection.markAwaitingWlmUi(map, 'node/a');
      const capasRow = document.createElement('li');
      capasRow.className = 'tc-ctl-wlm-elm';
      capasRow.dataset['layerId'] = 'lcat-1';
      wlmDiv.appendChild(capasRow);
      (handler as any).settleAwaitingWlmUi(map, catalog);
      (handler as any).syncLoadFailedWarnings(catalog);

      expect(selection.isLoadFailed(map, 'node/a')).toBe(false);
      expect(leaf.querySelector('.sitmun-lcat-load-failed')).toBeNull();
      expect(title?.nextElementSibling).toBe(meta);
    });

    it('does not inject sitmun-lcat-radio on a nested loadData folder under a radio folder', async () => {
      const nestedContext = {
        ...minimalContext,
        trees: [
          {
            ...minimalContext.trees[0],
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
                loadData: true,
                children: ['node/nested', 'node/a'],
                order: 1
              },
              'node/nested': {
                title: 'Nested',
                isRadio: false,
                loadData: true,
                children: ['node/b'],
                order: 1
              },
              'node/a': {
                title: 'A',
                resource: 'layer/a',
                isRadio: false,
                children: [],
                order: 2
              },
              'node/b': {
                title: 'B',
                resource: 'layer/b',
                isRadio: false,
                children: [],
                order: 1
              }
            }
          }
        ]
      } as AppCfg;
      const realLookup = new ConfigLookupService();
      realLookup.initialize(nestedContext);
      (handler as any).configLookup = realLookup;

      const LayerCatalog: any = function () {};
      const catalog = new LayerCatalog();
      catalog.map = {};
      catalog.div = document.createElement('div');
      catalog.div.innerHTML = `
        <ul>
          <li class="tc-ctl-lcat-node" data-layer-name="node/radio">
            <span class="tc-ctl-lcat-node-title">Radio</span>
            <ul>
              <li class="tc-ctl-lcat-node" data-layer-name="node/nested">
                <span class="tc-ctl-lcat-node-title">Nested</span>
                <ul>
                  <li class="tc-ctl-lcat-node" data-layer-name="node/b">
                    <span>B</span>
                  </li>
                </ul>
              </li>
              <li class="tc-ctl-lcat-node" data-layer-name="node/a">
                <span>A</span>
              </li>
            </ul>
          </li>
        </ul>`;
      (handler as any).decorateRadioControls(catalog);

      const nestedLi = catalog.div.querySelector(
        'li[data-layer-name="node/nested"]'
      ) as HTMLElement;
      expect(
        nestedLi.querySelector('input.sitmun-lcat-load[data-layer-name="node/nested"]')
      ).toBeTruthy();
      expect(nestedLi.querySelector('input.sitmun-lcat-radio')).toBeNull();
      expect(
        catalog.div.querySelector(
          'input.sitmun-lcat-radio[data-layer-name="node/a"]'
        )
      ).toBeTruthy();
    });

    it('loadData folder checkbox loads all descendant leaves', async () => {
      const loadContext = {
        ...minimalContext,
        trees: [
          {
            ...minimalContext.trees[0],
            nodes: {
              'node/root': {
                title: 'Root',
                isRadio: false,
                children: ['node/folder'],
                order: 0
              },
              'node/folder': {
                title: 'Folder',
                isRadio: false,
                loadData: true,
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
      } as AppCfg;
      const realLookup = new ConfigLookupService();
      realLookup.initialize(loadContext);
      (handler as any).configLookup = realLookup;

      const LayerCatalog: any = function () {};
      LayerCatalog.prototype.addLayerToMap = jest.fn().mockResolvedValue(undefined);
      const catalog = new LayerCatalog();
      catalog.map = {};
      catalog.div = document.createElement('div');
      catalog.div.innerHTML = `
        <ul>
          <li class="tc-ctl-lcat-node" data-layer-name="node/folder">
            <span class="tc-ctl-lcat-node-title">Folder</span>
            <ul>
              <li class="tc-ctl-lcat-node" data-layer-name="node/a"><span>A</span></li>
              <li class="tc-ctl-lcat-node" data-layer-name="node/b"><span>B</span></li>
            </ul>
          </li>
        </ul>`;
      (handler as any).decorateRadioControls(catalog);

      const loadCheckbox = catalog.div.querySelector(
        'input.sitmun-lcat-load[data-layer-name="node/folder"]'
      ) as HTMLInputElement;
      expect(loadCheckbox).toBeTruthy();
      expect(loadCheckbox.type).toBe('checkbox');
      expect(
        catalog.div
          .querySelector('li[data-layer-name="node/folder"]')
          ?.getAttribute('data-sitmun-load-folder')
      ).toBe('true');

      loadCheckbox.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await TestBed.inject(CatalogLayerSelectionService).runExclusive(
        catalog.map,
        async () => undefined
      );

      expect(catalog.addLayerToMap).toHaveBeenCalledTimes(2);
      expect(catalog.addLayerToMap).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'A' }),
        'node/a'
      );
      expect(catalog.addLayerToMap).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'B' }),
        'node/b'
      );
    });

    it('loadData folder checkbox clears all leaves when all are selected', async () => {
      const loadContext = {
        ...minimalContext,
        trees: [
          {
            ...minimalContext.trees[0],
            nodes: {
              'node/root': {
                title: 'Root',
                isRadio: false,
                children: ['node/folder'],
                order: 0
              },
              'node/folder': {
                title: 'Folder',
                isRadio: false,
                loadData: true,
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
      } as AppCfg;
      const realLookup = new ConfigLookupService();
      realLookup.initialize(loadContext);
      (handler as any).configLookup = realLookup;

      const selection = TestBed.inject(CatalogLayerSelectionService);
      const removeLayerClaims = jest
        .spyOn(handler as any, 'removeLayerClaims')
        .mockResolvedValue(undefined);
      const LayerCatalog: any = function () {};
      LayerCatalog.prototype.addLayerToMap = jest.fn().mockResolvedValue(undefined);
      const catalog = new LayerCatalog();
      const map = {
        workLayers: [
          { options: { nodeId: 'node/a' } },
          { options: { nodeId: 'node/b' } }
        ]
      };
      catalog.map = map;
      catalog.div = document.createElement('div');
      catalog.div.innerHTML = `
        <ul>
          <li class="tc-ctl-lcat-node" data-layer-name="node/folder">
            <span class="tc-ctl-lcat-node-title">Folder</span>
            <ul>
              <li class="tc-ctl-lcat-node" data-layer-name="node/a"><span>A</span></li>
              <li class="tc-ctl-lcat-node" data-layer-name="node/b"><span>B</span></li>
            </ul>
          </li>
        </ul>`;
      selection.commitSelection(map, 'node/a', 'layer/a', true);
      selection.commitSelection(map, 'node/b', 'layer/b', true);
      (handler as any).decorateRadioControls(catalog);

      const loadCheckbox = catalog.div.querySelector(
        'input.sitmun-lcat-load[data-layer-name="node/folder"]'
      ) as HTMLInputElement;
      expect(loadCheckbox.checked).toBe(true);
      loadCheckbox.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await Promise.resolve();
      await Promise.resolve();

      expect(removeLayerClaims).toHaveBeenCalledWith(
        map,
        ['node/a', 'node/b'],
        catalog
      );
      expect(catalog.addLayerToMap).not.toHaveBeenCalled();
      removeLayerClaims.mockRestore();
    });

    it('loadData folder checkbox unloads even when checkbox visual is stale', async () => {
      const loadContext = {
        ...minimalContext,
        trees: [
          {
            ...minimalContext.trees[0],
            nodes: {
              'node/root': {
                title: 'Root',
                isRadio: false,
                children: ['node/folder'],
                order: 0
              },
              'node/folder': {
                title: 'Folder',
                isRadio: false,
                loadData: true,
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
      } as AppCfg;
      const realLookup = new ConfigLookupService();
      realLookup.initialize(loadContext);
      (handler as any).configLookup = realLookup;

      const selection = TestBed.inject(CatalogLayerSelectionService);
      const removeLayerClaims = jest
        .spyOn(handler as any, 'removeLayerClaims')
        .mockResolvedValue(undefined);
      const LayerCatalog: any = function () {};
      LayerCatalog.prototype.addLayerToMap = jest.fn().mockResolvedValue(undefined);
      const catalog = new LayerCatalog();
      const map = {
        workLayers: [
          { options: { nodeId: 'node/a' } },
          { options: { nodeId: 'node/b' } }
        ]
      };
      catalog.map = map;
      catalog.div = document.createElement('div');
      catalog.div.innerHTML = `
        <ul>
          <li class="tc-ctl-lcat-node" data-layer-name="node/folder">
            <span class="tc-ctl-lcat-node-title">Folder</span>
            <ul>
              <li class="tc-ctl-lcat-node" data-layer-name="node/a"><span>A</span></li>
              <li class="tc-ctl-lcat-node" data-layer-name="node/b"><span>B</span></li>
            </ul>
          </li>
        </ul>`;
      selection.commitSelection(map, 'node/a', 'layer/a', true);
      selection.commitSelection(map, 'node/b', 'layer/b', true);
      (handler as any).decorateRadioControls(catalog);

      const loadCheckbox = catalog.div.querySelector(
        'input.sitmun-lcat-load[data-layer-name="node/folder"]'
      ) as HTMLInputElement;
      loadCheckbox.checked = false;
      loadCheckbox.setAttribute('aria-checked', 'false');
      loadCheckbox.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await Promise.resolve();
      await Promise.resolve();

      expect(removeLayerClaims).toHaveBeenCalledWith(
        map,
        ['node/a', 'node/b'],
        catalog
      );
      expect(catalog.addLayerToMap).not.toHaveBeenCalled();
      removeLayerClaims.mockRestore();
    });

    it('radio folder title does not select a child without loadData', async () => {
      const radioBrowseContext = {
        ...minimalContext,
        trees: [
          {
            ...minimalContext.trees[0],
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
                loadData: false,
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
      } as AppCfg;
      const realLookup = new ConfigLookupService();
      realLookup.initialize(radioBrowseContext);
      (handler as any).configLookup = realLookup;

      const LayerCatalog: any = function () {};
      LayerCatalog.prototype.addLayerToMap = jest.fn().mockResolvedValue(undefined);
      const catalog = new LayerCatalog();
      catalog.map = {};
      catalog.div = document.createElement('div');
      catalog.div.innerHTML = `
        <ul>
          <li class="tc-ctl-lcat-node" data-layer-name="node/radio">
            <span class="tc-ctl-lcat-node-title">Radio</span>
            <ul>
              <li class="tc-ctl-lcat-node" data-layer-name="node/a"><span>A</span></li>
              <li class="tc-ctl-lcat-node" data-layer-name="node/b"><span>B</span></li>
            </ul>
          </li>
        </ul>`;
      (handler as any).decorateRadioControls(catalog);

      const folderTitle = catalog.div.querySelector(
        'li[data-layer-name="node/radio"] .tc-ctl-lcat-node-title'
      ) as HTMLElement;
      folderTitle.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await Promise.resolve();

      expect(catalog.addLayerToMap).not.toHaveBeenCalled();
    });

    it('radio browse still selects via child radio without loadData', async () => {
      const radioBrowseContext = {
        ...minimalContext,
        trees: [
          {
            ...minimalContext.trees[0],
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
                loadData: false,
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
      } as AppCfg;
      const realLookup = new ConfigLookupService();
      realLookup.initialize(radioBrowseContext);
      (handler as any).configLookup = realLookup;

      const LayerCatalog: any = function () {};
      LayerCatalog.prototype.addLayerToMap = jest.fn().mockResolvedValue(undefined);
      const catalog = new LayerCatalog();
      catalog.map = {};
      catalog.div = document.createElement('div');
      catalog.div.innerHTML = `
        <ul>
          <li class="tc-ctl-lcat-node" data-layer-name="node/radio">
            <span class="tc-ctl-lcat-node-title">Radio</span>
            <ul>
              <li class="tc-ctl-lcat-node" data-layer-name="node/a"><span>A</span></li>
              <li class="tc-ctl-lcat-node" data-layer-name="node/b"><span>B</span></li>
            </ul>
          </li>
        </ul>`;
      (handler as any).decorateRadioControls(catalog);

      const radio = catalog.div.querySelector(
        'input.sitmun-lcat-radio[data-layer-name="node/a"]'
      ) as HTMLInputElement;
      radio.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await Promise.resolve();

      expect(catalog.addLayerToMap).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'A' }),
        'node/a'
      );
    });

    it('radio loadData folder load control is type=radio and selects first ordered child', async () => {
      const LayerCatalog: any = function () {};
      LayerCatalog.prototype.addLayerToMap = jest.fn().mockResolvedValue(undefined);
      const catalog = new LayerCatalog();
      catalog.map = {};
      catalog.div = document.createElement('div');
      catalog.div.innerHTML = `
        <ul>
          <li class="tc-ctl-lcat-node" data-layer-name="node/radio">
            <span class="tc-ctl-lcat-node-title">Radio</span>
            <ul>
              <li class="tc-ctl-lcat-node" data-layer-name="node/a"><span>A</span></li>
              <li class="tc-ctl-lcat-node" data-layer-name="node/b"><span>B</span></li>
            </ul>
          </li>
        </ul>`;
      (handler as any).decorateRadioControls(catalog);

      const loadControl = catalog.div.querySelector(
        'input.sitmun-lcat-load[data-layer-name="node/radio"]'
      ) as HTMLInputElement;
      expect(loadControl).toBeTruthy();
      expect(loadControl.type).toBe('radio');
      expect(loadControl.className).toContain('sitmun-lcat-load');
      const childRadio = catalog.div.querySelector(
        'input.sitmun-lcat-radio[data-layer-name="node/a"]'
      ) as HTMLInputElement;
      expect(loadControl.name).toBeTruthy();
      expect(loadControl.name).not.toBe(childRadio.name);

      loadControl.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await Promise.resolve();

      expect(catalog.addLayerToMap).toHaveBeenCalledTimes(1);
      expect(catalog.addLayerToMap).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Alpha layer' }),
        'node/a'
      );
    });

    it('radio loadData folder load control clears first child when selected', async () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const removeLayerClaims = jest
        .spyOn(handler as any, 'removeLayerClaims')
        .mockResolvedValue(undefined);
      const LayerCatalog: any = function () {};
      LayerCatalog.prototype.addLayerToMap = jest.fn().mockResolvedValue(undefined);
      const catalog = new LayerCatalog();
      const map = {
        workLayers: [{ options: { nodeId: 'node/a' } }]
      };
      catalog.map = map;
      catalog.div = document.createElement('div');
      catalog.div.innerHTML = `
        <ul>
          <li class="tc-ctl-lcat-node" data-layer-name="node/radio">
            <span class="tc-ctl-lcat-node-title">Radio</span>
            <ul>
              <li class="tc-ctl-lcat-node" data-layer-name="node/a"><span>A</span></li>
              <li class="tc-ctl-lcat-node" data-layer-name="node/b"><span>B</span></li>
            </ul>
          </li>
        </ul>`;
      selection.commitSelection(map, 'node/a', 'layer/a', true);
      (handler as any).decorateRadioControls(catalog);

      const loadControl = catalog.div.querySelector(
        'input.sitmun-lcat-load[data-layer-name="node/radio"]'
      ) as HTMLInputElement;
      expect(loadControl.type).toBe('radio');
      loadControl.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await Promise.resolve();
      await Promise.resolve();

      expect(removeLayerClaims).toHaveBeenCalledWith(
        map,
        expect.arrayContaining(['node/a', 'node/b']),
        catalog
      );
      expect(catalog.addLayerToMap).not.toHaveBeenCalled();
      removeLayerClaims.mockRestore();
    });

    it('radio loadData folder control is checked when a non-first child is selected', async () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const LayerCatalog: any = function () {};
      LayerCatalog.prototype.addLayerToMap = jest.fn().mockResolvedValue(undefined);
      const catalog = new LayerCatalog();
      const map = {
        workLayers: [{ options: { nodeId: 'node/b' } }]
      };
      catalog.map = map;
      catalog.div = document.createElement('div');
      catalog.div.innerHTML = `
        <ul>
          <li class="tc-ctl-lcat-node" data-layer-name="node/radio">
            <span class="tc-ctl-lcat-node-title">Radio</span>
            <ul>
              <li class="tc-ctl-lcat-node" data-layer-name="node/a"><span>A</span></li>
              <li class="tc-ctl-lcat-node" data-layer-name="node/b"><span>B</span></li>
            </ul>
          </li>
        </ul>`;
      selection.commitSelection(map, 'node/b', 'layer/b', true);
      (handler as any).decorateRadioControls(catalog);

      const loadControl = catalog.div.querySelector(
        'input.sitmun-lcat-load[data-layer-name="node/radio"]'
      ) as HTMLInputElement;
      const secondRadio = catalog.div.querySelector(
        'input.sitmun-lcat-radio[data-layer-name="node/b"]'
      ) as HTMLInputElement;

      expect(loadControl.type).toBe('radio');
      expect(secondRadio.checked).toBe(true);
      expect(loadControl.checked).toBe(true);
      expect(loadControl.getAttribute('data-sitmun-folder-state')).toBe('all');
    });

    it('radio loadData folder never shows partial when only one resource child is loaded', async () => {
      const mixedRadioContext = {
        ...minimalContext,
        trees: [
          {
            ...minimalContext.trees[0],
            nodes: {
              'node/root': {
                title: 'Root',
                isRadio: false,
                children: ['node/radio'],
                order: 0
              },
              'node/radio': {
                title: 'Rutes',
                isRadio: true,
                loadData: true,
                children: ['node/nested', 'node/a'],
                order: 1
              },
              'node/nested': {
                title: 'Nested browse',
                isRadio: false,
                loadData: false,
                children: ['node/b'],
                order: 1
              },
              'node/a': {
                title: 'A',
                resource: 'layer/a',
                isRadio: false,
                children: [],
                order: 2
              },
              'node/b': {
                title: 'B',
                resource: 'layer/b',
                isRadio: false,
                children: [],
                order: 1
              }
            }
          }
        ]
      } as AppCfg;
      const realLookup = new ConfigLookupService();
      realLookup.initialize(mixedRadioContext);
      (handler as any).configLookup = realLookup;

      const selection = TestBed.inject(CatalogLayerSelectionService);
      const LayerCatalog: any = function () {};
      const catalog = new LayerCatalog();
      const map = {
        workLayers: [{ options: { nodeId: 'node/a' } }]
      };
      catalog.map = map;
      catalog.div = document.createElement('div');
      catalog.div.innerHTML = `
        <ul>
          <li class="tc-ctl-lcat-node" data-layer-name="node/radio">
            <span class="tc-ctl-lcat-node-title">Rutes</span>
            <ul>
              <li class="tc-ctl-lcat-node" data-layer-name="node/nested">
                <span class="tc-ctl-lcat-node-title">Nested</span>
                <ul>
                  <li class="tc-ctl-lcat-node" data-layer-name="node/b"><span>B</span></li>
                </ul>
              </li>
              <li class="tc-ctl-lcat-node" data-layer-name="node/a"><span>A</span></li>
            </ul>
          </li>
        </ul>`;
      selection.commitSelection(map, 'node/a', 'layer/a', true);
      (handler as any).decorateRadioControls(catalog);

      const loadControl = catalog.div.querySelector(
        'input.sitmun-lcat-load[data-layer-name="node/radio"]'
      ) as HTMLInputElement;
      expect(loadControl.type).toBe('radio');
      expect(loadControl.indeterminate).toBe(false);
      expect(loadControl.checked).toBe(true);
      expect(loadControl.getAttribute('data-sitmun-folder-state')).toBe('all');
      expect(loadControl.getAttribute('aria-checked')).toBe('true');
    });

    it('repairs a stale checkbox-typed radio folder load control on reinject', async () => {
      const realLookup = new ConfigLookupService();
      realLookup.initialize(minimalContext);
      (handler as any).configLookup = realLookup;

      const LayerCatalog: any = function () {};
      const catalog = new LayerCatalog();
      catalog.map = { workLayers: [] };
      catalog.div = document.createElement('div');
      catalog.div.innerHTML = `
        <ul>
          <li class="tc-ctl-lcat-node" data-layer-name="node/radio">
            <span class="tc-ctl-lcat-node-title">Radio</span>
            <ul>
              <li class="tc-ctl-lcat-node" data-layer-name="node/a"><span>A</span></li>
            </ul>
          </li>
        </ul>`;
      const folderLi = catalog.div.querySelector(
        'li[data-layer-name="node/radio"]'
      ) as HTMLElement;
      const stale = document.createElement('input');
      stale.type = 'checkbox';
      stale.className = 'sitmun-lcat-load';
      stale.dataset['layerName'] = 'node/radio';
      stale.indeterminate = true;
      stale.setAttribute('data-sitmun-folder-state', 'partial');
      const label = document.createElement('label');
      label.className = 'sitmun-lcat-load-label';
      label.appendChild(stale);
      folderLi.insertBefore(label, folderLi.firstChild);
      folderLi.dataset['sitmunLcatControl'] = 'true';
      folderLi.setAttribute('data-sitmun-load-folder', 'true');

      (handler as any).injectLoadDataCheckboxes(catalog, catalog.div);
      (handler as any).syncLoadDataCheckboxState(catalog);

      expect(stale.type).toBe('radio');
      expect(stale.indeterminate).toBe(false);
      expect(stale.getAttribute('data-sitmun-folder-state')).not.toBe('partial');
    });

    it('radio loadData folder unload clears a non-first selected child', async () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const removeLayerClaims = jest
        .spyOn(handler as any, 'removeLayerClaims')
        .mockResolvedValue(undefined);
      const LayerCatalog: any = function () {};
      LayerCatalog.prototype.addLayerToMap = jest.fn().mockResolvedValue(undefined);
      const catalog = new LayerCatalog();
      const map = {
        workLayers: [{ options: { nodeId: 'node/b' } }]
      };
      catalog.map = map;
      catalog.div = document.createElement('div');
      catalog.div.innerHTML = `
        <ul>
          <li class="tc-ctl-lcat-node" data-layer-name="node/radio">
            <span class="tc-ctl-lcat-node-title">Radio</span>
            <ul>
              <li class="tc-ctl-lcat-node" data-layer-name="node/a"><span>A</span></li>
              <li class="tc-ctl-lcat-node" data-layer-name="node/b"><span>B</span></li>
            </ul>
          </li>
        </ul>`;
      selection.commitSelection(map, 'node/b', 'layer/b', true);
      (handler as any).decorateRadioControls(catalog);

      const loadControl = catalog.div.querySelector(
        'input.sitmun-lcat-load[data-layer-name="node/radio"]'
      ) as HTMLInputElement;
      expect(loadControl.checked).toBe(true);

      loadControl.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await Promise.resolve();
      await Promise.resolve();

      expect(removeLayerClaims).toHaveBeenCalledWith(
        map,
        expect.arrayContaining(['node/b']),
        catalog
      );
      expect(catalog.addLayerToMap).not.toHaveBeenCalled();
      removeLayerClaims.mockRestore();
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

  describe('loadData folder store reconcile', () => {
    const fourLeafContext: AppCfg = {
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
              children: ['node/folder'],
              order: 0
            },
            'node/folder': {
              title: 'Folder',
              isRadio: false,
              loadData: true,
              children: ['node/a', 'node/b', 'node/c', 'node/d'],
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
            },
            'node/c': {
              title: 'C',
              resource: 'layer/c',
              isRadio: false,
              children: [],
              order: 3
            },
            'node/d': {
              title: 'D',
              resource: 'layer/d',
              isRadio: false,
              children: [],
              order: 4
            }
          }
        }
      ]
    } as AppCfg;

    function folderCatalogHtml(): string {
      return `
        <ul>
          <li class="tc-ctl-lcat-node" data-layer-name="node/folder">
            <span class="tc-ctl-lcat-node-title">Folder</span>
            <ul>
              <li class="tc-ctl-lcat-node" data-layer-name="node/a"><span>A</span></li>
              <li class="tc-ctl-lcat-node" data-layer-name="node/b"><span>B</span></li>
              <li class="tc-ctl-lcat-node" data-layer-name="node/c"><span>C</span></li>
              <li class="tc-ctl-lcat-node" data-layer-name="node/d"><span>D</span></li>
            </ul>
          </li>
        </ul>`;
    }

    beforeEach(() => {
      const realLookup = new ConfigLookupService();
      realLookup.initialize(fourLeafContext);
      (handler as any).configLookup = realLookup;
      mockSitnaApi.setGlobal('currentAppCfg', fourLeafContext);
    });

    it('folder checkbox clears remaining leaves after external remove of subset', async () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const workLayers: Array<{ options: { nodeId: string } }> = [
        { options: { nodeId: 'node/a' } },
        { options: { nodeId: 'node/b' } },
        { options: { nodeId: 'node/c' } },
        { options: { nodeId: 'node/d' } }
      ];
      const listeners: Record<string, Array<(layer: any) => void>> = {
        layerremove: []
      };
      const removeLayer = jest.fn().mockImplementation(async (layer: any) => {
        const idx = workLayers.indexOf(layer);
        if (idx >= 0) {
          workLayers.splice(idx, 1);
        }
        listeners['layerremove'].forEach((fn) => fn({ layer }));
      });
      const map = {
        on: jest.fn((event: string, fn: (layer: any) => void) => {
          listeners[event]?.push(fn);
        }),
        off: jest.fn(),
        removeLayer,
        get workLayers() {
          return workLayers;
        }
      };
      const LayerCatalog: any = function () {};
      LayerCatalog.prototype.addLayerToMap = jest.fn().mockResolvedValue(undefined);
      const catalog = new LayerCatalog();
      catalog.map = map;
      catalog.div = document.createElement('div');
      catalog.div.innerHTML = folderCatalogHtml();

      for (const id of ['node/a', 'node/b', 'node/c', 'node/d']) {
        selection.commitSelection(map, id, `layer/${id.slice(-1)}`, true);
      }
      (handler as any).attachMapEventBridge(map, {
        Consts: { event: { LAYERADD: 'layeradd', LAYERREMOVE: 'layerremove' } }
      });
      (handler as any).decorateRadioControls(catalog);

      const layerA = workLayers[0];
      const layerB = workLayers[1];
      await removeLayer(layerA);
      await removeLayer(layerB);
      removeLayer.mockClear();
      (catalog.addLayerToMap as jest.Mock).mockClear();

      const loadCheckbox = catalog.div.querySelector(
        'input.sitmun-lcat-load[data-layer-name="node/folder"]'
      ) as HTMLInputElement;
      loadCheckbox.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await selection.runExclusive(map, async () => undefined);

      expect(catalog.addLayerToMap).not.toHaveBeenCalled();
      expect(removeLayer).toHaveBeenCalled();
      expect(workLayers.map((l) => l.options.nodeId)).toEqual([]);
    });

    it('folder checkbox does not addLayerToMap when any leaf still on map', async () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const workLayers: Array<{ options: { nodeId: string } }> = [
        { options: { nodeId: 'node/c' } },
        { options: { nodeId: 'node/d' } }
      ];
      const removeLayer = jest.fn().mockImplementation(async (layer: any) => {
        const idx = workLayers.indexOf(layer);
        if (idx >= 0) {
          workLayers.splice(idx, 1);
        }
      });
      const map = {
        on: jest.fn(),
        off: jest.fn(),
        removeLayer,
        get workLayers() {
          return workLayers;
        }
      };
      const LayerCatalog: any = function () {};
      LayerCatalog.prototype.addLayerToMap = jest.fn().mockResolvedValue(undefined);
      const catalog = new LayerCatalog();
      catalog.map = map;
      catalog.div = document.createElement('div');
      catalog.div.innerHTML = folderCatalogHtml();
      (handler as any).decorateRadioControls(catalog);

      expect(selection.isNodeSelected(map, 'node/c')).toBe(false);
      expect(selection.isNodeSelected(map, 'node/d')).toBe(false);

      const loadCheckbox = catalog.div.querySelector(
        'input.sitmun-lcat-load[data-layer-name="node/folder"]'
      ) as HTMLInputElement;
      loadCheckbox.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await selection.runExclusive(map, async () => undefined);

      expect(catalog.addLayerToMap).not.toHaveBeenCalled();
      expect(workLayers).toHaveLength(0);
    });

    it('partial folder sets indeterminate on load checkbox', async () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const map = {
        workLayers: [
          { options: { nodeId: 'node/a' } },
          { options: { nodeId: 'node/b' } }
        ]
      };
      const LayerCatalog: any = function () {};
      const catalog = new LayerCatalog();
      catalog.map = map;
      catalog.div = document.createElement('div');
      catalog.div.innerHTML = folderCatalogHtml();
      selection.commitSelection(map, 'node/a', 'layer/a', true);
      selection.commitSelection(map, 'node/b', 'layer/b', true);
      (handler as any).decorateRadioControls(catalog);

      const loadCheckbox = catalog.div.querySelector(
        'input.sitmun-lcat-load[data-layer-name="node/folder"]'
      ) as HTMLInputElement;
      expect(loadCheckbox.indeterminate).toBe(true);
      expect(loadCheckbox.checked).toBe(false);
      expect(loadCheckbox.getAttribute('data-sitmun-folder-state')).toBe('partial');
    });

    it('empty workLayers forces none even after stale indeterminate', async () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const map = {
        workLayers: [
          { options: { nodeId: 'node/a' } },
          { options: { nodeId: 'node/b' } }
        ]
      };
      const LayerCatalog: any = function () {};
      const catalog = new LayerCatalog();
      catalog.map = map;
      catalog.div = document.createElement('div');
      catalog.div.innerHTML = folderCatalogHtml();
      (handler as any).decorateRadioControls(catalog);

      const loadCheckbox = catalog.div.querySelector(
        'input.sitmun-lcat-load[data-layer-name="node/folder"]'
      ) as HTMLInputElement;
      expect(loadCheckbox.indeterminate).toBe(true);

      map.workLayers.length = 0;
      (handler as any).syncLoadDataCheckboxState(catalog);

      expect(loadCheckbox.indeterminate).toBe(false);
      expect(loadCheckbox.checked).toBe(false);
      expect(loadCheckbox.getAttribute('data-sitmun-folder-state')).toBe('none');
      expect(selection.isAnyPending(map, ['node/a'])).toBe(false);
    });

    it('all workLayers matching DOM leaves marks checkbox checked not partial', async () => {
      const map = {
        workLayers: [
          { options: { nodeId: 'node/a' } },
          { options: { nodeId: 'node/b' } },
          { options: { nodeId: 'node/c' } },
          { options: { nodeId: 'node/d' } }
        ]
      };
      const LayerCatalog: any = function () {};
      const catalog = new LayerCatalog();
      catalog.map = map;
      catalog.div = document.createElement('div');
      catalog.div.innerHTML = folderCatalogHtml();
      (handler as any).decorateRadioControls(catalog);

      const loadCheckbox = catalog.div.querySelector(
        'input.sitmun-lcat-load[data-layer-name="node/folder"]'
      ) as HTMLInputElement;
      expect(loadCheckbox.indeterminate).toBe(false);
      expect(loadCheckbox.checked).toBe(true);
      expect(loadCheckbox.getAttribute('data-sitmun-folder-state')).toBe('all');
    });

    it('unload removes ghost workLayers by nodeId even without resource refcount', async () => {
      const workLayers: Array<{ options: { nodeId: string } }> = [
        { options: { nodeId: 'node/a' } },
        { options: { nodeId: 'node/b' } }
      ];
      const removeLayer = jest.fn().mockImplementation(async (layer: any) => {
        const idx = workLayers.indexOf(layer);
        if (idx >= 0) {
          workLayers.splice(idx, 1);
        }
      });
      const map = {
        removeLayer,
        get workLayers() {
          return workLayers;
        }
      };
      const LayerCatalog: any = function () {};
      LayerCatalog.prototype.addLayerToMap = jest.fn().mockResolvedValue(undefined);
      const catalog = new LayerCatalog();
      catalog.map = map;
      catalog.div = document.createElement('div');
      catalog.div.innerHTML = folderCatalogHtml();
      (handler as any).decorateRadioControls(catalog);

      const loadCheckbox = catalog.div.querySelector(
        'input.sitmun-lcat-load[data-layer-name="node/folder"]'
      ) as HTMLInputElement;
      loadCheckbox.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      const selection = TestBed.inject(CatalogLayerSelectionService);
      await selection.runExclusive(map, async () => undefined);

      expect(workLayers).toHaveLength(0);
      expect(loadCheckbox.indeterminate).toBe(false);
      expect(loadCheckbox.getAttribute('data-sitmun-folder-state')).toBe('none');
    });

    it('clearStalePending recovers clicks when exclusiveDepth is zero', async () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const map = { workLayers: [] as Array<{ options: { nodeId: string } }> };
      selection.beginPending(map, ['node/a', 'node/b', 'node/c', 'node/d']);
      expect(selection.isAnyPending(map, ['node/a'])).toBe(true);
      selection.clearStalePending(map);
      expect(selection.isAnyPending(map, ['node/a'])).toBe(false);
    });

    it('unload click clears checkbox visual immediately and after settle', async () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const workLayers: Array<{ options: { nodeId: string } }> = [
        { options: { nodeId: 'node/a' } },
        { options: { nodeId: 'node/b' } },
        { options: { nodeId: 'node/c' } },
        { options: { nodeId: 'node/d' } }
      ];
      const removeLayer = jest.fn().mockImplementation(async (layer: any) => {
        const idx = workLayers.indexOf(layer);
        if (idx >= 0) {
          workLayers.splice(idx, 1);
        }
      });
      const map = {
        on: jest.fn(),
        off: jest.fn(),
        removeLayer,
        get workLayers() {
          return workLayers;
        }
      };
      const LayerCatalog: any = function () {};
      LayerCatalog.prototype.addLayerToMap = jest.fn().mockResolvedValue(undefined);
      const catalog = new LayerCatalog();
      catalog.map = map;
      catalog.div = document.createElement('div');
      catalog.div.innerHTML = folderCatalogHtml();
      (handler as any).decorateRadioControls(catalog);

      const loadCheckbox = catalog.div.querySelector(
        'input.sitmun-lcat-load[data-layer-name="node/folder"]'
      ) as HTMLInputElement;
      expect(loadCheckbox.checked).toBe(true);

      loadCheckbox.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      // Optimistic clear runs synchronously in the click handler.
      expect(loadCheckbox.checked).toBe(false);
      expect(loadCheckbox.indeterminate).toBe(false);
      expect(loadCheckbox.getAttribute('data-sitmun-folder-state')).toBe('none');

      await selection.runExclusive(map, async () => undefined);
      await Promise.resolve();

      expect(workLayers).toHaveLength(0);
      expect(loadCheckbox.checked).toBe(false);
      expect(loadCheckbox.indeterminate).toBe(false);
      expect(loadCheckbox.getAttribute('data-sitmun-folder-state')).toBe('none');
    });

    it('bridge onRemove during runWithSelfCommit does not call runExclusive', async () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const listeners: Record<string, Array<(layer: any) => void>> = {
        layerremove: []
      };
      const map = {
        on: jest.fn((event: string, fn: (layer: any) => void) => {
          listeners[event]?.push(fn);
        }),
        off: jest.fn(),
        workLayers: []
      };
      const runExclusive = jest.spyOn(selection, 'runExclusive');
      (handler as any).attachMapEventBridge(map, {
        Consts: { event: { LAYERADD: 'layeradd', LAYERREMOVE: 'layerremove' } }
      });

      await selection.runWithSelfCommit(map, async () => {
        listeners['layerremove'][0]?.({
          layer: { options: { nodeId: 'node/a' } }
        });
      });

      expect(runExclusive).not.toHaveBeenCalled();
      runExclusive.mockRestore();
    });
  });

  describe('applyZebraStriping', () => {
    function zebraFixture(collapsedRoot: boolean): HTMLElement {
      const div = document.createElement('div');
      div.className = 'tc-ctl-lcat';
      div.innerHTML = `
        <div class="tc-ctl-lcat-tree">
          <ul class="tc-ctl-lcat-branch">
            <li class="tc-ctl-lcat-node${collapsedRoot ? ' tc-collapsed' : ''}" data-layer-name="node/root">
              <span class="tc-ctl-lcat-node-title">Root</span>
              <ul class="tc-ctl-lcat-branch">
                <li class="tc-ctl-lcat-node" data-layer-name="node/folder">
                  <span class="tc-ctl-lcat-node-title">Folder</span>
                  <ul class="tc-ctl-lcat-branch">
                    <li class="tc-ctl-lcat-leaf" data-layer-name="node/a">
                      <span class="tc-ctl-lcat-node-title">A</span>
                    </li>
                    <li class="tc-ctl-lcat-leaf" data-layer-name="node/b">
                      <span class="tc-ctl-lcat-node-title">B</span>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
            <li class="tc-ctl-lcat-node tc-collapsed" data-layer-name="node/other">
              <span class="tc-ctl-lcat-node-title">Other</span>
            </li>
          </ul>
        </div>
      `;
      return div;
    }

    it('assigns alternating zebra indices to visible rows in document order', () => {
      const div = zebraFixture(false);
      (handler as any).applyZebraStriping(div);

      expect(div.querySelector('[data-layer-name="node/root"]')?.getAttribute('data-sitmun-lcat-zebra')).toBe(
        '0'
      );
      expect(
        div.querySelector('[data-layer-name="node/folder"]')?.getAttribute('data-sitmun-lcat-zebra')
      ).toBe('1');
      expect(div.querySelector('[data-layer-name="node/a"]')?.getAttribute('data-sitmun-lcat-zebra')).toBe(
        '0'
      );
      expect(div.querySelector('[data-layer-name="node/b"]')?.getAttribute('data-sitmun-lcat-zebra')).toBe(
        '1'
      );
      expect(
        div.querySelector('[data-layer-name="node/other"]')?.getAttribute('data-sitmun-lcat-zebra')
      ).toBe('0');
    });

    it('skips descendants of collapsed folders and reindexes after expand', () => {
      const div = zebraFixture(true);
      (handler as any).applyZebraStriping(div);

      expect(div.querySelector('[data-layer-name="node/root"]')?.getAttribute('data-sitmun-lcat-zebra')).toBe(
        '0'
      );
      expect(
        div.querySelector('[data-layer-name="node/folder"]')?.hasAttribute('data-sitmun-lcat-zebra')
      ).toBe(false);
      expect(div.querySelector('[data-layer-name="node/a"]')?.hasAttribute('data-sitmun-lcat-zebra')).toBe(
        false
      );
      expect(
        div.querySelector('[data-layer-name="node/other"]')?.getAttribute('data-sitmun-lcat-zebra')
      ).toBe('1');

      div.querySelector('[data-layer-name="node/root"]')?.classList.remove('tc-collapsed');
      (handler as any).applyZebraStriping(div);

      expect(
        div.querySelector('[data-layer-name="node/folder"]')?.getAttribute('data-sitmun-lcat-zebra')
      ).toBe('1');
      expect(
        div.querySelector('[data-layer-name="node/other"]')?.getAttribute('data-sitmun-lcat-zebra')
      ).toBe('0');
    });
  });

  describe('applyCatalogRowLayout', () => {
    const layoutBaseContext: AppCfg = {
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
      layers: [
        { id: 'layer/a', title: 'A', layers: ['a'], service: 'service/1' },
        { id: 'layer/b', title: 'B', layers: ['b'], service: 'service/1' }
      ],
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
              children: ['node/folder'],
              order: 0
            },
            'node/folder': {
              title: 'Folder',
              isRadio: false,
              loadData: false,
              children: ['node/a'],
              order: 1
            },
            'node/a': {
              title: 'A',
              resource: 'layer/a',
              isRadio: false,
              children: [],
              order: 1
            }
          }
        }
      ]
    } as any;

    function levelOf(el: Element | null): string | null {
      return el?.getAttribute('data-sitmun-lcat-level') ?? null;
    }

    function cssLevel(el: Element | null): string {
      return (el as HTMLElement | null)?.style.getPropertyValue('--sitmun-lcat-level').trim() ?? '';
    }

    it('stamps nest level from ancestor folders on tree rows', () => {
      const div = document.createElement('div');
      div.className = 'tc-ctl-lcat';
      div.innerHTML = `
        <div class="tc-ctl-lcat-tree">
          <ul class="tc-ctl-lcat-branch">
            <li class="tc-ctl-lcat-node" data-layer-name="node/root">
              <span class="tc-ctl-lcat-node-title">Root</span>
              <ul class="tc-ctl-lcat-branch">
                <li class="tc-ctl-lcat-node" data-layer-name="node/folder">
                  <span class="tc-ctl-lcat-node-title">Folder</span>
                  <ul class="tc-ctl-lcat-branch">
                    <li class="tc-ctl-lcat-leaf" data-layer-name="node/a">
                      <span class="tc-ctl-lcat-node-title">A</span>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </div>`;
      (handler as any).applyCatalogRowLayout(div);

      const root = div.querySelector('[data-layer-name="node/root"]');
      const folder = div.querySelector('[data-layer-name="node/folder"]');
      const leaf = div.querySelector('[data-layer-name="node/a"]');
      expect(levelOf(root)).toBe('0');
      expect(levelOf(folder)).toBe('1');
      expect(levelOf(leaf)).toBe('2');
      expect(cssLevel(root)).toBe('0');
      expect(cssLevel(folder)).toBe('1');
      expect(cssLevel(leaf)).toBe('2');
    });

    it('stamps search-list rows at level 0', () => {
      const div = document.createElement('div');
      div.className = 'tc-ctl-lcat';
      div.innerHTML = `
        <div class="tc-ctl-lcat-search">
          <ul>
            <li class="tc-ctl-lcat-leaf" data-layer-name="node/hit">
              <span class="tc-ctl-lcat-node-title">Hit</span>
            </li>
          </ul>
        </div>`;
      const searchList = div.querySelector('.tc-ctl-lcat-search ul') as HTMLElement;
      (handler as any).applyCatalogRowLayout(searchList);

      const hit = div.querySelector('[data-layer-name="node/hit"]');
      expect(levelOf(hit)).toBe('0');
      expect(cssLevel(hit)).toBe('0');
    });

    it('does not reserve space when select or GFI icons are absent', () => {
      const realLookup = new ConfigLookupService();
      realLookup.initialize(layoutBaseContext);
      (handler as any).configLookup = realLookup;

      const LayerCatalog: any = function () {};
      LayerCatalog.prototype.addLayerToMap = jest.fn().mockResolvedValue(undefined);
      const catalog = new LayerCatalog();
      catalog.map = {};
      catalog.div = document.createElement('div');
      catalog.div.innerHTML = `
        <div class="tc-ctl-lcat-tree">
          <ul class="tc-ctl-lcat-branch">
            <li class="tc-ctl-lcat-node" data-layer-name="node/folder">
              <span class="tc-ctl-lcat-node-title">Folder</span>
              <ul class="tc-ctl-lcat-branch">
                <li class="tc-ctl-lcat-leaf" data-layer-name="node/a">
                  <span class="tc-ctl-lcat-node-title">A</span>
                </li>
              </ul>
            </li>
          </ul>
        </div>`;
      (handler as any).decorateRadioControls(catalog);

      const folder = catalog.div.querySelector(
        'li[data-layer-name="node/folder"]'
      ) as HTMLElement;
      const leaf = catalog.div.querySelector(
        'li[data-layer-name="node/a"]'
      ) as HTMLElement;
      expect(folder.querySelector(':scope > input.sitmun-lcat-load')).toBeNull();
      expect(folder.querySelector('.sitmun-lcat-select-slot, .sitmun-lcat-gfi-slot')).toBeNull();
      const folderTitle = folder.querySelector(':scope > .tc-ctl-lcat-node-title');
      expect(folderTitle?.previousElementSibling?.tagName).not.toBe('I');

      expect(leaf.querySelector(':scope > .sitmun-lcat-gfi')).toBeNull();
      expect(leaf.querySelector('.sitmun-lcat-gfi-slot, .sitmun-lcat-select-slot')).toBeNull();
      // Non-radio leaf still gets a real load checkbox (not an empty spacer).
      expect(
        leaf.querySelector(':scope > label.sitmun-lcat-leaf-load-label')
      ).toBeTruthy();
    });

    it('keeps visible GFI only when queryable; no empty GFI slot otherwise', () => {
      const gfiContext = {
        ...layoutBaseContext,
        trees: [
          {
            ...layoutBaseContext.trees[0],
            nodes: {
              'node/root': {
                title: 'Root',
                isRadio: false,
                children: ['node/a', 'node/b'],
                order: 0
              },
              'node/a': {
                title: 'A',
                resource: 'layer/a',
                isRadio: false,
                queryableActive: true,
                children: [],
                order: 1
              },
              'node/b': {
                title: 'B',
                resource: 'layer/b',
                isRadio: false,
                queryableActive: false,
                children: [],
                order: 2
              }
            }
          }
        ]
      } as AppCfg;
      const realLookup = new ConfigLookupService();
      realLookup.initialize(gfiContext);
      (handler as any).configLookup = realLookup;

      const LayerCatalog: any = function () {};
      LayerCatalog.prototype.addLayerToMap = jest.fn().mockResolvedValue(undefined);
      const catalog = new LayerCatalog();
      catalog.map = {};
      catalog.div = document.createElement('div');
      catalog.div.innerHTML = `
        <div class="tc-ctl-lcat-tree">
          <ul class="tc-ctl-lcat-branch">
            <li class="tc-ctl-lcat-leaf" data-layer-name="node/a">
              <span class="tc-ctl-lcat-node-title">A</span>
            </li>
            <li class="tc-ctl-lcat-leaf" data-layer-name="node/b">
              <span class="tc-ctl-lcat-node-title">B</span>
            </li>
          </ul>
        </div>`;
      (handler as any).decorateRadioControls(catalog);

      const leafA = catalog.div.querySelector(
        'li[data-layer-name="node/a"]'
      ) as HTMLElement;
      const leafB = catalog.div.querySelector(
        'li[data-layer-name="node/b"]'
      ) as HTMLElement;
      expect(leafA.querySelector(':scope > .sitmun-lcat-gfi')).toBeNull();
      expect(leafB.querySelector(':scope > .sitmun-lcat-gfi')).toBeNull();
      expect(leafB.querySelector('.sitmun-lcat-gfi-slot')).toBeNull();

      const titleA = leafA.querySelector(
        ':scope > .tc-ctl-lcat-node-title'
      ) as HTMLElement;
      const titleB = leafB.querySelector(
        ':scope > .tc-ctl-lcat-node-title'
      ) as HTMLElement;
      const selectA = leafA.querySelector(
        ':scope > label.sitmun-lcat-leaf-load-label'
      );
      expect(selectA?.nextElementSibling).toBe(titleA);
      const selectB = leafB.querySelector(
        ':scope > label.sitmun-lcat-leaf-load-label'
      );
      expect(selectB?.nextElementSibling).toBe(titleB);
    });
  });

  describe('leaf load checkboxes', () => {
    const leafLoadContext: AppCfg = {
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
      layers: [
        { id: 'layer/plain', title: 'Plain', layers: ['p'], service: 'service/1' },
        { id: 'layer/radio', title: 'Radio', layers: ['r'], service: 'service/1' }
      ],
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
              children: ['node/folder', 'node/radio'],
              order: 0
            },
            'node/folder': {
              title: 'Folder',
              isRadio: false,
              loadData: false,
              children: ['node/plain'],
              order: 1
            },
            'node/plain': {
              title: 'Plain leaf',
              resource: 'layer/plain',
              isRadio: false,
              children: [],
              order: 1
            },
            'node/radio': {
              title: 'Radio folder',
              isRadio: true,
              loadData: true,
              children: ['node/radio-leaf'],
              order: 2
            },
            'node/radio-leaf': {
              title: 'Radio leaf',
              resource: 'layer/radio',
              isRadio: false,
              children: [],
              order: 1
            }
          }
        }
      ]
    } as any;

    beforeEach(() => {
      const realLookup = new ConfigLookupService();
      realLookup.initialize(leafLoadContext);
      (handler as any).configLookup = realLookup;
    });

    function decorateLeafCatalog(map: object = {}): any {
      const LayerCatalog: any = function () {};
      LayerCatalog.prototype.addLayerToMap = jest.fn().mockResolvedValue(undefined);
      const catalog = new LayerCatalog();
      catalog.map = map;
      catalog.div = document.createElement('div');
      catalog.div.innerHTML = `
        <ul>
          <li class="tc-ctl-lcat-node" data-layer-name="node/root">
            <span class="tc-ctl-lcat-node-title">Root</span>
            <ul>
              <li class="tc-ctl-lcat-node" data-layer-name="node/folder">
                <span class="tc-ctl-lcat-node-title">Folder</span>
                <ul>
                  <li class="tc-ctl-lcat-leaf" data-layer-name="node/plain">
                    <span class="tc-ctl-lcat-node-title">Plain leaf</span>
                  </li>
                </ul>
              </li>
              <li class="tc-ctl-lcat-node" data-layer-name="node/radio">
                <span class="tc-ctl-lcat-node-title">Radio folder</span>
                <ul>
                  <li class="tc-ctl-lcat-leaf" data-layer-name="node/radio-leaf">
                    <span class="tc-ctl-lcat-node-title">Radio leaf</span>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>`;
      (handler as any).decorateRadioControls(catalog);
      return catalog;
    }

    it('injects leaf-load checkbox on non-radio cartography leaves only', () => {
      const catalog = decorateLeafCatalog();
      const plain = catalog.div.querySelector(
        'input.sitmun-lcat-leaf-load[data-layer-name="node/plain"]'
      ) as HTMLInputElement | null;
      const radioLeafLoad = catalog.div.querySelector(
        'input.sitmun-lcat-leaf-load[data-layer-name="node/radio-leaf"]'
      );
      const radioLeafRadio = catalog.div.querySelector(
        'input.sitmun-lcat-radio[data-layer-name="node/radio-leaf"]'
      );
      expect(plain).toBeTruthy();
      expect(plain?.type).toBe('checkbox');
      expect(radioLeafLoad).toBeNull();
      expect(radioLeafRadio).toBeTruthy();
    });

    it('syncs leaf-load checked state from selection', () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const map = { workLayers: [] as unknown[] };
      const catalog = decorateLeafCatalog(map);
      const input = catalog.div.querySelector(
        'input.sitmun-lcat-leaf-load[data-layer-name="node/plain"]'
      ) as HTMLInputElement;
      expect(input.checked).toBe(false);

      selection.commitSelection(map, 'node/plain', 'layer/plain', true);
      (handler as any).syncLeafLoadCheckboxState(catalog);
      expect(input.checked).toBe(true);
      // SITNA search-close uses `.tc-ctl-lcat-tree li [checked]` — must not match.
      expect(input.hasAttribute('checked')).toBe(false);
      expect(
        catalog.div.querySelector('.tc-ctl-lcat-tree li [checked], li [checked]')
      ).toBeNull();

      selection.deselectNode(map, 'node/plain');
      (handler as any).syncLeafLoadCheckboxState(catalog);
      expect(input.checked).toBe(false);
    });

    it('leaf-load click loads when unchecked and unloads when checked', async () => {
      const selection = TestBed.inject(CatalogLayerSelectionService);
      const map = { workLayers: [] as unknown[] };
      const catalog = decorateLeafCatalog(map);
      const removeLayerClaims = jest
        .spyOn(handler as any, 'removeLayerClaims')
        .mockResolvedValue(undefined);
      const input = catalog.div.querySelector(
        'input.sitmun-lcat-leaf-load[data-layer-name="node/plain"]'
      ) as HTMLInputElement;

      input.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await Promise.resolve();
      await Promise.resolve();
      expect(catalog.addLayerToMap).toHaveBeenCalled();
      expect(removeLayerClaims).not.toHaveBeenCalled();

      (catalog.addLayerToMap as jest.Mock).mockClear();
      selection.commitSelection(map, 'node/plain', 'layer/plain', true);
      (handler as any).syncLeafLoadCheckboxState(catalog);
      expect(input.checked).toBe(true);

      input.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await Promise.resolve();
      await Promise.resolve();
      expect(removeLayerClaims).toHaveBeenCalledWith(map, ['node/plain'], catalog);
      expect(catalog.addLayerToMap).not.toHaveBeenCalled();
      removeLayerClaims.mockRestore();
    });

    it('folder italic suppression CSS targets all non-leaf folders', async () => {
      const { readFileSync } = await import('node:fs');
      const { join } = await import('node:path');
      const css = readFileSync(
        join(
          process.cwd(),
          'src/assets/map-styles/sitmun-base/custom-main.css'
        ),
        'utf8'
      );
      expect(css).toMatch(
        /li\.tc-ctl-lcat-node:not\(\.tc-ctl-lcat-leaf\)\.tc-checked/
      );
    });
  });
});
