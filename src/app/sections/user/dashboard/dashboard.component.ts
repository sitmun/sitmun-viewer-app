import { Component, OnInit } from '@angular/core';
import { CommonService } from '@api/services/common.service';
import { AbstractDashboardComponent } from '@sections/common/pages/abstract-dashboard/abstract-dashboard.component';
import { Router } from '@angular/router';
import { OpenModalService } from '@ui/modal/service/open-modal.service';
import { NavigationPath } from '@config/app.config';

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
  application : any;
  territories : any;

  displayTag : boolean = false;

  displayTerritoriesTag(display: any) {
    if(display.application != null){
      this.displayTag = true;
      this.application = display.application;
      this.territories = display.territories.content;
      console.log(this.territories);

    }
    else {
      this.displayTag = false;
    }
  }
}

export interface MapTerritory {
  appId : number;
  territoryId : number;
}
