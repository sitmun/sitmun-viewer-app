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
import { DashboardPaginationComponent } from './components/dashboard-pagination/dashboard-pagination.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { PrimaryButtonComponent } from './components/primary-button/primary-button.component';
import { SecondaryButtonComponent } from './components/secondary-button/secondary-button.component';
import { FormFieldInputComponent } from './components/form-field-input/form-field-input.component';

@NgModule({
  imports: [CommonModule, TranslateModule, FormsModule, NgxPaginationModule],
  declarations: [
    DashboardItemsComponent,
    DashboardButtonsComponent,
    DashboardSearchboxComponent,
    DialogFilterPipe,
    MenuComponent,
    DashboardPaginationComponent,
    PrimaryButtonComponent,
    SecondaryButtonComponent,
    FormFieldInputComponent
  ],
  exports: [
    DashboardItemsComponent,
    DashboardButtonsComponent,
    DashboardSearchboxComponent,
    ModalModule,
    DialogFilterPipe,
    DashboardPaginationComponent,
    MenuComponent,
    PrimaryButtonComponent,
    SecondaryButtonComponent,
    FormFieldInputComponent
  ],
  providers: []
})
export class UiModule {}
