import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '@auth/services/authentication.service';
import { NotificationService } from 'src/app/notifications/services/NotificationService';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot()
      ],
      declarations: [LoginComponent],
      providers: [
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']) },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} } } },
        { provide: AuthenticationService, useValue: jasmine.createSpyObj('AuthenticationService', ['login', 'isLoggedIn', 'getAuthConfig', 'getLoggedDetails']) },
        { provide: NotificationService, useValue: jasmine.createSpyObj('NotificationService', ['error', 'success', 'info', 'warning']) }
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
