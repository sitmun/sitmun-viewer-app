import { RouterModule, Routes } from '@angular/router';
import { RoutingDefault } from '@config/app.config';
import { NgModule } from '@angular/core';
import { DashboardComponent } from '@sections/user/dashboard/dashboard.component';
import { MapComponent } from '@sections/user/map/map.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  { path: '', redirectTo: RoutingDefault.Auth, pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'map/:applicationId/:territoryId', component: MapComponent },
  { path: 'profile', component: ProfileComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {}
