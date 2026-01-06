import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MenuComponent } from './menu.component';
import { AuthenticationService } from '@auth/services/authentication.service';

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MenuComponent],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        FormsModule,
        MatMenuModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        MatFormFieldModule,
        MatSelectModule
      ],
      providers: [
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', ['navigate'])
        },
        {
          provide: AuthenticationService,
          useValue: jasmine.createSpyObj('AuthenticationService', ['logout'])
        },
        TranslateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    component.isConnected = true;
    component.showLoginButton = true;
    component.showLogoutButton = true;
    component.showProfileButton = true;
    component.showSwitchLanguageButton = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit login event', () => {
    spyOn(component.loginEvent, 'emit');
    component.sendLoginEvent();
    expect(component.loginEvent.emit).toHaveBeenCalled();
  });

  it('should emit profile event', () => {
    spyOn(component.profileEvent, 'emit');
    component.sendProfileEvent();
    expect(component.profileEvent.emit).toHaveBeenCalled();
  });

  it('should emit logout event', () => {
    spyOn(component.logoutEvent, 'emit');
    component.sendLogoutEvent();
    expect(component.logoutEvent.emit).toHaveBeenCalled();
  });

  it('should not have hideEvent output', () => {
    expect((component as any).hideEvent).toBeUndefined();
  });

  it('should initialize with default language', () => {
    expect(component.currentLang).toBeDefined();
  });
});
