import { Component, ElementRef, Inject, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractMapComponent } from '@sections/common/pages/abstract-map/abstract-map.component';
import { CommonService } from '@api/services/common.service';
import { OpenModalService } from '@ui/modal/service/open-modal.service';
import { DOCUMENT, Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

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
    @Inject(DOCUMENT) document: Document
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
      document
    );
  }

  override navigateToMap() {}

  override navigateToDashboard() {}
}
