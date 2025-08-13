import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  UserRequest
} from '@auth/authentication.options';
import { URL_RECOVER_PASSWORD } from '@api/api-config';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResetPasswordService<T> {
  constructor(
    private readonly http: HttpClient,
  ) {}

  resetPassword(userRequest: UserRequest) {
    return this.http
      .put<string>(
        environment.apiUrl + URL_RECOVER_PASSWORD,
        userRequest,
        { responseType: 'text' as 'json' }
      );
  }
}
