import { NgOptimizedImage } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthenticationService } from '@auth/services/authentication.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormFieldInputComponent } from '@ui/components/form-field-input/form-field-input.component';
import { PrimaryButtonComponent } from '@ui/components/primary-button/primary-button.component';
import { SecondaryButtonComponent } from '@ui/components/secondary-button/secondary-button.component';
import { of, throwError } from 'rxjs';
import { NotificationService } from 'src/app/notifications/services/NotificationService';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        NgOptimizedImage,
        MatIconModule
      ],
      declarations: [
        LoginComponent,
        PrimaryButtonComponent,
        SecondaryButtonComponent,
        FormFieldInputComponent
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: Router,
          useValue: {
            navigate: jest.fn(),
            navigateByUrl: jest.fn()
          }
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: {} } }
        },
        {
          provide: AuthenticationService,
          useValue: {
            login: jest.fn(),
            isLoggedIn: jest.fn(),
            getAuthConfig: jest.fn(),
            getAuthMethods: jest.fn().mockReturnValue(of([])),
            getLoggedDetails: jest.fn()
          }
        },
        {
          provide: NotificationService,
          useValue: {
            error: jest.fn(),
            success: jest.fn(),
            info: jest.fn(),
            warning: jest.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('publicDashboard navigates to the public dashboard URL', () => {
    const router = TestBed.inject(Router) as jest.Mocked<Router>;
    component.publicDashboard();
    expect(router.navigateByUrl).toHaveBeenCalledWith(
      expect.stringContaining('public')
    );
  });

  it('publicDashboard does not call any auth-clearing method', () => {
    const authService = TestBed.inject(AuthenticationService) as jest.Mocked<AuthenticationService<unknown>>;
    component.publicDashboard();
    expect(authService.login).not.toHaveBeenCalled();
    expect((authService as any).clearAuthentication).toBeUndefined();
  });

  it('shows a session-expired notification when session-expired=true is in query params', async () => {
    const notificationService = TestBed.inject(NotificationService) as jest.Mocked<NotificationService>;

    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), NgOptimizedImage, MatIconModule],
      declarations: [
        LoginComponent,
        PrimaryButtonComponent,
        SecondaryButtonComponent,
        FormFieldInputComponent
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate: jest.fn(), navigateByUrl: jest.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: { 'session-expired': 'true' } } }
        },
        {
          provide: AuthenticationService,
          useValue: {
            login: jest.fn(),
            isLoggedIn: jest.fn().mockReturnValue(false),
            getAuthConfig: jest.fn(),
            getAuthMethods: jest.fn().mockReturnValue(of([])),
            getLoggedDetails: jest.fn()
          }
        },
        {
          provide: NotificationService,
          useValue: notificationService
        }
      ]
    }).compileComponents();

    const f = TestBed.createComponent(LoginComponent);
    f.detectChanges();
    await f.whenStable();

    expect(notificationService.warning).toHaveBeenCalled();
  });

  it('shows a translated error notification when login returns 401', () => {
    const authService = TestBed.inject(AuthenticationService) as jest.Mocked<
      AuthenticationService<unknown>
    >;
    const notificationService = TestBed.inject(
      NotificationService
    ) as jest.Mocked<NotificationService>;
    const translate = TestBed.inject(TranslateService);
    jest.spyOn(authService, 'login').mockReturnValue(
      throwError(() => ({ status: 401 }))
    );
    jest
      .spyOn(translate, 'get')
      .mockReturnValue(of('Incorrect access data'));

    component.authenticationRequest = {
      username: 'wrong',
      password: 'secret'
    };
    component.login();

    expect(notificationService.error).toHaveBeenCalledWith(
      'Incorrect access data'
    );
    expect(component.authenticationRequest.password).toBe('');
  });
});
