import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {
  URL_API_USER_ACCOUNT,
  URL_API_USER_ACCOUNT_PUBLIC
} from '@api/api-config';
import { UserDto } from '@api/model/user';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  constructor(private http: HttpClient) {}

  getUserByID = (id: string): Observable<UserDto> => {
    return this.http.get<UserDto>(
      environment.apiUrl + URL_API_USER_ACCOUNT + `?id=${id}`
    );
  };

  getUserByIDPublic = (id: string): Observable<UserDto> => {
    return this.http.get<UserDto>(
      environment.apiUrl + URL_API_USER_ACCOUNT_PUBLIC + `/${id}`
    );
  };
}
