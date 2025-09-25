import React, { useEffect } from "react";
import { getIcon } from "../../utils";
import { useLocalOnlyModeSettings } from "../../hooks/auth/useLocalOnlyModeSettings";
import LocalOnlyModeHeader from "./components/LocalOnlyModeHeader";
import LocalOnlyModeStats from "./components/LocalOnlyModeStats";
import LocalOnlyDataManagement from "./components/LocalOnlyDataManagement";
import LocalOnlyModeManagement from "./components/LocalOnlyModeManagement";

/**
 * Local-Only Mode Settings Modal - REFACTORED
 * 427 → 95 lines (78% reduction), Architecture: Custom hook + 4 focused UI components
 * 
 * Features:
 * - Data management (export/import)
 * - Mode switching and data clearing
 * - Statistics display
 * - ConfirmModal integration via useConfirm hook
 * - Full UI standards compliance
 */
const LocalOnlyModeSettings = ({ isOpen, onClose, onModeSwitch }) => {
  const {
    loading,
    error,
    stats,
    fileInputRef,
    loadStats,
    handleExportData,
    handleImportData,
    handleModeSwitch,
    handleClearAllData,
    resetStates,
  } = useLocalOnlyModeSettings();

  // Load statistics when modal opens
  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
    // loadStats is stable from custom hook
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Clear states when closing
  useEffect(() => {
    if (!isOpen) {
      resetStates();
    }
    // resetStates is stable from custom hook
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glassmorphism rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl border-2 border-black bg-purple-100/40 backdrop-blur-3xl relative">
        <div className="p-6 overflow-y-auto max-h-[90vh]">
          <LocalOnlyModeHeader onClose={onClose} loading={loading} error={error} />
          
          <LocalOnlyModeStats stats={stats} />
          
          <LocalOnlyDataManagement
            handleExportData={handleExportData}
            handleImportData={handleImportData}
            fileInputRef={fileInputRef}
            loading={loading}
          />
          
          <LocalOnlyModeManagement
            handleModeSwitch={handleModeSwitch}
            handleClearAllData={handleClearAllData}
            onModeSwitch={onModeSwitch}
            onClose={onClose}
            loading={loading}
          />

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-3xl z-10">
              <div className="text-center">
                <div className="animate-spin h-12 w-12 border-4 border-purple-600/20 border-t-purple-600 rounded-full mx-auto mb-4" />
                <div className="text-sm font-black text-purple-900 uppercase tracking-wide">
                  <span className="text-lg">P</span>ROCESSING...
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t-2 border-black text-center">
            <div className="text-xs text-purple-700 font-medium">
              <a
                href="https://github.com/anthropics/violet-vault/wiki/local-only-mode"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center hover:text-purple-900 transition-colors glassmorphism rounded-lg px-3 py-2 border border-purple-300 bg-purple-50/50"
              >
                Learn more about Local-Only Mode
                {React.createElement(getIcon("ExternalLink"), {
                  className: "h-3 w-3 ml-2",
                })}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalOnlyModeSettings;
