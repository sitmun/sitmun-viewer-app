import { Directive, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import {
  CommonService,
  DashboardItem,
  DashboardItemsResponse,
  DashboardTypes
} from '@api/services/common.service';
import { TranslateService } from '@ngx-translate/core';
import { OpenModalService } from '@ui/modal/service/open-modal.service';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppConfigService } from 'src/app/services/app-config.service';
import { filterDashboardItemsByKeyword } from 'src/app/utils/dashboard-filter.util';

@Directive()
export abstract class AbstractDashboardComponent implements OnInit, OnDestroy {
  type: DashboardTypes;
  private readonly translateService = inject(TranslateService);
  private readonly appConfigService = inject(AppConfigService);
  private readonly destroy$ = new Subject<void>();

  /** Accumulated items from all fetched pages (for search). */
  allItems: DashboardItem[] = [];
  /** Items shown in the grid after type config + keyword filter. */
  items: DashboardItem[] = [];
  searchKeyword = '';
  loading = false;
  loadError = false;
  
  // Server-side pagination state
  private currentPage = 0;
  private get pageSize(): number {
    return this.appConfigService.getDashboardConfig().initialBatchSize;
  }
  private get incrementSize(): number {
    return this.appConfigService.getDashboardConfig().batchIncrement;
  }
  hasMorePages = true;
  loadingMore = false;

  protected constructor(
    protected router: Router,
    protected commonService: CommonService,
    protected modal: OpenModalService
  ) {
    this.type = DashboardTypes.APPLICATIONS;
  }

  ngOnInit() {
    this.loadItems();
    this.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.commonService.clearTerritoriesCache();
        this.loadItems();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadItems(): void {
    this.loading = true;
    this.loadError = false;
    this.currentPage = 0;
    this.allItems = [];
    this.items = [];
    this.hasMorePages = true;

    // Use new dashboard endpoint for applications
    if (this.type === DashboardTypes.APPLICATIONS) {
      this.commonService
        .fetchDashboardApplications({ page: this.currentPage, size: this.pageSize })
        .pipe(
          finalize(() => {
            this.loading = false;
          }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (res: DashboardItemsResponse) => {
            this.allItems = res.content;
            this.hasMorePages = res.content.length === this.pageSize;
            this.applyKeywordFilter();
          },
          error: () => {
            this.loadError = true;
            this.allItems = [];
            this.items = [];
            this.hasMorePages = false;
          }
        });
    } else {
      // Use old endpoint for territories (still loads all)
      this.commonService
        .fetchDashboardItems(this.type)
        .pipe(
          finalize(() => {
            this.loading = false;
          }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (res: DashboardItemsResponse) => {
            this.allItems = res.content;
            this.hasMorePages = false; // Old endpoint returns all at once
            this.applyKeywordFilter();
          },
          error: () => {
            this.loadError = true;
            this.allItems = [];
            this.items = [];
            this.hasMorePages = false;
          }
        });
    }
  }

  loadMoreItems(): void {
    if (this.loadingMore || !this.hasMorePages || this.type !== DashboardTypes.APPLICATIONS) {
      return;
    }

    this.loadingMore = true;
    this.currentPage++;

    this.commonService
      .fetchDashboardApplications({ page: this.currentPage, size: this.incrementSize })
      .pipe(
        finalize(() => {
          this.loadingMore = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res: DashboardItemsResponse) => {
          this.allItems = [...this.allItems, ...res.content];
          this.hasMorePages = res.content.length === this.incrementSize;
          this.applyKeywordFilter();
        },
        error: () => {
          this.loadError = true;
          this.hasMorePages = false;
        }
      });
  }

  onKeywordsSearch(keywords: string): void {
    this.searchKeyword = keywords.trim();
    this.applyKeywordFilter(); // Filter from accumulated items
  }

  protected applyKeywordFilter(): void {
    this.items = filterDashboardItemsByKeyword(
      this.allItems,
      this.searchKeyword
    );
  }
}
