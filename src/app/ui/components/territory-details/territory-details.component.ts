import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-territory-details',
  templateUrl: './territory-details.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./territory-details.component.scss']
})
export class TerritoryDetailsComponent {
  @Input() territory!: any;
}
