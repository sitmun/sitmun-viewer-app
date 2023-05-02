import { Component, OnInit } from '@angular/core';
import { CommonService } from '@api/services/common.service';
import { AbstractDashboardComponent } from '@sections/common/pages/abstract-dashboard/abstract-dashboard.component';
import { Router } from '@angular/router';
import { OpenModalService } from '@ui/modal/service/open-modal.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent
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

  override navigateToMap(applicationId?: number, territoryId?: number) {
    this.router.navigateByUrl('/user/map', {
      state: { applicationId: applicationId, territoryId: territoryId }
    });
  }
}
