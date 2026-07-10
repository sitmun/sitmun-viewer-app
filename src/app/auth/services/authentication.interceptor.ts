import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';

import { URL_AUTH_LOGIN, URL_AUTH_LOGOUT, URL_AUTH_PROXY } from '@api/api-config';
import { isSitmunBackendApiUrl } from '@config/backend-api-url';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { SUPPRESS_AUTH_REDIRECT_ON_401 } from './auth-http-context';
import { AuthenticationService } from './authentication.service';

export { SUPPRESS_AUTH_REDIRECT_ON_401 } from './auth-http-context';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationInterceptor implements HttpInterceptor {
  constructor(
    private readonly authenticationService: AuthenticationService<unknown>
  ) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        if (
          err.status === 401 &&
          isSitmunBackendApiUrl(req.url) &&
          !req.context.get(SUPPRESS_AUTH_REDIRECT_ON_401)
        ) {
          if (req.url.includes(URL_AUTH_PROXY)) {
            // Handled by AuthenticationService.refreshProxyToken — do not intercept.
          } else if (req.url.includes(URL_AUTH_LOGOUT)) {
            void this.authenticationService.clearSessionAndRedirectToLogin();
          } else if (req.url.includes(URL_AUTH_LOGIN)) {
            // Failed login — handled by login page / modal; do not logout.
          } else {
            this.authenticationService.validateSessionAfterUnauthorized();
          }
        }

        return throwError(() => err);
      })
    );
  }
}

