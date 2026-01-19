import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

import { CommonService } from '@api/services/common.service';
import {
  TranslateLoader,
  TranslateModule,
  TranslateFakeLoader
} from '@ngx-translate/core';
import { of } from 'rxjs';
import { NotificationService } from 'src/app/notifications/services/NotificationService';

import { DashboardItemComponent } from './dashboard-item.component';

describe('DashboardItemComponent', () => {
  let component: DashboardItemComponent;
  let fixture: ComponentFixture<DashboardItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        }),
        MatCardModule,
        MatButtonModule,
        MatIconModule
      ],
      declarations: [DashboardItemComponent],
      providers: [
        {
          provide: Router,
          useValue: {
            navigate: jest.fn(),
            navigateByUrl: jest.fn(),
            url: '/user/dashboard'
          }
        },
        {
          provide: CommonService,
          useValue: {
            fetchTerritoriesByApplication: jest
              .fn()
              .mockReturnValue(of({ content: [] }))
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
    });
    fixture = TestBed.createComponent(DashboardItemComponent);
    component = fixture.componentInstance;
    // Set required input before detectChanges
    component.item = {
      id: 1,
      name: 'Test App',
      type: 'I',
      appPrivate: false,
      isUnavailable: false,
      updateDate: new Date(),
      createdDate: new Date(),
      creator: 'test',
      headerParams: {}
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
