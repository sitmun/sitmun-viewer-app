import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Service for managing UI state related to map control visibility.
 *
 * Replaces module-level state variables with Observable-based state management.
 * This enables testability, prevents race conditions, and follows Angular best practices.
 */
@Injectable({
  providedIn: 'root',
})
export class UIStateService {
  private showLegendButton = new BehaviorSubject<boolean>(false);
  private showOverviewMapButton = new BehaviorSubject<boolean>(false);
  private showToolsButton = new BehaviorSubject<boolean>(false);

  /**
   * Observable for legend button visibility state.
   */
  readonly showLegend$: Observable<boolean> = this.showLegendButton.asObservable();

  /**
   * Observable for overview map button visibility state.
   */
  readonly showOverviewMap$: Observable<boolean> = this.showOverviewMapButton.asObservable();

  /**
   * Observable for tools button visibility state.
   */
  readonly showTools$: Observable<boolean> = this.showToolsButton.asObservable();

  /**
   * Enable legend button visibility.
   */
  enableLegendButton(): void {
    this.showLegendButton.next(true);
  }

  /**
   * Disable legend button visibility.
   */
  disableLegendButton(): void {
    this.showLegendButton.next(false);
  }

  /**
   * Enable overview map button visibility.
   */
  enableOverviewMapButton(): void {
    this.showOverviewMapButton.next(true);
  }

  /**
   * Disable overview map button visibility.
   */
  disableOverviewMapButton(): void {
    this.showOverviewMapButton.next(false);
  }

  /**
   * Enable tools button visibility.
   */
  enableToolsButton(): void {
    this.showToolsButton.next(true);
  }

  /**
   * Disable tools button visibility.
   */
  disableToolsButton(): void {
    this.showToolsButton.next(false);
  }

  /**
   * Get current legend button visibility state (synchronous).
   *
   * @returns true if legend button should be shown
   */
  isLegendButtonEnabled(): boolean {
    return this.showLegendButton.value;
  }

  /**
   * Get current overview map button visibility state (synchronous).
   *
   * @returns true if overview map button should be shown
   */
  isOverviewMapButtonEnabled(): boolean {
    return this.showOverviewMapButton.value;
  }

  /**
   * Get current tools button visibility state (synchronous).
   *
   * @returns true if tools button should be shown
   */
  isToolsButtonEnabled(): boolean {
    return this.showToolsButton.value;
  }

  /**
   * Reset all button visibility states to false.
   */
  reset(): void {
    this.showLegendButton.next(false);
    this.showOverviewMapButton.next(false);
    this.showToolsButton.next(false);
  }
}

