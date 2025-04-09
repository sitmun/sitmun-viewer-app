import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  URL_API_APPLICATIONS,
  URL_API_MAP_CONFIG,
  URL_API_TERRITORIES
} from '@api/api-config';
import { environment } from 'src/environments/environment';
import { AppCfg } from '@api/model/app-cfg';
import { BehaviorSubject, Observable } from 'rxjs';

export enum DashboardTypes {
  APPLICATIONS = 'applications',
  TERRITORIES = 'territories'
}

export interface DashboardItem {
  img?: string;
  id: number;
  title: string;
  name?: string;
  type?: string;
  logo?: string;
  description? : string;
  isUnavailable: boolean;
  lastUpdate?: Date;
  maintenanceInformation?: string;
  appPrivate: boolean;
  updateDate: Date;
  createdDate: Date;
  creator: string;
}

export interface DashboardItemsResponse {
  content: Array<DashboardItem>;
  totalElements: number;
}

export interface ResponseDto {
  content: Array<ItemDto>;
  pageable: {
    sort: {
      unsorted: boolean;
      sorted: boolean;
      empty: boolean;
    };
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  number: number;
  sort: {
    unsorted: boolean;
    sorted: boolean;
    empty: boolean;
  };
  size: number;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface ItemDto {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  // Common service is used to share some data between components
  private messageSubject: BehaviorSubject<{ theme: string }>
    = new BehaviorSubject({ theme: "sitmun-base" });
  public message$: Observable<{ theme: string  }> =
    this.messageSubject.asObservable();

  constructor(private http: HttpClient) {}

  fetchDashboardItems(
    dashboardType: DashboardTypes,
    page?: number,
    size?: number,
    keywords?: string
  ) {
    let path;
    switch (dashboardType) {
      case DashboardTypes.APPLICATIONS:
        path = URL_API_APPLICATIONS;
        break;
      case DashboardTypes.TERRITORIES:
        path = URL_API_TERRITORIES;
        break;
    }
    if (page != undefined && page >= 0) {
      path += '?page=' + page;
    }
    if (size) {
      path += '&size=' + size;
    }
    if (keywords) {
      path += '?keywords=' + keywords;
    }

    return this.http.get<DashboardItemsResponse>(environment.apiUrl + path);
  }

  fetchTerritoriesByApplication(id: number, keywords?: string) {
    let path = `${URL_API_APPLICATIONS}/${id}/territories`;
    if (keywords) {
      path += '?keywords=' + keywords;
    }
    return this.http.get<ResponseDto>(environment.apiUrl + path);
  }

  fetchApplicationsByTerritory(id: number, keywords?: string) {
    let path = `${URL_API_TERRITORIES}/${id}/applications`;
    if (keywords) {
      path += '?keywords=' + keywords;
    }
    return this.http.get<ResponseDto>(environment.apiUrl + path);
  }

  fetchMapConfiguration(appId: number, territoryId: number) {
    return this.http.get<AppCfg>(
      environment.apiUrl + URL_API_MAP_CONFIG(appId, territoryId)
    );
  }

  // Components that need to share a newTheme with others will call
  // updateMessage
  updateMessage(newTheme: string) {
    this.messageSubject.next({ theme: newTheme});
  }
}
