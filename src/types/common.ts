/**
 * Common Types
 * Shared utility types across the application
 */

// Basic utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// Make properties readonly
export type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// Make specific properties optional
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Make specific properties required
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Extract function return type
export type AsyncReturnType<T extends (...args: unknown[]) => Promise<unknown>> = T extends (
  ...args: unknown[]
) => Promise<infer R>
  ? R
  : unknown;

// Configuration types
export interface BaseConfig {
  readonly budgetId: string;
  readonly encryptionKey: string;
}

// API Response wrapper
export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly timestamp: number;
}

// Event handler types
export type EventHandler<T = unknown> = (event: string, data: T) => void;
export type ErrorHandler = (error: Error | unknown) => void;

// Service status types
export interface ServiceStatus {
  readonly isRunning: boolean;
  readonly isInitialized: boolean;
  readonly lastActivity?: number;
  readonly errorCount?: number;
}

// Validation result types
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors?: string[];
  readonly warnings?: string[];
}

// Type guards for common patterns
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === "function";
}

export function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

export function isNotUndefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

// Safe parsing utilities
export function safeJsonParse<T = unknown>(jsonString: string, fallback?: T): T | null {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return fallback ?? null;
  }
}

export function safeStringify(
  value: unknown,
  replacer?: (key: string, value: unknown) => unknown
): string {
  try {
    return JSON.stringify(value, replacer);
  } catch {
    return JSON.stringify({ error: "Serialization failed" });
  }
}

// Async utilities
export type PromiseResolver<T> = (value: T | PromiseLike<T>) => void;
export type PromiseRejecter = (reason?: unknown) => void;

export interface PromiseWithResolvers<T> {
  promise: Promise<T>;
  resolve: PromiseResolver<T>;
  reject: PromiseRejecter;
}

export function createPromiseWithResolvers<T>(): PromiseWithResolvers<T> {
  let resolve: PromiseResolver<T>;
  let reject: PromiseRejecter;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve: resolve!, reject: reject! };
}
