import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardItemsComponent } from './components/dashboard-items/dashboard-items.component';
import { FormsModule } from '@angular/forms';
import { DashboardButtonsComponent } from './components/dashboard-buttons/dashboard-buttons.component';
import { DashboardSearchboxComponent } from '@ui/components/dashboard-searchbox/dashboard-searchbox.component';
import { ModalModule } from '@ui/modal/modal.module';
import { DialogFilterPipe } from '@sections/common/modals/dashboard-modal/dialog-filter.pipe';
import { MenuComponent } from './components/menu/menu.component';

@NgModule({
  imports: [CommonModule, TranslateModule, FormsModule],
  declarations: [
    DashboardItemsComponent,
    DashboardButtonsComponent,
    DashboardSearchboxComponent,
    DialogFilterPipe,
    MenuComponent
  ],
  exports: [
    DashboardItemsComponent,
    DashboardButtonsComponent,
    DashboardSearchboxComponent,
    DashboardSearchboxComponent,
    ModalModule,
    DialogFilterPipe,
    MenuComponent
  ],
  providers: []
})
export class UiModule {}
