/**
 * TypeScript declarations for WMS GetCapabilities response structures.
 * Based on OGC WMS 1.3.0 specification.
 */

/**
 * WMS Layer definition from GetCapabilities response
 */
export interface WMSLayer {
    /**
     * Layer name (identifier used in GetMap requests)
     */
    Name?: string;
  
    /**
     * Human-readable layer title
     */
    Title: string;
  
    /**
     * Layer abstract/description
     */
    Abstract?: string;
  
    /**
     * Keywords associated with the layer
     */
    KeywordList?: {
      Keyword: string[];
    };
  
    /**
     * Supported Coordinate Reference Systems (CRS)
     */
    CRS?: string[];
  
    /**
     * Layer bounding box
     */
    EX_GeographicBoundingBox?: {
      westBoundLongitude: number;
      eastBoundLongitude: number;
      southBoundLatitude: number;
      northBoundLatitude: number;
    };
  
    /**
     * Bounding boxes in various CRS
     */
    BoundingBox?: Array<{
      CRS: string;
      minx: number;
      miny: number;
      maxx: number;
      maxy: number;
    }>;
  
    /**
     * Layer styles
     */
    Style?: Array<{
      Name: string;
      Title: string;
      Abstract?: string;
      LegendURL?: Array<{
        Format: string;
        OnlineResource: {
          'xlink:href': string;
        };
      }>;
    }>;
  
    /**
     * Nested layers (for hierarchical layer structure)
     */
    Layer?: WMSLayer[];
  
    /**
     * Whether the layer is queryable (supports GetFeatureInfo)
     */
    queryable?: boolean;
  
    /**
     * Layer attribution
     */
    Attribution?: {
      Title?: string;
      OnlineResource?: {
        'xlink:href': string;
      };
      LogoURL?: {
        Format: string;
        OnlineResource: {
          'xlink:href': string;
        };
      };
    };
  }
  
  /**
   * WMS Capability section from GetCapabilities response
   */
  export interface WMSCapability {
    /**
     * Request capabilities (GetMap, GetFeatureInfo, etc.)
     */
    Request: {
      GetCapabilities: {
        Format: string[];
        DCPType: Array<{
          HTTP: {
            Get: {
              OnlineResource: {
                'xlink:href': string;
              };
            };
          };
        }>;
      };
      GetMap: {
        Format: string[];
        DCPType: Array<{
          HTTP: {
            Get: {
              OnlineResource: {
                'xlink:href': string;
              };
            };
          };
        }>;
      };
      GetFeatureInfo?: {
        Format: string[];
        DCPType: Array<{
          HTTP: {
            Get: {
              OnlineResource: {
                'xlink:href': string;
              };
            };
          };
        }>;
      };
    };
  
    /**
     * Exception formats supported
     */
    Exception: {
      Format: string[];
    };
  
    /**
     * Root layer containing all available layers
     */
    Layer: WMSLayer;
  }
  
  /**
   * WMS Service section from GetCapabilities response
   */
  export interface WMSService {
    /**
     * Service name (always "WMS" for WMS services)
     */
    Name: string;
  
    /**
     * Service title
     */
    Title: string;
  
    /**
     * Service abstract/description
     */
    Abstract?: string;
  
    /**
     * Keywords associated with the service
     */
    KeywordList?: {
      Keyword: string[];
    };
  
    /**
     * Online resource URL
     */
    OnlineResource?: {
      'xlink:href': string;
    };
  
    /**
     * Contact information for the service
     */
    ContactInformation?: {
      ContactPersonPrimary?: {
        ContactPerson: string;
        ContactOrganization: string;
      };
      ContactPosition?: string;
      ContactAddress?: {
        AddressType: string;
        Address: string;
        City: string;
        StateOrProvince: string;
        PostCode: string;
        Country: string;
      };
      ContactVoiceTelephone?: string;
      ContactFacsimileTelephone?: string;
      ContactElectronicMailAddress?: string;
    };
  
    /**
     * Fees for service access
     */
    Fees?: string;
  
    /**
     * Access constraints
     */
    AccessConstraints?: string;
  
    /**
     * Maximum image size supported
     */
    MaxWidth?: number;
    MaxHeight?: number;
  }
  
  /**
   * Complete WMS GetCapabilities response
   */
  export interface WMSCapabilities {
    /**
     * WMS version (e.g., "1.3.0")
     */
    version: string;
  
    /**
     * Service metadata
     */
    Service: WMSService;
  
    /**
     * Capability information (requests, layers, etc.)
     */
    Capability: WMSCapability;
  }
  
  /**
   * Type guard to check if response is WMS capabilities
   */
  export function isWMSCapabilities(response: unknown): response is WMSCapabilities {
    if (typeof response !== 'object' || response === null) {
      return false;
    }
  
    const caps = response as Partial<WMSCapabilities>;
    return (
      typeof caps.version === 'string' &&
      typeof caps.Service === 'object' &&
      caps.Service !== null &&
      typeof caps.Capability === 'object' &&
      caps.Capability !== null &&
      typeof caps.Capability.Layer === 'object' &&
      caps.Capability.Layer !== null
    );
  }
  
  