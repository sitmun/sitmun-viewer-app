import { inject, Injectable } from '@angular/core';
import { AppCfg, AppLayer, AppService } from '@api/model/app-cfg';
import { WMSCapabilities } from '../types/wms-capabilities';
import {
  VirtualWmsCapabilitiesService,
  RealLayerConfig
} from './virtual-wms-capabilities.service';
import { ConfigLookupService } from './config-lookup.service';
import { LayerInfoService } from './layer-info.service';
import { LanguageService } from './language.service';

/**
 * Service for Raster layer-specific functionality.
 * Handles WMTS normalization, Raster-specific information extraction, and capabilities processing.
 * TODO: Add unit tests (raster-layer.service.spec.ts)
 */
@Injectable({
  providedIn: 'root'
})
export class RasterLayerService {
  private readonly virtualWmsService = inject(VirtualWmsCapabilitiesService);
  private readonly configLookup = inject(ConfigLookupService);
  private readonly layerInfoService = inject(LayerInfoService);
  private readonly languageService = inject(LanguageService);

  /**
   * Check if a layer is a Raster that plans to build a WMTS service.
   *
   * @param layer - The layer instance to check
   * @param capabilitiesUrl - Optional capabilities URL (for virtual service detection)
   * @param appCfg - Optional app configuration (for virtual service detection)
   * @returns true if the layer is a Raster that will build a WMTS, false otherwise
   */
  isRasterWmts(
    layer: { [key: string]: unknown },
    capabilitiesUrl?: string,
    appCfg?: AppCfg
  ): boolean {
    // Check if layer is a Raster type
    const layerType = (layer as any)['type'];
    const isRaster =
      layerType === 'WMS' ||
      layerType === 'WMTS' ||
      (layer as any).constructor?.name === 'Raster' ||
      (layer as any).__proto__?.constructor?.name === 'Raster';

    if (!isRaster) {
      return false;
    }

    // Check service type
    // 1. Direct check from layer.type property
    if (layerType === 'WMTS') {
      return true;
    }

    // 2. For virtual services, resolve the real service type
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
        if (realLayerConfig && realLayerConfig.type === 'WMTS') {
          return true;
        }
      }
    }

    // 3. Try to get service type from layer options or properties
    const serviceType =
      (layer as any).options?.type || (layer as any).serviceType || layerType;
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
    let totalRemovedCount = 0;

    // Process all layers
    for (const layer of layers) {
      const removedCount = this.normalizeLayerBoundingBox(layer);
      if (removedCount > 0 || layer['BoundingBox'] !== undefined) {
        processedCount++;
        totalRemovedCount += removedCount;
      }
    }

    return processedCount;
  }

  /**
   * Process capabilities result for WMTS Raster layers.
   * If the layer is a Raster that will build WMTS, normalizes BoundingBox for all layers.
   *
   * @param layer - The layer instance
   * @param capabilitiesUrl - The capabilities URL
   * @param capabilities - The capabilities result object
   * @param appCfg - Optional app configuration (for virtual service detection)
   * @returns The processed capabilities result (normalized if WMTS, original otherwise)
   */
  processWmtsCapabilitiesResult(
    layer: { [key: string]: unknown },
    capabilitiesUrl: string | undefined,
    capabilities: unknown,
    appCfg?: AppCfg
  ): unknown {
    const isRasterWmts = this.isRasterWmts(layer, capabilitiesUrl, appCfg);

    if (isRasterWmts) {
      // Normalize BoundingBox for all layers in WMTS capabilities
      this.normalizeAllWmtsLayersBoundingBox(capabilities);
    }

    // Return the capabilities (modified in place if WMTS, original otherwise)
    return capabilities;
  }

  /**
   * Get WMS capabilities from a Raster instance or cache.
   * Helper to get WMS capabilities from a Raster instance or cache.
   *
   * @param realLayerConfig - The real layer configuration
   * @param rasterInstancesCache - Optional cache for Raster instances
   * @param TCLayer - SITNA layer namespace (for creating Raster instances)
   * @returns WMS capabilities or null if not available
   */
  getRasterCapabilities(
    realLayerConfig: RealLayerConfig,
    rasterInstancesCache?: Map<string, any>,
    TCLayer?: any
  ): WMSCapabilities | null {
    try {
      const serviceKey = `${realLayerConfig.url}|${realLayerConfig.type}`;
      // Check if we have a cached Raster instance with capabilities
      const cachedRaster = rasterInstancesCache?.get?.(serviceKey);
      if (cachedRaster?.capabilities) {
        return cachedRaster.capabilities;
      }

      // Try to get capabilities from the real service (only if already loaded)
      if (TCLayer?.Raster) {
        try {
          const tempRaster = new TCLayer.Raster({
            url: realLayerConfig.url,
            type: realLayerConfig.type
          });
          if (tempRaster.capabilities) {
            return tempRaster.capabilities;
          }
          // If capabilities are not already loaded, we skip them (they would require async loading)
        } catch (rasterError) {
          console.error(
            '[RasterLayerService] Error creating temporary Raster:',
            rasterError
          );
        }
      }
    } catch (error) {
      console.error(
        '[RasterLayerService] Could not load WMS capabilities:',
        error
      );
    }

    return null;
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
   * @param TCLayer - SITNA layer namespace (for creating Raster instances)
   * @returns Enriched info object with title, abstract, metadata, contact info, etc.
   */
  enrichRasterLayerInfo(
    nodeId: string,
    realLayerConfig: RealLayerConfig,
    wmsCapabilities?: WMSCapabilities | null,
    rasterInstancesCache?: Map<string, any>,
    TCLayer?: any
  ): any {
    // Get WMS capabilities if not provided
    if (!wmsCapabilities) {
      wmsCapabilities = this.getRasterCapabilities(
        realLayerConfig,
        rasterInstancesCache,
        TCLayer
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

    // Set name from real layer config
    if (realLayerConfig.layerNames && realLayerConfig.layerNames.length > 0) {
      const realLayerName = realLayerConfig.layerNames[0];

      enrichedInfo.name = realLayerName.includes(':')
        ? realLayerName.substring(realLayerName.indexOf(':') + 1)
        : realLayerName;
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

    // Metadata: from layer.metadataUrl (if available in app config)
    if (layerConfig && (layerConfig as any).metadataUrl) {
      const metadataUrls = Array.isArray((layerConfig as any).metadataUrl)
        ? (layerConfig as any).metadataUrl
        : [(layerConfig as any).metadataUrl];

      enrichedInfo.metadata = metadataUrls.map((md: any) => ({
        format: md.format || 'text/html',
        type: md.type || 'simple',
        url: typeof md === 'string' ? md : md.url,
        formatDescription: md.formatDescription || 'Metadata'
      }));
    }

    // DataUrl: from layer.datasetURL (if available in app config)
    if (layerConfig && (layerConfig as any).datasetURL) {
      const dataUrls = Array.isArray((layerConfig as any).datasetURL)
        ? (layerConfig as any).datasetURL
        : [(layerConfig as any).datasetURL];

      enrichedInfo.dataUrl = dataUrls.map((du: any) => ({
        format: du.format || 'application/zip',
        type: du.type || 'simple',
        url: typeof du === 'string' ? du : du.url,
        formatDescription: du.formatDescription || 'Download'
      }));
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

    // ParentAbstract: from app config
    const tree = this.configLookup.findTreeContainingNode(nodeId);
    if (tree && (tree as any).abstract) {
      enrichedInfo.parentAbstract = (tree as any).abstract;
    } else if (serviceConfig && (serviceConfig as any).abstract) {
      enrichedInfo.parentAbstract = (serviceConfig as any).abstract;
    }

    // Merge WMS capabilities data (as fallback, app config takes precedence)
    if (wmsCapabilities && wmsCapabilities.Capability?.Layer) {
      const realLayerName =
        realLayerConfig.layerNames && realLayerConfig.layerNames.length > 0
          ? realLayerConfig.layerNames[0]
          : null;

      // Get current user language preference
      const currentLang = this.languageService.getCurrentLanguage();

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
              wmsLayer.Abstract,
              currentLang
            );
            if (abstractText) {
              enrichedInfo.abstract = abstractText;
            }
          }
        }
      }

      // Get service-level information from capabilities
      if (wmsCapabilities.Service) {
        // Preserve full language structure and resolve preferred language for display
        if (!enrichedInfo.parentAbstract && wmsCapabilities.Service.Abstract) {
          // Store full language structure (preserve all variants)
          enrichedInfo.parentAbstractAll = wmsCapabilities.Service.Abstract;

          // Extract preferred language for display
          const serviceAbstractText =
            this.layerInfoService.extractLanguageAwareText(
              wmsCapabilities.Service.Abstract,
              currentLang
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
