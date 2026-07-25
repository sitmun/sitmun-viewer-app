# Changelog

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Map / MIA**: More Info Advanced render POST sends map-session `appId`/`terId` and current UI `lang` query param; rendered HTML sanitize allows iframes; popup overlay is resizable with scrollable panels ([#162](https://github.com/sitmun/sitmun-viewer-app/pull/162)).
- **Tests**: Jest covers MIA render `lang` + coords contract and iframe-preserving `sanitizeMiaRenderedHtml`.
- **Map**: basemap selector includes **No base map** (empty SITNA VECTOR base layer) so users can clear the raster background while keeping operational layers ([#167](https://github.com/sitmun/sitmun-viewer-app/issues/167)).
- **Map**: Capas and Capas disponibles are a paired stack (excluded from tools-panel accordion mutual exclusion; BMS/click-tools still accordion); Capas starts collapsed and opens to the full first work-layer row when a layer is added; splitter appears only when Capas has layers; Capas drag keeps ≥160px for Capas disponibles; locked height clears when Capas is collapsed/empty (`localStorage` `sitmun.toolsPanel.paneHeights`) ([#142](https://github.com/sitmun/sitmun-viewer-app/issues/142)).
- **Languages**: toolbar/menu switcher omits languages with `enabled: false` from `GET /api/languages`.
- **Language chrome**: toolbar control left of the hamburger (and beside expand when the map bar is collapsed) shows closed BCP-47 ISO and open API endonyms; landing language is `localStorage` → STM_CONF `language.default` → static; language entry removed from the hamburger menu.
- **Map**: multi-tree apps default to the lowest `trees[].order`; Capas disponibles shows an icon-only **Cambiar tema** toolbar control (not `sitna-toggle`); current tree name is on the button tooltip via localized `currentTopic`.
- **Map**: non-radio cartography leaves show a `sitmun-lcat-leaf-load` checkbox that loads/unloads the working layer; radio leaves keep radios; folders no longer use italic as a loaded-state cue ([#45](https://github.com/sitmun/sitmun-viewer-app/issues/45)).
- **Map**: catalog load checkboxes sync via the `checked` property only (no HTML `checked` attribute) so leaving search after adding a layer does not open SITNA’s empty info modal ([#45](https://github.com/sitmun/sitmun-viewer-app/issues/45)).
- **Map**: Capas disponibles tree stamps `data-sitmun-lcat-zebra` on visible rows (skips collapsed descendants) and paints zebra as a single-row band (not nested branch fills) ([#45](https://github.com/sitmun/sitmun-viewer-app/issues/45)).
- **Map**: catalog meta toggles are stamped `data-sitmun-lcat-meta` with Material Icons `article` trailed after the title; Capas GFI uses Sitna `--icon-info` (“i”, SITMUN 2 identify) so meta no longer shares that glyph ([#45](https://github.com/sitmun/sitmun-viewer-app/issues/45)).
- **Map**: Capas (WorkLayerManager) GFI `sitna-toggle.sitmun-wlm-gfi` (Sitna `--icon-info`) toggles per-layer GetFeatureInfo via `layer.options.sitmunGfiEnabled` (default on for queryable leaves); map-click identify honors the flag through `getInfo().queryable`; muted/non-interactive when the layer is hidden or out of scale while preserving the user’s choice; tooltip/`aria-label` use `workLayerManager.gfi.*` i18n (en/es/ca/fr/oc-aranes) and refresh on language change (root Playwright WLM-tools coverage remains a gap) ([#45](https://github.com/sitmun/sitmun-viewer-app/issues/45)).
- **Map**: catalog folder/leaf type icons use a vertically centered `background-position` in the row content band so they share the select/title/GFI/meta midline ([#45](https://github.com/sitmun/sitmun-viewer-app/issues/45)).
- **Map**: `loadData` folders show a visible `sitmun-lcat-load` control (checkbox, or radio when the folder is radio); title only expands/collapses. Click toggles the folder from map `workLayers` + claims (any loaded → unload all leaves; none → load all / first radio child). Partial non-radio selection uses `indeterminate` ([#45](https://github.com/sitmun/sitmun-viewer-app/issues/45)). Composite single WorkLayerManager entry remains [#166](https://github.com/sitmun/sitmun-viewer-app/issues/166).
- **Map**: `CatalogLayerSelectionService` per-map `runExclusive` gate, pending node set, and `reconcileClaimsToLoaded` keep catalog claims aligned with work layers under async add/remove.
- **Map**: catalog shows a spinner after the layer title from add click until Capas (WorkLayerManager) renders the row — not only until `map.addLayer` commits ([#45](https://github.com/sitmun/sitmun-viewer-app/issues/45)).
- **Map**: catalog shows a Material `warning` after the title when a layer fails to load (`LAYERERROR` / tile failure); cleared when a later load reaches Capas ([#45](https://github.com/sitmun/sitmun-viewer-app/issues/45)).
- **Map**: catalog loading spinner and load-failed warning use `title` / `aria-label` from `layerCatalog.loading` and `layerCatalog.loadFailed` (refresh on language change) ([#45](https://github.com/sitmun/sitmun-viewer-app/issues/45)).
- **Application details**: shows `responsibleInstitutionName` and `pointOfContact` independently when the client API provides them; blocked or ineligible PoC emails are omitted by the backend only ([sitmun-admin-app#316](https://github.com/sitmun/sitmun-admin-app/issues/316)).
- **E2E**: same-origin `/backend` and `/middleware` serve profile for root Playwright viewer/proxy tests.
- **E2E**: root `viewer-catalog` Playwright project covers layer-catalog radio inputs, visible `loadData` folder load controls, and trailing meta (Material `article`) order on a seeded queryable leaf ([#45](https://github.com/sitmun/sitmun-viewer-app/issues/45)). Capas trash-then-clear after partial WLM remove is covered by viewer Jest (Playwright leaf load under WMS stubs remains a gap).
- **E2E**: root `viewer-legend` Playwright project covers Capas + Legend task symbology when the WMS stub denies DescribeLayer and serves Style/LegendURL on `/legend` ([#164](https://github.com/sitmun/sitmun-viewer-app/issues/164)).
- **Tests**: `api-sitna-meters-per-unit-upstream.spec.ts` characterizes the api-sitna WKT `"meter"` vs OpenLayers `METERS_PER_UNIT.m` miss that yields legend `SCALE=NaN` (for upstream reporting; remove viewer workaround when this assertion flips) ([#152](https://github.com/sitmun/sitmun-viewer-app/issues/152)).

### Fixed

- **Map / MIA**: GetFeatureInfo targeting uses only layers whose cartography has MIA parents, prefers FeatureInfo `currentFeature` when it belongs to such a layer, and re-renders when the active FI feature changes.
- **Map / MIA**: overlay chrome (title, close, loading, empty) uses `mia.*` ngx-translate keys; close control follows SITNA `sitna-button.tc-ctl-popup-close` (toolbar drag skips `sitna-button` so close `pointerup` is not stolen by `setPointerCapture`).
- **Map / MIA**: in-flight render cancel + generation guard; late identify responses cannot overwrite a newer open or a closed overlay.
- **Map**: `ControlHandler.onMapClear` / `ControlRegistry.clearMapArtifacts` run light map-rebuild teardown (MIA overlay + LayerCatalog per-map state) without restoring patches; `AbstractMap.clearMap` no longer hardcodes those handlers.
- **Map**: Capas open/drag floor measures the full work-layer LI (path/title/type/tools), not `.tc-ctl-wlm-input` alone; expanded details still do not raise the floor ([#142](https://github.com/sitmun/sitmun-viewer-app/issues/142)).
- **Map**: When cartography `queryableFeatureEnabled` is false, profile merge sets GetCapabilities `queryable` false on the matched WMS layer **and all nested descendants** (SITNA FeatureInfo expands groups via `getDisgregatedLayerNames`); layer add also sets `sitmunGfiEnabled` from the profile so identify stays off.
- **Map**: Tree node consultable (`queryableActive`) off blocks Capas GFI and map-click identify (`sitmunGfiEnabled=false`), even when cartography still has `queryableFeatureEnabled` true.
- **Map**: Legend task (`sitna.legend`) falls back to capabilities `Style/LegendURL` (same source as Capas “i”) when SITNA `Raster.getLegend` fails or returns empty — covers ArcGIS/DiBa WMS that deny `DescribeLayer` ([#164](https://github.com/sitmun/sitmun-viewer-app/issues/164)).
- **Map**: Legend control retries `updateLayerTree` when Style/LegendURL is present but the layer node was skipped (SITNA sticky `layerLoaded` / late caps), and refreshes symbology when the left Legend drawer opens after layers were already loaded ([#164](https://github.com/sitmun/sitmun-viewer-app/issues/164)).
- **Map**: FeatureInfo DescribeLayer safety fallback includes `layerName` so `getLegend` does not throw when that wrapper is active ([#164](https://github.com/sitmun/sitmun-viewer-app/issues/164)).
- **Map**: Capas out-of-scale rows (`tc-ctl-wlm-elm-notvisible`) use `#777777` for path/lyr/type so titles are not stuck on maroon `#660000` ([#92](https://github.com/sitmun/sitmun-viewer-app/issues/92)).
- **Map**: Capas and Capas disponibles share the tools-panel column without overlap; Capas list scrolls inside the pane whenever rows exceed the Capas height ([#142](https://github.com/sitmun/sitmun-viewer-app/issues/142)).
- **Map**: left map chrome keeps desktop stack order without overlap at 480/768/1024 (tools/legend/fscreen/Street View/home/zoom+/slider/zoom−/3D); opaque tools/legend/fscreen; search stays right of the tools icon; Capas 40×40 top-right and overview 40×40 bottom-right; Street View and 3D hide under 480px width ([#135](https://github.com/sitmun/sitmun-viewer-app/issues/135)).
- **Map**: WMS legend GetLegendGraphic keeps a finite OGC `SCALE` on WKT-registered metre CRS (e.g. EPSG:3763) by coercing SITNA `getMetersPerUnit` when OpenLayers `METERS_PER_UNIT` misses `"meter"` ([#152](https://github.com/sitmun/sitmun-viewer-app/issues/152)).
- **Language chrome**: toolbar language control uses the same ink as the hamburger (inherit + orange hover; white on login); collapsed-bar control stays white beside expand.
- **Language chrome**: language menu width follows the longest endonym instead of inheriting the hamburger menu’s 360px min-width.
- **Languages**: navigation bar subscribes to `LanguageService.languagesToUse$` and re-fetches enabled/order when the language menu opens so admin enable/order changes appear without a full reload.
- **Map**: multi-tree Capas disponibles **Cambiar tema** is a 24×24px control clustered immediately left of the search/tree switch (`right: 54px`, 6px gap); inline SVG with forced `stroke:#111`; tooltip ignores unresolved `currentTopic` locale keys.
- **Map**: multi-tree Capas disponibles header: **Cambiar tema** is a neutral icon-only square left of SITNA’s search/tree-view switch (was zero-sized because `font-size:0` collapsed `em` layout); topic badge removed in favor of the button tooltip.
- **Map**: catalog `LAYERERROR` (including during self-commit add) unwraps the event `layer`, removes Capas rows for that `nodeId`, and clears claims so a failed load is not left in WorkLayerManager ([#45](https://github.com/sitmun/sitmun-viewer-app/issues/45)).
- **Map**: restricted WMS tiles that fail after Capas add (`TILELOADERROR` 401/403 and other non-404 errors) remove the Capas row and clear catalog claims (SITNA only toasts; it does not fire `LAYERERROR`) ([#45](https://github.com/sitmun/sitmun-viewer-app/issues/45)).
- **Map**: Capas drops zombie rows when `map.removeLayer` races SITNA’s async WorkLayerManager `updateLayerTree` insert (abort late elm HTML; scrub orphan LIs via MutationObserver) ([#45](https://github.com/sitmun/sitmun-viewer-app/issues/45)).
- **Map**: radio `loadData` folder load control stays `type=radio` (repairs stale checkboxes), never shows indeterminate/partial, tracks only resource siblings, and paints as a circle ([#45](https://github.com/sitmun/sitmun-viewer-app/issues/45)).
- **Map**: catalog layer add marks an in-flight slot so concurrent clicks cannot create duplicate Capas rows; orphan work layers are reclaimed without a second `addLayer`. Capas trash cascades remaining duplicates for the same `nodeId` and clears claims so catalog checkboxes stay aligned (and keep their red checked paint) ([#45](https://github.com/sitmun/sitmun-viewer-app/issues/45)).
- **Map**: catalog load/radio controls use custom checked paint instead of `accent-color`, which Chromium drops after programmatic checked sync following Capas load/remove ([#45](https://github.com/sitmun/sitmun-viewer-app/issues/45)).
- **Map**: catalog GFI/meta placement skips DOM moves when already trailed after the title, so the Capas `MutationObserver` does not re-enter and freeze the map on `tc-loading` ([#45](https://github.com/sitmun/sitmun-viewer-app/issues/45)).
- **Map**: catalog rows use level-stamped inset (`rootAlign + level×icon`, level 0/1/2… — nest step is the parent type-icon width) and fixed-width select/GFI controls only when present (no empty spacers); nested branches cancel the parent pad so level padding is not stacked ([#45](https://github.com/sitmun/sitmun-viewer-app/issues/45)).
- **Map**: catalog tree density aligns with SITMUN 2 (`icon`/`control` 16/14, `hit` 18, `gap` 3, `row-min` 20, 11px type) so type icons, select, title, and trailing GFI/meta share one vertical midline; folder expand/collapse hits the type icon and title (not only the chevron strip) ([#45](https://github.com/sitmun/sitmun-viewer-app/issues/45)).
- **Map**: catalog GFI marker is an `<i class="sitmun-lcat-gfi">` so it does not steal SITNA’s `querySelector('span')` title lookup; GFI/meta match Sitna-toggle squares (white fill, 1px black border, half `border-radius`) and flex to the row’s right edge ([#45](https://github.com/sitmun/sitmun-viewer-app/issues/45)).
- **Map**: folder load checkbox no longer re-adds missing leaves when some folder layers were removed from Capas (4→2→6); click clears remaining folder layers. `removePhysicalResources` copies `workLayers` before mutation so multi-remove does not skip entries.
- **Map**: folder load checkbox recovers from stuck `indeterminate` (empty Capas or all leaves loaded): remove work layers by `nodeId`, clear stale pending, and derive leaf set from DOM∩config.
- **Map**: folder unload clears the load control immediately (optimistic) and resyncs after self-commit `LAYERREMOVE` / microtask so it does not stay checked when Capas is empty.
- **Map**: radio+`loadData` folders use a radio-shaped load control (unique name group); catalog CSS aligns load/radio spacing and accent, styles disabled/partial states, and keeps `loadData` folder titles roman under `tc-checked`. The folder load radio stays checked when any child radio is selected (not only the first). Nested `loadData` ancestors (including roots whose LI omits `data-layer-name`) get a load control; extra title padding that widened the icon–control gap was removed.
- **Map**: catalog load/radio controls are `li > label` siblings before the title (icon gutter via shared `--sitmun-lcat-icon` / `--sitmun-lcat-gap` padding); radios are not injected on non-leaf / nested `loadData` folder rows. SITNA collapse chevron kept (title click does not expand).
- **Auth**: login form prevents native submit so SPA password login does not reload the page before the authenticate request completes.

### Security

- **Service worker**: reject empty/root middleware URL path in `isMiddlewareRequest` so the proxy token is not attached to all same-origin requests.
- **Auth**: `publicAuthClearGuard` sends `POST /api/authenticate/logout` without `X-SITMUN-Client` so the backend clears only `viewer_access_token`; admin sessions in other tabs are not affected.

### Added

- **Map**: auto-loads profile layers marked `loadByDefault` from the active catalog into working layers on map open.
- **Map**: cartography-tree radio folders render native radio inputs in the layer catalog; with `loadData`, folder title selects the first ordered child, and re-selecting the active child clears the group.
- **Map**: `CatalogLayerSelectionService` tracks per-map node claims and deduplicated resource reference counts; working layers loaded from the catalog carry explicit `options.nodeId`.
- **Tests**: Jest coverage for dashboard pagination, searchbox behaviour, loading cleanup, dashboard-item resync, auth guards/interceptors, session cleanup ordering, and login modal failed-login feedback.

### Changed

- **Map**: radio folder title activation now requires profile `loadData=true` (migration: existing radio folders need the flag for previous title UX); child radio selection is unchanged ([#45](https://github.com/sitmun/sitmun-viewer-app/issues/45)).
- **i18n**: `application.contact` now means point of contact email; added `application.responsibleInstitution` in all five locales.
- **Map**: default-layer collection traverses the active catalog in profile tree order, deduplicates by cartography resource, and keeps one claim per radio group; per-map WeakMap idempotency replaces the singleton default-load guard.
- **Dashboard search**: autocomplete suggestions refresh while typing; the card grid filters on Enter (or clear) only, so navigation and in-place browsing use separate triggers.

### Fixed

- **Map**: radio folder title clicks are a no-op when the first child is already selected; the handler short-circuits before calling `addLayerToMap`, preventing `prepareSelection` from toggling the selection off; only re-clicking the selected native radio input clears the group.
- **Map**: `getLayerNodes` patch uses `nodeId` as the sole catalog DOM identity; untagged layers with only `layerNames` delegate to the original SITNA implementation without attempting layerNames-based DOM selection.
- **Map**: `withRadioGroupLock` now compares the stored queued promise (not the inner `current` promise) to determine whether the lock is the last in chain; completed locks are reliably removed from `radioGroupLocks`.
- **Map**: catalog `addLayerToMap` returns the live working layer from `map.addLayer`; the already-loaded fast path returns the representative existing layer; non-radio re-clicks preserve SITNA toggle behavior.
- **Map**: self-generated `LAYERERROR` events no longer mutate catalog claims; external radio registration clears pending replacement state; per-map teardown removes radio DOM listeners and search observers.
- **Map**: map load awaits default working layers before resolving; stale `loadId` and destroy-before-loaded guard against late default-layer application; catalog switch applies defaults once to the new map.
- **Map**: radio sibling replacement removes prior physical layers when resource ref counts reach zero, even when the target resource is already loaded.
- **Map**: catalog-generated layer add/remove events no longer double-commit claims; untagged Working Layers removals do not clear catalog selection by `layerNames` alone.
- **Map**: catalog switch tears down per-map selection state and event bridges; search results keep radio checked state in sync with the tree.
- **Map**: catalog composite layers show one Loaded Layers breadcrumb (same UX as single-layer entries) instead of repeating the catalog name per internal WMS layer ([#161](https://github.com/sitmun/sitmun-viewer-app/issues/161)).
- **Map**: control teardown now removes SITNA prototype patches cleanly and allows patched controls to be registered again without stale advice or restoration errors.
- **Map**: layer info modal lists every WMS layer id for composite catalog layers and resolves multilingual service descriptions using the user's selected application language (closest match, otherwise first variant).
- **Map**: layer info modal shows service title from profile `services[].title`, with multilingual WMS `Service.Title` as backup when profile text is absent.
- **Map**: layer info reads cached WMS capabilities without creating a temporary SITNA raster or issuing an extra capabilities request.
- **Service worker**: HTTP viewers preserve configured HTTP middleware URLs for WMS capabilities and map requests while the worker adds proxy authorization.
- **Map**: application background maps follow admin `order` in the basemap selector; SITNA receives sorted `baseLayers` and an explicit `defaultBaseLayer` for the first ordered background ([#428](https://github.com/sitmun/sitmun-admin-app/issues/428)).
- **Auth**: public-route session cleanup (including `/public/**` while logged in), coalesced 401 handling, failed-login feedback without global logout, and logout resilience when pre-access cleanup fails (translated warning instead of raw i18n key).
- **Auth**: passive API `401` responses now validate the main session before clearing client state; only explicit logout clears the shared cookie, avoiding unnecessary cross-tab logout.
- **Service worker**: proxy `401` refreshes the short-lived proxy token and retries one idempotent request, while proxy `403` warns without invalidating the viewer session.
- **Errors**: API error tracking now runs for absolute backend URLs (`…/backend/api/…`); backend `401` responses avoid generic modals and `403` responses show one translated access warning.
- **Dashboard**: infinite scroll uses consistent page metadata and sequential Spring page loading, excluding non-configured application types so load-more does not duplicate, skip, or permanently lock out cards.
- **Dashboard**: server-side keyword search on Enter preserves the searchbox during refresh, clears stale autocomplete spinners, and keeps the active query through load-more; item cards re-sync when Angular reuses instances after language or list reload.

## [1.2.7] - 2026-06-05

### Added

- **Auth**: `publicAuthClearGuard` now protects all `/public/**` routes and clears stale authenticated session state before route activation, preventing anonymous/public pages from resolving as a previous user.
- **Auth**: `AuthenticationService.clearAuthentication()` centralizes backend cookie expiry (`POST /api/authenticate/logout`) plus local cleanup (sessionStorage and IndexedDB proxy token) with caller-visible error propagation.
- **Auth**: `SUPPRESS_AUTH_REDIRECT_ON_401` (`HttpContextToken`) and `suppressAuthRedirectContext()` allow explicit cleanup requests to surface errors without triggering implicit login redirects.
- **Dashboard**: server-side infinite scroll with configurable batch size (`dashboard.initialBatchSize` / `batchIncrement`) and authenticated public/private tabs.
- **Navigation**: shared list/page shell for dashboard, territory, and application sections.
- **Map**: territory `defaultZoomLevel` from client profile is now applied after initial extent fit via SITNA/OpenLayers mapping.
- **Tests**: focused Jest coverage added for `publicAuthClearGuard`, `AuthenticationService.clearAuthentication()`, and interceptor redirect-suppression behavior.

### Changed

- **Auth**: `logout()` now reuses `clearAuthentication()` and only navigates on successful cleanup; failures stay visible to the user.
- **Auth**: `clearSession()` now awaits IndexedDB proxy-token removal before resolving.
- **Dashboard**: search now filters already loaded pages client-side.
- **Navigation**: unified list page layout (dashboard, territory, application).
- **Tests**: Angular/Jest test utilities updated to current providers (`provideHttpClient`, `provideHttpClientTesting`, `provideRouter`) and current HTTP testing error primitives (`ProgressEvent`).
- **Tests**: dashboard fixtures now use `pointOfContact` instead of deprecated `creator`.
- **Toolchain**: TypeScript `~5.8.3`, `@typescript-eslint` 8.54.x, `@types/node` 20.x.
- **TypeScript**: `tsconfig.json` excludes `**/*.spec.ts` from root config (Jest types remain in `tsconfig.spec.json`).
- **Map**: `applyInitialViewAfterLoad` now consistently applies extent then zoom from `GeneralCfg`.

### Removed

- **Dashboard**: legacy pagination/show-more components removed.
- **Cleanup**: unused `ApiModule` and `src/test.ts` removed.

### Fixed

- **Map UI**: panel/i18n labeling issues fixed for tooltips and overview labels ([#137](https://github.com/sitmun/sitmun-viewer-app/issues/137), [#139](https://github.com/sitmun/sitmun-viewer-app/issues/139)).
- **Layer catalog**: duplicate layer loads are blocked and already-added nodes are marked correctly ([#140](https://github.com/sitmun/sitmun-viewer-app/issues/140)).
- **Auth**: public-route auth leakage fixed by expiring stale authenticated cookies before `/public/**` loads.
- **Application details**: API-provided `pointOfContact` is rendered directly (removes incorrect account-lookup fallback) ([#159](https://github.com/sitmun/sitmun-viewer-app/issues/159)).
- **Controls**: left-panel custom controls now expand/collapse correctly when legend is disabled ([#156](https://github.com/sitmun/sitmun-viewer-app/issues/156)).
- **GetFeatureInfo**: identify remains resilient when one active WMS service lacks `DescribeLayer`/GFI compatibility ([#155](https://github.com/sitmun/sitmun-viewer-app/issues/155)).
- **Dashboard**: result list enforces the intended three-application cap ([#145](https://github.com/sitmun/sitmun-viewer-app/issues/145)).
- **ESLint**: fixed unused type-predicate param in `LayerCatalogControlHandler`.
- **Service worker**: IndexedDB sequencing now preserves proxy `Authorization` headers across login, hard refresh, and idle wake-up scenarios.
- **Service worker**: lifecycle handling improved (`clients.claim`, controller-change guard, middleware readiness) to prevent map-bootstrap race conditions.
- **Auth**: proxy token refresh now distinguishes 401 vs 403/network outcomes; session-expiry UX and redirect behavior are explicit ([#256](https://github.com/sitmun/sitmun-viewer-app/issues/256)).
- **Auth**: `AuthenticationInterceptor` no longer intercepts proxy-refresh 401 responses; refresh failures are handled in `AuthenticationService`.
- **Map**: SITNA initial extent is reapplied post-load to prevent initialization drift.

## [1.2.6] - 2026-05-08

### Added

- Route-level `AuthenticationGuard` on `auth`, `public`, and the main shell so protected areas require a session, public areas stay reachable, and login can record a post-login redirect URL.
- `CredentialsInterceptor` so HttpClient sends cookies (`withCredentials`) on same-origin API traffic.
- `AuthenticationInterceptor` to treat HTTP 401 responses: full session reset when the failing call is the logout endpoint, otherwise coordinated logout through `AuthenticationService`.
- `IndexedDbService` for persisting the authorization proxy token and lightweight config keys (for example middleware URL) used by the map stack and service worker integration.
- `MapServiceWorkerService` wiring that stores middleware URL in IndexedDB and posts it to the service worker for proxy-backed map requests.
- OAuth2/OpenID Connect `/callback` route and `CallbackComponent` flow to finish viewer sign-in after the identity provider redirect.
- Jest unit tests for `AuthenticationInterceptor`, `CredentialsInterceptor`, `AuthenticationGuard`, and `IndexedDbService`.
- `LayerCatalogControlHandler.patchLayerCatalogAddLayerToMap` applies per-layer `transparency` (0..100, 0 = opaque) from the client profile as SITNA opacity (`(100 - transparency) / 100`) on the layer returned by `map.addLayer`, so work-layer transparency matches the admin configuration.
- `AppLayer.transparency` and `RealLayerConfig.transparency` carry the profile value through `VirtualWmsCapabilitiesService.findRealLayerConfig`.
- `LayerCatalogControlHandler.patchLayerCatalogAddLayerToMap` applies the profile `order` as SITNA `zIndex` on layer add (`realLayerConfig?.order ?? 0`), so the relative position of catalog-added layers matches the admin configuration. Externally loaded layers (no profile entry) and layers with a null/absent `order` default to `zIndex` 0; SITNA still keeps raster layers below vector layers, and runtime drag-reorder via `WorkLayerManager` bypasses this value.
- `AppLayer.order` and `RealLayerConfig.order` carry the profile value through `VirtualWmsCapabilitiesService.findRealLayerConfig`; `SitnaLayerOptions.zIndex` documents the SITNA option used by `map.addLayer`.
- Layer catalog info: `metadataURL` / `datasetURL` from the client profile and, when absent, OGC `MetadataURL` / `DataURL` from upstream GetCapabilities appear in the info modal; virtual GetCapabilities leaf layers emit the same OGC elements from profile values.
- Layer catalog info modal: metadata/download links use SITNA-oriented list markup (`tc-ctl-lcat-metadata`, `tc-ctl-lcat-dataurl`, `tc-ctl-lcat-info-links`); link labels use MIME-specific i18n only when a declared `Format` exists (OGC or profile object); plain profile URLs use generic metadata/download labels; virtual capabilities omit synthetic `Format` on profile URLs; `Raster.getInfo` patch keeps the info button when only `dataUrl` is returned (matches SITNA LayerCatalog visibility rules).
- Client profile tree nodes may expose optional `metadataURL` / `datasetURL` from backend `NodeDto`.
- `SitnaCapabilitiesInterceptor` (root-scoped) owns the `meld.around` advice on `SITNA.layer.Layer.prototype.getCapabilitiesOnline`. `LayerCatalogControlHandler` and `BasemapSelectorControlHandler` both call `ensurePatched(context)` from `applyBootstrap`; the first call installs the advice and concurrent calls collapse via the cached install promise. Basemap-only apps now receive the same virtual/real GetCapabilities post-processing as catalog-enabled apps.
- `AppLayer.title` and `AppLayer.description` (profile JSON keys) are merged onto matched real WMS GetCapabilities layers as the OGC `Title` and `Abstract` respectively in `RasterLayerService.processWmtCapabilitiesResult` when non-empty (`title` trimmed); WMTS and synthetic catalog unchanged.

### Changed

- Jest: `LayerCatalogControlHandler` specs keep transparency and `order`→`zIndex` coverage in a single `patchLayerCatalogAddLayerToMap` `describe` (shared mocks).
- Jest / ESLint: `TerritoryComponent` spec provides `TranslateService`; `AbstractDashboardComponent` import order satisfies `import/order`.
- Virtual WMS GetCapabilities: profile `minScaleDenominator` / `maxScaleDenominator` are merged via `RasterLayerService.applyVirtualCatalogProfileScaleDenominators` (synthetic catalog only); real fetches use `RasterLayerService.processWmtCapabilitiesResult` (WMTS bbox + scales by `serviceId` / URL and real WMS layer names vs `AppLayer.layers`, plus WMS `Title` / `Abstract` from `AppLayer.title` / `AppLayer.description`).
- `AuthenticationService` session helpers, OIDC entry (`initOidcAuth` / `authorizeOidcUser`), periodic proxy token refresh, and cleanup paths aligned with backend cookie/session behavior.
- GitHub Actions CI uses Node.js 20.19 (aligned with `engines`), runs ESLint, fails the job on test failures, and builds with the `production` Angular configuration instead of the removed `testdeployment` profile.
- Regenerated `package-lock.json` so `npm ci` stays in sync with `package.json`.

## [1.2.5] - 2026-03-11

### Changed

- Release alignment to `1.2.5` across package metadata, environments, and documentation badges.

## [1.2.4] - 2026-03-04

### Changed

- Node.js requirement updated to `>=20.19.0` (engines).
- Angular framework upgraded to version 19 with latest features and performance improvements.
- ESLint configuration migrated from legacy `.eslintrc.js` to flat config `eslint.config.js`.
- Updated ESLint and related dependencies to latest versions.

### Removed

- Removed `.eslintignore` and `.eslintrc.js` legacy configuration files.
- Removed deploy configuration from `angular.json`.

## [1.2.3] - 2026-02-26

### Added

- More Information task support for URL scope, including RFC 6570 URI template handling.
- New centralized More Information handler/service flow for feature-info integration.
- Additional tests for More Information task behavior.

### Changed

- Refactored More Information handling to extract reusable data utilities and reduce duplicated logic.
- Improved URL More Information presentation text for better user understanding.

### Fixed

- Fixed More Information feature-info highlight behavior that prevented table information from being shown correctly.

## [1.2.2] - 2026-02-16

### Added

- Reload map and layer tree when language changes.

### Changed

- Added test coverage for language parameter behavior and improved related test quality.

### Fixed

- Fixed catalog switching state and button visibility after app switch or language change.
- Increased contrast for loaded layers list text.

## [1.2.1] - 2026-02-06

### Added

- OIDC authentication support with dynamically configured providers ([aeccc32](https://github.com/sitmun/sitmun-viewer-app/commit/aeccc32))
- Callback component to handle backend redirection and JWT storage ([aeccc32](https://github.com/sitmun/sitmun-viewer-app/commit/aeccc32))
- Cookie-based JWT transport using ngx-cookie-service for future HttpOnly cookie support ([aeccc32](https://github.com/sitmun/sitmun-viewer-app/commit/aeccc32))
- OIDC provider buttons dynamically rendered below login form ([aeccc32](https://github.com/sitmun/sitmun-viewer-app/commit/aeccc32))
- Translation strings for OIDC authentication flows ([aeccc32](https://github.com/sitmun/sitmun-viewer-app/commit/aeccc32))
- Callback component tests ([7f85deb](https://github.com/sitmun/sitmun-viewer-app/commit/7f85deb))
- Query parameter for proper backend to frontend redirection ([7344785](https://github.com/sitmun/sitmun-viewer-app/commit/7344785))

### Changed

- Improved mobile view for authentication ([ace8b56](https://github.com/sitmun/sitmun-viewer-app/commit/ace8b56))
- Made SITNA paths relative by default ([aeccc32](https://github.com/sitmun/sitmun-viewer-app/commit/aeccc32))
- Enhanced existing authentication code with readonly/keydown attributes and extracted methods ([aeccc32](https://github.com/sitmun/sitmun-viewer-app/commit/aeccc32))

### Fixed

- Cookie removal on logout ([34e35e5](https://github.com/sitmun/sitmun-viewer-app/commit/34e35e5))

## [1.2.0] - 2026-01-27

### Added

- Basemap selector and comparator component with improved UI ([#87](https://github.com/sitmun/sitmun-viewer-app/issues/87)) ([0c5e0b6](https://github.com/sitmun/sitmun-viewer-app/commit/0c5e0b639d0f199175d83429c213e021f4306a45))
- Projection data patch for EPSG coordinate system handling with caching support ([6504b56](https://github.com/sitmun/sitmun-viewer-app/commit/6504b560ff47b1e20bd545b4aedeef1f7f293359))
- API Sitna integrated as npm module dependency ([#86](https://github.com/sitmun/sitmun-viewer-app/issues/86)) ([f2e5444](https://github.com/sitmun/sitmun-viewer-app/commit/f2e5444d0b8225da3553cb38e06bff8f684fee2a))
- Navigation method that accepts both application and territory IDs for explicit routing ([57a985e](https://github.com/sitmun/sitmun-viewer-app/commit/57a985e9a66152c16eb3259559eddcf4745f7b99))
- Territory count label displayed on application presentation page ([5e567db](https://github.com/sitmun/sitmun-viewer-app/commit/5e567db6e87b0a7eff65d5272f1dab7618fb3a31))
- Animation modules (BrowserAnimation and MatExpansion) for enhanced user interface ([4e60c3b](https://github.com/sitmun/sitmun-viewer-app/commit/4e60c3b0ff2da584b8a21425f9110457802c5270))
- Description max length truncation pipe for managing long text in cards ([4e60c3b](https://github.com/sitmun/sitmun-viewer-app/commit/4e60c3b0ff2da584b8a21425f9110457802c5270))
- Error handling infrastructure with ErrorTrackingService and GlobalErrorHandler for centralized error management
- Error details sidebar component for enhanced error reporting and debugging
- About dialog component for displaying application information and version details
- New services: catalog-switching, layer-info, map-interface, map-service-worker, raster-layer, sidebar-manager
- Standard SITNA control handlers: feature-info-control and search-control (replacing custom silme implementations)
- Search control handler with comprehensive test coverage
- Barcelona background image asset for application branding

### Changed

- **api-sitna upgraded from 4.1.0 to 4.8.0** - Major version update with new features and improvements ([5496161](https://github.com/sitmun/sitmun-viewer-app/commit/5496161248ecac2c8d127ce91b78b82bfae87179))
- SITNA API upgraded to version 4.8.0 with comprehensive asset updates ([#86](https://github.com/sitmun/sitmun-viewer-app/issues/86)) ([75caae5](https://github.com/sitmun/sitmun-viewer-app/commit/75caae59ada27e84191dc5ef64e2a237ce80cfd9))
- SITNA API version along with CRS projection data files ([d64180e](https://github.com/sitmun/sitmun-viewer-app/commit/d64180e77b0e200751ca52ddaa7450bf3fd14406))
- API-SITNA assets override updated with latest patches ([f8fc1ad](https://github.com/sitmun/sitmun-viewer-app/commit/f8fc1ad6671dccae31a6ac45a227a0cc85130e4e))
- Control handler architecture migrated from custom "silme" handlers to standard SITNA handlers for better maintainability
- Refactored layer-catalog-control.handler with significant simplification (reduced from ~2,000 to ~500 lines)
- Service Worker configuration updated for scoped middleware requests
- Webpack configuration updated for api-sitna asset copying and SITNA_BASE_URL wiring
- Password reset flow consolidated and improved for better security ([dd571ec](https://github.com/sitmun/sitmun-viewer-app/commit/dd571ece4ec8f9cd42e21d0cfdbcf29f6db46052))
- Application presentation page now displays territory counts with orange hover effects ([5e567db](https://github.com/sitmun/sitmun-viewer-app/commit/5e567db6e87b0a7eff65d5272f1dab7618fb3a31))
- Territory section background changed to white for cleaner appearance ([8ecece9](https://github.com/sitmun/sitmun-viewer-app/commit/8ecece988e285e1850bae2fdec53c1d6b2ef6232))
- Dashboard card layout and visual design improvements ([0aee5b9](https://github.com/sitmun/sitmun-viewer-app/commit/0aee5b9b6556fb3c68d3975bf53aaa35758d10ee))
- Header navigation bar enhanced with improved menu component and language selection ([a59d0a9](https://github.com/sitmun/sitmun-viewer-app/commit/a59d0a996316e28dcd03417d780e761814f32ebd))
- Territories list component accent color changed to orange ([7a3ac51](https://github.com/sitmun/sitmun-viewer-app/commit/7a3ac51acc17e4e0ded1c689b51f44b68405f3c1))
- Card content on mobile view now uses expansion panels with text truncation ([4e60c3b](https://github.com/sitmun/sitmun-viewer-app/commit/4e60c3b0ff2da584b8a21425f9110457802c5270))
- Profile update security improved by verifying user credentials directly in update function ([71f53a3](https://github.com/sitmun/sitmun-viewer-app/commit/71f53a3228bafe7b41f9eadb7a89f9c485bb9978))
- Dashboard filtering changed to use appPrivate field instead of public field ([3da818e](https://github.com/sitmun/sitmun-viewer-app/commit/3da818ee376e7df265527dfb7534b39aa60093b7))
- User account and territory position update requests changed from PUT to POST method ([1d879fe](https://github.com/sitmun/sitmun-viewer-app/commit/1d879fe7ee6832675fa7c382791b318b9904965f))

### Fixed

- Template type errors in dashboard item and menu components ([1d3b4cb](https://github.com/sitmun/sitmun-viewer-app/commit/1d3b4cb05b3ca0e4bdb56c2d850fb7883639d1dd))
- Navigation redirection issues in dashboard item component ([61ff4a9](https://github.com/sitmun/sitmun-viewer-app/commit/61ff4a9054a6a2c4b9ebe94b8062043ff5cbb9a5), [fe60899](https://github.com/sitmun/sitmun-viewer-app/commit/fe60899212309a774495d365d78b2f41de8af957))
- Missing nav-home selector in DrawMeasureModify component ([3d2e9c2](https://github.com/sitmun/sitmun-viewer-app/commit/3d2e9c2bf56f109dea0f7f6978845a349f1808a2))
- EPSG.io broken endpoint with workaround patches ([15d1915](https://github.com/sitmun/sitmun-viewer-app/commit/15d1915661ca47078afd38bd67afa02f1f3790bb))
- Global TC object accessibility in patch files ([85b5b53](https://github.com/sitmun/sitmun-viewer-app/commit/85b5b5395424d7c9050003e779cd61a0b78dc036))
- Invalid template syntax by removing this and .content references ([57a985e](https://github.com/sitmun/sitmun-viewer-app/commit/57a985e9a66152c16eb3259559eddcf4745f7b99))

### Removed

- Unused library dependencies in basemap control ([#87](https://github.com/sitmun/sitmun-viewer-app/issues/87)) ([6bf9f62](https://github.com/sitmun/sitmun-viewer-app/commit/6bf9f62259a64a9e88d1529c216433082533aa90))
- Reset password component in favor of consolidated forgot password flow ([dd571ec](https://github.com/sitmun/sitmun-viewer-app/commit/dd571ece4ec8f9cd42e21d0cfdbcf29f6db46052))
- Legacy "silme" control handler implementations: draw-measure-modify-silme, feature-info-silme, layer-catalog-silme, popup-silme, search-silme (replaced with standard SITNA handlers)
- sitna-helpers.ts utility file (1,077 lines) - functionality integrated into dedicated services
- ExternalWMSSilme.js custom control (281 lines) - replaced with standard SITNA controls
- Unused logo asset (bck_no_logo.jpg)

### Technical Debt

- New services and components added without test coverage (8 services, 2 components). Test files to be added in follow-up:
  - Services: catalog-switching, error-tracking, global-error-handler, layer-info, map-interface, map-service-worker, raster-layer, sidebar-manager
  - Components: about-dialog, error-details-sidebar

## [1.1.1] - 2025-08-28

### Added

- New territories list component for better territory management
- Enhanced navigation bar with app/territory switching functionality
- New UI icons for improved user interface (change, check, menu, dropdown)
- Map section navigation controls with show/hide navbar functionality
- Additional internationalization strings for new features
- GitHub workflow for managing stale issues and pull requests

### Changed

- Enhanced navigation bar component with improved functionality
- Updated secondary button component styling and behavior
- Improved notification component styling
- Enhanced map styles with updated CSS configurations

### Fixed

- Fixed navbar not updating on in-app navigation
- Resolved navbar override issues on page refresh
- Fixed ChangeAppTerritory button visibility logic (now shows when there's one app and one territory)

## [1.1.0] - 2025-08-17

### Added

- Node.js version specification (.nvmrc) for v16
- Comprehensive documentation improvements in README.md
- Engine requirements specification in package.json (Node >=16.0.0, npm >=8.0.0)
- Enhanced notification system with dedicated service and component
- Additional Angular Material UI components (autocomplete, form-field, input, icon)
- New UI components for application details, territory details, and profile information

### Changed

- Upgraded Angular from v16.0.0 to v16.2.12 for improved performance and modern features
- Updated TypeScript from v4.9.5 to v5.1.6 for enhanced type safety
- Updated Angular Material from v15.2.3 to v16.2.12 for consistent UI components
- Updated ngx-translate packages (core: v14.0.0→v15.0.0, http-loader: v7.0.0→v8.0.0) for better internationalization
- Updated ESLint and related development dependencies for improved code quality
- Modernized project structure and configuration with improved component organization
- Enhanced module imports in app.module.ts and ui.module.ts
- Updated tsconfig.json and angular.json configurations for better build optimization
- Restructured UI components with better folder organization

### Fixed

- Resolved dependency conflicts and compatibility issues
- Fixed build configuration problems
- Corrected module import issues

### Removed

- Removed Docker and nginx configuration files
- Removed unused dependencies (fflate, hammerjs, igniteui-angular)
- Cleaned up obsolete configuration files

## [1.0.0] - 2024-11-12

### Added

- Initial stable release of SITMUN Viewer Application
- Interactive web mapping interface using SITNA library
- Comprehensive geospatial data visualization capabilities
- Multi-language support (Catalan, English, Spanish, French)
- Responsive design with mobile-first approach
- Authentication and authorization system
- User dashboard with application and territory management
- Public map viewer for unauthenticated users
- Embedded map viewer for external integration
- Advanced search and query functionality
- Layer management with styling and transparency controls
- Measurement tools (distance, area, drawing)
- Print and export capabilities
- Geolocation services with GPS positioning
- Street View integration with Google Maps
- Base map selection with multiple options
- Feature information display on map clicks
- Work layer manager for user-added layers
- Coordinate display with multiple coordinate systems
- Scale controls and overview map
- REST API integration with SITMUN Backend Core
- JWT token-based authentication
- Route protection with authentication guards
- HTTP interceptors for automatic token handling
- Error handling with user-friendly messages
- Loading indicators and progress feedback
- Toastr notification system
- Angular Material UI components
- Comprehensive test suite with Karma and Jasmine
- Build system with environment-specific configurations
- Docker support for development environment

### Changed

- Implemented proper dependency management
- Enhanced code quality and maintainability
- Optimized performance with lazy loading
- Improved security with proper token management
- Enhanced user experience with intuitive interface design

### Fixed

- Various bug fixes and improvements from development phase
- Map rendering issues on different browsers
- Authentication flow problems
- Responsive design issues
- API integration errors
- Performance optimization issues

[unreleased]: https://github.com/sitmun/sitmun-viewer-app/compare/sitmun-viewer-app/1.2.7...HEAD
[1.2.7]: https://github.com/sitmun/sitmun-viewer-app/compare/sitmun-viewer-app/1.2.6...sitmun-viewer-app/1.2.7
[1.2.6]: https://github.com/sitmun/sitmun-viewer-app/compare/sitmun-viewer-app/1.2.5...sitmun-viewer-app/1.2.6
[1.2.5]: https://github.com/sitmun/sitmun-viewer-app/compare/sitmun-viewer-app/1.2.4...sitmun-viewer-app/1.2.5
[1.2.4]: https://github.com/sitmun/sitmun-viewer-app/compare/sitmun-viewer-app/1.2.3...sitmun-viewer-app/1.2.4
[1.2.3]: https://github.com/sitmun/sitmun-viewer-app/compare/sitmun-viewer-app/1.2.2...sitmun-viewer-app/1.2.3
[1.2.2]: https://github.com/sitmun/sitmun-viewer-app/compare/sitmun-viewer-app/1.2.1...sitmun-viewer-app/1.2.2
[1.2.0]: https://github.com/sitmun/sitmun-viewer-app/compare/sitmun-viewer-app/1.1.1...sitmun-viewer-app/1.2.0
[1.1.1]: https://github.com/sitmun/sitmun-viewer-app/compare/sitmun-viewer-app/1.1.0...sitmun-viewer-app/1.1.1
[1.1.0]: https://github.com/sitmun/sitmun-viewer-app/compare/sitmun-viewer-app/1.0.0...sitmun-viewer-app/1.1.0
[1.0.0]: https://github.com/sitmun/sitmun-viewer-app/releases/tag/sitmun-viewer-app/1.0.0
