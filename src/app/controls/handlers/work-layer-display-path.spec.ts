import {
  collapseCatalogCompositeWorkLayerPath,
  removeOrphanWorkLayerElements,
  simulateSitnaWorkLayerPaths
} from './work-layer-display-path';

describe('work-layer-display-path', () => {
  const catalogBreadcrumb = ['Adreces', 'Illes urbanes'];

  const catalogGetPath = (): string[] => ['_sitna-shift', ...catalogBreadcrumb];

  describe('single-layer baseline', () => {
    it('produces one breadcrumb entry after SITNA shift', () => {
      const path = simulateSitnaWorkLayerPaths(['ILLES_URBANES'], catalogGetPath);

      expect(path).toEqual([catalogBreadcrumb]);
    });

    it('stays unchanged when not a catalog composite', () => {
      const path = simulateSitnaWorkLayerPaths(['ILLES_URBANES'], catalogGetPath);

      expect(
        collapseCatalogCompositeWorkLayerPath(path, {
          nodeId: 'node/illes',
          layerNameCount: 1
        })
      ).toEqual(path);
    });
  });

  describe('composite catalog layer (#161)', () => {
    it('raw SITNA path duplicates the same breadcrumb per internal WMS name', () => {
      const path = simulateSitnaWorkLayerPaths(
        ['CONSTRU', 'TXCONSTRU'],
        catalogGetPath
      );

      expect(path).toEqual([catalogBreadcrumb, catalogBreadcrumb]);
    });

    it('collapses to the same shape as a single-layer entry', () => {
      const compositeRaw = simulateSitnaWorkLayerPaths(
        ['CONSTRU', 'TXCONSTRU'],
        catalogGetPath
      );
      const single = simulateSitnaWorkLayerPaths(
        ['ILLES_URBANES'],
        catalogGetPath
      );

      expect(
        collapseCatalogCompositeWorkLayerPath(compositeRaw, {
          nodeId: 'node/illes',
          layerNameCount: 2
        })
      ).toEqual(single);
    });
  });

  describe('external WMS layers', () => {
    it('does not collapse paths when nodeId is absent', () => {
      const path = [
        ['Service', 'LayerA'],
        ['Service', 'LayerB']
      ];

      expect(
        collapseCatalogCompositeWorkLayerPath(path, {
          layerNameCount: 2
        })
      ).toEqual(path);
    });
  });

  describe('removeOrphanWorkLayerElements', () => {
    it('removes Capas rows whose layer is missing from the map', () => {
      const root = document.createElement('div');
      const keep = document.createElement('li');
      keep.className = 'tc-ctl-wlm-elm';
      keep.dataset['layerId'] = 'lcat-1-1';
      const orphan = document.createElement('li');
      orphan.className = 'tc-ctl-wlm-elm';
      orphan.dataset['layerId'] = 'lcat-1-2';
      root.append(keep, orphan);

      const removed = removeOrphanWorkLayerElements(root, (id) =>
        id === 'lcat-1-1' ? { id } : undefined
      );

      expect(removed).toEqual(['lcat-1-2']);
      expect(root.querySelectorAll('li.tc-ctl-wlm-elm')).toHaveLength(1);
      expect(
        (root.querySelector('li.tc-ctl-wlm-elm') as HTMLElement).dataset[
          'layerId'
        ]
      ).toBe('lcat-1-1');
    });
  });
});
