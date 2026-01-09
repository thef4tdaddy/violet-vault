/**
 * Sync Health Dashboard - Visual sync status with backup export
 * GitHub Issue #576 Phase 3: Visual health monitoring and backup tools
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { renderIcon } from "@/utils/icons";
import { useSyncHealthMonitor } from "@/hooks/platform/sync/useSyncHealthMonitor";
import { useExportData } from "@/hooks/platform/data/useExportData";
import { useToastHelpers } from "@/utils/common/toastHelpers";

interface SyncHealthDashboardProps {
  className?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "healthy":
      return "green";
    case "slow":
      return "yellow";
    case "degraded":
      return "orange";
    case "unhealthy":
      return "red";
    default:
      return "gray";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "healthy":
      return "CheckCircle";
    case "slow":
      return "Clock";
    case "degraded":
      return "AlertTriangle";
    case "unhealthy":
      return "XCircle";
    default:
      return "HelpCircle";
  }
};

const formatDuration = (ms: number) => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
};

const SyncHealthDashboard = ({ className = "" }: SyncHealthDashboardProps) => {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { healthData, refreshHealthData } = useSyncHealthMonitor(autoRefresh);
  const { exportData } = useExportData();
  const { showErrorToast, showSuccessToast } = useToastHelpers();

  useEffect(() => {
    if (!autoRefresh) {
      refreshHealthData();
    }
  }, [autoRefresh, refreshHealthData]);

  const handleExportBackup = async () => {
    try {
      await exportData();
      showSuccessToast("Backup exported successfully", "Backup Created");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      showErrorToast(`Failed to export backup: ${message}`, "Export Failed");
    }
  };

  if (!healthData) {
    return (
      <div
        className={`bg-white rounded-2xl border-2 border-black shadow-2xl p-8 text-center ${className}`}
      >
        <p className="text-sm text-gray-600">Loading sync health data…</p>
      </div>
    );
  }

  const statusColor = getStatusColor(healthData.status);
  const statusIcon = getStatusIcon(healthData.status);
  const totalAttempts = healthData.metrics.successfulSyncs + healthData.metrics.failedSyncs || 1;
  const successRate = (healthData.metrics.successfulSyncs / totalAttempts) * 100;

  return (
    <section className={`space-y-6 ${className}`}>
      <div className="bg-white rounded-2xl border-2 border-black shadow-2xl p-6 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-full bg-${statusColor}-100`}>
              {renderIcon(statusIcon, {
                className: `h-6 w-6 text-${statusColor}-600`,
              })}
            </div>
            <div>
              <h2 className="text-xl font-black text-black uppercase tracking-wider">
                <span className="text-2xl">S</span>ync <span className="text-2xl">H</span>ealth{" "}
                <span className="text-2xl">D</span>ashboard
              </h2>
              <p className={`text-sm font-medium text-${statusColor}-600 capitalize`}>
                Status: {healthData.status}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setAutoRefresh((prev) => !prev)}
              className={`px-3 py-2 text-xs rounded-lg border-2 border-black ${
                autoRefresh ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
              }`}
            >
              {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
            </Button>
            <Button
              onClick={refreshHealthData}
              className="px-3 py-2 text-xs rounded-lg border-2 border-black bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
            >
              Refresh Now
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-purple-100/40 backdrop-blur-sm rounded-lg p-4 border-2 border-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-black uppercase">Success Rate</p>
                <p
                  className={`text-2xl font-black text-${
                    successRate > 95 ? "green" : successRate > 90 ? "yellow" : "red"
                  }-600`}
                >
                  {successRate.toFixed(1)}%
                </p>
              </div>
              {renderIcon("TrendingUp", {
                className: "h-8 w-8 text-purple-300",
              })}
            </div>
          </div>

          <div className="bg-purple-100/40 backdrop-blur-sm rounded-lg p-4 border-2 border-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-black uppercase">Avg Sync Time</p>
                <p
                  className={`text-2xl font-black text-${
                    healthData.metrics.averageSyncTime < 5000
                      ? "green"
                      : healthData.metrics.averageSyncTime < 10000
                        ? "yellow"
                        : "red"
                  }-600`}
                >
                  {formatDuration(healthData.metrics.averageSyncTime)}
                </p>
              </div>
              {renderIcon("Clock", { className: "h-8 w-8 text-purple-300" })}
            </div>
          </div>

          <div className="bg-purple-100/40 backdrop-blur-sm rounded-lg p-4 border-2 border-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-black uppercase">Total Syncs</p>
                <p className="text-2xl font-black text-purple-600">
                  {healthData.metrics.totalAttempts}
                </p>
              </div>
              {renderIcon("BarChart3", {
                className: "h-8 w-8 text-purple-300",
              })}
            </div>
          </div>

          <div className="bg-purple-100/40 backdrop-blur-sm rounded-lg p-4 border-2 border-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-black uppercase">Failures</p>
                <p
                  className={`text-2xl font-black text-${
                    healthData.metrics.consecutiveFailures > 0 ? "red" : "green"
                  }-600`}
                >
                  {healthData.metrics.consecutiveFailures}
                </p>
              </div>
              {renderIcon("AlertTriangle", {
                className: "h-8 w-8 text-purple-300",
              })}
            </div>
          </div>
        </div>

        {(healthData.issues.length > 0 || healthData.status !== "healthy") && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              {renderIcon("AlertTriangle", {
                className: "h-5 w-5 text-red-600 mt-1",
              })}
              <div className="flex-1">
                <h3 className="font-black text-red-800 text-sm uppercase mb-2">
                  <span className="text-base">S</span>ync <span className="text-base">I</span>ssues{" "}
                  <span className="text-base">D</span>etected
                </h3>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {healthData.issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2 mt-4">
                  <Button
                    onClick={handleExportBackup}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg border-2 border-black hover:bg-blue-700 transition-colors"
                  >
                    {renderIcon("Download", { className: "h-4 w-4 mr-2" })}
                    Export Backup
                  </Button>

                  <Button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-orange-600 text-white text-sm font-bold rounded-lg border-2 border-black hover:bg-orange-700 transition-colors"
                  >
                    {renderIcon("RefreshCw", { className: "h-4 w-4 mr-2" })}
                    Refresh App
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {healthData.status === "healthy" && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              {renderIcon("CheckCircle", {
                className: "h-5 w-5 text-green-600",
              })}
              <div>
                <h3 className="font-black text-green-800 text-sm uppercase">
                  <span className="text-base">S</span>ync <span className="text-base">H</span>ealthy
                </h3>
                <p className="text-sm text-green-700">
                  All sync operations are performing normally. No issues detected.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-purple-100/40 backdrop-blur-sm rounded-lg p-4 border-2 border-black">
          <h3 className="font-black text-black text-sm uppercase mb-4">
            <span className="text-base">R</span>ecent <span className="text-base">S</span>ync{" "}
            <span className="text-base">H</span>istory
          </h3>

          {healthData.recentSyncs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No sync history available</p>
          ) : (
            <div className="space-y-2">
              {healthData.recentSyncs.slice(0, 5).map((sync, index) => (
                <div
                  key={sync.id || index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    sync.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {renderIcon(sync.success ? "CheckCircle" : "XCircle", {
                      className: `h-4 w-4 ${sync.success ? "text-green-600" : "text-red-600"}`,
                    })}
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          sync.success ? "text-green-800" : "text-red-800"
                        }`}
                      >
                        {sync.type || "Unknown"} sync
                      </p>
                      {sync.error && <p className="text-xs text-red-600">{sync.error.message}</p>}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-600">{formatDuration(sync.duration || 0)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(sync.endTime || sync.startTime).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SyncHealthDashboard;
