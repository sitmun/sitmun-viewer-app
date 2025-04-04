import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormFieldInputComponent } from './form-field-input.component';

describe('FormFieldInputComponent', () => {
  let component: FormFieldInputComponent;
  let fixture: ComponentFixture<FormFieldInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormFieldInputComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FormFieldInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
