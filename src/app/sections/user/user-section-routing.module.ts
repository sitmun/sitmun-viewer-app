import { RouterModule, Routes } from '@angular/router';
import { RoutingDefault } from '@config/app.config';
import { NgModule } from '@angular/core';
import { DashboardComponent } from '@sections/user/dashboard/dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: RoutingDefault.Auth, pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {}
