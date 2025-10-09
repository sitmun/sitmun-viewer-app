import { SharedPipesModule } from './../util/pipe/SharedPipesModule';
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
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {
  AUTH_CONFIG_DI,
} from '@auth/authentication.options';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CustomAuthConfig } from '@config/app.config';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DashboardModalComponent } from '@sections/common/modals/dashboard-modal/dashboard-modal.component';
import { LoginModalComponent } from '@sections/common/modals/login-modal/login-modal.component';
import { FormsModule } from '@angular/forms';
import { EmbeddedMapComponent } from '@sections/embedded/embedded-map/embedded-map.component';
import { NgxPaginationModule } from 'ngx-pagination';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { ErrorModalComponent } from '@sections/common/modals/error-modal/error-modal.component';
import { WarningModalComponent } from '@sections/common/modals/warning-modal/warning-modal.component';

registerLocaleData(localeEs);

@NgModule({
  declarations: [
    AppComponent,
    AuthorizedLayoutComponent,
    NavigationBarComponent,
    PublicLayoutComponent,
    FooterComponent,
    DashboardModalComponent,
    LoginModalComponent,
    EmbeddedMapComponent,
    ErrorModalComponent,
    WarningModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthenticationModule,
    UiModule,
    HttpClientModule,

    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    FormsModule,
    NgxPaginationModule,
    BrowserAnimationsModule,
    SharedPipesModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-ES' },
    { provide: AUTH_CONFIG_DI, useValue: CustomAuthConfig },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(
    http,
    'assets/i18n/', // By default, this seems to be an absolute path, see:
    // <https://github.com/ngx-translate/core/blob/master/packages/http-loader/lib/http-loader.ts>
    '.json'
  );
}
