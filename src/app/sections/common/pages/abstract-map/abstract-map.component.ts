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
import { ErrorModalComponent } from '@sections/common/modals/error-modal/error-modal.component';

declare const SITNA: any;

@Directive()
export abstract class AbstractMapComponent implements OnInit, OnDestroy {
  private componentDestroyed = new Subject<void>();
  private isInEmbedded: boolean;
  private layerCatalogsSilme: any;
  private currentCatalogIdx: number;
  private currentGeneralCfg: GeneralCfg | undefined;
  private currentAppCfg: AppCfg | undefined
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
    this.currentCatalogIdx = 0;
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
            this.loadConfig(appCfg);
            // There might be a new theme in the recently fetched appCfg
            // We will share it with the rest of the app via
            // the commonService.updateMessage()
            this.commonService.updateMessage(appCfg.application.theme);
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

    // Expose the current map
    // Maybe this needs a proper refactor to avoid this kind of things...
    (window as any).abstractMapObject = this;
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

  loadConfig(appCfg: AppCfg) {
    this.currentAppCfg = appCfg;
    this.currentGeneralCfg = {
      locale: this.locale,
      crs: SitnaHelper.toCrs(appCfg),
      initialExtent: SitnaHelper.toInitialExtent(appCfg),
      layout: SitnaHelper.toLayout(appCfg),
      baseLayers: SitnaHelper.toBaseLayers(appCfg),
      controls: SitnaHelper.toControls(appCfg),
      views: SitnaHelper.toViews(appCfg)
    };

    // We need to save the currentGeneralCfg and the currentAppCfg, so when the
    // catalog change, the map can be loaded again with the same configuration

    let cfgCheck = this.checkConfiguration(this.currentGeneralCfg);
    this.layerCatalogsSilme = SitnaHelper.toLayerCatalogSilme(appCfg);

    // if (cfgCheck.ok && !this.layerCatalogsSilme.length) {
    //   cfgCheck = {
    //     ok: false,
    //     message: 'map.error.layerCatalog'
    //   };
    // }

    if (!cfgCheck.ok) {
      const ref = this.modal.open(ErrorModalComponent, {
        data: { message: cfgCheck.message }
      });
      ref.afterClosed.subscribe(() => {
        this.navigateToDashboard();
      });
      return;
    }

    // Parse the catalogs so we can use them in the LayerCatalogSilme.js
    let idx = -1;
    (window as any).layerCatalogsSilmeForModal = new Object({
      currentCatalog: this.currentCatalogIdx,
      catalogs: this.layerCatalogsSilme.map((catalog: any) => {
        return { id: ++idx, catalog: catalog.title };
      })
    });

    if (this.layerCatalogsSilme.length > 1) {
      SITNA.Cfg.controls.layerCatalogSilme = this.layerCatalogsSilme[this.currentCatalogIdx].catalog;
    } else {
      SITNA.Cfg.controls.layerCatalogSilme = {};
    }

    this.loadMap(this.currentAppCfg, this.currentGeneralCfg);
  }

  updateCatalog() {
    if (this.currentAppCfg === undefined || this.currentGeneralCfg === undefined) {
      return; // This is a safeguard, but it should never happen
    }
    this.currentCatalogIdx = (window as any).layerCatalogsSilmeForModal.currentCatalog;
    SITNA.Cfg.controls.layerCatalogSilme = this.layerCatalogsSilme[this.currentCatalogIdx].catalog;
    this.clearMap();
    this.loadMap(this.currentAppCfg, this.currentGeneralCfg);

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

  private loadMap(appCfg: AppCfg, cfg: GeneralCfg) {
    const map = new SITNA.Map('mapa', cfg);
    map.loaded(function() {
      SitnaHelper.toWelcome(appCfg);
      SitnaHelper.toHelp(appCfg);
      SitnaHelper.toInterface();
    });
  }

  abstract navigateToDashboard(): any;
}
