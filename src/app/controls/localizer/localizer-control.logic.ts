/**
 * Localizer Control Logic - TypeScript implementation.
 *
 * Renders a button that opens a search panel with a dropdown
 * of all available locator tasks. Selecting a locator and entering
 * a search text executes the corresponding query.
 *
 * @see localizer-control.handler.ts (same folder) for wiring
 */

import {
  BaseCustomControlInstance,
  ControlLogicBase,
  createPrototypeWrappers
} from '../utils/sitna-patch-helpers';

import { getLocalizerTasks, LocalizerTask, executeLocalizerSearch } from '../../services/localizer.service';

// ============================================================================
// Configuration Constants
// ============================================================================

/** Path to the Handlebars template */
export const TEMPLATE_PATH =
  'assets/js/templates/localizer-control/Localizer.hbs';

/** Minimum number of characters before triggering a search */
const MIN_SEARCH_LENGTH = 2;

/** Debounce delay in ms for the search input */
const SEARCH_DEBOUNCE_MS = 400;

// ============================================================================
// Interfaces
// ============================================================================

export interface LocalizerControlInstance extends BaseCustomControlInstance {
  map: any;
  _handleTogglePanel: () => void;
  _handleLocatorChange: (event: Event) => void;
  _handleSearchInput: (event: Event) => void;
  _handleSearchSubmit: (event: Event) => void;
  _searchDebounceTimer: ReturnType<typeof setTimeout> | null;
  _panelOpen: boolean;
  _selectedTask: LocalizerTask | null;
  _isLoading: boolean;
}

// ============================================================================
// Logic Class
// ============================================================================

export class LocalizerControlLogic implements ControlLogicBase {
  constructor(private readonly control: LocalizerControlInstance) {}

  // ---- ControlLogicBase implementation ----

  init(): void {
    this.control._panelOpen = false;
    this.control._selectedTask = null;
    this.control._searchDebounceTimer = null;
    this.control._isLoading = false;

    this.control._handleTogglePanel = this.handleTogglePanel.bind(this);
    this.control._handleLocatorChange = this.handleLocatorChange.bind(this);
    this.control._handleSearchInput = this.handleSearchInput.bind(this);
    this.control._handleSearchSubmit = this.handleSearchSubmit.bind(this);
  }

  async loadTemplates(): Promise<void> {
    this.control.template = {};
    this.control.template[this.control.CLASS] = TEMPLATE_PATH;
  }

  async render(callback?: () => void): Promise<void> {
    const tasks = getLocalizerTasks();

    const data = {
      title: 'localizer.title',
      searchPlaceholder: 'localizer.searchPlaceholder',
      noResults: 'localizer.noResults',
      loading: 'localizer.loading',
      selectLocator: 'localizer.selectLocator',
      tasks: tasks.map((t) => ({ id: t.id, name: t.name })),
      hasTasks: tasks.length > 0
    };

    return this.control.renderData(data, () => {
      this.addUIEventListeners();
      if (callback) {
        callback();
      }
    });
  }

  // ---- Event listeners ----

  addUIEventListeners(): void {
    const root = this.control.div;
    if (!root) return;

    root
      .querySelector('.tc-ctl-loc-btn')
      ?.addEventListener('click', this.control._handleTogglePanel);

    root
      .querySelector('.tc-ctl-loc-select')
      ?.addEventListener('change', this.control._handleLocatorChange);

    root
      .querySelector('.tc-ctl-loc-input')
      ?.addEventListener('input', this.control._handleSearchInput);

    root
      .querySelector('.tc-ctl-loc-form')
      ?.addEventListener('submit', this.control._handleSearchSubmit);
  }

  // ---- Event handlers ----

  private handleTogglePanel(): void {
    this.control._panelOpen = !this.control._panelOpen;
    const panel = this.control.div?.querySelector<HTMLElement>('.tc-ctl-loc-panel');
    const btn = this.control.div?.querySelector<HTMLElement>('.tc-ctl-loc-btn');
    if (panel) {
      panel.style.display = this.control._panelOpen ? 'flex' : 'none';
    }
    if (btn) {
      btn.classList.toggle('tc-ctl-loc-btn--active', this.control._panelOpen);
    }
  }

  private handleLocatorChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const taskId = select.value;
    const tasks = getLocalizerTasks();
    this.control._selectedTask = tasks.find((t) => t.id === taskId) ?? null;

    const inputRow = this.control.div?.querySelector<HTMLElement>('.tc-ctl-loc-search-row');
    if (inputRow) {
      inputRow.style.display = this.control._selectedTask ? 'flex' : 'none';
    }

    // Clear previous results
    this.clearResults();

    // Clear input value
    const input = this.control.div?.querySelector<HTMLInputElement>('.tc-ctl-loc-input');
    if (input) {
      input.value = '';
    }
  }

  private handleSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const text = input.value.trim();

    if (this.control._searchDebounceTimer !== null) {
      clearTimeout(this.control._searchDebounceTimer);
    }

    if (text.length < MIN_SEARCH_LENGTH) {
      this.clearResults();
      return;
    }

    this.control._searchDebounceTimer = setTimeout(() => {
      this.executeSearch(text);
    }, SEARCH_DEBOUNCE_MS);
  }

  private handleSearchSubmit(event: Event): void {
    event.preventDefault();
    const input = this.control.div?.querySelector<HTMLInputElement>('.tc-ctl-loc-input');
    const text = input?.value.trim() ?? '';
    if (text.length >= MIN_SEARCH_LENGTH) {
      if (this.control._searchDebounceTimer !== null) {
        clearTimeout(this.control._searchDebounceTimer);
      }
      this.executeSearch(text);
    }
  }

  // ---- Search execution ----

  private async executeSearch(searchText: string): Promise<void> {
    const task = this.control._selectedTask;
    if (!task) return;

    this.setLoading(true);

    try {
      const results = await executeLocalizerSearch(task, searchText);
      this.renderResults(results, task);
    } finally {
      this.setLoading(false);
    }
  }

  private setLoading(loading: boolean): void {
    this.control._isLoading = loading;
    const indicator = this.control.div?.querySelector<HTMLElement>('.tc-ctl-loc-loading');
    if (indicator) {
      indicator.style.display = loading ? 'block' : 'none';
    }
    const resultsList = this.control.div?.querySelector<HTMLElement>('.tc-ctl-loc-results');
    if (resultsList) {
      resultsList.style.display = loading ? 'none' : 'block';
    }
  }

  private clearResults(): void {
    const resultsList = this.control.div?.querySelector<HTMLElement>('.tc-ctl-loc-results');
    if (resultsList) {
      resultsList.innerHTML = '';
      resultsList.style.display = 'none';
    }
    const noResults = this.control.div?.querySelector<HTMLElement>('.tc-ctl-loc-no-results');
    if (noResults) {
      noResults.style.display = 'none';
    }
  }

  private renderResults(results: any[], task: LocalizerTask): void {
    const resultsList = this.control.div?.querySelector<HTMLElement>('.tc-ctl-loc-results');
    const noResults = this.control.div?.querySelector<HTMLElement>('.tc-ctl-loc-no-results');
    if (!resultsList) return;

    resultsList.innerHTML = '';

    if (!results || results.length === 0) {
      resultsList.style.display = 'none';
      if (noResults) noResults.style.display = 'block';
      return;
    }

    if (noResults) noResults.style.display = 'none';
    resultsList.style.display = 'block';

    results.forEach((item) => {
      const label = this.extractLabel(item);
      const li = document.createElement('li');
      li.className = 'tc-ctl-loc-result-item';
      li.textContent = label;
      li.addEventListener('click', () => this.handleResultClick(item, task));
      resultsList.appendChild(li);
    });
  }

  private extractLabel(item: any): string {
    if (typeof item === 'string') return item;
    return (
      item.label ||
      item.name ||
      item.nom ||
      item.title ||
      item.description ||
      item.value ||
      JSON.stringify(item)
    );
  }

  private handleResultClick(item: any, _task: LocalizerTask): void {
    // Zoom to coordinates if present (GeoJSON feature or {x,y} object)
    const map = this.control.map;
    if (!map) return;

    if (item?.geometry?.coordinates) {
      const coords = item.geometry.coordinates;
      const x = coords[0];
      const y = coords[1];
      if (typeof x === 'number' && typeof y === 'number') {
        map.zoomTo({ x, y, crs: 'EPSG:4326' });
      }
    } else if (typeof item?.x === 'number' && typeof item?.y === 'number') {
      map.zoomTo({ x: item.x, y: item.y });
    } else if (typeof item?.lon === 'number' && typeof item?.lat === 'number') {
      map.zoomTo({ x: item.lon, y: item.lat, crs: 'EPSG:4326' });
    }
  }
}

// ============================================================================
// Prototype Wrappers
// ============================================================================

export const prototypeWrappers =
  createPrototypeWrappers<LocalizerControlInstance>(LocalizerControlLogic);
