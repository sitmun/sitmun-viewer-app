import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthenticationService } from '@auth/services/authentication.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OpenModalRef } from '@ui/modal/service/open-modal-ref';
import { of, throwError } from 'rxjs';

import { LoginModalComponent } from './login-modal.component';
import { NotificationService } from '../../../../notifications/services/NotificationService';

describe('LoginModalComponent', () => {
  let component: LoginModalComponent;
  let fixture: ComponentFixture<LoginModalComponent>;
  let login: jest.Mock;
  let errorNotification: jest.Mock;

  beforeEach(async () => {
    login = jest.fn();
    errorNotification = jest.fn();

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        FormsModule
      ],
      declarations: [LoginModalComponent],
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
          provide: AuthenticationService,
          useValue: { login }
        },
        {
          provide: OpenModalRef,
          useValue: {
            close: jest.fn()
          }
        },
        {
          provide: NotificationService,
          useValue: { error: errorNotification }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /** BUG-096: failed login must show translated feedback in the modal flow. */
  it('shows a translated error notification when login returns 401', fakeAsync(() => {
    login.mockReturnValue(throwError(() => ({ status: 401 })));
    const translate = TestBed.inject(TranslateService);
    jest
      .spyOn(translate, 'get')
      .mockReturnValue(of('Incorrect access data'));

    component.authenticationRequest = {
      username: 'wrong',
      password: 'secret'
    };
    component.login();
    tick();

    expect(errorNotification).toHaveBeenCalledWith('Incorrect access data');
  }));
});
