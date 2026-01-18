import { TestBed } from '@angular/core/testing';

import { AppCfg } from '@api/model/app-cfg';

import { VirtualWmsCapabilitiesService } from './virtual-wms-capabilities.service';

describe('VirtualWmsCapabilitiesService', () => {
  let service: VirtualWmsCapabilitiesService;
  let mockAppCfg: AppCfg;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VirtualWmsCapabilitiesService);

    // Create comprehensive mock AppCfg
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
      layers: [
        {
          id: 'layer-1',
          title: 'Layer 1',
          layers: ['wms-layer-1'],
          service: 'service-1'
        },
        {
          id: 'layer-2',
          title: 'Layer 2',
          layers: ['wms-layer-2'],
          service: 'service-1'
        }
      ],
      services: [
        {
          id: 'service-1',
          url: 'http://example.com/wms',
          type: 'WMS',
          parameters: { SRS: 'EPSG:25831' }
        }
      ],
      tasks: [],
      trees: [
        {
          id: 'tree-1',
          title: 'Test Tree',
          image: null,
          rootNode: 'node-1',
          nodes: {
            'node-1': {
              title: 'Root Node',
              resource: '',
              isRadio: false,
              children: ['node-2', 'node-3'],
              order: 1
            },
            'node-2': {
              title: 'Folder Node',
              resource: '',
              isRadio: false,
              children: ['node-4'],
              order: 1
            },
            'node-3': {
              title: 'Leaf Node 1',
              resource: 'layer-1',
              isRadio: false,
              children: [],
              order: 2
            },
            'node-4': {
              title: 'Leaf Node 2',
              resource: 'layer-2',
              isRadio: false,
              children: [],
              order: 1
            }
          }
        }
      ]
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generateCapabilities', () => {
    it('should generate valid WMS capabilities structure', () => {
      const capabilities = service.generateCapabilities('node-1', mockAppCfg);

      expect(capabilities).toBeDefined();
      expect(capabilities.version).toBe('1.3.0');
      expect(capabilities.Service).toBeDefined();
      expect(capabilities.Capability).toBeDefined();
    });

    it('should include service metadata', () => {
      const capabilities = service.generateCapabilities('node-1', mockAppCfg);

      expect(capabilities.Service.Name).toBe('WMS');
      expect(capabilities.Service.Title).toContain('Root Node');
      expect(capabilities.Service.Fees).toBe('none');
      expect(capabilities.Service.AccessConstraints).toBe('none');
    });

    it('should build layer hierarchy from node tree', () => {
      const capabilities = service.generateCapabilities('node-1', mockAppCfg);
      const rootLayer = capabilities.Capability.Layer;

      expect(rootLayer.Title).toBe('Root Node');
      expect(rootLayer.Layer).toBeDefined();
      expect(rootLayer.Layer?.length).toBe(2); // node-2 (folder) and node-3 (leaf)
    });

    it('should set Name only for leaf layers', () => {
      const capabilities = service.generateCapabilities('node-1', mockAppCfg);
      const rootLayer = capabilities.Capability.Layer;

      // Root should not have Name
      expect(rootLayer.Name).toBeUndefined();

      // Find leaf node (has Name property)
      const leafNode = rootLayer.Layer?.find((l) => l.Name);
      if (leafNode) {
        expect(leafNode.Name).toBeDefined();
      }
    });

    it('should throw error for non-existent node', () => {
      expect(() => {
        service.generateCapabilities('non-existent', mockAppCfg);
      }).toThrow();
    });

    it('should use application SRS as default CRS', () => {
      const capabilities = service.generateCapabilities('node-1', mockAppCfg);
      const rootLayer = capabilities.Capability.Layer;

      expect(rootLayer.CRS).toContain('EPSG:25831');
    });

    it('should handle node with only children (folder)', () => {
      const capabilities = service.generateCapabilities('node-2', mockAppCfg);
      const rootLayer = capabilities.Capability.Layer;

      expect(rootLayer.Title).toBe('Folder Node');
      expect(rootLayer.Name).toBeUndefined(); // Folders don't have Name
      expect(rootLayer.Layer).toBeDefined();
      expect(rootLayer.Layer?.length).toBe(1); // node-4
    });

    it('should handle leaf node with resource', () => {
      const capabilities = service.generateCapabilities('node-3', mockAppCfg);
      const rootLayer = capabilities.Capability.Layer;

      expect(rootLayer.Title).toBe('Leaf Node 1');
      // Root can have Layer array with the leaf itself
      expect(rootLayer.Layer).toBeDefined();
    });

    it('should exclude nodes with missing resources from capabilities', () => {
      const configWithMissingResource: AppCfg = {
        ...mockAppCfg,
        trees: [
          {
            ...mockAppCfg.trees[0],
            nodes: {
              ...mockAppCfg.trees[0].nodes,
              'node-1': {
                title: 'Root Node',
                resource: '',
                isRadio: false,
                children: ['node-2', 'node-3', 'node-missing'],
                order: 1
              },
              'node-missing': {
                title: 'Node with Missing Resource',
                resource: 'non-existent-layer',
                isRadio: false,
                children: [],
                order: 3
              }
            }
          }
        ]
      };

      const capabilities = service.generateCapabilities(
        'node-1',
        configWithMissingResource
      );
      const rootLayer = capabilities.Capability.Layer;

      // Should only include node-2 and node-3, not node-missing
      expect(rootLayer.Layer).toBeDefined();
      expect(rootLayer.Layer?.length).toBe(2); // Only node-2 and node-3

      // Verify node-missing is not in the tree
      const layerTitles = rootLayer.Layer?.map((l) => l.Title);
      expect(layerTitles).toContain('Folder Node'); // node-2
      expect(layerTitles).toContain('Leaf Node 1'); // node-3
      expect(layerTitles).not.toContain('Node with Missing Resource'); // node-missing should be excluded
    });

    it('should exclude leaf nodes without resource from capabilities', () => {
      const configWithLeafWithoutResource: AppCfg = {
        ...mockAppCfg,
        trees: [
          {
            ...mockAppCfg.trees[0],
            nodes: {
              ...mockAppCfg.trees[0].nodes,
              'node-1': {
                title: 'Root Node',
                resource: '',
                isRadio: false,
                children: ['node-2', 'node-3', 'node-no-resource'],
                order: 1
              },
              'node-no-resource': {
                title: 'Leaf Without Resource',
                resource: '',
                isRadio: false,
                children: [],
                order: 3
              }
            }
          }
        ]
      };

      const capabilities = service.generateCapabilities(
        'node-1',
        configWithLeafWithoutResource
      );
      const rootLayer = capabilities.Capability.Layer;

      // Should only include node-2 and node-3, not node-no-resource
      expect(rootLayer.Layer).toBeDefined();
      expect(rootLayer.Layer?.length).toBe(2);

      const layerTitles = rootLayer.Layer?.map((l) => l.Title);
      expect(layerTitles).toContain('Folder Node'); // node-2
      expect(layerTitles).toContain('Leaf Node 1'); // node-3
      expect(layerTitles).not.toContain('Leaf Without Resource'); // node-no-resource should be excluded
    });

    it('should exclude folder nodes without children from capabilities', () => {
      const configWithEmptyFolder: AppCfg = {
        ...mockAppCfg,
        trees: [
          {
            ...mockAppCfg.trees[0],
            nodes: {
              ...mockAppCfg.trees[0].nodes,
              'node-1': {
                title: 'Root Node',
                resource: '',
                isRadio: false,
                children: ['node-2', 'node-3', 'node-empty-folder'],
                order: 1
              },
              'node-empty-folder': {
                title: 'Empty Folder',
                resource: '',
                isRadio: false,
                children: [],
                order: 3
              }
            }
          }
        ]
      };

      const capabilities = service.generateCapabilities(
        'node-1',
        configWithEmptyFolder
      );
      const rootLayer = capabilities.Capability.Layer;

      // Should only include node-2 and node-3, not node-empty-folder
      expect(rootLayer.Layer).toBeDefined();
      expect(rootLayer.Layer?.length).toBe(2);

      const layerTitles = rootLayer.Layer?.map((l) => l.Title);
      expect(layerTitles).toContain('Folder Node'); // node-2
      expect(layerTitles).toContain('Leaf Node 1'); // node-3
      expect(layerTitles).not.toContain('Empty Folder'); // node-empty-folder should be excluded
    });

    it('should exclude folder nodes when all children are excluded', () => {
      const configWithFolderAllChildrenExcluded: AppCfg = {
        ...mockAppCfg,
        trees: [
          {
            ...mockAppCfg.trees[0],
            nodes: {
              ...mockAppCfg.trees[0].nodes,
              'node-1': {
                title: 'Root Node',
                resource: '',
                isRadio: false,
                children: ['node-2', 'node-3', 'node-folder-all-excluded'],
                order: 1
              },
              'node-folder-all-excluded': {
                title: 'Folder with All Children Excluded',
                resource: '',
                isRadio: false,
                children: ['node-missing-1', 'node-missing-2'],
                order: 3
              },
              'node-missing-1': {
                title: 'Missing Resource 1',
                resource: 'non-existent-layer-1',
                isRadio: false,
                children: [],
                order: 1
              },
              'node-missing-2': {
                title: 'Missing Resource 2',
                resource: 'non-existent-layer-2',
                isRadio: false,
                children: [],
                order: 2
              }
            }
          }
        ]
      };

      const capabilities = service.generateCapabilities(
        'node-1',
        configWithFolderAllChildrenExcluded
      );
      const rootLayer = capabilities.Capability.Layer;

      // Should only include node-2 and node-3, not node-folder-all-excluded (since all its children are excluded)
      expect(rootLayer.Layer).toBeDefined();
      expect(rootLayer.Layer?.length).toBe(2);

      const layerTitles = rootLayer.Layer?.map((l) => l.Title);
      expect(layerTitles).toContain('Folder Node'); // node-2
      expect(layerTitles).toContain('Leaf Node 1'); // node-3
      expect(layerTitles).not.toContain('Folder with All Children Excluded'); // node-folder-all-excluded should be excluded
    });

    it('should throw error when capabilities would have no content', () => {
      const configWithNoValidLayers: AppCfg = {
        ...mockAppCfg,
        trees: [
          {
            ...mockAppCfg.trees[0],
            nodes: {
              'node-empty-root': {
                title: 'Empty Root',
                resource: '',
                isRadio: false,
                children: ['node-missing-1', 'node-missing-2'],
                order: 1
              },
              'node-missing-1': {
                title: 'Missing Resource 1',
                resource: 'non-existent-layer-1',
                isRadio: false,
                children: [],
                order: 1
              },
              'node-missing-2': {
                title: 'Missing Resource 2',
                resource: 'non-existent-layer-2',
                isRadio: false,
                children: [],
                order: 2
              }
            }
          }
        ]
      };

      expect(() => {
        service.generateCapabilities(
          'node-empty-root',
          configWithNoValidLayers
        );
      }).toThrowError(/has no valid layers to include in capabilities/);
    });

    it('should throw error for leaf node without resource', () => {
      const configWithLeafNoResource: AppCfg = {
        ...mockAppCfg,
        trees: [
          {
            ...mockAppCfg.trees[0],
            nodes: {
              'node-no-resource': {
                title: 'Leaf Without Resource',
                resource: '',
                isRadio: false,
                children: [],
                order: 1
              }
            }
          }
        ]
      };

      expect(() => {
        service.generateCapabilities(
          'node-no-resource',
          configWithLeafNoResource
        );
      }).toThrowError(/has no valid layers to include in capabilities/);
    });
  });

  describe('isVirtualServiceUrl', () => {
    it('should return true for virtual URLs', () => {
      const url = 'virtual://sitmun-layer-catalog/node-1';
      expect(service.isVirtualServiceUrl(url)).toBe(true);
    });

    it('should return false for real URLs', () => {
      expect(service.isVirtualServiceUrl('http://example.com/wms')).toBe(false);
      expect(service.isVirtualServiceUrl('https://example.com/wms')).toBe(
        false
      );
    });

    it('should return false for undefined', () => {
      expect(service.isVirtualServiceUrl(undefined as any)).toBe(false);
    });

    it('should return false for null', () => {
      expect(service.isVirtualServiceUrl(null as any)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(service.isVirtualServiceUrl('')).toBe(false);
    });
  });

  describe('extractNodeIdFromUrl', () => {
    it('should extract node ID from virtual URL', () => {
      const url = 'virtual://sitmun-layer-catalog/node-123';
      const nodeId = service.extractNodeIdFromUrl(url);

      expect(nodeId).toBe('node-123');
    });

    it('should return null for non-virtual URL', () => {
      const nodeId = service.extractNodeIdFromUrl('http://example.com/wms');
      expect(nodeId).toBeNull();
    });

    it('should handle complex node IDs', () => {
      const url = 'virtual://sitmun-layer-catalog/node/12345/sublayer';
      const nodeId = service.extractNodeIdFromUrl(url);

      expect(nodeId).toBe('node/12345/sublayer');
    });
  });

  describe('findRealLayerConfig', () => {
    it('should find layer configuration for node', () => {
      const config = service.findRealLayerConfig('node-3', mockAppCfg);

      expect(config).toBeDefined();
      expect(config?.url).toBe('http://example.com/wms');
      expect(config?.type).toBe('WMS');
      expect(config?.layerNames).toEqual(['wms-layer-1']);
    });

    it('should return null for node without resource', () => {
      const config = service.findRealLayerConfig('node-1', mockAppCfg);
      expect(config).toBeNull();
    });

    it('should return null for non-existent node', () => {
      const config = service.findRealLayerConfig('non-existent', mockAppCfg);
      expect(config).toBeNull();
    });

    it('should handle node in different tree', () => {
      // Add second tree
      const multiTreeConfig: AppCfg = {
        ...mockAppCfg,
        trees: [
          ...mockAppCfg.trees,
          {
            id: 'tree-2',
            title: 'Tree 2',
            image: null,
            rootNode: 'node-100',
            nodes: {
              'node-100': {
                title: 'Node in Tree 2',
                resource: 'layer-2',
                isRadio: false,
                children: [],
                order: 1
              }
            }
          }
        ]
      };

      const config = service.findRealLayerConfig('node-100', multiTreeConfig);

      expect(config).toBeDefined();
      expect(config?.layerNames).toEqual(['wms-layer-2']);
    });

    it('should return null if layer not found', () => {
      const configWithMissingLayer: AppCfg = {
        ...mockAppCfg,
        trees: [
          {
            ...mockAppCfg.trees[0],
            nodes: {
              ...mockAppCfg.trees[0].nodes,
              'node-orphan': {
                title: 'Orphan',
                resource: 'non-existent-layer',
                isRadio: false,
                children: [],
                order: 1
              }
            }
          }
        ]
      };

      const config = service.findRealLayerConfig(
        'node-orphan',
        configWithMissingLayer
      );
      expect(config).toBeNull();
    });
  });

  describe('findNodeIdFromLayerProperties', () => {
    it('should find nodeId from layer properties with array layerNames', () => {
      const nodeId = service.findNodeIdFromLayerProperties(
        'http://example.com/wms',
        'WMS',
        ['wms-layer-1'],
        mockAppCfg
      );

      expect(nodeId).toBe('node-3');
    });

    it('should find nodeId from layer properties with string layerNames', () => {
      const nodeId = service.findNodeIdFromLayerProperties(
        'http://example.com/wms',
        'WMS',
        'wms-layer-1',
        mockAppCfg
      );

      expect(nodeId).toBe('node-3');
    });

    it('should find nodeId with comma-separated string layerNames', () => {
      const nodeId = service.findNodeIdFromLayerProperties(
        'http://example.com/wms',
        'WMS',
        'wms-layer-1, wms-layer-2',
        mockAppCfg
      );

      expect(nodeId).toBe('node-3');
    });

    it('should use set-based comparison (order independent)', () => {
      // Test with layerNames in different order
      const nodeId1 = service.findNodeIdFromLayerProperties(
        'http://example.com/wms',
        'WMS',
        ['wms-layer-1', 'wms-layer-2'],
        mockAppCfg
      );

      const nodeId2 = service.findNodeIdFromLayerProperties(
        'http://example.com/wms',
        'WMS',
        ['wms-layer-2', 'wms-layer-1'],
        mockAppCfg
      );

      expect(nodeId1).toBe('node-3');
      expect(nodeId2).toBe('node-3');
      expect(nodeId1).toBe(nodeId2);
    });

    it('should return null for wrong URL', () => {
      const nodeId = service.findNodeIdFromLayerProperties(
        'http://wrong-url.com/wms',
        'WMS',
        ['wms-layer-1'],
        mockAppCfg
      );

      expect(nodeId).toBeNull();
    });

    it('should return null for wrong type', () => {
      const nodeId = service.findNodeIdFromLayerProperties(
        'http://example.com/wms',
        'WMTS',
        ['wms-layer-1'],
        mockAppCfg
      );

      expect(nodeId).toBeNull();
    });

    it('should return null for wrong layerNames', () => {
      const nodeId = service.findNodeIdFromLayerProperties(
        'http://example.com/wms',
        'WMS',
        ['wrong-layer'],
        mockAppCfg
      );

      expect(nodeId).toBeNull();
    });

    it('should return null for empty layerNames', () => {
      const nodeId = service.findNodeIdFromLayerProperties(
        'http://example.com/wms',
        'WMS',
        [],
        mockAppCfg
      );

      expect(nodeId).toBeNull();
    });

    it('should return null for empty string layerNames', () => {
      const nodeId = service.findNodeIdFromLayerProperties(
        'http://example.com/wms',
        'WMS',
        '',
        mockAppCfg
      );

      expect(nodeId).toBeNull();
    });

    it('should handle multiple layers with same service but different layerNames', () => {
      // Create a config with multiple layers using the same service
      const multiLayerConfig: AppCfg = {
        ...mockAppCfg,
        layers: [
          ...mockAppCfg.layers,
          {
            id: 'layer-4',
            title: 'Layer 4',
            layers: ['wms-layer-3'],
            service: 'service-1'
          }
        ],
        trees: [
          {
            id: 'tree-1',
            title: 'Tree 1',
            image: null,
            rootNode: 'node-1',
            nodes: {
              'node-1': {
                title: 'Root Node',
                resource: null,
                isRadio: false,
                children: ['node-3', 'node-4'],
                order: 1
              },
              'node-3': {
                title: 'Leaf Node 1',
                resource: 'layer-1',
                isRadio: false,
                children: [],
                order: 1
              },
              'node-4': {
                title: 'Leaf Node 2',
                resource: 'layer-4',
                isRadio: false,
                children: [],
                order: 2
              }
            }
          }
        ]
      };

      // Should find node-3 for layer-1's layerNames
      const nodeId1 = service.findNodeIdFromLayerProperties(
        'http://example.com/wms',
        'WMS',
        ['wms-layer-1'],
        multiLayerConfig
      );
      expect(nodeId1).toBe('node-3');

      // Should find node-4 for layer-4's layerNames
      const nodeId2 = service.findNodeIdFromLayerProperties(
        'http://example.com/wms',
        'WMS',
        ['wms-layer-3'],
        multiLayerConfig
      );
      expect(nodeId2).toBe('node-4');
    });

    it('should return null if service not found', () => {
      const configWithMissingService: AppCfg = {
        ...mockAppCfg,
        services: [] // Empty services
      };

      const config = service.findRealLayerConfig(
        'node-3',
        configWithMissingService
      );
      expect(config).toBeNull();
    });
  });

  describe('CRS handling', () => {
    it('should use service SRS from parameters', () => {
      const capabilities = service.generateCapabilities('node-3', mockAppCfg);
      const rootLayer = capabilities.Capability.Layer;

      expect(rootLayer.CRS).toContain('EPSG:25831');
    });

    it('should fall back to application SRS', () => {
      const configWithoutServiceSRS: AppCfg = {
        ...mockAppCfg,
        services: [
          {
            id: 'service-1',
            url: 'http://example.com/wms',
            type: 'WMS',
            parameters: {} // No SRS
          }
        ]
      };

      const capabilities = service.generateCapabilities(
        'node-3',
        configWithoutServiceSRS
      );
      const rootLayer = capabilities.Capability.Layer;

      expect(rootLayer.CRS).toContain('EPSG:25831'); // From application
    });

    it('should aggregate CRS from children', () => {
      const configWithMultipleCRS: AppCfg = {
        ...mockAppCfg,
        services: [
          {
            id: 'service-1',
            url: 'http://example.com/wms1',
            type: 'WMS',
            parameters: { SRS: 'EPSG:25831' }
          },
          {
            id: 'service-2',
            url: 'http://example.com/wms2',
            type: 'WMS',
            parameters: { SRS: 'EPSG:4326' }
          }
        ],
        layers: [
          ...mockAppCfg.layers,
          {
            id: 'layer-3',
            title: 'Layer 3',
            layers: ['wms-layer-3'],
            service: 'service-2'
          }
        ],
        trees: [
          {
            ...mockAppCfg.trees[0],
            nodes: {
              ...mockAppCfg.trees[0].nodes,
              'node-1': {
                title: 'Root',
                resource: '',
                isRadio: false,
                children: ['node-3', 'node-5'],
                order: 1
              },
              'node-5': {
                title: 'Leaf 3',
                resource: 'layer-3',
                isRadio: false,
                children: [],
                order: 3
              }
            }
          }
        ]
      };

      const capabilities = service.generateCapabilities(
        'node-1',
        configWithMultipleCRS
      );
      const rootLayer = capabilities.Capability.Layer;

      expect(rootLayer.CRS).toContain('EPSG:25831');
      expect(rootLayer.CRS).toContain('EPSG:4326');
    });
  });

  describe('layer ordering', () => {
    it('should order layers by order property', () => {
      const capabilities = service.generateCapabilities('node-1', mockAppCfg);
      const children = capabilities.Capability.Layer.Layer;
      expect(children).toBeDefined();

      // node-2 has order 1, node-3 has order 2
      expect(children[0].Title).toBe('Folder Node');
      expect(children[1].Title).toBe('Leaf Node 1');
    });
  });

  describe('edge cases', () => {
    it('should handle empty tree', () => {
      const emptyTreeConfig: AppCfg = {
        ...mockAppCfg,
        trees: []
      };

      expect(() => {
        service.generateCapabilities('node-1', emptyTreeConfig);
      }).toThrow();
    });

    it('should handle node with no title', () => {
      const configWithNoTitle: AppCfg = {
        ...mockAppCfg,
        trees: [
          {
            ...mockAppCfg.trees[0],
            nodes: {
              'node-no-title': {
                title: '',
                resource: 'layer-1',
                isRadio: false,
                children: [],
                order: 1
              }
            }
          }
        ]
      };

      const capabilities = service.generateCapabilities(
        'node-no-title',
        configWithNoTitle
      );
      expect(capabilities.Capability.Layer.Title).toBe('Untitled Layer');
    });

    it('should handle deeply nested hierarchy', () => {
      const deepConfig: AppCfg = {
        ...mockAppCfg,
        trees: [
          {
            id: 'deep-tree',
            title: 'Deep Tree',
            image: null,
            rootNode: 'level-1',
            nodes: {
              'level-1': {
                title: 'Level 1',
                resource: '',
                isRadio: false,
                children: ['level-2'],
                order: 1
              },
              'level-2': {
                title: 'Level 2',
                resource: '',
                isRadio: false,
                children: ['level-3'],
                order: 1
              },
              'level-3': {
                title: 'Level 3',
                resource: '',
                isRadio: false,
                children: ['level-4'],
                order: 1
              },
              'level-4': {
                title: 'Level 4 Leaf',
                resource: 'layer-1',
                isRadio: false,
                children: [],
                order: 1
              }
            }
          }
        ]
      };

      const capabilities = service.generateCapabilities('level-1', deepConfig);
      expect(capabilities.Capability.Layer).toBeDefined();

      // Navigate to deepest level
      let current = capabilities.Capability.Layer;
      expect(current.Title).toBe('Level 1');
      expect(current.Layer).toBeDefined();

      if (current.Layer && current.Layer.length > 0) {
        current = current.Layer[0];
      } else {
        fail('Expected Layer array to have at least one element');
      }
      expect(current.Title).toBe('Level 2');
    });
  });

  describe('searchSubLayers compatibility', () => {
    it('should generate capabilities with Title for search functionality', () => {
      const capabilities = service.generateCapabilities('node-1', mockAppCfg);
      const rootLayer = capabilities.Capability.Layer;

      // Root layer should have Title
      expect(rootLayer.Title).toBe('Root Node');

      // Child layers should have Title
      expect(rootLayer.Layer).toBeDefined();
      if (rootLayer.Layer && rootLayer.Layer.length > 0) {
        rootLayer.Layer.forEach((layer) => {
          expect(layer.Title).toBeDefined();
          expect(typeof layer.Title).toBe('string');
        });
      }
    });

    it('should generate capabilities with Abstract for leaf nodes', () => {
      const capabilities = service.generateCapabilities('node-1', mockAppCfg);
      const rootLayer = capabilities.Capability.Layer;

      // Find leaf nodes (nodes with Name property)
      const findLeafNodes = (layer: any): any[] => {
        const leaves: any[] = [];
        if (layer.Name) {
          leaves.push(layer);
        }
        if (layer.Layer) {
          layer.Layer.forEach((child: any) => {
            leaves.push(...findLeafNodes(child));
          });
        }
        return leaves;
      };

      const leafNodes = findLeafNodes(rootLayer);
      expect(leafNodes.length).toBeGreaterThan(0);

      // Leaf nodes should have Abstract (even if empty initially)
      leafNodes.forEach((leaf) => {
        expect(leaf.Abstract).toBeDefined();
        expect(typeof leaf.Abstract).toBe('string');
      });
    });

    it('should generate capabilities searchable by Title', () => {
      const capabilities = service.generateCapabilities('node-1', mockAppCfg);
      const rootLayer = capabilities.Capability.Layer;

      // Verify that layers have searchable Title fields
      const allLayers: any[] = [];
      const collectLayers = (layer: any): void => {
        allLayers.push(layer);
        if (layer.Layer) {
          layer.Layer.forEach((child: any) => collectLayers(child));
        }
      };
      collectLayers(rootLayer);

      // All layers should have Title for search
      allLayers.forEach((layer) => {
        expect(layer.Title).toBeDefined();
        expect(layer.Title.length).toBeGreaterThan(0);
      });

      // Verify specific titles are present
      const titles = allLayers.map((l) => l.Title);
      expect(titles).toContain('Root Node');
      expect(titles).toContain('Folder Node');
      expect(titles).toContain('Leaf Node 1');
      expect(titles).toContain('Leaf Node 2');
    });
  });
});
