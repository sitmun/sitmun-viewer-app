import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { DashboardItem } from '@api/services/common.service';

@Component({
  standalone: false,
  selector: 'app-application-details',
  templateUrl: './application-details.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./application-details.component.scss']
})
export class ApplicationDetailsComponent {
  @Input() application!: DashboardItem;

  hasLastUpdate(): boolean {
    return !!(this.application.lastUpdate ?? this.application.updateDate);
  }

  displayLastUpdate(): Date {
    return (this.application.lastUpdate ?? this.application.updateDate) as Date;
  }
}
