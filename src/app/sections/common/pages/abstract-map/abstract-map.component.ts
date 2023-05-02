import { Directive, OnInit } from '@angular/core';
import { ScriptService } from '@api/services/script.service';
import { Router } from '@angular/router';

declare const SITNA: any;
@Directive()
export abstract class AbstractMapComponent implements OnInit {
  applicationId: number | undefined;
  territoryId: number | undefined;

  protected constructor(
    protected router: Router,
    protected scriptService: ScriptService
  ) {
    const params = this.router.getCurrentNavigation()?.extras.state;
    if (params) {
      this.applicationId = params['applicationId'];
      this.territoryId = params['territoryId'];
      console.log('App ' + this.applicationId);
      console.log('Territory ' + this.territoryId);
    }
  }

  ngOnInit(): void {
    this.scriptService
      .load('sitna')
      .then(() => {
        SITNA.Cfg.crs = 'EPSG:25831';
        SITNA.Cfg.initialExtent = [
          243214.346608211, 4606384.0094297, 574809.60903833, 4650833.9854267
        ];
        // SITNA.Cfg.maxExtent = [];
        SITNA.Cfg.controls.attribution = true;
        SITNA.Cfg.baseLayers = [];
        SITNA.Cfg.baseLayers.push({
          id: 'PNOA',
          url: 'https://www.ign.es/wms-inspire/pnoa-ma',
          layerNames: 'OI.OrthoimageCoverage',
          isBase: true,
          thumbnail: '/assets/js/sitna/TC/css/img/thumb-orthophoto_pnoa.jpg',
          overviewMapLayer: {
            id: 'pnoa_ov',
            type: SITNA.Consts.layerType.WMS,
            url: 'https://www.ign.es/wms-inspire/pnoa-ma',
            layerNames: 'OI.OrthoimageCoverage'
          }
        });
        SITNA.Cfg.workLayers = [];
        SITNA.Cfg.workLayers.push({
          id: 'MUN',
          title: 'Límites administrativos',
          url: 'https://sitmun.diba.cat/arcgis/services/PUBLIC/DTE50/MapServer/WmsServer',
          layerNames: ['DTE50_MUN', 'DTE50_PROV']
        });

        SITNA.Cfg.layout = {
          config: '/assets/js/sitna/TC/layout/responsive/config.json',
          markup: '/assets/js/sitna/TC/layout/responsive/markup.html',
          style: '/assets/sitna.css',
          script: '/assets/js/sitna/TC/layout/responsive/script.js',
          i18n: '/assets/js/sitna/TC/layout/responsive/resources'
        };

        SITNA.Cfg.controls.layerCatalog = {
          div: 'catalog',
          enableSearch: true,
          layers: [
            {
              id: 'dte50',
              title: 'Delimitacions Barcelona',
              hideTitle: false,
              type: SITNA.Consts.layerType.WMS,
              url: 'https://sitmun.diba.cat/arcgis/services/PUBLIC/DTE50/MapServer/WMSServer',
              hideTree: false,
              format: ''
            }
          ]
        };

        SITNA.Cfg.baseLayers = [
          {
            id: 'icgc_orto',
            url: 'https://geoserveis.icgc.cat/icc_mapesmultibase/utm/wmts/service ',
            layerNames: 'orto',
            type: 'WMTS',
            title: 'WMTS Bases - ICGC - Orto',
            format: 'image/png',
            matrixSet: 'UTM25831',
            thumbnail:
              'https://geoserveis.icgc.cat/icc_mapesmultibase/utm/wmts/orto/UTM25831/1/0/1.png',
            isBase: true
          },
          {
            id: 'icgc_topo',
            url: 'https://geoserveis.icgc.cat/icc_mapesmultibase/utm/wmts/service ',
            layerNames: 'topo',
            type: 'WMTS',
            title: 'WMTS Bases - ICGC- Topo',
            format: 'image/jpeg',
            matrixSet: 'UTM25831',
            thumbnail:
              'https://geoserveis.icgc.cat/icc_mapesmultibase/utm/wmts/topo/UTM25831/1/0/1.jpeg',
            isBase: true
          }
        ];

        // SITNA.Cfg.layout = {
        //   config: '/assets/IDEMenorca/config.json',
        //   markup: '/assets/IDEMenorca/markup.html',
        //   style: '/assets/IDEMenorca/style.css',
        //   script: '/assets/IDEMenorca//script.js',
        //   i18n: '/assets/IDEMenorca//resources'
        // };

        new SITNA.Map('mapa');
      })
      .catch((error) => console.error(error));
  }
}
