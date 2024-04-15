import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  AUTH_CONFIG_DI,
  AUTH_DETAILS_SERVICE_DI,
  AuthConfig,
  AuthDetailsService,
  AuthenticationRequest,
  AuthenticationResponse
} from '@auth/authentication.options';
import jwtDecode, { JwtPayload } from 'jwt-decode';
import { URL_AUTH_LOGIN } from '@api/api-config';
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
    private http: HttpClient,
    private router: Router,
    @Inject(AUTH_CONFIG_DI) private config: AuthConfig<T>,
    @Inject(AUTH_DETAILS_SERVICE_DI)
    private detailsService: AuthDetailsService<T>
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

  logout(): void {
    this.clearStorage();
    this.router.navigateByUrl(this.config.routes.loginPath).then();
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
    localStorage.clear();
  };

  private getToken = (): string | null => {
    const token = localStorage.getItem(this.AUTH_TOKEN)
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: "AUTH_TOKEN", token: token });
    }
    return token;
  };

  private setToken = (token: string): void => {
    localStorage.setItem(this.AUTH_TOKEN, token);
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: "AUTH_TOKEN", token: token });
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
