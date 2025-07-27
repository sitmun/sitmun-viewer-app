import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  RecoveryRequest
} from '@auth/authentication.options';
import { URL_RECOVER_PASSWORD } from '@api/api-config';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecoverPasswordService<T> {
  constructor(
    private readonly http: HttpClient,
  ) {}

  sendEmail(recoveryRequest: RecoveryRequest) {
    return this.http
      .post<string>(
        environment.apiUrl + URL_RECOVER_PASSWORD,
        recoveryRequest,
        { responseType: 'text' as 'json' }
      );
  }
}
