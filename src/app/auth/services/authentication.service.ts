import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  URL_AUTH_LOGIN,
  URL_AUTH_METHODS,
  URL_OIDC_AUTH
} from '@api/api-config';
import {
  AUTH_CONFIG_DI,
  AuthConfig,
  AuthenticationRequest,
  AuthenticationResponse,
  AUTH_TOKEN_MESSAGE_TYPE,
  OIDC_CLIENT_TYPE_QUERY_PARAM,
  OIDC_CLIENT_TYPE_VIEWER,
  OIDC_TOKEN_COOKIE
} from '@auth/authentication.options';
import { NavigationPath, QueryParam } from '@config/app.config';
import jwtDecode, { JwtPayload } from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';
import { tap } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService<T> {
  // localStorage keys
  readonly AUTH_TOKEN: string;
  readonly AUTH_DETAILS: string;
  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly cookieService: CookieService,
    @Inject(AUTH_CONFIG_DI) private readonly config: AuthConfig<T>
  ) {
    // TODO
    this.AUTH_TOKEN = this.config.localStoragePrefix + '_auth_token';
    this.AUTH_DETAILS = this.config.localStoragePrefix + '_auth_details';
  }

  login(authenticationRequest: AuthenticationRequest) {
    return this.http
      .post<AuthenticationResponse>(
        environment.apiUrl + URL_AUTH_LOGIN,
        authenticationRequest
      )
      .pipe(
        tap((res: AuthenticationResponse) => {
          if (res.id_token != null) {
            this.setToken(res.id_token);
          }
        })
      );
  }

  loginRedirect(route: ActivatedRoute) {
    // Check for redirect query parameter
    const redirectUrl =
      route.snapshot.queryParams[QueryParam.Login.RedirectAfterLogin];
    const AUTH_CONFIG = this.getAuthConfig();

    if (redirectUrl) {
      // Redirect to the originally requested URL
      void this.router.navigateByUrl(redirectUrl);
    } else {
      // Use default path - get auth details for defaultPath function
      try {
        const authDetails = this.getLoggedDetails();
        void this.router.navigateByUrl(
          AUTH_CONFIG.routes.defaultPath(authDetails)
        );
      } catch {
        // Fallback to dashboard if details not available yet
        void this.router.navigateByUrl(NavigationPath.Section.User.Dashboard);
      }
    }
  }

  /**
   * Clears localStorage tokens and deletes the `OIDC_TOKEN_COOKIE` cookie.
   *
   * The cookie deletion is only effective when `http-only-cookie` is `false`
   * (default). When `true`, the cookie cannot be deleted by JavaScript; the
   * backend or cookie expiry must handle cleanup instead.
   *
   * **Future improvement:** When token transfer moves to URL fragments,
   * this cookie deletion becomes unnecessary and can be removed.
   */
  logout(): void {
    this.clearStorage();
    this.cookieService.delete(OIDC_TOKEN_COOKIE);
    this.router.navigateByUrl(this.config.routes.loginPath).then();
  }

  getAuthMethods() {
    return this.http.get(environment.apiUrl + URL_AUTH_METHODS);
  }

  initOidcAuth(providerId: string) {
    globalThis.location.href = `${environment.apiUrl}${URL_OIDC_AUTH}/${providerId}?${OIDC_CLIENT_TYPE_QUERY_PARAM}=${OIDC_CLIENT_TYPE_VIEWER}`;
  }

  authorizeOidcUser(token: string) {
    this.setToken(token);
  }

  // Helpers ------------------------------------------------------------------

  getAuthConfig(): AuthConfig<T> {
    return this.config;
  }

  isLoggedIn(): boolean {
    return this.getToken() != null;
  }

  getLoggedToken() {
    const token = this.getToken();
    if (token == null) {
      throw Error('Not authentication token!');
    }
    return token;
  }

  getLoggedUsername(): string {
    const decodedToken = jwtDecode<JwtPayload>(this.getLoggedToken());
    if (!decodedToken.sub) {
      throw Error('Not authentication token!');
    }
    return decodedToken.sub;
  }

  getLoggedDetails(): T {
    const details = this.getDetails();
    if (details == null) {
      throw Error('Not authentication details!');
    }
    return details;
  }

  // localStorage utils --------------------------------------------------------
  // TODO

  private clearStorage = (): void => {
    localStorage.removeItem(this.AUTH_TOKEN);
    localStorage.removeItem(this.AUTH_DETAILS);
  };

  private getToken = (): string | null => {
    const token = localStorage.getItem(this.AUTH_TOKEN);
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: AUTH_TOKEN_MESSAGE_TYPE,
        token: token
      });
    }
    return token;
  };

  private setToken = (token: string): void => {
    localStorage.setItem(this.AUTH_TOKEN, token);
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: AUTH_TOKEN_MESSAGE_TYPE,
        token: token
      });
    }
  };

  private getDetails = (): T | null => {
    const serialized = localStorage.getItem(this.AUTH_DETAILS);
    return serialized ? JSON.parse(serialized) : null;
  };

  private setDetails = (details: T): void => {
    localStorage.setItem(this.AUTH_DETAILS, JSON.stringify(details));
  };
}
