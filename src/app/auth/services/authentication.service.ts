import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';


import {
  URL_API_USER_ACCOUNT,
  URL_AUTH_LOGIN,
  URL_AUTH_LOGOUT,
  URL_AUTH_METHODS,
  URL_AUTH_PROXY,
  URL_OIDC_AUTH
} from '@api/api-config';
import { UserDto } from '@api/model/user';
import {
  AUTH_CONFIG_DI,
  AuthConfig,
  AuthenticationRequest
} from '@auth/authentication.options';
import { NavigationPath, QueryParam } from '@config/app.config';
import { TranslateService } from '@ngx-translate/core';
import {
  Observable,
  Subscription,
  catchError,
  finalize,
  from,
  map,
  of,
  switchMap,
  tap,
  throwError,
  timer
} from 'rxjs';

import { suppressAuthRedirectContext } from './auth-http-context';
import { IndexedDbService } from './indexed-db.service';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../notifications/services/NotificationService';

const PROXY_ERROR_THRESHOLD = 3;

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService<T> {
  // sessionStorage keys
  private readonly USERNAME_KEY: string;

  private proxyRefreshSubscription: Subscription | null = null;
  private isRefreshingProxyToken = signal(false);
  private indexedDbInitialized = false;
  private proxyForbiddenNotified = false;
  private consecutiveProxyErrors = 0;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly indexedDb: IndexedDbService,
    private readonly notificationService: NotificationService,
    private readonly translate: TranslateService,
    @Inject(AUTH_CONFIG_DI) private readonly config: AuthConfig<T>
  ) {
    this.USERNAME_KEY = this.config.localStoragePrefix + '_username';
    this.setupServiceWorkerListener();
  }

  private setupServiceWorkerListener(): void {
    if ('serviceWorker' in navigator && navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'AUTH_ERROR') {
          console.debug(
            '[AuthService] Received AUTH_ERROR from SW. Refreshing token...'
          );
          this.refreshProxyToken().subscribe();
        }
      });
    }
  }

  async initializeIndexedDb(): Promise<void> {
    if (this.indexedDbInitialized) {
      return;
    }

    try {
      await this.indexedDb.init();
      this.indexedDbInitialized = true;
    } catch (err) {
      console.warn('[IDB] Failed to init IndexedDB:', err);
    }
  }

  login(authenticationRequest: AuthenticationRequest) {
    return this.http
      .post<void>(environment.apiUrl + URL_AUTH_LOGIN, authenticationRequest)
      .pipe(
        switchMap(() =>
          this.http.get<UserDto>(environment.apiUrl + URL_API_USER_ACCOUNT)
        ),
        tap((user: UserDto) => {
          sessionStorage.setItem(this.USERNAME_KEY, user.username);
          this.startProxyTokenRefresh();
        })
      );
  }

  loginRedirect(route: ActivatedRoute) {
    // Check for redirect query parameter
    const redirectUrl =
      route.snapshot.queryParams[QueryParam.Login.RedirectAfterLogin];

    if (redirectUrl) {
      // Redirect to the originally requested URL
      void this.router.navigateByUrl(redirectUrl);
    } else {
      void this.router.navigateByUrl(NavigationPath.Section.User.Dashboard);
    }
  }

  clearAuthentication(): Observable<void> {
    return this.http
      .post<void>(environment.apiUrl + URL_AUTH_LOGOUT, null, {
        context: suppressAuthRedirectContext()
      })
      .pipe(
        switchMap(() => from(this.clearSession())),
        catchError((error: unknown) =>
          from(this.clearSession()).pipe(
            switchMap(() => throwError(() => error))
          )
        )
      );
  }

  logout(): void {
    this.clearAuthentication().subscribe({
      next: () => {
        void this.router.navigateByUrl(this.config.routes.loginPath);
      },
      error: (err: unknown) => {
        console.error('[Auth] Logout failed:', err);
        this.translate.get('auth.logoutFailed').subscribe((msg) => {
          this.notificationService.error(msg);
        });
      }
    });
  }

  getAuthMethods() {
    return this.http.get(environment.apiUrl + URL_AUTH_METHODS);
  }

  initOidcAuth(providerId: string) {
    globalThis.location.href = `${environment.apiUrl}${URL_OIDC_AUTH}/${providerId}?client_type=viewer`;
  }

  authorizeOidcUser(): Observable<void> {
    return this.http
      .get<UserDto>(environment.apiUrl + URL_API_USER_ACCOUNT)
      .pipe(
        tap((user: UserDto) => {
          sessionStorage.setItem(this.USERNAME_KEY, user.username);
          this.startProxyTokenRefresh();
        }),
        map(() => undefined)
      );
  }

  // Helpers ------------------------------------------------------------------

  getAuthConfig(): AuthConfig<T> {
    return this.config;
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem(this.USERNAME_KEY);
  }

  getLoggedUsername(): string {
    return sessionStorage.getItem(this.USERNAME_KEY) ?? '';
  }

  // Proxy token refresh -------------------------------------------------------

  private startProxyTokenRefresh(): void {
    if (this.proxyRefreshSubscription) {
      this.proxyRefreshSubscription.unsubscribe();
    }

    this.proxyForbiddenNotified = false;
    this.consecutiveProxyErrors = 0;

    this.proxyRefreshSubscription = timer(
      0,
      environment.proxyTokenRefreshIntervalMs
    )
      .pipe(switchMap(() => this.refreshProxyToken()))
      .subscribe();
  }

  private refreshProxyToken(): Observable<void> {
    if (this.isRefreshingProxyToken()) {
      return of(undefined);
    }

    this.isRefreshingProxyToken.set(true);
    return this.http
      .post<{ proxy_token?: string }>(environment.apiUrl + URL_AUTH_PROXY, null)
      .pipe(
        switchMap((response) => {
          this.consecutiveProxyErrors = 0;
          return from(this.persistProxyToken(response.proxy_token));
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.status === 401) {
            this.stopProxyTokenRefresh();
            this.clearSession().catch((e: unknown) => console.warn('[IDB] Error during session clear on 401:', e));
            void this.router.navigate([this.config.routes.loginPath], {
              queryParams: { 'session-expired': 'true' }
            });
          } else if (err.status === 403) {
            console.error('[Auth] Proxy token refresh forbidden — check server authorization config');
            if (!this.proxyForbiddenNotified) {
              this.proxyForbiddenNotified = true;
              this.translate.get('auth.proxyForbidden').subscribe((msg) => {
                this.notificationService.warning(msg, 8000);
              });
            }
          } else {
            console.warn('[Auth] Error refreshing proxy token:', err);
            this.consecutiveProxyErrors++;
            if (this.consecutiveProxyErrors === PROXY_ERROR_THRESHOLD) {
              this.translate.get('auth.proxyUnavailable').subscribe((msg) => {
                this.notificationService.warning(msg, 8000);
              });
            }
          }
          return of(undefined);
        }),
        finalize(() => this.isRefreshingProxyToken.set(false))
      );
  }

  /** Persists the proxy token returned by the auth endpoint. No-op if absent. */
  private persistProxyToken(token: string | undefined): Promise<void> {
    return token
      ? this.indexedDb.set('proxy_token', token)
      : Promise.resolve();
  }

  private stopProxyTokenRefresh(): void {
    if (this.proxyRefreshSubscription) {
      this.proxyRefreshSubscription.unsubscribe();
      this.proxyRefreshSubscription = null;
    }
  }

  // Session utils ------------------------------------------------------------

  clearSessionAndRedirectToLogin(): void {
    this.clearSession();
    // Remove any floating MIA popups that live on document.body
    document.querySelectorAll('.sitmun-mia-popup-overlay').forEach((el) => el.remove());
    void this.router.navigateByUrl(this.config.routes.loginPath);
  }

  private clearSession(): Promise<void> {
    sessionStorage.removeItem(this.USERNAME_KEY);
    this.stopProxyTokenRefresh();
    return this.indexedDb
      .remove('proxy_token')
      .catch((err: unknown) => console.warn('[IDB] Error clearing proxy token:', err));
  }
}
