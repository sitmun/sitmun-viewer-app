import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { ErrorTrackingService } from 'src/app/services/error-tracking.service';
import { SidebarManagerService } from 'src/app/services/sidebar-manager.service';

import { ErrorDetailsSidebarComponent } from './error-details-sidebar.component';

describe('ErrorDetailsSidebarComponent', () => {
  let fixture: ComponentFixture<ErrorDetailsSidebarComponent>;
  let activeSidebar$: BehaviorSubject<string | null>;

  beforeEach(async () => {
    activeSidebar$ = new BehaviorSubject<string | null>(null);

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), NoopAnimationsModule],
      declarations: [ErrorDetailsSidebarComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: SidebarManagerService,
          useValue: {
            activeSidebar$,
            getActiveSidebar: () => activeSidebar$.value,
            openSidebar: (id: string) => activeSidebar$.next(id),
            closeSidebar: () => activeSidebar$.next(null)
          }
        },
        {
          provide: ErrorTrackingService,
          useValue: {
            errors$: new BehaviorSubject([]),
            getErrors: () => []
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorDetailsSidebarComponent);
    fixture.detectChanges();
  });

  it('does not render sidebar DOM when closed', () => {
    expect(fixture.nativeElement.querySelector('.error-sidebar')).toBeNull();
  });

  it('renders sidebar when open', () => {
    activeSidebar$.next('error');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.error-sidebar')).not.toBeNull();
  });
});
