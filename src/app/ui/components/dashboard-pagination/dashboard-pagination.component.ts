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
    console.log(page);
    this.page.emit(page);
  }
}
