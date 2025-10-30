import { Button } from "@/components/ui";
import { renderIcon } from "@/utils";
import {
  formatLastChecked,
  getStatusDescription,
  getActionButtonStyle,
  formatRecoveryResult,
  hasRecoveryActions,
} from "@/utils/common/syncHelpers";

/**
 * @typedef {Object} RecoveryResult
 * @property {boolean} success - Whether recovery succeeded
 * @property {string} [message] - Recovery message
 * @property {string} [error] - Error message if failed
 */

/**
 * @typedef {Object} SyncStatus
 * @property {'CHECKING'|'HEALTHY'|'ISSUES_DETECTED'|'ERROR'|'CRITICAL_FAILURE'} status - Current sync health status
 * @property {boolean|null} isHealthy - Whether sync is healthy
 * @property {string|null} lastChecked - ISO timestamp of last health check
 * @property {boolean} isLoading - Whether health check is in progress
 * @property {number} [failedTests] - Number of failed tests
 * @property {string} [error] - Error message if check failed
 */

/**
 * SyncHealthDetails component displays detailed sync health information
 * Shows status, test results, and recovery actions in a dropdown panel
 *
 * @param {Object} props - Component props
 * @param {SyncStatus} props.syncStatus - Current sync health status
 * @param {boolean} props.isBackgroundSyncing - Whether sync is currently running
 * @param {boolean} props.isRecovering - Whether recovery is in progress
 * @param {RecoveryResult|null} props.recoveryResult - Result of last recovery attempt
 * @param {Function} props.onRefresh - Callback to refresh health status
 * @param {Function} props.onRunValidation - Callback to run sync validation
 * @param {Function} props.onResetData - Callback to reset sync data
 * @returns {React.ReactElement} Rendered health details panel
 */
const SyncHealthDetails = ({
  syncStatus,
  isBackgroundSyncing,
  isRecovering,
  recoveryResult,
  onRefresh,
  onRunValidation,
  onResetData,
}) => {
  const statusDescription = getStatusDescription(syncStatus, isBackgroundSyncing);
  const lastCheckedText = formatLastChecked(syncStatus.lastChecked);
  const formattedRecoveryResult = formatRecoveryResult(recoveryResult);

  return (
    <div className="absolute right-0 top-full mt-2 w-80 glassmorphism backdrop-blur-sm border-2 border-black rounded-xl shadow-2xl z-[9999] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 px-4 py-3 border-b-2 border-black">
        <h3 className="font-black text-white text-sm">SYNC HEALTH STATUS</h3>
      </div>

      {/* Status Information */}
      <div className="p-4 space-y-4">
        {/* Current Status */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-1">
              {syncStatus.status === "HEALTHY"
                ? renderIcon("CheckCircle", {
                    className: "h-4 w-4 text-green-500",
                  })
                : renderIcon("AlertTriangle", {
                    className: "h-4 w-4 text-orange-500",
                  })}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                Current Status: <span className="text-purple-800">{syncStatus.status}</span>
              </p>
              <p className="text-xs text-purple-700 font-medium mt-1">{statusDescription}</p>
            </div>
          </div>

          {/* Last Checked */}
          <div className="flex items-center gap-2 text-xs text-purple-600">
            {renderIcon("Clock", { className: "h-3 w-3" })}
            <span className="font-medium">Last checked: {lastCheckedText}</span>
          </div>
        </div>

        {/* Error Details */}
        {syncStatus.error && (
          <div className="bg-gradient-to-r from-red-50/80 to-orange-50/80 backdrop-blur-sm p-3 rounded-xl border border-red-200 shadow-sm">
            <p className="text-xs font-bold text-red-800 mb-1">ERROR DETAILS:</p>
            <p className="text-xs text-red-700 font-medium">{syncStatus.error}</p>
          </div>
        )}

        {/* Failed Tests */}
        {syncStatus.failedTests > 0 && (
          <div className="bg-gradient-to-r from-yellow-50/80 to-orange-50/80 backdrop-blur-sm p-3 rounded-xl border border-yellow-200 shadow-sm">
            <p className="text-xs font-bold text-orange-800">
              {syncStatus.failedTests} validation test
              {syncStatus.failedTests > 1 ? "s" : ""} failed
            </p>
            {syncStatus.fullResults && (
              <p className="text-xs text-orange-700 font-medium mt-1">
                Run full validation to see detailed results
              </p>
            )}
          </div>
        )}

        {/* Recovery Result */}
        {formattedRecoveryResult && (
          <div
            className={`p-3 rounded-xl border shadow-sm backdrop-blur-sm ${
              formattedRecoveryResult.type === "success"
                ? "bg-gradient-to-r from-green-50/80 to-emerald-50/80 border-green-200"
                : "bg-gradient-to-r from-red-50/80 to-orange-50/80 border-red-200"
            }`}
          >
            <p
              className={`text-xs font-bold mb-1 ${
                formattedRecoveryResult.type === "success" ? "text-green-800" : "text-red-800"
              }`}
            >
              RECOVERY RESULT:
            </p>
            <p
              className={`text-xs font-medium ${
                formattedRecoveryResult.type === "success" ? "text-green-700" : "text-red-700"
              }`}
            >
              {formattedRecoveryResult.message}
            </p>
            {formattedRecoveryResult.details && (
              <p className="text-xs text-gray-600 font-medium mt-1">
                {String(formattedRecoveryResult.details)}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {hasRecoveryActions() && (
          <div className="space-y-2 pt-2 border-t border-gray-200">
            <p className="text-xs font-black text-gray-700 uppercase">ACTIONS:</p>

            <div className="flex flex-col gap-2">
              <Button
                onClick={onRefresh}
                disabled={syncStatus.isLoading}
                className={getActionButtonStyle("refresh")}
              >
                {renderIcon("RefreshCw", {
                  className: `h-3 w-3 mr-2 ${syncStatus.isLoading ? "animate-spin" : ""}`,
                })}
                {syncStatus.isLoading ? "Refreshing..." : "Refresh Status"}
              </Button>

              <Button onClick={onRunValidation} className={getActionButtonStyle("validate")}>
                {renderIcon("Wrench", { className: "h-3 w-3 mr-2" })}
                Run Full Validation
              </Button>

              <Button
                onClick={onResetData}
                disabled={isRecovering}
                className={getActionButtonStyle("reset")}
              >
                {renderIcon("AlertTriangle", {
                  className: `h-3 w-3 mr-2 ${isRecovering ? "animate-pulse" : ""}`,
                })}
                {isRecovering ? "Resetting..." : "Reset Cloud Data"}
              </Button>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-purple-600 font-medium">
            Background sync:{" "}
            {isBackgroundSyncing ? (
              <span className="text-blue-600 font-bold">Active</span>
            ) : (
              <span className="text-gray-600">Idle</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SyncHealthDetails;
