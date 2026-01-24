import { NgOptimizedImage, registerLocaleData } from '@angular/common';
import {
  HttpClient,
  HttpClientModule,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import localeEs from '@angular/common/locales/es';
import {
  APP_INITIALIZER,
  LOCALE_ID,
  NgModule,
  ErrorHandler
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AuthenticationModule } from '@auth/auth.module';
import { AUTH_CONFIG_DI } from '@auth/authentication.options';
import { CustomAuthConfig } from '@config/app.config';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ErrorModalComponent } from '@sections/common/modals/error-modal/error-modal.component';
import { LoginModalComponent } from '@sections/common/modals/login-modal/login-modal.component';
import { WarningModalComponent } from '@sections/common/modals/warning-modal/warning-modal.component';
import { EmbeddedMapComponent } from '@sections/embedded/embedded-map/embedded-map.component';
import { UiModule } from '@ui/ui.module';
import { NgxPaginationModule } from 'ngx-pagination';

import { SharedPipesModule } from './../util/pipe/SharedPipesModule';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ErrorHandlerInterceptor } from './config/error-handler.interceptor';
import { ALL_CONTROL_HANDLERS } from './controls/handlers';
import { MessageBoxDialogComponent } from '../util/message-box-service';
import { AuthorizedLayoutComponent } from './layout/authorized-layout/authorized-layout.component';
import { FooterComponent } from './layout/footer/footer.component';
import { NavigationBarComponent } from './layout/navigation-bar/navigation-bar.component';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import {
  AppConfigService,
  initializeAppConfig
} from './services/app-config.service';
import {
  AppInitializerService,
  initializeApp
} from './services/app-initializer.service';
import { ControlRegistryService } from './services/control-registry.service';
import { GlobalErrorHandler } from './services/global-error-handler';
import { SitnaLoaderService } from './services/sitna-loader.service';
import { AboutDialogComponent } from './ui/components/about-dialog/about-dialog.component';
import { ErrorDetailsSidebarComponent } from './ui/components/error-details-sidebar/error-details-sidebar.component';

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
    WarningModalComponent,
    AboutDialogComponent,
    ErrorDetailsSidebarComponent,
    MessageBoxDialogComponent
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
    MatListModule,
    MatExpansionModule,
    NgOptimizedImage,
    NgOptimizedImage,
    NgOptimizedImage
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-ES' },
    { provide: AUTH_CONFIG_DI, useValue: CustomAuthConfig },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorHandlerInterceptor,
      multi: true
    },
    // Register all control handlers
    ...ALL_CONTROL_HANDLERS,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppConfig,
      deps: [AppConfigService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppInitializerService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeControlHandlers,
      deps: [ControlRegistryService, ...ALL_CONTROL_HANDLERS],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeSitnaLoader,
      deps: [SitnaLoaderService],
      multi: true
    }
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

/**
 * Initialize control handlers at application startup.
 * Registers all handlers with the ControlRegistryService.
 */
export function initializeControlHandlers(
  registry: ControlRegistryService,
  ...handlers: any[]
): () => void {
  return () => {
    registry.registerAll(handlers);
  };
}

/**
 * Initialize SITNA loader service at application startup.
 * Starts polling for SITNA.Map availability in background.
 * Does not block Angular bootstrap - only map routes will wait.
 */
export function initializeSitnaLoader(
  loader: SitnaLoaderService
): () => Promise<void> {
  return () => {
    // Start polling in background, don't block bootstrap
    loader.waitForSITNAMap().catch((err) => {
      console.error('[Bootstrap] SITNA failed to load:', err);
    });
    // Return resolved promise to not block bootstrap
    return Promise.resolve();
  };
}
