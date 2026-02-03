/**
 * useAuditTrail Hook - v2.1
 * React hook for accessing audit trail logs
 * Auto-refreshes every 5 seconds to catch new logs
 */

import { useState, useEffect, useCallback } from "react";
import { auditTrailService } from "@/services/privacy/auditTrailService";
import type { AuditLogEntry } from "@/types/privacyAudit";
import logger from "@/utils/core/common/logger";

const REFRESH_INTERVAL_MS = 5000; // 5 seconds

export interface UseAuditTrailReturn {
  /** All audit log entries (newest first) */
  logs: AuditLogEntry[];
  /** Whether logs are currently loading */
  isLoading: boolean;
  /** Clear all audit logs */
  clearLogs: () => Promise<void>;
  /** Export logs to CSV file */
  exportLogs: () => Promise<void>;
  /** Manually refresh logs */
  refresh: () => Promise<void>;
  /** Total count of logs */
  count: number;
}

/**
 * Hook to access and manage audit trail logs
 *
 * @example
 * ```tsx
 * const { logs, isLoading, clearLogs, exportLogs } = useAuditTrail();
 *
 * if (isLoading) return <LoadingSpinner />;
 *
 * return (
 *   <div>
 *     <button onClick={exportLogs}>Export CSV</button>
 *     <button onClick={clearLogs}>Clear All</button>
 *     {logs.map(log => <LogEntry key={log.id} log={log} />)}
 *   </div>
 * );
 * ```
 */
export function useAuditTrail(): UseAuditTrailReturn {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [count, setCount] = useState(0);

  /**
   * Load logs from the audit trail service
   */
  const loadLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const [allLogs, logCount] = await Promise.all([
        auditTrailService.getLogs(),
        auditTrailService.getCount(),
      ]);
      setLogs(allLogs);
      setCount(logCount);
    } catch (error) {
      logger.error("Failed to load audit logs in hook", error);
      setLogs([]);
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear all logs
   */
  const clearLogs = useCallback(async () => {
    try {
      await auditTrailService.clearLogs();
      await loadLogs();
      logger.info("✅ Cleared audit logs from UI");
    } catch (error) {
      logger.error("Failed to clear audit logs from UI", error);
      throw error;
    }
  }, [loadLogs]);

  /**
   * Export logs to CSV
   */
  const exportLogs = useCallback(async () => {
    try {
      await auditTrailService.downloadCSV();
      logger.info("✅ Exported audit logs from UI");
    } catch (error) {
      logger.error("Failed to export audit logs from UI", error);
      throw error;
    }
  }, []);

  // Load logs on mount and set up auto-refresh
  useEffect(() => {
    loadLogs();

    // Refresh every 5 seconds to catch new logs
    const interval = setInterval(() => {
      loadLogs();
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [loadLogs]);

  return {
    logs,
    isLoading,
    clearLogs,
    exportLogs,
    refresh: loadLogs,
    count,
  };
}
