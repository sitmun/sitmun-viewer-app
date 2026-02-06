// TODO with specific details

import { InjectionToken } from '@angular/core';

/**
 * Name of the cookie set by the backend (`OidcAuthenticationSuccessHandler`)
 * after a successful OIDC login. The cookie carries the JWT token.
 *
 * **Important:** This cookie is readable by JavaScript only when the backend
 * property `sitmun.authentication.oidc.http-only-cookie` is `false` (default).
 * If set to `true`, `CookieService.get()` returns an empty string and the
 * OIDC callback silently fails.
 *
 * **Future improvement:** Replace cookie-based token transfer with a URL fragment
 * (`#token=<jwt>`), allowing `httpOnly=true` for stronger XSS protection.
 * See backend README "Current limitation and future improvement" section.
 */
export const OIDC_TOKEN_COOKIE = 'oidc_token';

/** Query param name for OIDC client type; backend uses it to pick redirect URL. */
export const OIDC_CLIENT_TYPE_QUERY_PARAM = 'client_type';

/** Value for client_type when this app is the OIDC client. */
export const OIDC_CLIENT_TYPE_VIEWER = 'viewer';

/** postMessage type for auth token; ServiceWorker.js must use the same value. */
export const AUTH_TOKEN_MESSAGE_TYPE = 'AUTH_TOKEN';

/** Auth method id for OIDC in enabled-methods API response. */
export const AUTH_METHOD_OIDC = 'oidc';

export const AUTH_CONFIG_DI = new InjectionToken<AuthConfig<unknown>>(
  'auth.config'
);

export interface AuthConfig<T> {
  localStoragePrefix: string;
  endpoints: {
    login: string;
  };
  routes: {
    loginPath: string;
    loginQueryParam: string;
    isPublicPath: (path: string) => boolean;
    defaultPath: (authDetails: T) => string;
  };
}

export interface AuthenticationRequest {
  username: string;
  password: string;
}

export interface RecoveryRequest {
  /**
   * Login (mail or username) of the account to recover the password
   */
  login: string;
}

export interface AuthenticationResponse {
  id_token: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
  email: string;
  codeOTP: string;
}

export interface RequestNewPassword {
  /**
   * mail of the user to reset password
   */
  email: string;
}

export interface AuthProvider {
  providerName: string;
  displayName: string;
  imagePath: string;
}
