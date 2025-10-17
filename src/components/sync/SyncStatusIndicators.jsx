import React from "react";

/**
 * Sync status indicators component (offline indicator, syncing overlay)
 * Displays fixed-position overlays for sync and offline states
 * Extracted from Layout.jsx for better organization
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOnline - Whether the app is currently online
 * @param {boolean} props.isSyncing - Whether a sync operation is in progress
 * @returns {React.ReactElement} Rendered status indicators (syncing overlay and/or offline indicator)
 */
const SyncStatusIndicators = ({ isOnline, isSyncing }) => {
  return (
    <>
      {/* Loading/Syncing Overlay */}
      {isSyncing && (
        <div className="fixed bottom-4 right-4 glassmorphism rounded-2xl p-4 z-50">
          <div className="flex items-center space-x-3">
            <div className="animate-spin h-5 w-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Syncing...</span>
          </div>
        </div>
      )}

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 bg-amber-500 text-white rounded-2xl p-4 z-50">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Offline - Changes saved locally</span>
          </div>
        </div>
      )}
    </>
  );
};

export default SyncStatusIndicators;
