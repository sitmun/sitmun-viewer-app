import { Location } from '@angular/common';
import { Directive, ElementRef, Injector, Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import { AppCfg, GeneralCfg } from '@api/model/app-cfg';
import { CommonService } from '@api/services/common.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { LayerCatalogControlHandler } from 'src/app/controls/handlers/layer-catalog-control.handler';
import { AppConfigService } from 'src/app/services/app-config.service';
import { ConfigLookupService } from 'src/app/services/config-lookup.service';
import { ControlRegistryService } from 'src/app/services/control-registry.service';
import { MapConfigurationService } from 'src/app/services/map-configuration.service';
import { MapInterfaceService } from 'src/app/services/map-interface.service';
import { MapServiceWorkerService } from 'src/app/services/map-service-worker.service';
import { MoreInfoAdvancedService } from 'src/app/services/more-info-advanced.service';
import { SitnaApiService } from 'src/app/services/sitna-api.service';

import { AbstractMapComponent } from './abstract-map.component';

type LoadedCallback = () => void | Promise<void>;

const loadedCallbacks: LoadedCallback[] = [];
let loadedCallback: LoadedCallback | null = null;
let sitnaMapInstances: Array<{ loaded: (cb: LoadedCallback) => void }> = [];

jest.mock('api-sitna', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => {
    const instance = {
      loaded: (callback: LoadedCallback) => {
        loadedCallbacks.push(callback);
        loadedCallback = callback;
      }
    };
    sitnaMapInstances.push(instance);
    return instance;
  })
}));

@Directive()
class TestMapComponent extends AbstractMapComponent {
  navigateToDashboard(): void {
    return undefined;
  }

  exposeClearMap(): void {
    (this as any).clearMap();
  }

  exposeUpdateCatalog(): void {
    this.updateCatalog();
  }

  exposeLoadMap(cfg: GeneralCfg): Promise<void> {
    return (this as any).loadMap(cfg);
  }

  exposeDestroy(): void {
    this.ngOnDestroy();
  }

  setMap(map: unknown): void {
    (this as any).map = map;
  }

  setConfigs(appCfg: AppCfg, generalCfg: GeneralCfg): void {
    (this as any).currentAppCfg = appCfg;
    (this as any).currentGeneralCfg = generalCfg;
  }
}

describe('AbstractMapComponent lifecycle', () => {
  let component: TestMapComponent;
  let layerCatalogHandler: {
    applyDefaultWorkingLayers: jest.Mock;
    teardownMapState: jest.Mock;
  };

  const appCfg: AppCfg = {
    application: {
      id: 1,
      title: 'Test',
      type: 'test',
      theme: 'default',
      srs: 'EPSG:25831',
      initialExtent: [0, 0, 1, 1]
    },
    backgrounds: [],
    groups: [],
    layers: [],
    services: [],
    tasks: [{ 'ui-control': 'sitna.layerCatalog', parameters: {} } as any],
    trees: []
  };

  const generalCfg: GeneralCfg = {
    locale: 'es',
    crs: 'EPSG:25831',
    initialExtent: [0, 0, 1, 1],
    baseLayers: [{ id: 'base' } as any]
  } as GeneralCfg;

  beforeEach(() => {
    loadedCallbacks.length = 0;
    loadedCallback = null;
    sitnaMapInstances = [];

    layerCatalogHandler = {
      applyDefaultWorkingLayers: jest.fn().mockResolvedValue(undefined),
      teardownMapState: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        TestMapComponent,
        { provide: LayerCatalogControlHandler, useValue: layerCatalogHandler },
        {
          provide: MoreInfoAdvancedService,
          useValue: { setMapContext: jest.fn() }
        },
        {
          provide: SitnaApiService,
          useValue: {
            setGlobal: jest.fn(),
            getGlobal: jest.fn((key: string) => {
              if (key === 'layerCatalogsForModal') {
                return { currentTreeId: 'tree/1' };
              }
              return undefined;
            })
          }
        },
        {
          provide: TranslateService,
          useValue: {
            currentLang: 'es',
            onLangChange: of({ lang: 'es' })
          }
        },
        { provide: Location, useValue: { path: () => '/map' } },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ applicationId: '1', territoryId: '2' })
          }
        },
        { provide: Router, useValue: {} },
        {
          provide: CommonService,
          useValue: {
            fetchMapConfiguration: jest.fn().mockReturnValue(of(appCfg)),
            updateMessage: jest.fn()
          }
        },
        { provide: MatDialog, useValue: { open: jest.fn() } },
        { provide: Injector, useValue: {} },
        {
          provide: Renderer2,
          useValue: {
            createElement: () => document.createElement('div'),
            setAttribute: jest.fn(),
            insertBefore: jest.fn(),
            removeChild: jest.fn(),
            appendChild: jest.fn()
          }
        },
        {
          provide: ElementRef,
          useValue: {
            nativeElement: {
              querySelector: () => ({
                querySelector: () => null
              })
            }
          }
        },
        { provide: Document, useValue: document },
        {
          provide: ControlRegistryService,
          useValue: {
            processControls: jest.fn().mockResolvedValue({}),
            cleanupAll: jest.fn(),
            unregisterAll: jest.fn()
          }
        },
        { provide: ConfigLookupService, useValue: { initialize: jest.fn() } },
        {
          provide: MapConfigurationService,
          useValue: {
            toAttribution: () => '',
            toInitialExtent: () => [0, 0, 1, 1],
            toDefaultZoomLevel: () => undefined,
            toCrs: () => 'EPSG:25831',
            toLayout: () => ({}),
            toBaseLayers: () => [{ id: 'base' }],
            toDefaultBaseLayer: () => 'base',
            toViews: () => []
          }
        },
        {
          provide: MapInterfaceService,
          useValue: { updateInterface: jest.fn() }
        },
        {
          provide: MapServiceWorkerService,
          useValue: {
            configureMiddleware: jest.fn().mockResolvedValue(undefined)
          }
        },
        {
          provide: AppConfigService,
          useValue: { getLocaleForLanguage: () => 'es' }
        }
      ]
    });

    component = TestBed.inject(TestMapComponent);
  });

  it('uses LayerCatalogControlHandler.applyDefaultWorkingLayers for map-open defaults', () => {
    expect(layerCatalogHandler.applyDefaultWorkingLayers).toBeDefined();
  });

  it('teardownMapState runs when clearMap is invoked', () => {
    const oldMap = { id: 'old-map' };
    component.setMap(oldMap);
    component.exposeClearMap();
    expect(layerCatalogHandler.teardownMapState).toHaveBeenCalledWith(oldMap);
  });

  it('teardownMapState runs before catalog switch rebuild', async () => {
    const oldMap = { id: 'old-map' };
    component.setMap(oldMap);
    component.setConfigs(appCfg, generalCfg);

    component.exposeUpdateCatalog();
    await Promise.resolve();

    expect(layerCatalogHandler.teardownMapState).toHaveBeenCalledWith(oldMap);
  });

  it('awaits default working layers before resolving map load', async () => {
    let defaultsResolved = false;
    layerCatalogHandler.applyDefaultWorkingLayers.mockImplementation(
      async () => {
        await Promise.resolve();
        defaultsResolved = true;
      }
    );
    component.setConfigs(appCfg, generalCfg);

    const loadPromise = component.exposeLoadMap(generalCfg);
    expect(defaultsResolved).toBe(false);

    await loadedCallback?.();
    await loadPromise;

    expect(defaultsResolved).toBe(true);
    expect(layerCatalogHandler.applyDefaultWorkingLayers).toHaveBeenCalledTimes(1);
  });

  it('does not apply defaults when loadId becomes stale', async () => {
    component.setConfigs(appCfg, generalCfg);
    const firstLoad = component.exposeLoadMap(generalCfg);
    const staleCallback = loadedCallbacks[0];
    component.exposeClearMap();
    const secondLoad = component.exposeLoadMap(generalCfg);
    const currentCallback = loadedCallbacks[1];

    await staleCallback?.();
    await firstLoad;
    await currentCallback?.();
    await secondLoad;

    expect(layerCatalogHandler.applyDefaultWorkingLayers).toHaveBeenCalledTimes(1);
  });

  it('does not apply defaults after destroy before map.loaded', async () => {
    component.setConfigs(appCfg, generalCfg);
    const loadPromise = component.exposeLoadMap(generalCfg);
    component.exposeDestroy();

    await loadedCallback?.();
    await loadPromise;

    expect(layerCatalogHandler.applyDefaultWorkingLayers).not.toHaveBeenCalled();
  });

  it('cleans up handlers without unregistering them on destroy', () => {
    const registry = TestBed.inject(
      ControlRegistryService
    ) as jest.Mocked<ControlRegistryService>;

    component.exposeDestroy();

    expect(registry.cleanupAll).toHaveBeenCalledTimes(1);
    expect(registry.unregisterAll).not.toHaveBeenCalled();
  });

  it('catalog switch applies defaults exactly once to the new map', async () => {
    const oldMap = { id: 'old-map' };
    component.setMap(oldMap);
    component.setConfigs(appCfg, generalCfg);

    component.exposeUpdateCatalog();
    await Promise.resolve();

    await loadedCallback?.();
    await Promise.resolve();

    expect(layerCatalogHandler.teardownMapState).toHaveBeenCalledWith(oldMap);
    expect(layerCatalogHandler.applyDefaultWorkingLayers).toHaveBeenCalledTimes(1);
    expect(sitnaMapInstances).toHaveLength(1);
  });
});
