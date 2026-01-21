import { DOCUMENT, Location } from '@angular/common';
import { Component, ElementRef, Inject, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CommonService } from '@api/services/common.service';
import { NavigationPath } from '@config/app.config';
import { TranslateService } from '@ngx-translate/core';
import { AbstractMapComponent } from '@sections/common/pages/abstract-map/abstract-map.component';
import { OpenModalService } from '@ui/modal/service/open-modal.service';
import { AppConfigService } from 'src/app/services/app-config.service';
import { ConfigLookupService } from 'src/app/services/config-lookup.service';
import { ControlRegistryService } from 'src/app/services/control-registry.service';
import { MapConfigurationService } from 'src/app/services/map-configuration.service';
import { MapInterfaceService } from 'src/app/services/map-interface.service';
import { MapServiceWorkerService } from 'src/app/services/map-service-worker.service';

@Component({
  selector: 'app-public-map',
  templateUrl: './public-map.component.html',
  styleUrls: ['./public-map.component.scss']
})
export class PublicMapComponent extends AbstractMapComponent {
  constructor(
    translate: TranslateService,
    location: Location,
    route: ActivatedRoute,
    router: Router,
    commonService: CommonService,
    modal: OpenModalService,
    renderer: Renderer2,
    el: ElementRef,
    @Inject(DOCUMENT) document: Document,
    controlRegistry: ControlRegistryService,
    configLookup: ConfigLookupService,
    mapConfig: MapConfigurationService,
    mapInterface: MapInterfaceService,
    mapServiceWorker: MapServiceWorkerService,
    appConfigService: AppConfigService
  ) {
    super(
      translate,
      location,
      route,
      router,
      commonService,
      modal,
      renderer,
      el,
      document,
      controlRegistry,
      configLookup,
      mapConfig,
      mapInterface,
      mapServiceWorker,
      appConfigService
    );
  }

  override navigateToMap() {
    void this.router.navigateByUrl(
      NavigationPath.Section.Public.Map(this.applicationId, this.territoryId)
    );
  }

  override navigateToDashboard() {
    void this.router.navigateByUrl(NavigationPath.Section.Public.Dashboard);
  }
}
