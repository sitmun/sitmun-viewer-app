import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { NavigationBarComponent } from './navigation-bar.component';
import { CommonService } from '@api/services/common.service';
import { AuthenticationService } from '@auth/services/authentication.service';
import { Location } from '@angular/common';

describe('NavigationBarComponent', () => {
  let component: NavigationBarComponent;
  let fixture: ComponentFixture<NavigationBarComponent>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl'], {
      url: '/user/dashboard',
      events: jasmine.createSpyObj('events', ['subscribe', 'forEach'])
    });

    await TestBed.configureTestingModule({
      declarations: [NavigationBarComponent],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        MatToolbarModule,
        MatMenuModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        MatTooltipModule,
        MatButtonToggleModule
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: CommonService, useValue: jasmine.createSpyObj('CommonService', ['fetchDashboardItems', 'message$']) },
        { provide: AuthenticationService, useValue: jasmine.createSpyObj('AuthenticationService', ['getLoggedUsername', 'logout']) },
        { provide: Location, useValue: jasmine.createSpyObj('Location', ['back', 'forward']) },
        TranslateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationBarComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
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
    expect(component.checkIfResponsive).toBeDefined();
    expect(component.getToolbarClass).toBeDefined();
  });

  it('should return correct toolbar class for login route', () => {
    router.url = '/auth/login';
    const className = component.getToolbarClass();
    expect(className).toBe('login');
  });

  it('should return correct toolbar class for map route', () => {
    router.url = '/user/map/123';
    const className = component.getToolbarClass();
    expect(className).toBe('pet');
  });

  it('should return empty string for default route', () => {
    router.url = '/user/dashboard';
    const className = component.getToolbarClass();
    expect(className).toBe('');
  });

  it('should check if connected correctly', () => {
    router.url = '/public/dashboard';
    expect(component.isConnected()).toBe(false);
    
    router.url = '/user/dashboard';
    expect(component.isConnected()).toBe(true);
  });

  it('should check if on map correctly', () => {
    router.url = '/user/map/123';
    expect(component.isOnMap()).toBe(true);
    
    router.url = '/user/dashboard';
    expect(component.isOnMap()).toBe(false);
  });
});
