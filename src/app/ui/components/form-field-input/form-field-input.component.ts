import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'form-field-input',
  templateUrl: './form-field-input.component.html',
  styleUrls: ['./form-field-input.component.scss']
})
export class FormFieldInputComponent {
  @Input() input_placeholder: string = '';
  @Input() input_model: string = '';
  @Input() input_name: string = '';
  @Input() input_type: string = '';
  @Input() input_title: string = '';
  @Input() input_image: string = '';
  @Output() input_button_click = new EventEmitter();

  @Output() output_model = new EventEmitter<string>();

  ngOnChanges(): void {
    this.output_model.emit(this.input_model);
  }

  onInputChange(): void {
    this.output_model.emit(this.input_model);
  }

  onButtonClicked(): void {
    this.input_button_click.emit()
  }
}
