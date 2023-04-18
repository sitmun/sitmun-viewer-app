import { Component } from '@angular/core';
import { DashboardItem, DashboardTypes } from '@api/services/common.service';
import { Router } from '@angular/router';

const applicationsList: DashboardItem[] = [
  {
    img: '',
    id: 1,
    name: 'Public App 1 Public App 1 Public App 1 Public App 1 Public App 1 Public App 1 Public App 1'
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
  }
];

const territoriesList: DashboardItem[] = [
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
  // {
  //   img: '',
  //   id: 4,
  //   name: 'Public Territory 4'
  // },
  // {
  //   img: '',
  //   id: 5,
  //   name: 'Public Territory 5'
  // },
  // {
  //   img: '',
  //   id: 6,
  //   name: 'Public Territory 6'
  // },
  // {
  //   img: '',
  //   id: 7,
  //   name: 'Public Territory 7'
  // },
  // {
  //   img: '',
  //   id: 8,
  //   name: 'Public Territory 8'
  // },
  // {
  //   img: '',
  //   id: 9,
  //   name: 'Public Territory 9'
  // },
  // {
  //   img: '',
  //   id: 10,
  //   name: 'Public Territory 10'
  // }
];

@Component({
  selector: 'app-public-dashboard',
  templateUrl: './public-dashboard.component.html',
  styleUrls: ['./public-dashboard.component.scss']
})
export class PublicDashboardComponent {
  type: DashboardTypes;
  items: DashboardItem[];
  id: number | undefined; // id of card clicked, necessary to individual resource request

  constructor(private router: Router) {
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
