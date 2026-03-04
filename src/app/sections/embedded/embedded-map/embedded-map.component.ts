import { DOCUMENT, Location } from '@angular/common';
import {
  Component,
  ElementRef,
  Inject,
  Injector,
  Renderer2
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import { CommonService } from '@api/services/common.service';
import { TranslateService } from '@ngx-translate/core';
import { AbstractMapComponent } from '@sections/common/pages/abstract-map/abstract-map.component';
import { AppConfigService } from 'src/app/services/app-config.service';
import { ConfigLookupService } from 'src/app/services/config-lookup.service';
import { ControlRegistryService } from 'src/app/services/control-registry.service';
import { MapConfigurationService } from 'src/app/services/map-configuration.service';
import { MapInterfaceService } from 'src/app/services/map-interface.service';
import { MapServiceWorkerService } from 'src/app/services/map-service-worker.service';
import { SitnaApiService } from 'src/app/services/sitna-api.service';

@Component({
  standalone: false,
  selector: 'app-embedded-map',
  templateUrl: './embedded-map.component.html',
  styleUrls: ['./embedded-map.component.scss']
})
export class EmbeddedMapComponent extends AbstractMapComponent {
  constructor(
    translate: TranslateService,
    location: Location,
    route: ActivatedRoute,
    router: Router,
    commonService: CommonService,
    dialog: MatDialog,
    injector: Injector,
    renderer: Renderer2,
    el: ElementRef,
    @Inject(DOCUMENT) document: Document,
    controlRegistry: ControlRegistryService,
    configLookup: ConfigLookupService,
    mapConfig: MapConfigurationService,
    mapInterface: MapInterfaceService,
    mapServiceWorker: MapServiceWorkerService,
    appConfigService: AppConfigService,
    sitnaApi: SitnaApiService
  ) {
    super(
      translate,
      location,
      route,
      router,
      commonService,
      dialog,
      injector,
      renderer,
      el,
      document,
      controlRegistry,
      configLookup,
      mapConfig,
      mapInterface,
      mapServiceWorker,
      appConfigService,
      sitnaApi
    );
  }

   
  override navigateToDashboard() {}
}
