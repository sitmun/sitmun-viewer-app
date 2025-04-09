// TODO with specific details

import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core';

export const AUTH_CONFIG_DI = new InjectionToken<AuthConfig<unknown>>(
  'auth.config'
);
export const AUTH_DETAILS_SERVICE_DI = new InjectionToken<
  AuthDetailsService<unknown>
>('auth.detailsService');
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

export interface AuthDetailsService<T> {
  getAuthDetails: () => Observable<T>;
}

export interface AuthenticationRequest {
  username: string;
  password: string;
}

export interface RecoveryRequest {
  /**
   * Login (mail or username) of the account to recover the password
   */
  login : string;
}

export interface AuthenticationResponse {
  id_token: string;
}

export interface UserRequest {
  /**
   * New password of the account
   */
  password: string | null;
  /**
   * Token for password recovery
   */
  token: string | null;
}
