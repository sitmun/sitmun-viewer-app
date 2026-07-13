import { Injectable } from '@angular/core';

import { ConfigLookupService } from './config-lookup.service';

export type SelectionAction = 'add' | 'deselect' | 'skip';

export interface SelectionPrepareResult {
  action: SelectionAction;
  nodeId: string;
  resource: string | undefined;
  needsPhysicalAdd: boolean;
  releaseNodeIds: string[];
}

interface PendingReplacement {
  previousNodeIds: string[];
}

interface MapSelectionState {
  selectedNodes: Set<string>;
  nodeResources: Map<string, string>;
  resourceRefCount: Map<string, number>;
  radioGroupLocks: Map<string, Promise<void>>;
  pendingReplacements: Map<string, PendingReplacement>;
  selfCommitDepth: number;
}

@Injectable({
  providedIn: 'root'
})
export class CatalogLayerSelectionService {
  private readonly mapStates = new WeakMap<object, MapSelectionState>();
  private readonly mapsWithState = new Set<object>();

  clearMap(map: object): void {
    this.mapStates.delete(map);
    this.mapsWithState.delete(map);
  }

  clearPendingReplacement(map: object, nodeId: string): void {
    this.state(map).pendingReplacements.delete(nodeId);
  }

  clearAll(): void {
    for (const map of this.mapsWithState) {
      this.mapStates.delete(map);
    }
    this.mapsWithState.clear();
  }

  isNodeSelected(map: object, nodeId: string): boolean {
    return this.state(map).selectedNodes.has(nodeId);
  }

  getSelectedNodes(map: object): ReadonlySet<string> {
    return this.state(map).selectedNodes;
  }

  getResourceRefCount(map: object, resource: string): number {
    return this.state(map).resourceRefCount.get(resource) ?? 0;
  }

  resolveNodeId(layer: {
    options?: { nodeId?: string; [key: string]: unknown };
    nodeId?: string;
    url?: string;
    type?: string;
  }): string | undefined {
    return layer.options?.nodeId ?? layer.nodeId;
  }

  prepareSelection(
    map: object,
    nodeId: string,
    resource: string | undefined,
    configLookup: ConfigLookupService
  ): SelectionPrepareResult {
    const state = this.state(map);
    const radioParent = configLookup.getRadioGroupParent(nodeId);
    const releaseNodeIds: string[] = [];

    if (state.selectedNodes.has(nodeId)) {
      if (radioParent) {
        return {
          action: 'deselect',
          nodeId,
          resource,
          needsPhysicalAdd: false,
          releaseNodeIds: [nodeId]
        };
      }
      return {
        action: 'skip',
        nodeId,
        resource,
        needsPhysicalAdd: false,
        releaseNodeIds: []
      };
    }

    if (radioParent) {
      for (const siblingId of configLookup.getDirectChildIds(radioParent)) {
        if (siblingId !== nodeId && state.selectedNodes.has(siblingId)) {
          releaseNodeIds.push(siblingId);
        }
      }
      state.pendingReplacements.set(nodeId, {
        previousNodeIds: [...releaseNodeIds]
      });
    }

    const needsPhysicalAdd =
      !resource || this.getResourceRefCount(map, resource) === 0;

    return {
      action: 'add',
      nodeId,
      resource,
      needsPhysicalAdd,
      releaseNodeIds
    };
  }

  commitSelection(
    map: object,
    nodeId: string,
    resource: string | undefined,
    success: boolean
  ): { removeResources: string[] } {
    const state = this.state(map);
    const pending = state.pendingReplacements.get(nodeId);
    state.pendingReplacements.delete(nodeId);

    if (!success) {
      return { removeResources: [] };
    }

    state.selfCommitDepth++;
    try {
      if (resource) {
        this.addNodeClaim(state, nodeId, resource);
      } else {
        state.selectedNodes.add(nodeId);
      }

      const removeResources: string[] = [];
      for (const previousId of pending?.previousNodeIds ?? []) {
        const released = this.releaseNodeClaim(state, previousId);
        for (const releasedResource of released) {
          if (this.getResourceRefCount(map, releasedResource) === 0) {
            removeResources.push(releasedResource);
          }
        }
      }
      return { removeResources };
    } finally {
      state.selfCommitDepth--;
    }
  }

  deselectNode(
    map: object,
    nodeId: string
  ): { removeResources: string[] } {
    const state = this.state(map);
    const removeResources: string[] = [];
    for (const resource of this.releaseNodeClaim(state, nodeId)) {
      if (this.getResourceRefCount(map, resource) === 0) {
        removeResources.push(resource);
      }
    }
    return { removeResources };
  }

  registerExternalClaim(
    map: object,
    nodeId: string,
    resource: string | undefined,
    configLookup: ConfigLookupService
  ): { releaseNodeIds: string[]; removeResources: string[] } {
    const prepared = this.prepareSelection(map, nodeId, resource, configLookup);
    const state = this.state(map);

    if (prepared.action === 'deselect') {
      const removed = this.deselectNode(map, nodeId);
      return { releaseNodeIds: [nodeId], removeResources: removed.removeResources };
    }

    if (prepared.action === 'skip') {
      return { releaseNodeIds: [], removeResources: [] };
    }

    state.selfCommitDepth++;
    try {
      if (resource) {
        this.addNodeClaim(state, nodeId, resource);
      } else {
        state.selectedNodes.add(nodeId);
      }

      const removeResources: string[] = [];
      for (const previousId of prepared.releaseNodeIds) {
        for (const releasedResource of this.releaseNodeClaim(state, previousId)) {
          if (this.getResourceRefCount(map, releasedResource) === 0) {
            removeResources.push(releasedResource);
          }
        }
      }
      return {
        releaseNodeIds: prepared.releaseNodeIds,
        removeResources
      };
    } finally {
      state.pendingReplacements.delete(nodeId);
      state.selfCommitDepth--;
    }
  }

  clearClaimsForResource(map: object, resource: string): string[] {
    const state = this.state(map);
    const cleared: string[] = [];
    for (const [nodeId, nodeResource] of state.nodeResources.entries()) {
      if (nodeResource === resource) {
        cleared.push(nodeId);
      }
    }
    for (const nodeId of cleared) {
      this.releaseNodeClaim(state, nodeId);
    }
    for (const nodeId of [...state.selectedNodes]) {
      if (!state.nodeResources.has(nodeId)) {
        state.selectedNodes.delete(nodeId);
      }
    }
    return cleared;
  }

  isSelfCommit(map: object): boolean {
    return this.state(map).selfCommitDepth > 0;
  }

  async runWithSelfCommit<T>(
    map: object,
    operation: () => T | Promise<T>
  ): Promise<T> {
    const state = this.state(map);
    state.selfCommitDepth++;
    try {
      return await operation();
    } finally {
      state.selfCommitDepth--;
    }
  }

  async withRadioGroupLock<T>(
    map: object,
    groupId: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const state = this.state(map);
    const previous = state.radioGroupLocks.get(groupId) ?? Promise.resolve();
    let release!: () => void;
    const current = new Promise<void>((resolve) => {
      release = resolve;
    });
    const queued = previous.then(() => current);
    state.radioGroupLocks.set(groupId, queued);
    await previous;
    try {
      return await operation();
    } finally {
      release();
      if (state.radioGroupLocks.get(groupId) === queued) {
        state.radioGroupLocks.delete(groupId);
      }
    }
  }

  private state(map: object): MapSelectionState {
    let state = this.mapStates.get(map);
    if (!state) {
      state = {
        selectedNodes: new Set(),
        nodeResources: new Map(),
        resourceRefCount: new Map(),
        radioGroupLocks: new Map(),
        pendingReplacements: new Map(),
        selfCommitDepth: 0
      };
      this.mapStates.set(map, state);
    }
    this.mapsWithState.add(map);
    return state;
  }

  private addNodeClaim(
    state: MapSelectionState,
    nodeId: string,
    resource: string
  ): void {
    const previous = state.nodeResources.get(nodeId);
    if (previous === resource) {
      state.selectedNodes.add(nodeId);
      return;
    }
    if (previous) {
      this.decrementResource(state, previous);
    }
    state.selectedNodes.add(nodeId);
    state.nodeResources.set(nodeId, resource);
    state.resourceRefCount.set(
      resource,
      (state.resourceRefCount.get(resource) ?? 0) + 1
    );
  }

  private releaseNodeClaim(state: MapSelectionState, nodeId: string): string[] {
    const resource = state.nodeResources.get(nodeId);
    state.selectedNodes.delete(nodeId);
    state.nodeResources.delete(nodeId);
    state.pendingReplacements.delete(nodeId);
    if (!resource) {
      return [];
    }
    this.decrementResource(state, resource);
    return [resource];
  }

  private decrementResource(state: MapSelectionState, resource: string): void {
    const next = (state.resourceRefCount.get(resource) ?? 0) - 1;
    if (next <= 0) {
      state.resourceRefCount.delete(resource);
    } else {
      state.resourceRefCount.set(resource, next);
    }
  }
}
