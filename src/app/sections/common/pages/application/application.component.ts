import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { UserDto } from '@api/model/user';
import { AccountService } from '@api/services/account.service';
import {
  CommonService,
  DashboardItem,
  DashboardTypes
} from '@api/services/common.service';
import { NavigationPath } from '@config/app.config';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppConfigService } from 'src/app/services/app-config.service';

@Component({
  standalone: false,
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss']
})
export class ApplicationComponent implements OnInit, OnDestroy {
  applicationId: number;
  application!: DashboardItem;
  territories: any[] = [];
  groupedTerritories: { group?: string; items: any[] }[] = [];
  searchValue = '';
  private readonly destroy$ = new Subject<void>();
  private readonly appConfigService = inject(AppConfigService);

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private router: Router,
    private accountService: AccountService,
    private translateService: TranslateService
  ) {
    const appId = this.route.snapshot.paramMap.get('applicationId');
    this.applicationId = Number(appId);
  }

  ngOnInit() {
    this.loadData();
    this.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadData();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isExternalLink(): boolean {
    return (
      this.application != null &&
      this.appConfigService.isExternalLinkApplication(this.application)
    );
  }

  hasTerritory(): boolean {
    return (
      this.application != null &&
      this.appConfigService.applicationHasTerritory(this.application)
    );
  }

  private loadData(): void {
    this.commonService
      .fetchDashboardItems(DashboardTypes.APPLICATIONS)
      .subscribe({
        next: (res: any) => {
          this.application = res.content.find((app: DashboardItem) => {
            return app.id == this.applicationId;
          });
          if (!this.application) {
            return;
          }
          this.resolveCreatorUsername();
          if (!this.hasTerritory()) {
            this.territories = [];
            this.groupedTerritories = [];
            this.searchValue = '';
            return;
          }
          this.loadTerritories();
        }
      });
  }

  private resolveCreatorUsername(): void {
    if (this.application.creator == null || this.application.id == null) {
      return;
    }
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

  private loadTerritories(): void {
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
