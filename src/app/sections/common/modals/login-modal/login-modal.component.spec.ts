import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
      declarations: [LoginModalComponent],
      providers: [
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', [
            'navigate',
            'navigateByUrl'
          ])
        },
        {
          provide: AuthenticationService,
          useValue: jasmine.createSpyObj('AuthenticationService', ['login'])
        },
        {
          provide: OpenModalRef,
          useValue: jasmine.createSpyObj('OpenModalRef', ['close'])
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
