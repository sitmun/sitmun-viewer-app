import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-primary-button',
  templateUrl: './primary-button.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./primary-button.component.scss']
})
export class PrimaryButtonComponent {
  @Input() button_text = '';
  @Input() img_src = '';
  @Input() mat_icon = '';
}
