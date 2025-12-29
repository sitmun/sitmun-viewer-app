/**
 * Utility functions for handling RFC 9457 Problem Detail error responses
 */

/**
 * Extracts the problem type slug from a problem detail URI
 *
 * @param error The HTTP error response
 * @returns The problem type slug (e.g., "unauthorized") or null if not found
 */
export function extractProblemType(error: any): string | null {
  const problemType = error?.error?.type;
  
  if (!problemType || typeof problemType !== 'string') {
    return null;
  }
  
  // Extract last segment from URI: https://sitmun.org/problems/unauthorized → unauthorized
  const match = problemType.match(/\/problems\/([a-z-]+)$/);
  return match ? match[1] : null;
}

/**
 * Gets the i18n translation key for a problem detail error
 *
 * @param error The HTTP error response
 * @returns The translation key (e.g., "error.unauthorized")
 */
export function getProblemTranslationKey(error: any): string {
  const problemType = extractProblemType(error);
  if (!problemType) {
    return 'common.error.generic';
  }
  
  // Provide more specific translations for data integrity violations
  // based on HTTP status code (409 Conflict vs 422 Unprocessable Entity)
  if (problemType === 'data-integrity-violation') {
    if (error.status === 409) {
      return 'error.data-integrity-violation.conflict'; // Duplicate/conflict
    } else if (error.status === 422) {
      return 'error.data-integrity-violation.constraint'; // FK/constraint
    }
  }
  
  return `error.${problemType}`;
}

/**
 * Checks if an error response is in RFC 9457 Problem Detail format
 *
 * @param error The HTTP error response
 * @returns true if the error is a Problem Detail, false otherwise
 */
export function isProblemDetail(error: any): boolean {
  return error?.error?.type?.includes('/problems/') === true;
}

/**
 * Gets a human-readable error message from a problem detail or falls back to legacy format
 *
 * @param error The HTTP error response
 * @returns The error message to display
 */
export function getErrorMessage(error: any): string {
  if (isProblemDetail(error)) {
    // RFC 9457 format
    return error.error.detail || error.error.title || 'An error occurred';
  } else {
    // Legacy format
    return error.error?.message || error.message || 'An error occurred';
  }
}

