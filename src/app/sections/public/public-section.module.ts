import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

import { TranslateModule } from '@ngx-translate/core';
import { PublicDashboardComponent } from '@sections/public/public-dashboard/public-dashboard.component';
import { PublicMapComponent } from '@sections/public/public-map/public-map.component';
import { PublicRoutingModule } from '@sections/public/public-section.routing.module';
import { UiModule } from '@ui/ui.module';

@NgModule({
  declarations: [PublicDashboardComponent, PublicMapComponent],
  imports: [
    CommonModule,
    PublicRoutingModule,
    TranslateModule,
    FormsModule,
    UiModule,
    MatDialogModule
  ]
})
export class PublicSectionModule {}
