import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RoutingDefault } from '@config/app.config';
import { DashboardComponent } from '@sections/user/dashboard/dashboard.component';
import { MapComponent } from '@sections/user/map/map.component';

import { ProfileComponent } from './profile/profile.component';
import { ApplicationComponent } from '../common/pages/application/application.component';
import { TerritoryComponent } from '../common/pages/territory/territory.component';

const routes: Routes = [
  { path: '', redirectTo: RoutingDefault.Auth, pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'map/:applicationId/:territoryId', component: MapComponent },
  { path: 'territory/:territoryId', component: TerritoryComponent },
  { path: 'application/:applicationId', component: ApplicationComponent },
  { path: 'profile', component: ProfileComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {}
