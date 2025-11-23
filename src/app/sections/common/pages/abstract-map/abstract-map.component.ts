import {
  AfterViewInit,
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
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';
import { ErrorModalComponent } from '@sections/common/modals/error-modal/error-modal.component';
import { Cfg as SitnaCfg } from 'api-sitna';
import SitnaMap from 'api-sitna';

@Directive()
export abstract class AbstractMapComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  private componentDestroyed = new Subject<void>();
  private isInEmbedded: boolean;
  private layerCatalogsSilme: any;
  private currentCatalogIdx: number;
  private currentGeneralCfg: GeneralCfg | undefined;
  private currentAppCfg: AppCfg | undefined;
  private commonServiceSubscription: Subscription | undefined;
  private map: any;
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
      this.commonServiceSubscription = this.commonService
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

  ngAfterViewInit() {
    // Wait for SITNA to be available before initializing map
    this.waitForSITNAAndInitialize();
  }

  ngOnDestroy() {
    if (this.commonServiceSubscription) {
      this.commonServiceSubscription.unsubscribe();
    }
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

    SitnaHelper.loadMiddleware(appCfg);

    // We need to save the currentGeneralCfg and the currentAppCfg, so when the
    // catalog change, the map can be loaded again with the same configuration

    let cfgCheck = this.checkConfiguration(this.currentGeneralCfg);
    this.layerCatalogsSilme = SitnaHelper.toLayerCatalogSilme(appCfg);

    if (!cfgCheck.ok) {
      const ref = this.modal.open(ErrorModalComponent, {
        data: { message: cfgCheck.message }
      });
      ref.afterClosed.subscribe(() => {
        this.navigateToDashboard();
      });
      return;
    }

    // Order layers
    this.layerCatalogsSilme.forEach((tree: any) => {
      const layersAux = tree.catalog.layers;
      const groupAux = tree.catalog.layerTreeGroups;
      tree.catalog.layers = this.orderLayers(layersAux, groupAux);
    });

    // Parse the catalogs, so we can use them in the LayerCatalogSilme.js
    let idx = -1;
    (window as any).layerCatalogsSilmeForModal = new Object({
      currentCatalog: this.currentCatalogIdx,
      catalogs: this.layerCatalogsSilme.map((catalog: any) => {
        return { id: ++idx, catalog: catalog.title };
      })
    });

    const catalogCfg =
      this.layerCatalogsSilme.length > 0
        ? this.layerCatalogsSilme[this.currentCatalogIdx].catalog
        : {};
    SitnaCfg.controls.layerCatalogSilmeFolders = catalogCfg;
    this.loadMap(this.currentAppCfg, this.currentGeneralCfg);
  }

  updateCatalog() {
    if (
      this.currentAppCfg === undefined ||
      this.currentGeneralCfg === undefined
    ) {
      return; // This is a safeguard, but it should never happen
    }
    this.currentCatalogIdx = (
      window as any
    ).layerCatalogsSilmeForModal.currentCatalog;
    SitnaCfg.controls.layerCatalogSilmeFolders = this.layerCatalogsSilme[this.currentCatalogIdx].catalog;
    this.clearMap();
    this.loadMap(this.currentAppCfg, this.currentGeneralCfg);
  }

  clearMap() {
    // Map container
    const mapFather = this.el.nativeElement.querySelector('.map-container');
    const warningModal = this.el.nativeElement.querySelector('.modal-view');
    const overview = this.el.nativeElement.querySelector(
      '.tc-ctl-sv-view.tc-hidden'
    );
    if (this.map) {
      this.renderer.removeChild(mapFather, this.map);
    }
    if (overview) {
      this.renderer.removeChild(mapFather, overview);
    }

    if (warningModal) {
      this.renderer.removeChild(this.document.body, warningModal);
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
    try {
      this.map = new SitnaMap('mapa', cfg);
    } catch (error) {
      console.error('Failed to initialize map:', error);
      return;
    }

    this.map.loaded(function () {
      SitnaHelper.toWelcome(appCfg);
      SitnaHelper.toHelp(appCfg);
      SitnaHelper.toInterface();
    });
  }

  private orderLayers(layers: any[], groups: any[]): any[] {
    const groupsMap = new Map<string, any>();
    groups.forEach((group) => groupsMap.set(group.id, group));

    // Build the path to the root for each layer
    function buildPathToRoot(layer: any): number[] {
      let path: number[] = [layer.order];
      let currentGroup = groupsMap.get(layer.parentGroupNode);

      while (currentGroup) {
        path.unshift(currentGroup.order); // Add the group order to the start of the path
        currentGroup =
          currentGroup.parentNode && currentGroup.parentNode !== currentGroup.id
            ? groupsMap.get(currentGroup.parentNode)
            : null;
      }

      return path;
    }

    // Assign each layer its "order path"
    const layersWithPaths = layers.map((layer) => ({
      layer,
      path: buildPathToRoot(layer)
    }));

    // Sort the layers based on their "order paths"
    layersWithPaths.sort((a, b) => {
      const minLength = Math.min(a.path.length, b.path.length);
      for (let i = 0; i < minLength; i++) {
        if (a.path[i] !== b.path[i]) {
          return a.path[i] - b.path[i];
        }
      }

      // In case of a tie, the shorter path wins
      return a.path.length - b.path.length;
    });

    // Returns the sorted list of layers
    return layersWithPaths.map((item) => item.layer);
  }

  private waitForSITNAAndInitialize(): void {
    const checkSITNA = () => {
      const sitna = (window as any).SITNA;
      if (sitna && sitna.Map) {
        return;
      } else {
        // SITNA not ready yet, try again in 100ms
        setTimeout(checkSITNA, 100);
      }
    };

    checkSITNA();
  }

  abstract navigateToDashboard(): any;
}
