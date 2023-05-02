import { RouterModule, Routes } from '@angular/router';
import { RoutingDefault } from '@config/app.config';
import { NgModule } from '@angular/core';
import { PublicDashboardComponent } from '@sections/public/public-dashboard/public-dashboard.component';
import { PublicMapComponent } from '@sections/public/public-map/public-map.component';
import { DashboardModalComponent } from '@sections/common/modals/dashboard-modal/dashboard-modal.component';

const routes: Routes = [
  { path: '', redirectTo: RoutingDefault.Auth, pathMatch: 'full' },
  { path: 'dashboard', component: PublicDashboardComponent },
  { path: 'map', component: PublicMapComponent },
  { path: 'dialog', component: DashboardModalComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule {}
