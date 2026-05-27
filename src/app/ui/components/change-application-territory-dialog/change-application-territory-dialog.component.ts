import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

import {
  CommonService,
  DashboardItem,
  DashboardItemsResponse,
  DashboardTypes
} from '@api/services/common.service';
import { NavigationPath } from '@config/app.config';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from 'src/app/notifications/services/NotificationService';
import { AppConfigService } from 'src/app/services/app-config.service';

@Component({
  standalone: false,
  selector: 'app-change-application-territory-dialog',
  templateUrl: './change-application-territory-dialog.component.html',
  styleUrls: ['./change-application-territory-dialog.component.scss']
})
export class ChangeApplicationTerritoryDialogComponent
  implements OnInit, OnDestroy
{
  applicationSelectedId!: string;
  territorySelectedId!: string;
  listApplications!: Array<DashboardItem>;
  listTerritories!: Array<any>;
  searchValueApplication = '';
  searchValueTerritory = '';
  cachedUnavailableApplicationIds: string[] = [];
  cachedUnavailableTerritoryIds: string[] = [];

  // Cached grouped data to prevent infinite loops
  groupedApplications: { group?: string; items: any[] }[] = [];
  groupedTerritories: { group?: string; items: any[] }[] = [];

  // Store the last selected territory to restore when territories are loaded
  private lastSelectedTerritoryId = '';
  private readonly destroy$ = new Subject<void>();
  private readonly appConfigService = inject(AppConfigService);

  constructor(
    private router: Router,
    private commonService: CommonService,
    private notificationService: NotificationService,
    private translateService: TranslateService,
    private dialogRef: MatDialogRef<ChangeApplicationTerritoryDialogComponent>
  ) {}

  /**
   * Filter switcher applications by type based on app configuration.
   */
  private filterSwitcherApplications(items: DashboardItem[]): DashboardItem[] {
    return this.appConfigService.filterApplicationsByType(
      items,
      this.appConfigService.getMapSwitcherConfig()
    ) as DashboardItem[];
  }

  private isApplicationAllowedInSwitcher(app: DashboardItem): boolean {
    return this.filterSwitcherApplications([app]).length > 0;
  }

  /**
   * Update cached grouped applications when data or search changes.
   */
  private updateGroupedApplications(): void {
    const switcherApps = this.filterSwitcherApplications(
      this.listApplications || []
    );

    // Filter out unavailable applications (under maintenance)
    const availableApps = switcherApps.filter((app) => !app.isUnavailable);

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
          this.isApplicationAllowedInSwitcher(selectedApp) &&
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
    this.loadDialogData();
    this.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadDialogData();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Territory selection applies only to map applications (not external links).
   */
  showTerritorySelection(): boolean {
    return this.hasApplication() && this.selectedApplicationHasTerritory();
  }

  private getSelectedApplication(): DashboardItem | undefined {
    if (!this.hasApplication()) {
      return undefined;
    }
    return this.listApplications?.find(
      (app) => String(app.id) === String(this.applicationSelectedId)
    );
  }

  isSelectedApplicationExternalLink(): boolean {
    const app = this.getSelectedApplication();
    return app != null && this.appConfigService.isExternalLinkApplication(app);
  }

  selectedApplicationHasTerritory(): boolean {
    const app = this.getSelectedApplication();
    return app != null && this.appConfigService.applicationHasTerritory(app);
  }

  private loadDialogData(): void {
    // Get applicationID and territoryID from route parameters
    const { applicationId, territoryId } = this.getRouteParams();
    this.applicationSelectedId = applicationId;
    this.territorySelectedId = territoryId;

    this.commonService
      .fetchDashboardItems(DashboardTypes.APPLICATIONS)
      .subscribe((res: DashboardItemsResponse) => {
        // Store all applications (before type filtering)
        // Type filtering will be applied in updateGroupedApplications()
        this.listApplications = res.content;
        this.updateCachedUnavailableIds();
        this.updateGroupedApplications();

        if (this.showTerritorySelection()) {
          this.getAllTerritoriesFromApplicationSelected();
        } else {
          this.listTerritories = [];
          this.territorySelectedId = '';
          this.updateGroupedTerritories();
        }
      });
  }

  getAllTerritoriesFromApplicationSelected() {
    if (this.isSelectedApplicationExternalLink()) {
      this.listTerritories = [];
      this.territorySelectedId = '';
      this.updateGroupedTerritories();
      return;
    }

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
    if (!app || !this.isApplicationAllowedInSwitcher(app) || app.isUnavailable) {
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

      if (this.isSelectedApplicationExternalLink()) {
        this.listTerritories = [];
        this.updateGroupedTerritories();
      } else {
        // Update listTerritories - will auto-select last selected territory if available
        this.getAllTerritoriesFromApplicationSelected();
      }
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

  closeEvent() {
    this.dialogRef.close();
  }

  isSelectionValid(): boolean {
    if (!this.hasApplication()) {
      return false;
    }
    if (this.isSelectedApplicationExternalLink()) {
      return !!this.getSelectedApplication()?.externalUrl;
    }
    return this.hasTerritory();
  }

  /**
   * Applies the selection and closes the dialog.
   */
  apply(): void {
    this.switchMap();
  }

  switchMap() {
    if (!this.isSelectionValid()) {
      if (
        this.hasApplication() &&
        !this.isSelectedApplicationExternalLink() &&
        !this.hasTerritory()
      ) {
        this.translateService
          .get('map.errorNoTerritorySelected')
          .subscribe((trad) => {
            this.notificationService.error(trad);
          });
      }
      return;
    }

    if (this.isSelectedApplicationExternalLink()) {
      const externalUrl = this.getSelectedApplication()?.externalUrl;
      if (externalUrl) {
        window.open(externalUrl, '_blank', 'noopener,noreferrer');
      }
      this.closeEvent();
      return;
    }

    if (this.router.url.startsWith('/public')) {
      void this.router.navigateByUrl(
        NavigationPath.Section.Public.Map(
          Number(this.applicationSelectedId),
          Number(this.territorySelectedId)
        )
      );
    } else {
      void this.router.navigateByUrl(
        NavigationPath.Section.User.Map(
          Number(this.applicationSelectedId),
          Number(this.territorySelectedId)
        )
      );
    }
    this.closeEvent();
  }
}
