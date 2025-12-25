import { TranslateService } from '@ngx-translate/core';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonService, DashboardItem } from '@api/services/common.service';
import { NavigationPath } from '@config/app.config';
import { NotificationService } from 'src/app/notifications/services/NotificationService';

/**
 * Component for displaying a single application card in the dashboard.
 * 
 * This component handles the "selection of territory given an application" logic:
 * - When an application with a single territory is clicked, it automatically navigates to the map
 * - When an application with multiple territories is clicked, it shows the territories list
 * 
 * This is separate from the ChangeApplicationTerritoryDialogComponent, which handles
 * the dialog-based application/territory selection UI.
 */
@Component({
  selector: 'app-dashboard-item',
  templateUrl: './dashboard-item.component.html',
  styleUrls: ['./dashboard-item.component.scss']
})
export class DashboardItemComponent {
  @Input() item!: DashboardItem;
  @Input() itemWidth!: string;
  @Output() tag = new EventEmitter<any>();
  DESCRIPTION_MAX_CHARACTER: number = 100;
  nbTerritory: number = 0;
  applicationId: number = 0;
  listOfTerritories: any;
  mediaQueryListener: any;

  constructor(
    private commonService: CommonService,
    private router: Router,
    private notificatioNService: NotificationService,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.fillTerritory(this.item.id);
    this.checkWindowSize();
  }

  ngOnDestroy() {
    if (this.mediaQueryListener) {
      this.mediaQueryListener.removeListener();
    }
  }

  notInAuth() {
    let notInAuth = true;
    if (this.router.url.startsWith(NavigationPath.Auth.Base)) {
      notInAuth = false;
    }
    return notInAuth;
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkWindowSize();
  }

  private checkWindowSize() {
    const width = window.innerWidth;
    if (width <= 640) {
      this.DESCRIPTION_MAX_CHARACTER = 30;
    } else {
      this.DESCRIPTION_MAX_CHARACTER = 75;
    }
  }

  /**
   * Determines if the current route is in the public section.
   */
  private isPublicSection(): boolean {
    return this.router.url.startsWith(NavigationPath.Section.Public.Base);
  }

  /**
   * Gets the appropriate map URL based on the current section (public or user).
   */
  private getMapUrl(applicationId: number, territoryId: number): string {
    return this.isPublicSection()
      ? NavigationPath.Section.Public.Map(applicationId, territoryId)
      : NavigationPath.Section.User.Map(applicationId, territoryId);
  }

  /**
   * Gets the appropriate application URL based on the current section (public or user).
   */
  private getApplicationUrl(applicationId: number): string {
    return this.isPublicSection()
      ? NavigationPath.Section.Public.Application(applicationId)
      : NavigationPath.Section.User.Application(applicationId);
  }

  fillTerritory(appId: number) {
    this.applicationId = appId;
    this.commonService.fetchTerritoriesByApplication(appId).subscribe({
      next: (res) => {
        this.listOfTerritories = res.content;
        this.nbTerritory = res.content.length;
      }
    });
  }

  navigateToApplicationDetails(idApp: number) {
    this.router.navigateByUrl(this.getApplicationUrl(idApp));
  }

  displayTerritoriesTag(application : any) {
    let object = {
      application: application,
      territories: this.listOfTerritories
    };
    this.tag.emit(object);
  }

  navigateToMap(idApp : number) {
    if(this.nbTerritory == 1) {
      this.router.navigateByUrl(
        this.getMapUrl(idApp, this.listOfTerritories[0].id)
      );
    }
    else {
      this.displayTerritoriesTag(this.item);
    }
  }

  /**
   * Navigates to the map for a specific application and territory.
   * This method is called when a territory is clicked in the territories tag/modal.
   */
  navigateToTerritoryMap(applicationId: number, territoryId: number): void {
    this.router.navigateByUrl(this.getMapUrl(applicationId, territoryId));
  }

}
