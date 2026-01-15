import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ErrorEntry {
  id: string;
  timestamp: Date;
  message: string;
  details?: any;
  type: 'http' | 'logger' | 'uncaught';
  httpStatus?: number;
  url?: string;
  stackTrace?: string;
  reviewed: boolean;
}

/**
 * Service for tracking and managing application errors.
 * TODO: Add unit tests (error-tracking.service.spec.ts)
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorTrackingService {
  private readonly MAX_ERRORS = 10;
  private errors: ErrorEntry[] = [];
  private errorsSubject = new BehaviorSubject<ErrorEntry[]>([]);

  constructor() {}

  /**
   * Observable for error list changes
   */
  get errors$(): Observable<ErrorEntry[]> {
    return this.errorsSubject.asObservable();
  }

  /**
   * Add a new error to the tracking list
   */
  addError(
    message: string,
    type: 'http' | 'logger' | 'uncaught',
    context?: {
      details?: any;
      httpStatus?: number;
      url?: string;
      stackTrace?: string;
    }
  ): void {
    const error: ErrorEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      message,
      type,
      reviewed: false,
      ...context
    };

    // Add to beginning of array
    this.errors.unshift(error);

    // Keep only last MAX_ERRORS errors
    if (this.errors.length > this.MAX_ERRORS) {
      this.errors = this.errors.slice(0, this.MAX_ERRORS);
    }

    this.errorsSubject.next([...this.errors]);
  }

  /**
   * Get all errors
   */
  getErrors(): ErrorEntry[] {
    return [...this.errors];
  }

  /**
   * Get count of unreviewed errors
   */
  getUnreviewedCount(): number {
    return this.errors.filter((e) => !e.reviewed).length;
  }

  /**
   * Mark all errors as reviewed
   */
  markAsReviewed(): void {
    this.errors.forEach((error) => {
      error.reviewed = true;
    });
    this.errorsSubject.next([...this.errors]);
  }

  /**
   * Mark a specific error as reviewed
   * @param errorToMark The error entry to mark as reviewed
   */
  markErrorAsReviewed(errorToMark: ErrorEntry): void {
    const index = this.errors.findIndex((error) => error.id === errorToMark.id);
    if (index !== -1) {
      this.errors[index].reviewed = true;
      this.errorsSubject.next([...this.errors]);
    }
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors = [];
    this.errorsSubject.next([]);
  }

  /**
   * Generate unique ID for error entry
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
