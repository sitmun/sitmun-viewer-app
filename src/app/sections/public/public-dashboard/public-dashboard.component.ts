import { Component, OnInit } from '@angular/core';
import {
  ApplicationsResponse,
  DashboardItem,
  DashboardTypes
} from '@api/services/common.service';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { URL_API_PUBLIC_APPLICATIONS } from '@api/api-config';
import { HttpClient } from '@angular/common/http';

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
    title: 'Public Territory 3'
  }
];

@Component({
  selector: 'app-public-dashboard',
  templateUrl: './public-dashboard.component.html',
  styleUrls: ['./public-dashboard.component.scss']
})
export class PublicDashboardComponent implements OnInit {
  type: DashboardTypes;
  items: DashboardItem[];
  id: number | undefined; // id of card clicked, necessary to individual resource request

  constructor(private router: Router, private http: HttpClient) {
    this.type = DashboardTypes.APPLICATIONS;
    this.items = [];
  }

  ngOnInit() {
    this.fetchApplications();
  }

  fetchApplications() {
    this.http
      .get<any>(environment.apiUrl + URL_API_PUBLIC_APPLICATIONS)
      .subscribe((res: ApplicationsResponse) => {
        this.items = res.content;
      });
  }

  fetchTerritories() {
    this.items = [...territoriesList];
  }

  onTypeChange(type: DashboardTypes) {
    if (type === DashboardTypes.APPLICATIONS) {
      this.type = DashboardTypes.APPLICATIONS;
      this.fetchApplications();
    } else {
      this.type = DashboardTypes.TERRITORIES;
      this.fetchTerritories();
    }
  }

  onCardClicked(id: number) {
    this.id = id;
    this.router.navigateByUrl('/user/map');
  }
}
