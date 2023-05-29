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
import { SitnaHelper } from '@ui/util/sitna-helpers';

declare const SITNA: any;

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
      this.applicationId = Number(params['applicationId']);
      this.territoryId = Number(params['territoryId']);
      this.commonService
        .fetchMapConfiguration(this.applicationId, this.territoryId)
        .subscribe((appCfg) => {
          this.loadMap(appCfg);
        });
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
    const body = this.document.body;
    const div = body.querySelector(`.${className}`);
    if (div) {
      const father = div.parentNode;
      if (father) {
        this.renderer.removeChild(body, father);
      }
    }
  }

  loadMap(appCfg: AppCfg) {
    new SITNA.Map('mapa', {
      crs: SitnaHelper.toCrs(appCfg),
      initialExtent: SitnaHelper.toInitialExtent(appCfg),
      layout: SitnaHelper.toLayout(appCfg),
      baseLayers: SitnaHelper.toBaseLayers(appCfg),
      workLayers: SitnaHelper.toWorkLayers(appCfg),
      controls: SitnaHelper.toControls(appCfg),
      views: SitnaHelper.toViews(appCfg)
    });
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
}
