import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OpenModalService } from '@ui/modal/service/open-modal.service';
import { AppCfg, GeneralCfg } from '@api/model/app-cfg';
import { SitnaHelper } from '@ui/util/sitna-helpers';
import { CommonService } from '@api/services/common.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';
import { NavigationPath } from '@config/app.config';
import { DashboardModalComponent } from '@sections/common/modals/dashboard-modal/dashboard-modal.component';
import { ErrorModalComponent } from '@sections/common/modals/error-modal/error-modal.component';

declare const SITNA: any;

@Directive()
export abstract class AbstractMapComponent implements OnInit, OnDestroy {
  private componentDestroyed = new Subject<void>();
  private isInEmbedded: boolean;
  applicationId!: number;
  territoryId!: number;
  locale: string | undefined;

  protected constructor(
    private translate: TranslateService,
    private location: Location,
    protected route: ActivatedRoute,
    protected router: Router,
    protected commonService: CommonService,
    protected modal: OpenModalService,
    private renderer: Renderer2,
    private el: ElementRef,
    private document: Document
  ) {
    const path = this.location.path();
    this.isInEmbedded = path.includes('embedded');

    const currentLang = this.translate.currentLang;
    this.locale = this.parseLang(currentLang);
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.applicationId = Number(params['applicationId']);
      this.territoryId = Number(params['territoryId']);
      if (this.isInEmbedded) {
        this.locale = this.parseLang(params['lang']);
      }
      this.clearMap();
      this.commonService
        .fetchMapConfiguration(this.applicationId, this.territoryId)
        .subscribe((appCfg) => {
          if (appCfg) {
            this.loadMap(appCfg);
          }
        });
    });

    if (!this.isInEmbedded) {
      this.translate.onLangChange
        .pipe(takeUntil(this.componentDestroyed))
        .subscribe((event) => {
          this.router.navigateByUrl('/').then(() => {
            this.navigateToMap();
          });
        });
    }
  }

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
    this.clearMap();
  }

  abstract navigateToMap(): any;

  removeSitnaDivs() {
    const divs = this.document.querySelectorAll('.tc-modal');
    divs.forEach((div) => {
      const father = div.parentElement;
      div.remove();
      if (father && father.innerHTML.trim() === '') {
        this.renderer.removeChild(this.document.body, father);
      }
    });
  }

  removeEmptyDivs() {
    const divElements = this.document.body.querySelectorAll('div');
    divElements.forEach((div: HTMLElement) => {
      if (
        !div.classList.length &&
        !div.getAttribute('id') &&
        div.innerHTML.trim() === ''
      ) {
        this.renderer.removeChild(document.body, div);
      }
    });
  }

  loadMap(appCfg: AppCfg) {
    const config = {
      locale: this.locale,
      crs: SitnaHelper.toCrs(appCfg),
      initialExtent: SitnaHelper.toInitialExtent(appCfg),
      layout: SitnaHelper.toLayout(appCfg),
      baseLayers: SitnaHelper.toBaseLayers(appCfg),
      //workLayers: SitnaHelper.toWorkLayers(appCfg),
      controls: SitnaHelper.toControls(appCfg),
      views: SitnaHelper.toViews(appCfg)
    };

    let cfgCheck = this.checkConfiguration(config);

    const layerCatalogSilme = SitnaHelper.toLayerCatalogSilme(appCfg);
    if (cfgCheck.ok && !layerCatalogSilme) {
      cfgCheck = {
        ok: false,
        message: 'map.error.layerCatalog'
      };
    }

    if (!cfgCheck.ok) {
      const ref = this.modal.open(ErrorModalComponent, {
        data: { message: cfgCheck.message }
      });
      ref.afterClosed.subscribe(() => {
        this.navigateToDashboard();
      });
      return;
    }

    SITNA.Cfg.controls.layerCatalogSilme = layerCatalogSilme;
    //SITNA.Cfg.controls = SitnaHelper.toControls(appCfg);
    const map = new SITNA.Map('mapa', config);

    map.loaded(function () {
      SitnaHelper.toWelcome(appCfg);
      SitnaHelper.toHelp(appCfg);
      SitnaHelper.toInterface();
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
    this.removeSitnaDivs();
    this.removeEmptyDivs();
  }

  parseLang(lang: string): string {
    switch (lang) {
      case 'es':
        return lang.concat('-ES');
      case 'en':
        return lang.concat('-US');
      case 'ca':
        return lang.concat('-CA');
      default:
        return 'es-ES';
    }
  }

  checkConfiguration(cfg: GeneralCfg) {
    if (!cfg.locale) {
      return {
        ok: false,
        message: 'map.error.locale'
      };
    } else if (!cfg.crs) {
      return {
        ok: false,
        message: 'map.error.crs'
      };
    } else if (!cfg.initialExtent) {
      return {
        ok: false,
        message: 'map.error.initialExtent'
      };
    } else if (!cfg.baseLayers.length) {
      return {
        ok: false,
        message: 'map.error.baseLayers'
      };
    }
    return {
      ok: true
    };
  }

  abstract navigateToDashboard(): any;
}
