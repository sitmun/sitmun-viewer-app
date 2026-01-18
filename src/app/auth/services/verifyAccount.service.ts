import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { URL_AUTH_VERIFY_EMAIL } from '@api/api-config';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VerifyAccountService {
  constructor(private http: HttpClient) {}

  emailVerification(emailRequest: string) {
    return this.http.post<boolean>(
      environment.apiUrl + URL_AUTH_VERIFY_EMAIL,
      emailRequest
    );
  }
}
