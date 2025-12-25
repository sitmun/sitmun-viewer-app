import { SharedPipesModule } from './../util/pipe/SharedPipesModule';
import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
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
import { AUTH_CONFIG_DI } from '@auth/authentication.options';
import { UserService } from '@api/services/user.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CustomAuthConfig } from '@config/app.config';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { LoginModalComponent } from '@sections/common/modals/login-modal/login-modal.component';
import { FormsModule } from '@angular/forms';
import { EmbeddedMapComponent } from '@sections/embedded/embedded-map/embedded-map.component';
import { NgxPaginationModule } from 'ngx-pagination';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { ErrorModalComponent } from '@sections/common/modals/error-modal/error-modal.component';
import { WarningModalComponent } from '@sections/common/modals/warning-modal/warning-modal.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import {
  AppInitializerService,
  initializeApp,
} from './services/app-initializer.service';
import {
  AppConfigService,
  initializeAppConfig,
} from './services/app-config.service';

registerLocaleData(localeEs);

@NgModule({
  declarations: [
    AppComponent,
    AuthorizedLayoutComponent,
    NavigationBarComponent,
    PublicLayoutComponent,
    FooterComponent,
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
    BrowserAnimationsModule,
    SharedPipesModule,
    MatToolbarModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatListModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-ES' },
    { provide: AUTH_CONFIG_DI, useValue: CustomAuthConfig },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppConfig,
      deps: [AppConfigService],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppInitializerService],
      multi: true,
    },
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
