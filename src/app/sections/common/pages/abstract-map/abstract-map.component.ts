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
import { ControlRegistryService } from 'src/app/services/control-registry.service';
import { ConfigLookupService } from 'src/app/services/config-lookup.service';
import { MapConfigurationService } from 'src/app/services/map-configuration.service';

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
  private resizeObserver: ResizeObserver | undefined;
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
    private mapConfig: MapConfigurationService
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
    // Setup ResizeObserver to detect when map container size changes
    this.setupResizeObserver();
  }

  ngOnDestroy() {
    if (this.commonServiceSubscription) {
      this.commonServiceSubscription.unsubscribe();
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
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
    console.log('[AbstractMapComponent] Attribution from config:', attribution);

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

    console.log(
      '[AbstractMapComponent] Attribution in currentGeneralCfg:',
      this.currentGeneralCfg.attribution
    );
    console.log(
      '[AbstractMapComponent] Attribution control enabled:',
      !!this.currentGeneralCfg.controls.attribution
    );

    SitnaHelper.loadMiddleware(appCfg);

    // We need to save the currentGeneralCfg and the currentAppCfg, so when the
    // catalog change, the map can be loaded again with the same configuration

    if (!this.currentGeneralCfg) {
      console.error(
        '[AbstractMapComponent] currentGeneralCfg is undefined, cannot proceed'
      );
      return;
    }

    let cfgCheck = this.checkConfiguration(this.currentGeneralCfg);

    if (!cfgCheck.ok) {
      const ref = this.modal.open(ErrorModalComponent, {
        data: { message: cfgCheck.message }
      });
      ref.afterClosed.subscribe(() => {
        this.navigateToDashboard();
      });
      return;
    }

    // REMOVED: Silme-specific setup now handled by LayerCatalogSilmeControlHandler

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

    // Support both Silme and patched layer catalog
    const layerCatalogsForModal = (window as any).layerCatalogsForModal;
    const layerCatalogsSilmeForModal = (window as any)
      .layerCatalogsSilmeForModal;

    if (layerCatalogsForModal) {
      // Patched layer catalog - rebuild controls configuration with new tree selection
      console.log(
        '[AbstractMapComponent] Rebuilding controls configuration for catalog switch'
      );

      // Rebuild controls to pick up the new currentTreeId
      this.controlRegistry
        .processControls(this.currentAppCfg.tasks, this.currentAppCfg)
        .then((controls) => {
          // Update general config with new controls
          this.currentGeneralCfg!.controls = controls as any;

          // Clear and reload map with updated configuration
          this.clearMap();
          this.loadMap(this.currentAppCfg!, this.currentGeneralCfg!);
        });
    } else if (layerCatalogsSilmeForModal) {
      // Silme layer catalog - use existing logic
      this.currentCatalogIdx = layerCatalogsSilmeForModal.currentCatalog;
      SitnaCfg.controls.layerCatalogSilmeFolders =
        this.layerCatalogsSilme[this.currentCatalogIdx].catalog;
      this.clearMap();
      this.loadMap(this.currentAppCfg, this.currentGeneralCfg);
    } else {
      console.warn(
        '[AbstractMapComponent] No catalog modal state found, cannot update catalog'
      );
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
    console.log(
      '[AbstractMapComponent] Loading map with attribution:',
      cfg.attribution
    );
    console.log(
      '[AbstractMapComponent] Attribution control in cfg.controls:',
      cfg.controls.attribution
    );
    try {
      this.map = new SitnaMap('mapa', cfg);
      console.log(
        '[AbstractMapComponent] Map created. Map options.attribution:',
        this.map?.options?.attribution
      );
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

  private setupResizeObserver(): void {
    const mapContainer = this.el.nativeElement.querySelector('.map-container');
    if (!mapContainer) {
      return;
    }

    // Create ResizeObserver to watch for container size changes
    this.resizeObserver = new ResizeObserver(() => {
      // Trigger map resize when container size changes
      this.updateMapSize();
    });

    // Start observing the map container
    this.resizeObserver.observe(mapContainer);
  }

  private updateMapSize(): void {
    if (!this.map) {
      return;
    }

    try {
      // Call SITNA map's updateSize method
      if (this.map.updateSize) {
        this.map.updateSize();
      }

      // Also update the underlying OpenLayers map if accessible
      if (this.map.wrap) {
        const olMap =
          this.map.wrap.map || this.map.wrap._map || this.map.wrap.getMap?.();

        if (olMap) {
          if (olMap.updateSize) {
            olMap.updateSize();
          }
          if (olMap.render) {
            olMap.render();
          }
        }
      }
    } catch (error) {
      console.error('Error updating map size:', error);
    }
  }

  abstract navigateToDashboard(): any;
}
