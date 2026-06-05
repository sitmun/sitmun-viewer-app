import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  CommonService,
  DashboardItem,
  DashboardItemsResponse,
  DashboardTypes,
  ItemDto
} from '@api/services/common.service';
import { NavigationPath } from '@config/app.config';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppConfigService } from 'src/app/services/app-config.service';

@Component({
  standalone: false,
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss']
})
export class ApplicationComponent implements OnInit, OnDestroy {
  applicationId: number;
  application?: DashboardItem;
  territories: ItemDto[] = [];
  groupedTerritories: { group?: string; items: ItemDto[] }[] = [];
  searchValue = '';
  loading = true;
  notFound = false;
  loadError = false;

  private readonly destroy$ = new Subject<void>();
  private readonly appConfigService = inject(AppConfigService);

  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private router: Router,
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

  isPublic(): boolean {
    return this.router.url.startsWith('/public');
  }

  get fallbackUrl(): string {
    return this.isPublic() ? '/public/dashboard' : '/user/dashboard';
  }

  private loadData(): void {
    this.loading = true;
    this.notFound = false;
    this.loadError = false;
    this.application = undefined;

    if (!Number.isFinite(this.applicationId)) {
      this.loading = false;
      this.notFound = true;
      return;
    }

    this.commonService
      .fetchDashboardItems(DashboardTypes.APPLICATIONS)
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res: DashboardItemsResponse) => {
          this.application = res.content.find(
            (app) => app.id === this.applicationId
          );
          if (!this.application) {
            this.notFound = true;
            return;
          }
          if (!this.hasTerritory()) {
            this.territories = [];
            this.groupedTerritories = [];
            this.searchValue = '';
            return;
          }
          this.loadTerritories();
        },
        error: () => {
          this.loadError = true;
        }
      });
  }

  private loadTerritories(): void {
    this.commonService
      .fetchTerritoriesByApplication(this.applicationId)
      .subscribe({
        next: (res) => {
          this.territories = res.content;
          this.updateGroupedTerritories();
        }
      });
  }

  private updateGroupedTerritories(): void {
    let filtered = this.territories || [];

    if (this.searchValue) {
      const searchLower = this.searchValue.toLowerCase();
      filtered = filtered.filter((territory) =>
        (territory.name || '').toLowerCase().includes(searchLower)
      );
    }

    this.groupedTerritories = [{ items: filtered }];
  }

  onSearchChange(searchValue: string): void {
    this.searchValue = searchValue;
    this.updateGroupedTerritories();
  }

  onTerritoryClick(territory: ItemDto): void {
    if (territory && this.applicationId) {
      const mapUrl = this.router.url.startsWith('/public')
        ? NavigationPath.Section.Public.Map(this.applicationId, territory.id)
        : NavigationPath.Section.User.Map(this.applicationId, territory.id);

      void this.router.navigateByUrl(mapUrl);
    }
  }
}
