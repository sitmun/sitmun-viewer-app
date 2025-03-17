import { PositionDTO } from '@api/model/position';
import { Injectable } from '@angular/core';
import { AuthDetailsService } from '@auth/authentication.options';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { URL_API_TERRITORIES, URL_API_TERRITORIES_POSITIONS, URL_API_USER_DETAILS } from '@api/api-config';
import { Roles } from '@config/roles-matrix';
import { UserDto } from '@api/model/user';
import { environment } from '../../../environments/environment';
import { TerritoryDTO } from '@api/model/territories';

@Injectable({
  providedIn: 'root'
})
export class UserService implements AuthDetailsService<CustomDetails> {
  constructor(private http: HttpClient) {}

  getAuthDetails = (): Observable<CustomDetails> => {
    return this.http.get<CustomDetails>(URL_API_USER_DETAILS);
  };

  getUserDetails = (): Observable<UserDto> => {
    return this.http.get<UserDto>(environment.apiUrl + URL_API_USER_DETAILS);
  }

  getUserTerritories = () : Observable<TerritoryDTO> => {
    return this.http.get<TerritoryDTO>(environment.apiUrl + URL_API_TERRITORIES);
  }

  updateUserAccount(userDTO: UserDto) : Observable<UserDto> {
    return this.http.put<UserDto>(environment.apiUrl + URL_API_USER_DETAILS,userDTO);
  }

  updateTerritoryPositions(PositionDTO : PositionDTO){
    return this.http.put<PositionDTO>(environment.apiUrl + URL_API_TERRITORIES_POSITIONS, PositionDTO);
  }
}
export interface CustomDetails {
  id: number;
  username: string;
  authorities: Roles[];
  enabled: boolean;
}
