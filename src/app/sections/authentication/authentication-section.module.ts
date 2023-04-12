import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { AuthenticationRoutingModule } from '@sections/authentication/authentication-section-routing.module';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PublicDashboardComponent } from './public-dashboard/public-dashboard.component';

@NgModule({
  declarations: [LoginComponent, PublicDashboardComponent],
  imports: [
    CommonModule,
    AuthenticationRoutingModule,
    FormsModule,
    TranslateModule
  ]
})
export class AuthenticationSectionModule {}
