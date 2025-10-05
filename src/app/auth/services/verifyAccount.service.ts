import { Injectable } from '@angular/core';
import {
  AuthenticationRequest,
} from '@auth/authentication.options';
import { environment } from '../../../environments/environment';
import { URL_AUTH_VERIFY_EMAIL } from '@api/api-config';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class VerifyAccountService<T> {

  constructor(
    private http: HttpClient
  ) {}

  emailVerification(emailRequest : string){
    return this.http.post<boolean>(environment.apiUrl + URL_AUTH_VERIFY_EMAIL, emailRequest);
  }
}
