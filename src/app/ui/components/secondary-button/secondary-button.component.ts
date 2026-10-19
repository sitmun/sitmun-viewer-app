import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-secondary-button',
  templateUrl: './secondary-button.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./secondary-button.component.scss']
})
export class SecondaryButtonComponent {
  @Input() button_text = '';
  @Input() button_img_url = '';
}
