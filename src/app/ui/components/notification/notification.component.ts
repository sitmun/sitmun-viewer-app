import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild} from '@angular/core';
import { takeWhile } from 'rxjs';
import { INotification } from 'src/app/notifications/models/INotification';
import { NotificationType } from 'src/app/notifications/models/NotificationType';
import { NotificationService } from 'src/app/notifications/services/NotificationService';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {

  @ViewChild('notificationContainer') container!: ElementRef<HTMLDivElement>;

  private _subscribed: boolean = true;
  private classMap: Map<NotificationType, string>;

  constructor(
    private service: NotificationService,
    private renderer: Renderer2
  ) {
    this.classMap = new Map<NotificationType, string>();
  }

  ngOnInit(): void {
    this.classMap.set(NotificationType.Success, 'success');
    this.classMap.set(NotificationType.Warning, 'warning');
    this.classMap.set(NotificationType.Error, 'error');

    this.service.notification
      .pipe(takeWhile(() => this._subscribed))
      .subscribe(notification => {
          if(notification)
            this.render(notification);
      });
  }

  ngOnDestroy() {
    this._subscribed = false;
  }

  private render(notification: INotification) {
    // Notification box
    let notificationBox = this.renderer.createElement('div');
    const boxColorClass = this.classMap.get(notification.type);

    let classesToAdd = ['message-box', boxColorClass];
    classesToAdd.forEach((className) => {
      if (className) {  // If the class is not undefined
        this.renderer.addClass(notificationBox, className);
      }
    });

    // Set style
    this.renderer.setStyle(notificationBox, 'transition', `opacity ${notification.duration}ms`);
    this.renderer.setStyle(notificationBox, 'opacity', '1');

    // Header
    let header = this.renderer.createElement('b');
    const headerText = this.renderer.createText(NotificationType[notification.type]);
    this.renderer.appendChild(header, headerText);

    // Content
    let content = this.renderer.createElement('div');
    const text = this.renderer.createText(notification.message);
    this.renderer.appendChild(content, text);

    // Append child
    this.renderer.appendChild(this.container.nativeElement, notificationBox);
    this.renderer.appendChild(notificationBox, header);
    this.renderer.appendChild(notificationBox, content);

    setTimeout(() => {
      this.renderer.setStyle(notificationBox, 'opacity', '0');
      setTimeout(() => {
          this.renderer.removeChild(this.container.nativeElement, notificationBox);
      }, notification.duration);
    }, notification.duration);
  }
}
