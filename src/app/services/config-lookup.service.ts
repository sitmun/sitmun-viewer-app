import { Injectable } from '@angular/core';

import {
  AppCfg,
  AppLayer,
  AppService,
  AppGroup,
  AppTree,
  AppNodeInfo
} from '@api/model/app-cfg';

/**
 * Service for cached lookups of layers, services, and groups from AppCfg.
 *
 * Eliminates repeated array.find() operations with O(1) Map-based lookups.
 * Must be initialized with AppCfg before use.
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigLookupService {
  private layersCache = new Map<string, AppLayer>();
  private servicesCache = new Map<string, AppService>();
  private groupsCache = new Map<string, AppGroup>();
  private treesCache = new Map<string, AppTree>();
  private nodesCache = new Map<string, AppNodeInfo>();
  private isInitialized = false;

  /**
   * Initialize the service with application configuration.
   * Builds internal caches for fast lookups.
   *
   * @param apiConfig - The application configuration
   */
  initialize(apiConfig: AppCfg): void {
    this.clear();

    if (apiConfig.layers) {
      apiConfig.layers.forEach((layer) => {
        this.layersCache.set(layer.id, layer);
      });
    }

    if (apiConfig.services) {
      apiConfig.services.forEach((service) => {
        this.servicesCache.set(service.id, service);
      });
    }

    if (apiConfig.groups) {
      apiConfig.groups.forEach((group) => {
        if (group.id) {
          this.groupsCache.set(group.id, group);
        }
      });
    }

    if (apiConfig.trees) {
      apiConfig.trees.forEach((tree) => {
        this.treesCache.set(tree.id, tree);
        // Index all nodes from the nodes object
        const nodesEntries = Object.entries(tree.nodes) as [
          string,
          AppNodeInfo
        ][];
        nodesEntries.forEach(([nodeId, nodeInfo]) => {
          this.nodesCache.set(nodeId, nodeInfo);
        });
      });
    }

    this.isInitialized = true;
  }

  /**
   * Find a layer by ID.
   *
   * @param id - Layer ID
   * @returns The layer, or undefined if not found
   */
  findLayer(id: string): AppLayer | undefined {
    return this.layersCache.get(id);
  }

  /**
   * Find a service by ID.
   *
   * @param id - Service ID
   * @returns The service, or undefined if not found
   */
  findService(id: string): AppService | undefined {
    return this.servicesCache.get(id);
  }

  /**
   * Find a group by ID.
   *
   * @param id - Group ID
   * @returns The group, or undefined if not found
   */
  findGroup(id: string): AppGroup | undefined {
    return this.groupsCache.get(id);
  }

  /**
   * Get all cached layers.
   *
   * @returns Array of all layers
   */
  getAllLayers(): AppLayer[] {
    return Array.from(this.layersCache.values());
  }

  /**
   * Get all cached services.
   *
   * @returns Array of all services
   */
  getAllServices(): AppService[] {
    return Array.from(this.servicesCache.values());
  }

  /**
   * Get all cached groups.
   *
   * @returns Array of all groups
   */
  getAllGroups(): AppGroup[] {
    return Array.from(this.groupsCache.values());
  }

  /**
   * Check if service is initialized.
   *
   * @returns true if initialized, false otherwise
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Clear all caches and reset initialization state.
   */
  clear(): void {
    this.layersCache.clear();
    this.servicesCache.clear();
    this.groupsCache.clear();
    this.treesCache.clear();
    this.nodesCache.clear();
    this.isInitialized = false;
  }

  /**
   * Find a tree by its root node ID.
   *
   * @param id - Root node ID
   * @returns The tree, or undefined if not found
   */
  findTree(id: string): AppTree | undefined {
    return this.treesCache.get(id);
  }

  /**
   * Find a node by its ID.
   *
   * @param id - Node ID
   * @returns The node, or undefined if not found
   */
  findNode(id: string): AppNodeInfo | undefined {
    return this.nodesCache.get(id);
  }

  /**
   * Find the tree containing a specific node.
   *
   * @param nodeId - Node ID to search for
   * @returns The tree containing the node, or undefined if not found
   */
  findTreeContainingNode(nodeId: string): AppTree | undefined {
    for (const tree of this.treesCache.values()) {
      if (tree.nodes[nodeId]) {
        return tree;
      }
    }
    return undefined;
  }

  /**
   * Get all trees.
   *
   * @returns Array of all trees
   */
  getAllTrees(): AppTree[] {
    return Array.from(this.treesCache.values());
  }
}
