import type { AppLayer, AppTree } from '@api/model/app-cfg';

import {
  applyFeatureInfoOverlay,
  planFeatureInfoOverlay,
  rewriteFeatureInfoTable
} from './feature-info-field-overlay';
import { buildFeatureInfoRows } from './feature-info-fields';

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

  it('builds the same rows for a WFS feature record and a WMS feature record', () => {
    const record = { nomruta: 'Cala Tirant', gid: 105 };
    const wmsPlans = planFeatureInfoOverlay(
      [
        {
          layers: [
            {
              name: 'tu007rts_ccavalls',
              features: [{ data: record }]
            }
          ]
        }
      ],
      [layer],
      'ca',
      trees
    );
    const wfsLayer = {
      ...layer,
      id: 'layer/wfs',
      layers: ['app:parcels']
    } as AppLayer;
    const wfsTrees = [
      {
        ...trees[0],
        nodes: {
          root: { title: 'Rutes turístiques', children: ['wfs-leaf'] },
          'wfs-leaf': {
            title: 'Trams del camí de cavalls',
            resource: 'layer/wfs',
            children: []
          }
        }
      }
    ] as AppTree[];
    const wfsPlans = planFeatureInfoOverlay(
      [
        {
          mapLayers: [
            {
              names: ['app:parcels'],
              options: { nodeId: 'wfs-leaf' }
            }
          ],
          layers: [
            {
              name: 'app:parcels',
              features: [{ getData: () => record }]
            }
          ]
        }
      ],
      [wfsLayer],
      'ca',
      wfsTrees
    );

    expect(wfsPlans[0]?.features).toEqual(wmsPlans[0]?.features);
    expect(wfsPlans[0]?.features[0]).toEqual([
      {
        path: 'nomruta',
        label: 'Route',
        cell: { kind: 'text', text: 'Cala Tirant' }
      }
    ]);
  });

  it('keeps the SITNA link for Automatic when the drawn header still has a namespace', () => {
    const table = document.createElement('table');
    table.innerHTML =
      '<tbody><tr><th>turisme:lnkweb</th><td><a href="http://farsdebalears.com/es/faro-de-artrutx" target="_blank">open</a></td></tr></tbody>';

    rewriteFeatureInfoTable(table, [
      {
        path: 'lnkweb',
        label: 'lnkweb',
        cell: { kind: 'auto', value: 'http://farsdebalears.com/es/faro-de-artrutx' }
      }
    ]);

    expect(table.querySelector('a')?.getAttribute('href')).toBe(
      'http://farsdebalears.com/es/faro-de-artrutx'
    );
  });

  it('turns an Automatic URL into a link when the drawn cell is plain text', () => {
    const table = document.createElement('table');
    table.innerHTML =
      '<tbody><tr><th>lnkweb</th><td>http://farsdebalears.com/es/faro-de-artrutx</td></tr></tbody>';

    rewriteFeatureInfoTable(table, [
      {
        path: 'lnkweb',
        label: 'lnkweb',
        cell: { kind: 'auto', value: 'http://farsdebalears.com/es/faro-de-artrutx' }
      }
    ]);

    expect(table.querySelector('td')?.textContent).toBe(
      'http://farsdebalears.com/es/faro-de-artrutx'
    );
    expect(table.querySelector('a')?.getAttribute('href')).toBe(
      'http://farsdebalears.com/es/faro-de-artrutx'
    );
  });

  it('keeps a SITNA image when Automatic already drew one', () => {
    const table = document.createElement('table');
    table.innerHTML =
      '<tbody><tr><th>turisme:lnkimatge</th><td><img src="http://example.test/faro.jpg" class="tc-img-attr" style="width:auto;height:auto;" /></td></tr></tbody>';

    rewriteFeatureInfoTable(table, [
      {
        path: 'lnkimatge',
        label: 'lnkimatge',
        cell: { kind: 'auto', value: 'image__http://example.test/faro.jpg' }
      }
    ]);

    const img = table.querySelector('img');
    expect(img?.getAttribute('src')).toBe('http://example.test/faro.jpg');
    expect(img?.classList.contains('tc-img-attr')).toBe(true);
    expect(img?.getAttribute('style')).toBe('width:auto;height:auto;');
    expect(table.querySelector('a')).toBeNull();
  });

  it('leaves an Automatic picture URL as a link', () => {
    const table = document.createElement('table');
    table.innerHTML =
      '<tbody><tr><th>lnkimatge</th><td>http://example.test/faro.jpg</td></tr></tbody>';

    rewriteFeatureInfoTable(table, [
      {
        path: 'lnkimatge',
        label: 'lnkimatge',
        cell: { kind: 'auto', value: 'http://example.test/faro.jpg' }
      }
    ]);

    expect(table.querySelector('img')).toBeNull();
    expect(table.querySelector('a')?.getAttribute('href')).toBe('http://example.test/faro.jpg');
  });

  it('constrains an Image cell the way SITNA constrains an automatic image', () => {
    const table = document.createElement('table');
    table.innerHTML =
      '<tbody><tr><th>lnkimatge</th><td>http://example.test/faro.jpg</td></tr></tbody>';

    rewriteFeatureInfoTable(table, [
      {
        path: 'lnkimatge',
        label: 'lnkimatge',
        cell: { kind: 'image', src: 'http://example.test/faro.jpg' }
      }
    ]);

    const img = table.querySelector('img');
    expect(img?.getAttribute('src')).toBe('http://example.test/faro.jpg');
    expect(img?.classList.contains('tc-img-attr')).toBe(true);
    expect(img?.getAttribute('style')).toBe('width:auto;height:auto;');
    expect(table.querySelector('td')?.classList.contains('tc-ctl-finfo-val')).toBe(true);
    expect(table.querySelector('td')?.classList.contains('tc-img-attr')).toBe(true);
  });

  it('applies Image max width and max height from field options and keeps the original address', () => {
    const url = 'http://menorca.es/Documents/Imatges/3314imgpub.jpg';
    const rows = buildFeatureInfoRows(
      { lnkimatge: url },
      [
        {
          name: 'lnkimatge',
          label: 'lnkimatge',
          format: 'I',
          maxWidth: 240,
          maxHeight: 160
        }
      ],
      'ca'
    );
    const table = document.createElement('table');
    table.innerHTML = '<tbody></tbody>';
    rewriteFeatureInfoTable(table, rows);

    const img = table.querySelector('img');
    expect(img?.getAttribute('src')).toBe(url);
    expect(img?.classList.contains('tc-img-attr')).toBe(true);
    expect(img?.getAttribute('style')).toBe(
      'width:auto;height:auto;max-width:240px;max-height:160px;'
    );
  });
});
