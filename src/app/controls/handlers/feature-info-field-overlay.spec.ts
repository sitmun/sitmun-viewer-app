import type { AppLayer, AppTree } from '@api/model/app-cfg';

import {
  applyFeatureInfoOverlay,
  planFeatureInfoOverlay
} from './feature-info-field-overlay';

const layer = {
  id: 'layer/1304',
  title: 'Trams camí de cavalls',
  layers: ['tu007rts_ccavalls'],
  service: 'service/153',
  featureInfoFields: [
    { name: 'nomruta', label: 'Route', format: 'T', order: 0 }
  ]
} as AppLayer;

const trees = [
  {
    id: 'tree/33',
    title: 'IDEMenorca genèric',
    image: null,
    rootNode: 'root',
    nodes: {
      root: { title: 'Rutes turístiques', children: ['leaf'] },
      leaf: {
        title: 'Trams del camí de cavalls',
        resource: 'layer/1304',
        children: []
      }
    }
  }
] as AppTree[];

describe('feature info overlay headings', () => {
  it('rewrites the table when the popup title is the tree path', () => {
    const plans = planFeatureInfoOverlay(
      [
        {
          layers: [
            {
              name: 'tu007rts_ccavalls',
              features: [{ data: { nomruta: 'Cala Tirant', gid: 105 } }]
            }
          ]
        }
      ],
      [layer],
      'ca',
      trees
    );

    const root = document.createElement('div');
    root.innerHTML =
      '<ul class="tc-ctl-finfo-layers"><li><h4><span>1</span> Rutes turístiques › Trams del camí de cavalls</h4>' +
      '<table><tbody><tr><th>gid</th><td>105</td></tr><tr><th>nomruta</th><td>Cala Tirant</td></tr></tbody></table></li></ul>';

    applyFeatureInfoOverlay(root, plans);

    const headers = Array.from(root.querySelectorAll('th')).map((cell) => cell.textContent);
    expect(headers).toEqual(['Route']);
    expect(root.querySelector('td')?.textContent).toBe('Cala Tirant');
  });
});
