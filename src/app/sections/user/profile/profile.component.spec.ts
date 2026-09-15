import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { NgOptimizedImage } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { UserService } from '@api/services/user.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PrimaryButtonComponent } from '@ui/components/primary-button/primary-button.component';
import { ProfileInformationComponent } from '@ui/components/profile-information/profile-information.component';
import { ReturnButtonComponent } from '@ui/components/return-button/return-button.component';
import { of } from 'rxjs';
import { NotificationService } from 'src/app/notifications/services/NotificationService';

import { ProfileComponent } from './profile.component';

const en = JSON.parse(
  readFileSync(join(process.cwd(), 'src/assets/i18n/en.json'), 'utf8')
) as Record<string, string>;

const emptyPosition = {
  id: 1,
  email: 'a@example.com',
  organization: 'Org',
  name: 'Cargo',
  type: 'Type',
  expirationDate: null as unknown as Date,
  createdDate: null as unknown as Date,
  lastModifiedDate: new Date(),
  territoryId: 1,
  userId: 1
};

const territory = {
  id: 1,
  code: 't1',
  name: 'Provincia',
  type: { id: 1, name: 'type', official: false, topType: false, bottomType: false },
  createdDate: new Date(),
  positions: [emptyPosition]
};

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        NgOptimizedImage,
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
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: NotificationService,
          useValue: {
            error: jest.fn(),
            success: jest.fn(),
            info: jest.fn(),
            warning: jest.fn()
          }
        },
        {
          provide: UserService,
          useValue: {
            getUserDetails: () =>
              of({
                id: 1,
                email: 'a@example.com',
                username: 'user',
                password: '',
                passwordSet: false,
                firstname: '',
                lastname: '',
                identificationNumber: 0,
                identificationType: '',
                administrator: false,
                blocked: false,
                createDate: new Date()
              }),
            getUserTerritories: () => of({ content: [territory] })
          }
        }
      ]
    });
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', en, true);
    translate.use('en');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows admin Positions copy for empty EN cargo dates', () => {
    component.territories = [territory];
    component.selectedTerritory = territory;
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Position');
    expect(text).toContain('Valid from');
    expect(text).toContain('Valid until');
    expect(text).toContain('Not set');
    expect(text).toContain('Active');
    expect(text).not.toContain('Job name');
    expect(text).not.toContain('Validity from');
  });
});
