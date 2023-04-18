import { Component } from '@angular/core';
import { DashboardItem, DashboardTypes } from '@api/services/common.service';
import { AbstractDashboardComponent } from '@sections/common/pages/abstract-dashboard.component';
import { Router } from '@angular/router';

const applicationsList: DashboardItem[] = [
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

const territoriesList: DashboardItem[] = [
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
  }
  // {
  //   img: '',
  //   id: 4,
  //   name: 'Territory 4'
  // },
  // {
  //   img: '',
  //   id: 5,
  //   name: 'Territory 5'
  // },
  // {
  //   img: '',
  //   id: 6,
  //   name: 'Territory 6'
  // },
  // {
  //   img: '',
  //   id: 7,
  //   name: 'Territory 7'
  // },
  // {
  //   img: '',
  //   id: 8,
  //   name: 'Territory 8'
  // },
  // {
  //   img: '',
  //   id: 9,
  //   name: 'Territory 9'
  // },
  // {
  //   img: '',
  //   id: 10,
  //   name: 'Territory 10'
  // }
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
