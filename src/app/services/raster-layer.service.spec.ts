import { TestBed } from '@angular/core/testing';

import { AppCfg, AppLayer } from '@api/model/app-cfg';
import { TranslateService } from '@ngx-translate/core';

import { AppConfigService } from './app-config.service';
import { ConfigLookupService } from './config-lookup.service';
import { LanguageService } from './language.service';
import { LayerInfoService } from './layer-info.service';
import { RasterLayerService } from './raster-layer.service';
import { VirtualWmsCapabilitiesService } from './virtual-wms-capabilities.service';
import { WMSCapabilities, WMSLayer } from '../types/wms-capabilities';

describe('RasterLayerService', () => {
  let service: RasterLayerService;
  let virtualWms: VirtualWmsCapabilitiesService;
  let configLookup: ConfigLookupService;
  let currentLanguage: string;

  const minimalAppCfg = (): AppCfg => ({
    application: {
      id: 1,
      title: 't',
      type: 't',
      theme: 't',
      srs: 'EPSG:25831',
      initialExtent: [0, 0, 1, 1]
    },
    backgrounds: [],
    groups: [],
    layers: [
      {
        id: 'L1',
        title: 'L1',
        layers: ['ns:roads'],
        service: 'S1',
        minScaleDenominator: 1000,
        maxScaleDenominator: 500000
      }
    ],
    services: [
      {
        id: 'S1',
        url: 'https://upstream.example/geoserver/wms',
        type: 'WMS',
        parameters: {}
      }
    ],
    tasks: [],
    trees: []
  });

  const translateInstant = (key: string): string =>
    (
      ({
        'layerCatalog.linkType.metadata': 'Metadata',
        'layerCatalog.linkType.download': 'Download',
        'layerCatalog.linkType.format.text_html': 'HTML',
        'layerCatalog.linkType.format.application_zip': 'ZIP',
        'layerCatalog.linkType.format.application_octet-stream': 'BIN',
        'layerCatalog.linkType.format.text_xml': 'XML'
      }) as Record<string, string>
    )[key] ?? key;

  beforeEach(() => {
    currentLanguage = 'en';
    TestBed.configureTestingModule({
      providers: [
        RasterLayerService,
        VirtualWmsCapabilitiesService,
        ConfigLookupService,
        LayerInfoService,
        {
          provide: TranslateService,
          useValue: { instant: translateInstant }
        },
        {
          provide: LanguageService,
          useValue: { getCurrentLanguage: () => currentLanguage }
        },
        {
          provide: AppConfigService,
          useValue: {
            getDefaultLanguage: () => 'en',
            getDefaultLanguages: () => []
          }
        }
      ]
    });
    service = TestBed.inject(RasterLayerService);
    virtualWms = TestBed.inject(VirtualWmsCapabilitiesService);
    configLookup = TestBed.inject(ConfigLookupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('processWmtCapabilitiesResult', () => {
    it('returns unchanged for virtual capabilities URL', () => {
      const cfg = minimalAppCfg();
      const leaf: WMSLayer = { Name: 'node/x', Title: 'x' };
      const caps = {
        version: '1.3.0',
        Service: {},
        Capability: { Layer: leaf }
      } as WMSCapabilities;
      const url = virtualWms.generateVirtualUrl('node-3');
      const out = service.processWmtCapabilitiesResult(
        { type: 'WMS' },
        url,
        caps,
        cfg
      ) as WMSCapabilities;
      expect(out).toBe(caps);
      expect(leaf.MinScaleDenominator).toBeUndefined();
    });

    it('merges scales on real WMS capabilities when options.serviceId matches', () => {
      const cfg = minimalAppCfg();
      const leaf: WMSLayer = { Name: 'ns:roads', Title: 'roads' };
      const caps = {
        version: '1.3.0',
        Service: {},
        Capability: { Layer: leaf }
      } as WMSCapabilities;
      const layer = { type: 'WMS', options: { serviceId: 'S1' } };
      service.processWmtCapabilitiesResult(
        layer,
        'https://proxy.example/foo?bar',
        caps,
        cfg
      );
      expect(leaf.MinScaleDenominator).toBe(1000);
      expect(leaf.MaxScaleDenominator).toBe(500000);
      expect(leaf.Title).toBe('L1');
    });

    it('falls back to URL match when serviceId is absent', () => {
      const cfg = minimalAppCfg();
      const leaf: WMSLayer = { Name: 'ns:roads', Title: 'roads' };
      const caps = {
        version: '1.3.0',
        Service: {},
        Capability: { Layer: leaf }
      } as WMSCapabilities;
      const layer = { type: 'WMS', url: 'https://upstream.example/geoserver/wms/' };
      service.processWmtCapabilitiesResult(
        layer,
        'https://upstream.example/geoserver/wms?REQUEST=GetCapabilities',
        caps,
        cfg
      );
      expect(leaf.MinScaleDenominator).toBe(1000);
      expect(leaf.Title).toBe('L1');
    });

    it('sets Abstract from AppLayer.description on real WMS layers when matched', () => {
      const cfg: AppCfg = {
        ...minimalAppCfg(),
        layers: [
          {
            id: 'L1',
            title: 'L1',
            layers: ['ns:roads'],
            service: 'S1',
            description: 'Authoritative road network'
          }
        ]
      };
      const leaf: WMSLayer = {
        Name: 'ns:roads',
        Title: 'roads',
        Abstract: 'upstream abstract'
      };
      const caps = {
        version: '1.3.0',
        Service: {},
        Capability: { Layer: leaf }
      } as WMSCapabilities;
      service.processWmtCapabilitiesResult(
        { type: 'WMS', options: { serviceId: 'S1' } },
        'https://proxy.example/foo?bar',
        caps,
        cfg
      );
      expect(leaf.Abstract).toBe('Authoritative road network');
      expect(leaf.Title).toBe('L1');
    });

    it('sets MetadataURL and DataURL from profile on real WMS layers when matched', () => {
      const cfg: AppCfg = {
        ...minimalAppCfg(),
        layers: [
          {
            id: 'L1',
            title: 'L1',
            layers: ['ns:roads'],
            service: 'S1',
            metadataURL: 'https://example.com/metadata.xml',
            datasetURL: 'https://example.com/data.zip'
          }
        ]
      };
      const leaf: WMSLayer = {
        Name: 'ns:roads',
        Title: 'roads'
      };
      const caps = {
        version: '1.3.0',
        Service: {},
        Capability: { Layer: leaf }
      } as WMSCapabilities;
      service.processWmtCapabilitiesResult(
        { type: 'WMS', options: { serviceId: 'S1' } },
        'https://proxy.example/foo?bar',
        caps,
        cfg
      );
      expect(leaf.MetadataURL).toEqual([
        {
          Format: 'text/xml',
          OnlineResource: { 'xlink:href': 'https://example.com/metadata.xml' }
        }
      ]);
      expect(leaf.DataURL).toEqual([
        {
          Format: 'application/zip',
          OnlineResource: { 'xlink:href': 'https://example.com/data.zip' }
        }
      ]);
    });

    it('removes upstream WMS MetadataURL when profile saves an empty metadataURL', () => {
      const cfg: AppCfg = {
        ...minimalAppCfg(),
        layers: [
          {
            id: 'L1',
            title: 'L1',
            layers: ['ns:roads'],
            service: 'S1',
            metadataURL: ''
          }
        ]
      };
      const leaf: WMSLayer = {
        Name: 'ns:roads',
        Title: 'roads',
        MetadataURL: [
          {
            Format: 'text/xml',
            OnlineResource: { 'xlink:href': 'http://upstream/meta.xml' }
          }
        ]
      };
      const caps = {
        version: '1.3.0',
        Service: {},
        Capability: { Layer: leaf }
      } as WMSCapabilities;
      service.processWmtCapabilitiesResult(
        { type: 'WMS', options: { serviceId: 'S1' } },
        'https://proxy.example/foo?bar',
        caps,
        cfg
      );
      expect(leaf.MetadataURL).toBeUndefined();
    });

    it('leaves upstream WMS MetadataURL when profile layer omits metadataURL', () => {
      const upstream: WMSLayer['MetadataURL'] = [
        {
          Format: 'text/xml',
          OnlineResource: { 'xlink:href': 'http://upstream/meta.xml' }
        }
      ];
      const cfg = minimalAppCfg();
      const leaf: WMSLayer = {
        Name: 'ns:roads',
        Title: 'roads',
        MetadataURL: upstream
      };
      const caps = {
        version: '1.3.0',
        Service: {},
        Capability: { Layer: leaf }
      } as WMSCapabilities;
      service.processWmtCapabilitiesResult(
        { type: 'WMS', options: { serviceId: 'S1' } },
        'https://proxy.example/foo?bar',
        caps,
        cfg
      );
      expect(leaf.MetadataURL).toEqual(upstream);
    });

    it('leaves Abstract untouched when AppLayer.description is missing or empty', () => {
      const cfg: AppCfg = {
        ...minimalAppCfg(),
        layers: [
          {
            id: 'L1',
            title: 'L1',
            layers: ['ns:roads'],
            service: 'S1'
          }
        ]
      };
      const leaf: WMSLayer = {
        Name: 'ns:roads',
        Title: 'roads',
        Abstract: 'upstream abstract'
      };
      const caps = {
        version: '1.3.0',
        Service: {},
        Capability: { Layer: leaf }
      } as WMSCapabilities;
      service.processWmtCapabilitiesResult(
        { type: 'WMS', options: { serviceId: 'S1' } },
        'https://proxy.example/foo?bar',
        caps,
        cfg
      );
      expect(leaf.Abstract).toBe('upstream abstract');
      expect(leaf.Title).toBe('L1');
    });

    it('removes WMS Abstract when profile description is only whitespace', () => {
      const cfg: AppCfg = {
        ...minimalAppCfg(),
        layers: [
          {
            id: 'L1',
            title: 'L1',
            layers: ['ns:roads'],
            service: 'S1',
            description: '   \n\t  '
          }
        ]
      };
      const leaf: WMSLayer = {
        Name: 'ns:roads',
        Title: 'roads',
        Abstract: 'upstream abstract'
      };
      const caps = {
        version: '1.3.0',
        Service: {},
        Capability: { Layer: leaf }
      } as WMSCapabilities;
      service.processWmtCapabilitiesResult(
        { type: 'WMS', options: { serviceId: 'S1' } },
        'https://proxy.example/foo?bar',
        caps,
        cfg
      );
      expect(leaf.Abstract).toBeUndefined();
    });

    it('removes WMS Abstract when profile description is an empty string', () => {
      const cfg: AppCfg = {
        ...minimalAppCfg(),
        layers: [
          {
            id: 'L1',
            title: 'L1',
            layers: ['ns:roads'],
            service: 'S1',
            description: ''
          }
        ]
      };
      const leaf: WMSLayer = {
        Name: 'ns:roads',
        Title: 'roads',
        Abstract: 'upstream abstract'
      };
      const caps = {
        version: '1.3.0',
        Service: {},
        Capability: { Layer: leaf }
      } as WMSCapabilities;
      service.processWmtCapabilitiesResult(
        { type: 'WMS', options: { serviceId: 'S1' } },
        'https://proxy.example/foo?bar',
        caps,
        cfg
      );
      expect(leaf.Abstract).toBeUndefined();
    });

    it('removes WMS Title when profile title is blank', () => {
      const cfg: AppCfg = {
        ...minimalAppCfg(),
        layers: [
          {
            id: 'L1',
            title: '   ',
            layers: ['ns:roads'],
            service: 'S1'
          }
        ]
      };
      const leaf: WMSLayer = { Name: 'ns:roads', Title: 'upstream title' };
      const caps = {
        version: '1.3.0',
        Service: {},
        Capability: { Layer: leaf }
      } as WMSCapabilities;
      service.processWmtCapabilitiesResult(
        { type: 'WMS', options: { serviceId: 'S1' } },
        'https://proxy.example/foo?bar',
        caps,
        cfg
      );
      expect(leaf.Title).toBeUndefined();
    });

    it('leaves WMS Title unchanged when profile layer omits title', () => {
      const l0 = minimalAppCfg().layers[0];
      const layerWithoutTitle = {
        id: l0.id,
        layers: l0.layers,
        service: l0.service,
        minScaleDenominator: l0.minScaleDenominator,
        maxScaleDenominator: l0.maxScaleDenominator
      } as AppLayer;
      const cfg: AppCfg = {
        ...minimalAppCfg(),
        layers: [layerWithoutTitle]
      };
      const leaf: WMSLayer = { Name: 'ns:roads', Title: 'upstream title' };
      const caps = {
        version: '1.3.0',
        Service: {},
        Capability: { Layer: leaf }
      } as WMSCapabilities;
      service.processWmtCapabilitiesResult(
        { type: 'WMS', options: { serviceId: 'S1' } },
        'https://proxy.example/foo?bar',
        caps,
        cfg
      );
      expect(leaf.Title).toBe('upstream title');
    });

    it('does not write Abstract for virtual capabilities URLs', () => {
      const cfg: AppCfg = {
        ...minimalAppCfg(),
        layers: [
          {
            id: 'L1',
            title: 'L1',
            layers: ['ns:roads'],
            service: 'S1',
            description: 'Should not appear'
          }
        ]
      };
      const leaf: WMSLayer = { Name: 'ns:roads', Title: 'roads' };
      const caps = {
        version: '1.3.0',
        Service: {},
        Capability: { Layer: leaf }
      } as WMSCapabilities;
      const url = virtualWms.generateVirtualUrl('node-9');
      service.processWmtCapabilitiesResult(
        { type: 'WMS', options: { serviceId: 'S1' } },
        url,
        caps,
        cfg
      );
      expect(leaf.Abstract).toBeUndefined();
    });

    it('applies WMTS scales only for AppLayers on the matched service', () => {
      const cfg: AppCfg = {
        ...minimalAppCfg(),
        layers: [
          {
            id: 'L1',
            title: 'L1',
            layers: ['tile-layer'],
            service: 'S1',
            minScaleDenominator: 200,
            maxScaleDenominator: 20000
          },
          {
            id: 'L2',
            title: 'L2',
            layers: ['tile-layer'],
            service: 'S2',
            minScaleDenominator: 999,
            maxScaleDenominator: 888888
          }
        ],
        services: [
          ...minimalAppCfg().services,
          {
            id: 'S2',
            url: 'https://other.example/wmts',
            type: 'WMTS',
            parameters: {}
          }
        ]
      };
      const wmtsLayer: Record<string, unknown> = {
        Identifier: 'tile-layer',
        Title: 'Tile'
      };
      const caps = { Contents: { Layer: [wmtsLayer] } };
      service.processWmtCapabilitiesResult(
        { type: 'WMTS', options: { serviceId: 'S1' } },
        'https://upstream.example/geoserver/wmts',
        caps,
        cfg
      );
      expect(wmtsLayer['MinScaleDenominator']).toBe(200);
      expect(wmtsLayer['MaxScaleDenominator']).toBe(20000);
      expect(wmtsLayer['Title']).toBe('L1');
    });

    it('sets WMTS capability layer Title and Abstract from AppLayer when matched', () => {
      const cfg: AppCfg = {
        ...minimalAppCfg(),
        layers: [
          {
            id: 'L1',
            title: 'Profile title',
            layers: ['tile-layer'],
            service: 'S1',
            description: 'Profile abstract text',
            minScaleDenominator: 1,
            maxScaleDenominator: 2
          }
        ],
        services: [
          {
            id: 'S1',
            url: 'https://upstream.example/geoserver/wmts',
            type: 'WMTS',
            parameters: {}
          }
        ]
      };
      const wmtsLayer: Record<string, unknown> = {
        Identifier: 'tile-layer',
        Title: 'Tile',
        Abstract: 'upstream wmts abstract'
      };
      const caps = { Contents: { Layer: [wmtsLayer] } };
      service.processWmtCapabilitiesResult(
        { type: 'WMTS', options: { serviceId: 'S1' } },
        'https://upstream.example/geoserver/wmts',
        caps,
        cfg
      );
      expect(wmtsLayer['Title']).toBe('Profile title');
      expect(wmtsLayer['Abstract']).toBe('Profile abstract text');
    });

    it('sets WMTS MetadataURL and DataURL from profile when matched', () => {
      const cfg: AppCfg = {
        ...minimalAppCfg(),
        layers: [
          {
            id: 'L1',
            title: 'T',
            layers: ['tile-layer'],
            service: 'S1',
            metadataURL: 'https://example.com/metadata.xml',
            datasetURL: 'https://example.com/data.zip'
          }
        ],
        services: [
          {
            id: 'S1',
            url: 'https://upstream.example/geoserver/wmts',
            type: 'WMTS',
            parameters: {}
          }
        ]
      };
      const wmtsLayer: Record<string, unknown> = {
        Identifier: 'tile-layer',
        Title: 'Tile'
      };
      const caps = { Contents: { Layer: [wmtsLayer] } };
      service.processWmtCapabilitiesResult(
        { type: 'WMTS', options: { serviceId: 'S1' } },
        'https://upstream.example/geoserver/wmts',
        caps,
        cfg
      );
      expect(wmtsLayer['MetadataURL']).toEqual([
        {
          Format: 'text/xml',
          OnlineResource: { 'xlink:href': 'https://example.com/metadata.xml' }
        }
      ]);
      expect(wmtsLayer['DataURL']).toEqual([
        {
          Format: 'application/zip',
          OnlineResource: { 'xlink:href': 'https://example.com/data.zip' }
        }
      ]);
    });

    it('resolves WMTS layer by exact layers[] match before namespace fallback', () => {
      const cfg: AppCfg = {
        ...minimalAppCfg(),
        layers: [
          {
            id: 'L-exact',
            title: 'Exact match layer',
            layers: ['my:layer'],
            service: 'S1',
            description: 'from exact row'
          },
          {
            id: 'L-fuzzy',
            title: 'Wrong if chosen',
            layers: ['layer'],
            service: 'S1',
            description: 'from fuzzy row'
          }
        ],
        services: [
          {
            id: 'S1',
            url: 'https://upstream.example/wmts',
            type: 'WMTS',
            parameters: {}
          }
        ]
      };
      const wmtsLayer: Record<string, unknown> = {
        Identifier: 'my:layer',
        Title: 'Up'
      };
      const caps = { Contents: { Layer: [wmtsLayer] } };
      service.processWmtCapabilitiesResult(
        { type: 'WMTS', options: { serviceId: 'S1' } },
        'https://upstream.example/wmts',
        caps,
        cfg
      );
      expect(wmtsLayer['Abstract']).toBe('from exact row');
      expect(wmtsLayer['Title']).toBe('Exact match layer');
    });

    it('sets queryable false on matched WMS group and all descendants', () => {
      const serviceUrl = 'https://ide.cime.es/geoserver/ordenacio/ows';
      const cfg: AppCfg = {
        ...minimalAppCfg(),
        layers: [
          {
            id: 'layer/4658',
            title: 'RPT Sòl Rústic',
            layers: ['OR007RPT_solrustic'],
            service: 'S1',
            queryableFeatureEnabled: false
          }
        ],
        services: [
          {
            id: 'S1',
            title: 'IDEMenorca - Ordenacio',
            type: 'WMS',
            url: serviceUrl,
            parameters: {}
          }
        ]
      };
      const childNested: WMSLayer = {
        Name: 'or007rpt_anei_child',
        Title: 'nested',
        queryable: true
      };
      const group: WMSLayer = {
        Name: 'OR007RPT_solrustic',
        Title: 'Sòl Rústic',
        queryable: true,
        Layer: [
          { Name: 'or007rpt_zavas', Title: 'ZAVAS', queryable: true },
          {
            Name: 'or007rpt_anei',
            Title: 'ANEIs',
            queryable: true,
            Layer: [childNested]
          }
        ]
      };
      const caps = {
        version: '1.3.0',
        Service: {},
        Capability: { Layer: { Title: 'Root', Layer: [group] } }
      } as WMSCapabilities;

      service.processWmtCapabilitiesResult(
        { type: 'WMS', url: serviceUrl, options: { serviceId: 'S1', type: 'WMS' } },
        serviceUrl,
        caps,
        cfg
      );

      expect(group.queryable).toBe(false);
      expect(group.Layer![0].queryable).toBe(false);
      expect(group.Layer![1].queryable).toBe(false);
      expect(childNested.queryable).toBe(false);
    });

    it('sets queryable true on matched WMS group and descendants when profile enables GFI', () => {
      const serviceUrl = 'https://ide.cime.es/geoserver/ordenacio/ows';
      const cfg: AppCfg = {
        ...minimalAppCfg(),
        layers: [
          {
            id: 'layer/4658',
            title: 'RPT Sòl Rústic',
            layers: ['OR007RPT_solrustic'],
            service: 'S1',
            queryableFeatureEnabled: true
          }
        ],
        services: [
          {
            id: 'S1',
            type: 'WMS',
            url: serviceUrl,
            parameters: {}
          }
        ]
      };
      const childNested: WMSLayer = {
        Name: 'or007rpt_anei_child',
        Title: 'nested',
        queryable: false
      };
      const group: WMSLayer = {
        Name: 'OR007RPT_solrustic',
        Title: 'Sòl Rústic',
        queryable: false,
        Layer: [
          { Name: 'or007rpt_zavas', Title: 'ZAVAS', queryable: false },
          {
            Name: 'or007rpt_anei',
            Title: 'ANEIs',
            queryable: false,
            Layer: [childNested]
          }
        ]
      };
      const caps = {
        version: '1.3.0',
        Service: {},
        Capability: { Layer: { Title: 'Root', Layer: [group] } }
      } as WMSCapabilities;

      service.processWmtCapabilitiesResult(
        { type: 'WMS', url: serviceUrl, options: { serviceId: 'S1', type: 'WMS' } },
        serviceUrl,
        caps,
        cfg
      );

      expect(group.queryable).toBe(true);
      expect(group.Layer![0].queryable).toBe(true);
      expect(childNested.queryable).toBe(true);
    });
  });

  describe('isRasterWms and isRasterWmts', () => {
    it('isRasterWms true for WMS type layer', () => {
      expect(service.isRasterWms({ type: 'WMS' }, 'http://x', minimalAppCfg())).toBe(
        true
      );
    });

    it('isRasterWmts true for WMTS type layer', () => {
      expect(
        service.isRasterWmts({ type: 'WMTS' }, 'http://x', minimalAppCfg())
      ).toBe(true);
    });

    it('isRasterWmts false for plain WMS type', () => {
      expect(
        service.isRasterWmts({ type: 'WMS' }, 'http://x', minimalAppCfg())
      ).toBe(false);
    });

    it('isRasterWms false for plain WMTS type', () => {
      expect(service.isRasterWms({ type: 'WMTS' }, 'http://x', minimalAppCfg())).toBe(
        false
      );
    });
  });

  describe('getRasterCapabilities', () => {
    const realLayerConfig = {
      url: 'http://localhost:9000/middleware/proxy/12/4/WMS/16',
      type: 'WMS',
      layerNames: ['ns:roads']
    };

    it('returns cached capabilities', () => {
      const capabilities = { Service: {} } as WMSCapabilities;
      const rasterInstancesCache = new Map([
        [`${realLayerConfig.url}|${realLayerConfig.type}`, { capabilities }]
      ]);

      const result = service.getRasterCapabilities(
        realLayerConfig,
        rasterInstancesCache
      );

      expect(result).toBe(capabilities);
    });

    it('returns null without fetching when capabilities are not cached', () => {
      const result = service.getRasterCapabilities(realLayerConfig, new Map());

      expect(result).toBeNull();
    });
  });

  describe('enrichRasterLayerInfo', () => {
    const enrichAppCfg = (overrides?: {
      layerMeta?: string;
      layerData?: string;
      serviceTitle?: unknown;
      serviceDescription?: unknown;
      serviceAbstract?: unknown;
      treeAbstract?: unknown;
    }): AppCfg => ({
      ...minimalAppCfg(),
      layers: [
        {
          id: 'layer/10',
          title: 'L1',
          layers: ['ns:roads'],
          service: 'S1',
          ...(overrides?.layerMeta != null
            ? { metadataURL: overrides.layerMeta }
            : {}),
          ...(overrides?.layerData != null
            ? { datasetURL: overrides.layerData }
            : {})
        }
      ],
      services: [
        {
          ...minimalAppCfg().services[0],
          ...(overrides?.serviceTitle != null
            ? { title: overrides.serviceTitle }
            : {}),
          ...(overrides?.serviceDescription != null
            ? { description: overrides.serviceDescription }
            : {}),
          ...(overrides?.serviceAbstract != null
            ? { abstract: overrides.serviceAbstract }
            : {})
        }
      ],
      trees: [
        {
          id: 'tree/1',
          title: 'T',
          image: null,
          rootNode: 'node/1',
          ...(overrides?.treeAbstract != null
            ? { abstract: overrides.treeAbstract }
            : {}),
          nodes: {
            'node/2': {
              title: 'Leaf',
              resource: 'layer/10',
              isRadio: false,
              children: [],
              order: 1
            }
          }
        }
      ]
    });

    const upstreamCaps = (): WMSCapabilities =>
      ({
        version: '1.3.0',
        Service: { Name: 'WMS', Title: 'S' },
        Capability: {
          Request: {} as any,
          Exception: { Format: ['XML'] },
          Layer: {
            Title: 'root',
            Layer: [
              {
                Name: 'ns:roads',
                Title: 'roads',
                MetadataURL: [
                  {
                    Format: 'text/xml',
                    OnlineResource: {
                      'xlink:href': 'https://upstream.example/metadata'
                    }
                  }
                ],
                DataURL: [
                  {
                    Format: 'application/zip',
                    OnlineResource: {
                      'xlink:href': 'https://upstream.example/data.zip'
                    }
                  }
                ]
              }
            ]
          }
        }
      }) as WMSCapabilities;

    it('uses profile metadataURL and datasetURL over upstream', () => {
      configLookup.initialize(
        enrichAppCfg({
          layerMeta: 'https://profile.example/md',
          layerData: 'https://profile.example/d.zip'
        })
      );
      const info = service.enrichRasterLayerInfo(
        'node/2',
        {
          url: 'https://wms.example/wms',
          type: 'WMS',
          layerNames: ['ns:roads']
        },
        upstreamCaps()
      );
      expect(info.metadata?.[0]?.url).toBe('https://profile.example/md');
      expect(info.dataUrl?.[0]?.url).toBe('https://profile.example/d.zip');
      expect(info.metadata?.[0]?.format).toBe('text/html');
      expect(info.dataUrl?.[0]?.format).toBe('application/zip');
    });

    it('suppresses upstream links when profile fields are explicitly empty', () => {
      configLookup.initialize(
        enrichAppCfg({
          layerMeta: '',
          layerData: ''
        })
      );
      const info = service.enrichRasterLayerInfo(
        'node/2',
        {
          url: 'https://wms.example/wms',
          type: 'WMS',
          layerNames: ['ns:roads']
        },
        upstreamCaps()
      );
      expect(info.metadata).toBeUndefined();
      expect(info.dataUrl).toBeUndefined();
    });

    it('suppresses upstream links and blank entries when profile fields are whitespace', () => {
      configLookup.initialize(
        enrichAppCfg({
          layerMeta: '   ',
          layerData: '   '
        })
      );
      const info = service.enrichRasterLayerInfo(
        'node/2',
        {
          url: 'https://wms.example/wms',
          type: 'WMS',
          layerNames: ['ns:roads']
        },
        upstreamCaps()
      );
      expect(info.metadata).toEqual([]);
      expect(info.dataUrl).toEqual([]);
    });

    it('falls back to upstream MetadataURL and DataURL when profile omits them', () => {
      configLookup.initialize(enrichAppCfg());
      const info = service.enrichRasterLayerInfo(
        'node/2',
        {
          url: 'https://wms.example/wms',
          type: 'WMS',
          layerNames: ['ns:roads']
        },
        upstreamCaps()
      );
      expect(info.metadata?.[0]?.url).toBe('https://upstream.example/metadata');
      expect(info.dataUrl?.[0]?.url).toBe('https://upstream.example/data.zip');
    });

    it('uses profile service description for service description display', () => {
      currentLanguage = 'ca';
      configLookup.initialize(
        enrichAppCfg({
          serviceDescription: {
            'ca-ES': 'Descripció catalana',
            'es-ES': 'Descripción castellana'
          },
          serviceAbstract: 'Profile abstract fallback'
        })
      );

      const info = service.enrichRasterLayerInfo(
        'node/2',
        {
          url: 'https://wms.example/wms',
          type: 'WMS',
          layerNames: ['ns:roads']
        },
        upstreamCaps()
      );

      expect(info.parentAbstract).toBe('Descripció catalana');
    });

    it('uses profile service abstract when service description is absent', () => {
      currentLanguage = 'ca';
      configLookup.initialize(
        enrichAppCfg({
          serviceAbstract: {
            'ca-ES': 'Abstracte català',
            'es-ES': 'Abstracto castellano'
          }
        })
      );

      const info = service.enrichRasterLayerInfo(
        'node/2',
        {
          url: 'https://wms.example/wms',
          type: 'WMS',
          layerNames: ['ns:roads']
        },
        upstreamCaps()
      );

      expect(info.parentAbstract).toBe('Abstracte català');
    });

    it('uses WMS service abstract only when profile service text is absent', () => {
      currentLanguage = 'ca';
      const caps = upstreamCaps();
      caps.Service.Abstract = {
        'ca-ES': 'Servei publicat en català',
        'es-ES': 'Servicio publicado en castellano'
      };
      configLookup.initialize(enrichAppCfg());

      const info = service.enrichRasterLayerInfo(
        'node/2',
        {
          url: 'https://wms.example/wms',
          type: 'WMS',
          layerNames: ['ns:roads']
        },
        caps
      );

      expect(info.parentAbstract).toBe('Servei publicat en català');
    });

    it('uses profile service title for service title display', () => {
      currentLanguage = 'ca';
      const caps = upstreamCaps();
      caps.Service.Title = {
        'ca-ES': 'Títol WMS',
        'es-ES': 'Título WMS'
      };
      configLookup.initialize(
        enrichAppCfg({
          serviceTitle: {
            'ca-ES': 'Títol català',
            'es-ES': 'Título castellano'
          }
        })
      );

      const info = service.enrichRasterLayerInfo(
        'node/2',
        {
          url: 'https://wms.example/wms',
          type: 'WMS',
          layerNames: ['ns:roads']
        },
        caps
      );

      expect(info.parentTitle).toBe('Títol català');
    });

    it('uses WMS service title when profile service title is absent', () => {
      currentLanguage = 'ca';
      const caps = upstreamCaps();
      caps.Service.Title = {
        'ca-ES': 'Títol WMS',
        'es-ES': 'Título WMS'
      };
      configLookup.initialize(enrichAppCfg());

      const info = service.enrichRasterLayerInfo(
        'node/2',
        {
          url: 'https://wms.example/wms',
          type: 'WMS',
          layerNames: ['ns:roads']
        },
        caps
      );

      expect(info.parentTitle).toBe('Títol WMS');
    });

    it('uses plain-string WMS service title when profile service title is absent', () => {
      const caps = upstreamCaps();
      caps.Service.Title = 'WMS service title';
      configLookup.initialize(enrichAppCfg());

      const info = service.enrichRasterLayerInfo(
        'node/2',
        {
          url: 'https://wms.example/wms',
          type: 'WMS',
          layerNames: ['ns:roads']
        },
        caps
      );

      expect(info.parentTitle).toBe('WMS service title');
    });

    it('lists every WMS layer id for composite catalog layers', () => {
      configLookup.initialize(enrichAppCfg());

      const info = service.enrichRasterLayerInfo(
        'node/2',
        {
          url: 'https://wms.example/wms',
          type: 'WMS',
          layerNames: ['ns:roads', 'ns:buildings']
        },
        upstreamCaps()
      );

      expect(info.name).toBe('roads, buildings');
    });
  });
});
