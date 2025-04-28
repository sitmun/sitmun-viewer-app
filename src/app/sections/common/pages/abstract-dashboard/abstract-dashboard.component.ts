import { Directive, OnInit } from '@angular/core';
import {
  CommonService,
  DashboardItem,
  DashboardItemsResponse,
  DashboardTypes,
  ItemDto,
  ResponseDto
} from '@api/services/common.service';
import { Router } from '@angular/router';
import { OpenModalService } from '@ui/modal/service/open-modal.service';
import { DashboardModalComponent } from '@sections/common/modals/dashboard-modal/dashboard-modal.component';

@Directive()
export abstract class AbstractDashboardComponent implements OnInit {
  type: DashboardTypes;

  items: DashboardItem[];
  totalElements: number = 0;
  protected constructor(
    protected router: Router,
    protected commonService: CommonService,
    protected modal: OpenModalService
  ) {
    this.type = DashboardTypes.APPLICATIONS;
    this.items = [];
  }

  ngOnInit() {
    this.loadItems();
  }

  loadItems(keyword : string = "") {
    this.commonService
      .fetchDashboardItems(this.type, keyword)
      .subscribe((res: DashboardItemsResponse) => {
        this.items = res.content;
        this.totalElements = res.totalElements;
      });
  }

  onTypeChange(type: DashboardTypes) {
    if (type === DashboardTypes.APPLICATIONS) {
      this.type = DashboardTypes.APPLICATIONS;
    } else if (type === DashboardTypes.TERRITORIES) {
      this.type = DashboardTypes.TERRITORIES;
    }
    this.items = [];
    this.loadItems();
  }

  onKeywordsSearch(keywords: string) {
    this.loadItems(keywords);
  }

}
