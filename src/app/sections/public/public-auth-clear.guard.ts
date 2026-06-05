import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

import { AuthenticationService } from '@auth/services/authentication.service';
import { Observable, catchError, map, of } from 'rxjs';

import { NotificationService } from '../../notifications/services/NotificationService';

/**
 * Clears the backend HttpOnly `access_token` and local viewer state before any
 * `/public/**` route activates. This prevents stale cookies from a previous
 * authenticated session from being sent to public config/profile requests.
 *
 * If cleanup fails, the public route is blocked and the user sees an error.
 */
export const publicAuthClearGuard: CanActivateFn = (): Observable<boolean> => {
  const authService = inject(AuthenticationService);
  const notificationService = inject(NotificationService);

  return authService.clearAuthentication().pipe(
    map(() => true),
    catchError((error: unknown) => {
      console.error('[publicAuthClearGuard] Could not clear authentication before public access:', error);
      notificationService.error('auth.publicAccessFailed');
      return of(false);
    })
  );
};
