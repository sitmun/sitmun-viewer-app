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
  it('rewrites the table for the profile layer id when the heading is only the tree title', () => {
    const services = [
      {
        layers: [
          {
            name: 'tu007rts_ccavalls',
            features: [{ data: { nomruta: 'Cala Tirant', gid: 105 } }]
          }
        ]
      }
    ];
    const plans = planFeatureInfoOverlay(services, [layer], 'ca', trees);

    const root = document.createElement('div');
    root.innerHTML =
      '<ul class="tc-ctl-finfo-layers"><li><h4><span>1</span> Rutes turístiques › Trams del camí de cavalls</h4>' +
      '<table><tbody><tr><th>gid</th><td>105</td></tr><tr><th>nomruta</th><td>Cala Tirant</td></tr></tbody></table></li></ul>';

    applyFeatureInfoOverlay(root, plans, services);

    const headers = Array.from(root.querySelectorAll('th')).map((cell) => cell.textContent);
    expect(headers).toEqual(['Route']);
    expect(root.querySelector('td')?.textContent).toBe('Cala Tirant');
  });

  it('uses the map layer id for a WMS group child, not the shared title', () => {
    const soil = {
      id: 'layer/4658',
      service: 'service/12',
      title: 'RPT Sòl Rústic',
      layers: ['OR007RPT_solrustic'],
      featureInfoFields: [
        { name: 'Classe_de_sòl', label: 'Soil class', format: 'T', order: 0 }
      ]
    } as AppLayer;
    const revision = {
      id: 'layer/4659',
      service: 'service/12',
      title: 'Revisió PTI. 01 Sòl Rústic',
      layers: ['OR007RPT_solrustic'],
      featureInfoFields: [
        { name: 'layer', label: 'Revision layer', format: 'T', order: 0 }
      ]
    } as AppLayer;
    const services = [
      {
        mapLayers: [
          {
            names: ['OR007RPT_solrustic'],
            options: { nodeId: '12660' },
            getDisgregatedLayerNames: () => ['or007rpt_dpmt']
          },
          {
            names: ['OR007RPT_solrustic'],
            options: { nodeId: '12661' },
            getDisgregatedLayerNames: () => ['or007rpt_solurbledpmt']
          }
        ],
        layers: [
          {
            name: 'or007rpt_dpmt',
            features: [{ data: { Classe_de_sòl: 'SR', idclass: '1' } }]
          },
          {
            name: 'or007rpt_solurbledpmt',
            features: [{ data: { layer: '0805DPMT', Classe_de_sòl: 'no' } }]
          }
        ]
      }
    ];
    const groupTrees = [
      {
        id: 'tree/1',
        title: 'Ordenació',
        image: null,
        rootNode: 'root',
        nodes: {
          '12660': { title: 'Sòl Rústic', resource: 'layer/4658', children: [] },
          '12661': { title: 'Sòl Rústic', resource: 'layer/4659', children: [] }
        }
      }
    ] as AppTree[];

    const plans = planFeatureInfoOverlay(services, [revision, soil], 'en', groupTrees);
    const root = document.createElement('div');
    root.innerHTML =
      '<ul class="tc-ctl-finfo-layers">' +
      '<li><h4><span>1</span> Sòl Rústic</h4><table><tbody><tr><th>idclass</th><td>1</td></tr><tr><th>Classe_de_sòl</th><td>SR</td></tr></tbody></table></li>' +
      '<li><h4><span>1</span> Sòl Rústic</h4><table><tbody><tr><th>layer</th><td>0805DPMT</td></tr></tbody></table></li>' +
      '</ul>';

    applyFeatureInfoOverlay(root, plans, services);

    const headers = Array.from(root.querySelectorAll('th')).map((cell) => cell.textContent);
    expect(headers).toEqual(['Soil class', 'Revision layer']);
    expect(plans.map((plan) => plan.profileLayerId)).toEqual(['layer/4658', 'layer/4659']);
  });
});
