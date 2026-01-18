import { useState } from "react";
import BugReportService from "@/services/logging/bugReportingService.ts";
import logger from "@/utils/core/common/logger.ts";

/**
 * Diagnostics state for bug reports V2
 */
interface BugReportDiagnosticsState {
  diagnostics: unknown;
}

/**
 * Diagnostics actions for bug reports V2
 */
interface BugReportDiagnosticsActions {
  runDiagnostics: () => Promise<unknown>;
  getLocalReports: () => unknown[];
  clearLocalReports: () => void;
}

/**
 * Hook for managing bug report diagnostics and utilities (V2)
 * Includes diagnostics, local reports, and utility functions
 * Extracted from useBugReportV2.ts to reduce complexity
 */
export const useBugReportDiagnosticsV2 = () => {
  const [diagnostics, setDiagnostics] = useState<unknown>(null);

  /**
   * Run diagnostics on bug reporting system
   */
  const runDiagnostics = async () => {
    try {
      logger.debug("Running bug report diagnostics");
      const diagnosticResults = await BugReportService.runDiagnostics();
      setDiagnostics(diagnosticResults);
      return diagnosticResults;
    } catch (error) {
      logger.error("Diagnostics failed", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const failedDiagnostics = {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
      setDiagnostics(failedDiagnostics);
      return failedDiagnostics;
    }
  };

  /**
   * Get local bug reports
   */
  const getLocalReports = () => {
    return BugReportService.getLocalReports();
  };

  /**
   * Clear local bug reports
   */
  const clearLocalReports = () => {
    BugReportService.clearLocalReports();
  };

  const state: BugReportDiagnosticsState = {
    diagnostics,
  };

  const actions: BugReportDiagnosticsActions = {
    runDiagnostics,
    getLocalReports,
    clearLocalReports,
  };

  return {
    ...state,
    ...actions,
  };
};
