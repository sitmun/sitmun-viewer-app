import { Component, Inject, Injectable } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

@Injectable()
export class MessageBoxService {
  constructor(public dialog: MatDialog) {}

  confirm(title: string, message: string): Observable<boolean> {
    return this.dialog
      .open(MessageBoxDialogComponent, {
        data: {
          title: title,
          message: message,
          type: MessageBoxType.CONFIRM
        }
      })
      .afterClosed();
  }

  alert(title: string, message: string): Observable<boolean> {
    return this.dialog
      .open(MessageBoxDialogComponent, {
        data: {
          title: title,
          message: message,
          type: MessageBoxType.ALERT
        }
      })
      .afterClosed();
  }
}

export enum MessageBoxType {
  CONFIRM,
  ALERT
}

@Component({
  templateUrl: './message-box-dialog-component.html'
})
export class MessageBoxDialogComponent {
  title: string;
  message: string;
  type: MessageBoxType;

  types = MessageBoxType;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.title = this.data.title;
    this.message = this.data.message;
    this.type = this.data.type;
  }
}
