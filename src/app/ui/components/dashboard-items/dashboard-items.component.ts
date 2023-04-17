import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardItem, DashboardTypes } from '@api/services/common.service';

@Component({
  selector: 'app-dashboard-items',
  templateUrl: './dashboard-items.component.html',
  styleUrls: ['./dashboard-items.component.scss']
})
export class DashboardItemsComponent {
  @Input() type: DashboardTypes | undefined;
  @Input() items: Array<DashboardItem> | undefined;

  constructor(private router: Router) {}

  onCardClicked(id: number) {
    this.router.navigateByUrl('/user/map', {
      state: { type: this.type, id: id }
    });
  }

  protected readonly DashboardTypes = DashboardTypes;
}
