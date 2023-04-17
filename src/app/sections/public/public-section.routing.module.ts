import { RouterModule, Routes } from '@angular/router';
import { RoutingDefault } from '@config/app.config';
import { NgModule } from '@angular/core';
import { MapComponent } from '@sections/user/map/map.component';
import { PublicDashboardComponent } from '@sections/public/public-dashboard/public-dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: RoutingDefault.Auth, pathMatch: 'full' },
  { path: 'dashboard', component: PublicDashboardComponent },
  { path: 'map', component: MapComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule {}
