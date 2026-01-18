import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface AboutDialogData {
  applicationName: string;
  version: string;
  environmentName: string;
  angularVersion: string;
  buildTimestamp?: string;
  sitnaVersion?: string;
}

/**
 * Component for displaying application information dialog.
 * TODO: Add unit tests (about-dialog.component.spec.ts)
 */
@Component({
  selector: 'app-about-dialog',
  templateUrl: './about-dialog.component.html',
  styleUrls: ['./about-dialog.component.scss']
})
export class AboutDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AboutDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AboutDialogData
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
