/**
 * Analytics Privacy Dashboard - v2.1
 * Provides transparency into analytics API calls and encryption
 */

import React, { useState, useCallback } from "react";
import { useAuditTrail } from "@/hooks/privacy/useAuditTrail";
import { EncryptedPayloadInspector } from "./EncryptedPayloadInspector";
import { AuditTrailTable } from "./AuditTrailTable";
import { ConnectionStatusCard, ConnectionStatus } from "./ConnectionStatusCard";
import Button from "@/components/ui/buttons/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ConfirmModal from "@/components/ui/modals/ConfirmModal";
import { useToastHelpers } from "@/utils/core/common/toastHelpers";
import logger from "@/utils/core/common/logger";

interface ConnectionTestResponse {
  status: string;
  version: string;
  timestamp: string;
  service: string;
  region?: string;
}

/**
 * Analytics Privacy Dashboard Component
 * Shows real-time API call audit trail and data inspection tools
 */
export function AnalyticsPrivacyDashboard(): React.ReactElement {
  const { logs, isLoading, clearLogs, exportLogs, count } = useAuditTrail();
  const { showSuccessToast, showErrorToast } = useToastHelpers();
  const [showInspector, setShowInspector] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle");
  const [connectionDetails, setConnectionDetails] = useState<string>("");

  /**
   * Test connection to backend health endpoint
   */
  const handleTestConnection = useCallback(async () => {
    setConnectionStatus("testing");
    setConnectionDetails("");

    try {
      const startTime = performance.now();
      const response = await fetch("/api/health", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const latency = Math.round(performance.now() - startTime);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as ConnectionTestResponse;
      setConnectionStatus("success");
      setConnectionDetails(
        `Connected to ${data.service} (v${data.version}) - Latency: ${latency}ms`
      );
      logger.info("✅ Backend connection test successful", { latency, data });
    } catch (error) {
      setConnectionStatus("error");
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setConnectionDetails(`Connection failed: ${errorMsg}`);
      logger.error("❌ Backend connection test failed", error);
    }
  }, []);

  /**
   * Handle clear logs with confirmation
   */
  const handleClearLogsClick = useCallback(() => {
    setShowClearConfirm(true);
  }, []);

  const handleClearLogsConfirm = useCallback(async () => {
    try {
      await clearLogs();
      setShowClearConfirm(false);
      showSuccessToast("Audit logs cleared successfully");
    } catch (error) {
      logger.error("Failed to clear logs", error);
      showErrorToast("Failed to clear logs. Please try again.");
      setShowClearConfirm(false);
    }
  }, [clearLogs, showSuccessToast, showErrorToast]);

  /**
   * Handle export logs
   */
  const handleExportLogs = useCallback(async () => {
    try {
      await exportLogs();
      showSuccessToast("Audit logs exported successfully");
    } catch (error) {
      logger.error("Failed to export logs", error);
      showErrorToast("Failed to export logs. Please try again.");
    }
  }, [exportLogs, showSuccessToast, showErrorToast]);

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Privacy Dashboard</h2>
          <p className="text-sm text-gray-600 mt-1">
            Full transparency into your data and backend communication
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={handleTestConnection}
            disabled={connectionStatus === "testing"}
            variant="outline"
            size="sm"
          >
            {connectionStatus === "testing" ? "Testing..." : "Test Connection"}
          </Button>
          <Button onClick={() => setShowInspector(!showInspector)} variant="outline" size="sm">
            {showInspector ? "Hide" : "Show"} Data Inspector
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <ConnectionStatusCard status={connectionStatus} details={connectionDetails} />

      {/* Data Inspector (conditional) */}
      {showInspector && <EncryptedPayloadInspector />}

      {/* Audit Trail */}
      <div className="border rounded-lg bg-white/50 backdrop-blur-sm overflow-hidden">
        <div className="p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50">
          <div>
            <h3 className="font-semibold text-gray-900">API Call Audit Trail</h3>
            <p className="text-xs text-gray-600 mt-1">
              {count} total log{count !== 1 ? "s" : ""} • Showing last 50 entries
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleExportLogs}
              variant="outline"
              size="sm"
              disabled={logs.length === 0}
            >
              Export CSV
            </Button>
            <Button
              onClick={handleClearLogsClick}
              variant="destructive"
              size="sm"
              disabled={logs.length === 0}
            >
              Clear Log
            </Button>
          </div>
        </div>

        {/* Clear Logs Confirmation Modal */}
        <ConfirmModal
          isOpen={showClearConfirm}
          title="Clear Audit Logs"
          message={`Are you sure you want to clear all ${count} audit log${count !== 1 ? "s" : ""}? This action cannot be undone.`}
          confirmLabel="Clear All"
          cancelLabel="Cancel"
          destructive={true}
          onConfirm={handleClearLogsConfirm}
          onCancel={() => setShowClearConfirm(false)}
        />

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <LoadingSpinner />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <p className="text-sm">No API calls logged yet.</p>
              <p className="text-xs mt-1">
                API calls will appear here once you use analytics features.
              </p>
            </div>
          ) : (
            <AuditTrailTable logs={logs} />
          )}
        </div>
      </div>
    </div>
  );
}
