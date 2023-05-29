import { Component, ElementRef, Inject, Renderer2 } from '@angular/core';
import { AbstractMapComponent } from '@sections/common/pages/abstract-map/abstract-map.component';
import { ActivatedRoute, Router } from '@angular/router';
import { OpenModalService } from '@ui/modal/service/open-modal.service';
import { LoginModalComponent } from '@sections/common/modals/login-modal/login-modal.component';
import { NavigationPath } from '@config/app.config';
import { CommonService } from '@api/services/common.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-public-map',
  templateUrl: './public-map.component.html',
  styleUrls: ['./public-map.component.scss']
})
export class PublicMapComponent extends AbstractMapComponent {
  constructor(
    route: ActivatedRoute,
    router: Router,
    commonService: CommonService,
    modal: OpenModalService,
    renderer: Renderer2,
    el: ElementRef,
    @Inject(DOCUMENT) document: Document
  ) {
    super(route, router, commonService, modal, renderer, el, document);
  }

  openLoginModal() {
    const ref = this.modal.open(LoginModalComponent, {
      data: { applicationId: this.applicationId, territoryId: this.territoryId }
    });
    ref.afterClosed.subscribe(() => {
      this.clearMap();
      this.router
        .navigateByUrl(NavigationPath.Section.User.Dashboard)
        .then(() => {
          this.router.navigateByUrl(
            NavigationPath.Section.User.Map(
              this.applicationId,
              this.territoryId
            )
          );
        });
    });
  }

  override navigateToMap(applicationId: number, territoryId: number) {
    this.router.navigateByUrl(
      NavigationPath.Section.Public.Map(applicationId, territoryId)
    );
    // .then(() => {
    //   window.location.reload();
    // });
  }
}
