import React from "react";
import { Monitor, RefreshCw } from "lucide-react";

const GeneralSettingsSection = ({
  isLocalOnlyMode,
  cloudSyncEnabled,
  isSyncing,
  onOpenLocalOnlySettings,
  onToggleCloudSync,
  onManualSync,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="font-black text-black text-base">
        <span className="text-lg">G</span>ENERAL{" "}
        <span className="text-lg">S</span>ETTINGS
      </h3>

      {isLocalOnlyMode && (
        <div className="glassmorphism rounded-lg p-4 border-2 border-black ring-1 ring-gray-800/10 bg-blue-100/60">
          <div className="flex items-start">
            <Monitor className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h4 className="font-medium text-purple-900">Local-Only Mode</h4>
              <p className="text-sm text-purple-700 mt-1">
                You're running in local-only mode. Data is stored locally only.
              </p>
              <button
                onClick={onOpenLocalOnlySettings}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline border-2 border-black px-2 py-1 rounded bg-white/60"
              >
                Manage Local-Only Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {!isLocalOnlyMode && (
        <div className="glassmorphism rounded-lg p-4 border-2 border-black ring-1 ring-gray-800/10 space-y-4">
          <h4 className="font-medium text-purple-900">Cloud Sync</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-900">
                Sync your data across devices
              </p>
              <p className="text-xs text-purple-700 mt-1">
                Status: {cloudSyncEnabled ? "Enabled" : "Disabled"}
              </p>
            </div>
            <button
              onClick={onToggleCloudSync}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors border-2 border-black ${
                cloudSyncEnabled ? "bg-green-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform border border-black ${
                  cloudSyncEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {cloudSyncEnabled && (
            <div className="pt-2">
              <button
                onClick={onManualSync}
                disabled={isSyncing}
                className="flex items-center px-3 py-2 text-sm border-2 border-black bg-purple-200/60 rounded-lg hover:bg-purple-300/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`}
                />
                {isSyncing ? "Syncing..." : "Sync Now"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GeneralSettingsSection;
