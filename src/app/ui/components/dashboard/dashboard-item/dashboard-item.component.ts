import { Component , EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonService, DashboardItem } from '@api/services/common.service';
import { Router } from '@angular/router';
import { NavigationPath } from '@config/app.config';


@Component({
  selector: 'app-dashboard-item',
  templateUrl: './dashboard-item.component.html',
  styleUrls: ['./dashboard-item.component.scss']
})
export class DashboardItemComponent {
  @Input() item!: DashboardItem;
  @Input() itemWidth!: string;
  @Output() tag = new EventEmitter<any>();
  DESCRIPTION_MAX_CHARACTER : number = 75;
  nbTerritory : number = 0;
  applicationId : number = 0;
  listOfTerritories : any;
  mediaQueryListener: any;

  constructor(
    private commonService : CommonService,
    private router : Router
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

  @HostListener('window:resize', ['$event'])
  onResize(event : any) {
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

  fillTerritory(appId : number) {
    this.applicationId = appId;
    this.commonService.fetchTerritoriesByApplication(appId).subscribe({
      next: (res) => {
        this.listOfTerritories = res.content;
        this.nbTerritory = res.numberOfElements;
      }
    });
  }

  displayTerritoriesTag(application : any) {
    let object = {
      'application': application,
      'territories': this.listOfTerritories
    }
    this.tag.emit(object);
  }

  navigateToMap(applicationId : number, territoryId: number) {
    let navigationPath = "";
    if(this.router.url.startsWith("/user")){
      navigationPath = NavigationPath.Section.User.Map(applicationId, territoryId);
    }
    else if(this.router.url.startsWith("/public")){
      navigationPath = NavigationPath.Section.Public.Map(applicationId, territoryId);
    }

    this.router.navigateByUrl(
      navigationPath
    );
  }

}
