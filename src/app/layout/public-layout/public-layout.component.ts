import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-public-layout',
  templateUrl: './public-layout.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./public-layout.component.scss']
})
export class PublicLayoutComponent {}
