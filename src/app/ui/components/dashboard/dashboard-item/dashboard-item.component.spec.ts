import { NgOptimizedImage } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
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
import { AppConfigService } from 'src/app/services/app-config.service';

import { DashboardItemComponent } from './dashboard-item.component';

describe('DashboardItemComponent', () => {
  let component: DashboardItemComponent;
  let fixture: ComponentFixture<DashboardItemComponent>;
  let router: { navigateByUrl: jest.Mock; url: string };

  beforeEach(() => {
    router = {
      navigateByUrl: jest.fn(),
      url: '/user/dashboard'
    };

    TestBed.configureTestingModule({
      imports: [
        NgOptimizedImage,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        }),
        MatCardModule,
        MatButtonModule,
        MatIconModule
      ],
      declarations: [DashboardItemComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: Router,
          useValue: router
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
        },
        {
          provide: AppConfigService,
          useValue: {
            isExternalLinkApplication: jest.fn(
              (app: { type?: string }) => app.type === 'E'
            ),
            applicationHasTerritory: jest.fn(
              (app: { type?: string }) => app.type !== 'E'
            )
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

  it('opens external URL in a new tab for type E', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    component.item = {
      ...component.item,
      type: 'E',
      externalUrl: 'https://www.idee.es'
    };

    component.navigateToMap(component.item.id);

    expect(openSpy).toHaveBeenCalledWith(
      'https://www.idee.es',
      '_blank',
      'noopener,noreferrer'
    );
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it('navigates to map for internal applications', () => {
    component.listOfTerritories = [{ id: 4 }];
    component.nbTerritory = 1;

    component.navigateToMap(component.item.id);

    expect(router.navigateByUrl).toHaveBeenCalledWith('/user/map/1/4');
  });
});
