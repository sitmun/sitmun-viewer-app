import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RoutingDefault } from '@config/app.config';
import { ApplicationComponent } from '@sections/common/pages/application/application.component';
import { TerritoryComponent } from '@sections/common/pages/territory/territory.component';
import { PublicDashboardComponent } from '@sections/public/public-dashboard/public-dashboard.component';
import { PublicMapComponent } from '@sections/public/public-map/public-map.component';

import { publicAuthClearGuard } from './public-auth-clear.guard';
import { sitnaMapGuard } from '../../guards/sitna-map.guard';

const routes: Routes = [
  { path: '', redirectTo: RoutingDefault.Auth, pathMatch: 'full' },
  { path: 'dashboard', component: PublicDashboardComponent, canActivate: [publicAuthClearGuard] },
  {
    path: 'map/:applicationId/:territoryId',
    component: PublicMapComponent,
    canActivate: [publicAuthClearGuard, sitnaMapGuard]
  },
  { path: 'territory/:territoryId', component: TerritoryComponent, canActivate: [publicAuthClearGuard] },
  { path: 'application/:applicationId', component: ApplicationComponent, canActivate: [publicAuthClearGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule {}
