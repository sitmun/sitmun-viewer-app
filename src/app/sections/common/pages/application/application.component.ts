import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { UserDto } from '@api/model/user';
import { AccountService } from '@api/services/account.service';
import {
  CommonService,
  DashboardItem,
  DashboardTypes
} from '@api/services/common.service';
import { NavigationPath } from '@config/app.config';

@Component({
  standalone: false,
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss']
})
export class ApplicationComponent implements OnInit {
  applicationId: number;
  application!: DashboardItem;
  territories: any[] = [];
  groupedTerritories: { group?: string; items: any[] }[] = [];
  searchValue = '';

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private router: Router,
    private accountService: AccountService
  ) {
    const appId = this.route.snapshot.paramMap.get('applicationId');
    this.applicationId = Number(appId);
  }

  ngOnInit() {
    this.commonService
      .fetchDashboardItems(DashboardTypes.APPLICATIONS)
      .subscribe({
        next: (res: any) => {
          this.application = res.content.find((app: DashboardItem) => {
            return app.id == this.applicationId;
          });
          if (this.application.creator != null) {
            if (this.application.id != null) {
              if (this.router.url.startsWith('/public')) {
                this.accountService
                  .getUserByIDPublic(this.application.creator)
                  .subscribe({
                    next: (res: UserDto) => {
                      this.application.creator = res.username;
                    }
                  });
              } else {
                this.accountService
                  .getUserByID(this.application.creator)
                  .subscribe({
                    next: (res: UserDto) => {
                      this.application.creator = res.username;
                    }
                  });
              }
            }
          }
        }
      });

    this.commonService
      .fetchTerritoriesByApplication(this.applicationId)
      .subscribe({
        next: (res: any) => {
          this.territories = res.content;
          this.updateGroupedTerritories();
        }
      });
  }

  private updateGroupedTerritories(): void {
    let filtered = this.territories || [];

    if (this.searchValue) {
      const searchLower = this.searchValue.toLowerCase();
      filtered = filtered.filter((territory: any) =>
        (territory.name || '').toLowerCase().includes(searchLower)
      );
    }

    this.groupedTerritories = [{ items: filtered }];
  }

  onSearchChange(searchValue: string): void {
    this.searchValue = searchValue;
    this.updateGroupedTerritories();
  }

  /**
   * Handles territory navigation when a territory is clicked in the list.
   * This is a fallback in case the SelectableListComponent's internal navigation doesn't work.
   */
  onTerritoryClick(territory: any): void {
    // Navigate to the map for this territory
    if (territory && this.applicationId) {
      const mapUrl = this.router.url.startsWith('/public')
        ? NavigationPath.Section.Public.Map(this.applicationId, territory.id)
        : NavigationPath.Section.User.Map(this.applicationId, territory.id);

      void this.router.navigateByUrl(mapUrl);
    }
  }
}
