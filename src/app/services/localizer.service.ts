import { Injectable } from '@angular/core';

import { AppCfg } from '@api/model/app-cfg';

/**
 * Represents a single locator task (ui-control = 'sitmun.localizer').
 */
export interface LocalizerTask {
  id: string;
  name: string;
  url: string;
}

/** Module-level cache of localizer tasks for use in non-Angular control logic. */
let _tasks: LocalizerTask[] = [];

/**
 * Get the current localizer tasks (for use outside Angular DI).
 */
export function getLocalizerTasks(): LocalizerTask[] {
  return _tasks;
}

/**
 * Set the localizer tasks cache (called by LocalizerService after initialization).
 */
export function setLocalizerTasks(tasks: LocalizerTask[]): void {
  _tasks = tasks;
}

/**
 * Execute a search using a locator task (for use outside Angular DI).
 */
export async function executeLocalizerSearch(
  task: LocalizerTask,
  searchText: string
): Promise<any[]> {
  const url = task.url.replace(/\{text\}/gi, encodeURIComponent(searchText));
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      credentials: 'include'
    });
    if (!response.ok) {
      console.warn('[LocalizerService] Search request failed:', response.status);
      return [];
    }
    const data = await response.json();
    if (Array.isArray(data)) return data;
    if (data?.results && Array.isArray(data.results)) return data.results;
    if (data?.features && Array.isArray(data.features)) return data.features;
    return [];
  } catch (error) {
    console.error('[LocalizerService] Search error:', error);
    return [];
  }
}

/**
 * Service for handling Localizer functionality.
 * Stores all locator tasks and exposes search execution.
 */
@Injectable({
  providedIn: 'root'
})
export class LocalizerService {
  private tasks: LocalizerTask[] = [];

  initialize(config: AppCfg): void {
    this.tasks = [];
    if (!config?.tasks) {
      return;
    }
    config.tasks.forEach((task: any) => {
      if (task['ui-control'] === 'sitmun.localizer') {
        this.tasks.push({
          id: String(task.id),
          name: task.name || '',
          url: task.url || ''
        });
      }
    });
    // Sync to module-level cache for non-Angular control logic
    setLocalizerTasks(this.tasks);
  }
}
