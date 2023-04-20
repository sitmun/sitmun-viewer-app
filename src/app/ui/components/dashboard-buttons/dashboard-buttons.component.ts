import { Component, EventEmitter, Output } from '@angular/core';
import { DashboardTypes } from '@api/services/common.service';

@Component({
  selector: 'app-dashboard-buttons',
  templateUrl: './dashboard-buttons.component.html',
  styleUrls: ['./dashboard-buttons.component.scss']
})
export class DashboardButtonsComponent {
  @Output() type = new EventEmitter<DashboardTypes>();
  applicationSelected: boolean;
  territoriesSelected: boolean;
  constructor() {
    this.applicationSelected = true;
    this.territoriesSelected = false;
    this.type.emit(DashboardTypes.APPLICATIONS);
  }
  onClick(type: DashboardTypes) {
    switch (type) {
      case DashboardTypes.APPLICATIONS:
        this.applicationSelected = true;
        this.territoriesSelected = false;
        break;
      case DashboardTypes.TERRITORIES:
        this.territoriesSelected = true;
        this.applicationSelected = false;
        break;
    }
    this.type.emit(type);
  }

  protected readonly DashboardTypes = DashboardTypes;
}
