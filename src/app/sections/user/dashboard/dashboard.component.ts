import { Component } from '@angular/core';

interface Application {
  id: number;
  name: string;
  url: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  applicationsList: Application[] = [
    { id: 1, name: 'App1', url: 'https://map.visor.com/app1' },
    { id: 2, name: 'App2', url: 'https://map.visor.com/app2' },
    { id: 3, name: 'App3', url: 'https://map.visor.com/app3' }
  ];
  constructor() {}
}
