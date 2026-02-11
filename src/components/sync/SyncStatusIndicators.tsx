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
interface SyncStatusIndicatorsProps {
  isOnline: boolean;
  isSyncing: boolean;
}

const SyncStatusIndicators = ({ isOnline, isSyncing: _isSyncing }: SyncStatusIndicatorsProps) => {
  return (
    <>
      {/* Syncing indicator removed - sync happens silently in background */}
      {/* Users can check sync status in Settings > Sync if needed */}

      {/* Offline Indicator - Keep this as it's important for user awareness */}
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
