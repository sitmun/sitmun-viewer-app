import { Component, ElementRef, Inject, Renderer2 } from '@angular/core';
import { AbstractMapComponent } from '@sections/common/pages/abstract-map/abstract-map.component';
import { ActivatedRoute, Router } from '@angular/router';
import { OpenModalService } from '@ui/modal/service/open-modal.service';
import { DOCUMENT, Location } from '@angular/common';
import { CommonService } from '@api/services/common.service';
import { TranslateService } from '@ngx-translate/core';
import { NavigationPath } from '@config/app.config';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent extends AbstractMapComponent {
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

  override navigateToMap() {
    this.router.navigateByUrl(
      NavigationPath.Section.User.Map(this.applicationId, this.territoryId)
    );
  }

  override navigateToDashboard() {
    this.router.navigateByUrl(NavigationPath.Section.User.Dashboard);
  }
}
