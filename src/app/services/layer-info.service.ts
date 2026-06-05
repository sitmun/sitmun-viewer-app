import { inject, Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { AppConfigService } from './app-config.service';
import {
  WMSLayer,
  WmsOnlineResourceLink
} from '../types/wms-capabilities';

/** Link shape for layer catalog info modal (Metadata / Download). */
export interface WmsLayerCatalogLink {
  url: string;
  format: string;
  type: string;
  formatDescription: string;
}

export type OgcLinkKind = 'metadata' | 'download';

const extensionFormats: Record<string, string> = {
  csv: 'text/csv',
  gml: 'application/gml+xml',
  geojson: 'application/geo+json',
  gpkg: 'application/geopackage+sqlite3',
  htm: 'text/html',
  html: 'text/html',
  json: 'application/json',
  kml: 'application/vnd.google-earth.kml+xml',
  kmz: 'application/vnd.google-earth.kmz',
  pdf: 'application/pdf',
  rdf: 'application/rdf+xml',
  txt: 'text/plain',
  xml: 'text/xml',
  zip: 'application/zip'
};

/**
 * Best-effort format policy for profile URLs. Declared OGC/Profile format wins; otherwise use the
 * URL extension, then a context default so SITNA's {@code tc-file-link} can show an icon badge.
 */
export function inferOgcLinkFormat(
  linkKind: OgcLinkKind,
  url: string,
  declaredFormat?: string
): string {
  const explicit = declaredFormat?.trim();
  if (explicit) {
    return explicit;
  }
  const path = url.split(/[?#]/, 1)[0] ?? '';
  const extension = path.match(/\.([A-Za-z0-9-]+)$/)?.[1]?.toLowerCase();
  if (extension && extensionFormats[extension]) {
    return extensionFormats[extension];
  }
  return linkKind === 'metadata' ? 'text/html' : 'application/octet-stream';
}

/**
 * Service for general layer information functionality that applies to all layer types.
 * Provides language-aware text extraction and capabilities searching that can be used
 * by any layer type (Raster, Vector, etc.).
 */
@Injectable({
  providedIn: 'root'
})
export class LayerInfoService {
  private readonly translate = inject(TranslateService);
  private readonly appConfigService = inject(AppConfigService);

  /** Ordered fallback chain: defaultLanguage then all configured shortnames, excluding preferredLang. */
  private buildFallbackChain(preferredLang: string): string[] {
    const seen = new Set<string>([preferredLang, preferredLang.split('-')[0]]);
    const chain: string[] = [];
    const defaultLang = this.appConfigService.getDefaultLanguage();
    if (defaultLang && !seen.has(defaultLang)) {
      chain.push(defaultLang);
      seen.add(defaultLang);
    }
    for (const { shortname } of this.appConfigService.getDefaultLanguages()) {
      if (shortname && !seen.has(shortname)) {
        chain.push(shortname);
        seen.add(shortname);
      }
    }
    return chain;
  }
  /**
   * Extract text in preferred language from multi-language fields.
   * Used for extracting abstracts and titles from WMS capabilities or any multi-language source.
   * Handles string, object, and array formats with language annotations.
   *
   * @param textField - The text field (can be string, object with lang keys, or array)
   * @param preferredLang - Preferred language code (e.g., 'es', 'en', 'ca')
   * @returns The best matching text or null if no text available
   */
  extractLanguageAwareText(
    textField: any,
    preferredLang: string
  ): string | null {
    if (!textField) {
      return null;
    }

    // If it's a simple string, return it
    if (typeof textField === 'string') {
      return textField;
    }

    // If it's an object with language keys (e.g., { "en": "English", "es": "Spanish" })
    // Or object where keys might be language codes
    if (typeof textField === 'object' && !Array.isArray(textField)) {
      // Try preferred language first (exact match)
      if (textField[preferredLang]) {
        return textField[preferredLang];
      }

      // Try language without region (e.g., 'es-ES' -> 'es')
      const langBase = preferredLang.split('-')[0];
      if (langBase !== preferredLang && textField[langBase]) {
        return textField[langBase];
      }

      // Try matching any key that starts with the language base
      const matchingKey = Object.keys(textField).find(
        (key) =>
          key === preferredLang ||
          key === langBase ||
          key.startsWith(langBase + '-')
      );
      if (matchingKey) {
        return textField[matchingKey];
      }

      // Try configured fallback chain: defaultLanguage then configured languages
      const fallbacks = this.buildFallbackChain(preferredLang);
      for (const fallback of fallbacks) {
        const fallbackKey = Object.keys(textField).find(
          (key) => key === fallback || key.startsWith(fallback + '-')
        );
        if (fallbackKey) {
          return textField[fallbackKey];
        }
      }

      // Return first available value as last resort
      const keys = Object.keys(textField);
      if (keys.length > 0) {
        return textField[keys[0]];
      }
    }

    // If it's an array (e.g., [{ xml:lang: "en", _: "English" }, { xml:lang: "es", _: "Spanish" }])
    // Or array of objects where each object represents a language variant
    // Or array of strings (when XML parser doesn't preserve language attributes)
    if (Array.isArray(textField)) {
      // First, try to find items with language attributes (objects) matching preferred language
      const exactMatch = this.findTextInArray(textField, preferredLang);
      if (exactMatch) {
        return exactMatch;
      }

      // Try language base match (e.g., 'es' if preferred is 'es-ES')
      const langBase = preferredLang.split('-')[0];
      if (langBase !== preferredLang) {
        const baseMatch = this.findTextInArray(textField, langBase);
        if (baseMatch) {
          return baseMatch;
        }
      }

      // Try configured fallback chain for arrays
      const fallbacks = this.buildFallbackChain(preferredLang);
      for (const fallback of fallbacks) {
        const fallbackMatch = this.findTextInArray(textField, fallback);
        if (fallbackMatch) {
          return fallbackMatch;
        }
      }

      // For arrays of strings (when XML parser doesn't preserve language attributes)
      // Just use the first item if multiple are available
      if (textField.length > 0) {
        const first = textField[0];
        if (typeof first === 'string') {
          return first;
        }
        if (first && typeof first === 'object') {
          return this.extractTextFromItem(first) || first;
        }
      }
    }

    return null;
  }

  /**
   * Find a layer in WMS capabilities structure by name.
   * General-purpose method for searching capabilities, not Raster-specific.
   * Can be used by any layer type that needs to search WMS capabilities.
   *
   * @param capLayer - The capabilities layer structure to search
   * @param layerName - The layer name to find
   * @returns The found layer or null if not found
   */
  findLayerInCapabilities(capLayer: any, layerName: string): any {
    if (capLayer.Name === layerName) {
      return capLayer;
    }
    if (capLayer.Layer) {
      for (const subLayer of capLayer.Layer) {
        const found = this.findLayerInCapabilities(subLayer, layerName);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Parses OGC WMS Layer {@code MetadataURL} / {@code DataURL} into catalog link objects.
   */
  extractOgcMetadataAndDataUrls(wmsLayer: WMSLayer | null | undefined): {
    metadata: WmsLayerCatalogLink[];
    dataUrl: WmsLayerCatalogLink[];
  } {
    return {
      metadata: this.ogcOnlineResourceLinksToCatalogLinks(
        wmsLayer?.MetadataURL,
        'metadata'
      ),
      dataUrl: this.ogcOnlineResourceLinksToCatalogLinks(
        wmsLayer?.DataURL,
        'download'
      )
    };
  }

  private ogcOnlineResourceLinksToCatalogLinks(
    field: WmsOnlineResourceLink | WmsOnlineResourceLink[] | undefined,
    linkKind: 'metadata' | 'download'
  ): WmsLayerCatalogLink[] {
    if (field == null) {
      return [];
    }
    const entries = Array.isArray(field) ? field : [field];
    const out: WmsLayerCatalogLink[] = [];
    for (const entry of entries) {
      const href = entry?.OnlineResource?.['xlink:href']?.trim();
      if (!href) {
        continue;
      }
      const format = inferOgcLinkFormat(linkKind, href, entry.Format);
      out.push({
        url: href,
        format,
        type: 'simple',
        formatDescription: this.describeOgcLinkFormat(linkKind, format)
      });
    }
    return out;
  }

  /**
   * Locale-aware link label. Uses MIME-specific i18n only when {@code format} is set (e.g. from
   * OGC GetCapabilities); otherwise generic metadata/download — href alone is not enough to infer type.
   */
  describeOgcLinkFormat(linkKind: OgcLinkKind, format: string): string {
    const mime = (format || '').trim().toLowerCase();
    if (!mime) {
      return this.translate.instant(
        linkKind === 'metadata'
          ? 'layerCatalog.linkType.metadata'
          : 'layerCatalog.linkType.download'
      );
    }
    const mimeKey =
      'layerCatalog.linkType.format.' +
      mime.replace(/\//g, '_').replace(/\+/g, '_').replace(/\./g, '_');
    const byMime = this.translate.instant(mimeKey);
    if (byMime !== mimeKey) {
      return byMime;
    }
    return this.translate.instant(
      linkKind === 'metadata'
        ? 'layerCatalog.linkType.metadata'
        : 'layerCatalog.linkType.download'
    );
  }

  /**
   * Extracts language code from an object item, trying multiple possible property names.
   */
  private extractLangFromItem(item: any): string | undefined {
    return (
      item['xml:lang'] ||
      item['xmlLang'] ||
      item.xmlLang ||
      item.lang ||
      item['@xml:lang'] ||
      item['@xmlLang'] ||
      item['$']?.lang
    );
  }

  /**
   * Extracts text content from an object item, trying multiple possible property names.
   */
  private extractTextFromItem(item: any): string | null {
    if (typeof item === 'string') {
      return item;
    }
    return (
      item?._ ||
      item?.value ||
      item?.text ||
      item?.['#text'] ||
      item?.['$']?._ ||
      null
    );
  }

  /**
   * Checks if a language code matches a target language (exact or base match).
   */
  private matchesLanguage(
    lang: string | undefined,
    targetLang: string
  ): boolean {
    if (!lang) {
      return false;
    }
    const targetBase = targetLang.split('-')[0];
    return (
      lang === targetLang ||
      lang === targetBase ||
      lang.startsWith(targetBase + '-')
    );
  }

  /**
   * Finds text in an array of language-aware items matching a target language.
   */
  private findTextInArray(items: any[], targetLang: string): string | null {
    for (const item of items) {
      if (item && typeof item === 'object') {
        const lang = this.extractLangFromItem(item);
        const text = this.extractTextFromItem(item);
        if (this.matchesLanguage(lang, targetLang) && text) {
          return text;
        }
      }
    }
    return null;
  }
}
