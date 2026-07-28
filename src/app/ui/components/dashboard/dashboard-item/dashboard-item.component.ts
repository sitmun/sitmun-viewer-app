import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';
import { Router } from '@angular/router';

import { CommonService, DashboardItem, ItemDto } from '@api/services/common.service';
import { NavigationPath } from '@config/app.config';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'src/app/notifications/services/NotificationService';
import { AppConfigService } from 'src/app/services/app-config.service';

export interface DashboardTerritoryTagPayload {
  application: DashboardItem;
  territories: ItemDto[];
}

@Component({
  standalone: false,
  selector: 'app-dashboard-item',
  templateUrl: './dashboard-item.component.html',
  styleUrls: ['./dashboard-item.component.scss']
})
export class DashboardItemComponent implements OnInit, OnChanges {
  @Input() item!: DashboardItem;
  @Output() tag = new EventEmitter<DashboardTerritoryTagPayload>();

  nbTerritory = 0;
  listOfTerritories: ItemDto[] = [];
  territoriesLoading = false;
  territoriesLoaded = false;

  private readonly appConfigService = inject(AppConfigService);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslateService);

  constructor(private commonService: CommonService, private router: Router) {}

  ngOnInit() {
    this.syncFromItem();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item']) {
      this.syncFromItem();
    }
  }

  private syncFromItem(): void {
    this.nbTerritory = 0;
    this.listOfTerritories = [];
    this.territoriesLoading = false;
    this.territoriesLoaded = false;

    if (this.item.territoryCount !== undefined) {
      this.nbTerritory = this.item.territoryCount;
      this.territoriesLoaded = true;
      if (this.item.singleTerritoryId) {
        this.listOfTerritories = [
          { id: this.item.singleTerritoryId, name: '' }
        ];
      }
      return;
    }

    if (this.isExternalLink()) {
      this.territoriesLoaded = true;
      return;
    }

    if (this.hasTerritory()) {
      this.fillTerritory(this.item.id);
    }
  }

  private isPublicSection(): boolean {
    return this.router.url.startsWith(NavigationPath.Section.Public.Base);
  }

  private getMapUrl(applicationId: number, territoryId: number): string {
    return this.isPublicSection()
      ? NavigationPath.Section.Public.Map(applicationId, territoryId)
      : NavigationPath.Section.User.Map(applicationId, territoryId);
  }

  private getApplicationUrl(applicationId: number): string {
    return this.isPublicSection()
      ? NavigationPath.Section.Public.Application(applicationId)
      : NavigationPath.Section.User.Application(applicationId);
  }

  fillTerritory(appId: number) {
    this.territoriesLoading = true;
    this.territoriesLoaded = false;
    this.commonService.fetchTerritoriesByApplication(appId).subscribe({
      next: (res) => {
        this.listOfTerritories = res.content;
        this.nbTerritory = res.content.length;
        this.territoriesLoading = false;
        this.territoriesLoaded = true;
        if (this.nbTerritory > 1) {
          this.displayTerritoriesTag(this.item);
        }
      },
      error: () => {
        this.listOfTerritories = [];
        this.nbTerritory = 0;
        this.territoriesLoading = false;
        this.territoriesLoaded = true;
      }
    });
  }

  navigateToApplicationDetails(idApp: number) {
    void this.router.navigateByUrl(this.getApplicationUrl(idApp));
  }

  displayTerritoriesTag(application: DashboardItem) {
    this.tag.emit({
      application,
      territories: this.listOfTerritories
    });
  }

  navigateToMap(idApp: number) {
    if (this.item.isUnavailable) {
      return;
    }
    if (this.isExternalLink()) {
      if (this.item.externalUrl) {
        this.openExternalUrl();
      } else {
        this.notifyMissingExternalUrl();
      }
      return;
    }
    if (this.territoriesLoading) {
      return;
    }

    if (this.nbTerritory === 1 && this.listOfTerritories.length > 0) {
      void this.router.navigateByUrl(
        this.getMapUrl(idApp, this.listOfTerritories[0].id)
      );
    } else if (this.nbTerritory > 1) {
      if (this.listOfTerritories.length === 0) {
        this.fillTerritory(idApp);
      } else {
        this.displayTerritoriesTag(this.item);
      }
    } else {
      this.notifyNoTerritories();
    }
  }

  isPrimaryActionDisabled(): boolean {
    if (this.item.isUnavailable) {
      return true;
    }
    if (this.isExternalLink()) {
      return !this.item.externalUrl;
    }
    return this.territoriesLoading || (this.nbTerritory === 0 && !this.territoriesLoaded);
  }

  primaryActionAriaLabel(): string {
    if (this.isExternalLink()) {
      return 'dashboardPage.openExternal';
    }
    return 'dashboardPage.openMap';
  }

  imageActionAriaLabel(): string {
    return this.primaryActionAriaLabel();
  }

  titleActionAriaLabel(): string {
    if (this.isExternalLink()) {
      return 'dashboardPage.openExternal';
    }
    return 'dashboardPage.access';
  }

  primaryButtonIcon(): string {
    return this.isExternalLink() ? 'open_in_new' : 'map';
  }

  primaryButtonLabelKey(): string {
    return this.isExternalLink()
      ? 'dashboardPage.openExternal'
      : 'dashboardPage.access';
  }

  onImageKeydown(event: KeyboardEvent, idApp: number): void {
    if (event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
    }
    if (event.key === 'Enter' || event.key === ' ') {
      this.navigateToMap(idApp);
    }
  }

  private hasTerritory(): boolean {
    return this.appConfigService.applicationHasTerritory(this.item);
  }

  private isExternalLink(): boolean {
    return this.appConfigService.isExternalLinkApplication(this.item);
  }

  private openExternalUrl(): void {
    window.open(this.item.externalUrl!, '_blank', 'noopener,noreferrer');
  }

  private notifyMissingExternalUrl(): void {
    this.translateService
      .get('dashboardPage.externalUrlMissing')
      .subscribe((message) => this.notificationService.warning(message));
  }

  private notifyNoTerritories(): void {
    this.translateService
      .get('dashboardPage.noTerritoriesInApplication')
      .subscribe((message) => this.notificationService.warning(message));
  }
}
