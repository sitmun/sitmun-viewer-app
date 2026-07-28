import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';

import { CommonService } from '@api/services/common.service';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subject } from 'rxjs';

import {
  DashboardSearchboxComponent,
  SuggestionOption
} from './dashboard-searchbox.component';

describe('DashboardSearchboxComponent', () => {
  let component: DashboardSearchboxComponent;
  let fixture: ComponentFixture<DashboardSearchboxComponent>;
  let keywordsSpy: jest.SpyInstance;
  let fetchDashboardSuggestions: jest.Mock;
  let navigateByUrl: jest.Mock;

  beforeEach(async () => {
    fetchDashboardSuggestions = jest.fn().mockReturnValue(
      of({
        applications: [{ id: 1, name: 'Fixture app', title: 'Fixture app' }],
        territories: []
      })
    );
    navigateByUrl = jest.fn();

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        NoopAnimationsModule
      ],
      declarations: [DashboardSearchboxComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: { url: '/public/dashboard', navigateByUrl } },
        {
          provide: CommonService,
          useValue: {
            fetchDashboardSuggestions
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardSearchboxComponent);
    component = fixture.componentInstance;
    keywordsSpy = jest.spyOn(component.keywords, 'emit');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits keywords on submit', () => {
    component.searchControl.setValue('menorca', { emitEvent: false });
    component.handleSubmit();
    expect(keywordsSpy).toHaveBeenCalledWith('menorca');
  });

  it('loads suggestions while typing without filtering the dashboard grid', fakeAsync(() => {
    component.searchControl.setValue('fixture');
    tick(300);

    expect(keywordsSpy).not.toHaveBeenCalled();
    expect(fetchDashboardSuggestions).toHaveBeenCalledWith('fixture');
  }));

  it('filters the dashboard grid only after submit', fakeAsync(() => {
    component.searchControl.setValue('fixture');
    tick(300);
    keywordsSpy.mockClear();

    component.handleSubmit();

    expect(keywordsSpy).toHaveBeenCalledWith('fixture');
  }));

  it('clears loading when query shortened below 2 characters after in-flight request', fakeAsync(() => {
    const pending$ = new Subject<{
      applications: Array<{ id: number; name: string; title: string }>;
      territories: [];
    }>();
    fetchDashboardSuggestions.mockReturnValue(pending$.asObservable());

    component.searchControl.setValue('fix');
    tick(300);
    expect(component.loading).toBe(true);

    component.searchControl.setValue('f');
    tick(300);
    expect(component.loading).toBe(false);

    pending$.next({
      applications: [{ id: 1, name: 'Fixture app', title: 'Fixture app' }],
      territories: []
    });
    pending$.complete();
    tick();
    expect(component.loading).toBe(false);
  }));

  it('lists territory suggestions before application suggestions', fakeAsync(() => {
    fetchDashboardSuggestions.mockReturnValue(
      of({
        applications: [{ id: 1, name: 'Fixture app', title: 'Fixture app' }],
        territories: [{ id: 2, name: 'Menorca' }]
      })
    );

    component.searchControl.setValue('fixture');
    tick(300);

    expect(component.suggestions.map((suggestion) => suggestion.type)).toEqual([
      'territory',
      'application'
    ]);
  }));

  it('emits empty keyword on clear', () => {
    component.searchControl.setValue('test', { emitEvent: false });
    component.clearSearch();
    expect(component.searchControl.value).toBe('');
    expect(keywordsSpy).toHaveBeenCalledWith('');
  });

  it('navigates to selected application suggestions', () => {
    const option: SuggestionOption = {
      type: 'application',
      id: 7,
      name: 'Fixture app'
    };

    component.onOptionSelected(option);

    expect(navigateByUrl).toHaveBeenCalledWith('/public/application/7');
  });
});
