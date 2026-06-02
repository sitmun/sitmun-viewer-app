import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AppCfg } from '@api/model/app-cfg';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

/**
 * Represents a child task inside a More Info Advanced (MIA) task.
 */
export interface MiaChildTask {
  id: string;
  name: string;
  order: number;
  childType: 'query' | 'template';
  parameters: Record<string, any> | null;
  childTaskParameters?: Record<string, Record<string, any>> | null;
}

/**
 * Represents a registered MIA task with its configuration.
 */
export interface MiaTask {
  id: string;
  name: string;
  cartographyId: string;
  visualizationMode: 'tabs' | 'scroll';
  includedTasks: MiaChildTask[];
}

export interface MiaRenderedTask {
  taskId: number;
  title: string;
  html: string;
  error?: string | null;
}

interface MiaRenderResponse {
  tasks?: MiaRenderedTask[];
}

/**
 * Service for handling "More Info Advanced" (MIA) functionality.
 * MIA tasks are composite tasks that group multiple child queries/templates
 * and display them in a floating modal with tabs or scroll mode.
 */
@Injectable({
  providedIn: 'root'
})
export class MoreInfoAdvancedService {
  private static readonly BASIC_TASK_TYPE_ID = 1;
  private static readonly MIA_TASK_TYPE_ID = 16;

  private readonly miaTasksByCartography = new Map<string, MiaTask[]>();
  private hasMiaControlTask = false;

  constructor(private readonly http: HttpClient) {}

  /**
   * Initializes MIA tasks from the application configuration.
   * Extracts tasks with ui-control 'sitna.moreInfoAdvanced' and indexes by cartographyId.
   */
  initialize(config: AppCfg): void {
    this.miaTasksByCartography.clear();
    this.hasMiaControlTask = false;
    if (!config?.tasks) {
      return;
    }

    config.tasks.forEach((task: any) => {
      if (this.isMiaControlTask(task)) {
        this.hasMiaControlTask = true;
      }

      if (this.isRenderableMiaTask(task)) {
        const miaTask = this.parseMiaTask(task);
        if (miaTask) {
          const key = miaTask.cartographyId;
          const existing = this.miaTasksByCartography.get(key) || [];
          existing.push(miaTask);
          this.miaTasksByCartography.set(key, existing);
        }
      }
    });
  }

  /**
   * Returns all MIA tasks for a given cartography ID.
   */
  getTasksForCartography(cartographyId: string): MiaTask[] {
    const tasks = this.miaTasksByCartography.get(String(cartographyId)) || [];
    return tasks.sort((a, b) => this.parseTaskId(a.id) - this.parseTaskId(b.id));
  }

  /**
   * Returns true if any MIA tasks are registered.
   */
  hasMiaTasks(): boolean {
    return this.hasMiaControlTask && this.miaTasksByCartography.size > 0;
  }

  renderMiaTasks(miaTasks: MiaTask[], featureData: any): Observable<MiaRenderedTask[]> {
    const neededFields = this.extractNeededFields(miaTasks);
    const body = {
      miaTaskIds: miaTasks.map((task) => this.parseTaskId(task.id)).filter(Number.isFinite),
      parameters: this.filterFeatureParameters(featureData, neededFields)
    };

    return this.http.post<MiaRenderResponse>(
      `${environment.apiUrl}/api/tasks/template/more-info-advanced/render`,
      body
    ).pipe(
      map((response) => response.tasks || []),
      catchError((error) => of([{
        taskId: 0,
        title: '',
        html: '',
        error: error.message || 'MIA rendering failed'
      }]))
    );
  }

  /**
   * Extract the set of feature field names that are referenced
   * by child task parameter mappings.
   * Returns null if we cannot determine (meaning send all short fields).
   */
  private extractNeededFields(miaTasks: MiaTask[]): Set<string> | null {
    const fields = new Set<string>();
    let hasTemplateChild = false;

    for (const miaTask of miaTasks) {
      for (const child of miaTask.includedTasks) {
        // Template children may use any field in their HTML - we can't know which
        if (child.childType === 'template') {
          hasTemplateChild = true;
        }
        // Extract field references from parameter mappings
        if (child.parameters) {
          for (const value of Object.values(child.parameters)) {
            if (typeof value === 'string') {
              fields.add(value);
            } else if (value && typeof value === 'object' && 'value' in value) {
              fields.add(String(value.value));
            }
          }
        }
        // Extract from childTaskParameters
        if (child.childTaskParameters) {
          for (const taskParams of Object.values(child.childTaskParameters)) {
            if (taskParams && typeof taskParams === 'object') {
              for (const val of Object.values(taskParams)) {
                if (typeof val === 'string') {
                  fields.add(val);
                } else if (val && typeof val === 'object' && 'value' in val) {
                  fields.add(String((val as any).value));
                }
              }
            }
          }
        }
      }
    }

    // If there are template children, or the application config did not expose
    // child parameter mappings, we cannot determine the exact needed fields.
    // Return null to signal "keep all short fields".
    return hasTemplateChild || fields.size === 0 ? null : fields;
  }

  /**
   * Filter feature parameters to reduce payload size.
   * If neededFields is provided, only keep those fields.
   * If null (template children present), keep all fields except injected HTML and very long strings.
   */
  private filterFeatureParameters(
    featureData: any,
    neededFields: Set<string> | null
  ): Record<string, any> {
    if (!featureData || typeof featureData !== 'object') {
      return {};
    }
    const filtered: Record<string, any> = {};
    for (const [key, value] of Object.entries(featureData)) {
      // Always skip MoreInfo injected HTML fields
      if (typeof value === 'string' && value.includes('sitmun-more-info-')) {
        continue;
      }
      if (neededFields !== null) {
        // Strict mode: only send referenced fields
        if (!neededFields.has(key)) {
          continue;
        }
      } else {
        // Permissive mode (template children): skip long strings (> 500 chars)
        if (typeof value === 'string' && value.length > 500) {
          continue;
        }
      }
      filtered[key] = value;
    }
    return filtered;
  }

  private parseTaskId(id: string): number {
    const match = /(?:^|\/)\d+$/.exec(id);
    return match ? Number(match[0].replace('/', '')) : Number(id);
  }

  private parseMiaTask(task: any): MiaTask | null {
    const params = task.parameters || {};
    const cartographyId = task.cartographyId || params.cartographyId;
    if (!cartographyId) {
      return null;
    }

    const visualizationMode =
      params.visualizationMode === 'scroll' ? 'scroll' : 'tabs';

    const rawIncluded: any[] = Array.isArray(params.includedTasks)
      ? params.includedTasks
      : [];
    const includedTasks: MiaChildTask[] = rawIncluded
      .map((child: any) => ({
        id: child.id || '',
        name: child.name || '',
        order: typeof child.order === 'number' ? child.order : 999,
        childType: child.childType === 'template' ? 'template' as const : 'query' as const,
        parameters: child.parameters || null,
        childTaskParameters: child.childTaskParameters || null,
      }))
      .sort((a, b) => a.order - b.order);

    return {
      id: task.id || '',
      name: task.name || params.title || '',
      cartographyId: String(cartographyId),
      visualizationMode,
      includedTasks,
    };
  }

  private isMiaControlTask(task: any): boolean {
    return task?.['ui-control'] === 'sitna.moreInfoAdvanced'
      && task?.typeId === MoreInfoAdvancedService.BASIC_TASK_TYPE_ID;
  }

  private isRenderableMiaTask(task: any): boolean {
    const params = task?.parameters || {};
    return task?.typeId === MoreInfoAdvancedService.MIA_TASK_TYPE_ID
      && (params.advancedTaskKind == null || params.advancedTaskKind === 'parent')
      && !!(task.cartographyId || params.cartographyId);
  }

}
