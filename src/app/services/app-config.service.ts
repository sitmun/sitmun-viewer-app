import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { firstValueFrom } from 'rxjs';

/**
 * Interface for dashboard configuration
 */
export interface DashboardConfig {
  allowedTypes: string[];
  filteringEnabled: boolean;
}

/**
 * Interface for a language item in the configuration
 */
export interface LanguageItem {
  name: string;
  shortname: string;
  locale?: string;
  icon?: string; // Optional icon (emoji or image path)
}

/**
 * Interface for control default configuration
 */
export interface ControlDefaultConfig {
  div?: string;
  [key: string]: any; // Allow additional properties
}

/**
 * Interface for application configuration
 */
export interface AppConfig {
  attribution?: string;
  testConfigFile?: string | null; // Path to test configuration file (relative to assets/config), null to disable
  dashboard: DashboardConfig;
  defaultLanguage?: string; // Moved from languages.defaultLanguage
  languages?: LanguageItem[]; // Changed from object with defaultLanguages array to direct array
  enabledByDefault?: string[]; // Array of control identifiers that should be enabled even if backend doesn't request them
  disabledControls?: string[]; // Array of control identifiers that should be disabled even if backend or enabledByDefault requests them (takes precedence)
  controlDefaults?: Record<string, ControlDefaultConfig>; // Control identifier to default config mapping
}

/**
 * Service to load and manage application configuration from JSON file
 * Configuration is loaded during app initialization and cached
 */
@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private readonly http = inject(HttpClient);
  private config: AppConfig | null = null;
  private readonly DEFAULT_CONFIG: AppConfig = {
    dashboard: {
      allowedTypes: [],
      filteringEnabled: false
    }
  };

  /**
   * Load configuration from JSON file
   * Should be called during app initialization (APP_INITIALIZER)
   * Falls back to default config if loading fails
   */
  async loadConfig(): Promise<void> {
    try {
      this.config = await firstValueFrom(
        this.http.get<AppConfig>('assets/config/app-config.json')
      );
    } catch (error: unknown) {
      // Use console directly here as this is bootstrap code before Angular services are fully available
      // eslint-disable-next-line no-console
      console.warn(
        'Failed to load app configuration, using defaults. Error:',
        error
      );
      this.config = this.DEFAULT_CONFIG;
    }
  }

  /**
   * Get the array of allowed dashboard item types
   * Returns empty array if config not loaded or filtering disabled
   */
  getAllowedTypes(): string[] {
    return this.config?.dashboard.allowedTypes ?? [];
  }

  /**
   * Check if dashboard type filtering is enabled
   * Returns false if config not loaded
   */
  isFilteringEnabled(): boolean {
    return this.config?.dashboard.filteringEnabled ?? false;
  }

  /**
   * Get the complete dashboard configuration
   */
  getDashboardConfig(): DashboardConfig {
    return this.config?.dashboard ?? this.DEFAULT_CONFIG.dashboard;
  }

  /**
   * Get the default languages list for fallback scenarios
   * Returns the configured languages from app-config.json or an empty array if not configured
   */
  getDefaultLanguages(): Array<{ name: string; shortname: string }> {
    const languages = this.config?.languages;
    if (Array.isArray(languages)) {
      // Return array with name and shortname (without icon)
      return languages.map((lang) => ({
        name: lang.name,
        shortname: lang.shortname
      }));
    }
    return [];
  }

  /**
   * Get the default language code (e.g., 'es', 'en')
   * Returns the configured default language or 'en' as fallback
   */
  getDefaultLanguage(): string {
    return this.config?.defaultLanguage ?? 'en';
  }

  /**
   * Get a locale string (e.g., 'es-ES') for a language shortname.
   * Falls back to configured default language if no locale is found.
   */
  getLocaleForLanguage(shortname: string): string {
    const language = shortname || this.getDefaultLanguage();
    const languages = this.config?.languages;
    const configured = Array.isArray(languages)
      ? languages.find((lang) => lang.shortname === language)
      : undefined;
    if (configured?.locale) {
      return configured.locale;
    }
    if (language.includes('-')) {
      return language;
    }
    const fallbackLanguage = this.getDefaultLanguage();
    const fallbackConfigured = Array.isArray(languages)
      ? languages.find((lang) => lang.shortname === fallbackLanguage)
      : undefined;
    if (fallbackConfigured?.locale) {
      return fallbackConfigured.locale;
    }
    return fallbackLanguage;
  }

  /**
   * Get the icon/flag for a language by its shortname
   * @param shortname Language shortname (e.g., 'es', 'en', 'oc-aranes')
   * @returns Icon string (emoji or image path) or empty string if not found
   */
  getLanguageIcon(shortname: string): string {
    const languages = this.config?.languages;
    if (Array.isArray(languages)) {
      const language = languages.find((lang) => lang.shortname === shortname);
      return language?.icon || '';
    }
    return '';
  }

  /**
   * Get default configuration for a control by its identifier
   * @param controlIdentifier Control identifier (e.g., 'sitna.coordinates', 'sitna.layerCatalog')
   * @returns Default configuration object or null if not found
   */
  getControlDefault(controlIdentifier: string): ControlDefaultConfig | null {
    return this.config?.controlDefaults?.[controlIdentifier] || null;
  }

  /**
   * Get the attribution text from configuration
   * @returns Attribution string or null if not configured
   */
  getAttribution(): string | null {
    return this.config?.attribution || null;
  }

  /**
   * Get the list of control identifiers that should be enabled by default
   * @returns Array of control identifiers (e.g., ['sitna.coordinates', 'sitna.featureInfo'])
   */
  getEnabledByDefault(): string[] {
    return this.config?.enabledByDefault || [];
  }

  /**
   * Check if a control identifier is in the enabledByDefault list
   * @param controlIdentifier Control identifier to check
   * @returns true if the control should be enabled by default
   */
  isEnabledByDefault(controlIdentifier: string): boolean {
    return this.getEnabledByDefault().includes(controlIdentifier);
  }

  /**
   * Get the list of control identifiers that should be disabled
   * @returns Array of control identifiers (e.g., ['sitna.WFSEdit', 'sitna.measure'])
   */
  getDisabledControls(): string[] {
    return this.config?.disabledControls || [];
  }

  /**
   * Check if a control identifier is in the disabledControls list
   * This takes precedence over backend configuration and enabledByDefault
   * @param controlIdentifier Control identifier to check
   * @returns true if the control should be disabled
   */
  isDisabled(controlIdentifier: string): boolean {
    return this.getDisabledControls().includes(controlIdentifier);
  }

  /**
   * Get the test configuration file path if configured
   * @returns Path to test config file or null if not configured
   */
  getTestConfigFile(): string | null {
    return this.config?.testConfigFile || null;
  }
}

/**
 * Factory function for APP_INITIALIZER to load config before app starts
 */
export function initializeAppConfig(
  configService: AppConfigService
): () => Promise<void> {
  return () => configService.loadConfig();
}
