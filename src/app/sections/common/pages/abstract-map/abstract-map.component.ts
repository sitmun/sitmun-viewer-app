import { Directive, OnInit } from '@angular/core';
import { ScriptService } from '@api/services/script.service';
import { Router } from '@angular/router';
import { AppCfg } from '@api/model/app-cfg';
import { SitnaControlsHelper } from '@ui/util/sitna-helpers';

declare const SITNA: any;

const apiConfigSitmun: AppCfg = {
  application: {
    id: 1,
    title: 'SITMUN - Municipal',
    type: 'I',
    theme: 'sitmun-diba',
    srs: 'EPSG:25831',
    'situation-map': 'group/3'
  },
  territory: {
    initialExtent: [363487.0, 4561229.0, 481617.0, 4686464.0]
  },
  backgrounds: [
    {
      id: 'group/2',
      title: 'Background Map'
    }
  ],
  groups: [
    {
      id: 'group/1',
      title: 'Cartography Group',
      layers: ['layer/3']
    },
    {
      id: 'group/2',
      title: 'Background Map',
      layers: ['layer/1', 'layer/2']
    },
    {
      id: 'group/3',
      title: 'Situation Map',
      layers: ['layer/2']
    }
  ],
  layers: [
    {
      id: 'layer/3',
      title: 'PNOA',
      layers: ['OI.OrthoimageCoverage'],
      service: {
        url: 'https://www.ign.es/wms-inspire/pnoa-ma',
        type: 'WMS',
        parameters: {}
      }
    },
    {
      id: 'layer/1',
      title: 'WMTS Bases - ICGC- Topo',
      layers: ['topo'],
      service: {
        url: 'https://geoserveis.icgc.cat/icc_mapesmultibase/utm/wmts/service',
        type: 'WMTS',
        parameters: {
          matrixSet: 'UTM25831',
          format: 'image/jpeg'
        }
      }
    },
    {
      id: 'layer/2',
      title: 'WMTS Bases - ICGC- Orto',
      layers: ['orto'],
      service: {
        url: 'https://geoserveis.icgc.cat/icc_mapesmultibase/utm/wmts/service',
        type: 'WMTS',
        parameters: {
          matrixSet: 'UTM25831',
          format: 'image/jpeg'
        }
      }
    },
    {
      id: 'layer/4',
      title: 'LÃmites administrativos',
      layers: ['DTE50_MUN', 'DTE50_PROV'],
      service: {
        url: 'https://sitmun.diba.cat/arcgis/services/PUBLIC/DTE50/MapServer/WmsServer',
        type: 'WMS',
        parameters: {}
      }
    }
  ],
  tasks: [
    {
      id: 'task/1',
      'ui-control': 'attribution'
    },
    {
      id: 'task/2',
      'ui-control': 'basemapSelector'
    },
    {
      id: 'task/3',
      'ui-control': 'click'
    },
    {
      id: 'task/4',
      'ui-control': 'coordinates'
    },
    {
      id: 'task/5',
      'ui-control': 'dataLoader'
    },
    {
      id: 'task/6',
      'ui-control': 'download'
    },
    {
      id: 'task/7',
      'ui-control': 'drawMeasureModify'
    },
    {
      id: 'task/9',
      'ui-control': 'fullScreen'
    },
    {
      id: 'task/10',
      'ui-control': 'geolocation'
    },
    {
      id: 'task/12',
      'ui-control': 'legend'
    },
    {
      id: 'task/13',
      'ui-control': 'loadingIndicator'
    },
    {
      id: 'task/14',
      'ui-control': 'measure'
    },
    {
      id: 'task/16',
      'ui-control': 'navBar'
    },
    {
      id: 'task/17',
      'ui-control': 'offlineMapMaker'
    },
    {
      id: 'task/18',
      'ui-control': 'overviewMap'
    },
    {
      id: 'task/19',
      'ui-control': 'popup'
    },
    {
      id: 'task/20',
      'ui-control': 'printMap'
    },
    {
      id: 'task/21',
      'ui-control': 'scale'
    },
    {
      id: 'task/22',
      'ui-control': 'scaleBar'
    },
    {
      id: 'task/23',
      'ui-control': 'scaleSelector'
    },
    {
      id: 'task/24',
      'ui-control': 'search'
    },
    {
      id: 'task/25',
      'ui-control': 'share'
    },
    {
      id: 'task/26',
      'ui-control': 'streetView'
    },
    {
      id: 'task/28',
      'ui-control': 'TOC'
    },
    {
      id: 'task/31',
      'ui-control': 'workLayerManager'
    }
  ]
};

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
        SITNA.Cfg.crs = SitnaControlsHelper.toCrs(apiConfigSitmun).crs;
        SITNA.Cfg.initialExtent =
          SitnaControlsHelper.toInitialExtent(apiConfigSitmun).initialExtent;
        SITNA.Cfg.proxy = 'proxy/proxy.ashx?';
        SITNA.Cfg.mouseWheelZoom = false;
        SITNA.Cfg.baseLayers =
          SitnaControlsHelper.toBaseLayers(apiConfigSitmun).baseLayers;
        SITNA.Cfg.workLayers =
          SitnaControlsHelper.toWorkLayers(apiConfigSitmun);
        SITNA.Cfg.controls = SitnaControlsHelper.toControls(apiConfigSitmun);
        SITNA.Cfg.views = {
          threeD: {
            div: 'vista3d' // Indicamos el identificador del DIV en el marcado en el cual cargar la vista 3D.
          }
        };
        // Añadimos el control 3D.
        SITNA.Cfg.controls.threeD = true;
        SITNA.Cfg.layout = {
          config: '/assets/js/sitna/TC/layout/responsive/config.json',
          markup: '/assets/js/sitna/TC/layout/responsive/markup.html',
          style: '/assets/sitna.css',
          script: '/assets/js/sitna/TC/layout/responsive/script.js',
          i18n: '/assets/js/sitna/TC/layout/responsive/resources'
        };

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
