import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TranslateModule } from '@ngx-translate/core';
import { PrimaryButtonComponent } from '@ui/components/primary-button/primary-button.component';
import { ProfileInformationComponent } from '@ui/components/profile-information/profile-information.component';
import { ReturnButtonComponent } from '@ui/components/return-button/return-button.component';
import { NotificationService } from 'src/app/notifications/services/NotificationService';

import { ProfileComponent } from './profile.component';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        MatIconModule,
        MatTooltipModule
      ],
      declarations: [
        ProfileComponent,
        ReturnButtonComponent,
        ProfileInformationComponent,
        PrimaryButtonComponent
      ],
      providers: [
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
    });
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
