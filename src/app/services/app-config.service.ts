import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/**
 * Interface for dashboard configuration
 */
export interface DashboardConfig {
  allowedTypes: string[];
  filteringEnabled: boolean;
}

/**
 * Interface for application configuration
 */
export interface AppConfig {
  dashboard: DashboardConfig;
}

/**
 * Service to load and manage application configuration from JSON file
 * Configuration is loaded during app initialization and cached
 */
@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private readonly http = inject(HttpClient);
  private config: AppConfig | null = null;
  private readonly DEFAULT_CONFIG: AppConfig = {
    dashboard: {
      allowedTypes: [],
      filteringEnabled: false,
    },
  };

  /**
   * Load configuration from JSON file
   * Should be called during app initialization (APP_INITIALIZER)
   * Falls back to default config if loading fails
   */
  async loadConfig(): Promise<void> {
    try {
      this.config = await firstValueFrom(
        this.http.get<AppConfig>('/assets/config/app-config.json')
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
    return (
      this.config?.dashboard ?? this.DEFAULT_CONFIG.dashboard
    );
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
