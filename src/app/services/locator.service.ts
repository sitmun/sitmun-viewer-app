import { Injectable } from '@angular/core';

import { AppCfg } from '@api/model/app-cfg';

/**
 * Represents a single locator task (ui-control = 'sitmun.locator').
 */
export interface LocatorTask {
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
  /** Dot-notation path to the latitude value (alternative to GeoJSON geometry). */
  latField: string;
  /** Dot-notation path to the longitude value (alternative to GeoJSON geometry). */
  lonField: string;
  /** Coordinate reference system of the service response (e.g. 'EPSG:4326'). */
  srs: string;
  /**
   * When true, results are filtered client-side to only those whose geometry
   * falls within the current map extent. Useful for geocoders (e.g. ICGC) that
   * do not support server-side bbox filtering.
   * Configurable from admin: set 'filterByExtent' = 'true'.
   */
  filterByExtent: boolean;
  /**
   * When true, results are filtered client-side to only those whose municipality code
   * starts with the territory's INE code. Useful to restrict geocoder results to the
   * configured territory without relying on geographic extent.
   * Configurable from admin: set 'enableServiceParams' = 'true'.
   */
  enableServiceParams: boolean;
  /**
   * List of service parameters. Each entry sends a request parameter to the server
   * with the resolved territory field value (server-side filtering).
   */
  municipalityCodeFilters: MunicipalityCodeFilter[];
}

/**
 * A single territory code filter entry.
 * Sends a server-side request parameter with the resolved territory field value.
 */
export interface MunicipalityCodeFilter {
  /** Query parameter name to send to the server (e.g. 'id_municipi'). Empty = not sent. */
  requestParam: string;
  /**
   * Territory field token used as the parameter value, or a literal value.
   * Known tokens: 'territory_code' (INE code), 'territory_name' (territory name).
   * Any other non-empty string is used as a literal value.
   * Empty = use 'territory_code' automatically.
   */
  territoryField: string;
  /**
   * When true and territoryField is 'territory_center_x' or 'territory_center_y',
   * the coordinate is reprojected from the map CRS to the specified targetCrs before being sent.
   * 'territory_center_x' → first coordinate (e.g. longitude), 'territory_center_y' → second (e.g. latitude).
   */
  convertProjection?: boolean;
  /** Target CRS for reprojection when convertProjection is true (e.g. 'EPSG:4326'). */
  targetCrs?: string;
}

/**
 * Default parsing config applied when the task carries no parameters.
 * Matches the Nominatim/GeoJSON response format.
 */
export const DEFAULT_TASK_CONFIG = {
  resultsPath: '',
  labelField: '',
  geometryField: 'geometry',
  latField: '',
  lonField: '',
  srs: 'EPSG:4326',
  // false = return all results regardless of map extent (global geocoders).
  // true  = filter client-side so only results within the current map view are shown.
  filterByExtent: false,
  enableServiceParams: false,
  municipalityCodeFilters: [] as MunicipalityCodeFilter[]
} as const;

/**
 * Resolves a dot-notation path within an object.
 * e.g. getByPath({a: {b: 1}}, 'a.b') === 1
 */
export function getByPath(obj: any, path: string): any {
  if (!path || obj == null) return obj;
  return path.split('.').reduce((curr, key) => (curr == null ? undefined : curr[key]), obj);
}

/** Module-level cache of locator tasks for use in non-Angular control logic. */
let _tasks: LocatorTask[] = [];

/**
 * Get the current locator tasks (for use outside Angular DI).
 */
export function getLocatorTasks(): LocatorTask[] {
  return _tasks;
}

/**
 * Set the locator tasks cache (called by LocatorService after initialization).
 */
export function setLocatorTasks(tasks: LocatorTask[]): void {
  _tasks = tasks;
}

// Module-level cache for the territory extent from AppCfg (authoritative SITMUN territory bounds).
let _territoryExtent: [number, number, number, number] | null = null;

/**
 * Returns the territory extent in the map's native CRS as defined by the SITMUN backend.
 * This is the authoritative territory bounds, independent of what the map currently shows.
 */
export function getTerritoryExtent(): [number, number, number, number] | null {
  return _territoryExtent;
}

// Module-level cache for the territory INE code from AppCfg.
let _territoryCode: string | null = null;

/**
 * Returns the territory geographic code (INE code) as defined in the SITMUN backend.
 * Used to filter geocoder results by municipality code.
 */
export function getTerritoryCode(): string | null {
  return _territoryCode;
}

// Module-level cache for the territory name from AppCfg.
let _territoryName: string | null = null;

/**
 * Returns the territory name as defined in the SITMUN backend.
 */
export function getTerritoryName(): string | null {
  return _territoryName;
}

let _territoryDescription: string | null = null;
export function getTerritoryDescription(): string | null { return _territoryDescription; }

let _territoryAuthorityName: string | null = null;
export function getTerritoryAuthorityName(): string | null { return _territoryAuthorityName; }

let _territoryAuthorityAddress: string | null = null;
export function getTerritoryAuthorityAddress(): string | null { return _territoryAuthorityAddress; }

let _territoryTypeName: string | null = null;
export function getTerritoryTypeName(): string | null { return _territoryTypeName; }

let _territoryCenterX: string | null = null;
export function getTerritoryCenterX(): string | null { return _territoryCenterX; }

let _territoryCenterY: string | null = null;
export function getTerritoryCenterY(): string | null { return _territoryCenterY; }

/**
 * Execute a locator search using the task's URL template and parsing config.
 * @param task         The locator task (URL template + parsing config).
 * @param searchText   The text entered by the user.
 * @param templateVars Optional map of template variable values ({bbox}, {focus_lat}, {focus_lon}…).
 */
export async function executeLocatorSearch(
  task: LocatorTask,
  searchText: string,
  templateVars: Record<string, string> = {},
  extraQueryParams: Record<string, string> = {}
): Promise<any[]> {
  let url: string;

  // Tasks that go through the SITMUN proxy append params as query parameters.
  // 'API' = HTTP external API via proxy; 'SQL' = database query via proxy.
  // 'URL' / 'RESOURCE' = direct calls where the viewer substitutes placeholders itself.
  const isProxyTask = task.scope === 'API' || task.scope === 'SQL';

  if (isProxyTask) {
    // Proxy mode: the SITMUN proxy expands template variables in the command URL server-side.
    // The viewer appends search text, template vars and any extra params as query parameters.
    const params = new URLSearchParams({ text: searchText, ...templateVars, ...extraQueryParams });
    url = `${task.url}?${params.toString()}`;
  } else {
    // Direct mode (scope URL / RESOURCE): substitute all placeholders client-side.
    url = task.url.replace(/\{text\}/gi, encodeURIComponent(searchText));
    for (const [key, value] of Object.entries(templateVars)) {
      url = url.replace(new RegExp(String.raw`\{${key}\}`, 'gi'), value);
    }
    // Append extra query params (e.g. server-side municipality filter) to the URL.
    const extraStr = new URLSearchParams(extraQueryParams).toString();
    if (extraStr) {
      url += (url.includes('?') ? '&' : '?') + extraStr;
    }
  }
  try {
    // Proxy tasks always need the session cookie; direct calls use public APIs → omit.
    const credentials: RequestCredentials = isProxyTask ? 'include' : 'omit';
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      credentials
    });
    if (!response.ok) {
      console.warn('[LocatorService] Search request failed:', response.status);
      return [];
    }
    const data = await response.json();
    const raw = getByPath(data, task.resultsPath);
    if (Array.isArray(raw)) return raw;
    if (raw != null) return [raw];
    // SQL tasks return a flat array at root; if the configured resultsPath doesn't
    // resolve (e.g. default 'features' on a flat array), fall back to the root data.
    if (Array.isArray(data)) return data;
    return [];
  } catch (error) {
    console.error('[LocatorService] Search error:', error);
    return [];
  }
}

/**
 * Service for handling Locator functionality.
 * Stores all locator tasks and exposes search execution.
 */
@Injectable({
  providedIn: 'root'
})
export class LocatorService {
  private tasks: LocatorTask[] = [];

  initialize(config: AppCfg): void {
    this.tasks = [];
    // Store the territory extent from the SITMUN backend config.
    // This is in the map's native CRS (application.srs) and is the authoritative extent
    // of the current application's territory — independent of what the map renders.
    _territoryExtent = config?.application?.initialExtent ?? null;
    _territoryCode = config?.application?.territoryCode ?? null;
    _territoryName = config?.application?.territoryName ?? null;
    _territoryDescription = config?.application?.territoryDescription ?? null;
    _territoryAuthorityName = config?.application?.territorialAuthorityName ?? null;
    _territoryAuthorityAddress = config?.application?.territorialAuthorityAddress ?? null;
    _territoryTypeName = config?.application?.territoryTypeName ?? null;
    const _poi = config?.application?.pointOfInterest;
    _territoryCenterX = _poi?.x != null ? String(_poi.x) : null;
    _territoryCenterY = _poi?.y != null ? String(_poi.y) : null;
    if (!config?.tasks) {
      return;
    }
    config.tasks.forEach((task: any) => {
      if (task['ui-control'] !== 'sitmun.locator') {
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
        latField: p.latField ?? DEFAULT_TASK_CONFIG.latField,
        lonField: p.lonField ?? DEFAULT_TASK_CONFIG.lonField,
        srs: p.srs ?? DEFAULT_TASK_CONFIG.srs,
        filterByExtent: p.filterByExtent === 'true' || p.filterByExtent === true,
        enableServiceParams: p.enableServiceParams === 'true' || p.enableServiceParams === true
          || p.filterByMunicipalityCode === 'true' || p.filterByMunicipalityCode === true,
        municipalityCodeFilters: (() => {
          try {
            const raw = p.municipalityCodeFilters;
            if (typeof raw === 'string' && raw) return JSON.parse(raw) as MunicipalityCodeFilter[];
          } catch {}
          return DEFAULT_TASK_CONFIG.municipalityCodeFilters;
        })()
      });
    });
    setLocatorTasks(this.tasks);
  }
}
