/**
 * Type definitions for the meld AOP (Aspect-Oriented Programming) library
 * meld library version < 2.0.0
 */

export interface MeldAdvice {
  remove: () => void;
}

export interface MeldJoinPoint {
  target: unknown;
  method: string;
  args: unknown[];
  proceed: () => unknown;
  proceedApply: (args: unknown[]) => unknown;
  proceedCount: number;
  result?: unknown;
  exception?: unknown;
}

export interface Meld {
  before: (
    target: unknown,
    method: string,
    advice: (...args: unknown[]) => void
  ) => MeldAdvice;
  around: (
    target: unknown,
    method: string,
    advice: (joinPoint: MeldJoinPoint) => unknown
  ) => MeldAdvice;
  remove: (advice: MeldAdvice) => void;
}

/**
 * Interface for defining a method to patch
 */
export interface MethodPatchDefinition {
  target: unknown;
  methodName: string;
  path: string; // For logging purposes (e.g., 'TC.wrap.Map.prototype.insertLayer')
}

/**
 * Logger interface compatible with LoggingService
 */
export interface Logger {
  debug: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
}

/**
 * Type for patching a specific method with typed signature
 */
export type MethodPatch<T extends (...args: unknown[]) => unknown> = (
  original: T,
  ...args: Parameters<T>
) => ReturnType<T>;

/**
 * Type for method patches record
 *
 * Accepts functions where the first parameter (original) represents the original method.
 * This type intentionally uses unknown for flexibility while maintaining type safety.
 *
 * Usage pattern:
 * ```typescript
 * type LoadedMethod = (callback?: () => void) => Promise<void>;
 *
 * const patches: SitnaMethodPatches = {
 *   loaded: function(this: SitnaMap, original: LoadedMethod, callback?: () => void): Promise<void> {
 *     console.log('loaded called');
 *     return original.call(this, callback);
 *   }
 * };
 * ```
 */
export type SitnaMethodPatches = {
  [K in string]: (
    this: unknown,
    original: (...args: unknown[]) => unknown,
    ...args: unknown[]
  ) => unknown;
};

