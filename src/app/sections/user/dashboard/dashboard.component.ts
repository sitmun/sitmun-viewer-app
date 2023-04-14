import { Component } from '@angular/core';

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
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  type: DashboardTypes;
  items: Item[];

  applicationsList: Item[] = [
    {
      img: '',
      id: 1,
      name: 'App 1'
    },
    {
      img: '',
      id: 2,
      name: 'App 2'
    },
    {
      img: '',
      id: 3,
      name: 'App 3'
    },
    {
      img: '',
      id: 4,
      name: 'App 4'
    },
    {
      img: '',
      id: 5,
      name: 'App 5'
    },
    {
      img: '',
      id: 6,
      name: 'App 6'
    },
    {
      img: '',
      id: 7,
      name: 'App 7'
    },
    {
      img: '',
      id: 8,
      name: 'App 8'
    },
    {
      img: '',
      id: 9,
      name: 'App 9'
    },
    {
      img: '',
      id: 10,
      name: 'App 10'
    },
    {
      img: '',
      id: 11,
      name: 'App 11'
    },
    {
      img: '',
      id: 12,
      name: 'App 12'
    },
    {
      img: '',
      id: 13,
      name: 'App 13'
    },
    {
      img: '',
      id: 14,
      name: 'App 14'
    },
    {
      img: '',
      id: 15,
      name: 'App 15'
    },
    {
      img: '',
      id: 16,
      name: 'App 16'
    },
    {
      img: '',
      id: 17,
      name: 'App 17'
    },
    {
      img: '',
      id: 18,
      name: 'App 18'
    },
    {
      img: '',
      id: 19,
      name: 'App 19'
    },
    {
      img: '',
      id: 20,
      name: 'App 20'
    }
  ];

  territoriesList: Item[] = [
    {
      img: '',
      id: 1,
      name: 'Territory 1'
    },
    {
      img: '',
      id: 2,
      name: 'Territory 2'
    },
    {
      img: '',
      id: 3,
      name: 'Territory 3'
    },
    {
      img: '',
      id: 4,
      name: 'Territory 4'
    },
    {
      img: '',
      id: 5,
      name: 'Territory 5'
    },
    {
      img: '',
      id: 6,
      name: 'Territory 6'
    },
    {
      img: '',
      id: 7,
      name: 'Territory 7'
    },
    {
      img: '',
      id: 8,
      name: 'Territory 8'
    },
    {
      img: '',
      id: 9,
      name: 'Territory 9'
    },
    {
      img: '',
      id: 10,
      name: 'Territory 10'
    }
  ];

  constructor() {
    this.type = DashboardTypes.APPLICATIONS;
    this.items = [...this.applicationsList];
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
