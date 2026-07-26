import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  OnDestroy,
  ViewChild,
  inject
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Router } from '@angular/router';

import { CommonService, DashboardSuggestion } from '@api/services/common.service';
import { NavigationPath } from '@config/app.config';
import { Subject, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  takeUntil,
  filter,
  finalize
} from 'rxjs/operators';

export interface SuggestionOption {
  type: 'application' | 'territory';
  id: number;
  name: string;
  logo?: string;
  isPrivate?: boolean;
}

@Component({
  standalone: false,
  selector: 'app-dashboard-searchbox',
  templateUrl: './dashboard-searchbox.component.html',
  styleUrls: ['./dashboard-searchbox.component.scss']
})
export class DashboardSearchboxComponent implements OnInit, OnDestroy {
  @Output() keywords = new EventEmitter<string>();
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger?: MatAutocompleteTrigger;

  searchControl = new FormControl('');
  suggestions: SuggestionOption[] = [];
  loading = false;

  private readonly destroy$ = new Subject<void>();
  private readonly commonService = inject(CommonService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter((value) => typeof value === 'string'),
        switchMap((query: string) => {
          if (query.trim().length < 2) {
            this.loading = false;
            this.suggestions = [];
            return of({ applications: [], territories: [] });
          }
          this.loading = true;
          return this.commonService.fetchDashboardSuggestions(query).pipe(
            finalize(() => {
              this.loading = false;
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (result: DashboardSuggestion) => {
          const applicationSuggestions =
            result.applications?.map((app) => ({
              type: 'application',
              id: app.id,
              name: app.title || app.name,
              logo: app.logo,
              isPrivate: app.appPrivate
            }) satisfies SuggestionOption) ?? [];
          const territorySuggestions =
            result.territories?.map((terr) => ({
              type: 'territory',
              id: terr.id,
              name: terr.name,
              logo: terr.territorialAuthorityLogo
            }) satisfies SuggestionOption) ?? [];

          this.suggestions = [...territorySuggestions, ...applicationSuggestions];
          this.loading = false;
        },
        error: () => {
          this.suggestions = [];
          this.loading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onOptionSelected(option: SuggestionOption): void {
    const isPublic = this.router.url.startsWith('/public');

    if (option.type === 'application') {
      const url = isPublic
        ? NavigationPath.Section.Public.Application(option.id)
        : NavigationPath.Section.User.Application(option.id);
      void this.router.navigateByUrl(url);
    } else if (option.type === 'territory') {
      const url = isPublic
        ? NavigationPath.Section.Public.Territory(option.id)
        : NavigationPath.Section.User.Territory(option.id);
      void this.router.navigateByUrl(url);
    }

    this.searchControl.setValue('', { emitEvent: false });
    this.suggestions = [];
    this.closeSuggestionsPanel();
  }

  displayFn(option: SuggestionOption | null): string {
    return option?.name || '';
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.suggestions = [];
    this.closeSuggestionsPanel();
    this.keywords.emit('');
  }

  handleSubmit(): void {
    const raw = this.searchControl.value;
    const query = typeof raw === 'string' ? raw.trim() : '';
    this.keywords.emit(query);
    this.closeSuggestionsPanel();
  }

  getOptionLabel(option: SuggestionOption): string {
    return option.name;
  }

  getOptionIcon(option: SuggestionOption): string {
    if (option.type === 'application') {
      return 'apps';
    }
    return 'location_on';
  }

  private closeSuggestionsPanel(): void {
    queueMicrotask(() => this.autocompleteTrigger?.closePanel());
  }
}
