import { readFileSync } from 'fs';
import { join } from 'path';

import { NgOptimizedImage } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';

import { AuthenticationService } from '@auth/services/authentication.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { MenuComponent } from './menu.component';
import { AboutDialogComponent } from '../about-dialog/about-dialog.component';

function installedPackageVersion(name: string): string {
  const manifest = JSON.parse(
    readFileSync(
      join(process.cwd(), 'node_modules', name, 'package.json'),
      'utf8'
    )
  ) as { version: string };
  return manifest.version;
}

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MenuComponent, AboutDialogComponent],
      imports: [
        BrowserAnimationsModule,
        NgOptimizedImage,
        TranslateModule.forRoot(),
        FormsModule,
        MatDialogModule,
        MatMenuModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        MatFormFieldModule,
        MatSelectModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: Router,
          useValue: {
            navigate: jest.fn()
          }
        },
        {
          provide: AuthenticationService,
          useValue: {
            logout: jest.fn()
          }
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
    jest.spyOn(component.loginEvent, 'emit');
    component.sendLoginEvent();
    expect(component.loginEvent.emit).toHaveBeenCalled();
  });

  it('should emit profile event', () => {
    jest.spyOn(component.profileEvent, 'emit');
    component.sendProfileEvent();
    expect(component.profileEvent.emit).toHaveBeenCalled();
  });

  it('should emit logout event', () => {
    jest.spyOn(component.logoutEvent, 'emit');
    component.sendLogoutEvent();
    expect(component.logoutEvent.emit).toHaveBeenCalled();
  });

  it('should initialize with default language', () => {
    expect(component.currentLang).toBe('en');
  });

  it('shows the installed SITNA and OpenLayers versions in About', () => {
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      'systemInfo.about': 'About',
      'systemInfo.application': 'Application',
      'systemInfo.applicationName': 'Visualizador SITMUN',
      'systemInfo.version': 'Version',
      'systemInfo.environment': 'Environment',
      'systemInfo.angularVersion': 'Angular Version',
      'systemInfo.sitnaVersion': 'API SITNA Version',
      'systemInfo.openLayersVersion': 'OpenLayers Version',
      'common.button.close': 'Close'
    });
    translate.use('en');

    component.openAboutDialog();
    fixture.detectChanges();

    const text = (document.body.textContent ?? '').replace(/\s+/g, ' ');
    expect(text).toContain(
      `API SITNA Version: ${installedPackageVersion('api-sitna')}`
    );
    expect(text).toContain(
      `OpenLayers Version: ${installedPackageVersion('ol')}`
    );
  });
});
