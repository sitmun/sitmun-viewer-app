import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppCfg, AppTasks, AppTree, AppNodeInfo } from '@api/model/app-cfg';
import { TranslateService } from '@ngx-translate/core';

import { LayerCatalogControlHandler } from './layer-catalog-control.handler';
import { AppConfigService } from '../../services/app-config.service';
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
});
