import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {
  URL_API_TERRITORIES,
  URL_API_TERRITORIES_POSITIONS,
  URL_API_USER_ACCOUNT
} from '@api/api-config';
import { PositionDTO } from '@api/model/position';
import { TerritoryDTO } from '@api/model/territories';
import { UserDto } from '@api/model/user';
import { Roles } from '@config/roles-matrix';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUserDetails = (): Observable<UserDto> => {
    return this.http.get<UserDto>(environment.apiUrl + URL_API_USER_ACCOUNT);
  };

  getUserTerritories = (): Observable<TerritoryDTO> => {
    return this.http.get<TerritoryDTO>(
      environment.apiUrl + URL_API_TERRITORIES
    );
  };

  updateUserAccount(userDTO: UserDto): Observable<UserDto> {
    return this.http.post<UserDto>(
      environment.apiUrl + URL_API_USER_ACCOUNT,
      userDTO
    );
  }

  updateTerritoryPositions(PositionDTO: PositionDTO) {
    return this.http.post<PositionDTO>(
      environment.apiUrl + URL_API_TERRITORIES_POSITIONS,
      PositionDTO
    );
  }
}
export interface CustomDetails {
  id: number;
  username: string;
  authorities: Roles[];
  enabled: boolean;
}
