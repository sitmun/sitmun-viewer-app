import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {
  URL_RESET_PASSWORD_REQUEST,
  URL_RESET_PASSWORD_CONFIRM,
  URL_RESET_PASSWORD_RESEND
} from '@api/api-config';
import {
  RequestNewPassword,
  ResetPasswordRequest
} from '@auth/authentication.options';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResetPasswordService {
  constructor(private readonly http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const deviceId = localStorage.getItem('deviceId');
    return new HttpHeaders({
      'X-Device-ID': deviceId || ''
    });
  }

  requestNewPassword(userRequest: RequestNewPassword) {
    return this.http.post<string>(
      environment.apiUrl + URL_RESET_PASSWORD_REQUEST,
      userRequest,
      {
        headers: this.getHeaders(),
        responseType: 'text' as 'json'
      }
    );
  }

  confirmNewPassword(userRequest: ResetPasswordRequest) {
    return this.http.post<string>(
      environment.apiUrl + URL_RESET_PASSWORD_CONFIRM,
      userRequest,
      {
        headers: this.getHeaders(),
        responseType: 'text' as 'json'
      }
    );
  }

  resendNewRequest(userRequest: RequestNewPassword) {
    return this.http.post<string>(
      environment.apiUrl + URL_RESET_PASSWORD_RESEND,
      userRequest,
      {
        headers: this.getHeaders(),
        responseType: 'text' as 'json'
      }
    );
  }
}
