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
    title: 'Public Territory 1'
  },
  {
    img: '',
    id: 2,
    title: 'Public Territory 2'
  },
  {
    img: '',
    id: 3,
    title:
      'Public Territory 3 Public Territory 3 Public Territory 3 Public Territory 3 Public Territory 3 Public Territory 3'
  },
  {
    img: '',
    id: 4,
    title: 'Public Territory 4'
  },
  {
    img: '',
    id: 5,
    title: 'Public Territory 5'
  },
  {
    img: '',
    id: 6,
    title:
      'Public Territory 6 Public Territory 6 Public Territory 6 Public Territory 6'
  },
  {
    img: '',
    id: 7,
    title: 'Public Territory 7'
  },
  {
    img: '',
    id: 8,
    title: 'Public Territory 8'
  },
  {
    img: '',
    id: 9,
    title: 'Public Territory 9'
  },
  {
    img: '',
    id: 10,
    title: 'Public Territory 10'
  },
  {
    img: '',
    id: 11,
    title: 'Public Territory 11'
  },
  {
    img: '',
    id: 12,
    title: 'Public Territory 12'
  },
  {
    img: '',
    id: 13,
    title: 'Public Territory 13'
  },
  {
    img: '',
    id: 14,
    title: 'Public Territory 14'
  },
  {
    img: '',
    id: 15,
    title: 'Public Territory 15'
  },
  {
    img: '',
    id: 16,
    title: 'Public Territory 16'
  },
  {
    img: '',
    id: 17,
    title: 'Public Territory 17'
  },
  {
    img: '',
    id: 18,
    title: 'Public Territory 18'
  },
  {
    img: '',
    id: 19,
    title: 'Public Territory 19'
  },
  {
    img: '',
    id: 20,
    title: 'Public Territory 20'
  },
  {
    img: '',
    id: 21,
    title: 'Public Territory 21'
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
