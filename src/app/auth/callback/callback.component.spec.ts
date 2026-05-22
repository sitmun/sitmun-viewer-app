import { provideHttpClient } from '@angular/common/http';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { AUTH_CONFIG_DI } from '@auth/authentication.options';
import { CallbackComponent } from '@auth/callback/callback.component';
import { AuthenticationService } from '@auth/services/authentication.service';
import { CustomAuthConfig } from '@config/app.config';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { NotificationService } from '../../notifications/services/NotificationService';

describe('CallbackComponent', () => {
  let component: CallbackComponent;
  let fixture: ComponentFixture<CallbackComponent>;
  let router: Router;
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
        Router,
        TranslateService,
        NotificationService,
        AuthenticationService,
        { provide: AUTH_CONFIG_DI, useValue: CustomAuthConfig },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { routeConfig: { path: 'dashboard' }, queryParams: {} }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CallbackComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    notificationService = TestBed.inject(NotificationService);
    authService = TestBed.inject(AuthenticationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should authorize and redirect if token is valid', () => {
    jest
      .spyOn(authService, 'authorizeOidcUser')
      .mockReturnValue(of(undefined));
    const navSpy = jest
      .spyOn(authService, 'loginRedirect')
      .mockReturnValue(undefined);
    component.ngOnInit();
    expect(component.messageKey).toBe('callback.redirect');
    expect(navSpy).toHaveBeenCalledWith({
      snapshot: {
        queryParams: {},
        routeConfig: {
          path: 'dashboard'
        }
      }
    });
  });

  it('should navigate to root and show error if authorization fails', fakeAsync(() => {
    jest
      .spyOn(authService, 'authorizeOidcUser')
      .mockReturnValue(throwError(() => new Error('Unauthorized')));
    const navByUrlSpy = jest
      .spyOn(router, 'navigateByUrl')
      .mockResolvedValue(true as any);
    const showErrorSpy = jest.spyOn(notificationService, 'error');
    component.ngOnInit();
    tick();
    expect(navByUrlSpy).toHaveBeenCalledWith('/');
    expect(showErrorSpy).toHaveBeenCalled();
  }));
});
