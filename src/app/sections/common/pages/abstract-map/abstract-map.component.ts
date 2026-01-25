import { Location } from '@angular/common';
import {
  Directive,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  Renderer2
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import { AppCfg, GeneralCfg } from '@api/model/app-cfg';
import { CommonService } from '@api/services/common.service';
import { TranslateService } from '@ngx-translate/core';
import { ErrorModalComponent } from '@sections/common/modals/error-modal/error-modal.component';
import SitnaMap from 'api-sitna';
import { Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators';
import { AppConfigService } from 'src/app/services/app-config.service';
import { ConfigLookupService } from 'src/app/services/config-lookup.service';
import { ControlRegistryService } from 'src/app/services/control-registry.service';
import { MapConfigurationService } from 'src/app/services/map-configuration.service';
import { MapInterfaceService } from 'src/app/services/map-interface.service';
import { MapServiceWorkerService } from 'src/app/services/map-service-worker.service';

const MAP_LOAD_TIMEOUT_MS = 30_000;

type LoadingState =
  | 'idle'
  | 'loading-config'
  | 'processing-config'
  | 'creating-map'
  | 'loaded'
  | 'error';

@Directive()
export abstract class AbstractMapComponent implements OnInit, OnDestroy {
  private componentDestroyed = new Subject<void>();
  private readonly isInEmbedded: boolean;
  private currentGeneralCfg: GeneralCfg | undefined;
  private currentAppCfg: AppCfg | undefined;
  private map: any;
  protected loadingState: LoadingState = 'idle';
  private activeRequestId = 0;
  private loadId = 0;
  applicationId!: number;
  territoryId!: number;
  locale: string | undefined;

  protected constructor(
    private translate: TranslateService,
    private location: Location,
    protected route: ActivatedRoute,
    protected router: Router,
    protected commonService: CommonService,
    protected dialog: MatDialog,
    protected injector: Injector,
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
  }

  ngOnInit(): void {
    this.route.params
      .pipe(
        tap(() => {
          this.loadingState = 'loading-config';
        }),
        debounceTime(300),
        distinctUntilChanged(
          (a, b) =>
            a['applicationId'] === b['applicationId'] &&
            a['territoryId'] === b['territoryId']
        ),
        tap((params) => {
          this.applicationId = Number(params['applicationId']);
          this.territoryId = Number(params['territoryId']);
          if (this.isInEmbedded) {
            this.locale = this.parseLang(params['lang']);
          }
          this.clearMap();
        }),
        switchMap((params) => {
          const requestId = ++this.activeRequestId;
          return this.commonService
            .fetchMapConfiguration(
              Number(params['applicationId']),
              Number(params['territoryId'])
            )
            .pipe(
              tap((appCfg) => {
                if (appCfg) {
                  (appCfg as any).__requestId = requestId;
                }
              })
            );
        }),
        takeUntil(this.componentDestroyed)
      )
      .subscribe({
        next: async (appCfg) => {
          if (appCfg) {
            const requestId = (appCfg as any).__requestId;
            if (requestId === this.activeRequestId) {
              await this.loadConfig(appCfg, requestId);
              // There might be a new theme in the recently fetched appCfg
              // We will share it with the rest of the app via
              // the commonService.updateMessage()
              this.commonService.updateMessage(appCfg.application.theme);
            }
          } else {
            // Handle null/undefined config from backend
            this.loadingState = 'error';
            console.error(
              '[AbstractMapComponent] Received null/undefined config'
            );
            this.dialog.open(ErrorModalComponent, {
              data: { message: 'map.error.config.empty' },
              role: 'alertdialog',
              injector: this.injector
            });
          }
        },
        error: (error) => {
          this.loadingState = 'error';
          console.error(
            '[AbstractMapComponent] Failed to fetch config:',
            error
          );

          this.dialog.open(ErrorModalComponent, {
            data: { message: 'map.error.config.fetch.failed' },
            role: 'alertdialog',
            injector: this.injector
          });
        }
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

  ngOnDestroy() {
    // Signal all subscriptions to complete
    this.componentDestroyed.next();
    this.componentDestroyed.complete();

    // Clear map resources
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

  async loadConfig(appCfg: AppCfg, requestId: number) {
    try {
      this.loadingState = 'processing-config';
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
        this.loadingState = 'error';
        return;
      }

      const cfgCheck = this.checkConfiguration(this.currentGeneralCfg);

      if (!cfgCheck.ok) {
        this.loadingState = 'error';
        const ref = this.dialog.open(ErrorModalComponent, {
          data: { message: cfgCheck.message || 'map.error.unknown' },
          role: 'alertdialog',
          injector: this.injector
        });
        ref.afterClosed().subscribe(() => {
          this.navigateToDashboard();
        });
        return;
      }

      if (!this.currentAppCfg || !this.currentGeneralCfg) {
        this.loadingState = 'error';
        console.error(
          '[AbstractMapComponent] Config is undefined, cannot load map'
        );
        return;
      }

      // Guard against stale results - only proceed if this is still the active request
      this.loadingState = 'creating-map';
      if (this.activeRequestId === requestId) {
        await this.loadMap(this.currentGeneralCfg);
      }
    } catch (error) {
      this.loadingState = 'error';
      console.error('[AbstractMapComponent] Error processing config:', error);
      this.dialog.open(ErrorModalComponent, {
        data: { message: 'map.error.config.processing.failed' },
        role: 'alertdialog',
        injector: this.injector
      });
      throw error;
    }
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
        .then(async (controls) => {
          // Update general config with new controls
          if (this.currentGeneralCfg) {
            this.currentGeneralCfg.controls = controls as any;
          }

          // Clear and reload map with updated configuration
          if (this.currentAppCfg && this.currentGeneralCfg) {
            this.clearMap();
            await this.loadMap(this.currentGeneralCfg);
          }
        });
    }
  }

  clearMap() {
    this.loadId++;
    // Map container
    const mapFather = this.el.nativeElement.querySelector('.map-container');
    const overview = this.el.nativeElement.querySelector(
      '.tc-ctl-sv-view.tc-hidden'
    );
    if (this.map) {
      this.renderer.removeChild(mapFather, this.map);
      this.map = undefined;
    }
    if (overview) {
      this.renderer.removeChild(mapFather, overview);
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

  /**
   * Loads the map and waits for the SITNA loaded event or timeout.
   * Resolves when the map has loaded or when an error was shown (modal).
   * Callers should await it to sequence after map load. Timeout and constructor
   * errors are handled inside (modal + loadingState); loadMap does not throw.
   */
  private async loadMap(cfg: GeneralCfg): Promise<void> {
    const thisLoadId = ++this.loadId;
    try {
      this.loadingState = 'creating-map';
      this.map = new SitnaMap('mapa', cfg);
    } catch (error) {
      this.loadingState = 'error';
      console.error('[AbstractMapComponent] Failed to initialize map:', error);
      this.dialog.open(ErrorModalComponent, {
        data: { message: 'map.error.initialization.failed' },
        role: 'alertdialog',
        injector: this.injector
      });
      return;
    }

    const loadedPromise = new Promise<void>((resolve) => {
      this.map.loaded(() => {
        if (thisLoadId === this.loadId && !this.componentDestroyed.closed) {
          this.loadingState = 'loaded';
          this.mapInterface.updateInterface();
        }
        resolve();
      });
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error('Map load timeout')),
        MAP_LOAD_TIMEOUT_MS
      )
    );

    try {
      await Promise.race([loadedPromise, timeoutPromise]);
    } catch {
      if (thisLoadId === this.loadId && !this.componentDestroyed.closed) {
        this.loadingState = 'error';
        console.error('[AbstractMapComponent] Map load timeout');
        this.dialog.open(ErrorModalComponent, {
          data: { message: 'map.error.initialization.failed' },
          role: 'alertdialog',
          injector: this.injector
        });
      }
    }
  }

  abstract navigateToDashboard(): any;
}
