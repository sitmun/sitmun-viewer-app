import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthorizedLayoutComponent } from './layout/authorized-layout/authorized-layout.component';
import { NavigationBarComponent } from './layout/navigation-bar/navigation-bar.component';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { FooterComponent } from './layout/footer/footer.component';
import { AuthenticationModule } from '@auth/auth.module';
import { UiModule } from '@ui/ui.module';
import { HttpClientModule } from '@angular/common/http';
import {
  AUTH_CONFIG_DI,
  AUTH_DETAILS_SERVICE_DI
} from '@auth/authentication.options';
import { UserService } from '@api/services/user.service';
import { CustomAuthConfig } from '@config/app.config';

@NgModule({
  declarations: [
    AppComponent,
    AuthorizedLayoutComponent,
    NavigationBarComponent,
    PublicLayoutComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthenticationModule,
    UiModule,
    HttpClientModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-ES' },
    { provide: AUTH_CONFIG_DI, useValue: CustomAuthConfig },
    { provide: AUTH_DETAILS_SERVICE_DI, useClass: UserService }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
