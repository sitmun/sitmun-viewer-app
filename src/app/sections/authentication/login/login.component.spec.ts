import { NgOptimizedImage } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';

import { AUTH_METHOD_OIDC } from '@auth/authentication.options';
import { AuthenticationService } from '@auth/services/authentication.service';
import { NavigationPath } from '@config/app.config';
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
  let router: { navigate: jest.Mock; navigateByUrl: jest.Mock };
  let route: { snapshot: { queryParams: Record<string, string> } };
  let translateService: TranslateService;
  let notificationService: {
    error: jest.Mock;
    success: jest.Mock;
    info: jest.Mock;
    warning: jest.Mock;
  };
  let authService: {
    login: jest.Mock;
    isLoggedIn: jest.Mock;
    getAuthConfig: jest.Mock;
    getAuthMethods: jest.Mock;
    getLoggedDetails: jest.Mock;
    initOidcAuth: jest.Mock;
    loginRedirect: jest.Mock;
  };

  beforeEach(async () => {
    router = {
      navigate: jest.fn(),
      navigateByUrl: jest.fn().mockResolvedValue(true)
    };
    route = { snapshot: { queryParams: {} } };
    notificationService = {
      error: jest.fn(),
      success: jest.fn(),
      info: jest.fn(),
      warning: jest.fn()
    };
    authService = {
      login: jest.fn(),
      isLoggedIn: jest.fn(),
      getAuthConfig: jest.fn(),
      getAuthMethods: jest.fn(() => of([])),
      getLoggedDetails: jest.fn(),
      initOidcAuth: jest.fn(),
      loginRedirect: jest.fn()
    };
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
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: route },
        { provide: AuthenticationService, useValue: authService },
        { provide: NotificationService, useValue: notificationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate alternativeLoginMethods when getAuthMethods returns OIDC providers', () => {
    const oidcProviders = [
      {
        providerName: 'google',
        displayName: 'Google',
        imagePath: ''
      }
    ];
    authService.getAuthMethods.mockReturnValue(
      of([{ id: AUTH_METHOD_OIDC, providers: oidcProviders }])
    );
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.alternativeLoginMethods).toEqual(oidcProviders);
  });

  it('should call initOidcAuth when initAuth is called', () => {
    component.initAuth('google');
    expect(authService.initOidcAuth).toHaveBeenCalledWith('google');
  });

  describe('ngOnInit redirect', () => {
    it('should navigate to / when already logged in', () => {
      authService.isLoggedIn.mockReturnValue(true);
      fixture = TestBed.createComponent(LoginComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      expect(router.navigateByUrl).toHaveBeenCalledWith('/');
    });

    it('should not navigate when not logged in', () => {
      authService.isLoggedIn.mockReturnValue(false);
      fixture = TestBed.createComponent(LoginComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });
  });

  describe('login guard', () => {
    it('should not call authService.login when username is empty', () => {
      component.authenticationRequest = { username: '', password: 'p' };
      component.login();
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should not call authService.login when password is empty', () => {
      component.authenticationRequest = { username: 'u', password: '' };
      component.login();
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should not call authService.login when both username and password are empty', () => {
      component.authenticationRequest = { username: '', password: '' };
      component.login();
      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  describe('login success', () => {
    it('should call loginRedirect with current route on successful login', () => {
      authService.login.mockReturnValue(of(undefined));
      component.authenticationRequest = { username: 'u', password: 'p' };
      component.login();
      expect(authService.login).toHaveBeenCalledWith({
        username: 'u',
        password: 'p'
      });
      expect(authService.loginRedirect).toHaveBeenCalledWith(route);
    });
  });

  describe('login error', () => {
    it('should clear credentials and show notification on 401', () => {
      jest.spyOn(translateService, 'get').mockReturnValue(of('Translated message'));
      authService.login.mockReturnValue(
        throwError(() => ({ status: 401, message: 'Unauthorized' }))
      );
      component.authenticationRequest = { username: 'u', password: 'p' };
      component.login();
      expect(component.authenticationRequest.username).toBe('');
      expect(component.authenticationRequest.password).toBe('');
      expect(translateService.get).toHaveBeenCalledWith('loginPage.incorrectLogin');
      expect(notificationService.error).toHaveBeenCalled();
    });

    it('should clear credentials and use problem-type key when isProblemDetail', () => {
      jest.spyOn(translateService, 'get').mockReturnValue(of('Translated message'));
      authService.login.mockReturnValue(
        throwError(() => ({
          status: 400,
          error: { type: 'https://sitmun.org/problems/unauthorized' }
        }))
      );
      component.authenticationRequest = { username: 'u', password: 'p' };
      component.login();
      expect(component.authenticationRequest.username).toBe('');
      expect(component.authenticationRequest.password).toBe('');
      expect(translateService.get).toHaveBeenCalledWith('error.unauthorized');
      expect(notificationService.error).toHaveBeenCalledWith('Translated message');
    });

    it('should use error.unauthorized when problem detail has no extractable type', () => {
      jest.spyOn(translateService, 'get').mockReturnValue(of('Translated message'));
      authService.login.mockReturnValue(
        throwError(() => ({
          status: 400,
          error: { type: 'https://sitmun.org/problems/123' }
        }))
      );
      component.authenticationRequest = { username: 'u', password: 'p' };
      component.login();
      expect(translateService.get).toHaveBeenCalledWith('error.unauthorized');
    });

    it('should not clear credentials nor show notification when error is not 401 and not problem detail', () => {
      authService.login.mockReturnValue(
        throwError(() => ({ status: 500, message: 'Server error' }))
      );
      component.authenticationRequest = { username: 'u', password: 'p' };
      component.login();
      expect(component.authenticationRequest.username).toBe('u');
      expect(component.authenticationRequest.password).toBe('p');
      expect(notificationService.error).not.toHaveBeenCalled();
    });
  });

  describe('publicDashboard', () => {
    it('should navigate to public dashboard path', () => {
      component.publicDashboard();
      expect(router.navigateByUrl).toHaveBeenCalledWith(
        NavigationPath.Section.Public.Dashboard
      );
    });
  });
});
