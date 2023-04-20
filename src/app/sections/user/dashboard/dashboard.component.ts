import { Component } from '@angular/core';
import { DashboardItem, DashboardTypes } from '@api/services/common.service';
import { AbstractDashboardComponent } from '@sections/common/pages/abstract-dashboard.component';
import { Router } from '@angular/router';

const applicationsList: DashboardItem[] = [
  {
    img: '',
    id: 1,
    title: 'App 1'
  },
  {
    img: '',
    id: 2,
    title: 'App 2'
  },
  {
    img: '',
    id: 3,
    title: 'App 3'
  },
  {
    img: '',
    id: 4,
    title: 'App 4'
  },
  {
    img: '',
    id: 5,
    title: 'App 5'
  },
  {
    img: '',
    id: 6,
    title: 'App 6'
  },
  {
    img: '',
    id: 7,
    title: 'App 7'
  },
  {
    img: '',
    id: 8,
    title: 'App 8'
  },
  {
    img: '',
    id: 9,
    title: 'App 9'
  },
  {
    img: '',
    id: 10,
    title: 'App 10'
  },
  {
    img: '',
    id: 11,
    title: 'App 11'
  },
  {
    img: '',
    id: 12,
    title: 'App 12'
  },
  {
    img: '',
    id: 13,
    title: 'App 13'
  },
  {
    img: '',
    id: 14,
    title: 'App 14'
  },
  {
    img: '',
    id: 15,
    title: 'App 15'
  },
  {
    img: '',
    id: 16,
    title: 'App 16'
  },
  {
    img: '',
    id: 17,
    title: 'App 17'
  },
  {
    img: '',
    id: 18,
    title: 'App 18'
  },
  {
    img: '',
    id: 19,
    title: 'App 19'
  },
  {
    img: '',
    id: 20,
    title: 'App 20'
  }
];

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
export class DashboardComponent extends AbstractDashboardComponent {
  type: DashboardTypes;
  items: DashboardItem[];
  id: number | undefined; // id of card clicked, necessary to individual resource request

  constructor(private router: Router) {
    super();
    this.type = DashboardTypes.APPLICATIONS;
    this.items = [...applicationsList];
  }

  onTypeChange(type: DashboardTypes) {
    if (type === DashboardTypes.APPLICATIONS) {
      this.type = DashboardTypes.APPLICATIONS;
      this.items = [...applicationsList];
    } else {
      this.type = DashboardTypes.TERRITORIES;
      this.items = [...territoriesList];
    }
  }

  onCardClicked(id: number) {
    this.id = id;
    this.router.navigateByUrl('/user/map');
  }
}
