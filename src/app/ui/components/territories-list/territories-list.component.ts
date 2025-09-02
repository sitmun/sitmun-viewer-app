import { TranslateService } from '@ngx-translate/core';
import { Component, EventEmitter, Output } from '@angular/core';
import { Route, Router } from '@angular/router';
import { CommonService, DashboardItem, DashboardItemsResponse, DashboardTypes } from '@api/services/common.service';
import { NavigationPath } from '@config/app.config';
import { NotificationService } from 'src/app/notifications/services/NotificationService';

@Component({
  selector: 'app-territories-list',
  templateUrl: './territories-list.component.html',
  styleUrls: ['./territories-list.component.scss']
})
export class TerritoriesListComponent {
  @Output() close = new EventEmitter();
  applicationSelectedId!: string;
  territorySelectedId! : string;
  listApplications! : Array<DashboardItem>;
  listTerritories! : Array<any>;
  researchInputApplication: string = "";
  researchInputTerritory: string = "";

  constructor(private router : Router, private commonService : CommonService, private notificationService : NotificationService, private translateService : TranslateService) {}

  getListApplications() {
    return !this.researchInputApplication
    ? this.listApplications
    : this.listApplications.filter(
        (application) => application.title.toLowerCase().includes(this.researchInputApplication.toLowerCase())
      );
  }

  getListTerritories() {
    return !this.researchInputTerritory
    ? this.listTerritories
    : this.listTerritories.filter(
        (territory) => territory.name.toLowerCase().includes(this.researchInputTerritory.toLowerCase())
      );
  }

  ngOnInit() {
    // Get applicationID and territoryID from URL
    this.applicationSelectedId = this.router.url.split('/')[3];
    this.territorySelectedId = this.router.url.split('/')[4];

    // We get all applications
    this.commonService.fetchDashboardItems(DashboardTypes.APPLICATIONS)
        .subscribe((res: DashboardItemsResponse) => {
          this.listApplications = res.content;
        });

    // We gat all territories link to the applicationSelected
    this.getAllTerritoriesFromApplicationSelected();
  }

  getAllTerritoriesFromApplicationSelected() {
    this.commonService.fetchTerritoriesByApplication(Number(this.applicationSelectedId))
      .subscribe((res : any) => {
        this.listTerritories = res.content;
      });
  }

  selectApplication(appSelectedId : string){
    // Change application selected
    if(this.applicationSelectedId != appSelectedId){
      this.applicationSelectedId = appSelectedId;
      this.territorySelectedId = "";
    }


    // Update listTerritories
    this.getAllTerritoriesFromApplicationSelected();
  }

  closeEvent() {
    this.close.emit();
  }

  switchMap() {
    if(this.territorySelectedId == "") {
      this.translateService.get("map.errorNoTerritorySelected").subscribe((trad) => {
        this.notificationService.error(trad);
      });

    }
    else {
      if(this.router.url.startsWith("/public")){
        this.router.navigateByUrl(
          NavigationPath.Section.Public.Map(Number(this.applicationSelectedId), Number(this.territorySelectedId))
        );
      }
      else {
        this.router.navigateByUrl(
          NavigationPath.Section.User.Map(Number(this.applicationSelectedId), Number(this.territorySelectedId))
        );
      }
      this.closeEvent();
    }

  }
}
