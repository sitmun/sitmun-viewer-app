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

import { getLocalizerTasks, LocalizerTask, executeLocalizerSearch, getByPath } from '../../services/localizer.service';

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

/** Identifier of the temporary vector layer used to highlight the selected result on the map. */
const LOCALIZER_RESULT_LAYER_ID = 'sitmun-localizer-result';

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
  /** Cached reference to the temporary vector layer used to draw selected results. */
  _resultLayer: any;
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
    this.control._resultLayer = null;

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

    // Clear previous results and any highlighted geometry
    this.clearResults();
    this.clearResultLayer();

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

    this.clearResults();
    this.setLoading(true);

    try {
      // In proxy mode, bbox is always sent if available (proxy expands {bbox} in the command URL).
      // In direct mode, bbox is only fetched if {bbox} is present in the URL template.
      const needsBbox = task.scope === 'API' || task.url.includes('{bbox}');
      const mapBbox = needsBbox ? this.getMapBbox() : undefined;
      let results = await executeLocalizerSearch(task, searchText, mapBbox ?? undefined);
      if (task.filterByExtent) {
        results = this.filterResultsByMapExtent(results, task);
      }
      this.renderResults(results, task);
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Returns the native CRS of the map, trying the getCrs() method first,
   * then the .crs property, falling back to EPSG:25831 (default for Catalonia/Balearics).
   */
  private getMapCrs(): string {
    const map = this.control.map;
    if (!map) return 'EPSG:25831';
    if (typeof map.getCrs === 'function') return map.getCrs();
    if (map.crs) return map.crs;
    return 'EPSG:25831';
  }

  /**
   * Filters results to only those whose geometry point falls within the current map extent.
   * Reprojects result coordinates from task.srs to the map's CRS using proj4 (available
   * globally via the SITNA library) if the two CRS differ.
   */
  private filterResultsByMapExtent(results: any[], task: LocalizerTask): any[] {
    const map = this.control.map;
    if (!map) return results;

    const ext = this.getRawMapExtent();
    if (!ext) return results;

    const [xMin, yMin, xMax, yMax] = ext;
    const mapCrs: string = this.getMapCrs();
    const taskSrs: string = task.srs || 'EPSG:4326';

    return results.filter((item) => {
      const geom = task.geometryField ? getByPath(item, task.geometryField) : null;
      let lon: number | undefined;
      let lat: number | undefined;

      if (geom?.type?.toLowerCase() === 'point' && Array.isArray(geom.coordinates)) {
        [lon, lat] = geom.coordinates;
      } else if (task.lonField && task.latField) {
        lon = Number(getByPath(item, task.lonField));
        lat = Number(getByPath(item, task.latField));
      }

      if (lon == null || lat == null || Number.isNaN(lon) || Number.isNaN(lat)) return true; // no coords → keep

      // Reproject to map CRS if needed
      let x = lon;
      let y = lat;
      if (mapCrs !== taskSrs) {
        try {
          const util = (globalThis as any).TC?.Util;
          if (typeof util?.reproject === 'function') {
            [x, y] = util.reproject([lon, lat], taskSrs, mapCrs);
          }
        } catch {
          return true; // reprojection failed → keep the result
        }
      }

      return x >= xMin && x <= xMax && y >= yMin && y <= yMax;
    });
  }

  private setLoading(loading: boolean): void {
    this.control._isLoading = loading;
    const indicator = this.control.div?.querySelector<HTMLElement>('.tc-ctl-loc-loading');
    if (indicator) {
      indicator.style.display = loading ? 'block' : 'none';
    }
    // NOTE: the results list visibility is managed exclusively by renderResults() and
    // clearResults(). Do not touch it here to avoid overwriting their display decisions.
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
      const label = this.extractLabel(item, task);
      const li = document.createElement('li');
      li.className = 'tc-ctl-loc-result-item';
      li.textContent = label;
      li.addEventListener('click', () => this.handleResultClick(item, task));
      resultsList.appendChild(li);
    });
  }

  private extractLabel(item: any, task: LocalizerTask): string {
    if (typeof item === 'string') return item;
    if (task.labelField) {
      const val = getByPath(item, task.labelField);
      if (val != null) return String(val);
    }
    return (
      item.label ??
      item.name ??
      item.nom ??
      item.title ??
      JSON.stringify(item)
    );
  }

  private handleResultClick(item: any, task: LocalizerTask): void {
    const map = this.control.map;
    if (!map) { console.warn('[LocalizerControl] handleResultClick: map not available'); return; }

    // Draw the geometry as a temporary feature on the map (async, does not block zoom)
    this.drawResultGeometry(item, task);

    // 1. Prefer bbox (shows the full area, better UX)
    if (task.bboxField) {
      const rawBbox = getByPath(item, task.bboxField);
      const bbox = this.parseBbox(rawBbox);
      if (bbox) {
        this.zoomToBbox(map, bbox, task.srs || 'EPSG:4326');
        return;
      }
    }

    // 2. GeoJSON geometry field
    if (task.geometryField) {
      const geom = getByPath(item, task.geometryField);
      if (geom?.coordinates) {
        this.zoomToGeometry(map, geom, task.srs || 'EPSG:4326');
        return;
      }
    }

    // 3. Explicit lat/lon fields
    if (task.latField && task.lonField) {
      const lat = getByPath(item, task.latField);
      const lon = getByPath(item, task.lonField);
      if (lat != null && lon != null) {
        this.zoomToPoint(map, Number(lon), Number(lat), task.srs || 'EPSG:4326');
      }
    }
  }

  // ---- Result geometry drawing ----

  /**
   * Lazily creates (or retrieves) the temporary vector layer used to display
   * the selected search result on the map.
   * Returns null if the SITNA vector layer API is not available.
   */
  private async getOrCreateResultLayer(): Promise<any> {
    const map = this.control.map;
    if (!map) return null;

    if (this.control._resultLayer) return this.control._resultLayer;

    // Recover reference if the layer was already added to the map (e.g. after re-render)
    if (typeof map.getLayer === 'function') {
      const existing = map.getLayer(LOCALIZER_RESULT_LAYER_ID);
      if (existing) {
        this.control._resultLayer = existing;
        return existing;
      }
    }

    try {
      // TC.Consts.layerType.VECTOR is the string 'vector'; use it as fallback if TC is not global
      const TC = (globalThis as any).TC;
      const vectorType: string = TC?.Consts?.layerType?.VECTOR ?? 'vector';
      const layer = await map.addLayer({
        id: LOCALIZER_RESULT_LAYER_ID,
        type: vectorType
      });
      this.control._resultLayer = layer;
      return layer;
    } catch (err) {
      console.warn('[LocalizerControl] Could not create result layer:', err);
      return null;
    }
  }

  /** Removes all features from the temporary result layer without destroying it. */
  private clearResultLayer(): void {
    const layer = this.control._resultLayer;
    if (layer && typeof layer.clearFeatures === 'function') {
      layer.clearFeatures();
    }
  }

  /**
   * Reprojects coordinates from one CRS to another using SITNA's bundled proj4 (TC.Util.reproject).
   * Supports single points [x, y], arrays of points, and deeper nested arrays (rings, polygons).
   * Returns original coords unchanged if TC.Util is not available.
   */
  private reprojectCoords(coords: number[], fromSrs: string, toSrs: string): number[] {
    if (!fromSrs || !toSrs || fromSrs === toSrs) return coords;
    try {
      const util = (globalThis as any).TC?.Util;
      if (typeof util?.reproject === 'function') return util.reproject(coords, fromSrs, toSrs);
    } catch { /* ignore */ }
    return coords;
  }

  /**
   * Draws the geometry of a search result item as a temporary feature on the map.
   * Clears any previously drawn result before drawing the new one.
   * Silently does nothing if the map or SITNA vector API is unavailable.
   * Coordinates are reprojected to the map CRS via TC.Util.reproject before drawing.
   */
  private async drawResultGeometry(item: any, task: LocalizerTask): Promise<void> {
    const map = this.control.map;
    if (!map) return;

    const taskSrs: string = task.srs || 'EPSG:4326';
    const layer = await this.getOrCreateResultLayer();
    if (!layer) return;

    layer.clearFeatures();

    const geom = task.geometryField ? getByPath(item, task.geometryField) : null;
    if (geom?.type && geom.coordinates) {
      await this.drawGeoJsonGeometry(layer, geom, taskSrs);
      return;
    }

    // Fallback: explicit lat/lon fields
    if (task.latField && task.lonField) {
      const lat = Number(getByPath(item, task.latField));
      const lon = Number(getByPath(item, task.lonField));
      if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
        // addMarkerToLayer reprojects from taskSrs to map CRS via TC.Util.reproject
        await this.addMarkerToLayer(layer, [lon, lat], taskSrs);
      }
    }
  }

  /** Adds a marker to a SITNA vector layer, reprojecting from crs to the map CRS if needed. */
  private async addMarkerToLayer(layer: any, coords: number[], crs: string): Promise<void> {
    const mapCrs = this.getMapCrs();
    const mapCoords = crs === mapCrs ? coords : this.reprojectCoords(coords, crs, mapCrs);
    await layer.addMarker(mapCoords);
  }

  /**
   * Dispatches a GeoJSON geometry to the appropriate SITNA vector layer method.
   * Handles Point, LineString, Polygon and their Multi* variants.
   * Reprojects all coordinates to the map CRS via TC.Util.reproject before drawing.
   */
  private async drawGeoJsonGeometry(layer: any, geom: any, crs: string): Promise<void> {
    const type = (geom.type ?? '').toLowerCase();
    const mapCrs = this.getMapCrs();
    // TC.Util.reproject handles any nesting depth (point, ring, polygon, multipolygon).
    let coords = geom.coordinates;
    if (crs !== mapCrs) {
      try {
        const util = (globalThis as any).TC?.Util;
        if (typeof util?.reproject === 'function') coords = util.reproject(coords, crs, mapCrs);
      } catch { /* ignore — draw at original coords if reprojection unavailable */ }
    }
    switch (type) {
      case 'point': await layer.addMarker(coords); break;
      case 'linestring': await layer.addPolyline(coords); break;
      case 'polygon': await layer.addPolygon(coords); break;
      case 'multipoint':
        for (const c of coords as number[][]) await layer.addMarker(c);
        break;
      case 'multilinestring': await layer.addMultiPolyline(coords); break;
      case 'multipolygon': await layer.addMultiPolygon(coords); break;
    }
  }

  /**
   * Parses a bbox value that may be either a number[] or a comma-separated string.
   * Returns a [xmin, ymin, xmax, ymax] number array, or null if invalid.
   */
  private parseBbox(raw: any): number[] | null {
    if (Array.isArray(raw) && raw.length >= 4) {
      const nums = raw.slice(0, 4).map(Number);
      return nums.every(n => !Number.isNaN(n)) ? nums : null;
    }
    if (typeof raw === 'string') {
      const parts = raw.split(',').map(Number);
      if (parts.length >= 4 && parts.every(n => !Number.isNaN(n))) return parts.slice(0, 4);
    }
    return null;
  }

  /**
   * Zooms the map to a bounding box [west, south, east, north].
   * Reprojects from srs to the map's native CRS using TC.Util.reprojectExtent.
   * SITNA's setExtent requires coordinates in the map's native CRS — it ignores any { crs } option.
   */
  private zoomToBbox(map: any, bbox: number[], srs = 'EPSG:4326'): void {
    if (typeof map.setExtent !== 'function') return;
    const mapCrs = this.getMapCrs();
    let extent: number[] = bbox.slice(0, 4);
    if (srs !== mapCrs) {
      try {
        const util = (globalThis as any).TC?.Util;
        if (typeof util?.reprojectExtent === 'function') {
          extent = util.reprojectExtent(extent, srs, mapCrs);
        }
      } catch { /* ignore — zoom at original coords if reprojection unavailable */ }
    }
    map.setExtent(extent);
  }

  /**
   * Zooms the map to a single coordinate by building a small bounding box around it.
   * Uses a degree-based buffer for geographic CRS and a metre-based one for projected CRS.
   * If the coordinates are clearly in geographic range (|x| ≤ 180, |y| ≤ 90) but the
   * declared SRS is projected, the SRS is overridden to EPSG:4326 so that reprojection
   * is applied correctly (guards against mis-configured task.srs).
   */
  private zoomToPoint(map: any, x: number, y: number, srs: string): void {
    const effectiveSrs = this.detectActualSrs(x, y, srs);
    const isGeographic = /4326|4258|4269|CRS84/i.test(effectiveSrs);
    const buffer = isGeographic ? 0.005 : 500;
    this.zoomToBbox(map, [x - buffer, y - buffer, x + buffer, y + buffer], effectiveSrs);
  }

  /**
   * If the coordinates fall clearly within geographic range (±180° lon, ±90° lat)
   * but the declared SRS is projected (not geographic), returns 'EPSG:4326'.
   * This protects against task.srs being mis-configured.
   */
  private detectActualSrs(x: number, y: number, declaredSrs: string): string {
    const isDeclaredGeographic = /4326|4258|4269|CRS84/i.test(declaredSrs);
    if (!isDeclaredGeographic && Math.abs(x) <= 180 && Math.abs(y) <= 90) {
      console.warn(
        `[LocalizerControl] Coordinates [${x}, ${y}] look geographic but task.srs is "${declaredSrs}". ` +
        'Treating as EPSG:4326. Fix task.srs in the admin configuration.'
      );
      return 'EPSG:4326';
    }
    return declaredSrs;
  }

  /**
   * Zoom to a GeoJSON geometry.
   * Point: zooms with a small buffer. Polygon/LineString/Multi*: computes bbox and zooms to it.
   */
  private zoomToGeometry(map: any, geom: any, srs = 'EPSG:4326'): void {
    const type = (geom.type ?? '').toLowerCase();
    const coords = geom.coordinates;
    if (!coords) return;

    if (type === 'point') {
      this.zoomToPoint(map, coords[0], coords[1], srs);
      return;
    }

    let ring: number[][];
    if (type === 'polygon') {
      ring = coords[0];
    } else if (type === 'multipolygon') {
      ring = coords[0][0];
    } else {
      ring = coords;
    }
    if (!Array.isArray(ring) || ring.length === 0) return;
    const xs = ring.map((c: number[]) => c[0]);
    const ys = ring.map((c: number[]) => c[1]);
    const effectiveSrs = this.detectActualSrs(xs[0], ys[0], srs);
    this.zoomToBbox(map, [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], effectiveSrs);
  }

  /**
   * Returns the current map extent as [xMin, yMin, xMax, yMax] in the map's native CRS,
   * or null if the map API does not expose extent information.
   */
  private getRawMapExtent(): [number, number, number, number] | null {
    const map = this.control.map;
    if (!map) return null;
    try {
      if (typeof map.getExtent === 'function') {
        const ext = map.getExtent();
        if (Array.isArray(ext) && ext.length >= 4) {
          return [ext[0], ext[1], ext[2], ext[3]];
        }
      }
    } catch {
      // Map API does not expose extent
    }
    return null;
  }

  /**
   * Returns the current map extent as 'west,south,east,north' for {bbox} URL substitution.
   * Returns null if the map API does not expose extent information.
   */
  private getMapBbox(): string | null {
    const ext = this.getRawMapExtent();
    return ext ? `${ext[0]},${ext[1]},${ext[2]},${ext[3]}` : null;
  }
}

// ============================================================================
// Prototype Wrappers
// ============================================================================

export const prototypeWrappers =
  createPrototypeWrappers<LocalizerControlInstance>(LocalizerControlLogic);
