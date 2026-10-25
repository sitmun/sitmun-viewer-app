import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface AboutDialogData {
  applicationName: string;
  version: string;
  environmentName: string;
  angularVersion: string;
  buildTimestamp?: string;
  sitnaVersion: string;
  openLayersVersion: string;
}

@Component({
  standalone: false,
  selector: 'app-about-dialog',
  templateUrl: './about-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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
