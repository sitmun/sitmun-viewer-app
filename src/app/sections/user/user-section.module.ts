import { CommonModule, NgOptimizedImage } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

import { TranslateModule } from '@ngx-translate/core';
import { UserRoutingModule } from '@sections/user/user-section-routing.module';
import { UiModule } from '@ui/ui.module';

import { DashboardComponent } from './dashboard/dashboard.component';
import { MapComponent } from './map/map.component';
import { ProfileComponent } from './profile/profile.component';
import { ApplicationComponent } from '../common/pages/application/application.component';
import { TerritoryComponent } from '../common/pages/territory/territory.component';

@NgModule({
  declarations: [
    DashboardComponent,
    MapComponent,
    ApplicationComponent,
    TerritoryComponent,
    ProfileComponent
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    TranslateModule,
    FormsModule,
    UiModule,
    MatDialogModule,
    NgOptimizedImage
  ]
})
export class UserSectionModule {}
