import { Component, OnInit } from '@angular/core';
import {
  ApplicationsResponse,
  CommonService,
  DashboardItem,
  DashboardTypes
} from '@api/services/common.service';
import { AbstractDashboardComponent } from '@sections/common/pages/abstract-dashboard.component';
import { Router } from '@angular/router';

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

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent
  extends AbstractDashboardComponent
  implements OnInit
{
  type: DashboardTypes;
  items: DashboardItem[];
  id: number | undefined; // id of card clicked, necessary to individual resource request

  constructor(private router: Router, private commonService: CommonService) {
    super();
    this.type = DashboardTypes.APPLICATIONS;
    this.items = [];
  }

  ngOnInit() {
    this.searchDashboardItems(DashboardTypes.APPLICATIONS);
  }

  searchDashboardItems(type: DashboardTypes, keywords?: string) {
    this.commonService
      .fetchResources(type, keywords)
      .subscribe((res: ApplicationsResponse) => {
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
    } else {
      this.type = DashboardTypes.TERRITORIES;
      /* temporally while territory's path is not implemented */
      this.fetchTerritories();
      return;
      /**/
    }
    this.searchDashboardItems(this.type);
  }

  onCardClicked(id: number) {
    this.id = id;
    this.router.navigateByUrl('/public/map');
  }

  onKeywordsSearch(keywords: string) {
    /* temporally while territory's path is not implemented */
    if (this.type === DashboardTypes.TERRITORIES) {
      this.fetchTerritories();
      return;
    }
    /**/
    this.searchDashboardItems(this.type, keywords);
  }
}
