import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AppCfg } from '@api/model/app-cfg';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { parseTemplate } from 'url-template';

/**
 * Service for handling "More Info" functionality.
 * Extends featureInfo popups with additional query capabilities.
 */
@Injectable({
  providedIn: 'root'
})
export class MoreInfoService {
  private readonly moreInfoTasks = new Map<string, any[]>();

  constructor(private readonly http: HttpClient) {}

  initialize(config: AppCfg): void {
    this.moreInfoTasks.clear();
    if (!config?.tasks) {
      return;
    }

    config.tasks.forEach((task: any) => {
      if (task['ui-control'] === 'sitna.moreInfo') {
        const cartographyId = this.extractCartographyId(task);
        if (cartographyId) {
          const key = String(cartographyId);
          const existingTasks = this.moreInfoTasks.get(key) || [];
          existingTasks.push(task);
          this.moreInfoTasks.set(key, existingTasks);
        }
      }
    });
  }

  private extractCartographyId(task: any): string | null {
    let cartographyId =
      task.cartography?.id ||
      task.cartographyId ||
      task.parameters?.cartographyId;
    if (typeof task.parameters === 'string') {
      try {
        const params = JSON.parse(task.parameters);
        cartographyId = params.cartographyId || cartographyId;
      } catch (error) {
        console.warn(
          '[MoreInfoService] Failed to parse task parameters:',
          error
        );
      }
    }
    return cartographyId ? String(cartographyId) : null;
  }

  getMoreInfoTasks(cartographyId: string): any[] {
    return this.moreInfoTasks.get(String(cartographyId)) || [];
  }

  getMoreInfoTask(cartographyId: string): any {
    const tasks = this.getMoreInfoTasks(cartographyId);
    return tasks.length > 0 ? tasks[0] : null;
  }

  hasMoreInfoTasks(): boolean {
    return this.moreInfoTasks.size > 0;
  }

  executeMoreInfo(task: any, featureData: any): Observable<any> {
    const parameters = this.parseTaskParameters(task.parameters) as any;
    if (task.parameters && parameters === null) {
      return of({ error: 'Invalid task parameters' });
    }

    if (task?.scope === 'SQL') {
      return this.executeSqlProxy(task, featureData);
    }
    if (task?.scope === 'API') {
      return this.executeApiQuery(parameters, task, featureData);
    }
    if (task?.scope === 'URL') {
      return this.executeUrlQuery(task, featureData);
    }

    const queryType =
      parameters?.queryType || (parameters?.apiUrl ? 'api' : 'url');
    switch (queryType) {
      case 'url':
        return this.executeUrlQuery(task, featureData);
      case 'api':
        return this.executeApiQuery(parameters, task, featureData);
      case 'sql':
        return this.executeSqlQuery(parameters, featureData);
      default:
        return of({ error: 'Unknown query type: ' + queryType });
    }
  }

  private executeUrlQuery(task: any, featureData: any): Observable<any> {
    const urlTemplate = task.url || task.command;
    if (!urlTemplate) {
      return of({ error: 'No URL configured in task' });
    }

    const url = this.replacePlaceholdersFromParams(
      urlTemplate,
      task?.parameters,
      featureData
    );
    window.open(url, '_blank');
    return of({ success: true, url, redirected: true });
  }

  private executeSqlQuery(parameters: any, featureData: any): Observable<any> {
    const sqlTemplate = parameters?.sql || parameters?.sqlTemplate;
    const apiUrl = parameters?.apiUrl;
    if (!sqlTemplate || !apiUrl) {
      return of({ error: 'SQL template or API URL not configured' });
    }

    const sql = this.replacePlaceholders(sqlTemplate, featureData);
    return this.http.get(apiUrl, { params: { sql } }).pipe(
      map((response) => ({ success: true, data: response })),
      catchError((error) => of({ error: error.message || 'SQL query failed' }))
    );
  }

  private executeApiQuery(
    parameters: any,
    task: any,
    featureData: any
  ): Observable<any> {
    const rawApiUrl = task?.url || parameters?.apiUrl || task?.command;
    const apiUrl = rawApiUrl
      ? this.replacePlaceholdersFromParams(
          String(rawApiUrl),
          task?.parameters,
          featureData
        )
      : '';
    if (!apiUrl) {
      return of({ error: 'API URL not configured' });
    }

    const params =
      this.buildQueryParams(parameters?.params, featureData) ||
      this.buildTaskParamQuery(task?.parameters, featureData);
    return this.http.get(apiUrl, { params }).pipe(
      map((response) => ({ success: true, data: response })),
      catchError((error) => of({ error: error.message || 'API query failed' }))
    );
  }

  private replacePlaceholders(template: string, data: any): string {
    let result = template;
    const patterns = [
      /\{([^}]+)\}/g,
      /\$\{([^}]+)\}/g,
      /\{\{([^}]+)\}\}/g,
      /\$([^$]+)\$/g
    ];
    patterns.forEach((pattern) => {
      result = result.replace(pattern, (_match, key) => {
        const value = data[key.trim()];
        return value === undefined ? '' : String(value);
      });
    });
    return result;
  }

  private replacePlaceholdersFromParams(
    template: string,
    taskParameters: any,
    featureData: any
  ): string {
    let result = template;
    const parsedTaskParameters = this.parseTaskParameters(taskParameters);
    if (parsedTaskParameters && typeof parsedTaskParameters === 'object') {
      Object.entries(parsedTaskParameters).forEach(([paramName, config]) => {
        if (!this.isSqlParamConfig(config)) {
          return;
        }

        // Legacy support: replace explicit label tokens (e.g. "$CODI$")
        // Only applies if label has special wrapping chars (legacy format)
        const legacyLabel = (config as any)?.label;
        if (legacyLabel && this.isLegacyToken(String(legacyLabel))) {
          const v = this.getSqlParamValue(featureData, paramName, config);
          if (v !== undefined) {
            result = result.split(String(legacyLabel)).join(String(v));
          }
        }
      });
    }

    // RFC 6570 URI template expansion: vars from declared params (field path) + featureData fallback
    try {
      const vars: Record<string, string | number> = {};
      if (parsedTaskParameters && typeof parsedTaskParameters === 'object') {
        Object.entries(parsedTaskParameters).forEach(([paramName, config]) => {
          if (!this.isSqlParamConfig(config)) {
            return;
          }
          const variable = this.normalizeParamKey(paramName);
          const fieldPath =
            (config as any)?.value || (config as any)?.name || paramName;
          const v = this.getValueByPath(featureData, String(fieldPath));
          if (v !== undefined && v !== null) {
            vars[variable] =
              typeof v === 'string' || typeof v === 'number' ? v : String(v);
          }
        });
      }
      // Fallback: top-level featureData for placeholders not in task parameters (e.g. {Nom})
      if (featureData && typeof featureData === 'object') {
        Object.entries(featureData).forEach(([k, v]) => {
          if (
            k !== 'properties' &&
            vars[k] === undefined &&
            (typeof v === 'string' ||
              typeof v === 'number' ||
              typeof v === 'boolean')
          ) {
            vars[k] = v as string | number;
          }
        });
      }
      if (Object.keys(vars).length > 0 && result.includes('{')) {
        result = parseTemplate(String(result)).expand(vars);
      }
    } catch {
      // Best-effort: fall back to other placeholder mechanisms
    }

    // Fallback: expand remaining placeholders directly from feature data
    return this.replacePlaceholders(result, featureData);
  }

  private buildQueryParams(
    paramsConfig: any,
    featureData: any
  ): Record<string, string> | undefined {
    if (!paramsConfig || typeof paramsConfig !== 'object') {
      return undefined;
    }

    const params: Record<string, string> = {};
    Object.entries(paramsConfig).forEach(([key, value]) => {
      if (typeof value === 'string') {
        params[key] = this.replacePlaceholders(value, featureData);
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        params[key] = String(value);
      } else if (typeof value === 'bigint') {
        params[key] = value.toString();
      } else if (typeof value === 'object' && value !== null) {
        params[key] = JSON.stringify(value);
      }
    });

    return params;
  }

  private executeSqlProxy(task: any, featureData: any): Observable<any> {
    const rawUrl = task?.url;
    if (!rawUrl) {
      return of({ error: 'No SQL proxy URL configured' });
    }

    const url = this.replacePlaceholders(String(rawUrl), featureData);
    const parameters = this.parseTaskParameters(task.parameters);
    if (task.parameters && parameters === null) {
      return of({ error: 'Invalid task parameters' });
    }

    const params = this.buildTaskParamQuery(parameters, featureData);
    return this.http.get(url, { params }).pipe(
      map((response) => ({ success: true, data: response })),
      catchError((error) => of({ error: error.message || 'SQL query failed' }))
    );
  }

  private parseTaskParameters(parameters: any): unknown {
    if (typeof parameters !== 'string') {
      return parameters;
    }

    try {
      return JSON.parse(parameters);
    } catch (error) {
      console.error('[MoreInfoService] Invalid task parameters:', error);
      return null;
    }
  }

  private buildTaskParamQuery(
    parameters: any,
    featureData: any
  ): Record<string, string> | undefined {
    if (!parameters || typeof parameters !== 'object') {
      return undefined;
    }

    const entries = Object.entries(parameters).filter(([, config]) =>
      this.isSqlParamConfig(config)
    );
    if (entries.length === 0) {
      return undefined;
    }

    const params: Record<string, string> = {};
    entries.forEach(([paramName, config]) => {
      const key = this.normalizeParamKey(paramName);
      if (!key) {
        return;
      }

      const value = this.getSqlParamValue(featureData, paramName, config);
      if (value !== undefined) {
        if (
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean'
        ) {
          params[key] = String(value);
        } else if (typeof value === 'bigint') {
          params[key] = value.toString();
        } else if (typeof value === 'object' && value !== null) {
          params[key] = JSON.stringify(value);
        }
      }
    });

    return Object.keys(params).length > 0 ? params : undefined;
  }

  private isSqlParamConfig(config: any): boolean {
    return (
      config &&
      typeof config === 'object' &&
      ('label' in config || 'value' in config || 'name' in config)
    );
  }

  private getSqlParamValue(
    featureData: any,
    paramName: string,
    config: any
  ): any {
    const candidates = [config?.value, config?.name, paramName].filter(
      (entry) => typeof entry === 'string' && entry.length > 0
    );

    for (const key of candidates) {
      const directOrPath = this.getValueByPath(featureData, key);
      if (directOrPath !== undefined) {
        return directOrPath;
      }

      const normalized = this.normalizeKey(key);
      const normalizedValue = this.getValueByPath(featureData, normalized);
      if (normalizedValue !== undefined) return normalizedValue;
    }

    return undefined;
  }

  private getValueByPath(data: any, path: string): any {
    if (!data || !path) return undefined;
    const trimmed = path.trim();
    if (!trimmed) return undefined;

    // Direct key
    if (Object.prototype.hasOwnProperty.call(data, trimmed)) {
      const direct = data[trimmed];
      if (direct !== undefined) return direct;
    }

    // Dotted path
    if (!trimmed.includes('.')) return undefined;
    const parts = trimmed.split('.').filter(Boolean);
    let cur: any = data;
    for (const part of parts) {
      if (cur == null) return undefined;
      cur = cur[part];
    }
    return cur;
  }

  private normalizeKey(value: string): string {
    return value.toLowerCase().split(/\s+/g).join('');
  }

  private normalizeParamKey(value: string): string {
    const trimmed = value.trim();
    const patterns = [
      /^\$\{(.+)\}$/,
      /^\{(.+)\}$/,
      /^\{\{(.+)\}\}$/,
      /^\$(.+)\$$/
    ];
    for (const pattern of patterns) {
      const match = pattern.exec(trimmed);
      if (match) {
        return match[1].trim();
      }
    }
    return trimmed;
  }

  /**
   * Checks if a label is a legacy token format (e.g., "$CODI$", "${var}", "{{var}}").
   * The new backend sets label to the plain variable name, so we must distinguish
   * between legacy tokens (which need string replacement) and modern variable names.
   */
  private isLegacyToken(label: string): boolean {
    const trimmed = label.trim();
    return (
      /^\$\{.+\}$/.test(trimmed) || // ${var}
      /^\$[^$]+\$$/.test(trimmed) || // $VAR$
      /^\{\{.+\}\}$/.test(trimmed) // {{var}}
    );
  }
}
