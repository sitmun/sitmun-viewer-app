import { CommonService, DashboardItem, DashboardTypes } from '@api/services/common.service';
import { Component, Input} from '@angular/core';

@Component({
  selector: 'app-application-details',
  templateUrl: './application-details.component.html',
  styleUrls: ['./application-details.component.scss']
})
export class ApplicationDetailsComponent {
  @Input() application! : DashboardItem;
}
