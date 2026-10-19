import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ErrorModalData {
  message: string;
}

@Component({
  standalone: false,
  selector: 'app-error-modal',
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './error-modal.component.html'
})
export class ErrorModalComponent {
  message: string;

  constructor(
    public dialogRef: MatDialogRef<ErrorModalComponent>,
    @Inject(MAT_DIALOG_DATA) data: ErrorModalData
  ) {
    this.message = data.message;
  }

  close(): void {
    this.dialogRef.close();
  }
}
