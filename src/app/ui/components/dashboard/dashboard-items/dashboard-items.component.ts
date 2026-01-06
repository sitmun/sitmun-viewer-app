import {
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  inject
} from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Codelist } from '@api/model/app-codelist';
import { DashboardItem } from '@api/services/common.service';
import { AppConfigService } from 'src/app/services/app-config.service';
import { DashboardItemComponent } from '../dashboard-item/dashboard-item.component';
import { DashboardTerritorySelectionDialogComponent } from '../dashboard-territory-selection-dialog/dashboard-territory-selection-dialog.component';

@Component({
  selector: 'app-dashboard-items',
  templateUrl: './dashboard-items.component.html',
  styleUrls: ['./dashboard-items.component.scss']
})
export class DashboardItemsComponent {
  @Input() items: DashboardItem[] = [];
  @Input() image_src: string = '';
  @Output() itemClicked = new EventEmitter<DashboardItem>();

  applicationSelected: any = null;
  hasWarning: boolean = false;
  isInMaintenance: boolean = false;

  public privateItems: DashboardItem[] = [];
  public publicItems: DashboardItem[] = [];
  public allItems: DashboardItem[] = [];

  totalItems: number = 0;
  totalPrivateItems: number = 0;
  totalPublicItems: number = 0;

  readonly MAX_HIDDEN_MODE_ITEMS: number = 3;

  private readonly appConfigService = inject(AppConfigService);

  constructor(private router: Router, private dialog: MatDialog) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['items'] && this.items) {
      if (this.isPublic()) {
        this.displayAllApplications(false);
      } else {
        this.displayAllApplicationsPrivate(false, true);
        this.displayAllApplicationsPrivate(false, false);
      }
    }
  }

  ngOnInit() {
    if (this.isPublic()) {
      this.displayAllApplications(false);
    } else {
      this.displayAllApplicationsPrivate(false, true);
      this.displayAllApplicationsPrivate(false, false);
    }
  }

  displayTerritoriesTag(
    display: any,
    dashboardItemComponent?: DashboardItemComponent
  ) {
    if (display.application != null) {
      const dialogRef = this.dialog.open(
        DashboardTerritorySelectionDialogComponent,
        {
          width: '400px',
          maxWidth: '90vw',
          data: {
            application: display.application,
            territories: display.territories
          }
        }
      );

      dialogRef.afterClosed().subscribe(() => {
        // Handle dialog close if needed
      });
    }
  }

  displayAllApplications(displayAll: boolean) {
    const filteredByType = this.filterByType(this.items);
    this.allItems = [...filteredByType];
    this.allItems = this.displayApplications(this.allItems, displayAll);
    this.totalItems = filteredByType.length;
  }

  displayAllApplicationsPrivate(displayAll: boolean, isPrivate: boolean) {
    const filteredByType = this.filterByType(this.items);
    const filtered = filteredByType.filter(
      (item) => item.appPrivate == isPrivate
    );
    if (isPrivate) {
      this.privateItems = this.displayApplications(filtered, displayAll);
      this.totalPrivateItems = filtered.length;
    } else {
      this.publicItems = this.displayApplications(filtered, displayAll);
      this.totalPublicItems = filtered.length;
    }
  }

  displayApplications(
    list: DashboardItem[],
    display: boolean
  ): DashboardItem[] {
    this.totalItems = list.length;
    return display ? list : list.slice(0, this.MAX_HIDDEN_MODE_ITEMS);
  }

  /**
   * Filter dashboard items by type based on configuration
   * Only items with type in allowedTypes list will be shown
   * Items with null/undefined type are filtered out
   */
  filterByType(items: DashboardItem[]): DashboardItem[] {
    if (!this.appConfigService.isFilteringEnabled()) {
      return items;
    }
    const allowedTypes = this.appConfigService.getAllowedTypes();
    return items.filter(
      (item) => item.type != null && allowedTypes.includes(item.type)
    );
  }

  isDashboard(): boolean {
    return (
      this.router.url.startsWith('/user/dashboard') ||
      this.router.url.startsWith('/public/dashboard')
    );
  }

  isPublic(): boolean {
    return this.router.url.startsWith('/public');
  }
}
