import { inject, Injectable } from '@angular/core';

import { AppCfg, AppLayer, AppService } from '@api/model/app-cfg';

import { ConfigLookupService } from './config-lookup.service';
import { inferOgcLinkFormat, LayerInfoService } from './layer-info.service';
import { isProfileLayerQueryable } from './profile-layer-queryable';
import {
  VirtualWmsCapabilitiesService,
  RealLayerConfig
} from './virtual-wms-capabilities.service';
import {
  WMSCapabilities,
  WMSLayer,
  WmsOnlineResourceLink
} from '../types/wms-capabilities';

/**
 * Service for Raster layer-specific functionality.
 * Handles WMTS normalization, Raster-specific information extraction, and capabilities processing.
 */
@Injectable({
  providedIn: 'root'
})
export class RasterLayerService {
  private readonly virtualWmsService = inject(VirtualWmsCapabilitiesService);
  private readonly configLookup = inject(ConfigLookupService);
  private readonly layerInfoService = inject(LayerInfoService);

  /**
   * Check if a layer is a Raster that plans to build a WMTS service.
   *
   * @param layer - The layer instance to check
   * @param capabilitiesUrl - Optional capabilities URL (for virtual service detection)
   * @param appCfg - Optional app configuration (for virtual service detection)
   * @returns true if the layer is a Raster that will build a WMTS, false otherwise
   */
  /**
   * Check if layer instance is a Raster type (WMS, WMTS, or Raster constructor).
   */
  private isRasterLayer(layer: { [key: string]: unknown }): boolean {
    const layerType = (layer as any)['type'];
    return (
      layerType === 'WMS' ||
      layerType === 'WMTS' ||
      (layer as any).constructor?.name === 'Raster' ||
      (layer as any).__proto__?.constructor?.name === 'Raster'
    );
  }

  /**
   * Resolve the service type for a layer, considering virtual URL resolution.
   */
  private resolveServiceType(
    layer: { [key: string]: unknown },
    capabilitiesUrl?: string,
    appCfg?: AppCfg
  ): string | undefined {
    const layerType = (layer as any)['type'];

    if (
      capabilitiesUrl &&
      appCfg &&
      this.virtualWmsService.isVirtualServiceUrl(capabilitiesUrl)
    ) {
      const nodeId =
        this.virtualWmsService.extractNodeIdFromUrl(capabilitiesUrl);
      if (nodeId) {
        const realLayerConfig = this.virtualWmsService.findRealLayerConfig(
          nodeId,
          appCfg
        );
        if (realLayerConfig) {
          return realLayerConfig.type;
        }
      }
    }

    return (
      (layer as any).options?.type ||
      (layer as any).serviceType ||
      layerType
    );
  }

  /**
   * True when the layer is a Raster backed by WMS (direct, virtual-resolved, or options.type).
   */
  isRasterWms(
    layer: { [key: string]: unknown },
    capabilitiesUrl?: string,
    appCfg?: AppCfg
  ): boolean {
    if (!this.isRasterLayer(layer)) {
      return false;
    }
    const serviceType = this.resolveServiceType(layer, capabilitiesUrl, appCfg);
    return serviceType === 'WMS';
  }

  /**
   * True when the layer is a Raster backed by WMTS.
   */
  isRasterWmts(
    layer: { [key: string]: unknown },
    capabilitiesUrl?: string,
    appCfg?: AppCfg
  ): boolean {
    if (!this.isRasterLayer(layer)) {
      return false;
    }
    const serviceType = this.resolveServiceType(layer, capabilitiesUrl, appCfg);
    return serviceType === 'WMTS';
  }

  /**
   * Normalize a single layer's BoundingBox by ensuring it's an array
   * and filtering to keep only items with a crs property.
   *
   * @param layer - The layer object to normalize
   * @returns The number of items removed from BoundingBox (for logging)
   */
  normalizeLayerBoundingBox(layer: { [key: string]: unknown }): number {
    let removedCount = 0;

    // Ensure BoundingBox is an array
    if (
      layer['BoundingBox'] !== undefined &&
      !Array.isArray(layer['BoundingBox'])
    ) {
      layer['BoundingBox'] = [layer['BoundingBox']];
    }

    // Filter BoundingBox array to keep only items with crs property
    if (Array.isArray(layer['BoundingBox'])) {
      const boundingBoxArray = layer['BoundingBox'] as unknown[];
      const originalLength = boundingBoxArray.length;
      layer['BoundingBox'] = boundingBoxArray.filter((item: unknown) => {
        return (
          item !== null &&
          typeof item === 'object' &&
          item !== undefined &&
          'crs' in (item as Record<string, unknown>)
        );
      });
      removedCount =
        originalLength - (layer['BoundingBox'] as unknown[]).length;
    }

    return removedCount;
  }

  /**
   * Normalize BoundingBox for all layers in WMTS capabilities.
   * Applies normalization to all layers regardless of their identifier.
   *
   * @param capabilities - WMTS capabilities object
   * @returns The number of layers processed
   */
  normalizeAllWmtsLayersBoundingBox(capabilities: unknown): number {
    // Safely access WMTS capabilities structure
    const caps = capabilities as {
      Contents?: {
        Layer?: Array<{ Identifier?: string; [key: string]: unknown }>;
      };
      [key: string]: unknown;
    };
    const layers = caps?.Contents?.Layer;

    if (!Array.isArray(layers) || layers.length === 0) {
      return 0;
    }

    let processedCount = 0;

    // Process all layers
    for (const layer of layers) {
      const removedCount = this.normalizeLayerBoundingBox(layer);
      if (removedCount > 0 || layer['BoundingBox'] !== undefined) {
        processedCount++;
      }
    }

    return processedCount;
  }

  /**
   * Post-process **synthetic** virtual WMS GetCapabilities: merges profile scale denominators onto
   * leaf {@link WMSLayer} entries (node-id based). Does not run for real service URLs; use
   * {@link RasterLayerService#processWmtCapabilitiesResult} after HTTP fetch instead.
   */
  applyVirtualCatalogProfileScaleDenominators(
    capabilities: unknown,
    appCfg: AppCfg
  ): unknown {
    this.applyProfileScaleDenominatorsToWmsCapabilities(capabilities, appCfg);
    return capabilities;
  }

  /**
   * Process **real** fetched GetCapabilities for Raster layers (non-virtual URLs only).
   * WMTS: normalizes BoundingBox; WMS/WMTS: merges profile denominators, {@code Title},
   * {@code Abstract}, and OGC {@code MetadataURL} / {@code DataURL} on the matched capability
   * layer when the layer maps to an {@link AppService} in {@link AppCfg} (prefer
   * {@code layer.options.serviceId} for proxy URLs). Profile string fields use present / non-empty
   * replace, present / empty remove, and omitted leave the service document unchanged.
   *
   * @param layer - The layer instance
   * @param capabilitiesUrl - The capabilities URL (must not be {@code virtual://…})
   * @param capabilities - The capabilities result object
   * @param appCfg - App configuration
   * @returns The processed capabilities result (modified in place when applicable)
   */
  processWmtCapabilitiesResult(
    layer: { [key: string]: unknown },
    capabilitiesUrl: string | undefined,
    capabilities: unknown,
    appCfg?: AppCfg
  ): unknown {
    if (
      !capabilitiesUrl ||
      !capabilities ||
      this.virtualWmsService.isVirtualServiceUrl(capabilitiesUrl)
    ) {
      return capabilities;
    }

    const isRasterWmts = this.isRasterWmts(layer, capabilitiesUrl, appCfg);
    const isRasterWms = this.isRasterWms(layer, capabilitiesUrl, appCfg);

    if (isRasterWmts) {
      this.normalizeAllWmtsLayersBoundingBox(capabilities);
    }

    if (!appCfg) {
      return capabilities;
    }

    const matchedService = this.resolveConfiguredServiceForCapabilities(
      layer,
      capabilitiesUrl,
      appCfg
    );

    if (matchedService && (isRasterWms || isRasterWmts)) {
      this.applyConfiguredProfileScaleDenominators(
        capabilities,
        appCfg,
        matchedService.id,
        isRasterWms,
        isRasterWmts
      );
    }

    return capabilities;
  }

  /**
   * Resolve {@link AppService} for this capabilities fetch: primary {@code options.serviceId}
   * (or legacy {@code options.service} when it equals an AppCfg service id), else URL match.
   */
  private resolveConfiguredServiceForCapabilities(
    layer: { [key: string]: unknown },
    capabilitiesUrl: string,
    appCfg: AppCfg
  ): AppService | undefined {
    const opts = (layer as { options?: Record<string, unknown> }).options;
    const fromOpts = opts?.['serviceId'] ?? opts?.['service'];
    if (typeof fromOpts === 'string' && fromOpts.length > 0) {
      const byId = appCfg.services.find((s) => s.id === fromOpts);
      if (byId) {
        return byId;
      }
    }

    const normalizeUrl = (u: string): string =>
      u
        .trim()
        .replace(/\/+$/, '')
        .split('?')[0]
        .toLowerCase();

    // Try URLs in order of preference
    const layerUrl = (layer as { url?: unknown }).url;
    const optUrl = opts?.['url'];
    const candidates = [
      capabilitiesUrl,
      typeof layerUrl === 'string' ? layerUrl : null,
      typeof optUrl === 'string' ? optUrl : null
    ].filter((u): u is string => Boolean(u));

    for (const raw of candidates) {
      const normalized = normalizeUrl(raw);
      if (normalized) {
        const match = appCfg.services.find(
          (s) => normalizeUrl(String(s.url ?? '')) === normalized
        );
        if (match) {
          return match;
        }
      }
    }

    return undefined;
  }

  /**
   * Merge {@link AppCfg} raster layer settings onto fetched capabilities for a matched service.
   * Delegates to {@link #applyAppProfileToRealWmsCapabilityLayers} or
   * {@link #applyAppProfileToRealWmtsCapabilityLayers} by layer type.
   */
  private applyConfiguredProfileScaleDenominators(
    capabilities: unknown,
    appCfg: AppCfg,
    serviceId: string,
    isRasterWms: boolean,
    isRasterWmts: boolean
  ): void {
    const wmsRoot = (capabilities as WMSCapabilities | undefined)?.Capability
      ?.Layer;
    if (isRasterWms && wmsRoot) {
      this.applyAppProfileToRealWmsCapabilityLayers(
        capabilities,
        serviceId,
        appCfg
      );
    }

    const wmtsLayers = (
      capabilities as {
        Contents?: { Layer?: unknown[] };
      }
    )?.Contents?.Layer;
    if (isRasterWmts && Array.isArray(wmtsLayers)) {
      this.applyAppProfileToRealWmtsCapabilityLayers(
        capabilities,
        serviceId,
        appCfg
      );
    }
  }

  /**
   * Check if a WMS layer name matches a configured layer name.
   * Handles namespaced layer names (e.g., "workspace:layer" matches "layer").
   */
  private wmsLayerNameMatchesConfiguredName(
    wmsName: string,
    configuredName: string
  ): boolean {
    const ln = configuredName.trim();
    if (!ln || !wmsName) {
      return false;
    }
    return (
      wmsName === ln ||
      wmsName.endsWith(`:${ln}`) ||
      ln === wmsName.split(':').pop()
    );
  }

  /**
   * Apply scale denominators and profile fields to real WMS capability layers by matching layer names.
   * Walks the WMS layer tree and applies scales, `Title`, `Abstract`, and OGC `MetadataURL` / `DataURL`
   * on each matched {@link WMSLayer}. String fields follow {@link #mergeProfileTitleAbstractOntoLayer} and
   * {@link #mergeProfileOgcOnlineResourceLinks}: property present + non-empty replaces; present + empty
   * removes; property absent leaves the fetched value unchanged.
   */
  private applyAppProfileToRealWmsCapabilityLayers(
    capabilities: unknown,
    serviceId: string,
    appCfg: AppCfg
  ): void {
    const caps = capabilities as WMSCapabilities | null | undefined;
    const root = caps?.Capability?.Layer;
    if (!root) {
      return;
    }
    const appLayersForService = appCfg.layers.filter(
      (l) => l.service === serviceId
    );
    const visit = (ly: WMSLayer): void => {
      const name = ly.Name;
      if (typeof name === 'string' && name.length > 0) {
        for (const appLayer of appLayersForService) {
          const matched = (appLayer.layers ?? []).some((ln) =>
            this.wmsLayerNameMatchesConfiguredName(name, ln)
          );
          if (matched) {
            if (this.isPositiveFiniteDenominator(appLayer.minScaleDenominator)) {
              ly.MinScaleDenominator = appLayer.minScaleDenominator;
            }
            if (this.isPositiveFiniteDenominator(appLayer.maxScaleDenominator)) {
              ly.MaxScaleDenominator = appLayer.maxScaleDenominator;
            }
            this.mergeProfileTitleAbstractOntoLayer(ly, appLayer);
            this.mergeProfileOgcOnlineResourceLinks(ly, appLayer);
            // SITNA FeatureInfo expands groups via getDisgregatedLayerNames;
            // apply the profile flag to the match and all descendants so child
            // names cannot stay queryable when the cartography disables GFI.
            this.setQueryableOnLayerTree(
              ly,
              isProfileLayerQueryable(appLayer)
            );
            break;
          }
        }
      }
      const children = ly.Layer;
      if (Array.isArray(children)) {
        for (const child of children) {
          visit(child);
        }
      }
    };
    visit(root);
  }

  /** Set OGC `queryable` on a WMS capability node and every nested `Layer`. */
  private setQueryableOnLayerTree(ly: WMSLayer, queryable: boolean): void {
    ly.queryable = queryable;
    const children = ly.Layer;
    if (!Array.isArray(children)) {
      return;
    }
    for (const child of children) {
      this.setQueryableOnLayerTree(child, queryable);
    }
  }

  /**
   * Apply scale denominators, {@code Title}, {@code Abstract}, and OGC-style {@code MetadataURL} /
   * {@code DataURL} to real WMTS capability layer entries by matching layer identifiers.
   * Title, abstract, and URL fields use {@link #mergeProfileTitleAbstractOntoLayer} and
   * {@link #mergeProfileOgcOnlineResourceLinks}.
   */
  private applyAppProfileToRealWmtsCapabilityLayers(
    capabilities: unknown,
    serviceId: string,
    appCfg: AppCfg
  ): void {
    const caps = capabilities as {
      Contents?: { Layer?: Array<Record<string, unknown>> };
    };
    const layers = caps?.Contents?.Layer;
    if (!Array.isArray(layers)) {
      return;
    }
    this.ensureConfigLookupInitialized(appCfg);
    for (const wmtsLayer of layers) {
      const rawId = wmtsLayer['Identifier'];
      const identifier =
        typeof rawId === 'string'
          ? rawId
          : rawId &&
              typeof rawId === 'object' &&
              rawId !== null &&
              'value' in (rawId as object)
            ? String((rawId as { value?: unknown }).value ?? '')
            : String(rawId ?? '');
      const appLayer = this.findAppLayerForWmtsIdentifier(
        identifier,
        appCfg,
        serviceId
      );
      if (!appLayer) {
        continue;
      }
      if (this.isPositiveFiniteDenominator(appLayer.minScaleDenominator)) {
        wmtsLayer['MinScaleDenominator'] = appLayer.minScaleDenominator;
      }
      if (this.isPositiveFiniteDenominator(appLayer.maxScaleDenominator)) {
        wmtsLayer['MaxScaleDenominator'] = appLayer.maxScaleDenominator;
      }
      this.mergeProfileTitleAbstractOntoLayer(wmtsLayer, appLayer);
      this.mergeProfileOgcOnlineResourceLinks(wmtsLayer, appLayer);
    }
  }

  /**
   * Applies profile {@link AppLayer#title} as {@code Title} and {@link AppLayer#description} as
   * {@code Abstract} on the capability layer (WMS or WMTS record). Same rules as
   * {@link #mergeProfileOgcOnlineResourceLinks}.
   */
  private mergeProfileTitleAbstractOntoLayer(
    target: WMSLayer | Record<string, unknown>,
    appLayer: AppLayer
  ): void {
    const t = target as Record<string, unknown>;
    if (Object.prototype.hasOwnProperty.call(appLayer, 'title')) {
      const raw = appLayer.title;
      const s =
        raw == null
          ? ''
          : typeof raw === 'string'
            ? raw.trim()
            : String(raw).trim();
      if (s) {
        t['Title'] = s;
      } else {
        delete t['Title'];
      }
    }
    if (Object.prototype.hasOwnProperty.call(appLayer, 'description')) {
      const raw = appLayer.description;
      const s =
        raw == null
          ? ''
          : typeof raw === 'string'
            ? raw.trim()
            : String(raw).trim();
      if (s) {
        t['Abstract'] = s;
      } else {
        delete t['Abstract'];
      }
    }
  }

  /**
   * Applies profile {@link AppLayer#metadataURL} / {@link AppLayer#datasetURL} to OGC
   * {@code MetadataURL} / {@code DataURL} on the capability layer. If a property is
   * present on {@code appLayer} (see {@code Object.prototype.hasOwnProperty}), it replaces the capability
   * value: non-empty after trim writes one entry; {@code null}, {@code undefined}, empty string, or
   * whitespace-only removes the key so upstream GetCapabilities links are not left in place.
   * Omitted JSON keys leave the fetched document unchanged for that field (same idea as
   * {@link #enrichRasterLayerInfo}).
   */
  private mergeProfileOgcOnlineResourceLinks(
    target: WMSLayer | Record<string, unknown>,
    appLayer: AppLayer
  ): void {
    const t = target as Record<string, unknown>;
    if (Object.prototype.hasOwnProperty.call(appLayer, 'metadataURL')) {
      const raw = appLayer.metadataURL;
      const md =
        raw == null
          ? ''
          : typeof raw === 'string'
            ? raw.trim()
            : String(raw).trim();
      if (md) {
        const entry: WmsOnlineResourceLink = {
          Format: inferOgcLinkFormat('metadata', md),
          OnlineResource: { 'xlink:href': md }
        };
        t['MetadataURL'] = [entry];
      } else {
        delete t['MetadataURL'];
      }
    }
    if (Object.prototype.hasOwnProperty.call(appLayer, 'datasetURL')) {
      const raw = appLayer.datasetURL;
      const du =
        raw == null
          ? ''
          : typeof raw === 'string'
            ? raw.trim()
            : String(raw).trim();
      if (du) {
        const entry: WmsOnlineResourceLink = {
          Format: inferOgcLinkFormat('download', du),
          OnlineResource: { 'xlink:href': du }
        };
        t['DataURL'] = [entry];
      } else {
        delete t['DataURL'];
      }
    }
  }

  private ensureConfigLookupInitialized(appCfg: AppCfg): void {
    if (!this.configLookup.isReady()) {
      this.configLookup.initialize(appCfg);
    }
  }

  /**
   * Check if a value is a valid scale denominator (positive finite number).
   */
  private isPositiveFiniteDenominator(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value) && value > 0;
  }

  /**
   * Walk WMS Capability.Layer tree and set MinScaleDenominator / MaxScaleDenominator from
   * {@link AppCfg} for leaf layers whose {@link WMSLayer#Name} is a catalog node id with a resource.
   */
  private applyProfileScaleDenominatorsToWmsCapabilities(
    capabilities: unknown,
    appCfg: AppCfg
  ): void {
    const caps = capabilities as WMSCapabilities | null | undefined;
    const root = caps?.Capability?.Layer;
    if (!root) {
      return;
    }
    this.ensureConfigLookupInitialized(appCfg);
    const visit = (ly: WMSLayer): void => {
      const name = ly.Name;
      if (typeof name === 'string' && name.length > 0) {
        const node = this.configLookup.findNode(name);
        if (node?.resource) {
          const appLayer = appCfg.layers.find((l) => l.id === node.resource);
          if (appLayer) {
            if (this.isPositiveFiniteDenominator(appLayer.minScaleDenominator)) {
              ly.MinScaleDenominator = appLayer.minScaleDenominator;
            }
            if (this.isPositiveFiniteDenominator(appLayer.maxScaleDenominator)) {
              ly.MaxScaleDenominator = appLayer.maxScaleDenominator;
            }
          }
        }
      }
      const children = ly.Layer;
      if (Array.isArray(children)) {
        for (const child of children) {
          visit(child);
        }
      }
    };
    visit(root);
  }

  private findAppLayerForWmtsIdentifier(
    identifier: string,
    appCfg: AppCfg,
    serviceId?: string
  ): AppLayer | undefined {
    const id = identifier.trim();
    if (!id) {
      return undefined;
    }
    const matchesService = (appLayer: AppLayer) =>
      serviceId === undefined || appLayer.service === serviceId;

    const exact = appCfg.layers.find(
      (appLayer) =>
        matchesService(appLayer) &&
        (appLayer.layers ?? []).some((ln) => ln.trim() === id)
    );
    if (exact) {
      return exact;
    }
    return appCfg.layers.find(
      (appLayer) =>
        matchesService(appLayer) &&
        (appLayer.layers ?? []).some((ln) =>
          this.wmsLayerNameMatchesConfiguredName(id, ln)
        )
    );
  }

  /**
   * Get already-loaded WMS capabilities from the Raster cache.
   *
   * @param realLayerConfig - The real layer configuration
   * @param rasterInstancesCache - Optional cache for Raster instances
   * @returns Cached WMS capabilities or null if not available
   */
  getRasterCapabilities(
    realLayerConfig: RealLayerConfig,
    rasterInstancesCache?: Map<string, any>
  ): WMSCapabilities | null {
    const serviceKey = `${realLayerConfig.url}|${realLayerConfig.type}`;
    return rasterInstancesCache?.get(serviceKey)?.capabilities ?? null;
  }

  /**
   * Enrich Raster layer information from app config and WMS capabilities.
   * Extracts and enriches Raster layer information by merging app config data
   * with WMS capabilities data, with app config taking precedence.
   *
   * @param nodeId - The node ID (from virtual layer name)
   * @param realLayerConfig - The real layer configuration
   * @param wmsCapabilities - Optional WMS capabilities (if already loaded)
   * @param rasterInstancesCache - Optional cache for Raster instances
   * @returns Enriched info object with title, abstract, metadata, contact info, etc.
   */
  enrichRasterLayerInfo(
    nodeId: string,
    realLayerConfig: RealLayerConfig,
    wmsCapabilities?: WMSCapabilities | null,
    rasterInstancesCache?: Map<string, any>
  ): any {
    // Get WMS capabilities if not provided
    if (!wmsCapabilities) {
      wmsCapabilities = this.getRasterCapabilities(
        realLayerConfig,
        rasterInstancesCache
      );
    }

    // Look up node, layer, and service from app config
    const node = this.configLookup.findNode(nodeId);
    if (!node) {
      console.warn(
        `[RasterLayerService] Node ${nodeId} not found in app config`
      );
      // Return minimal structure with abstract to ensure info button shows
      return {
        name: nodeId,
        title: nodeId,
        abstract: ''
      };
    }

    let layerConfig: AppLayer | undefined;
    let serviceConfig: AppService | undefined;

    if (node.resource) {
      layerConfig = this.configLookup.findLayer(node.resource);
      if (layerConfig?.service) {
        serviceConfig = this.configLookup.findService(layerConfig.service);
      }
    }

    // Initialize enrichedInfo object with app config data first (available synchronously)
    const enrichedInfo: any = {};

    // Set name from real layer config (all WMS ids for composite layers)
    if (realLayerConfig.layerNames && realLayerConfig.layerNames.length > 0) {
      enrichedInfo.name = realLayerConfig.layerNames
        .map((layerName) =>
          layerName.includes(':')
            ? layerName.substring(layerName.indexOf(':') + 1)
            : layerName
        )
        .join(', ');
    } else {
      enrichedInfo.name = nodeId;
    }

    // Override with app config data where available (app config takes precedence)
    // Title: node.title
    if (node.title) {
      enrichedInfo.title = node.title;
    }

    // isGroup: check if node has children
    enrichedInfo.isGroup = node.children && node.children.length > 0;

    // URL: service.url from app config
    if (serviceConfig?.url) {
      enrichedInfo.url = serviceConfig.url;
    } else {
      enrichedInfo.url = realLayerConfig.url;
    }

    // Metadata: from profile (metadataURL; legacy metadataUrl for hand-edited JSON).
    // If the profile field is present it replaces upstream MetadataURL, even when empty.
    const hasProfileMetadataURL =
      !!layerConfig &&
      (Object.prototype.hasOwnProperty.call(layerConfig, 'metadataURL') ||
        Object.prototype.hasOwnProperty.call(layerConfig, 'metadataUrl'));
    const profileMetadataRaw =
      layerConfig &&
      (layerConfig.metadataURL ?? (layerConfig as { metadataUrl?: string }).metadataUrl);
    if (layerConfig && profileMetadataRaw) {
      const metadataUrls = Array.isArray(profileMetadataRaw)
        ? profileMetadataRaw
        : [profileMetadataRaw];

      enrichedInfo.metadata = metadataUrls.map((md: unknown) => {
        const url =
          typeof md === 'string'
            ? md.trim()
            : String((md as { url?: string }).url ?? '').trim();
        const formatStr =
          typeof md === 'object' && md !== null && 'format' in md
            ? inferOgcLinkFormat(
                'metadata',
                url,
                String((md as { format?: string }).format ?? '')
              )
            : inferOgcLinkFormat('metadata', url);
        const explicitFd =
          typeof md === 'object' && md !== null && 'formatDescription' in md
            ? String((md as { formatDescription?: string }).formatDescription ?? '')
            : '';
        return {
          format: formatStr,
          type:
            typeof md === 'object' && md !== null && 'type' in md
              ? String((md as { type?: string }).type || 'simple')
              : 'simple',
          url,
          formatDescription:
            explicitFd ||
            this.layerInfoService.describeOgcLinkFormat('metadata', formatStr)
        };
      }).filter((md: { url: string }) => md.url.length > 0);
    }

    // DataUrl: from profile datasetURL. If present it replaces upstream DataURL, even when empty.
    const hasProfileDatasetURL =
      !!layerConfig &&
      Object.prototype.hasOwnProperty.call(layerConfig, 'datasetURL');
    const profileDatasetRaw = layerConfig?.datasetURL as unknown;
    if (layerConfig && profileDatasetRaw) {
      const dataUrls = Array.isArray(profileDatasetRaw)
        ? profileDatasetRaw
        : [profileDatasetRaw];

      enrichedInfo.dataUrl = dataUrls.map((du: unknown) => {
        const url =
          typeof du === 'string'
            ? du.trim()
            : String((du as { url?: string }).url ?? '').trim();
        const formatStr =
          typeof du === 'object' && du !== null && 'format' in du
            ? inferOgcLinkFormat(
                'download',
                url,
                String((du as { format?: string }).format ?? '')
              )
            : inferOgcLinkFormat('download', url);
        const explicitFd =
          typeof du === 'object' && du !== null && 'formatDescription' in du
            ? String((du as { formatDescription?: string }).formatDescription ?? '')
            : '';
        return {
          format: formatStr,
          type:
            typeof du === 'object' && du !== null && 'type' in du
              ? String((du as { type?: string }).type || 'simple')
              : 'simple',
          url,
          formatDescription:
            explicitFd ||
            this.layerInfoService.describeOgcLinkFormat('download', formatStr)
        };
      }).filter((du: { url: string }) => du.url.length > 0);
    }

    // Contact information: from app config
    if (serviceConfig) {
      if ((serviceConfig as any).contactPerson) {
        enrichedInfo.contactPerson = (serviceConfig as any).contactPerson;
      }
      if ((serviceConfig as any).contactOrganization) {
        enrichedInfo.contactOrganization = (
          serviceConfig as any
        ).contactOrganization;
      }
      if ((serviceConfig as any).contactMail) {
        enrichedInfo.contactMail = (serviceConfig as any).contactMail;
      }
      if ((serviceConfig as any).contactTelephone) {
        enrichedInfo.contactTelephone = (serviceConfig as any).contactTelephone;
      }
      if ((serviceConfig as any).fees) {
        enrichedInfo.fees = (serviceConfig as any).fees;
      }
      if ((serviceConfig as any).accessConstraints) {
        enrichedInfo.accessConstraints = (
          serviceConfig as any
        ).accessConstraints;
      }
    }

    // Profile/app config is authoritative; WMS capabilities are only the backup.
    const tree = this.configLookup.findTreeContainingNode(nodeId);
    const serviceTitleText = [serviceConfig?.title]
      .map((candidate) =>
        this.layerInfoService.extractLanguageAwareText(candidate)
      )
      .find((text): text is string => !!text);
    if (serviceTitleText) {
      enrichedInfo.parentTitle = serviceTitleText;
    }

    const serviceDescriptionText = [
      serviceConfig?.description,
      serviceConfig?.abstract,
      tree && (tree as { abstract?: unknown }).abstract
    ]
      .map((candidate) =>
        this.layerInfoService.extractLanguageAwareText(candidate)
      )
      .find((text): text is string => !!text);
    if (serviceDescriptionText) {
      enrichedInfo.parentAbstract = serviceDescriptionText;
    }

    // Merge WMS capabilities data (as fallback, app config takes precedence)
    if (wmsCapabilities && wmsCapabilities.Capability?.Layer) {
      const realLayerName =
        realLayerConfig.layerNames && realLayerConfig.layerNames.length > 0
          ? realLayerConfig.layerNames[0]
          : null;

      if (realLayerName) {
        const wmsLayer = this.layerInfoService.findLayerInCapabilities(
          wmsCapabilities.Capability.Layer,
          realLayerName
        );
        if (wmsLayer) {
          // Preserve full language structure and resolve preferred language for display
          if (!enrichedInfo.abstract && wmsLayer.Abstract) {
            // Store full language structure (preserve all variants)
            enrichedInfo.abstractAll = wmsLayer.Abstract;

            // Extract preferred language for display
            const abstractText = this.layerInfoService.extractLanguageAwareText(
              wmsLayer.Abstract
            );
            if (abstractText) {
              enrichedInfo.abstract = abstractText;
            }
          }

          const ogcLinks = this.layerInfoService.extractOgcMetadataAndDataUrls(
            wmsLayer as WMSLayer
          );
          if (
            !hasProfileMetadataURL &&
            (!enrichedInfo.metadata || enrichedInfo.metadata.length === 0) &&
            ogcLinks.metadata.length > 0
          ) {
            enrichedInfo.metadata = ogcLinks.metadata;
          }
          if (
            !hasProfileDatasetURL &&
            (!enrichedInfo.dataUrl || enrichedInfo.dataUrl.length === 0) &&
            ogcLinks.dataUrl.length > 0
          ) {
            enrichedInfo.dataUrl = ogcLinks.dataUrl;
          }
        }
      }

      // Get service-level information from capabilities
      if (wmsCapabilities.Service) {
        if (!enrichedInfo.parentTitle && wmsCapabilities.Service.Title) {
          const titleText = this.layerInfoService.extractLanguageAwareText(
            wmsCapabilities.Service.Title
          );
          if (titleText) {
            enrichedInfo.parentTitle = titleText;
          }
        }

        // Preserve full language structure and resolve preferred language for display
        if (!enrichedInfo.parentAbstract && wmsCapabilities.Service.Abstract) {
          // Store full language structure (preserve all variants)
          enrichedInfo.parentAbstractAll = wmsCapabilities.Service.Abstract;

          // Extract preferred language for display
          const serviceAbstractText =
            this.layerInfoService.extractLanguageAwareText(
              wmsCapabilities.Service.Abstract
            );
          if (serviceAbstractText) {
            enrichedInfo.parentAbstract = serviceAbstractText;
          }
        }

        // Get contact information from capabilities if not in app config
        if (wmsCapabilities.Service.ContactInformation) {
          const contact = wmsCapabilities.Service.ContactInformation;
          if (
            !enrichedInfo.contactPerson &&
            contact.ContactPersonPrimary?.ContactPerson
          ) {
            enrichedInfo.contactPerson =
              contact.ContactPersonPrimary.ContactPerson;
          }
          if (
            !enrichedInfo.contactOrganization &&
            contact.ContactPersonPrimary?.ContactOrganization
          ) {
            enrichedInfo.contactOrganization =
              contact.ContactPersonPrimary.ContactOrganization;
          }
          if (
            !enrichedInfo.contactMail &&
            contact.ContactElectronicMailAddress
          ) {
            enrichedInfo.contactMail = contact.ContactElectronicMailAddress;
          }
          if (!enrichedInfo.contactTelephone && contact.ContactVoiceTelephone) {
            enrichedInfo.contactTelephone = contact.ContactVoiceTelephone;
          }
        }

        // Get fees and access constraints from capabilities if not in app config
        if (!enrichedInfo.fees && wmsCapabilities.Service.Fees) {
          enrichedInfo.fees = wmsCapabilities.Service.Fees;
        }
        if (
          !enrichedInfo.accessConstraints &&
          wmsCapabilities.Service.AccessConstraints
        ) {
          enrichedInfo.accessConstraints =
            wmsCapabilities.Service.AccessConstraints;
        }
      }
    }

    // Ensure abstract is always present (even if empty) so info button shows
    if (!enrichedInfo.abstract) {
      enrichedInfo.abstract = '';
    }

    return enrichedInfo;
  }
}
