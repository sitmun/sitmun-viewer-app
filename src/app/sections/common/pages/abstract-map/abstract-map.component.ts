import { Location } from '@angular/common';
import {
  AfterViewInit,
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AppCfg, GeneralCfg } from '@api/model/app-cfg';
import { CommonService } from '@api/services/common.service';
import { TranslateService } from '@ngx-translate/core';
import { ErrorModalComponent } from '@sections/common/modals/error-modal/error-modal.component';
import { OpenModalService } from '@ui/modal/service/open-modal.service';
import SitnaMap from 'api-sitna';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppConfigService } from 'src/app/services/app-config.service';
import { ConfigLookupService } from 'src/app/services/config-lookup.service';
import { ControlRegistryService } from 'src/app/services/control-registry.service';
import { MapConfigurationService } from 'src/app/services/map-configuration.service';
import { MapInterfaceService } from 'src/app/services/map-interface.service';
import { MapServiceWorkerService } from 'src/app/services/map-service-worker.service';

@Directive()
export abstract class AbstractMapComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  private componentDestroyed = new Subject<void>();
  private isInEmbedded: boolean;
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
    private document: Document,
    private controlRegistry: ControlRegistryService,
    private configLookup: ConfigLookupService,
    private mapConfig: MapConfigurationService,
    private mapInterface: MapInterfaceService,
    private mapServiceWorker: MapServiceWorkerService,
    private appConfigService: AppConfigService
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
        .subscribe(async (appCfg) => {
          if (appCfg) {
            await this.loadConfig(appCfg);
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
        .subscribe(() => {
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

  async loadConfig(appCfg: AppCfg) {
    this.currentAppCfg = appCfg;

    // Initialize lookup service for efficient entity lookups
    this.configLookup.initialize(appCfg);

    // Process controls using handler system
    const controls = await this.controlRegistry.processControls(
      appCfg.tasks,
      appCfg
    );

    const attribution = this.mapConfig.toAttribution();

    this.currentGeneralCfg = {
      locale: this.locale,
      crs: this.mapConfig.toCrs(appCfg),
      initialExtent: this.mapConfig.toInitialExtent(appCfg),
      attribution: attribution,
      layout: this.mapConfig.toLayout(appCfg),
      baseLayers: this.mapConfig.toBaseLayers(appCfg),
      controls: controls as any, // Handler system returns Partial<SitnaControls>
      views: this.mapConfig.toViews(appCfg)
    };

    this.mapServiceWorker.loadMiddleware(appCfg);

    // We need to save the currentGeneralCfg and the currentAppCfg, so when the
    // catalog change, the map can be loaded again with the same configuration

    if (!this.currentGeneralCfg) {
      return;
    }

    const cfgCheck = this.checkConfiguration(this.currentGeneralCfg);

    if (!cfgCheck.ok) {
      const ref = this.modal.open(ErrorModalComponent, {
        data: { message: cfgCheck.message }
      });
      ref.afterClosed.subscribe(() => {
        this.navigateToDashboard();
      });
      return;
    }

    if (!this.currentAppCfg || !this.currentGeneralCfg) {
      console.error(
        '[AbstractMapComponent] Config is undefined, cannot load map'
      );
      return;
    }

    this.loadMap(this.currentAppCfg, this.currentGeneralCfg);
  }

  updateCatalog() {
    if (
      this.currentAppCfg === undefined ||
      this.currentGeneralCfg === undefined
    ) {
      return; // This is a safeguard, but it should never happen
    }

    const layerCatalogsForModal = (window as any).layerCatalogsForModal;

    if (layerCatalogsForModal) {
      // Rebuild controls to pick up the new currentTreeId
      this.controlRegistry
        .processControls(this.currentAppCfg.tasks, this.currentAppCfg)
        .then((controls) => {
          // Update general config with new controls
          if (this.currentGeneralCfg) {
            this.currentGeneralCfg.controls = controls as any;
          }

          // Clear and reload map with updated configuration
          if (this.currentAppCfg && this.currentGeneralCfg) {
            this.clearMap();
            this.loadMap(this.currentAppCfg, this.currentGeneralCfg);
          }
        });
    }
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

    // Find and remove the old mapa div, insert new one in same location
    const oldMapDiv = mapFather.querySelector('#mapa');
    const div = this.renderer.createElement('div');
    this.renderer.setAttribute(div, 'id', 'mapa');

    if (oldMapDiv) {
      // Insert new div in the exact same position as the old one
      this.renderer.insertBefore(mapFather, div, oldMapDiv);
      // Remove the old div
      this.renderer.removeChild(mapFather, oldMapDiv);
    } else {
      // If no old div exists, just append
      this.renderer.appendChild(mapFather, div);
    }

    // Body
    this.removeSitnaDivs();
    this.removeEmptyDivs();
  }

  parseLang(lang: string): string {
    return this.appConfigService.getLocaleForLanguage(lang);
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

    this.map.loaded(() => {
      this.mapInterface.updateInterface();
    });
  }

  private orderLayers(layers: any[], groups: any[]): any[] {
    const groupsMap = new Map<string, any>();
    groups.forEach((group) => groupsMap.set(group.id, group));

    // Build the path to the root for each layer
    function buildPathToRoot(layer: any): number[] {
      const path: number[] = [layer.order];
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
