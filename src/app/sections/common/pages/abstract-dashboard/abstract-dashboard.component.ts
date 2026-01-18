import { Directive, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {
  CommonService,
  DashboardItem,
  DashboardItemsResponse,
  DashboardTypes
} from '@api/services/common.service';
import { OpenModalService } from '@ui/modal/service/open-modal.service';

@Directive()
export abstract class AbstractDashboardComponent implements OnInit {
  type: DashboardTypes;

  items: DashboardItem[];
  totalElements = 0;
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

  loadItems(keyword = '') {
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
