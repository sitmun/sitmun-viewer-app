import { TestBed } from '@angular/core/testing';

import { AppCfg } from '@api/model/app-cfg';

import {
  CatalogLayerSelectionService,
  SelectionPrepareResult
} from './catalog-layer-selection.service';
import { ConfigLookupService } from './config-lookup.service';

describe('CatalogLayerSelectionService', () => {
  let service: CatalogLayerSelectionService;
  let configLookup: ConfigLookupService;
  const mapA = { id: 'map-a' };
  const mapB = { id: 'map-b' };

  const context: AppCfg = {
    application: {
      id: 1,
      title: 'Test',
      type: 'test',
      theme: 'default',
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
            children: ['node/radio', 'node/plain'],
            order: 0
          },
          'node/radio': {
            title: 'Radio folder',
            isRadio: true,
            children: ['node/a', 'node/b', 'node/cousin'],
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
          'node/cousin': {
            title: 'Cousin',
            resource: 'layer/cousin',
            isRadio: false,
            children: ['node/deep'],
            order: 3
          },
          'node/deep': {
            title: 'Deep',
            resource: 'layer/deep',
            isRadio: false,
            children: [],
            order: 1
          },
          'node/plain': {
            title: 'Plain',
            resource: 'layer/shared',
            isRadio: false,
            children: ['node/dup'],
            order: 2
          },
          'node/dup': {
            title: 'Dup',
            resource: 'layer/shared',
            isRadio: false,
            children: [],
            order: 1
          }
        }
      }
    ]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatalogLayerSelectionService);
    configLookup = TestBed.inject(ConfigLookupService);
    configLookup.initialize(context);
  });

  function prepare(
    map: object,
    nodeId: string,
    resource?: string
  ): SelectionPrepareResult {
    return service.prepareSelection(map, nodeId, resource, configLookup);
  }

  it('limits radio membership to direct children of radio folders', () => {
    expect(configLookup.getRadioGroupParent('node/a')).toBe('node/radio');
    expect(configLookup.getRadioGroupParent('node/deep')).toBeUndefined();
  });

  it('targets the first ordered direct child for folder activation', () => {
    expect(configLookup.getFirstRadioChildId('node/radio')).toBe('node/a');
  });

  it('replaces sibling claims and clears the group on second select', () => {
    service.commitSelection(mapA, 'node/a', 'layer/a', true);
    expect(service.isNodeSelected(mapA, 'node/a')).toBe(true);

    const prepared = prepare(mapA, 'node/b', 'layer/b');
    expect(prepared.action).toBe('add');
    expect(prepared.releaseNodeIds).toEqual(['node/a']);

    const removed = service.commitSelection(mapA, 'node/b', 'layer/b', true);
    expect(service.isNodeSelected(mapA, 'node/a')).toBe(false);
    expect(service.isNodeSelected(mapA, 'node/b')).toBe(true);
    expect(removed.removeResources).toEqual(['layer/a']);

    const deselect = prepare(mapA, 'node/b', 'layer/b');
    expect(deselect.action).toBe('deselect');
    service.deselectNode(mapA, 'node/b');
    expect(service.getSelectedNodes(mapA).size).toBe(0);
  });

  it('deduplicates physical requirements for one resource with multiple node claims', () => {
    const first = prepare(mapA, 'node/plain', 'layer/shared');
    expect(first.needsPhysicalAdd).toBe(true);
    service.commitSelection(mapA, 'node/plain', 'layer/shared', true);

    const second = prepare(mapA, 'node/dup', 'layer/shared');
    expect(second.needsPhysicalAdd).toBe(false);
    service.commitSelection(mapA, 'node/dup', 'layer/shared', true);

    expect(service.getResourceRefCount(mapA, 'layer/shared')).toBe(2);
    const released = service.deselectNode(mapA, 'node/plain');
    expect(released.removeResources).toEqual([]);
    expect(service.getResourceRefCount(mapA, 'layer/shared')).toBe(1);

    const finalRelease = service.deselectNode(mapA, 'node/dup');
    expect(finalRelease.removeResources).toEqual(['layer/shared']);
  });

  it('identifies explicit nodeId layers and ignores untagged layers', () => {
    expect(
      service.resolveNodeId({ options: { nodeId: 'node/a' } })
    ).toBe('node/a');
    expect(service.resolveNodeId({ nodeId: 'node/b' })).toBe('node/b');
    expect(
      service.resolveNodeId({
        url: 'https://example.test/wms',
        type: 'WMS',
        options: { layerNames: ['same'] }
      } as any)
    ).toBeUndefined();
  });

  it('keeps per-map state isolated', () => {
    service.commitSelection(mapA, 'node/a', 'layer/a', true);
    expect(service.isNodeSelected(mapA, 'node/a')).toBe(true);
    expect(service.isNodeSelected(mapB, 'node/a')).toBe(false);
  });

  it('serializes operations within a radio group', async () => {
    const order: string[] = [];
    await Promise.all([
      service.withRadioGroupLock(mapA, 'node/radio', async () => {
        order.push('a-start');
        await Promise.resolve();
        order.push('a-end');
      }),
      service.withRadioGroupLock(mapA, 'node/radio', async () => {
        order.push('b-start');
        order.push('b-end');
      })
    ]);
    expect(order).toEqual(['a-start', 'a-end', 'b-start', 'b-end']);
  });

  it('reports self-commit while runWithSelfCommit is active', async () => {
    expect(service.isSelfCommit(mapA)).toBe(false);
    await service.runWithSelfCommit(mapA, async () => {
      expect(service.isSelfCommit(mapA)).toBe(true);
    });
    expect(service.isSelfCommit(mapA)).toBe(false);
  });

  it('clears pending replacements when commitSelection fails', () => {
    prepare(mapA, 'node/b', 'layer/b');
    const removed = service.commitSelection(mapA, 'node/b', 'layer/b', false);
    expect(removed.removeResources).toEqual([]);
    expect(service.isNodeSelected(mapA, 'node/a')).toBe(false);
    expect(service.isNodeSelected(mapA, 'node/b')).toBe(false);
  });

  it('registerExternalClaim replaces radio siblings and returns removeResources', () => {
    service.commitSelection(mapA, 'node/a', 'layer/a', true);
    const result = service.registerExternalClaim(
      mapA,
      'node/b',
      'layer/b',
      configLookup
    );
    expect(result.releaseNodeIds).toEqual(['node/a']);
    expect(result.removeResources).toEqual(['layer/a']);
    expect(service.isNodeSelected(mapA, 'node/a')).toBe(false);
    expect(service.isNodeSelected(mapA, 'node/b')).toBe(true);
  });

  it('registerExternalClaim serializes concurrent radio siblings', async () => {
    const order: string[] = [];
    await Promise.all([
      service.withRadioGroupLock(mapA, 'node/radio', async () => {
        order.push('a-start');
        service.registerExternalClaim(mapA, 'node/a', 'layer/a', configLookup);
        await Promise.resolve();
        order.push('a-end');
      }),
      service.withRadioGroupLock(mapA, 'node/radio', async () => {
        order.push('b-start');
        service.registerExternalClaim(mapA, 'node/b', 'layer/b', configLookup);
        order.push('b-end');
      })
    ]);
    expect(order).toEqual(['a-start', 'a-end', 'b-start', 'b-end']);
    expect(service.isNodeSelected(mapA, 'node/b')).toBe(true);
    expect(service.isNodeSelected(mapA, 'node/a')).toBe(false);
  });

  it('clearClaimsForResource removes all node claims for a resource', () => {
    service.commitSelection(mapA, 'node/plain', 'layer/shared', true);
    service.commitSelection(mapA, 'node/dup', 'layer/shared', true);
    const cleared = service.clearClaimsForResource(mapA, 'layer/shared');
    expect(cleared.sort()).toEqual(['node/dup', 'node/plain'].sort());
    expect(service.getResourceRefCount(mapA, 'layer/shared')).toBe(0);
  });

  it('registerExternalClaim clears pending replacement state', () => {
    service.commitSelection(mapA, 'node/a', 'layer/a', true);
    prepare(mapA, 'node/b', 'layer/b');
    service.registerExternalClaim(mapA, 'node/b', 'layer/b', configLookup);
    const pending = (service as any).state(mapA).pendingReplacements as Map<
      string,
      unknown
    >;
    expect(pending.size).toBe(0);
  });

  describe('folder load state and exclusive gate', () => {
    it('folderLoadState returns none partial all', () => {
      const all = ['node/a', 'node/b', 'node/cousin'];
      expect(service.folderLoadState([], all)).toBe('none');
      expect(service.folderLoadState(['node/a'], all)).toBe('partial');
      expect(service.folderLoadState(all, all)).toBe('all');
    });

    it('shouldUnloadFolder is true for partial and all', () => {
      expect(service.shouldUnloadFolder('none')).toBe(false);
      expect(service.shouldUnloadFolder('partial')).toBe(true);
      expect(service.shouldUnloadFolder('all')).toBe(true);
    });

    it('runExclusive runs two async ops in order', async () => {
      const order: string[] = [];
      await Promise.all([
        service.runExclusive(mapA, async () => {
          order.push('a-start');
          await Promise.resolve();
          order.push('a-end');
        }),
        service.runExclusive(mapA, async () => {
          order.push('b-start');
          order.push('b-end');
        })
      ]);
      expect(order).toEqual(['a-start', 'a-end', 'b-start', 'b-end']);
    });

    it('runExclusive nested reentrant call completes', async () => {
      const order: string[] = [];
      await service.runExclusive(mapA, async () => {
        order.push('outer-start');
        await service.runExclusive(mapA, async () => {
          order.push('inner');
        });
        order.push('outer-end');
      });
      expect(order).toEqual(['outer-start', 'inner', 'outer-end']);
    });

    it('endPending clears when beginPending then throw inside exclusive', async () => {
      await expect(
        service.runExclusive(mapA, async () => {
          service.beginPending(mapA, ['node/a', 'node/b']);
          expect(service.isPending(mapA, 'node/a')).toBe(true);
          expect(service.isAnyPending(mapA, ['node/a', 'node/b'])).toBe(true);
          try {
            throw new Error('boom');
          } finally {
            service.endPending(mapA, ['node/a', 'node/b']);
          }
        })
      ).rejects.toThrow('boom');
      expect(service.isPending(mapA, 'node/a')).toBe(false);
      expect(service.isAnyPending(mapA, ['node/a', 'node/b'])).toBe(false);
    });

    it('clearStalePending clears pending when exclusiveDepth is zero', () => {
      service.beginPending(mapA, ['node/a']);
      expect(service.isPending(mapA, 'node/a')).toBe(true);
      service.clearStalePending(mapA);
      expect(service.isPending(mapA, 'node/a')).toBe(false);
    });

    it('reconcileClaimsToLoaded selects loaded and deselects missing', () => {
      service.commitSelection(mapA, 'node/a', 'layer/a', true);
      service.commitSelection(mapA, 'node/b', 'layer/b', true);
      service.reconcileClaimsToLoaded(
        mapA,
        ['node/a', 'node/cousin'],
        ['node/a', 'node/b', 'node/cousin'],
        configLookup
      );
      expect(service.isNodeSelected(mapA, 'node/a')).toBe(true);
      expect(service.isNodeSelected(mapA, 'node/b')).toBe(false);
      expect(service.isNodeSelected(mapA, 'node/cousin')).toBe(true);
    });
  });
});
