import React, { useState, useEffect, useRef } from "react";
import { getQuickSyncStatus } from "../../utils/masterSyncValidator";
import { cloudSyncService } from "../../services/cloudSyncService";
import logger from "../../utils/common/logger";

const SyncHealthIndicator = () => {
  const [syncStatus, setSyncStatus] = useState({
    isHealthy: null,
    status: "CHECKING",
    lastChecked: null,
    isLoading: true,
  });

  const [showDetails, setShowDetails] = useState(false);
  const [isBackgroundSyncing, setIsBackgroundSyncing] = useState(false);
  const dropdownRef = useRef(null);

  // Check sync health on component mount and periodically
  useEffect(() => {
    checkSyncHealth();

    // Check health every 2 minutes
    const interval = setInterval(checkSyncHealth, 120000);
    return () => clearInterval(interval);
  }, []);

  // Monitor background sync activity
  useEffect(() => {
    // Check if sync is running by monitoring the service state
    const checkSyncActivity = () => {
      const isRunning = cloudSyncService.isRunning && cloudSyncService.activeSyncPromise;
      setIsBackgroundSyncing(isRunning);
    };

    // Check immediately
    checkSyncActivity();

    // Check every 5 seconds when potentially syncing
    const activityInterval = setInterval(checkSyncActivity, 5000);

    return () => clearInterval(activityInterval);
  }, []);

  // Handle clicks outside dropdown and escape key to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDetails(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowDetails(false);
      }
    };

    if (showDetails) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [showDetails]);

  const checkSyncHealth = async () => {
    try {
      setSyncStatus((prev) => ({ ...prev, isLoading: true }));
      const health = await getQuickSyncStatus();
      setSyncStatus({
        ...health,
        isLoading: false,
      });
    } catch (error) {
      logger.error("Failed to check sync health:", error);
      setSyncStatus({
        isHealthy: false,
        status: "ERROR",
        error: error.message,
        lastChecked: new Date().toISOString(),
        isLoading: false,
      });
    }
  };

  const getStatusColor = () => {
    if (syncStatus.isLoading) return "text-gray-400";

    switch (syncStatus.status) {
      case "HEALTHY":
        return "text-green-500";
      case "ISSUES_DETECTED":
        return "text-yellow-500";
      case "ERROR":
      case "CRITICAL_FAILURE":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  const getStatusIcon = () => {
    // Show spinning indicator for loading or background sync activity
    if (syncStatus.isLoading || isBackgroundSyncing) {
      return (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            opacity="0.25"
          />
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      );
    }

    switch (syncStatus.status) {
      case "HEALTHY":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "ISSUES_DETECTED":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "ERROR":
      case "CRITICAL_FAILURE":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const getStatusText = () => {
    if (syncStatus.isLoading) return "Checking...";
    if (isBackgroundSyncing) return "Syncing...";

    switch (syncStatus.status) {
      case "HEALTHY":
        return "Sync Healthy";
      case "ISSUES_DETECTED":
        return `${syncStatus.failedTests} Issues`;
      case "ERROR":
        return "Sync Error";
      case "CRITICAL_FAILURE":
        return "Critical Error";
      default:
        return "Unknown";
    }
  };

  const runFullValidation = async () => {
    if (typeof window !== "undefined" && window.runMasterSyncValidation) {
      logger.info("🚀 Running full sync validation from UI...");
      try {
        const results = await window.runMasterSyncValidation();
        // Update status based on results
        setSyncStatus({
          isHealthy: results.summary.overallStatus === "ALL_SYSTEMS_GO",
          status:
            results.summary.overallStatus === "ALL_SYSTEMS_GO" ? "HEALTHY" : "ISSUES_DETECTED",
          failedTests: results.summary.totalFailed,
          lastChecked: new Date().toISOString(),
          isLoading: false,
          fullResults: results,
        });
      } catch (error) {
        logger.error("Full validation failed:", error);
      }
    }
  };

  return (
    <div className="relative">
      {/* Main Health Indicator */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${getStatusColor()} hover:bg-gray-100 dark:hover:bg-gray-800`}
        title={`Sync Status: ${syncStatus.status}${isBackgroundSyncing ? " (Syncing...)" : ""} - Click for details`}
      >
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </button>

      {/* Details Dropdown */}
      {showDetails && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Sync Health Status
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Overall Status:</span>
                <span className={`text-sm font-medium ${getStatusColor()}`}>
                  {syncStatus.status}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Background Sync:</span>
                <span
                  className={`text-sm font-medium flex items-center space-x-1 ${isBackgroundSyncing ? "text-blue-500" : "text-gray-500"}`}
                >
                  {isBackgroundSyncing && (
                    <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        opacity="0.25"
                      />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  <span>{isBackgroundSyncing ? "Active" : "Idle"}</span>
                </span>
              </div>

              {syncStatus.failedTests > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Failed Tests:</span>
                  <span className="text-sm font-medium text-red-500">{syncStatus.failedTests}</span>
                </div>
              )}

              {syncStatus.lastChecked && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Last Checked:</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {new Date(syncStatus.lastChecked).toLocaleTimeString()}
                  </span>
                </div>
              )}

              {syncStatus.error && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border-l-4 border-red-500">
                  <p className="text-sm text-red-700 dark:text-red-300">{syncStatus.error}</p>
                </div>
              )}
            </div>

            <div className="mt-4 flex space-x-2">
              <button
                onClick={checkSyncHealth}
                disabled={syncStatus.isLoading}
                className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncStatus.isLoading ? "Checking..." : "Recheck"}
              </button>

              <button
                onClick={runFullValidation}
                className="flex-1 px-3 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Full Test
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Console commands: runSyncHealthCheck(), runMasterSyncValidation()
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncHealthIndicator;
