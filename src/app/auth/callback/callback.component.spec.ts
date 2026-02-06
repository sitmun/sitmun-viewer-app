import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { AUTH_CONFIG_DI, OIDC_TOKEN_COOKIE } from '@auth/authentication.options';
import { CallbackComponent } from '@auth/callback/callback.component';
import { AuthenticationService } from '@auth/services/authentication.service';
import { CustomAuthConfig } from '@config/app.config';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { of } from 'rxjs';

import { NotificationService } from '../../notifications/services/NotificationService';

describe('CallbackComponent', () => {
  let component: CallbackComponent;
  let fixture: ComponentFixture<CallbackComponent>;
  let router: Router;
  let cookieService: CookieService;
  let notificationService: NotificationService;
  let authService: AuthenticationService<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CallbackComponent,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: () => ({
              getTranslation: () => of({})
            })
          }
        })
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        Router,
        CookieService,
        TranslateService,
        NotificationService,
        AuthenticationService,
        { provide: AUTH_CONFIG_DI, useValue: CustomAuthConfig },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              routeConfig: { path: 'dashboard' },
              queryParams: {},
              queryParamMap: { get: () => null }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CallbackComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    cookieService = TestBed.inject(CookieService);
    notificationService = TestBed.inject(NotificationService);
    authService = TestBed.inject(AuthenticationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should access dashboard if token exists', () => {
    jest.spyOn(cookieService, 'get').mockReturnValue('token123');
    const loginSpy = jest
      .spyOn(authService, 'authorizeOidcUser')
      .mockReturnValue(undefined);
    const navSpy = jest
      .spyOn(authService, 'loginRedirect')
      .mockReturnValue(undefined);
    component.ngOnInit();
    expect(cookieService.get).toHaveBeenCalledWith(OIDC_TOKEN_COOKIE);
    expect(component.messageKey).toBe('callback.redirect');
    expect(loginSpy).toHaveBeenCalledWith('token123');
    expect(navSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        snapshot: expect.objectContaining({
          routeConfig: { path: 'dashboard' }
        })
      })
    );
  });

  it('should navigate to root and show error if token does not exist', fakeAsync(() => {
    jest.spyOn(cookieService, 'get').mockReturnValue('');
    const navByUrlSpy = jest
      .spyOn(router, 'navigateByUrl')
      .mockResolvedValue(true as any);
    const showErrorSpy = jest.spyOn(notificationService, 'error');
    component.ngOnInit();
    tick();
    expect(cookieService.get).toHaveBeenCalledWith(OIDC_TOKEN_COOKIE);
    expect(navByUrlSpy).toHaveBeenCalledWith('/');
    expect(showErrorSpy).toHaveBeenCalled();
  }));
});
