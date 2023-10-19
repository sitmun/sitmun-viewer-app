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
  page: number = 1;
  size: number = 2;
  keywords: string = '';
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
    this.searchDashboardItems(this.page, 1);
  }

  searchDashboardItems(page: number, size?: number, keywords?: string) {
    this.commonService
      .fetchDashboardItems(this.type, page - 1, this.size, keywords)
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
    this.page = 1;
    this.searchDashboardItems(this.page);
  }

  abstract navigateToMap(applicationId: number, territoryId: number): any;

  openModal(id: number, items: Array<ItemDto>) {
    const ref = this.modal.open(DashboardModalComponent, {
      data: { id: id, type: this.type, items: items }
    });
    ref.afterClosed.subscribe(({ applicationId, territoryId }) => {
      if (applicationId && territoryId) {
        this.navigateToMap(applicationId, territoryId);
      }
    });
  }

  switchLength(items: Array<ItemDto>, id: number) {
    if (items.length === 1) {
      let applicationId!: number;
      let territoryId!: number;
      if (this.type === DashboardTypes.APPLICATIONS) {
        applicationId = id;
        territoryId = items[0].id;
      } else if (this.type === DashboardTypes.TERRITORIES) {
        applicationId = items[0].id;
        territoryId = id;
      }
      this.navigateToMap(applicationId, territoryId);
    } else {
      this.openModal(id, items);
    }
  }

  onCardClicked(id: number) {
    let response;
    if (this.type === DashboardTypes.APPLICATIONS) {
      response = this.commonService.fetchTerritoriesByApplication(id);
    } else if (this.type === DashboardTypes.TERRITORIES) {
      response = this.commonService.fetchApplicationsByTerritory(id);
    }
    response?.subscribe((response: ResponseDto) => {
      if (response.numberOfElements && response.content) {
        let items = response.content;
        if (this.type === DashboardTypes.TERRITORIES) {
          items = items.map((i: any) => {
            return { id: i.id, name: i.title };
          });
        }
        this.switchLength(items, id);
      }
    });
  }

  onKeywordsSearch(keywords: string) {
    this.page = 1;
    this.searchDashboardItems(this.page, this.size, keywords);
  }

  onPageChange(page: number) {
    this.page = page;
    this.searchDashboardItems(page, this.size, this.keywords);
  }
}
