import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';

import { URL_AUTH_LOGOUT, URL_AUTH_PROXY } from '@api/api-config';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthenticationService } from './authentication.service';

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
        if (err.status === 401) {
          if (req.url.includes(URL_AUTH_PROXY)) {
            // Handled by AuthenticationService.refreshProxyToken — do not intercept.
          } else if (req.url.includes(URL_AUTH_LOGOUT)) {
            this.authenticationService.clearSessionAndRedirectToLogin();
          } else {
            this.authenticationService.logout();
          }
        }

        // Let the app keep running by returning an empty result
        return throwError(() => err);
      })
    );
  }
}
