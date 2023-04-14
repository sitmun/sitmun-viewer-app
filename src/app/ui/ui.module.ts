import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardItemsComponent } from './components/dashboard-items/dashboard-items.component';

@NgModule({
  imports: [CommonModule, TranslateModule],
  declarations: [DashboardItemsComponent],
  exports: [DashboardItemsComponent],
  providers: []
})
export class UiModule {}
