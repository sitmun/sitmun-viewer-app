import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnInit,
  AfterViewInit,
  OnDestroy,
  SimpleChanges,
  inject
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { DashboardItem } from '@api/services/common.service';
import { AppConfigService } from 'src/app/services/app-config.service';

import { DashboardItemComponent } from '../dashboard-item/dashboard-item.component';
import { DashboardTerritorySelectionDialogComponent } from '../dashboard-territory-selection-dialog/dashboard-territory-selection-dialog.component';

@Component({
  standalone: false,
  selector: 'app-dashboard-items',
  templateUrl: './dashboard-items.component.html',
  styleUrls: ['./dashboard-items.component.scss']
})
export class DashboardItemsComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() items: DashboardItem[] = [];
  @Input() hasMorePages = false;
  @Input() loadingMore = false;
  @Input() loading = false;
  @Output() loadMore = new EventEmitter<void>();

  public privateItems: DashboardItem[] = [];
  public publicItems: DashboardItem[] = [];
  public allItems: DashboardItem[] = [];

  // Infinite scroll properties
  private observers: IntersectionObserver[] = [];
  private readonly LOAD_MORE_THRESHOLD = 0;
  private readonly LOAD_MORE_ROOT_MARGIN = '120px';
  private observerSetupTimer?: ReturnType<typeof setTimeout>;
  private currentColumns = 3; // Track current grid columns
  private resizeObserver?: ResizeObserver;

  private readonly appConfigService = inject(AppConfigService);

  constructor(private router: Router, private dialog: MatDialog) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['items'] && this.items) {
      this.refreshDisplayedItems();
    }

    if (changes['items'] || changes['hasMorePages']) {
      // Dashboard items mount after the first fetch (*ngIf="!loading") and tab
      // bodies may render later than ngAfterViewInit — rebind sentinels when data arrives.
      this.scheduleObserverSetup();
    }
  }

  private scheduleObserverSetup(): void {
    if (this.observerSetupTimer) {
      clearTimeout(this.observerSetupTimer);
    }
    this.observerSetupTimer = setTimeout(() => {
      this.observerSetupTimer = undefined;
      this.checkIncompleteRows();
      this.setupIntersectionObservers();
    }, 100);
  }

  ngOnInit() {
    this.refreshDisplayedItems();
    this.detectGridColumns();
  }

  private refreshDisplayedItems(): void {
    if (this.isPublic()) {
      this.displayAllApplications();
    } else {
      this.displayAllApplicationsPrivate(true);
      this.displayAllApplicationsPrivate(false);
    }
  }

  displayTerritoriesTag(
    display: any,
    _dashboardItemComponent?: DashboardItemComponent
  ) {
    if (display.application != null) {
      this.dialog.open(DashboardTerritorySelectionDialogComponent, {
        width: '400px',
        maxWidth: '90vw',
        data: {
          application: display.application,
          territories: display.territories
        }
      });
    }
  }

  displayAllApplications() {
    const filteredByType = this.filterByType(this.items);
    this.allItems = filteredByType;
  }

  displayAllApplicationsPrivate(isPrivate: boolean) {
    const filteredByType = this.filterByType(this.items);
    const filtered = filteredByType.filter(
      (item) => item.appPrivate == isPrivate
    );

    if (isPrivate) {
      this.privateItems = filtered;
    } else {
      this.publicItems = filtered;
    }
  }

  /**
   * Filter dashboard items by type based on configuration
   * Only items with type in allowedTypes list will be shown
   * Items with null/undefined type are filtered out
   */
  filterByType(items: DashboardItem[]): DashboardItem[] {
    return this.appConfigService.filterApplicationsByType(
      items,
      this.appConfigService.getDashboardConfig()
    ) as DashboardItem[];
  }

  /** TrackBy function for ngFor performance */
  trackByItemId(_index: number, item: DashboardItem): number {
    return item.id;
  }

  isPublic(): boolean {
    return this.router.url.startsWith('/public');
  }

  ngAfterViewInit(): void {
    this.scheduleObserverSetup();
  }

  ngOnDestroy(): void {
    if (this.observerSetupTimer) {
      clearTimeout(this.observerSetupTimer);
    }
    this.cleanupObservers();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private detectGridColumns(): void {
    // Detect current number of columns based on window width
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width > 1500) {
        this.currentColumns = 3;
      } else if (width > 900) {
        this.currentColumns = 2;
      } else {
        this.currentColumns = 1;
      }
    };

    updateColumns();

    // Store original ngOnDestroy
    const originalDestroy = this.ngOnDestroy.bind(this);
    
    // Listen for resize events
    const resizeHandler = () => {
      updateColumns();
      // Re-check incomplete rows on resize
      setTimeout(() => this.checkIncompleteRows(), 50);
    };
    window.addEventListener('resize', resizeHandler);
    
    // Override ngOnDestroy to clean up
    this.ngOnDestroy = () => {
      window.removeEventListener('resize', resizeHandler);
      originalDestroy();
    };
  }

  private checkIncompleteRows(): void {
    if (!this.hasMorePages || this.loadingMore || this.loading) {
      return;
    }

    // Determine which items array to check based on route
    let itemCount: number;
    if (this.isPublic()) {
      itemCount = this.allItems.length;
    } else {
      // For authenticated routes with tabs, check the larger section
      itemCount = Math.max(this.publicItems.length, this.privateItems.length);
    }

    // Check if we have an incomplete row
    const remainder = itemCount % this.currentColumns;
    if (remainder !== 0 && itemCount > 0) {
      // Incomplete row detected, automatically fetch more data
      this.loadMore.emit();
    }
  }

  private setupIntersectionObservers(): void {
    this.cleanupObservers();
    
    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: this.LOAD_MORE_ROOT_MARGIN,
      threshold: this.LOAD_MORE_THRESHOLD
    };

    const createObserver = (section: 'public' | 'private' | 'all') => {
      const sentinel = document.querySelector(`.loading-sentinel[data-section="${section}"]`);
      if (sentinel && this.hasMorePages) {
        const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting && this.hasMorePages && !this.loadingMore) {
            this.onSentinelVisible();
          }
        }, options);
        observer.observe(sentinel);
        this.observers.push(observer);
      }
    };

    createObserver('all');
    createObserver('public');
    createObserver('private');
  }

  private onSentinelVisible(): void {
    if (this.loadingMore || !this.hasMorePages) return;
    
    // Emit event to parent to load more items
    this.loadMore.emit();
  }

  private cleanupObservers(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}
