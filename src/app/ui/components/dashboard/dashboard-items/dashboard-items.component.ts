import { Component, Input, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Codelist } from '@api/model/app-codelist';
import { DashboardItem } from '@api/services/common.service';

@Component({
  selector: 'app-dashboard-items',
  templateUrl: './dashboard-items.component.html',
  styleUrls: ['./dashboard-items.component.scss']
})
export class DashboardItemsComponent {
  @Input() items: DashboardItem[] = [];
  @Input() image_src: string = "";

  applicationSelected: any = null;
  hasWarning: boolean = false;
  isInMaintenance: boolean = false;
  displayTag: boolean = false;

  applicationToDisplayTag!: DashboardItem;
  territoriesToDisplayTag!: any;

  public privateItems: DashboardItem[] = [];
  public publicItems: DashboardItem[] = [];
  public allItems: DashboardItem[] = [];

  totalItems: number = 0;
  totalPrivateItems: number = 0;
  totalPublicItems: number = 0;

  readonly MAX_HIDDEN_MODE_ITEMS: number = 3;

  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['items'] && this.items) {
      if (this.isPublic()) {
        this.displayAllApplications(false);
      } else {
        this.displayAllPrivateApplications(false);
        this.displayAllPublicApplications(false);
      }
    }
  }

  ngOnInit() {
    if (this.isPublic()) {
      this.displayAllApplications(false);
    } else {
      this.displayAllPrivateApplications(false);
      this.displayAllPublicApplications(false);
    }
  }

  displayTerritoriesTag(display: any) {
    if (display.application != null) {
      this.displayTag = true;
      this.applicationToDisplayTag = display.application;
      this.territoriesToDisplayTag = display.territories.content;
    } else {
      this.displayTag = false;
    }
  }

  displayAllApplications(displayAll: boolean) {
    this.allItems = [...this.items];
    this.allItems = this.displayApplications(this.allItems, displayAll);
    this.totalItems = this.items.length;
  }

  displayAllPrivateApplications(displayAll : boolean) {
    const filtered = this.items.filter(item => item.type == Codelist.INTERNAL);
    this.totalPrivateItems = filtered.length;
    this.privateItems = this.displayApplications(filtered, displayAll);
  }

  displayAllPublicApplications(displayAll : boolean) {
    const filtered = this.items.filter(item => item.type == Codelist.EXTERNAL);
    this.totalPublicItems = filtered.length;
    this.publicItems = this.displayApplications(filtered, displayAll);
  }

  displayApplications(list: DashboardItem[], display: boolean): DashboardItem[] {
    this.totalItems = list.length;
    return display ? list : list.slice(0, this.MAX_HIDDEN_MODE_ITEMS);
  }

  isDashboard(): boolean {
    return this.router.url.startsWith("/user/dashboard") || this.router.url.startsWith("/public/dashboard");
  }

  isPublic(): boolean {
    return this.router.url.startsWith("/public");
  }
}
