import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserRoutingModule } from '@sections/user/user-section-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { MapComponent } from './map/map/map.component';

@NgModule({
  declarations: [DashboardComponent, MapComponent],
  imports: [CommonModule, UserRoutingModule, TranslateModule]
})
export class UserSectionModule {}
