import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-dashboard-pagination',
  templateUrl: './dashboard-pagination.component.html',
  styleUrls: ['./dashboard-pagination.component.scss']
})
export class DashboardPaginationComponent {
  @Output() page = new EventEmitter<number>();
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}
  handlePageChange(page: number): void {
    this.page.emit(page);
  }
}
