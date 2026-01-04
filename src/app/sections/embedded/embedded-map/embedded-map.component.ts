import { Component, ElementRef, Inject, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractMapComponent } from '@sections/common/pages/abstract-map/abstract-map.component';
import { CommonService } from '@api/services/common.service';
import { OpenModalService } from '@ui/modal/service/open-modal.service';
import { DOCUMENT, Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { ControlRegistryService } from 'src/app/services/control-registry.service';
import { ConfigLookupService } from 'src/app/services/config-lookup.service';

@Component({
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
    modal: OpenModalService,
    renderer: Renderer2,
    el: ElementRef,
    @Inject(DOCUMENT) document: Document,
    controlRegistry: ControlRegistryService,
    configLookup: ConfigLookupService
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
      configLookup
    );
  }

  override navigateToMap() {}

  override navigateToDashboard() {}
}
