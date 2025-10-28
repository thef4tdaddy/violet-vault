import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";
import { getLocalOnlyMode } from "../../../utils/settings/settingsHelpers";
import { useConfirm } from "../../../hooks/common/useConfirm";
import logger from "@/utils/common/logger";

interface DataManagementSectionProps {
  onOpenActivityFeed: () => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSync: () => void;
}

// Check if we're in development mode
const isDevelopmentMode = () => {
  return (
    typeof window !== "undefined" &&
    (import.meta.env.MODE === "development" ||
      window.location.hostname.includes("dev.") ||
      window.location.hostname.includes("localhost") ||
      window.location.hostname === "127.0.0.1")
  );
};

interface SyncHealthToolsProps {
  confirm: (options: {
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
  }) => Promise<boolean>;
}

// Sync health tools component
const SyncHealthTools: React.FC<SyncHealthToolsProps> = ({ confirm }) => {
  const isDev = isDevelopmentMode();

  const handleQuickSyncStatus = async () => {
    logger.debug("🔄 TESTING: window.getQuickSyncStatus");
    try {
      const result = await window.getQuickSyncStatus();
      logger.debug("🔄 SUCCESS", { result });
    } catch (error) {
      logger.error("🔄 ERROR", error);
    }
  };

  const handleMasterSyncValidation = async () => {
    logger.debug("🚀 TESTING: window.runMasterSyncValidation");
    try {
      const result = await window.runMasterSyncValidation();
      logger.debug("🚀 SUCCESS", { result });
    } catch (error) {
      logger.error("🚀 ERROR", error);
    }
  };

  const handleForceCloudDataReset = async () => {
    logger.debug("🧹 TESTING: window.forceCloudDataReset");
    const confirmed = await confirm({
      title: "Reset Cloud Data",
      message: "⚠️ Reset Cloud Data? This cannot be undone!",
      confirmText: "Reset",
      cancelText: "Cancel",
    });
    if (confirmed) {
      try {
        const result = await window.forceCloudDataReset();
        logger.debug("🧹 SUCCESS", { result });
      } catch (error) {
        logger.error("🧹 ERROR", error);
      }
    }
  };

  return (
    <div className="border-t border-gray-200 pt-4">
      <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
        {React.createElement(getIcon("Activity"), {
          className: "h-4 w-4 mr-2",
        })}
        Sync Health Tools
      </h4>

      {isDev && (
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
        <Button
          onClick={handleQuickSyncStatus}
          className="w-full flex items-center p-3 border border-green-200 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
        >
          {React.createElement(getIcon("RefreshCw"), {
            className: "h-4 w-4 text-green-600 mr-3",
          })}
          <div className="text-left">
            <p className="font-medium text-green-900">Refresh Sync Status</p>
            <p className="text-xs text-green-700">Check current sync health</p>
          </div>
        </Button>

        {isDev ? (
          <>
            <Button
              onClick={handleMasterSyncValidation}
              className="w-full flex items-center p-3 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              {React.createElement(getIcon("Wrench"), {
                className: "h-4 w-4 text-blue-600 mr-3",
              })}
              <div className="text-left">
                <p className="font-medium text-blue-900">🧪 Run Full Sync Validation</p>
                <p className="text-xs text-blue-700">Comprehensive sync system check (Dev Only)</p>
              </div>
            </Button>

            <Button
              onClick={handleForceCloudDataReset}
              className="w-full flex items-center p-3 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              {React.createElement(getIcon("AlertTriangle"), {
                className: "h-4 w-4 text-red-600 mr-3",
              })}
              <div className="text-left">
                <p className="font-medium text-red-900">🚨 Reset Cloud Data</p>
                <p className="text-xs text-red-700">
                  Emergency recovery: clear and re-upload (Dev Only)
                </p>
              </div>
            </Button>
          </>
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              Additional sync debugging tools are available in development mode.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const DataManagementSection: React.FC<DataManagementSectionProps> = ({
  onOpenActivityFeed,
  onExport,
  onImport,
  onSync,
}) => {
  const confirm = useConfirm();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>

      <div className="space-y-4">
        <Button
          onClick={onOpenActivityFeed}
          className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {React.createElement(getIcon("History"), {
            className: "h-5 w-5 text-gray-600 mr-3",
          })}
          <div className="text-left">
            <p className="font-medium text-gray-900">Activity History</p>
            <p className="text-sm text-gray-500">View recent budget activities and changes</p>
          </div>
        </Button>

        <Button
          onClick={onExport}
          className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {React.createElement(getIcon("Download"), {
            className: "h-5 w-5 text-gray-600 mr-3",
          })}
          <div className="text-left">
            <p className="font-medium text-gray-900">Export Data</p>
            <p className="text-sm text-gray-500">Download your budget data</p>
          </div>
        </Button>

        <div className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
          <input
            type="file"
            accept=".json"
            onChange={onImport}
            className="hidden"
            id="settings-import-data"
          />
          <label htmlFor="settings-import-data" className="w-full flex items-center cursor-pointer">
            {React.createElement(getIcon("Upload"), {
              className: "h-5 w-5 text-gray-600 mr-3",
            })}
            <div className="text-left">
              <p className="font-medium text-gray-900">Import Data</p>
              <p className="text-sm text-gray-500">Upload budget data from file</p>
            </div>
          </label>
        </div>

        {getLocalOnlyMode() && (
          <Button
            onClick={onSync}
            className="w-full flex items-center p-3 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            {React.createElement(getIcon("Cloud"), {
              className: "h-5 w-5 text-blue-600 mr-3",
            })}
            <div className="text-left">
              <p className="font-medium text-blue-900">Sync to Cloud</p>
              <p className="text-sm text-blue-600">Upload your data to cloud storage</p>
            </div>
          </Button>
        )}

        <SyncHealthTools confirm={confirm} />
      </div>
    </div>
  );
};

export default DataManagementSection;
