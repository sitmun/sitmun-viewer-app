import { Component, OnInit } from '@angular/core';
import { CommonService } from '@api/services/common.service';
import { Router } from '@angular/router';
import { OpenModalService } from '@ui/modal/service/open-modal.service';
import { AbstractDashboardComponent } from '@sections/common/pages/abstract-dashboard/abstract-dashboard.component';
import { NavigationPath } from '@config/app.config';

@Component({
  selector: 'app-public-dashboard',
  templateUrl: './public-dashboard.component.html',
  styleUrls: ['./public-dashboard.component.scss']
})
export class PublicDashboardComponent
  extends AbstractDashboardComponent
  implements OnInit
{
  constructor(
    router: Router,
    commonService: CommonService,
    modal: OpenModalService
  ) {
    super(router, commonService, modal);
  }
}
