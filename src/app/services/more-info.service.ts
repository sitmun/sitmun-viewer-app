import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AppCfg } from '@api/model/app-cfg';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

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
    console.info('[MoreInfo] initialize start', {
      hasTasks: Array.isArray(config?.tasks),
      taskCount: Array.isArray(config?.tasks) ? config.tasks.length : 0
    });
    this.moreInfoTasks.clear();
    if (!config?.tasks) {
      console.warn('[MoreInfoService] No tasks in config');
      return;
    }

    config.tasks.forEach((task: any) => {
      if (task['ui-control'] === 'sitna.moreInfo') {
        console.info('[MoreInfo] task found', {
          id: task?.id,
          scope: task?.scope,
          hasUrl: !!task?.url
        });
        const cartographyId = this.extractCartographyId(task);
        if (cartographyId) {
          const key = String(cartographyId);
          const existingTasks = this.moreInfoTasks.get(key) || [];
          existingTasks.push(task);
          this.moreInfoTasks.set(key, existingTasks);
        }

      }
    });

    console.info('[MoreInfo] initialize end', {
      moreInfoTaskGroups: this.moreInfoTasks.size
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
    console.info('[MoreInfo] executeMoreInfo', {
      taskId: task?.id,
      scope: task?.scope,
      hasFeatureData: !!featureData
    });
    const parameters = this.parseTaskParameters(task.parameters);
    if (task.parameters && parameters === null) {
      return of({ error: 'Invalid task parameters' });
    }

    if (task?.scope === 'SQL') {
      return this.executeSqlProxy(task, featureData);
    }

    const queryType = parameters?.queryType || 'url';
    switch (queryType) {
      case 'url':
        return this.executeUrlQuery(task, featureData);
      case 'sql':
        return this.executeSqlQuery(parameters, featureData);
      default:
        return of({ error: 'Unknown query type: ' + queryType });
    }
  }

  private executeUrlQuery(task: any, featureData: any): Observable<any> {
    const urlTemplate = task.command;
    if (!urlTemplate) {
      return of({ error: 'No URL configured in task command' });
    }

    const url = this.replacePlaceholders(urlTemplate, featureData);
    window.open(url, '_blank');
    return of({ success: true, url });
  }

  private executeSqlQuery(parameters: any, featureData: any): Observable<any> {
    const sqlTemplate = parameters?.sql || parameters?.sqlTemplate;
    const apiUrl = parameters?.apiUrl;
    if (!sqlTemplate || !apiUrl) {
      return of({ error: 'SQL template or API URL not configured' });
    }

    const sql = this.replacePlaceholders(sqlTemplate, featureData);
    return this.http.get(apiUrl, { params: { sql } }).pipe(
      map((response) => {
        console.log('RESPONSE: ', response);
        return { success: true, data: response };
      }),
      catchError((error) => of({ error: error.message || 'SQL query failed' }))
    );
  }

  private replacePlaceholders(template: string, data: any): string {
    let result = template;
    const patterns = [/\{([^}]+)\}/g, /\$\{([^}]+)\}/g, /\{\{([^}]+)\}\}/g];
    patterns.forEach((pattern) => {
      result = result.replace(pattern, (_match, key) => {
        const value = data[key.trim()];
        return value === undefined ? '' : String(value);
      });
    });
    return result;
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

    const paramPayload = this.buildSqlParamPayload(parameters, featureData);
    if (paramPayload) {
      console.info('[MoreInfo] SQL param payload', {
        url,
        length: paramPayload.length
      });
      const headers = new HttpHeaders({
        'Content-Type': 'application/xml; charset=utf-8',
        Accept: 'application/xml, text/xml, */*'
      });
      return this.http.post(url, paramPayload, { headers }).pipe(
        map((response) => ({ success: true, data: response })),
        catchError((error) =>
          of({ error: error.message || 'SQL query failed' })
        )
      );
    }

    return this.http.get(url).pipe(
      map((response) => ({ success: true, data: response })),
      catchError((error) => of({ error: error.message || 'SQL query failed' }))
    );
  }

  private parseTaskParameters(parameters: any): any | null {
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

  private buildSqlParamPayload(
    parameters: any,
    featureData: any
  ): string | null {
    if (!parameters || typeof parameters !== 'object') {
      return null;
    }

    const entries = Object.entries(parameters).filter(([, config]) =>
      this.isSqlParamConfig(config)
    );

    if (entries.length === 0) {
      return null;
    }

    const paramFields = entries
      .map(([paramName, config]) => {
        const value = this.getSqlParamValue(
          featureData,
          paramName,
          config as any
        );
        return (
          '<param>' +
          '<key>' + paramName + '</key>' +
          '<value>' + (value == null ? '' : String(value)) + '</value>' +
          '</param>'
        );
      })
      .join('\n');

    return paramFields;
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
      const direct = featureData?.[key];
      if (direct !== undefined) {
        return direct;
      }

      const normalized = this.normalizeKey(key);
      const normalizedValue = featureData?.[normalized];
      if (normalizedValue !== undefined) {
        return normalizedValue;
      }
    }

    return undefined;
  }

  private normalizeKey(value: string): string {
    return value.toLowerCase().replace(/\s+/g, '');
  }

}
