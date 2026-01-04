import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LayerCatalogControlHandler } from './layer-catalog-control.handler';
import { TCNamespaceService } from '../../services/tc-namespace.service';
import { VirtualWmsCapabilitiesService } from '../../services/virtual-wms-capabilities.service';
import { ConfigLookupService } from '../../services/config-lookup.service';
import { LanguageService } from '../../services/language.service';
import { AppCfg, AppTasks, AppTree, AppNodeInfo } from '@api/model/app-cfg';

describe('LayerCatalogControlHandler', () => {
  let handler: LayerCatalogControlHandler;
  let mockTCNamespace: jasmine.SpyObj<TCNamespaceService>;
  let mockVirtualCapabilities: jasmine.SpyObj<VirtualWmsCapabilitiesService>;
  let mockConfigLookup: jasmine.SpyObj<ConfigLookupService>;
  let mockLanguageService: jasmine.SpyObj<LanguageService>;
  let mockAppCfg: AppCfg;

  beforeEach(() => {
    mockTCNamespace = jasmine.createSpyObj('TCNamespaceService', [
      'waitForTC',
      'getTC'
    ]);
    mockVirtualCapabilities = jasmine.createSpyObj(
      'VirtualWmsCapabilitiesService',
      ['generateVirtualUrl', 'canGenerateCapabilities']
    );
    mockConfigLookup = jasmine.createSpyObj('ConfigLookupService', [
      'initialize',
      'findTreeContainingNode',
      'findNode'
    ]);
    mockLanguageService = jasmine.createSpyObj('LanguageService', [
      'getCurrentLanguage'
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LayerCatalogControlHandler,
        { provide: TCNamespaceService, useValue: mockTCNamespace },
        {
          provide: VirtualWmsCapabilitiesService,
          useValue: mockVirtualCapabilities
        },
        { provide: ConfigLookupService, useValue: mockConfigLookup },
        { provide: LanguageService, useValue: mockLanguageService }
      ]
    });

    handler = TestBed.inject(LayerCatalogControlHandler);

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
            nodes: {},
            title: 'Tree 1',
            image: null
          }
        ]
      } as any;
      const task: AppTasks = {
        'ui-control': 'sitna.layerCatalog',
        parameters: {}
      } as any;

      mockVirtualCapabilities.generateVirtualUrl.and.returnValue(
        'virtual://test'
      );
      mockConfigLookup.findNode.and.returnValue({
        title: 'Node 1'
      } as AppNodeInfo);
      mockVirtualCapabilities.canGenerateCapabilities.and.returnValue(true);

      handler.buildConfiguration(task, context);

      expect(mockConfigLookup.initialize).toHaveBeenCalledWith(context);
    });

    it('should generate virtual WMS layers for trees', () => {
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
        'ui-control': 'sitna.layerCatalog',
        parameters: {}
      } as any;

      mockVirtualCapabilities.generateVirtualUrl.and.returnValue(
        'virtual://sitmun/node1'
      );
      mockConfigLookup.findNode.and.returnValue({
        title: 'Catalog'
      } as AppNodeInfo);
      mockVirtualCapabilities.canGenerateCapabilities.and.returnValue(true);

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config?.div).toBe('layerCatalog');
      expect(config?.layers).toBeDefined();
      expect(config!.layers!.length).toBe(1);
      expect(config!.layers![0].type).toBe('WMS');
      expect(config!.layers![0].url).toBe('virtual://sitmun/node1');
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

      mockVirtualCapabilities.generateVirtualUrl.and.returnValue(
        'virtual://test'
      );
      mockConfigLookup.findTreeContainingNode.and.returnValue(
        context.trees[0] as AppTree
      );
      mockConfigLookup.findNode.and.callFake((nodeId: string) => {
        return context.trees[0].nodes[nodeId] as AppNodeInfo;
      });

      // node2 can generate capabilities, node3 cannot
      mockVirtualCapabilities.canGenerateCapabilities.and.callFake(
        (nodeId: string) => {
          return nodeId === 'node2';
        }
      );

      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config!.layers!.length).toBe(1); // Only node2 should be included
      expect(config!.layers![0].title).toBe('Valid Node');
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
            nodes: {},
            title: 'Tree Title',
            image: null
          }
        ]
      } as any;
      const task: AppTasks = {
        'ui-control': 'sitna.layerCatalog',
        parameters: {}
      } as any;

      mockVirtualCapabilities.generateVirtualUrl.and.returnValue(
        'virtual://test'
      );
      mockConfigLookup.findNode.and.returnValue({
        title: 'Node Title'
      } as AppNodeInfo);
      mockVirtualCapabilities.canGenerateCapabilities.and.returnValue(true);

      const config = handler.buildConfiguration(task, context);

      expect(config!.layers![0].title).toBe('Node Title');
    });

    it('should fall back to tree title if node not found', () => {
      const context: AppCfg = {
        trees: [
          {
            id: 'tree1',
            rootNode: 'node1',
            nodes: {},
            title: 'Tree Title',
            image: null
          }
        ]
      } as any;
      const task: AppTasks = {
        'ui-control': 'sitna.layerCatalog',
        parameters: {}
      } as any;

      const mockTree: AppTree = {
        id: 'tree1',
        rootNode: 'node1',
        nodes: {},
        title: 'Tree Title',
        image: null
      };

      mockVirtualCapabilities.generateVirtualUrl.and.returnValue(
        'virtual://test'
      );
      mockConfigLookup.findNode.and.returnValue(undefined);
      mockConfigLookup.findTreeContainingNode.and.returnValue(mockTree);

      const config = handler.buildConfiguration(task, context);

      expect(config!.layers![0].title).toBe('Tree Title');
    });

    it('should use default title if nothing found', () => {
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
        'ui-control': 'sitna.layerCatalog',
        parameters: {}
      } as any;

      mockVirtualCapabilities.generateVirtualUrl.and.returnValue(
        'virtual://test'
      );
      mockConfigLookup.findNode.and.returnValue(undefined);
      mockConfigLookup.findTreeContainingNode.and.returnValue(undefined);

      const config = handler.buildConfiguration(task, context);

      expect(config!.layers![0].title).toBe('Catálogo');
    });

    it('should handle custom root nodes from parameters', () => {
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
        'ui-control': 'sitna.layerCatalog',
        parameters: {
          rootNodes: ['customNode1', 'customNode2']
        }
      } as any;

      mockVirtualCapabilities.generateVirtualUrl.and.callFake(
        (nodeId) => `virtual://${nodeId}`
      );
      mockConfigLookup.findNode.and.returnValue({
        title: 'Custom'
      } as AppNodeInfo);
      mockVirtualCapabilities.canGenerateCapabilities.and.returnValue(true);

      const config = handler.buildConfiguration(task, context);

      expect(config!.layers!.length).toBe(2);
      expect(mockVirtualCapabilities.generateVirtualUrl).toHaveBeenCalledWith(
        'customNode1'
      );
      expect(mockVirtualCapabilities.generateVirtualUrl).toHaveBeenCalledWith(
        'customNode2'
      );
    });

    it('should handle single root node in parameters', () => {
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
        'ui-control': 'sitna.layerCatalog',
        parameters: {
          rootNodes: 'singleNode'
        }
      } as any;

      mockVirtualCapabilities.generateVirtualUrl.and.returnValue(
        'virtual://test'
      );
      mockConfigLookup.findNode.and.returnValue({
        title: 'Single'
      } as AppNodeInfo);
      mockVirtualCapabilities.canGenerateCapabilities.and.returnValue(true);

      const config = handler.buildConfiguration(task, context);

      expect(config!.layers!.length).toBe(1);
    });

    it('should return null if no root nodes', () => {
      const context: AppCfg = { trees: [] } as any;
      const task: AppTasks = {
        'ui-control': 'sitna.layerCatalog',
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
        'ui-control': 'sitna.layerCatalog',
        parameters: {
          enableSearch: true,
          collapsed: false
        }
      } as any;

      mockVirtualCapabilities.generateVirtualUrl.and.returnValue(
        'virtual://test'
      );
      mockConfigLookup.findNode.and.returnValue({
        title: 'Test'
      } as AppNodeInfo);
      mockVirtualCapabilities.canGenerateCapabilities.and.returnValue(true);

      const config = handler.buildConfiguration(task, context);

      expect(config?.enableSearch).toBe(true);
      expect(config?.collapsed).toBe(false);
    });
  });

  describe('isReady()', () => {
    it('should always return true (no patches)', () => {
      expect(handler.isReady()).toBe(true);
    });
  });

  describe('Integration', () => {
    it('should handle full workflow', async () => {
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
        'ui-control': 'sitna.layerCatalog',
        parameters: { enableSearch: true }
      } as any;

      mockVirtualCapabilities.generateVirtualUrl.and.returnValue(
        'virtual://sitmun/node1'
      );
      mockConfigLookup.findNode.and.returnValue({
        title: 'Root Node'
      } as AppNodeInfo);

      // Load patches (no-op)
      await handler.loadPatches(context);

      // Should be ready
      expect(handler.isReady()).toBe(true);

      // Build config
      const config = handler.buildConfiguration(task, context);

      expect(config).toBeDefined();
      expect(config?.div).toBe('layerCatalog');
      expect(config!.layers!.length).toBe(1);
      expect(config!.layers![0].url).toBe('virtual://sitmun/node1');
      expect(config?.enableSearch).toBe(true);
    });
  });

  describe('Language extraction from WMS capabilities', () => {
    // Test to understand how XML parsers structure Abstract fields with xml:lang attributes
    // Based on real WMS capabilities: https://sitmun.diba.cat/wms/servlet/CAE1M?service=wms&request=getcapabilities
    // Which has: <Abstract xml:lang="ca-ES">...</Abstract><Abstract xml:lang="es-ES">...</Abstract>

    it('should test different XML parser structures for language-aware Abstract fields', () => {
      // Access the private method through type casting (for testing only)
      const handlerAny = handler as any;
      const extractLanguageAwareText =
        handlerAny.extractLanguageAwareText.bind(handler);

      // Structure 1: Array of objects with xml:lang as property (common XML2JS format)
      const structure1 = [
        { 'xml:lang': 'ca-ES', '#text': 'Descripció en català' },
        { 'xml:lang': 'es-ES', '#text': 'Descripción en español' }
      ];

      // Structure 2: Array of objects with xmlLang property (camelCase)
      const structure2 = [
        { xmlLang: 'ca-ES', _: 'Descripció en català' },
        { xmlLang: 'es-ES', _: 'Descripción en español' }
      ];

      // Structure 3: Array of objects with @xml:lang (attribute prefix)
      const structure3 = [
        { '@xml:lang': 'ca-ES', '#text': 'Descripció en català' },
        { '@xml:lang': 'es-ES', '#text': 'Descripción en español' }
      ];

      // Structure 4: Object with language keys
      const structure4 = {
        'ca-ES': 'Descripció en català',
        'es-ES': 'Descripción en español'
      };

      // Structure 5: Array where text is direct property
      const structure5 = [
        { 'xml:lang': 'ca-ES', value: 'Descripció en català' },
        { 'xml:lang': 'es-ES', value: 'Descripción en español' }
      ];

      // Test with Spanish preference
      mockLanguageService.getCurrentLanguage.and.returnValue('es-ES');

      console.log('=== Testing Structure 1 (xml:lang, #text) ===');
      const result1 = extractLanguageAwareText(structure1, 'es-ES');
      console.log('Result:', result1);
      expect(result1).toBe('Descripción en español');

      console.log('=== Testing Structure 2 (xmlLang, _) ===');
      const result2 = extractLanguageAwareText(structure2, 'es-ES');
      console.log('Result:', result2);
      expect(result2).toBe('Descripción en español');

      console.log('=== Testing Structure 3 (@xml:lang, #text) ===');
      const result3 = extractLanguageAwareText(structure3, 'es-ES');
      console.log('Result:', result3);
      expect(result3).toBe('Descripción en español');

      console.log('=== Testing Structure 4 (object with lang keys) ===');
      const result4 = extractLanguageAwareText(structure4, 'es-ES');
      console.log('Result:', result4);
      expect(result4).toBe('Descripción en español');

      console.log('=== Testing Structure 5 (xml:lang, value) ===');
      const result5 = extractLanguageAwareText(structure5, 'es-ES');
      console.log('Result:', result5);
      expect(result5).toBe('Descripción en español');

      // Test with Catalan preference
      console.log('=== Testing Structure 1 with ca-ES preference ===');
      const result1ca = extractLanguageAwareText(structure1, 'ca-ES');
      console.log('Result:', result1ca);
      expect(result1ca).toBe('Descripció en català');

      // Test with language base (es when preferred is es-ES)
      console.log('=== Testing Structure 1 with es (base) preference ===');
      const result1es = extractLanguageAwareText(structure1, 'es');
      console.log('Result:', result1es);
      expect(result1es).toBe('Descripción en español');
    });

    it('should log actual WMS capabilities structure when available', async () => {
      // This test will help us understand the actual structure
      // by logging what we receive from real WMS capabilities
      mockLanguageService.getCurrentLanguage.and.returnValue('es-ES');

      // Mock a WMS capabilities structure that might come from XML parsing
      const mockCapabilities = {
        Service: {
          Abstract: [
            {
              'xml:lang': 'ca-ES',
              '#text':
                "IDEBarcelona - CAE1M_GM (OGC Web Map Service) - Cartografia d'eixos i portals a escala 1:1000 (DIBA) de diversos municipis de la província de Barcelona."
            },
            {
              'xml:lang': 'es-ES',
              '#text':
                'IDEBarcelona - CAE1M_GM (OGC Web Map Service) - Cartografía de ejes y portales a escala 1:1000 (DIBA) de varios municipios de la provincia de Barcelona.'
            }
          ]
        }
      };

      const handlerAny = handler as any;
      const extractLanguageAwareText =
        handlerAny.extractLanguageAwareText.bind(handler);

      console.log('=== Testing with mock WMS capabilities structure ===');
      console.log(
        'Mock Abstract structure:',
        JSON.stringify(mockCapabilities.Service.Abstract, null, 2)
      );
      console.log('Preferred language: es-ES');

      const result = extractLanguageAwareText(
        mockCapabilities.Service.Abstract,
        'es-ES'
      );
      console.log('Extracted text:', result);
      console.log('Expected: Spanish description');
      console.log('Actual:', result?.substring(0, 50));

      expect(result).toContain('Cartografía'); // Should contain Spanish text
      expect(result).not.toContain('Cartografia'); // Should not contain Catalan text
    });
  });
});
