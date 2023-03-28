import { Injectable } from '@angular/core';
import { AuthDetailsService } from '@auth/authentication.options';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { URL_API_USER_DETAILS } from '@api/api-config';
import { Roles } from '@config/roles-matrix';

@Injectable({
  providedIn: 'root'
})
export class UserService implements AuthDetailsService<CustomDetails> {
  constructor(private http: HttpClient) {}
  getAuthDetails = (): Observable<CustomDetails> => {
    return this.http.get<CustomDetails>(URL_API_USER_DETAILS);
  };
}
export interface CustomDetails {
  id: number;
  username: string;
  authorities: Roles[];
  enabled: boolean;
}
