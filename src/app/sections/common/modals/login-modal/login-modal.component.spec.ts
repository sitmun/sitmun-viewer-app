import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthenticationService } from '@auth/services/authentication.service';
import { TranslateModule } from '@ngx-translate/core';
import { OpenModalRef } from '@ui/modal/service/open-modal-ref';

import { LoginModalComponent } from './login-modal.component';

describe('LoginModalComponent', () => {
  let component: LoginModalComponent;
  let fixture: ComponentFixture<LoginModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        FormsModule
      ],
      declarations: [LoginModalComponent],
      providers: [
        {
          provide: Router,
          useValue: {
            navigate: jest.fn(),
            navigateByUrl: jest.fn()
          }
        },
        {
          provide: AuthenticationService,
          useValue: {
            login: jest.fn()
          }
        },
        {
          provide: OpenModalRef,
          useValue: {
            close: jest.fn()
          }
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
});
