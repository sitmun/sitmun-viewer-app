import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import {
  URL_API_APPLICATIONS,
  URL_API_MAP_CONFIG,
  URL_API_TERRITORIES
} from '@api/api-config';
import { AppCfg } from '@api/model/app-cfg';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { AppConfigService } from '../../services/app-config.service';

export enum DashboardTypes {
  APPLICATIONS = 'applications',
  TERRITORIES = 'territories'
}

export interface DashboardItem {
  img?: string;
  id: number;
  title?: string;
  name: string;
  type?: string;
  logo?: string;
  headerParams: any; // JSON OBJECT
  description?: string;
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

interface MapConfigCacheEntry {
  data: AppCfg;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  // Common service is used to share some data between components
  private messageSubject: BehaviorSubject<{ theme: string }> =
    new BehaviorSubject({ theme: 'sitmun-base' });
  public message$: Observable<{ theme: string }> =
    this.messageSubject.asObservable();

  private appConfigService = inject(AppConfigService);

  private mapConfigCache = new Map<string, MapConfigCacheEntry>();
  private readonly CONFIG_CACHE_TTL_MS = 60_000;

  constructor(private http: HttpClient) {}

  fetchDashboardItems(dashboardType: DashboardTypes, keywords?: string) {
    let path;
    switch (dashboardType) {
      case DashboardTypes.APPLICATIONS:
        path = URL_API_APPLICATIONS;
        break;
      case DashboardTypes.TERRITORIES:
        path = URL_API_TERRITORIES;
        break;
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

  fetchMapConfiguration(
    appId: number,
    territoryId: number
  ): Observable<AppCfg> {
    const testConfigFile = this.appConfigService.getTestConfigFile();
    if (testConfigFile) {
      return this.http.get<AppCfg>(`assets/config/${testConfigFile}`);
    }

    const key = `${appId}:${territoryId}`;
    const cached = this.mapConfigCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CONFIG_CACHE_TTL_MS) {
      return of(cached.data);
    }

    return this.http
      .get<AppCfg>(environment.apiUrl + URL_API_MAP_CONFIG(appId, territoryId))
      .pipe(
        tap((data) => {
          this.mapConfigCache.set(key, { data, timestamp: Date.now() });
        })
      );
  }

  // Components that need to share a newTheme with others will call
  // updateMessage
  updateMessage(newTheme: string) {
    this.messageSubject.next({ theme: newTheme });
  }
}
