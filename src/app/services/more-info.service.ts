import { HttpClient } from '@angular/common/http';
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
    this.moreInfoTasks.clear();
    if (!config?.tasks) {
      console.warn('[MoreInfoService] No tasks in config');
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
    let parameters = task.parameters;
    if (typeof parameters === 'string') {
      try {
        parameters = JSON.parse(parameters);
      } catch (error) {
        console.error('[MoreInfoService] Invalid task parameters:', error);
        return of({ error: 'Invalid task parameters' });
      }
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
    return this.http.post(apiUrl, { sql }).pipe(
      map((response) => ({ success: true, data: response })),
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
}
