import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AppCfg, AppTasks } from '@api/model/app-cfg';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { LanguageService } from './language.service';
import { environment } from '../../environments/environment';

/**
 * Represents a child task inside a More Info Advanced (MIA) task.
 */
export interface MiaChildTask {
  id: string;
  name: string;
  order: number;
  childType: 'query' | 'template' | 'documentExport';
  parameters: Record<string, unknown> | null;
  childTaskParameters?: Record<string, Record<string, unknown>> | null;
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
  taskId: number;
  output: 'pdf';
  label?: string | null;
}

export interface TemplateExportRequest {
  template: string;
  output: 'pdf';
  taskId: number;
  templateTaskId?: number | null;
  applicationId: number;
  territoryId: number;
}

interface MiaRenderResponse {
  tasks?: MiaRenderedTask[];
}

export interface MiaViewerContext {
  featureBbox?: number[] | null;
  applicationId: number;
  territoryId: number;
}

interface MiaConfigTask extends AppTasks {
  downloadFormat?: unknown;
  filename?: unknown;
  mimeType?: unknown;
  output?: unknown;
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
  private appId: number | null = null;
  private terId: number | null = null;

  constructor(
    private readonly http: HttpClient,
    private readonly languageService: LanguageService
  ) {}
  /**
   * Map session coordinates required by backend MIA render authz.
   * Omit → backend 400 / wrong-context security hole.
   */
  setMapContext(appId: number, terId: number): void {
    this.appId = Number.isFinite(appId) ? appId : null;
    this.terId = Number.isFinite(terId) ? terId : null;
  }

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

    config.tasks.forEach((task) => {
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

    config.tasks.forEach((task) => {
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

    return Array.from(new Map(actions.map((action) => [`${action.taskId}:${action.output}`, action])).values());
  }

  renderMiaTasks(
    miaTasks: MiaTask[],
    featureData: unknown,
    viewerContext?: MiaViewerContext
  ): Observable<MiaRenderedTask[]> {
    // Required for backend authz; omit -> 400 / wrong map-session context.
    // One error per requested task id so overlay fill can replace each spinner.
    if (this.appId == null || this.terId == null) {
      return of(
        miaTasks.map((task) => ({
          taskId: this.parseTaskId(task.id),
          title: task.name || '',
          html: '',
          error: 'MIA render requires appId and terId from the map session',
        })),
      );
    }

    const neededFields = this.extractNeededFields(miaTasks);
    const miaTaskIds = miaTasks.map((task) => this.parseTaskId(task.id)).filter(Number.isFinite);
    const body: Record<string, unknown> = {
      miaTaskIds,
      appId: this.appId,
      terId: this.terId,
      parameters: this.filterFeatureParameters(featureData, neededFields)
    };
    if (this.isValidBbox(viewerContext?.featureBbox)) {
      body['featureBbox'] = viewerContext.featureBbox;
    }
    const lang = this.languageService.getCurrentLanguage()?.trim();
    const options = lang ? { params: { lang } } : {};

    return this.http.post<MiaRenderResponse>(
      `${environment.apiUrl}/api/tasks/template/more-info-advanced/render`,
      body,
      options
    ).pipe(
      map((response) => response.tasks || []),
      catchError((error) =>
        of(
          miaTasks.map((task) => ({
            taskId: this.parseTaskId(task.id),
            title: task.name || '',
            html: '',
            error: error.message || 'MIA rendering failed',
          })),
        ),
      ),
    );
  }

  /**
   * Exports a rendered template to a downloadable file.
   *
   * @param request Export content and current authorized profile context.
   * @returns An Observable that emits the raw Blob for the browser to download.
   */
  exportTemplate(request: TemplateExportRequest): Observable<TemplateExportResult> {
    return this.http.post(
      `${environment.apiUrl}/api/tasks/template/export`,
      this.buildTemplateExportXml({
        ...request,
        templateTaskId: request.templateTaskId ?? undefined
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
    output: 'pdf';
    template: string;
    taskId: number;
    templateTaskId?: number;
    applicationId: number;
    territoryId: number;
  }): string {
    const output = this.escapeXml(request.output);
    const template = `<template><![CDATA[${this.escapeCdata(request.template)}]]></template>`;
    const taskId = `<taskId>${request.taskId}</taskId>`;
    const templateTaskId = request.templateTaskId == null ? '' : `<templateTaskId>${request.templateTaskId}</templateTaskId>`;
    const applicationId = `<applicationId>${request.applicationId}</applicationId>`;
    const territoryId = `<territoryId>${request.territoryId}</territoryId>`;

    return `<templateExportRequest><output>${output}</output>${template}${taskId}${templateTaskId}${applicationId}${territoryId}</templateExportRequest>`;
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
                  fields.add(String(val.value));
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
    featureData: unknown,
    neededFields: Set<string> | null
  ): Record<string, unknown> {
    if (!featureData || typeof featureData !== 'object') {
      return {};
    }
    const filtered: Record<string, unknown> = {};
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

  private parseMiaTask(task: AppTasks): MiaTask | null {
    const params = this.asRecord(task.parameters);
    const cartographyId = task.cartographyId || params['cartographyId'];
    if (!cartographyId) {
      return null;
    }

    const visualizationMode =
      params['visualizationMode'] === 'scroll' ? 'scroll' : 'tabs';

    const rawIncluded = Array.isArray(params['includedTasks'])
      ? params['includedTasks']
      : [];
    const includedTasks: MiaChildTask[] = rawIncluded
      .map((rawChild) => {
        const child = this.asRecord(rawChild);
        const childType = this.resolveChildType(child['childType']);
        return {
          id: typeof child['id'] === 'string' ? child['id'] : '',
          name: typeof child['name'] === 'string' ? child['name'] : '',
          order: typeof child['order'] === 'number' ? child['order'] : 999,
          childType,
          parameters: this.asOptionalRecord(child['parameters']),
          childTaskParameters: this.asNestedRecord(child['childTaskParameters']),
        };
      })
      .sort((a, b) => a.order - b.order);

    return {
      id: task.id || '',
      name: task.name || (typeof params['title'] === 'string' ? params['title'] : ''),
      cartographyId: String(cartographyId),
      visualizationMode,
      includedTasks,
    };
  }

  private isMiaControlTask(task: AppTasks): boolean {
    return task?.['ui-control'] === 'sitna.moreInfoAdvanced'
      && task?.typeId === MoreInfoAdvancedService.BASIC_TASK_TYPE_ID;
  }

  private isRenderableMiaTask(task: AppTasks): boolean {
    const params = this.asRecord(task.parameters);
    return task?.typeId === MoreInfoAdvancedService.MIA_TASK_TYPE_ID
      && (params['advancedTaskKind'] == null || params['advancedTaskKind'] === 'parent')
      && !!(task.cartographyId || params['cartographyId']);
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

  private parseExportTask(task: MiaConfigTask): MiaExportAction | null {
    if (!this.isDiscoverableExportTask(task)) {
      return null;
    }

    const output = this.resolveExportOutput(task);
    const taskId = this.parseOptionalTaskId(task?.id);
    if (!output || taskId == null) {
      return null;
    }

    return {
      taskId,
      output,
      label: typeof task?.name === 'string' && task.name.trim().length > 0 ? task.name.trim() : null,
    };
  }

  private isDiscoverableExportTask(task: MiaConfigTask): boolean {
    return task?.typeId === MoreInfoAdvancedService.DOCUMENT_EXPORT_TASK_TYPE_ID;
  }

  private resolveTaskCartographyId(task: MiaConfigTask): string | null {
    const params = this.asRecord(task.parameters);
    const directCartographyId = task.cartographyId || params['cartographyId'];
    if (directCartographyId != null && directCartographyId !== '') {
      return String(directCartographyId);
    }

    const layerId = typeof task?.layer === 'string' ? task.layer : '';
    const layerMatch = /^layer\/(\d+)$/.exec(layerId);
    return layerMatch ? layerMatch[1] : null;
  }

  private resolveExportOutput(task: MiaConfigTask): 'pdf' | null {
    const params = this.asRecord(task.parameters);
    const directOutput = this.readOutputCandidate(params['output'])
      || this.readOutputCandidate(params['downloadFormat'])
      || this.readOutputCandidate(task.output)
      || this.readOutputCandidate(task.downloadFormat);
    if (directOutput) {
      return directOutput;
    }

    const mimeType = typeof task?.mimeType === 'string' ? task.mimeType.toLowerCase() : '';
    if (mimeType.includes('pdf')) {
      return 'pdf';
    }
    const filename = typeof task?.filename === 'string' ? task.filename.toLowerCase() : '';
    if (filename.endsWith('.pdf')) {
      return 'pdf';
    }
    return null;
  }

  private readOutputCandidate(candidate: unknown): 'pdf' | null {
    if (typeof candidate === 'string') {
      return candidate.trim().toLowerCase() === 'pdf' ? 'pdf' : null;
    }
    if (candidate && typeof candidate === 'object' && 'value' in candidate) {
      return typeof candidate.value === 'string' && candidate.value.trim().toLowerCase() === 'pdf' ? 'pdf' : null;
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

  private isValidBbox(bbox: number[] | null | undefined): bbox is number[] {
    return Array.isArray(bbox)
      && bbox.length === 4
      && bbox.every((value) => typeof value === 'number' && Number.isFinite(value))
      && bbox[0] <= bbox[2]
      && bbox[1] <= bbox[3];
  }

  private asRecord(value: unknown): Record<string, unknown> {
    return value != null && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, unknown>
      : {};
  }

  private asOptionalRecord(value: unknown): Record<string, unknown> | null {
    return value != null && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, unknown>
      : null;
  }

  private asNestedRecord(value: unknown): Record<string, Record<string, unknown>> | null {
    if (value == null || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }
    const record = this.asRecord(value);
    const nestedEntries = Object.entries(record)
      .filter((entry): entry is [string, Record<string, unknown>] => {
        const nested = entry[1];
        return nested != null && typeof nested === 'object' && !Array.isArray(nested);
      });
    return Object.fromEntries(nestedEntries);
  }

}
