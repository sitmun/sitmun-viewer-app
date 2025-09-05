// TODO with specific details

import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core';

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
