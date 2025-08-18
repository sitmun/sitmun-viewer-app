import { RouterModule, Routes } from '@angular/router';
import { RoutingDefault } from '@config/app.config';
import { NgModule } from '@angular/core';
import { PublicDashboardComponent } from '@sections/public/public-dashboard/public-dashboard.component';
import { PublicMapComponent } from '@sections/public/public-map/public-map.component';
import { TerritoryComponent } from '@sections/common/pages/territory/territory.component';
import { ApplicationComponent } from '@sections/common/pages/application/application.component';

const routes: Routes = [
  { path: '', redirectTo: RoutingDefault.Auth, pathMatch: 'full' },
  { path: 'dashboard', component: PublicDashboardComponent },
  { path: 'map/:applicationId/:territoryId', component: PublicMapComponent },
  { path: 'territory/:territoryId', component: TerritoryComponent},
  { path: 'application/:applicationId', component: ApplicationComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule {}
