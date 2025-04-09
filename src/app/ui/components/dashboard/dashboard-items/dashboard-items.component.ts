import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService, DashboardItem } from '@api/services/common.service';

@Component({
  selector: 'app-dashboard-items',
  templateUrl: './dashboard-items.component.html',
  styleUrls: ['./dashboard-items.component.scss']
})
export class DashboardItemsComponent {
  @Input() items: Array<DashboardItem> = [];
  @Input() image_src: string = "";

  applicationSelected : any = null;
  hasWarning : boolean = false;
  isInMaintenance : boolean = false;
  displayTag : boolean = false;

  applicationToDisplayTag! : DashboardItem;
  territoriesToDisplayTag! : any;

  privateItems: Array<DashboardItem> = [];
  publicItems: Array<DashboardItem> = [];
  allItems: Array<DashboardItem> = [];

  readonly MAX_HIDDEN_MODE_ITEMS : number = 3;

  constructor(private router : Router) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['items'] && this.items) {
      if(this.isPublic()){
        this.displayAllApplications(false);
      }
      else {
        this.displayAllPrivateApplications(false);
        this.displayAllPublicApplications(false);
      }
    }
  }


  ngOnInit() {
    if(this.isPublic()){
      this.displayAllApplications(false);
    }
    else {
      this.displayAllPrivateApplications(false);
      this.displayAllPublicApplications(false);
    }
  }


  displayTerritoriesTag(display: any) {
    if(display.application != null){
      this.displayTag = true;
      this.applicationToDisplayTag = display.application;
      this.territoriesToDisplayTag = display.territories.content;
    }
    else {
      this.displayTag = false;
    }
  }


  displayAllApplications(displayAll : boolean) {
    this.allItems = [...this.items];
    this.allItems = this.displayApplications(this.allItems, displayAll);
  }

  displayAllPrivateApplications(displayAll : boolean) {
    this.privateItems = this.items.filter(item => item.appPrivate);
    this.privateItems = this.displayApplications(this.privateItems, displayAll);
  }

  displayAllPublicApplications(displayAll : boolean) {
    this.publicItems = this.items.filter(item => !item.appPrivate);
    this.publicItems = this.displayApplications(this.publicItems, displayAll);
  }

  displayApplications(list: any[], display: boolean) {
    return display ? list : list.slice(0, this.MAX_HIDDEN_MODE_ITEMS);
  }

  isDashboard() {
    return this.router.url.startsWith("/user/dashboard") || this.router.url.startsWith("/public/dashboard")
  }

  isPublic() {
    return this.router.url.startsWith("/public");
  }
}
