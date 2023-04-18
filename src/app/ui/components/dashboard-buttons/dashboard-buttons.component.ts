import { Component, EventEmitter, Output } from '@angular/core';
import { DashboardTypes } from '@api/services/common.service';
@Component({
  selector: 'app-dashboard-buttons',
  templateUrl: './dashboard-buttons.component.html',
  styleUrls: ['./dashboard-buttons.component.scss']
})
export class DashboardButtonsComponent {
  @Output() type = new EventEmitter<DashboardTypes>();
  constructor() {
    this.type.emit(DashboardTypes.APPLICATIONS);
  }
  onApplicationsClick() {
    this.type.emit(DashboardTypes.APPLICATIONS);
  }
  onTerritoriesClick() {
    this.type.emit(DashboardTypes.TERRITORIES);
  }
}
