import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";
import { useConfirm } from "../../../hooks/common/useConfirm";
import logger from "../../../utils/common/logger";
import type { DataDetectionResult } from "@/types/sync";

// Extend window interface for custom debug functions
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getQuickSyncStatus?: () => Promise<any>;
    runMasterSyncValidation?: () => Promise<ValidationResults>;
    detectLocalDataDebug: () => Promise<DataDetectionResult>;
    hasLocalDataDebug: () => Promise<boolean>;
    forceCloudDataReset?: () => Promise<{ success: boolean; message?: string; error?: string }>;
  }
}

// Import the ValidationResults type
interface ValidationResults {
  healthCheck: {
    passed: number;
    failed: number;
    tests: Array<{
      name: string;
      status: string;
      details?: string;
      error?: string;
    }>;
  } | null;
  flowValidation?: unknown[];
  edgeCases?: unknown[];
  corruptionCheck?: Array<{
    name: string;
    description: string;
    status: "passed" | "failed";
    details: string;
  }>;
  summary: {
    totalTests: number;
    totalPassed: number;
    totalFailed: number;
    overallStatus: string;
    duration: number;
    breakdown: {
      healthCheck: { passed: number; failed: number };
      flowValidation: { passed: number; failed: number };
      edgeCases: { passed: number; failed: number };
      corruptionCheck: { passed: number; failed: number };
    };
  };
}

interface SyncDebugToolsSectionProps {
  isDebugMode: boolean;
}

const SyncDebugToolsSection: React.FC<SyncDebugToolsSectionProps> = ({ isDebugMode }) => {
  const confirm = useConfirm();

  return (
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
          <p className="font-semibold text-blue-800 mb-1">🛠️ Development Sync Tools</p>
          <p className="text-blue-700">
            Available Functions:{" "}
            {Object.keys(window)
              .filter((k) => k.includes("Sync") || k.includes("sync"))
              .join(", ")}
          </p>
          <p className="text-blue-600 mt-1">
            Advanced sync debugging and validation tools for development and testing.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {/* Always Available - Refresh Sync Status */}
        <Button
          onClick={async () => {
            logger.info("🔄 TESTING: window.getQuickSyncStatus");
            try {
              const result = window.getQuickSyncStatus && (await window.getQuickSyncStatus());
              logger.info("🔄 SUCCESS:", result);
            } catch (error) {
              logger.error("🔄 ERROR:", error);
            }
          }}
          className="w-full flex items-center p-3 border border-green-200 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
        >
          {React.createElement(getIcon("RefreshCw"), {
            className: "h-4 w-4 text-green-600 mr-3",
          })}
          <div className="text-left">
            <p className="font-medium text-green-900">🔄 Refresh Sync Status</p>
            <p className="text-xs text-green-700">Check current sync health</p>
          </div>
        </Button>

        {/* Development Mode - Advanced Debug Tools */}
        {isDebugMode && (
          <>
            <Button
              onClick={async () => {
                logger.info("🚀 TESTING: window.runMasterSyncValidation");
                try {
                  const result =
                    window.runMasterSyncValidation && (await window.runMasterSyncValidation());
                  logger.info("🚀 SUCCESS:", result as unknown as Record<string, unknown>);
                } catch (error) {
                  logger.error("🚀 ERROR:", error as Record<string, unknown>);
                }
              }}
              className="w-full flex items-center p-3 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              {React.createElement(getIcon("Wrench"), {
                className: "h-4 w-4 text-blue-600 mr-3",
              })}
              <div className="text-left">
                <p className="font-medium text-blue-900">🧪 Run Full Sync Validation</p>
                <p className="text-xs text-blue-700">Comprehensive sync system check (4 phases)</p>
              </div>
            </Button>

            <Button
              onClick={async () => {
                logger.info("🔍 TESTING: window.detectLocalDataDebug");
                try {
                  const result = await window.detectLocalDataDebug();
                  logger.info("🔍 SUCCESS:", result as unknown as Record<string, unknown>);
                } catch (error) {
                  logger.error("🔍 ERROR:", error as Record<string, unknown>);
                }
              }}
              className="w-full flex items-center p-3 border border-purple-200 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              {React.createElement(getIcon("Search"), {
                className: "h-4 w-4 text-purple-600 mr-3",
              })}
              <div className="text-left">
                <p className="font-medium text-purple-900">🔍 Detect Local Data</p>
                <p className="text-xs text-purple-700">
                  Comprehensive local data detection with debugging
                </p>
              </div>
            </Button>

            <Button
              onClick={async () => {
                logger.info("⚡ TESTING: window.hasLocalDataDebug");
                try {
                  const result = await window.hasLocalDataDebug();
                  logger.info("⚡ SUCCESS:", { hasData: result });
                } catch (error) {
                  logger.error("⚡ ERROR:", error as Record<string, unknown>);
                }
              }}
              className="w-full flex items-center p-3 border border-indigo-200 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              {React.createElement(getIcon("Zap"), {
                className: "h-4 w-4 text-indigo-600 mr-3",
              })}
              <div className="text-left">
                <p className="font-medium text-indigo-900">⚡ Quick Data Check</p>
                <p className="text-xs text-indigo-700">
                  Fast boolean check for local data presence
                </p>
              </div>
            </Button>

            <Button
              onClick={async () => {
                logger.info("🛡️ TESTING: window.safeCloudDataReset");
                const confirmed = await confirm({
                  title: "Safe Cloud Data Reset",
                  message:
                    "🛡️ Run safe cloud data reset? This includes comprehensive local data validation.",
                  confirmLabel: "Run Safe Reset",
                  cancelLabel: "Cancel",
                });
                if (confirmed) {
                  try {
                    const result =
                      window.forceCloudDataReset && (await window.forceCloudDataReset());
                    logger.info("🛡️ SUCCESS:", result as unknown as Record<string, unknown>);
                  } catch (error) {
                    logger.error("🛡️ ERROR:", error as Record<string, unknown>);
                  }
                }
              }}
              className="w-full flex items-center p-3 border border-orange-200 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              {React.createElement(getIcon("Shield"), {
                className: "h-4 w-4 text-orange-600 mr-3",
              })}
              <div className="text-left">
                <p className="font-medium text-orange-900">🛡️ Safe Cloud Data Reset</p>
                <p className="text-xs text-orange-700">
                  Reset with comprehensive local data validation
                </p>
              </div>
            </Button>

            <Button
              onClick={async () => {
                logger.info("🧹 TESTING: window.forceCloudDataReset");
                const confirmed = await confirm({
                  title: "Reset Cloud Data",
                  message: "⚠️ Reset Cloud Data? This cannot be undone!",
                  confirmLabel: "Reset",
                  cancelLabel: "Cancel",
                });
                if (confirmed) {
                  try {
                    const result =
                      window.forceCloudDataReset && (await window.forceCloudDataReset());
                    logger.info("🧹 SUCCESS:", result);
                  } catch (error) {
                    logger.error("🧹 ERROR:", error);
                  }
                }
              }}
              className="w-full flex items-center p-3 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              {React.createElement(getIcon("AlertTriangle"), {
                className: "h-4 w-4 text-red-600 mr-3",
              })}
              <div className="text-left">
                <p className="font-medium text-red-900">🚨 Reset Cloud Data</p>
                <p className="text-xs text-red-700">Emergency recovery: clear and re-upload</p>
              </div>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default SyncDebugToolsSection;
