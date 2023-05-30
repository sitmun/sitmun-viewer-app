import { Component, ElementRef, Inject, Renderer2 } from '@angular/core';
import { AbstractMapComponent } from '@sections/common/pages/abstract-map/abstract-map.component';
import { ActivatedRoute, Router } from '@angular/router';
import { OpenModalService } from '@ui/modal/service/open-modal.service';
import { DOCUMENT } from '@angular/common';
import { CommonService } from '@api/services/common.service';

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
}
