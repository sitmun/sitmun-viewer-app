import { Injectable } from '@angular/core';

import { AppCfg } from '@api/model/app-cfg';

/**
 * Represents a single locator task (ui-control = 'sitmun.localizer').
 */
export interface LocalizerTask {
  id: string;
  name: string;
  /** URL template. Use {text} for the search term, {bbox} for the map extent. */
  url: string;
  /**
   * Scope of the task: 'API' = goes through the SITMUN proxy; 'URL' or 'RESOURCE' = direct URL.
   * In proxy mode the viewer appends ?text=<value> so the proxy can expand {text} server-side.
   * In direct mode the viewer substitutes {text}/{bbox} in the URL before calling the API.
   */
  scope: string;
  /** Dot-notation path to the results array in the response. Empty string = root. */
  resultsPath: string;
  /** Dot-notation path to the display label within each result. */
  labelField: string;
  /** Dot-notation path to a GeoJSON geometry object within each result. */
  geometryField: string;
  /** Dot-notation path to a bbox array [west, south, east, north] within each result. */
  bboxField: string;
  /** Dot-notation path to the latitude value (alternative to GeoJSON geometry). */
  latField: string;
  /** Dot-notation path to the longitude value (alternative to GeoJSON geometry). */
  lonField: string;
  /** Coordinate reference system of the service response (e.g. 'EPSG:4326'). */
  srs: string;
  /**
   * Fetch credentials mode sent to the geocoder API.
   * Configurable from admin: 'omit' | 'same-origin' | 'include'.
   * Default: 'same-origin' (browser default — does not send cookies to cross-origin APIs).
   * Set to 'include' for SITMUN proxy (API scope) tasks that require session authentication.
   */
  credentials: RequestCredentials;
  /**
   * When true, results are filtered client-side to only those whose geometry
   * falls within the current map extent. Useful for geocoders (e.g. ICGC) that
   * do not support server-side bbox filtering.
   * Configurable from admin: set 'filterByExtent' = 'true'.
   */
  filterByExtent: boolean;
}

/**
 * Default parsing config applied when the task carries no parameters.
 * Matches the Nominatim/GeoJSON response format.
 */
export const DEFAULT_TASK_CONFIG = {
  resultsPath: 'features',
  labelField: 'properties.display_name',
  geometryField: 'geometry',
  bboxField: '',
  latField: '',
  lonField: '',
  srs: 'EPSG:4326',
  // 'same-origin' is the browser fetch default: sends cookies only to the same origin.
  // External public APIs (e.g. ICGC, Nominatim) are cross-origin → no cookies sent → no CORS issue.
  // Set to 'include' in admin when the geocoder requires session credentials (e.g. proxy tasks).
  credentials: 'same-origin' as RequestCredentials,
  // false = return all results regardless of map extent (global geocoders).
  // true  = filter client-side so only results within the current map view are shown.
  filterByExtent: false
} as const;

/**
 * Resolves a dot-notation path within an object.
 * e.g. getByPath({a: {b: 1}}, 'a.b') === 1
 */
export function getByPath(obj: any, path: string): any {
  if (!path || obj == null) return obj;
  return path.split('.').reduce((curr, key) => (curr == null ? undefined : curr[key]), obj);
}

/** Module-level cache of localizer tasks for use in non-Angular control logic. */
let _tasks: LocalizerTask[] = [];

/**
 * Get the current localizer tasks (for use outside Angular DI).
 */
export function getLocalizerTasks(): LocalizerTask[] {
  return _tasks;
}

/**
 * Set the localizer tasks cache (called by LocalizerService after initialization).
 */
export function setLocalizerTasks(tasks: LocalizerTask[]): void {
  _tasks = tasks;
}

/**
 * Execute a locator search using the task's URL template and parsing config.
 * @param task       The localizer task (URL template + parsing config).
 * @param searchText The text entered by the user.
 * @param mapBbox    Optional map extent as 'west,south,east,north' (for {bbox} substitution).
 */
export async function executeLocalizerSearch(
  task: LocalizerTask,
  searchText: string,
  mapBbox?: string
): Promise<any[]> {
  let url: string;

  if (task.scope === 'API') {
    // Proxy mode: the SITMUN proxy expands {text} in the command URL server-side.
    // The viewer appends the search text and optional bbox as query parameters.
    // The query task must declare 'text' (and optionally 'bbox') as client-provided parameters.
    const params = new URLSearchParams({ text: searchText });
    if (mapBbox) {
      params.set('bbox', mapBbox);
    }
    url = `${task.url}?${params.toString()}`;
  } else {
    // Direct mode (scope URL / RESOURCE): substitute placeholders client-side.
    url = task.url.replace(/\{text\}/gi, encodeURIComponent(searchText));
    if (mapBbox) {
      url = url.replace(/\{bbox\}/gi, mapBbox);
    }
  }
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      credentials: task.credentials
    });
    if (!response.ok) {
      console.warn('[LocalizerService] Search request failed:', response.status);
      return [];
    }
    const data = await response.json();
    const raw = getByPath(data, task.resultsPath);
    if (Array.isArray(raw)) return raw;
    if (raw != null) return [raw];
    return [];
  } catch (error) {
    console.error('[LocalizerService] Search error:', error);
    return [];
  }
}

/**
 * Service for handling Localizer functionality.
 * Stores all locator tasks and exposes search execution.
 */
@Injectable({
  providedIn: 'root'
})
export class LocalizerService {
  private tasks: LocalizerTask[] = [];

  initialize(config: AppCfg): void {
    this.tasks = [];
    if (!config?.tasks) {
      return;
    }
    config.tasks.forEach((task: any) => {
      if (task['ui-control'] !== 'sitmun.localizer') {
        return;
      }
      const p = task.parameters ?? {};
      this.tasks.push({
        id: String(task.id),
        name: task.name ?? '',
        url: task.url ?? '',
        scope: task.scope ?? '',
        resultsPath: p.resultsPath ?? DEFAULT_TASK_CONFIG.resultsPath,
        labelField: p.labelField ?? DEFAULT_TASK_CONFIG.labelField,
        geometryField: p.geometryField ?? DEFAULT_TASK_CONFIG.geometryField,
        bboxField: p.bboxField ?? DEFAULT_TASK_CONFIG.bboxField,
        latField: p.latField ?? DEFAULT_TASK_CONFIG.latField,
        lonField: p.lonField ?? DEFAULT_TASK_CONFIG.lonField,
        srs: p.srs ?? DEFAULT_TASK_CONFIG.srs,
        credentials: (p.credentials as RequestCredentials) ?? DEFAULT_TASK_CONFIG.credentials,
        filterByExtent: p.filterByExtent === 'true' || p.filterByExtent === true
      });
    });
    setLocalizerTasks(this.tasks);
  }
}
