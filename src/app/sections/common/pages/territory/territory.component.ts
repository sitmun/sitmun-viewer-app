import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  CommonService,
  DashboardItem,
  DashboardTypes
} from '@api/services/common.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject, forkJoin } from 'rxjs';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { filterDashboardItemsByKeyword } from 'src/app/utils/dashboard-filter.util';

@Component({
  standalone: false,
  selector: 'app-territory',
  templateUrl: './territory.component.html',
  styleUrls: ['./territory.component.scss']
})
export class TerritoryComponent implements OnInit, OnDestroy {
  territoryId!: number;
  territory!: DashboardItem;
  /** Full list from API; search filters this set client-side. */
  allApplications: DashboardItem[] = [];
  /** Applications shown in the grid after keyword filter. */
  applications: DashboardItem[] = [];
  searchKeyword = '';
  loading = false;
  loadError = false;
  notFound = false;
  private readonly destroy$ = new Subject<void>();

  get showTerritoryInformationPanel(): boolean {
    return Boolean(this.territory?.description?.trim());
  }

  get applicationCount(): number {
    return this.allApplications.length;
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.route.params
      .pipe(
        switchMap((params) => {
          this.territoryId = Number(params['territoryId']);
          this.clearStateAndLoadTerritory();
          return [];
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.clearStateAndLoadTerritory();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isPublic(): boolean {
    return this.router.url.startsWith('/public');
  }

  get fallbackUrl(): string {
    return this.isPublic() ? '/public/dashboard' : '/user/dashboard';
  }

  private clearStateAndLoadTerritory(): void {
    this.territory = undefined as any;
    this.allApplications = [];
    this.applications = [];
    this.loading = true;
    this.loadError = false;
    this.notFound = false;

    this.loadTerritory();
  }

  loadTerritory() {
    const terrId = this.route.snapshot.paramMap.get('territoryId');
    this.territoryId = Number(terrId);

    forkJoin({
      territories: this.commonService.fetchDashboardItems(DashboardTypes.TERRITORIES),
      applications: this.commonService.fetchApplicationsByTerritory(this.territoryId)
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (res: any) => {
          const foundTerritory = res.territories.content.find((terr: any) => {
            return terr.id == this.territoryId;
          });

          if (!foundTerritory) {
            this.notFound = true;
            return;
          }

          this.territory = foundTerritory;
          this.allApplications = res.applications.content;
          this.applyKeywordFilter();
        },
        error: () => {
          this.loadError = true;
        }
      });
  }

  onKeywordsSearch(keywords: string): void {
    this.searchKeyword = keywords.trim();
    this.applyKeywordFilter();
  }

  loadMoreItems(): void {
    // Territory component loads all applications at once, no pagination needed
  }

  private applyKeywordFilter(): void {
    this.applications = filterDashboardItemsByKeyword(
      this.allApplications,
      this.searchKeyword
    );
  }
}
