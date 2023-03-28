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
  email: string;
  password: string;
}

export interface AuthenticationResponse {
  token: string;
}
