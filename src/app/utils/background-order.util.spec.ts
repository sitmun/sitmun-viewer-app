import {
  sortBackgroundsByOrder,
  toDefaultBaseLayer
} from './background-order.util';

describe('background-order.util', () => {
  describe('sortBackgroundsByOrder', () => {
    it('should sort by order ascending regardless of input order', () => {
      const backgrounds = [
        { id: 'bg-2', title: 'Second', thumbnail: '', order: 2 },
        { id: 'bg-0', title: 'First', thumbnail: '', order: 0 },
        { id: 'bg-1', title: 'Middle', thumbnail: '', order: 1 }
      ];

      expect(sortBackgroundsByOrder(backgrounds).map((bg) => bg.id)).toEqual([
        'bg-0',
        'bg-1',
        'bg-2'
      ]);
    });

    it('should place missing order values last while preserving input order for ties', () => {
      const backgrounds = [
        { id: 'bg-missing-b', title: 'Missing B', thumbnail: '' },
        { id: 'bg-1', title: 'Ordered', thumbnail: '', order: 1 },
        { id: 'bg-missing-a', title: 'Missing A', thumbnail: '' }
      ];

      expect(sortBackgroundsByOrder(backgrounds).map((bg) => bg.id)).toEqual([
        'bg-1',
        'bg-missing-b',
        'bg-missing-a'
      ]);
    });
  });

  describe('toDefaultBaseLayer', () => {
    it('should return the first base layer id for SITNA defaultBaseLayer', () => {
      expect(
        toDefaultBaseLayer([
          { id: 'Base Layer 1', url: 'http://example.com/wms', type: 'WMS' },
          { id: 'Base Layer 2', url: 'http://example.com/wms2', type: 'WMS' }
        ])
      ).toBe('Base Layer 1');
    });

    it('should return undefined when no base layers are configured', () => {
      expect(toDefaultBaseLayer([])).toBeUndefined();
    });
  });
});
