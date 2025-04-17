import { Component } from '@angular/core';
import { Location } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService, DashboardItem, DashboardTypes } from '@api/services/common.service';

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss']
})
export class ApplicationComponent {
  applicationId : number;
  application!: DashboardItem;
  territories: any[] = [];

  constructor(private location: Location, private route: ActivatedRoute, private commonService : CommonService, private router : Router) {
    let appId = this.route.snapshot.paramMap.get('applicationId');
    this.applicationId = Number(appId);
  }

  ngOnInit() {
    this.commonService.fetchDashboardItems(DashboardTypes.APPLICATIONS).subscribe({
      next: (res : any) => {
        this.application = res.content.find((app : DashboardItem) => {
          return app.id == this.applicationId;
        })
      }
    });

    this.commonService.fetchTerritoriesByApplication(this.applicationId).subscribe({
      next: (res: any) => {
        this.territories = res.content;
      }
    });
  }

  navigateToPreviousPage() {
    this.location.back();
  }
}
