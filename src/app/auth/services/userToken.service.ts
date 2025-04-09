import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  RecoveryRequest
} from '@auth/authentication.options';
import { URL_USERTOKEN_VALID } from '@api/api-config';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserTokenService<T> {
  constructor(
    private readonly http: HttpClient,
  ) {}

  isUserTokenValid(token : string){
    return this.http
    .get<boolean>(
      environment.apiUrl + URL_USERTOKEN_VALID,
      {
        params: { token }
      }
    );
  }
}
