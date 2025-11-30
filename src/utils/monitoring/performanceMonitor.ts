/**
 * Performance Monitor - Centralized Sentry performance tracking
 * GitHub Issue #1394: Add Performance Monitoring for Critical Operations
 *
 * This utility provides centralized performance tracking using Sentry spans
 * for critical operations like queries, sync, import/export, and backup/restore.
 */

import * as Sentry from "@sentry/react";
import logger from "@/utils/common/logger";

/**
 * Span status codes (gRPC-compatible)
 * @see https://docs.sentry.io/platforms/javascript/guides/react/enriching-events/tags/
 */
export const SPAN_STATUS = {
  OK: 1, // Operation completed successfully
  ERROR: 2, // Operation failed or was slow
} as const;

/**
 * Performance thresholds in milliseconds
 */
export const PERFORMANCE_THRESHOLDS = {
  SLOW_QUERY: 1000, // 1 second for query operations
  SLOW_OPERATION: 5000, // 5 seconds for large data operations
  SLOW_SYNC: 10000, // 10 seconds for sync operations
} as const;

/**
 * Operation types for categorization
 */
export type OperationType =
  | "db.query"
  | "import.data"
  | "export.data"
  | "sync.cloud"
  | "backup.create"
  | "backup.restore";

/**
 * Span attributes for performance tracking
 */
interface SpanAttributes {
  duration?: number;
  resultCount?: number;
  itemsImported?: number;
  itemsExported?: number;
  itemsSynced?: number;
  fileSize?: number;
  direction?: string;
  conflicts?: number;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Performance span result
 */
interface PerformanceSpanResult<T> {
  result: T;
  duration: number;
  isSlow: boolean;
}

/**
 * Start a performance tracking span with Sentry
 *
 * @param op - Operation type (e.g., 'db.query', 'import.data')
 * @param name - Human-readable name for the span
 * @param fn - Async function to execute and measure
 * @param threshold - Slow operation threshold in milliseconds
 * @returns The result of the function along with performance metrics
 */
export async function trackPerformance<T>(
  op: OperationType,
  name: string,
  fn: () => Promise<T>,
  threshold: number = PERFORMANCE_THRESHOLDS.SLOW_QUERY
): Promise<PerformanceSpanResult<T>> {
  const start = performance.now();

  return Sentry.startSpan(
    {
      op,
      name,
    },
    async (span) => {
      try {
        const result = await fn();
        const duration = performance.now() - start;
        const isSlow = duration > threshold;

        // Set span attributes
        span.setAttribute("duration_ms", duration);
        span.setAttribute("is_slow", isSlow);

        // Log slow operations as warnings
        if (isSlow) {
          span.setStatus({ code: SPAN_STATUS.ERROR, message: "slow_operation" });
          logSlowOperation(op, name, duration, threshold);
        } else {
          span.setStatus({ code: SPAN_STATUS.OK });
        }

        return { result, duration, isSlow };
      } catch (error) {
        const duration = performance.now() - start;
        span.setAttribute("duration_ms", duration);
        span.setStatus({
          code: SPAN_STATUS.ERROR,
          message: error instanceof Error ? error.message : "error",
        });

        throw error;
      }
    }
  );
}

/**
 * Track a query operation with Sentry span
 *
 * @param queryName - Name of the query being executed
 * @param queryFn - The query function to execute
 * @returns The query result
 */
export async function trackQuery<T>(queryName: string, queryFn: () => Promise<T>): Promise<T> {
  const { result, duration, isSlow } = await trackPerformance(
    "db.query",
    `Query: ${queryName}`,
    queryFn,
    PERFORMANCE_THRESHOLDS.SLOW_QUERY
  );

  // Log to existing logger for consistency
  if (isSlow) {
    logger.performance(`Slow query: ${queryName}`, duration, {
      queryName,
      threshold: PERFORMANCE_THRESHOLDS.SLOW_QUERY,
    });
  }

  return result;
}

/**
 * Track import operation with Sentry span
 *
 * @param importFn - The import function to execute
 * @param attributes - Additional attributes to track
 * @returns The import result
 */
export async function trackImport<T>(
  importFn: () => Promise<T>,
  attributes: SpanAttributes = {}
): Promise<T> {
  const start = performance.now();

  return Sentry.startSpan(
    {
      op: "import.data",
      name: "Import Transactions",
    },
    async (span) => {
      try {
        const result = await importFn();
        const duration = performance.now() - start;
        const isSlow = duration > PERFORMANCE_THRESHOLDS.SLOW_OPERATION;

        // Set span attributes
        span.setAttribute("duration_ms", duration);
        span.setAttribute("is_slow", isSlow);

        // Set custom attributes
        Object.entries(attributes).forEach(([key, value]) => {
          if (value !== undefined) {
            span.setAttribute(key, value);
          }
        });

        if (isSlow) {
          span.setStatus({ code: SPAN_STATUS.ERROR, message: "slow_import" });
          logSlowOperation("import.data", "Import Transactions", duration);
        } else {
          span.setStatus({ code: SPAN_STATUS.OK });
        }

        logger.performance("Import operation completed", duration, {
          ...attributes,
          isSlow,
        });

        return result;
      } catch (error) {
        const duration = performance.now() - start;
        span.setAttribute("duration_ms", duration);
        span.setStatus({
          code: SPAN_STATUS.ERROR,
          message: error instanceof Error ? error.message : "error",
        });

        throw error;
      }
    }
  );
}

/**
 * Track export operation with Sentry span
 *
 * @param exportFn - The export function to execute
 * @param attributes - Additional attributes to track
 * @returns The export result
 */
export async function trackExport<T>(
  exportFn: () => Promise<T>,
  attributes: SpanAttributes = {}
): Promise<T> {
  const start = performance.now();

  return Sentry.startSpan(
    {
      op: "export.data",
      name: "Export Transactions",
    },
    async (span) => {
      try {
        const result = await exportFn();
        const duration = performance.now() - start;
        const isSlow = duration > PERFORMANCE_THRESHOLDS.SLOW_OPERATION;

        // Set span attributes
        span.setAttribute("duration_ms", duration);
        span.setAttribute("is_slow", isSlow);

        // Set custom attributes
        Object.entries(attributes).forEach(([key, value]) => {
          if (value !== undefined) {
            span.setAttribute(key, value);
          }
        });

        if (isSlow) {
          span.setStatus({ code: SPAN_STATUS.ERROR, message: "slow_export" });
          logSlowOperation("export.data", "Export Transactions", duration);
        } else {
          span.setStatus({ code: SPAN_STATUS.OK });
        }

        logger.performance("Export operation completed", duration, {
          ...attributes,
          isSlow,
        });

        return result;
      } catch (error) {
        const duration = performance.now() - start;
        span.setAttribute("duration_ms", duration);
        span.setStatus({
          code: SPAN_STATUS.ERROR,
          message: error instanceof Error ? error.message : "error",
        });

        throw error;
      }
    }
  );
}

/**
 * Track sync operation with Sentry span
 *
 * @param syncType - Type of sync operation (e.g., 'cloud_sync', 'background_sync')
 * @param syncFn - The sync function to execute
 * @param attributes - Additional attributes to track
 * @returns The sync result
 */
export async function trackSync<T>(
  syncType: string,
  syncFn: () => Promise<T>,
  attributes: SpanAttributes = {}
): Promise<T> {
  const start = performance.now();

  return Sentry.startSpan(
    {
      op: "sync.cloud",
      name: `Cloud Sync: ${syncType}`,
    },
    async (span) => {
      try {
        const result = await syncFn();
        const duration = performance.now() - start;
        const isSlow = duration > PERFORMANCE_THRESHOLDS.SLOW_SYNC;

        // Set span attributes
        span.setAttribute("sync_type", syncType);
        span.setAttribute("duration_ms", duration);
        span.setAttribute("is_slow", isSlow);

        // Set custom attributes
        Object.entries(attributes).forEach(([key, value]) => {
          if (value !== undefined) {
            span.setAttribute(key, value);
          }
        });

        if (isSlow) {
          span.setStatus({ code: SPAN_STATUS.ERROR, message: "slow_sync" });
          logSlowOperation("sync.cloud", `Cloud Sync: ${syncType}`, duration);
        } else {
          span.setStatus({ code: SPAN_STATUS.OK });
        }

        return result;
      } catch (error) {
        const duration = performance.now() - start;
        span.setAttribute("duration_ms", duration);
        span.setStatus({
          code: SPAN_STATUS.ERROR,
          message: error instanceof Error ? error.message : "error",
        });

        throw error;
      }
    }
  );
}

/**
 * Track backup operation with Sentry span
 *
 * @param backupType - Type of backup operation (e.g., 'create', 'restore')
 * @param backupFn - The backup function to execute
 * @param attributes - Additional attributes to track
 * @returns The backup result
 */
export async function trackBackup<T>(
  backupType: "create" | "restore",
  backupFn: () => Promise<T>,
  attributes: SpanAttributes = {}
): Promise<T> {
  const op: OperationType = backupType === "create" ? "backup.create" : "backup.restore";
  const start = performance.now();

  return Sentry.startSpan(
    {
      op,
      name: `Backup: ${backupType}`,
    },
    async (span) => {
      try {
        const result = await backupFn();
        const duration = performance.now() - start;
        const isSlow = duration > PERFORMANCE_THRESHOLDS.SLOW_OPERATION;

        // Set span attributes
        span.setAttribute("backup_type", backupType);
        span.setAttribute("duration_ms", duration);
        span.setAttribute("is_slow", isSlow);

        // Set custom attributes
        Object.entries(attributes).forEach(([key, value]) => {
          if (value !== undefined) {
            span.setAttribute(key, value);
          }
        });

        if (isSlow) {
          span.setStatus({ code: SPAN_STATUS.ERROR, message: "slow_backup" });
          logSlowOperation(op, `Backup: ${backupType}`, duration);
        } else {
          span.setStatus({ code: SPAN_STATUS.OK });
        }

        logger.performance(`Backup ${backupType} completed`, duration, {
          ...attributes,
          isSlow,
        });

        return result;
      } catch (error) {
        const duration = performance.now() - start;
        span.setAttribute("duration_ms", duration);
        span.setStatus({
          code: SPAN_STATUS.ERROR,
          message: error instanceof Error ? error.message : "error",
        });

        throw error;
      }
    }
  );
}

/**
 * Log slow operation to Sentry with warning level
 *
 * @param op - Operation type
 * @param name - Operation name
 * @param duration - Duration in milliseconds
 * @param threshold - Threshold in milliseconds (defaults to SLOW_OPERATION)
 */
function logSlowOperation(
  op: OperationType,
  name: string,
  duration: number,
  threshold: number = PERFORMANCE_THRESHOLDS.SLOW_OPERATION
): void {
  // Don't send slow operation warnings to Sentry - they're performance issues, not errors
  // Only send actual errors to Sentry
  // Log locally for debugging
  logger.warn(`Slow operation detected: ${name}`, {
    operation: op,
    operationName: name,
    duration: Math.round(duration),
    threshold,
    exceededBy: Math.round(duration - threshold),
  });
}

/**
 * Create a simple performance timer for manual tracking
 *
 * @returns Object with end() method that returns duration in milliseconds
 */
export function createTimer(): { end: () => number } {
  const start = performance.now();
  return {
    end: () => performance.now() - start,
  };
}

export default {
  trackPerformance,
  trackQuery,
  trackImport,
  trackExport,
  trackSync,
  trackBackup,
  createTimer,
  PERFORMANCE_THRESHOLDS,
};
