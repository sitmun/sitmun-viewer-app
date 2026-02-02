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
  AuthenticationResponse
} from '@auth/authentication.options';
import { NavigationPath, QueryParam } from '@config/app.config';
import jwtDecode, { JwtPayload } from 'jwt-decode';
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

  logout(): void {
    this.clearStorage();
    this.router.navigateByUrl(this.config.routes.loginPath).then();
  }

  getAuthMethods() {
    return this.http.get(environment.apiUrl + URL_AUTH_METHODS);
  }

  initOidcAuth(providerId: string) {
    globalThis.location.href = `${environment.apiUrl}${URL_OIDC_AUTH}/${providerId}`;
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
        type: 'AUTH_TOKEN',
        token: token
      });
    }
    return token;
  };

  private setToken = (token: string): void => {
    localStorage.setItem(this.AUTH_TOKEN, token);
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'AUTH_TOKEN',
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
