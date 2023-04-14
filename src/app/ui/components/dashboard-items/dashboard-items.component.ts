import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardTypes } from '@sections/user/dashboard/dashboard.component';

interface Item {
  img: string;
  id: number;
  name: string;
}
@Component({
  selector: 'app-dashboard-items',
  templateUrl: './dashboard-items.component.html',
  styleUrls: ['./dashboard-items.component.scss']
})
export class DashboardItemsComponent {
  @Input() type: DashboardTypes | undefined;
  @Input() items: Array<Item> | undefined;

  constructor(private router: Router) {}

  onCardClicked(id: number) {
    this.router.navigateByUrl('/user/map', {
      state: { type: this.type, id: id }
    });
  }

  protected readonly DashboardTypes = DashboardTypes;
}
