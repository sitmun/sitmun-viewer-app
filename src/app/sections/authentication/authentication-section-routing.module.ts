import { RouterModule, Routes } from '@angular/router';
import { RoutingDefault } from '@config/app.config';
import { LoginComponent } from '@sections/authentication/login/login.component';
import { NgModule } from '@angular/core';
import { MapComponent } from '@sections/user/map/map.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

const routes: Routes = [
  { path: '', redirectTo: RoutingDefault.Auth, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'map', component: MapComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule {}
