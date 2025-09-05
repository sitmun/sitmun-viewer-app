import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'form-field-input',
  templateUrl: './form-field-input.component.html',
  styleUrls: ['./form-field-input.component.scss']
})
export class FormFieldInputComponent {
  @Input() input_placeholder: string = '';
  @Input() input_name: string = '';
  @Input() input_type: string = 'text';
  @Input() input_title: string = '';
  @Input() input_image: string = '';
  @Input() input_length: number = 50;

  @Input() input_model: string = '';
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
