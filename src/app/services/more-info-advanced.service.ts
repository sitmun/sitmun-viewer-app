import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
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
  childType: 'query' | 'template' | 'documentExport';
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

export interface TemplateExportResult {
  blob: Blob;
  filename: string | null;
}

export interface MiaExportAction {
  taskId: number | null;
  output: string;
  label?: string | null;
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
  private static readonly TEMPLATE_EXPORT_HEADERS = new HttpHeaders({
    'Content-Type': 'application/xml'
  });

  private static readonly BASIC_TASK_TYPE_ID = 1;
  private static readonly DOCUMENT_EXPORT_TASK_TYPE_ID = 17;
  private static readonly MIA_TASK_TYPE_ID = 16;

  private readonly miaTasksByCartography = new Map<string, MiaTask[]>();
  private readonly exportActionsByCartography = new Map<string, MiaExportAction[]>();
  private globalExportActions: MiaExportAction[] = [];
  private hasMiaControlTask = false;

  constructor(private readonly http: HttpClient) {}

  /**
   * Initializes MIA tasks from the application configuration.
   * Extracts tasks with ui-control 'sitna.moreInfoAdvanced' and indexes by cartographyId.
   */
  initialize(config: AppCfg): void {
    this.miaTasksByCartography.clear();
    this.exportActionsByCartography.clear();
    this.globalExportActions = [];
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

    config.tasks.forEach((task: any) => {
      const exportAction = this.parseExportTask(task);
      if (!exportAction) {
        return;
      }

      const cartographyId = this.resolveTaskCartographyId(task);
      if (cartographyId == null || cartographyId === '') {
        this.globalExportActions.push(exportAction);
        return;
      }

      const key = String(cartographyId);
      const existing = this.exportActionsByCartography.get(key) || [];
      existing.push(exportAction);
      this.exportActionsByCartography.set(key, existing);
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

  getExportActionsForCartography(cartographyId: string): MiaExportAction[] {
    const key = String(cartographyId);
    const actions = [
      ...this.globalExportActions,
      ...(this.exportActionsByCartography.get(key) || [])
    ];

    return Array.from(new Map(actions.map((action) => [`${action.taskId ?? 'none'}:${action.output}`, action])).values());
  }

  renderMiaTasks(miaTasks: MiaTask[], featureData: any): Observable<MiaRenderedTask[]> {    const neededFields = this.extractNeededFields(miaTasks);
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
   * Exports a rendered template to a downloadable file.
   *
   * @param template  The rendered HTML content of the template (for PDF output).
   * @param output    The desired output format: "pdf", "xml", etc.
   * @param taskId    Optional template task id used by the backend to validate enabled outputs.
   * @returns An Observable that emits the raw Blob for the browser to download.
   */
  exportTemplate(
    template: string,
    output: string,
    taskId?: number | null,
    templateTaskId?: number | null
  ): Observable<TemplateExportResult> {
    return this.http.post(
      `${environment.apiUrl}/api/tasks/template/export`,
      this.buildTemplateExportXml({
        template,
        output,
        taskId: taskId ?? undefined,
        templateTaskId: templateTaskId ?? undefined
      }),
      {
        headers: MoreInfoAdvancedService.TEMPLATE_EXPORT_HEADERS,
        responseType: 'blob',
        observe: 'response'
      }
    ).pipe(
      map((response: HttpResponse<Blob>) => ({
        blob: response.body ?? new Blob(),
        filename: this.extractFilename(response)
      }))
    );
  }

  private extractFilename(response: HttpResponse<Blob>): string | null {
    const contentDisposition = response.headers.get('Content-Disposition');
    if (!contentDisposition) {
      return null;
    }

    const encodedFilenameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (encodedFilenameMatch?.[1]) {
      try {
        return decodeURIComponent(encodedFilenameMatch[1]);
      } catch {
        return encodedFilenameMatch[1];
      }
    }

    const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
    return filenameMatch?.[1] ?? null;
  }

  private buildTemplateExportXml(request: {
    output: string;
    template?: string;
    taskId?: number;
    templateTaskId?: number;
  }): string {
    const output = this.escapeXml(request.output);
    const template = request.template == null ? '' : `<template><![CDATA[${this.escapeCdata(request.template)}]]></template>`;
    const taskId = request.taskId == null ? '' : `<taskId>${request.taskId}</taskId>`;
    const templateTaskId = request.templateTaskId == null ? '' : `<templateTaskId>${request.templateTaskId}</templateTaskId>`;

    return `<templateExportRequest><output>${output}</output>${template}${taskId}${templateTaskId}</templateExportRequest>`;
  }

  private escapeXml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private escapeCdata(value: string): string {
    return value.replace(/]]>/g, ']]]]><![CDATA[>');
  }

  /**
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
      .map((child: any) => {
        const childType = this.resolveChildType(child?.childType);
        return {
          id: child.id || '',
          name: child.name || '',
          order: typeof child.order === 'number' ? child.order : 999,
          childType,
          parameters: child.parameters || null,
          childTaskParameters: child.childTaskParameters || null,
        };
      })
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

  private resolveChildType(rawChildType: unknown): MiaChildTask['childType'] {
    if (rawChildType === 'template') {
      return 'template';
    }
    if (rawChildType === 'documentExport') {
      return 'documentExport';
    }
    return 'query';
  }

  private parseExportTask(task: any): MiaExportAction | null {
    if (!this.isDiscoverableExportTask(task)) {
      return null;
    }

    const output = this.resolveExportOutput(task);
    if (!output) {
      return null;
    }

    return {
      taskId: this.parseOptionalTaskId(task?.id),
      output,
      label: typeof task?.name === 'string' && task.name.trim().length > 0 ? task.name.trim() : null,
    };
  }

  private isDiscoverableExportTask(task: any): boolean {
    return task?.typeId === MoreInfoAdvancedService.DOCUMENT_EXPORT_TASK_TYPE_ID;
  }

  private resolveTaskCartographyId(task: any): string | null {
    const directCartographyId = task?.cartographyId || task?.parameters?.cartographyId;
    if (directCartographyId != null && directCartographyId !== '') {
      return String(directCartographyId);
    }

    const layerId = typeof task?.layer === 'string' ? task.layer : '';
    const layerMatch = /^layer\/(\d+)$/.exec(layerId);
    return layerMatch ? layerMatch[1] : null;
  }

  private resolveExportOutput(task: any): string | null {
    const params = task?.parameters || {};
    const directOutput = this.readOutputCandidate(params.output)
      || this.readOutputCandidate(params.downloadFormat)
      || this.readOutputCandidate(task?.output)
      || this.readOutputCandidate(task?.downloadFormat);
    if (directOutput) {
      return directOutput;
    }

    const mimeType = typeof task?.mimeType === 'string' ? task.mimeType.toLowerCase() : '';
    if (mimeType.includes('pdf')) {
      return 'pdf';
    }
    if (mimeType.includes('xml')) {
      return 'xml';
    }

    const filename = typeof task?.filename === 'string' ? task.filename.toLowerCase() : '';
    if (filename.endsWith('.pdf')) {
      return 'pdf';
    }
    if (filename.endsWith('.xml') || filename.endsWith('.jrxml')) {
      return 'xml';
    }

    return null;
  }

  private readOutputCandidate(candidate: unknown): string | null {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim().toLowerCase();
    }
    if (candidate && typeof candidate === 'object' && 'value' in candidate) {
      const rawValue = (candidate as any).value;
      return typeof rawValue === 'string' && rawValue.trim().length > 0
        ? rawValue.trim().toLowerCase()
        : null;
    }
    return null;
  }

  private parseOptionalTaskId(id: unknown): number | null {
    if (typeof id === 'number') {
      return Number.isFinite(id) ? id : null;
    }
    if (typeof id === 'string' && id.length > 0) {
      const parsed = this.parseTaskId(id);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }

}
