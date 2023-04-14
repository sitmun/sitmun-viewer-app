import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationPath } from '@config/app.config';
import { DashboardTypes } from '@sections/user/dashboard/dashboard.component';

interface Item {
  img: string;
  id: number;
  name: string;
}

@Component({
  selector: 'app-public-dashboard',
  templateUrl: './public-dashboard.component.html',
  styleUrls: ['./public-dashboard.component.scss']
})
export class PublicDashboardComponent {
  type: DashboardTypes;
  items: Item[];

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
    },
    {
      img: '',
      id: 4,
      name: 'Public App 4'
    },
    {
      img: '',
      id: 5,
      name: 'Public App 5'
    },
    {
      img: '',
      id: 6,
      name: 'Public App 6'
    },
    {
      img: '',
      id: 7,
      name: 'Public App 7'
    },
    {
      img: '',
      id: 8,
      name: 'Public App 8'
    },
    {
      img: '',
      id: 9,
      name: 'Public App 9'
    },
    {
      img: '',
      id: 10,
      name: 'Public App 10'
    },
    {
      img: '',
      id: 11,
      name: 'Public App 11'
    },
    {
      img: '',
      id: 12,
      name: 'Public App 12'
    },
    {
      img: '',
      id: 13,
      name: 'Public App 13'
    },
    {
      img: '',
      id: 14,
      name: 'Public App 14'
    },
    {
      img: '',
      id: 15,
      name: 'Public App 15'
    },
    {
      img: '',
      id: 16,
      name: 'Public App 16'
    },
    {
      img: '',
      id: 17,
      name: 'Public App 17'
    },
    {
      img: '',
      id: 18,
      name: 'Public App 18'
    },
    {
      img: '',
      id: 19,
      name: 'Public App 19'
    },
    {
      img: '',
      id: 20,
      name: 'Public App 20'
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
    },
    {
      img: '',
      id: 4,
      name: 'Public Territory 4'
    },
    {
      img: '',
      id: 5,
      name: 'Public Territory 5'
    },
    {
      img: '',
      id: 6,
      name: 'Public Territory 6'
    },
    {
      img: '',
      id: 7,
      name: 'Public Territory 7'
    },
    {
      img: '',
      id: 8,
      name: 'Public Territory 8'
    },
    {
      img: '',
      id: 9,
      name: 'Public Territory 9'
    },
    {
      img: '',
      id: 10,
      name: 'Public Territory 10'
    }
  ];

  constructor(private router: Router) {
    this.type = DashboardTypes.APPLICATIONS;
    this.items = [...this.applicationsList];
  }

  backToLogin() {
    this.router.navigateByUrl(NavigationPath.Auth.Login);
  }
  onApplicationsClick() {
    this.type = DashboardTypes.APPLICATIONS;
    this.items = [...this.applicationsList];
  }

  onTerritoriesClick() {
    this.type = DashboardTypes.TERRITORIES;
    this.items = [...this.territoriesList];
  }
}
