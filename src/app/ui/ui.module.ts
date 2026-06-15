import { CommonModule, NgOptimizedImage } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { DashboardSearchboxComponent } from '@ui/components/dashboard/dashboard-searchbox/dashboard-searchbox.component';
import { ModalModule } from '@ui/modal/modal.module';

import { ApplicationDetailsComponent } from './components/application-details/application-details.component';
import { ChangeApplicationTerritoryDialogComponent } from './components/change-application-territory-dialog/change-application-territory-dialog.component';
import { DashboardItemComponent } from './components/dashboard/dashboard-item/dashboard-item.component';
import { DashboardItemsComponent } from './components/dashboard/dashboard-items/dashboard-items.component';
import { DashboardTerritorySelectionDialogComponent } from './components/dashboard/dashboard-territory-selection-dialog/dashboard-territory-selection-dialog.component';
import { FormFieldInputComponent } from './components/form-field-input/form-field-input.component';
import { MenuComponent } from './components/menu/menu.component';
import { NotificationComponent } from './components/notification/notification.component';
import { PrimaryButtonComponent } from './components/primary-button/primary-button.component';
import { ProfileInformationComponent } from './components/profile-information/profile-information.component';
import { ReturnButtonComponent } from './components/return-button/return-button.component';
import { SecondaryButtonComponent } from './components/secondary-button/secondary-button.component';
import { SelectableListComponent } from './components/selectable-list/selectable-list.component';
import { TerritoryDetailsComponent } from './components/territory-details/territory-details.component';
import { SharedPipesModule } from '../../util/pipe/SharedPipesModule';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    SharedPipesModule,
    MatButtonModule,
    MatTabsModule,
    MatTooltipModule,
    MatCardModule,
    MatMenuModule,
    MatDividerModule,
    MatDialogModule,
    MatListModule,
    MatChipsModule,
    RouterModule,
    NgOptimizedImage,
    ModalModule
  ],
  declarations: [
    DashboardItemsComponent,
    DashboardSearchboxComponent,
    MenuComponent,
    PrimaryButtonComponent,
    SecondaryButtonComponent,
    FormFieldInputComponent,
    NotificationComponent,
    DashboardItemComponent,
    ApplicationDetailsComponent,
    TerritoryDetailsComponent,
    ProfileInformationComponent,
    ChangeApplicationTerritoryDialogComponent,
    SelectableListComponent,
    ReturnButtonComponent,
    DashboardTerritorySelectionDialogComponent
  ],
  exports: [
    DashboardItemsComponent,
    DashboardSearchboxComponent,
    ModalModule,
    MenuComponent,
    PrimaryButtonComponent,
    SecondaryButtonComponent,
    FormFieldInputComponent,
    NotificationComponent,
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
