import { Component , EventEmitter, Input, Output } from '@angular/core';
import { CommonService, DashboardItem } from '@api/services/common.service';


@Component({
  selector: 'app-dashboard-item',
  templateUrl: './dashboard-item.component.html',
  styleUrls: ['./dashboard-item.component.scss']
})
export class DashboardItemComponent {
  @Input() item!: DashboardItem;
  @Input() itemWidth!: string;
  readonly DESCRIPTION_MAX_CHARACTER = 100;
  nbTerritory : number = 0;
  listOfTerritories : any;
  @Output() tag = new EventEmitter<any>();

  constructor(private commonService : CommonService) {}

  ngOnInit() {
    this.fillTerritory(this.item.id);
  }

  fillTerritory(appId : number) {
    this.commonService.fetchTerritoriesByApplication(appId).subscribe({
      next: (res) => {
        this.listOfTerritories = res;
        this.nbTerritory = res.numberOfElements;
      }
    });
  }

  displayTerritoriesTag(application : any) {
    let object = {
      'application': application,
      'territories': this.listOfTerritories
    }
    this.tag.emit(object);
  }
}
