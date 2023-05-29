import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  URL_API_APPLICATIONS,
  URL_API_MAP_CONFIG,
  URL_API_TERRITORIES
} from '@api/api-config';
import { environment } from 'src/environments/environment';
import { of } from 'rxjs';
import { AppCfg } from '@api/model/app-cfg';

export enum DashboardTypes {
  APPLICATIONS = 'applications',
  TERRITORIES = 'territories'
}

export interface DashboardItem {
  img?: string;
  id: number;
  title: string;
  type?: string;
}

export interface DashboardItemsResponse {
  content: Array<DashboardItem>;
}

export interface ApplicationDto {
  id: number;
  name: string;
}

export interface TerritoryDto {
  id: number;
  name: string;
}

const territories: TerritoryDto[] = [
  {
    id: 1,
    name: 'Territory 1'
  },
  {
    id: 2,
    name: 'Territory 2'
  },
  {
    id: 3,
    name: 'Territory 3'
  }
];

const applications: ApplicationDto[] = [
  {
    id: 1,
    name: 'App 1'
  },
  {
    id: 2,
    name: 'App 2'
  },
  {
    id: 3,
    name: 'App 3'
  }
];

@Injectable({
  providedIn: 'root'
})
export class CommonService {
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
    // let path = `${URL_API_APPLICATIONS}/${id}/territories`;
    // if (keywords) {
    //   path += '?keywords=' + keywords;
    // }
    // return this.http.get<Array<TerritoryDto>>(environment.apiUrl + path);
    return of(territories);
  }

  fetchApplicationsByTerritory(id: number, keywords?: string) {
    // let path = `${URL_API_TERRITORIES}/${id}/applications`;
    // if (keywords) {
    //   path += '?keywords=' + keywords;
    // }
    // return this.http.get<Array<ApplicationDto>>(environment.apiUrl + path);
    return of(applications);
  }

  fetchMapConfiguration(appId: number, territoryId: number) {
    return this.http.get<AppCfg>(
      environment.apiUrl + URL_API_MAP_CONFIG(appId, territoryId)
    );
  }
}
