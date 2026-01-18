import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';
import { AuthenticationRoutingModule } from '@sections/authentication/authentication-section-routing.module';
import { UiModule } from '@ui/ui.module';

import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginComponent } from './login/login.component';

@NgModule({
  declarations: [LoginComponent, ForgotPasswordComponent],
  imports: [
    CommonModule,
    AuthenticationRoutingModule,
    FormsModule,
    TranslateModule,
    UiModule
  ]
})
export class AuthenticationSectionModule {}
