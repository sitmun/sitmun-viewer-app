import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { PublicDashboardComponent } from '@sections/public/public-dashboard/public-dashboard.component';
import { PublicRoutingModule } from '@sections/public/public-section.routing.module';
import { UiModule } from '@ui/ui.module';
import { PublicMapComponent } from '@sections/public/public-map/public-map.component';

@NgModule({
  declarations: [PublicDashboardComponent, PublicMapComponent],
  imports: [
    CommonModule,
    PublicRoutingModule,
    TranslateModule,
    FormsModule,
    UiModule
  ]
})
export class PublicSectionModule {}
