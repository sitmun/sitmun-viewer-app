import { Location, NgOptimizedImage } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router, RouterModule } from '@angular/router';

import { CommonService } from '@api/services/common.service';
import { AuthenticationService } from '@auth/services/authentication.service';
import {
  TranslateLoader,
  TranslateModule,
  TranslateFakeLoader
} from '@ngx-translate/core';
import { MenuComponent } from '@ui/components/menu/menu.component';
import { of } from 'rxjs';
import { ErrorTrackingService } from 'src/app/services/error-tracking.service';
import { LanguageService } from 'src/app/services/language.service';

import { NavigationBarComponent } from './navigation-bar.component';

describe('NavigationBarComponent', () => {
  let component: NavigationBarComponent;
  let fixture: ComponentFixture<NavigationBarComponent>;
  let router: jest.Mocked<Router>;

  beforeEach(async () => {
    const routerSpy = {
      navigate: jest.fn(),
      navigateByUrl: jest.fn(),
      url: '/user/dashboard',
      events: of({} as any)
    } as Partial<Router> as Router;

    await TestBed.configureTestingModule({
      declarations: [NavigationBarComponent, MenuComponent],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        NgOptimizedImage,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        }),
        MatToolbarModule,
        MatMenuModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        MatTooltipModule,
        MatButtonToggleModule,
        MatDialogModule,
        RouterModule
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        {
          provide: CommonService,
          useValue: {
            fetchDashboardItems: jest.fn().mockReturnValue(of({ content: [] })),
            message$: of(null)
          }
        },
        {
          provide: AuthenticationService,
          useValue: {
            getLoggedUsername: jest.fn(),
            logout: jest.fn()
          }
        },
        {
          provide: Location,
          useValue: {
            back: jest.fn(),
            forward: jest.fn()
          }
        },
        {
          provide: LanguageService,
          useValue: {
            setLanguage: jest.fn().mockReturnValue(of(null)),
            getCurrentLanguage: jest.fn().mockReturnValue('en'),
            getLanguagesTranslatedSorted: jest.fn().mockReturnValue(of([])),
            getLanguageName: jest.fn().mockReturnValue('English'),
            getLanguageIcon: jest.fn().mockReturnValue('assets/flags/en.svg')
          }
        },
        {
          provide: ErrorTrackingService,
          useValue: {
            errors$: of([]),
            getUnreviewedCount: jest.fn().mockReturnValue(0)
          }
        },
        {
          provide: MatDialog,
          useValue: {
            open: jest.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationBarComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should implement OnInit, DoCheck, OnDestroy', () => {
    expect(component.ngOnInit).toBeDefined();
    expect(component.ngDoCheck).toBeDefined();
    expect(component.ngOnDestroy).toBeDefined();
  });

  it('should have correct method names', () => {
    expect(component.checkWhichClassIsActive).toBeDefined();
    expect(component.overrideNavbar).toBeDefined();
    expect(component.getToolbarClass).toBeDefined();
  });

  it('should return correct toolbar class for login route', () => {
    Object.defineProperty(router, 'url', {
      get: jest.fn().mockReturnValue('/auth/login'),
      configurable: true
    });
    const className = component.getToolbarClass();
    expect(className).toBe('login');
  });

  it('should return correct toolbar class for map route', () => {
    Object.defineProperty(router, 'url', {
      get: jest.fn().mockReturnValue('/user/map/123'),
      configurable: true
    });
    const className = component.getToolbarClass();
    expect(className).toBe('pet');
  });

  it('should return empty string for default route', () => {
    Object.defineProperty(router, 'url', {
      get: jest.fn().mockReturnValue('/user/dashboard'),
      configurable: true
    });
    const className = component.getToolbarClass();
    expect(className).toBe('');
  });

  it('should check if connected correctly', () => {
    Object.defineProperty(router, 'url', {
      get: jest.fn().mockReturnValue('/public/dashboard'),
      configurable: true
    });
    expect(component.isConnected()).toBe(false);

    Object.defineProperty(router, 'url', {
      get: jest.fn().mockReturnValue('/user/dashboard'),
      configurable: true
    });
    expect(component.isConnected()).toBe(true);
  });

  it('should check if on map correctly', () => {
    Object.defineProperty(router, 'url', {
      get: jest.fn().mockReturnValue('/user/map/123'),
      configurable: true
    });
    expect(component.isOnMap()).toBe(true);

    Object.defineProperty(router, 'url', {
      get: jest.fn().mockReturnValue('/user/dashboard'),
      configurable: true
    });
    expect(component.isOnMap()).toBe(false);
  });
});
