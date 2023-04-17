import { Injectable } from '@angular/core';

export enum DashboardTypes {
  APPLICATIONS = 'applications',
  TERRITORIES = 'territories'
}

export interface DashboardItem {
  img: string;
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommonService {}

// TODO example. just in case.
