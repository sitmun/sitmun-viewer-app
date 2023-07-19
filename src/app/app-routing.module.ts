import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoutingDefault } from '@config/app.config';
import { AuthenticationGuard } from '@auth/services/authentication-guard';
import { AuthorizedLayoutComponent } from './layout/authorized-layout/authorized-layout.component';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { EmbeddedMapComponent } from '@sections/embedded/embedded-map/embedded-map.component';
import { environment } from '../environments/environment';

const routes: Routes = [
  { path: '', redirectTo: RoutingDefault.Auth, pathMatch: 'full' },
  {
    path: 'auth',
    component: PublicLayoutComponent,
    loadChildren: () =>
      import('./sections/authentication/authentication-section.module').then(
        (m) => m.AuthenticationSectionModule
      ),
    canActivate: [AuthenticationGuard]
  },
  {
    path: 'public',
    component: PublicLayoutComponent,
    loadChildren: () =>
      import('./sections/public/public-section.module').then(
        (m) => m.PublicSectionModule
      ),
    canActivate: [AuthenticationGuard]
  },
  {
    path: '',
    component: AuthorizedLayoutComponent,
    canActivate: [AuthenticationGuard],
    children: [
      {
        path: 'user',
        loadChildren: () =>
          import('./sections/user/user-section.module').then(
            (m) => m.UserSectionModule
          )
        // canActivate: [RoleGuard],
        // data: { expectedRoles: Object.values(UserRoles)}
      }
    ]
  },
  {
    path: 'embedded-map/:applicationId/:territoryId/:lang',
    component: EmbeddedMapComponent
  },
  {
    path: '**',
    redirectTo: RoutingDefault.Auth
  }
];

let useHash = false;
if (environment.hashLocationStrategy) {
  useHash = true;
}

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: useHash })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
