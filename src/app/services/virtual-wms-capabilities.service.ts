import { Injectable } from '@angular/core';
import { AppCfg, AppLayer, AppNodeInfo, AppService, AppTree } from '@api/model/app-cfg';
import { WMSCapabilities, WMSCapability, WMSService, WMSLayer } from '../types/wms-capabilities';

/**
 * Type definition for real layer configuration returned by findRealLayerConfig.
 * Ensures url and type are always strings, even if the API returns them as objects.
 */
export interface RealLayerConfig {
  url: string;
  type: string;
  layerNames: string[];
}

/**
 * Type guard to ensure a value is a string (handles cases where API returns objects).
 */
function ensureString(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (value == null) {
    return '';
  }
  return String(value);
}

/**
 * Service for generating virtual WMS GetCapabilities responses from SITMUN AppCfg.
 * Creates WMS capabilities documents that represent SITMUN tree structures as WMS layer hierarchies.
 *
 * This enables standard SITNA controls (like layerCatalog) to work with SITMUN's tree-based
 * configuration without requiring custom Silme extensions.
 */
@Injectable({
  providedIn: 'root',
})
export class VirtualWmsCapabilitiesService {

  /**
   * Base URL for virtual WMS services
   */
  private static readonly VIRTUAL_BASE_URL = 'virtual://sitmun-layer-catalog/';

  /**
   * Generate complete WMS GetCapabilities response for a specific SITMUN tree node.
   * Creates a virtual WMS service that represents the subtree starting from the given node.
   *
   * @param nodeId - The node ID to generate capabilities for (e.g., "node/12338")
   * @param apiConfig - The complete SITMUN AppCfg configuration
   * @returns WMS GetCapabilities response representing the node's subtree
   */
  generateCapabilities(nodeId: string, apiConfig: AppCfg): WMSCapabilities {
    console.info(`[VirtualWmsCapabilities] Generating capabilities for node: ${nodeId}`);

    // Find the tree and node
    const tree = this.findTreeContainingNode(nodeId, apiConfig);
    if (!tree) {
      console.error(`[VirtualWmsCapabilities] No tree found containing node: ${nodeId}`);
      throw new Error(`Node ${nodeId} not found in any tree`);
    }

    const node = tree.nodes[nodeId];
    if (!node) {
      console.error(`[VirtualWmsCapabilities] Node ${nodeId} not found in tree ${tree.id}`);
      throw new Error(`Node ${nodeId} not found`);
    }

    // Get application default CRS
    const defaultCRS = apiConfig.application.srs || 'EPSG:25831';

    // Build the layer tree from this node
    const rootLayer = this.buildLayerTree(nodeId, node, tree, apiConfig, defaultCRS);

    // Check if there are any layers in the tree
    const layerCount = this.countLayers(rootLayer);
    if (layerCount === 0) {
      console.error(`[VirtualWmsCapabilities] Node ${nodeId} has no valid layers, cannot create capabilities`);
      throw new Error(`Node ${nodeId} has no valid layers to include in capabilities`);
    }

    // Create service metadata
    const service: WMSService = this.createServiceMetadata(node, apiConfig);

    // Create capability section
    const capability: WMSCapability = this.createCapability(nodeId, rootLayer);

    const capabilities: WMSCapabilities = {
      version: '1.3.0',
      Service: service,
      Capability: capability,
    };

    console.info(
      `[VirtualWmsCapabilities] Generated capabilities for ${nodeId} with ${layerCount} layers`
    );

    return capabilities;
  }

  /**
   * Check if a URL is a virtual WMS service URL
   */
  isVirtualServiceUrl(url: string): boolean {
    return url?.startsWith(VirtualWmsCapabilitiesService.VIRTUAL_BASE_URL) || false;
  }

  /**
   * Extract node ID from virtual service URL
   */
  extractNodeIdFromUrl(url: string): string | null {
    if (!this.isVirtualServiceUrl(url)) {
      return null;
    }
    return url.substring(VirtualWmsCapabilitiesService.VIRTUAL_BASE_URL.length);
  }

  /**
   * Generate a virtual WMS service URL for a given node ID
   * 
   * @param nodeId - The node ID (e.g., "node/12338")
   * @returns Virtual URL (e.g., "virtual://sitmun-layer-catalog/node/12338")
   */
  generateVirtualUrl(nodeId: string): string {
    return `${VirtualWmsCapabilitiesService.VIRTUAL_BASE_URL}${nodeId}`;
  }

  /**
   * Check if a node can generate valid capabilities (has at least one valid layer).
   * This is used to filter out nodes that would produce empty capabilities.
   * 
   * @param nodeId - The node ID to check (e.g., "node/12338")
   * @param apiConfig - The complete SITMUN AppCfg configuration
   * @returns true if the node can generate valid capabilities, false otherwise
   */
  canGenerateCapabilities(nodeId: string, apiConfig: AppCfg): boolean {
    try {
      // Find the tree and node
      const tree = this.findTreeContainingNode(nodeId, apiConfig);
      if (!tree) {
        return false;
      }

      const node = tree.nodes[nodeId];
      if (!node) {
        return false;
      }

      // Get application default CRS
      const defaultCRS = apiConfig.application.srs;

      // Build the layer tree from this node
      const rootLayer = this.buildLayerTree(nodeId, node, tree, apiConfig, defaultCRS);

      // Check if there are any layers in the tree
      const layerCount = this.countLayers(rootLayer);
      return layerCount > 0;
    } catch (error) {
      // If any error occurs, the node cannot generate valid capabilities
      return false;
    }
  }

  /**
   * Find the real layer configuration from AppCfg for a given node ID.
   * Resolves a virtual layer node to its actual WMS service configuration.
   *
   * @param nodeId - The node ID to resolve (e.g., "node/12338")
   * @param apiConfig - The complete SITMUN AppCfg configuration
   * @returns Layer configuration with URL, type, and layer names, or null if not found
   */
  findRealLayerConfig(
    nodeId: string,
    apiConfig: AppCfg
  ): RealLayerConfig | null {
    // Step 1: Find the node in tree.nodes using nodeId as dictionary key
    for (const tree of apiConfig.trees) {
      const node = tree.nodes[nodeId]; // Direct dictionary lookup

      if (!node) {
        continue; // Node not found in this tree, try next tree
      }

      // Step 2: Get the resource (layer ID) from the node
      const layerResourceId = node.resource;
      if (!layerResourceId) {
        console.warn(`[VirtualWmsCapabilities] Node ${nodeId} has no resource property`);
        continue;
      }

      // Step 3: Find the layer using the resource ID
      const layer = apiConfig.layers.find((l) => l.id === layerResourceId);
      if (!layer) {
        console.warn(`[VirtualWmsCapabilities] Layer ${layerResourceId} not found for node ${nodeId}`);
        continue;
      }

      // Step 4: Find the service using the layer's service ID
      const service = apiConfig.services.find((s) => s.id === layer.service);
      if (!service) {
        console.warn(`[VirtualWmsCapabilities] Service ${layer.service} not found for layer ${layerResourceId}`);
        continue;
      }

      // Step 5 & 6: Return the service URL, type, and layer names
      // Use type guard to ensure url and type are strings (they might be objects at runtime)
      return {
        url: ensureString(service.url),
        type: ensureString(service.type),
        layerNames: layer.layers, // Array of WMS layer names from the layer
      };
    }

    // Node not found in any tree
    console.warn(`[VirtualWmsCapabilities] Node ${nodeId} not found in any tree`);
    return null;
  }

  /**
   * Reverse lookup: Find nodeId from layer properties (url, type, layerNames).
   * This is the inverse of findRealLayerConfig.
   * 
   * @param url - Service URL
   * @param type - Service type (e.g., "WMS")
   * @param layerNames - Array of layer names or comma-separated string
   * @param apiConfig - The complete SITMUN AppCfg configuration
   * @returns nodeId if found, null otherwise
   */
  findNodeIdFromLayerProperties(
    url: string,
    type: string,
    layerNames: string | string[],
    apiConfig: AppCfg
  ): string | null {
    // Normalize layerNames to array
    const normalizedLayerNames = Array.isArray(layerNames) 
      ? layerNames 
      : layerNames.split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    // Return null if no layer names provided
    if (normalizedLayerNames.length === 0) {
      return null;
    }
    
    // Convert to Set for order-independent comparison
    const layerNamesSet = new Set(normalizedLayerNames);
    
    // Step 1: Find service matching URL and type
    // Use type guard to ensure service.url and service.type are strings for comparison
    const normalizedUrl = ensureString(url);
    const normalizedType = ensureString(type);
    const service = apiConfig.services.find(s => 
      ensureString(s.url) === normalizedUrl && ensureString(s.type) === normalizedType
    );
    
    if (!service) {
      return null;
    }
    
    // Step 2: Find layer using that service with matching layerNames
    const layer = apiConfig.layers.find(l => {
      if (l.service !== service.id) {
        return false;
      }
      
      // Compare layerNames as sets (order independent)
      const layerLayersSet = new Set(l.layers);
      if (layerLayersSet.size !== layerNamesSet.size) {
        return false;
      }
      
      // Check if all elements match
      for (const name of layerNamesSet) {
        if (!layerLayersSet.has(name)) {
          return false;
        }
      }
      
      return true;
    });
    
    if (!layer) {
      return null;
    }
    
    // Step 3: Find node that has this layer as its resource
    for (const tree of apiConfig.trees) {
      for (const [nodeId, node] of Object.entries(tree.nodes)) {
        const nodeInfo = node as AppNodeInfo;
        if (nodeInfo.resource === layer.id) {
          return nodeId;
        }
      }
    }
    
    return null;
  }

  /**
   * Find which tree contains the given node
   */
  private findTreeContainingNode(nodeId: string, apiConfig: AppCfg): AppTree | null {
    for (const tree of apiConfig.trees) {
      if (tree.nodes && tree.nodes[nodeId]) {
        return tree;
      }
    }
    return null;
  }

  /**
   * Create WMS Service metadata from node and application info
   */
  private createServiceMetadata(node: AppNodeInfo, apiConfig: AppCfg): WMSService {
    return {
      Name: 'WMS',
      Title: node.title || 'Virtual WMS Service',
      Abstract: `Virtual WMS service generated from SITMUN tree structure for: ${node.title}`,
      KeywordList: {
        Keyword: ['SITMUN', 'Virtual', 'Generated'],
      },
      OnlineResource: {
        'xlink:href': 'virtual://sitmun-layer-catalog/',
      },
      Fees: 'none',
      AccessConstraints: 'none',
    };
  }

  /**
   * Create WMS Capability section with standard WMS requests
   */
  private createCapability(nodeId: string, rootLayer: WMSLayer): WMSCapability {
    const baseUrl = `${VirtualWmsCapabilitiesService.VIRTUAL_BASE_URL}${nodeId}`;

    return {
      Request: {
        GetCapabilities: {
          Format: ['text/xml'],
          DCPType: [
            {
              HTTP: {
                Get: {
                  OnlineResource: {
                    'xlink:href': baseUrl,
                  },
                },
              },
            },
          ],
        },
        GetMap: {
          Format: ['image/png', 'image/jpeg', 'image/gif'],
          DCPType: [
            {
              HTTP: {
                Get: {
                  OnlineResource: {
                    'xlink:href': baseUrl,
                  },
                },
              },
            },
          ],
        },
        GetFeatureInfo: {
          Format: ['text/html', 'text/plain', 'application/json'],
          DCPType: [
            {
              HTTP: {
                Get: {
                  OnlineResource: {
                    'xlink:href': baseUrl,
                  },
                },
              },
            },
          ],
        },
      },
      Exception: {
        Format: ['XML', 'INIMAGE', 'BLANK'],
      },
      Layer: rootLayer,
    };
  }

  /**
   * Build WMS Layer hierarchy from SITMUN node structure
   */
  private buildLayerTree(
    nodeId: string,
    node: AppNodeInfo,
    tree: AppTree,
    apiConfig: AppCfg,
    defaultCRS: string
  ): WMSLayer {
    // Root container layer (no Name property)
    const rootLayer: WMSLayer = {
      Title: node.title || 'Root Layer',
      CRS: [defaultCRS],
    };

    // If node has children, build hierarchy
    if (node.children && node.children.length > 0) {
      rootLayer.Layer = this.buildChildLayers(node.children, tree, apiConfig, defaultCRS);

      // Aggregate CRS from all children
      if (rootLayer.Layer.length > 0) {
        rootLayer.CRS = this.aggregateCRSFromChildren(rootLayer.Layer);
      }
    } else if (node.resource) {
      // Leaf node with resource - create a single layer entry
      const layer = this.convertNodeToLayer(nodeId, node, apiConfig, defaultCRS);
      if (layer) {
        rootLayer.Layer = [layer];
        rootLayer.CRS = layer.CRS;
      }
    }

    return rootLayer;
  }

  /**
   * Build array of child WMS layers from child node IDs
   */
  private buildChildLayers(
    childIds: string[],
    tree: AppTree,
    apiConfig: AppCfg,
    defaultCRS: string
  ): WMSLayer[] {
    const layers: WMSLayer[] = [];

    for (const childId of childIds) {
      const childNode = tree.nodes[childId];
      if (!childNode) {
        console.warn(`[VirtualWmsCapabilities] Child node ${childId} not found`);
        continue;
      }

      const layer = this.convertNodeToLayer(childId, childNode, apiConfig, defaultCRS);
      if (layer) {
        layers.push(layer);
      }
    }

    // Sort by order property
    layers.sort((a, b) => {
      const orderA = (a as WMSLayer & { _order?: number })._order ?? 999;
      const orderB = (b as WMSLayer & { _order?: number })._order ?? 999;
      return orderA - orderB;
    });

    // Remove temporary _order property
    layers.forEach((layer) => {
      delete (layer as WMSLayer & { _order?: number })._order;
    });

    return layers;
  }

  /**
   * Convert a SITMUN node to a WMS Layer definition
   */
  private convertNodeToLayer(
    nodeId: string,
    node: AppNodeInfo,
    apiConfig: AppCfg,
    defaultCRS: string
  ): WMSLayer | null {
    const layer: WMSLayer & { _order?: number } = {
      Title: node.title || 'Untitled Layer',
      _order: node.order ?? 999,
    };

    // If node has children, it's a folder/group (not a leaf - no Name property)
    if (node.children && node.children.length > 0) {
      // Find the tree to access child nodes
      const tree = this.findTreeContainingNode(nodeId, apiConfig);
      if (tree) {
        layer.Layer = this.buildChildLayers(node.children, tree, apiConfig, defaultCRS);

        // If no children were included (all were excluded), exclude this folder too
        if (layer.Layer.length === 0) {
          return null;
        }

        // Aggregate CRS from children
        layer.CRS = this.aggregateCRSFromChildren(layer.Layer);
      } else {
        // Tree not found, exclude node
        return null;
      }
    }
    // If node has resource, it's a leaf layer (set Name only for leaf nodes)
    else if (node.resource) {
      // Only set Name for leaf nodes
      layer.Name = nodeId;

      const appLayer = apiConfig.layers.find((l) => l.id === node.resource);
      if (appLayer) {
        // Add layer metadata
        // Abstract will be enriched from WMS capabilities in patchRasterGetInfo
        // For now, set to empty string - it will be populated from real WMS capabilities when available
        layer.Abstract = '';
        layer.queryable = true;

        // Get CRS from service
        const service = apiConfig.services.find((s) => s.id === appLayer.service);
        layer.CRS = this.getLayerCRS(appLayer, service, defaultCRS);
      } else {
        // Return null to exclude node from capabilities tree
        return null;
      }
    } else {
      // Node with no children and no resource - exclude from capabilities
      return null;
    }

    return layer;
  }

  /**
   * Get CRS for a layer from its service or use default
   */
  private getLayerCRS(
    layer: AppLayer,
    service: AppService | undefined,
    defaultCRS: string
  ): string[] {
    if (!service) {
      console.warn(`[VirtualWmsCapabilities] Service ${layer.service} not found, using default CRS`);
      return [defaultCRS];
    }

    // AppService doesn't have a crs property, so always use default
    // If CRS information is needed, it should come from the layer or be added to AppService interface
    return [defaultCRS];
  }

  /**
   * Aggregate CRS from multiple child layers (union of all CRS)
   */
  private aggregateCRSFromChildren(children: WMSLayer[]): string[] {
    const crsSet = new Set<string>();

    for (const child of children) {
      if (child.CRS) {
        child.CRS.forEach((crs: string) => crsSet.add(crs));
      }
    }

    // Return sorted array
    return Array.from(crsSet).sort();
  }

  /**
   * Count total number of layers in a layer tree
   */
  private countLayers(layer: WMSLayer): number {
    let count = layer.Name ? 1 : 0; // Count if it has a Name

    if (layer.Layer) {
      for (const child of layer.Layer) {
        count += this.countLayers(child);
      }
    }

    return count;
  }
}

