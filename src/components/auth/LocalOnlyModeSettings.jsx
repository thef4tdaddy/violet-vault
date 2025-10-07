import React, { useState, useRef, useEffect } from "react";
import { globalToast } from "../../stores/ui/toastStore";
import { getIcon } from "../../utils";
import { useLocalOnlyMode } from "../../hooks/common/useLocalOnlyMode";
import logger from "../../utils/common/logger";

const LocalOnlyModeSettings = ({ isOpen, onClose, onModeSwitch }) => {
  const {
    loading,
    error,
    clearError,
    exitLocalOnlyModeAndClear,
    exportData,
    importData,
    getStats,
    clearAllData,
    validateImportFile,
  } = useLocalOnlyMode();

  const [stats, setStats] = useState(null);
  const [_importFile, _setImportFile] = useState(null);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const fileInputRef = useRef(null);

  // Load statistics when modal opens
  useEffect(() => {
    if (isOpen) {
      getStats().then(setStats).catch(logger.error);
    }
  }, [isOpen]); // getStats is stable in Zustand

  // Clear states when closing
  useEffect(() => {
    if (!isOpen) {
      clearError();
      _setImportFile(null);
      setShowConfirmExit(false);
      setShowConfirmClear(false);
    }
  }, [isOpen, clearError]);

  const handleExportData = async () => {
    try {
      await exportData();
    } catch (err) {
      logger.error("Export failed:", err);
    }
  };

  const handleImportData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const fileText = await file.text();
      const fileData = JSON.parse(fileText);

      const validation = validateImportFile(fileData);
      if (!validation.valid) {
        globalToast.showError(`Invalid import file: ${validation.error}`, "Invalid File");
        return;
      }

      await importData(fileData);

      // Refresh stats
      const newStats = await getStats();
      setStats(newStats);

      globalToast.showSuccess("Data imported successfully!", "Import Complete");
    } catch (err) {
      logger.error("Import failed:", err);
      globalToast.showError(`Import failed: ${err.message}`, "Import Failed");
    }
  };

  const handleExitLocalMode = async (clearData = false) => {
    try {
      await exitLocalOnlyModeAndClear(clearData);
      onModeSwitch("standard");
      onClose();
    } catch (err) {
      logger.error("Failed to exit local-only mode:", err);
    }
  };

  const handleClearAllData = async () => {
    try {
      await clearAllData();

      // Refresh stats
      const newStats = await getStats();
      setStats(newStats);

      setShowConfirmClear(false);
      globalToast.showSuccess("All data cleared successfully!", "Data Cleared");
    } catch (err) {
      logger.error("Failed to clear data:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glassmorphism rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/30 shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center">
              {React.createElement(getIcon("Monitor"), {
                className: "h-5 w-5 mr-2 text-blue-600",
              })}
              Local-Only Mode Settings
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
              disabled={loading}
            >
              {React.createElement(getIcon("X"), {
                className: "h-5 w-5",
              })}
            </button>
          </div>

          {/* Status Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              {React.createElement(getIcon("Shield"), {
                className: "h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0",
              })}
              <div className="text-sm">
                <p className="text-blue-900 font-medium mb-1">Privacy-First Mode Active</p>
                <p className="text-blue-800">
                  Your data is stored only on this device. No cloud sync or password required.
                </p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                {React.createElement(getIcon("AlertTriangle"), {
                  className: "h-4 w-4 text-red-600 mr-2 mt-0.5",
                })}
                <div className="text-sm text-red-800">{error}</div>
              </div>
            </div>
          )}

          {/* Statistics */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                {React.createElement(getIcon("Database"), {
                  className: "h-6 w-6 text-green-600 mx-auto mb-2",
                })}
                <div className="text-lg font-semibold text-green-900">{stats.totalEnvelopes}</div>
                <div className="text-xs text-green-700">Envelopes</div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg text-center">
                {React.createElement(getIcon("BarChart3"), {
                  className: "h-6 w-6 text-purple-600 mx-auto mb-2",
                })}
                <div className="text-lg font-semibold text-purple-900">
                  {stats.totalTransactions}
                </div>
                <div className="text-xs text-purple-700">Transactions</div>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg text-center">
                {React.createElement(getIcon("HardDrive"), {
                  className: "h-6 w-6 text-amber-600 mx-auto mb-2",
                })}
                <div className="text-lg font-semibold text-amber-900">
                  {stats.storageSizeFormatted}
                </div>
                <div className="text-xs text-amber-700">Storage Used</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg text-center">
                {React.createElement(getIcon("Monitor"), {
                  className: "h-6 w-6 text-gray-600 mx-auto mb-2",
                })}
                <div className="text-lg font-semibold text-gray-900">{stats.totalBills}</div>
                <div className="text-xs text-gray-700">Bills</div>
              </div>
            </div>
          )}

          {/* Data Management Section */}
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Data Management</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Export Data */}
                <button
                  onClick={handleExportData}
                  disabled={loading}
                  className="p-4 border border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors disabled:opacity-50 text-left"
                >
                  {React.createElement(getIcon("Download"), {
                    className: "h-6 w-6 text-green-600 mb-2",
                  })}
                  <div className="font-medium text-gray-900">Export Data</div>
                  <div className="text-sm text-gray-600">
                    Download all your budget data as a backup file
                  </div>
                </button>

                {/* Import Data */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="p-4 border border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 text-left"
                >
                  {React.createElement(getIcon("Upload"), {
                    className: "h-6 w-6 text-blue-600 mb-2",
                  })}
                  <div className="font-medium text-gray-900">Import Data</div>
                  <div className="text-sm text-gray-600">
                    Restore data from a previous export file
                  </div>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Mode Management Section */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Mode Management</h4>
              <div className="space-y-4">
                {/* Switch to Standard Mode */}
                <div className="border border-purple-300 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        {React.createElement(getIcon("LogOut"), {
                          className: "h-5 w-5 text-purple-600 mr-2",
                        })}
                        <h5 className="font-medium text-gray-900">Switch to Standard Mode</h5>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Enable password protection and cloud sync features. Your local data will be
                        preserved.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowConfirmExit(true)}
                      disabled={loading}
                      className="ml-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      Switch Mode
                    </button>
                  </div>
                </div>

                {/* Clear All Data */}
                <div className="border border-red-300 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        {React.createElement(getIcon("Trash2"), {
                          className: "h-5 w-5 text-red-600 mr-2",
                        })}
                        <h5 className="font-medium text-gray-900">Clear All Data</h5>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Permanently delete all envelopes, transactions, and settings. This cannot be
                        undone.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowConfirmClear(true)}
                      disabled={loading}
                      className="ml-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Clear Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full mx-auto mb-3" />
                <div className="text-sm text-gray-600">Processing...</div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <div className="text-xs text-gray-500">
              <a
                href="https://github.com/anthropics/violet-vault/wiki/local-only-mode"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center hover:text-gray-700"
              >
                Learn more about Local-Only Mode
                {React.createElement(getIcon("ExternalLink"), {
                  className: "h-3 w-3 ml-1",
                })}
              </a>
            </div>
          </div>
        </div>

        {/* Confirmation Modals */}

        {/* Exit Confirmation */}
        {showConfirmExit && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 rounded-2xl">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Switch to Standard Mode?</h4>
              <p className="text-sm text-gray-600 mb-6">
                This will enable password protection and cloud sync features. Your local data will
                be preserved and you can set up encryption.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmExit(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleExitLocalMode(false)}
                  disabled={loading}
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  Switch Mode
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clear Confirmation */}
        {showConfirmClear && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 rounded-2xl">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center mb-4">
                {React.createElement(getIcon("AlertTriangle"), {
                  className: "h-6 w-6 text-red-600 mr-2",
                })}
                <h4 className="text-lg font-semibold text-gray-900">Clear All Data?</h4>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                This will permanently delete all your envelopes, transactions, bills, and settings.
                <strong className="text-red-600"> This action cannot be undone.</strong>
              </p>
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-6">
                <p className="text-xs text-red-800">
                  💡 <strong>Tip:</strong> Export your data first if you want to keep a backup.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAllData}
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocalOnlyModeSettings;
