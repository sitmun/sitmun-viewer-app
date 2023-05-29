import { Directive, OnInit } from '@angular/core';
import {
  ApplicationDto,
  CommonService,
  DashboardItem,
  DashboardItemsResponse,
  DashboardTypes,
  TerritoryDto
} from '@api/services/common.service';
import { Router } from '@angular/router';
import { OpenModalService } from '@ui/modal/service/open-modal.service';
import { DashboardModalComponent } from '@sections/common/modals/dashboard-modal/dashboard-modal.component';

const territoriesList: DashboardItem[] = [
  {
    img: '',
    id: 1,
    title: 'Territory 1'
  },
  {
    img: '',
    id: 2,
    title: 'Territory 2'
  },
  {
    img: '',
    id: 3,
    title: 'Territory 3'
  }
];

@Directive()
export abstract class AbstractDashboardComponent implements OnInit {
  type: DashboardTypes;
  items: DashboardItem[];

  protected constructor(
    protected router: Router,
    protected commonService: CommonService,
    protected modal: OpenModalService
  ) {
    this.type = DashboardTypes.APPLICATIONS;
    this.items = [];
  }

  ngOnInit() {
    this.searchDashboardItems();
  }

  searchDashboardItems(keywords?: string) {
    this.commonService
      .fetchDashboardItems(this.type, keywords)
      .subscribe((res: DashboardItemsResponse) => {
        this.items = res.content;
      });
  }

  /* temporally while territory's path is not implemented */
  fetchTerritories() {
    this.items = [...territoriesList];
  }
  /**/

  onTypeChange(type: DashboardTypes) {
    if (type === DashboardTypes.APPLICATIONS) {
      this.type = DashboardTypes.APPLICATIONS;
    } else if (type === DashboardTypes.TERRITORIES) {
      this.type = DashboardTypes.TERRITORIES;
      /* temporally while territory's path is not implemented */
      this.fetchTerritories();
      return;
      /**/
    }
    this.items = [];
    this.searchDashboardItems();
  }

  abstract navigateToMap(applicationId: number, territoryId: number): any;

  openModal(id: number, items: Array<ApplicationDto> | Array<TerritoryDto>) {
    const ref = this.modal.open(DashboardModalComponent, {
      data: { id: id, type: this.type, items: items }
    });
    ref.afterClosed.subscribe(({ applicationId, territoryId }) => {
      this.navigateToMap(applicationId, territoryId);
    });
  }

  switchLength(items: Array<ApplicationDto> | Array<TerritoryDto>, id: number) {
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
    response?.subscribe(
      (items: Array<ApplicationDto> | Array<TerritoryDto>) => {
        if (items.length) {
          this.switchLength(items, id);
        }
      }
    );
  }

  onKeywordsSearch(keywords: string) {
    /* temporally while territory's path is not implemented */
    if (this.type === DashboardTypes.TERRITORIES) {
      this.fetchTerritories();
      return;
    }
    /**/
    this.searchDashboardItems(keywords);
  }
}
