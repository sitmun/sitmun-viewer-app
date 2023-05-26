import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URL_API_APPLICATIONS, URL_API_TERRITORIES } from '@api/api-config';
import { environment } from 'src/environments/environment';
import { of } from 'rxjs';
import {AppCfg} from "@api/model/app-cfg";

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
    name: 'Public Territory 1'
  },
  {
    id: 2,
    name: 'Public Territory 2'
  },
  {
    id: 3,
    name: 'Public Territory 3 Public Territory 3 Public Territory 3 Public Territory 3 Public Territory 3 Public Territory 3'
  },
  {
    id: 4,
    name: 'Public Territory 4'
  },
  {
    id: 5,
    name: 'Public Territory 5'
  },
  {
    id: 6,
    name: 'Public Territory 6 Public Territory 6 Public Territory 6 Public Territory 6'
  },
  {
    id: 7,
    name: 'Public Territory 7'
  },
  {
    id: 8,
    name: 'Public Territory 8'
  },
  {
    id: 9,
    name: 'Public Territory 9'
  },
  {
    id: 10,
    name: 'Public Territory 10'
  },
  {
    id: 11,
    name: 'Public Territory 11'
  },
  {
    id: 12,
    name: 'Public Territory 12'
  },
  {
    id: 13,
    name: 'Public Territory 13'
  },
  {
    id: 14,
    name: 'Public Territory 14'
  },
  {
    id: 15,
    name: 'Public Territory 15'
  },
  {
    id: 16,
    name: 'Public Territory 16'
  },
  {
    id: 17,
    name: 'Public Territory 17'
  },
  {
    id: 18,
    name: 'Public Territory 18'
  },
  {
    id: 19,
    name: 'Public Territory 19'
  },
  {
    id: 20,
    name: 'Public Territory 20'
  },
  {
    id: 21,
    name: 'Public Territory 21'
  }
];

const applications: ApplicationDto[] = [
  {
    id: 1,
    name: 'Public App 1'
  },
  {
    id: 2,
    name: 'Public App 2'
  },
  {
    id: 3,
    name: 'Public App 3'
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

  fetchMap(applicationId: number, territoryId: number) {
    let path;
    path = '/api/config/client/profile/' + applicationId + '/' + territoryId;

    return this.http.get<AppCfg>(environment.apiUrl + path);
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
}
