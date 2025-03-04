import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { INotification } from '../models/INotification';
import { NotificationType } from '../models/NotificationType';
@Injectable({
    providedIn: 'root'
})
export class NotificationService {constructor() { }
    private notification$: Subject<INotification | null> = new BehaviorSubject<INotification | null>(null);
    private notification_duration_base : number = 2000;
    success(message: string, duration: number = this.notification_duration_base) {
      this.notify(message, NotificationType.Success, duration);
    }
    warning(message: string, duration: number = this.notification_duration_base) {
      this.notify(message, NotificationType.Warning, duration);
    }
    error(message: string, duration: number = this.notification_duration_base) {
      this.notify(message, NotificationType.Error, duration);
    }
    private notify(message: string, type: NotificationType, duration: number) {
      this.notification$.next({
          message: message,
          type: type,
          duration: duration
      } as INotification);
    }
    get notification() {
      return this.notification$.asObservable();
    }
}
