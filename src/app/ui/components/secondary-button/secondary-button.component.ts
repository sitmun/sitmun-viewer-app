import { Component, Input} from '@angular/core';

@Component({
  selector: 'secondary-button',
  templateUrl: './secondary-button.component.html',
  styleUrls: ['./secondary-button.component.scss'],
})
export class SecondaryButtonComponent {
  @Input() button_text: string = "";
  @Input() button_img_url: string = "";
}
