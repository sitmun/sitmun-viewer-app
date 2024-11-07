import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DashboardItem } from '@api/services/common.service';

@Component({
  selector: 'app-dashboard-items',
  templateUrl: './dashboard-items.component.html',
  styleUrls: ['./dashboard-items.component.scss']
})
export class DashboardItemsComponent {
  @Input() items: Array<DashboardItem> = [];
  @Input() page: number = 0;
  @Input() size: number = 0;
  @Input() totalElements: number = 0;
  @Output() id = new EventEmitter<number>();

  constructor() {  }

  onCardClicked(id: number) {
    this.id.emit(id);
  }
}
