import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardItemsComponent } from './components/dashboard/dashboard-items/dashboard-items.component';
import { FormsModule } from '@angular/forms';
import { DashboardButtonsComponent } from './components/dashboard/dashboard-buttons/dashboard-buttons.component';
import { DashboardSearchboxComponent } from '@ui/components/dashboard/dashboard-searchbox/dashboard-searchbox.component';
import { ModalModule } from '@ui/modal/modal.module';
import { MenuComponent } from './components/menu/menu.component';
import { DashboardPaginationComponent } from './components/dashboard/dashboard-pagination/dashboard-pagination.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { PrimaryButtonComponent } from './components/primary-button/primary-button.component';
import { SecondaryButtonComponent } from './components/secondary-button/secondary-button.component';
import { FormFieldInputComponent } from './components/form-field-input/form-field-input.component';
import { NotificationComponent } from './components/notification/notification.component';
import { ChangeApplicationTerritoryDialogComponent } from './components/change-application-territory-dialog/change-application-territory-dialog.component';
import { SelectableListComponent } from './components/selectable-list/selectable-list.component';
import { ProfileInformationComponent } from './components/profile-information/profile-information.component';
import { DashboardItemComponent } from './components/dashboard/dashboard-item/dashboard-item.component';
import { DashboardExpandButtonComponent } from './components/dashboard/dashboard-expand-button/dashboard-expand-button.component';
import { DashboardTerritorySelectionDialogComponent } from './components/dashboard/dashboard-territory-selection-dialog/dashboard-territory-selection-dialog.component';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ApplicationDetailsComponent } from './components/application-details/application-details.component';
import { TerritoryDetailsComponent } from './components/territory-details/territory-details.component';
import { MatSelectModule } from '@angular/material/select';
import { SharedPipesModule } from '../../util/pipe/SharedPipesModule';
import { ReturnButtonComponent } from './components/return-button/return-button.component';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';

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
    MatSelectModule,
    MatExpansionModule,
    SharedPipesModule,
    MatButtonModule,
    MatTooltipModule,
    MatCardModule,
    MatMenuModule,
    MatDividerModule,
    MatDialogModule,
    MatListModule,
    MatChipsModule,
    RouterModule
  ],
  declarations: [
    DashboardItemsComponent,
    DashboardButtonsComponent,
    DashboardSearchboxComponent,
    MenuComponent,
    DashboardPaginationComponent,
    PrimaryButtonComponent,
    SecondaryButtonComponent,
    FormFieldInputComponent,
    NotificationComponent,
    DashboardItemComponent,
    DashboardExpandButtonComponent,
    ApplicationDetailsComponent,
    TerritoryDetailsComponent,
    DashboardItemComponent,
    ProfileInformationComponent,
    ChangeApplicationTerritoryDialogComponent,
    SelectableListComponent,
    ReturnButtonComponent,
    DashboardTerritorySelectionDialogComponent
  ],
  exports: [
    DashboardItemsComponent,
    DashboardButtonsComponent,
    DashboardSearchboxComponent,
    ModalModule,
    DashboardPaginationComponent,
    MenuComponent,
    PrimaryButtonComponent,
    SecondaryButtonComponent,
    FormFieldInputComponent,
    NotificationComponent,
    DashboardExpandButtonComponent,
    ApplicationDetailsComponent,
    TerritoryDetailsComponent,
    ChangeApplicationTerritoryDialogComponent,
    SelectableListComponent,
    DashboardItemComponent,
    ProfileInformationComponent,
    ReturnButtonComponent,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule
  ],
  providers: []
})
export class UiModule {}
