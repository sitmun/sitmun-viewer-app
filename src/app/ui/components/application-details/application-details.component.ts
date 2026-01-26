import { Component, Input } from '@angular/core';

import { DashboardItem } from '@api/services/common.service';

@Component({
  standalone: false,
  selector: 'app-application-details',
  templateUrl: './application-details.component.html',
  styleUrls: ['./application-details.component.scss']
})
export class ApplicationDetailsComponent {
  @Input() application!: DashboardItem;
}
