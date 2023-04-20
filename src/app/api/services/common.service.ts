import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  URL_API_PUBLIC_APPLICATIONS,
  URL_API_PUBLIC_TERRITORIES
} from '@api/api-config';
import { environment } from '../../../environments/environment';

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

export interface ApplicationsResponse {
  content: Array<DashboardItem>;
}

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  constructor(private http: HttpClient) {}

  fetchResources(dashboardType: DashboardTypes, keywords?: string) {
    let path =
      dashboardType === DashboardTypes.APPLICATIONS
        ? URL_API_PUBLIC_APPLICATIONS
        : URL_API_PUBLIC_TERRITORIES;
    if (keywords) {
      path += '?keywords=' + keywords;
    }

    return this.http.get<ApplicationsResponse>(environment.apiUrl + path);
  }
}
