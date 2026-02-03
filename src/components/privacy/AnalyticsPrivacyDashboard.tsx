/**
 * Analytics Privacy Dashboard - v2.1
 * Provides transparency into analytics API calls and encryption
 */

import React, { useState, useCallback } from "react";
import { useAuditTrail } from "@/hooks/privacy/useAuditTrail";
import { EncryptedPayloadInspector } from "./EncryptedPayloadInspector";
import Button from "@/components/ui/buttons/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import logger from "@/utils/core/common/logger";

type ConnectionStatus = "idle" | "testing" | "success" | "error";

interface ConnectionTestResponse {
  status: string;
  version: string;
  timestamp: string;
  service: string;
}

/**
 * Analytics Privacy Dashboard Component
 * Shows real-time API call audit trail and data inspection tools
 */
export function AnalyticsPrivacyDashboard(): React.ReactElement {
  const { logs, isLoading, clearLogs, exportLogs, count } = useAuditTrail();
  const [showInspector, setShowInspector] = useState(false);
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
      setConnectionDetails(`Connected to ${data.service} (v${data.version}) - Latency: ${latency}ms`);
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
  const handleClearLogs = useCallback(async () => {
    if (!window.confirm("Are you sure you want to clear all audit logs?")) {
      return;
    }

    try {
      await clearLogs();
    } catch (error) {
      logger.error("Failed to clear logs", error);
      alert("Failed to clear logs. Please try again.");
    }
  }, [clearLogs]);

  /**
   * Handle export logs
   */
  const handleExportLogs = useCallback(async () => {
    try {
      await exportLogs();
    } catch (error) {
      logger.error("Failed to export logs", error);
      alert("Failed to export logs. Please try again.");
    }
  }, [exportLogs]);

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
      <div className="border rounded-lg p-4 bg-white/50 backdrop-blur-sm">
        <h3 className="font-semibold text-gray-900 mb-3">Connection Status</h3>
        <div className="flex items-center gap-3">
          <StatusIndicator status={connectionStatus} />
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-900">{getStatusText(connectionStatus)}</span>
            {connectionDetails && (
              <p className="text-xs text-gray-600 mt-1">{connectionDetails}</p>
            )}
          </div>
        </div>
      </div>

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
            <Button onClick={handleExportLogs} variant="outline" size="sm" disabled={logs.length === 0}>
              Export CSV
            </Button>
            <Button onClick={handleClearLogs} variant="destructive" size="sm" disabled={logs.length === 0}>
              Clear Log
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <LoadingSpinner />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <p className="text-sm">No API calls logged yet.</p>
              <p className="text-xs mt-1">API calls will appear here once you use analytics features.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-3 text-left font-semibold text-gray-700">Timestamp</th>
                  <th className="p-3 text-left font-semibold text-gray-700">Endpoint</th>
                  <th className="p-3 text-left font-semibold text-gray-700">Encrypted</th>
                  <th className="p-3 text-left font-semibold text-gray-700">Payload Size</th>
                  <th className="p-3 text-left font-semibold text-gray-700">Response Time</th>
                  <th className="p-3 text-left font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 50).map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-gray-700">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 text-gray-700 font-mono text-xs">{log.endpoint}</td>
                    <td className="p-3">
                      {log.encrypted ? (
                        <span className="text-green-600 font-semibold flex items-center gap-1">
                          ✓ Encrypted
                        </span>
                      ) : (
                        <span className="text-red-600 font-semibold flex items-center gap-1">
                          ✗ Not Encrypted
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-gray-700">{formatBytes(log.encryptedPayloadSize)}</td>
                    <td className="p-3 text-gray-700">{log.responseTimeMs}ms</td>
                    <td className="p-3">
                      {log.success ? (
                        <span className="text-green-600 font-semibold">Success</span>
                      ) : (
                        <span className="text-red-600 font-semibold" title={log.errorMessage}>
                          Error
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Status indicator component
 */
function StatusIndicator({ status }: { status: ConnectionStatus }): React.ReactElement {
  const colors: Record<ConnectionStatus, string> = {
    idle: "bg-gray-400",
    testing: "bg-yellow-400 animate-pulse",
    success: "bg-green-500",
    error: "bg-red-500",
  };

  return (
    <div
      className={`w-3 h-3 rounded-full ${colors[status]}`}
      role="status"
      aria-live="polite"
      aria-label={getStatusText(status)}
      title={getStatusText(status)}
    />
  );
}

/**
 * Get status text for connection status
 */
function getStatusText(status: ConnectionStatus): string {
  const texts: Record<ConnectionStatus, string> = {
    idle: "Not tested",
    testing: "Testing connection...",
    success: "Connected",
    error: "Connection failed",
  };
  return texts[status];
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
