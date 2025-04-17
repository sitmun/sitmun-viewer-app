import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-territory-details',
  templateUrl: './territory-details.component.html',
  styleUrls: ['./territory-details.component.scss']
})
export class TerritoryDetailsComponent {
  @Input() territory! : any;
}
