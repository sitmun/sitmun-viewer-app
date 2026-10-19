import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthenticationService } from '@auth/services/authentication.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { NotificationService } from '../../notifications/services/NotificationService';

@Component({
  selector: 'app-callback',
  imports: [TranslateModule],
  templateUrl: './callback.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './callback.component.scss'
})
export class CallbackComponent implements OnInit {
  messageKey = 'callback.processing';

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly translateService: TranslateService,
    private readonly notificationService: NotificationService,
    private readonly authenticationService: AuthenticationService<any>
  ) {}

  ngOnInit(): void {
    this.authenticationService.authorizeOidcUser().subscribe({
      next: () => {
        this.messageKey = 'callback.redirect';
        this.authenticationService.loginRedirect(this.route);
      },
      error: () => {
        this.router.navigateByUrl('/').then(() => {
          this.notificationService.error(
            this.translateService.instant('loginPage.incorrectLogin')
          );
        });
      }
    });
  }
}
