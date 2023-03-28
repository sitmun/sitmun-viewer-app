import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoutingDefault } from '@config/app.config';
import { AuthenticationGuard } from '@auth/services/authentication-guard';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { AuthorizedLayoutComponent } from './layout/authorized-layout/authorized-layout.component';

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
    path: '**',
    redirectTo: RoutingDefault.Auth
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
