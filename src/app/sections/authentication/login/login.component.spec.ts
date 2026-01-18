import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthenticationService } from '@auth/services/authentication.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormFieldInputComponent } from '@ui/components/form-field-input/form-field-input.component';
import { PrimaryButtonComponent } from '@ui/components/primary-button/primary-button.component';
import { NotificationService } from 'src/app/notifications/services/NotificationService';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        MatIconModule
      ],
      declarations: [
        LoginComponent,
        PrimaryButtonComponent,
        FormFieldInputComponent
      ],
      providers: [
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', [
            'navigate',
            'navigateByUrl'
          ])
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: {} } }
        },
        {
          provide: AuthenticationService,
          useValue: jasmine.createSpyObj('AuthenticationService', [
            'login',
            'isLoggedIn',
            'getAuthConfig',
            'getLoggedDetails'
          ])
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', [
            'error',
            'success',
            'info',
            'warning'
          ])
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
});
