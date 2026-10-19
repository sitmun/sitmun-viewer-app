import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-authorized-layout',
  templateUrl: './authorized-layout.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./authorized-layout.component.scss']
})
export class AuthorizedLayoutComponent {}
