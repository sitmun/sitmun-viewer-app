import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { AuthenticationService } from './authentication.service';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationInterceptor implements HttpInterceptor {
  constructor(
    private authenticationService: AuthenticationService<unknown>,
    private router: Router
  ) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (this.authenticationService.isLoggedIn()) {
      // console.log(new Date().getTime() / 1000);
      const decoded: any = jwt_decode(
        this.authenticationService.getLoggedToken()
      );
      req = req.clone({
        headers: req.headers.set(
          'Authorization',
          `Bearer ${this.authenticationService.getLoggedToken()}`
        )
      });
      if (new Date().getTime() / 1000 > decoded.exp) {
        this.authenticationService.logout();
      }
    }
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        // Handle 401 Unauthorized
        if (err.status === 401) {
          if (this.authenticationService.isLoggedIn()) {
            // const currentPath = this.router.url;
            // TODO mensaxe en paxina de login? Caducou a sua sesión volva a logearse?
            // TODO redirect á url previa?
            const decoded: any = jwt_decode(
              this.authenticationService.getLoggedToken()
            );
            if (new Date().getTime() / 1000 > decoded.exp) {
              this.authenticationService.logout();
            } else {
              this.router.navigateByUrl('/').then();
            }
          } else {
            this.router
              .navigateByUrl(
                this.authenticationService.getAuthConfig().routes.loginPath
              )
              .then();
          }
        }

        // Let the app keep running by returning an empty result
        return throwError(err);
      })
    );
  }
}
