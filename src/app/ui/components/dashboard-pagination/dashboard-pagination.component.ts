import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-dashboard-pagination',
  templateUrl: './dashboard-pagination.component.html',
  styleUrls: ['./dashboard-pagination.component.scss']
})
export class DashboardPaginationComponent {
  @Output() page = new EventEmitter<number>();
  constructor() {}
  handlePageChange(page: number): void {
    this.page.emit(page);
  }
}
