/* eslint-disable no-console */
import React from "react";
import { getIcon } from "../../../utils";
import { useConfirm } from "../../../hooks/common/useConfirm";
// Development mode detection utility
const isDevelopmentMode = () => {
  return (
    typeof window !== "undefined" &&
    (import.meta.env.MODE === "development" ||
      window.location.hostname.includes("dev.") ||
      window.location.hostname.includes("localhost") ||
      window.location.hostname === "127.0.0.1")
  );
};

const DevToolsSection = ({ onOpenEnvelopeChecker, onCreateTestHistory }) => {
  const currentMode = import.meta.env.MODE || "production";
  const isDebugMode = isDevelopmentMode();
  const confirm = useConfirm();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Development Tools
        </h3>
        <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
          {currentMode} Mode
        </div>
      </div>

      {/* Development Tools */}
      <div className="space-y-4">
        {/* Envelope Integrity Checker */}
        <button
          onClick={onOpenEnvelopeChecker}
          className="w-full flex items-center p-3 border border-purple-200 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
        >
          {React.createElement(getIcon("AlertTriangle"), {
            className: "h-5 w-5 text-purple-600 mr-3",
          })}
          <div className="text-left">
            <p className="font-medium text-purple-900">
              🔍 Envelope Integrity Checker
            </p>
            <p className="text-sm text-purple-700">
              Detect and fix empty/corrupted envelopes
            </p>
          </div>
        </button>

        {/* Test Budget History */}
        <button
          onClick={onCreateTestHistory}
          className="w-full flex items-center p-3 border border-yellow-200 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
        >
          {React.createElement(getIcon("History"), {
            className: "h-5 w-5 text-yellow-600 mr-3",
          })}
          <div className="text-left">
            <p className="font-medium text-yellow-900">
              🧪 Test Budget History
            </p>
            <p className="text-sm text-yellow-700">
              Create test commits for family collaboration
            </p>
          </div>
        </button>

        {/* Sync Debug Tools */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
            {React.createElement(getIcon("Activity"), {
              className: "h-4 w-4 mr-2",
            })}
            Sync Debug Tools
          </h4>

          {/* Debug Info Panel */}
          {isDebugMode && (
            <div className="mb-3 p-2 bg-blue-50 rounded text-xs border border-blue-200">
              <p className="font-semibold text-blue-800 mb-1">
                🛠️ Development Sync Tools
              </p>
              <p className="text-blue-700">
                Available Functions:{" "}
                {Object.keys(window)
                  .filter((k) => k.includes("Sync") || k.includes("sync"))
                  .join(", ")}
              </p>
              <p className="text-blue-600 mt-1">
                Advanced sync debugging and validation tools for development and
                testing.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {/* Always Available - Refresh Sync Status */}
            <button
              onClick={async () => {
                console.log("🔄 TESTING: window.getQuickSyncStatus");
                try {
                  const result = await window.getQuickSyncStatus();
                  console.log("🔄 SUCCESS:", result);
                } catch (error) {
                  console.error("🔄 ERROR:", error);
                }
              }}
              className="w-full flex items-center p-3 border border-green-200 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              {React.createElement(getIcon("RefreshCw"), {
                className: "h-4 w-4 text-green-600 mr-3",
              })}
              <div className="text-left">
                <p className="font-medium text-green-900">
                  🔄 Refresh Sync Status
                </p>
                <p className="text-xs text-green-700">
                  Check current sync health
                </p>
              </div>
            </button>

            {/* Development Mode - Advanced Debug Tools */}
            {isDebugMode && (
              <>
                <button
                  onClick={async () => {
                    console.log("🚀 TESTING: window.runMasterSyncValidation");
                    try {
                      const result = await window.runMasterSyncValidation();
                      console.log("🚀 SUCCESS:", result);
                    } catch (error) {
                      console.error("🚀 ERROR:", error);
                    }
                  }}
                  className="w-full flex items-center p-3 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  {React.createElement(getIcon("Wrench"), {
                    className: "h-4 w-4 text-blue-600 mr-3",
                  })}
                  <div className="text-left">
                    <p className="font-medium text-blue-900">
                      🧪 Run Full Sync Validation
                    </p>
                    <p className="text-xs text-blue-700">
                      Comprehensive sync system check (4 phases)
                    </p>
                  </div>
                </button>

                <button
                  onClick={async () => {
                    console.log("🧹 TESTING: window.forceCloudDataReset");
                    const confirmed = await confirm({
                      title: "Reset Cloud Data",
                      message: "⚠️ Reset Cloud Data? This cannot be undone!",
                      confirmText: "Reset",
                      cancelText: "Cancel",
                    });
                    if (confirmed) {
                      try {
                        const result = await window.forceCloudDataReset();
                        console.log("🧹 SUCCESS:", result);
                      } catch (error) {
                        console.error("🧹 ERROR:", error);
                      }
                    }
                  }}
                  className="w-full flex items-center p-3 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  {React.createElement(getIcon("AlertTriangle"), {
                    className: "h-4 w-4 text-red-600 mr-3",
                  })}
                  <div className="text-left">
                    <p className="font-medium text-red-900">
                      🚨 Reset Cloud Data
                    </p>
                    <p className="text-xs text-red-700">
                      Emergency recovery: clear and re-upload
                    </p>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevToolsSection;
