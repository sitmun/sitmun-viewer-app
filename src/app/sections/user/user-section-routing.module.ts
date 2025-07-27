import { RouterModule, Routes } from '@angular/router';
import { RoutingDefault } from '@config/app.config';
import { NgModule } from '@angular/core';
import { DashboardComponent } from '@sections/user/dashboard/dashboard.component';
import { MapComponent } from '@sections/user/map/map.component';
import { TerritoryComponent } from '../common/pages/territory/territory.component';
import { ApplicationComponent } from '../common/pages/application/application.component';

const routes: Routes = [
  { path: '', redirectTo: RoutingDefault.Auth, pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'map/:applicationId/:territoryId', component: MapComponent },
  { path: 'territory/:territoryId', component: TerritoryComponent},
  { path: 'application/:applicationId', component: ApplicationComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {}
