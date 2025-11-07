/**
 * Sync Health Dashboard - Visual sync status with backup export
 * GitHub Issue #576 Phase 3: Visual health monitoring and backup tools
 */

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui";
import { renderIcon } from "@/utils/icons";
import { useSyncHealthMonitor } from "@/hooks/sync/useSyncHealthMonitor";
import { useExportData } from "@/hooks/common/useExportData";
import { useToastHelpers } from "@/utils/common/toastHelpers";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { useModalAutoScroll } from "@/hooks/ui/useModalAutoScroll";

/**
 * @typedef {Object} HealthMetrics
 * @property {number} successfulSyncs - Count of successful syncs
 * @property {number} failedSyncs - Count of failed syncs
 * @property {number} averageSyncTime - Average sync duration in ms
 * @property {number} consecutiveFailures - Count of consecutive failures
 * @property {number} errorRate - Error rate percentage (0-1)
 * @property {number} lastSyncTime - Timestamp of last sync
 */

/**
 * @typedef {Object} HealthData
 * @property {'healthy'|'slow'|'degraded'|'unhealthy'|'unknown'} status - Overall health status
 * @property {HealthMetrics} metrics - Health metrics
 * @property {Array} recentSyncs - Recent sync history
 */

/**
 * SyncHealthDashboard component displays detailed sync health metrics and history
 * Provides backup export functionality and real-time health monitoring
 * GitHub Issue #576 Phase 3: Visual health monitoring and backup tools
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the dashboard modal is open
 * @param {Function} props.onClose - Callback to close the dashboard
 * @returns {React.ReactElement|null} Rendered dashboard modal or null if closed
 */
interface SyncHealthDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const SyncHealthDashboard = ({ isOpen, onClose }: SyncHealthDashboardProps) => {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { healthData, refreshHealthData } = useSyncHealthMonitor(autoRefresh);
  const { exportData } = useExportData();
  const { showErrorToast, showSuccessToast } = useToastHelpers();
  const modalRef = useModalAutoScroll(isOpen);

  useEffect(() => {
    if (isOpen) {
      refreshHealthData();
    }
  }, [isOpen, refreshHealthData]);

  if (!isOpen || !healthData) return null;

  /**
   * Get Tailwind color name for health status
   * @param {string} status - Health status
   * @returns {string} Tailwind color name
   */
  const getStatusColor = (status) => {
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

  /**
   * Get icon name for health status
   * @param {string} status - Health status
   * @returns {string} Icon name for renderIcon
   */
  const getStatusIcon = (status) => {
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

  /**
   * Handle backup export with toast notifications
   * @returns {Promise<void>}
   */
  const handleExportBackup = async () => {
    try {
      await exportData();
      showSuccessToast("Backup exported successfully", "Backup Created");
    } catch (error) {
      showErrorToast(`Failed to export backup: ${error.message}`, "Export Failed");
    }
  };

  /**
   * Format duration in milliseconds to human-readable string
   * @param {number} ms - Duration in milliseconds
   * @returns {string} Formatted duration string
   */
  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const statusColor = getStatusColor(healthData.status);
  const statusIcon = getStatusIcon(healthData.status);
  const successRate =
    (healthData.metrics.successfulSyncs /
      (healthData.metrics.successfulSyncs + healthData.metrics.failedSyncs)) *
      100 || 100;

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-black shadow-2xl my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-full bg-${statusColor}-100`}>
              {renderIcon(statusIcon, {
                className: `h-6 w-6 text-${statusColor}-600`,
              })}
            </div>
            <div>
              <h2 className="text-xl font-black text-black uppercase tracking-wider">
                <span className="text-2xl">S</span>YNC <span className="text-2xl">H</span>EALTH{" "}
                <span className="text-2xl">D</span>ASHBOARD
              </h2>
              <p className={`text-sm font-medium text-${statusColor}-600 capitalize`}>
                Status: {healthData.status}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setAutoRefresh((prev) => !prev)}
              className={`px-3 py-2 text-xs rounded-lg border-2 border-black ${
                autoRefresh ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
              }`}
            >
              {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
            </Button>

            <ModalCloseButton onClick={onClose} />
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-purple-100/40 backdrop-blur-sm rounded-lg p-4 border-2 border-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-black uppercase">Success Rate</p>
                <p
                  className={`text-2xl font-black text-${successRate > 95 ? "green" : successRate > 90 ? "yellow" : "red"}-600`}
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
                  className={`text-2xl font-black text-${healthData.metrics.averageSyncTime < 5000 ? "green" : healthData.metrics.averageSyncTime < 10000 ? "yellow" : "red"}-600`}
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
                  className={`text-2xl font-black text-${healthData.metrics.consecutiveFailures > 0 ? "red" : "green"}-600`}
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

        {/* Issues & Actions */}
        {(healthData.issues.length > 0 || healthData.status !== "healthy") && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              {renderIcon("AlertTriangle", {
                className: "h-5 w-5 text-red-600 mt-1",
              })}
              <div className="flex-1">
                <h3 className="font-black text-red-800 text-sm uppercase mb-2">
                  <span className="text-base">S</span>YNC <span className="text-base">I</span>SSUES{" "}
                  <span className="text-base">D</span>ETECTED
                </h3>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {healthData.issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>

                {/* Quick Actions */}
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

        {/* Healthy Status Message */}
        {healthData.status === "healthy" && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              {renderIcon("CheckCircle", {
                className: "h-5 w-5 text-green-600",
              })}
              <div>
                <h3 className="font-black text-green-800 text-sm uppercase">
                  <span className="text-base">S</span>YNC <span className="text-base">H</span>EALTHY
                </h3>
                <p className="text-sm text-green-700">
                  All sync operations are performing normally. No issues detected.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Sync History */}
        <div className="bg-purple-100/40 backdrop-blur-sm rounded-lg p-4 border-2 border-black">
          <h3 className="font-black text-black text-sm uppercase mb-4">
            <span className="text-base">R</span>ECENT <span className="text-base">S</span>YNC{" "}
            <span className="text-base">H</span>ISTORY
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
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default SyncHealthDashboard;
