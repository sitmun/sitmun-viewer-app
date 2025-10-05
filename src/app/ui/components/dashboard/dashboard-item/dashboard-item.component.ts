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

  constructor(private commonService: CommonService, private router: Router) {}

  ngOnInit() {
    this.fillTerritory(this.item.id);
    this.checkWindowSize();
  }

  ngOnDestroy() {
    if (this.mediaQueryListener) {
      this.mediaQueryListener.removeListener();
    }
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

  fillTerritory(appId: number) {
    this.applicationId = appId;
    this.commonService.fetchTerritoriesByApplication(appId).subscribe({
      next: (res) => {
        this.listOfTerritories = res.content;
        this.nbTerritory = res.content.length;
      }
    });
  }

  /**
   * If the nb of territories > 1, navigate to applicationDetails. If nb of territories <= 1, navigate directly to the map of the territory
   */
  navigateToApplicationDetailsOrMap(idApp: number) {
    if (this.nbTerritory > 1) {
      this.navigateToApplicationDetails(idApp);
    } else if (this.nbTerritory == 1) {
      this.navigateToMap(idApp, this.listOfTerritories[0].id);
    }
  }

  navigateToApplicationDetails(idApp: number) {
    if (this.router.url.startsWith('/public')) {
      this.router.navigateByUrl(
        NavigationPath.Section.Public.Application(idApp)
      );
    } else {
      this.router.navigateByUrl(NavigationPath.Section.User.Application(idApp));
    }
  }

  displayTerritoriesTag(application : any) {
    let object = {
      application: application,
      territories: this.listOfTerritories
    }
    this.tag.emit(object);
  }

  navigateToMap(applicationId : number, territoryId: number) {
    let navigationPath = "";
    if (this.router.url.startsWith('/user')) {
      navigationPath = NavigationPath.Section.User.Map(
        applicationId,
        territoryId
      );
    } else if (this.router.url.startsWith('/public')) {
      NavigationPath.Section.Public.Territory(territoryId);
    }
  }

  navigateToMapWithTerritory(idApp: number, territoryId: number) {
    if (this.router.url.startsWith('/public')) {
      this.router.navigateByUrl(
        NavigationPath.Section.Public.Map(idApp, territoryId)
      );
    } else {
      this.router.navigateByUrl(
        NavigationPath.Section.User.Map(idApp, territoryId)
      );
    }
  }

  renderDescription() {
    let description = this.item.description;
    if (
      description != null &&
      description.length > this.DESCRIPTION_MAX_CHARACTER
    ) {
      description = description.slice(0, this.DESCRIPTION_MAX_CHARACTER) + '...';
    }
    return description;
  }
}
