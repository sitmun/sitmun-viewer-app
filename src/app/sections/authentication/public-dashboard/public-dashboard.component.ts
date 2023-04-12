import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationPath } from '@config/app.config';

interface Item {
  img: string;
  id: number;
  name: string;
}

export enum DashboardTypes {
  APPLICATIONS,
  TERRITORIES
}

@Component({
  selector: 'app-public-dashboard',
  templateUrl: './public-dashboard.component.html',
  styleUrls: ['./public-dashboard.component.scss']
})
export class PublicDashboardComponent {
  type: DashboardTypes;

  applicationsList: Item[] = [
    {
      img: '',
      id: 1,
      name: 'Public App 1'
    },
    {
      img: '',
      id: 2,
      name: 'Public App 2'
    },
    {
      img: '',
      id: 3,
      name: 'Public App 3'
    }
  ];

  territoriesList: Item[] = [
    {
      img: '',
      id: 1,
      name: 'Public Territory 1'
    },
    {
      img: '',
      id: 2,
      name: 'Public Territory 2'
    },
    {
      img: '',
      id: 3,
      name: 'Public Territory 3'
    }
  ];

  constructor(private router: Router) {
    this.type = DashboardTypes.APPLICATIONS;
  }

  backToLogin() {
    this.router.navigateByUrl(NavigationPath.Auth.Login);
  }

  onChange(type: string) {
    this.type =
      type === '0' ? DashboardTypes.APPLICATIONS : DashboardTypes.TERRITORIES;
  }

  goToMap() {
    this.router.navigateByUrl('/auth/map');
  }

  protected readonly DashboardTypes = DashboardTypes;
}
