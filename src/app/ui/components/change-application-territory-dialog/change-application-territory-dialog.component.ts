import { Component, Inject, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {
  CommonService,
  DashboardItem,
  DashboardItemsResponse,
  DashboardTypes
} from '@api/services/common.service';
import { NotificationService } from 'src/app/notifications/services/NotificationService';
import { TranslateService } from '@ngx-translate/core';
import { NavigationPath } from '@config/app.config';
import { AppConfigService } from 'src/app/services/app-config.service';

@Component({
  selector: 'app-change-application-territory-dialog',
  templateUrl: './change-application-territory-dialog.component.html',
  styleUrls: ['./change-application-territory-dialog.component.scss']
})
export class ChangeApplicationTerritoryDialogComponent implements OnInit {
  applicationSelectedId!: string;
  territorySelectedId!: string;
  listApplications!: Array<DashboardItem>;
  listTerritories!: Array<any>;
  searchValueApplication: string = '';
  searchValueTerritory: string = '';
  cachedUnavailableApplicationIds: string[] = [];
  cachedUnavailableTerritoryIds: string[] = [];

  // Cached grouped data to prevent infinite loops
  groupedApplications: { group?: string; items: any[] }[] = [];
  groupedTerritories: { group?: string; items: any[] }[] = [];

  // Store the last selected territory to restore when territories are loaded
  private lastSelectedTerritoryId: string = '';

  private readonly appConfigService = inject(AppConfigService);

  constructor(
    private router: Router,
    private commonService: CommonService,
    private notificationService: NotificationService,
    private translateService: TranslateService,
    private dialogRef: MatDialogRef<ChangeApplicationTerritoryDialogComponent>
  ) {}

  /**
   * Filter dashboard items by type based on app configuration.
   * Returns only items matching the allowed types from the dashboard filter.
   */
  private filterByType(items: DashboardItem[]): DashboardItem[] {
    const dashboardConfig = this.appConfigService.getDashboardConfig();
    if (!dashboardConfig || !dashboardConfig.filteringEnabled) {
      return items;
    }
    const allowedTypes = dashboardConfig.allowedTypes || [];
    return items.filter(
      (item) => item.type != null && allowedTypes.includes(item.type)
    );
  }

  /**
   * Update cached grouped applications when data or search changes.
   */
  private updateGroupedApplications(): void {
    // Apply type filtering first (same as dashboard)
    const typeFiltered = this.filterByType(this.listApplications || []);

    // Filter out unavailable applications (under maintenance)
    const availableApps = typeFiltered.filter((app) => !app.isUnavailable);

    let filtered = availableApps;

    if (this.searchValueApplication) {
      const filterLower = this.searchValueApplication.toLowerCase();
      filtered = availableApps.filter((application) =>
        (application.title || application.name)
          .toLowerCase()
          .includes(filterLower)
      );

      // Always include the selected application even if it doesn't match the filter, type, or is unavailable
      // This allows users to see what's selected even if it's in maintenance
      if (this.hasApplication()) {
        const selectedApp = this.listApplications?.find(
          (app) => String(app.id) === String(this.applicationSelectedId)
        );
        if (
          selectedApp &&
          !filtered.some((app) => String(app.id) === String(selectedApp.id))
        ) {
          filtered.unshift(selectedApp); // Add at the beginning
        }
      }
    }

    // Update cached grouped format (no grouping for applications)
    this.groupedApplications = [{ items: filtered }];
  }

  /**
   * Update cached grouped territories when data or search changes.
   */
  private updateGroupedTerritories(): void {
    let filtered = this.listTerritories || [];

    if (this.searchValueTerritory) {
      const filterLower = this.searchValueTerritory.toLowerCase();
      filtered = filtered.filter((territory: any) =>
        (territory.name || '').toLowerCase().includes(filterLower)
      );

      // Always include the selected territory even if it doesn't match the filter
      if (this.hasTerritory()) {
        const selectedTerritory = this.listTerritories?.find(
          (territory: any) =>
            String(territory.id) === String(this.territorySelectedId)
        );
        if (
          selectedTerritory &&
          !filtered.some(
            (t: any) => String(t.id) === String(selectedTerritory.id)
          )
        ) {
          filtered.unshift(selectedTerritory); // Add at the beginning
        }
      }
    }

    this.groupedTerritories = [{ items: filtered }];
  }

  /**
   * Update cached unavailable IDs when lists change.
   * This prevents infinite re-render loops.
   */
  private updateCachedUnavailableIds(): void {
    this.cachedUnavailableApplicationIds = (this.listApplications || [])
      .filter((app) => app.isUnavailable)
      .map((app) => String(app.id));

    // Note: territories don't have isUnavailable, so this will be empty
    this.cachedUnavailableTerritoryIds = [];
  }

  /**
   * Check if an application is selected.
   */
  private hasApplication(): boolean {
    return !!(this.applicationSelectedId && this.applicationSelectedId !== '');
  }

  getApplicationIdAsNumber(): number {
    return Number(this.applicationSelectedId) || 0;
  }

  /**
   * Check if a territory is selected.
   */
  private hasTerritory(): boolean {
    return !!(this.territorySelectedId && this.territorySelectedId !== '');
  }

  /**
   * Extract route parameters from the router state.
   * Traverses the route tree to find the active route with parameters.
   */
  private getRouteParams(): { applicationId: string; territoryId: string } {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    const params = route.params;
    return {
      applicationId: params['applicationId'] || '',
      territoryId: params['territoryId'] || ''
    };
  }

  ngOnInit() {
    // Get applicationID and territoryID from route parameters
    const { applicationId, territoryId } = this.getRouteParams();
    this.applicationSelectedId = applicationId;
    this.territorySelectedId = territoryId;

    // We get all applications
    this.commonService
      .fetchDashboardItems(DashboardTypes.APPLICATIONS)
      .subscribe((res: DashboardItemsResponse) => {
        // Store all applications (before type filtering)
        // Type filtering will be applied in updateGroupedApplications()
        this.listApplications = res.content;
        this.updateCachedUnavailableIds();
        this.updateGroupedApplications();
      });

    // We get all territories linked to the applicationSelected (only if applicationSelectedId is valid)
    if (this.hasApplication()) {
      this.getAllTerritoriesFromApplicationSelected();
    }
  }

  getAllTerritoriesFromApplicationSelected() {
    this.commonService
      .fetchTerritoriesByApplication(Number(this.applicationSelectedId))
      .subscribe((res: any) => {
        this.listTerritories = res.content;
        this.updateGroupedTerritories();

        // If there was a last selected territory and it's available in the new application, auto-select it
        if (
          this.lastSelectedTerritoryId &&
          this.listTerritories &&
          this.listTerritories.length > 0
        ) {
          const territoryExists = this.listTerritories.some(
            (territory: any) =>
              String(territory.id) === String(this.lastSelectedTerritoryId)
          );
          if (territoryExists) {
            this.territorySelectedId = this.lastSelectedTerritoryId;
          }
        }
      });
  }

  /**
   * Handles application selection.
   * Loads territories for the selected application.
   */
  onApplicationSelected(appSelectedId: number): void {
    // Prevent selection of unavailable applications
    const app = this.listApplications?.find(
      (a) => String(a.id) === String(appSelectedId)
    );
    if (app && app.isUnavailable) {
      return;
    }

    // Toggle selection: if clicking the same application, deselect it
    if (String(this.applicationSelectedId) === String(appSelectedId)) {
      this.applicationSelectedId = '';
      this.territorySelectedId = '';
      this.listTerritories = [];
      this.searchValueTerritory = ''; // Clear territory search
      this.updateGroupedTerritories();
      this.updateCachedUnavailableIds();
    } else {
      // Change application selected
      this.applicationSelectedId = String(appSelectedId);
      this.territorySelectedId = '';
      this.searchValueTerritory = ''; // Clear territory search when changing application

      // Update listTerritories - will auto-select last selected territory if available
      this.getAllTerritoriesFromApplicationSelected();
    }
  }

  /**
   * Handles territory selection.
   */
  onTerritorySelected(territorySelectedId: number): void {
    // Toggle selection: if clicking the same territory, deselect it
    if (String(this.territorySelectedId) === String(territorySelectedId)) {
      this.territorySelectedId = '';
      this.lastSelectedTerritoryId = '';
    } else {
      this.territorySelectedId = String(territorySelectedId);
      // Save the last selected territory
      this.lastSelectedTerritoryId = this.territorySelectedId;
    }
  }

  isTerritorySelected(territoryId: number | string): boolean {
    const territoryIdStr = String(territoryId);
    const selectedIdStr = String(this.territorySelectedId);
    return territoryIdStr === selectedIdStr;
  }

  /**
   * Handles application search input changes.
   */
  onApplicationSearchChange(searchValue: string): void {
    this.searchValueApplication = searchValue;
    this.updateGroupedApplications();
  }

  /**
   * Handles territory search input changes.
   */
  onTerritorySearchChange(searchValue: string): void {
    this.searchValueTerritory = searchValue;
    this.updateGroupedTerritories();
  }

  /**
   * Handles clicks on application items from the list.
   */
  onApplicationClick(application: any): void {
    this.onApplicationSelected(application.id);
    this.updateGroupedTerritories();
  }

  /**
   * Handles clicks on territory items from the list.
   */
  onTerritoryClick(territory: any): void {
    this.onTerritorySelected(territory.id);
  }

  selectApplication(appSelectedId: string) {
    // Prevent selection of unavailable applications
    const app = this.listApplications?.find(
      (a) => String(a.id) === String(appSelectedId)
    );
    if (app && app.isUnavailable) {
      return;
    }

    // Toggle selection: if clicking the same application, deselect it
    if (String(this.applicationSelectedId) === String(appSelectedId)) {
      this.applicationSelectedId = '';
      this.territorySelectedId = '';
      this.listTerritories = [];
      this.searchValueTerritory = ''; // Clear territory search
      this.updateGroupedTerritories();
      this.updateCachedUnavailableIds();
    } else {
      // Change application selected
      this.applicationSelectedId = String(appSelectedId);
      this.territorySelectedId = '';
      this.searchValueTerritory = ''; // Clear territory search when changing application

      // Update listTerritories - will auto-select last selected territory if available
      this.getAllTerritoriesFromApplicationSelected();
    }
  }

  selectTerritory(territorySelectedId: string) {
    // Toggle selection: if clicking the same territory, deselect it
    if (String(this.territorySelectedId) === String(territorySelectedId)) {
      this.territorySelectedId = '';
    } else {
      this.territorySelectedId = String(territorySelectedId);
    }
  }

  closeEvent() {
    this.dialogRef.close();
  }

  isSelectionValid(): boolean {
    return this.hasApplication() && this.hasTerritory();
  }

  /**
   * Applies the selection and closes the dialog.
   */
  apply(): void {
    this.switchMap();
  }

  switchMap() {
    if (!this.isSelectionValid()) {
      if (!this.hasTerritory()) {
        this.translateService
          .get('map.errorNoTerritorySelected')
          .subscribe((trad) => {
            this.notificationService.error(trad);
          });
      }
      return;
    }

    if (this.router.url.startsWith('/public')) {
      this.router.navigateByUrl(
        NavigationPath.Section.Public.Map(
          Number(this.applicationSelectedId),
          Number(this.territorySelectedId)
        )
      );
    } else {
      this.router.navigateByUrl(
        NavigationPath.Section.User.Map(
          Number(this.applicationSelectedId),
          Number(this.territorySelectedId)
        )
      );
    }
    this.closeEvent();
  }
}
