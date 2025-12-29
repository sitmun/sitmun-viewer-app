/**
 * RFC 9457 Problem Details for HTTP APIs
 *
 * Standard error response format that provides machine-readable error details.
 * The `type` field contains a URI that identifies the problem type and can be
 * used as an i18n translation key.
 *
 * @see https://www.rfc-editor.org/rfc/rfc9457.html
 */
export interface ProblemDetail {
  /** URI reference identifying the problem type (e.g., "https://sitmun.org/problems/unauthorized") */
  type: string;

  /** HTTP status code */
  status: number;

  /** Short, human-readable summary of the problem type */
  title: string;

  /** Human-readable explanation specific to this occurrence */
  detail: string;

  /** URI reference identifying this specific occurrence */
  instance: string;

  /** Optional extension members */
  [key: string]: any;
}

/**
 * RFC 9457 Problem Detail with validation errors
 *
 * Extended format for validation errors that includes field-specific error details.
 */
export interface ValidationProblemDetail extends ProblemDetail {
  /** List of field-specific validation errors */
  errors: FieldError[];
}

/**
 * Field-specific validation error
 */
export interface FieldError {
  /** The field name that has the validation error */
  field: string;

  /** The value that was provided and rejected */
  rejectedValue?: any;

  /** The expected type or format */
  expectedType?: string;

  /** The validation error message */
  message: string;
}

