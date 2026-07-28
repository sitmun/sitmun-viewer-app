import { inject, Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { LanguageService } from './language.service';
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
  private readonly languageService = inject(LanguageService);

  /**
   * Extract text in the user's selected application language from multi-language fields.
   * Picks the variant closest to that language; when none match, uses the first variant.
   *
   * @param textField - The text field (can be string, object with lang keys, or array)
   * @param preferredLang - Optional override; defaults to {@link LanguageService#getCurrentLanguage}
   * @returns The best matching text or null if no text available
   */
  extractLanguageAwareText(
    textField: any,
    preferredLang?: string
  ): string | null {
    const userLang = preferredLang ?? this.languageService.getCurrentLanguage();
    return this.extractLanguageAwareTextForLang(textField, userLang);
  }

  private extractLanguageAwareTextForLang(
    textField: any,
    preferredLang: string
  ): string | null {
    if (!textField) {
      return null;
    }

    if (typeof textField === 'string') {
      return textField;
    }

    if (typeof textField === 'object' && !Array.isArray(textField)) {
      const keys = Object.keys(textField);
      if (keys.length === 0) {
        return null;
      }

      const bestKey = this.pickBestLanguageKey(keys, preferredLang);
      const selectedKey = bestKey ?? keys[0];
      return this.resolveTextValue(textField[selectedKey], preferredLang);
    }

    if (Array.isArray(textField)) {
      const candidates: { lang: string; text: string }[] = [];
      let firstText: string | null = null;
      for (const item of textField) {
        if (typeof item === 'string') {
          firstText ??= item;
          continue;
        }
        if (item && typeof item === 'object') {
          const lang = this.extractLangFromItem(item);
          const text = this.extractTextFromItem(item);
          firstText ??= text;
          if (lang && text) {
            candidates.push({ lang, text });
          }
        }
      }

      if (candidates.length > 0) {
        const langs = candidates.map((candidate) => candidate.lang);
        const bestLang = this.pickBestLanguageKey(langs, preferredLang);
        const selectedLang = bestLang ?? langs[0];
        return candidates.find((candidate) => candidate.lang === selectedLang)!
          .text;
      }

      return firstText;
    }

    return null;
  }

  private resolveTextValue(value: unknown, preferredLang: string): string | null {
    if (value == null) {
      return null;
    }
    if (typeof value === 'string') {
      return value;
    }
    const fromItem = this.extractTextFromItem(value);
    if (fromItem) {
      return fromItem;
    }
    if (typeof value === 'object' && !Array.isArray(value)) {
      return this.extractLanguageAwareTextForLang(value, preferredLang);
    }
    return null;
  }

  private parseLangTag(tag: string): string[] {
    return tag.toLowerCase().split('-').filter(Boolean);
  }

  /** Higher score means closer to the user's selected language. */
  private languageProximityScore(
    preferredLang: string,
    candidateLang: string
  ): number {
    const pref = this.parseLangTag(preferredLang);
    const cand = this.parseLangTag(candidateLang);
    if (!pref.length || !cand.length) {
      return -1;
    }

    if (pref.join('-') === cand.join('-')) {
      return 10000;
    }

    if (pref[0] !== cand[0]) {
      return -1;
    }

    let score = 1000;
    for (let i = 1; i < Math.min(pref.length, cand.length); i++) {
      if (pref[i] === cand[i]) {
        score += 100;
      } else {
        break;
      }
    }
    return score;
  }

  private pickBestLanguageKey(
    keys: string[],
    preferredLang: string
  ): string | null {
    let bestKey: string | null = null;
    let bestScore = -1;
    for (const key of keys) {
      const score = this.languageProximityScore(preferredLang, key);
      if (score > bestScore) {
        bestScore = score;
        bestKey = key;
      }
    }
    return bestScore >= 0 ? bestKey : null;
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
}
