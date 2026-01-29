import React from "react";
import type { ImportMode } from "@/types/import-dashboard.types";

interface ImportDashboardHeaderProps {
  selectedMode: ImportMode;
  onClose?: () => void;
  offlineCount: number;
  isOnline: boolean;
  isSyncing: boolean;
  retryQueue: () => void;
  error: Error | null;
}

/**
 * ImportDashboardHeader - Header section with title, subtitle, and close button
 */
const ImportDashboardHeader: React.FC<ImportDashboardHeaderProps> = ({
  selectedMode,
  onClose,
  offlineCount,
  isOnline,
  isSyncing,
  retryQueue,
  error,
}) => {
  return (
    <>
      <header className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="font-mono font-black uppercase tracking-tight text-black text-3xl mb-2">
            Import Receipts
          </h1>
          <p className="font-mono text-sm text-purple-900">
            {selectedMode === "digital"
              ? "Digital receipts from connected apps"
              : "Scanned receipts from uploaded images"}
          </p>
        </div>
        {onClose && (
          // eslint-disable-next-line enforce-ui-library/enforce-ui-library -- Close button requires custom Hard Line styling
          <button
            type="button"
            onClick={onClose}
            className="p-2 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            aria-label="Close dashboard"
            data-testid="close-dashboard-button"
          >
            <div className="w-6 h-6 flex items-center justify-center font-black">✕</div>
          </button>
        )}
      </header>

      {error && (
        <div
          className="mb-6 p-4 bg-red-100 border-2 border-red-500 rounded-lg shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]"
          role="alert"
          data-testid="error-banner"
        >
          <h2 className="font-mono font-black uppercase text-red-900 text-sm mb-1">
            Error Loading Receipts
          </h2>
          <p className="font-mono text-xs text-red-700">
            {error.message || "An unexpected error occurred"}
          </p>
        </div>
      )}

      {offlineCount > 0 && (
        <div
          className="mb-6 p-4 bg-amber-100 border-2 border-amber-500 rounded-lg shadow-[4px_4px_0px_0px_rgba(245,158,11,1)] flex items-center justify-between"
          data-testid="offline-banner"
        >
          <div>
            <h2 className="font-mono font-black uppercase text-amber-900 text-sm mb-1">
              {isOnline ? "Syncing Offline Receipts" : "Offline Mode Active"}
            </h2>
            <p className="font-mono text-xs text-amber-800">
              {isOnline
                ? `Uploading ${offlineCount} pending receipts...`
                : `${offlineCount} receipts queued. Connect to internet to sync.`}
            </p>
          </div>
          {isOnline && !isSyncing && (
            // eslint-disable-next-line enforce-ui-library/enforce-ui-library -- Sync button requires custom banner styling
            <button
              type="button"
              onClick={retryQueue}
              className="px-3 py-1 bg-amber-200 hover:bg-amber-300 border-2 border-black rounded text-xs font-bold text-amber-900 transition-colors"
            >
              Sync Now
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default ImportDashboardHeader;
