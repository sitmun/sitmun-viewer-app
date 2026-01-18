import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-form-field-input',
  templateUrl: './form-field-input.component.html',
  styleUrls: ['./form-field-input.component.scss']
})
export class FormFieldInputComponent {
  @Input() input_placeholder = '';
  @Input() input_name = '';
  @Input() input_type = 'text';
  @Input() input_title = '';
  @Input() input_image = '';
  @Input() input_length = 50;

  @Input() input_model = '';
  @Output() output_model = new EventEmitter<string>();
  @Output() input_button_click = new EventEmitter<void>();

  onInputChange(event: Event): void {
    let value = (event.target as HTMLInputElement).value ?? '';

    if (value.length > this.input_length) {
      value = value.substring(0, this.input_length);
      (event.target as HTMLInputElement).value = value;
    }

    this.input_model = value;
    this.output_model.emit(this.input_model);
  }

  onButtonClicked(): void {
    this.input_button_click.emit();
  }
}
