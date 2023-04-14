import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserRoutingModule } from '@sections/user/user-section-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { MapComponent } from './map/map.component';
import { FormsModule } from '@angular/forms';
import { UiModule } from '@ui/ui.module';

@NgModule({
  declarations: [DashboardComponent, MapComponent],
  imports: [
    CommonModule,
    UserRoutingModule,
    TranslateModule,
    FormsModule,
    UiModule
  ]
})
export class UserSectionModule {}
