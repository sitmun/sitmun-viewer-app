import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CommonService } from '@api/services/common.service';
import { AbstractDashboardComponent } from '@sections/common/pages/abstract-dashboard/abstract-dashboard.component';
import { OpenModalService } from '@ui/modal/service/open-modal.service';

@Component({
  standalone: false,
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
  application: any;
  territories: any;
}

export interface MapTerritory {
  appId: number;
  territoryId: number;
}
