import { RouterModule, Routes } from '@angular/router';
import { RoutingDefault } from '@config/app.config';
import { LoginComponent } from '@sections/authentication/login/login.component';
import { NgModule } from '@angular/core';
import { MapComponent } from '@sections/user/map/map.component';

const routes: Routes = [
  { path: '', redirectTo: RoutingDefault.Auth, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'map', component: MapComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule {}
