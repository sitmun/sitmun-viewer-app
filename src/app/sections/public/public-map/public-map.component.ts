import { Component, ElementRef, Inject, Renderer2 } from '@angular/core';
import { AbstractMapComponent } from '@sections/common/pages/abstract-map/abstract-map.component';
import { ActivatedRoute, Router } from '@angular/router';
import { OpenModalService } from '@ui/modal/service/open-modal.service';
import { LoginModalComponent } from '@sections/common/modals/login-modal/login-modal.component';
import { NavigationPath } from '@config/app.config';
import { CommonService } from '@api/services/common.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-public-map',
  templateUrl: './public-map.component.html',
  styleUrls: ['./public-map.component.scss']
})
export class PublicMapComponent extends AbstractMapComponent {
  constructor(
    route: ActivatedRoute,
    router: Router,
    commonService: CommonService,
    modal: OpenModalService,
    renderer: Renderer2,
    el: ElementRef,
    @Inject(DOCUMENT) document: Document
  ) {
    super(route, router, commonService, modal, renderer, el, document);
  }

  openLoginModal() {
    const ref = this.modal.open(LoginModalComponent, {
      data: { applicationId: this.applicationId, territoryId: this.territoryId }
    });
    ref.afterClosed.subscribe(() => {
      this.clearMap();
      this.router
        .navigateByUrl(NavigationPath.Section.User.Dashboard)
        .then(() => {
          this.router.navigateByUrl(
            NavigationPath.Section.User.Map(
              this.applicationId,
              this.territoryId
            )
          );
        });
    });
  }

  override navigateToMap(applicationId: number, territoryId: number) {
    this.router.navigateByUrl(
      NavigationPath.Section.Public.Map(applicationId, territoryId)
    );
    // .then(() => {
    //   window.location.reload();
    // });
  }

  // ngOnInit(): void {
  //   this.scriptService
  //     .load('sitna')
  //     .then(() => {
  //       SITNA.Cfg.crs = 'EPSG:25831';
  //
  //       SITNA.Cfg.baseLayers = [];
  //       // SITNA.Cfg.baseLayers.push({
  //       //   id: 'PNOA',
  //       //   url: 'http://www.ign.es/wms-inspire/pnoa-ma',
  //       //   layerNames: 'OI.OrthoimageCoverage',
  //       //   isBase: true
  //       // });
  //       // SITNA.Cfg.defaultBaseLayer = 'PNOA';
  //
  //       SITNA.Cfg.workLayers.push({
  //         id: 'MUN',
  //         url: 'https://sitmun.diba.cat/arcgis/services/PUBLIC/DTE50/MapServer/WmsServer',
  //         layerNames: 'DTE50_MUN'
  //       });
  //
  //       SITNA.Cfg.initialExtent = [
  //         243214.346608211, 4606384.0094297, 574809.60903833, 4650833.9854267
  //       ];
  //       // SITNA.Cfg.maxExtent = [];
  //       SITNA.Cfg.layout = {
  //         config: '/assets/js/sitna/TC/layout/responsive/config.json',
  //         markup: '/assets/js/sitna/TC/layout/responsive/markup.html',
  //         style: '/assets/sitna.css',
  //         script: '/assets/js/sitna/TC/layout/responsive/script.js',
  //         i18n: '/assets/js/sitna/TC/layout/responsive/resources'
  //       };
  //
  //       new SITNA.Map('mapa');
  //     })
  //     .catch((error) => console.log(error));
  // }
}
