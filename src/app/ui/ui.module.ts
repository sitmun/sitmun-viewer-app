import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardItemsComponent } from './components/dashboard-items/dashboard-items.component';
import { FormsModule } from '@angular/forms';
import { DashboardButtonsComponent } from './components/dashboard-buttons/dashboard-buttons.component';

@NgModule({
  imports: [CommonModule, TranslateModule, FormsModule],
  declarations: [DashboardItemsComponent, DashboardButtonsComponent],
  exports: [DashboardItemsComponent, DashboardButtonsComponent],
  providers: []
})
export class UiModule {}
