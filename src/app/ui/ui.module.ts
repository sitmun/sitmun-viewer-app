import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardItemsComponent } from './components/dashboard/dashboard-items/dashboard-items.component';
import { FormsModule } from '@angular/forms';
import { DashboardButtonsComponent } from './components/dashboard/dashboard-buttons/dashboard-buttons.component';
import { DashboardSearchboxComponent } from '@ui/components/dashboard/dashboard-searchbox/dashboard-searchbox.component';
import { ModalModule } from '@ui/modal/modal.module';
import { DialogFilterPipe } from '@sections/common/modals/dashboard-modal/dialog-filter.pipe';
import { MenuComponent } from './components/menu/menu.component';
import { DashboardPaginationComponent } from './components/dashboard/dashboard-pagination/dashboard-pagination.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { PrimaryButtonComponent } from './components/primary-button/primary-button.component';
import { SecondaryButtonComponent } from './components/secondary-button/secondary-button.component';
import { FormFieldInputComponent } from './components/form-field-input/form-field-input.component';
import { NotificationComponent } from './components/notification/notification.component';
import { TerritoriesListComponent } from './components/territories-list/territories-list.component';
import { ProfileInformationComponent } from './components/profile-information/profile-information.component';
import { DashboardItemComponent } from './components/dashboard/dashboard-item/dashboard-item.component';
import { DashboardExpandButtonComponent } from './components/dashboard/dashboard-expand-button/dashboard-expand-button.component';
import { DashboardTerritoriesTagComponent } from './components/dashboard/dashboard-territories-tag/dashboard-territories-tag.component';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ApplicationDetailsComponent } from './components/application-details/application-details.component';
import { TerritoryDetailsComponent } from './components/territory-details/territory-details.component';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    NgxPaginationModule,
    CommonModule,
    FormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule
  ],
  declarations: [
    DashboardItemsComponent,
    DashboardButtonsComponent,
    DashboardSearchboxComponent,
    DialogFilterPipe,
    MenuComponent,
    DashboardPaginationComponent,
    PrimaryButtonComponent,
    SecondaryButtonComponent,
    FormFieldInputComponent,
    NotificationComponent,
    DashboardItemComponent,
    DashboardExpandButtonComponent,
    DashboardTerritoriesTagComponent,
    ApplicationDetailsComponent,
    TerritoryDetailsComponent,
    DashboardItemComponent,
    ProfileInformationComponent,
    TerritoriesListComponent
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
    FormFieldInputComponent,
    NotificationComponent,
    DashboardExpandButtonComponent,
    DashboardTerritoriesTagComponent,
    ApplicationDetailsComponent,
    TerritoryDetailsComponent,
    TerritoriesListComponent,
    DashboardItemComponent,
    ProfileInformationComponent
  ],
  providers: []
})
export class UiModule {}
