import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ApplicationDto,
  CommonService,
  DashboardTypes,
  TerritoryDto
} from '@api/services/common.service';
import { DashboardModalComponent } from '@sections/common/modals/dashboard-modal/dashboard-modal.component';
import { OpenModalService } from '@ui/modal/service/open-modal.service';
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
      id: 'task/8',
      'ui-control': 'featureInfo'
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
      id: 'task/11',
      'ui-control': 'layerCatalog'
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
      id: 'task/15',
      'ui-control': 'multiFeatureInfo'
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
      id: 'task/27',
      'ui-control': 'threed'
    },
    {
      id: 'task/28',
      'ui-control': 'TOC'
    },
    {
      id: 'task/29',
      'ui-control': 'WFSEdit'
    },
    {
      id: 'task/30',
      'ui-control': 'WFSQuery'
    },
    {
      id: 'task/31',
      'ui-control': 'workLayerManager'
    }
  ]
};

@Directive()
export abstract class AbstractMapComponent implements OnInit, OnDestroy {
  applicationId!: number;
  territoryId!: number;

  protected constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected commonService: CommonService,
    protected modal: OpenModalService,
    private renderer: Renderer2,
    private el: ElementRef,
    private document: Document
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      console.log('data', params);
      this.applicationId = Number(params['applicationId']);
      this.territoryId = Number(params['territoryId']);

      this.loadMap();
    });
  }

  ngOnDestroy() {
    this.clearMap();
  }

  abstract navigateToMap(applicationId: number, territoryId: number): any;

  openModal(
    id: number,
    type: DashboardTypes,
    items: Array<ApplicationDto> | Array<TerritoryDto>
  ) {
    const ref = this.modal.open(DashboardModalComponent, {
      data: { id: id, type: type, items: items }
    });
    ref.afterClosed.subscribe(({ applicationId, territoryId }) => {
      this.clearMap();
      this.navigateToMap(applicationId, territoryId);
    });
  }

  changeApplication() {
    const response = this.commonService.fetchApplicationsByTerritory(
      this.territoryId
    );
    response?.subscribe((applications: Array<ApplicationDto>) => {
      if (applications.length) {
        if (applications.length === 1) {
          this.applicationId = applications[0].id;
          this.navigateToMap(this.applicationId, this.territoryId);
        } else {
          this.openModal(
            this.territoryId,
            DashboardTypes.TERRITORIES,
            applications
          );
        }
      }
    });
  }

  changeTerritory() {
    const response = this.commonService.fetchTerritoriesByApplication(
      this.applicationId
    );
    response?.subscribe((territories: Array<TerritoryDto>) => {
      if (territories.length) {
        if (territories.length === 1) {
          this.territoryId = territories[0].id;
          this.navigateToMap(this.applicationId, this.territoryId);
        } else {
          this.openModal(
            this.applicationId,
            DashboardTypes.APPLICATIONS,
            territories
          );
        }
      }
    });
  }

  removeSitnaDiv(className: string) {
    console.log(`.${className}`);
    const body = this.document.body;
    const div = body.querySelector(`.${className}`);
    if (div) {
      const father = div.parentNode;
      if (father) {
        this.renderer.removeChild(body, father);
      }
    }
  }

  clearMap() {
    // Map container
    const mapFather = this.el.nativeElement.querySelector('.map-container');
    const map = this.el.nativeElement.querySelector('#mapa');
    const overview = this.el.nativeElement.querySelector(
      '.tc-ctl-sv-view.tc-hidden'
    );
    if (map) {
      this.renderer.removeChild(mapFather, map);
    }
    if (overview) {
      this.renderer.removeChild(mapFather, overview);
    }

    const div = this.renderer.createElement('div');
    this.renderer.setAttribute(div, 'id', 'mapa');
    this.renderer.appendChild(mapFather, div);

    // Body
    this.removeSitnaDiv('tc-ctl-finfo-dialog');
    this.removeSitnaDiv('tc-ctl-finfo-dialog');
    this.removeSitnaDiv('tc-ctl-bms-more-dialog');
    this.removeSitnaDiv('tc-ctl-lcat-crs-dialog');
    this.removeSitnaDiv('tc-ctl-coords-crs-dialog');
    this.removeSitnaDiv('tc-ctl-search-dialog');
    this.removeSitnaDiv('tc-ctl-finfo-dialog');
    this.removeSitnaDiv('tc-ctl-ftools-dialog');
    this.removeSitnaDiv('tc-ctl-share-qr-dialog');
    this.removeSitnaDiv('tc-ctl-search-dialog');
  }

  loadMap() {
    let initialExtent: number[];
    if (this.territoryId === 10) {
      // Galicia
      initialExtent = [-610681, 4681188, -160633, 4908516];
    } else {
      // Cataluña
      initialExtent = [
        243214.346608211, 4606384.0094297, 574809.60903833, 4650833.9854267
      ];
    }
    new SITNA.Map('mapa', {
      crs: SitnaControlsHelper.toCrs(apiConfigSitmun).crs,
      initialExtent:
        this.territoryId === 10
          ? initialExtent
          : SitnaControlsHelper.toInitialExtent(apiConfigSitmun).initialExtent,
      layout: {
        config: '/assets/js/sitna/TC/layout/responsive/config.json',
        markup: '/assets/js/sitna/TC/layout/responsive/markup.html',
        style: '/assets/sitna.css',
        script: '/assets/js/sitna/TC/layout/responsive/script.js',
        i18n: '/assets/js/sitna/TC/layout/responsive/resources'
      },
      baseLayers: SitnaControlsHelper.toBaseLayers(apiConfigSitmun).baseLayers,
      //workLayers: SitnaControlsHelper.toWorkLayers(apiConfigSitmun),
      controls: SitnaControlsHelper.toControls(apiConfigSitmun),
      views: SitnaControlsHelper.toViews(apiConfigSitmun)
    });
  }
}
