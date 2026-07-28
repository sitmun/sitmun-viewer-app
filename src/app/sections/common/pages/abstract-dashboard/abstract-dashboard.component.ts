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

  private get pageSize(): number {
    return this.appConfigService.getDashboardConfig().initialBatchSize;
  }
  hasMorePages = true;
  loadingMore = false;
  /** Last Spring page index successfully loaded (0-based). */
  private lastLoadedPage = -1;

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
    this.searchKeyword = '';
    this.lastLoadedPage = -1;
    this.fetchApplicationsPage(0);
  }

  loadMoreItems(): void {
    if (
      this.loading ||
      this.loadingMore ||
      !this.hasMorePages ||
      this.type !== DashboardTypes.APPLICATIONS
    ) {
      return;
    }

    this.loadingMore = true;
    const nextPage = this.lastLoadedPage + 1;
    const keywords = this.getActiveServerKeywords();

    this.commonService
      .fetchDashboardApplications({
        page: nextPage,
        size: this.pageSize,
        ...(keywords ? { keywords } : {})
      })
      .pipe(
        finalize(() => {
          this.loadingMore = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res: DashboardItemsResponse) => {
          this.mergePageContent(res.content);
          this.lastLoadedPage = res.page?.number ?? nextPage;
          this.updateHasMorePages(res);
          this.syncDisplayedItems();
        },
        error: () => {
          this.loadError = true;
        }
      });
  }

  onKeywordsSearch(keywords: string): void {
    this.searchKeyword = keywords.trim();

    if (this.type !== DashboardTypes.APPLICATIONS) {
      this.applyKeywordFilter();
      return;
    }

    if (this.searchKeyword.length >= 2) {
      this.fetchApplicationsPage(0, this.searchKeyword);
      return;
    }

    if (this.searchKeyword.length === 0) {
      this.loadItems();
      return;
    }

    this.applyKeywordFilter();
  }

  protected applyKeywordFilter(): void {
    this.items = filterDashboardItemsByKeyword(
      this.allItems,
      this.searchKeyword
    );
  }

  private fetchApplicationsPage(page: number, keywords?: string): void {
    if (this.type !== DashboardTypes.APPLICATIONS) {
      this.loading = true;
      this.loadError = false;
      this.allItems = [];
      this.items = [];
      this.hasMorePages = true;

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
            this.hasMorePages = false;
            this.applyKeywordFilter();
          },
          error: () => {
            this.loadError = true;
            this.allItems = [];
            this.items = [];
            this.hasMorePages = false;
          }
        });
      return;
    }

    const isInitialPage = page === 0;
    const isSearchRefresh =
      isInitialPage && keywords != null && keywords.trim().length >= 2;
    if (isInitialPage) {
      this.loadError = false;
      this.allItems = [];
      this.items = [];
      this.hasMorePages = true;
      this.lastLoadedPage = -1;
      if (isSearchRefresh) {
        this.loadingMore = true;
      } else {
        this.loading = true;
      }
    }

    this.commonService
      .fetchDashboardApplications({
        page,
        size: this.pageSize,
        ...(keywords ? { keywords } : {})
      })
      .pipe(
        finalize(() => {
          if (isInitialPage && isSearchRefresh) {
            this.loadingMore = false;
          } else if (isInitialPage) {
            this.loading = false;
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res: DashboardItemsResponse) => {
          if (isInitialPage) {
            this.allItems = this.filterPageContent(res.content);
          } else {
            this.mergePageContent(res.content);
          }
          this.lastLoadedPage = res.page?.number ?? page;
          this.updateHasMorePages(res);
          this.syncDisplayedItems();
        },
        error: () => {
          this.loadError = true;
          if (isInitialPage) {
            this.allItems = [];
            this.items = [];
            this.hasMorePages = false;
          }
        }
      });
  }

  private syncDisplayedItems(): void {
    if (this.getActiveServerKeywords()) {
      this.items = [...this.allItems];
      return;
    }
    this.applyKeywordFilter();
  }

  private getActiveServerKeywords(): string | undefined {
    return this.searchKeyword.length >= 2 ? this.searchKeyword : undefined;
  }

  private updateHasMorePages(res: DashboardItemsResponse): void {
    if (res.content.length === 0) {
      this.hasMorePages = false;
      return;
    }

    const pageMeta = res.page;
    const totalPages = pageMeta?.totalPages;
    const pageNumber = pageMeta?.number;
    const totalElements = pageMeta?.totalElements ?? res.totalElements;

    if (totalPages != null && pageNumber != null) {
      this.hasMorePages = pageNumber + 1 < totalPages;
      return;
    }
    if (totalElements != null) {
      this.hasMorePages = this.lastLoadedPage + 1 < Math.ceil(totalElements / this.pageSize);
      return;
    }
    this.hasMorePages = res.content.length === this.pageSize;
  }

  /** Keep only dashboard-visible apps; avoids wasting page slots on filtered-out types. */
  private filterPageContent(content: DashboardItem[]): DashboardItem[] {
    return this.appConfigService.filterApplicationsByType(
      content,
      this.appConfigService.getDashboardConfig()
    ) as DashboardItem[];
  }

  private mergePageContent(incoming: DashboardItem[]): void {
    const visible = this.filterPageContent(incoming);
    const seen = new Set(this.allItems.map((item) => item.id));
    const unique = visible.filter((item) => !seen.has(item.id));
    this.allItems = [...this.allItems, ...unique];
  }
}
