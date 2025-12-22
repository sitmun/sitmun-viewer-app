import { Component, Input} from '@angular/core';

@Component({
  selector: 'primary-button',
  templateUrl: './primary-button.component.html',
  styleUrls: ['./primary-button.component.scss'],
})
export class PrimaryButtonComponent {
  @Input() button_text: string = "";
  @Input() img_src: string = "";
  @Input() mat_icon: string = "";
}
