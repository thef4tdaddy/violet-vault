import React from "react";
import { getIcon } from "../../../utils";
import { useConfirm } from "../../../hooks/common/useConfirm";

/**
 * Mode management section for Local-Only Mode Settings
 * Extracted from LocalOnlyModeSettings.jsx following refactoring pattern
 * 
 * Features:
 * - Switch to Standard Mode functionality
 * - Clear all data with confirmation
 * - Uses ConfirmModal via useConfirm hook
 * - Consistent styling with borders and glassmorphism
 */
const LocalOnlyModeManagement = ({ 
  handleModeSwitch, 
  handleClearAllData, 
  onModeSwitch, 
  onClose, 
  loading 
}) => {
  const confirm = useConfirm();

  const handleSwitchMode = async () => {
    const confirmed = await confirm({
      title: "Switch to Standard Mode?",
      message: "This will enable password protection and cloud sync features. Your local data will be preserved and you can set up encryption.",
      confirmLabel: "Switch Mode",
      cancelLabel: "Cancel",
      destructive: false,
      icon: "LogOut",
    });

    if (confirmed) {
      await handleModeSwitch(onModeSwitch, onClose, false);
    }
  };

  const clearDataMessage = (
    <div>
      <p className="mb-3">
        This will permanently delete all your envelopes, transactions, bills, and settings.
        <strong className="text-red-600"> This action cannot be undone.</strong>
      </p>
      <div className="bg-red-50 border border-red-200 rounded p-3">
        <p className="text-xs text-red-800">
          💡 <strong>Tip:</strong> Export your data first if you want to keep a backup.
        </p>
      </div>
    </div>
  );

  const handleClearData = async () => {
    const confirmed = await confirm({
      title: "Clear All Data?",
      message: clearDataMessage,
      confirmLabel: "Clear All Data",
      cancelLabel: "Cancel",
      destructive: true,
      icon: "AlertTriangle",
    });

    if (confirmed) {
      await handleClearAllData();
    }
  };

  return (
    <div className="glassmorphism rounded-xl p-6 border-2 border-black bg-white/90 backdrop-blur-sm shadow-xl">
      <h4 className="font-black text-black text-base mb-4">
        <span className="text-lg">M</span>ODE MANAGEMENT
      </h4>
      <div className="space-y-4">
        {/* Switch to Standard Mode */}
        <div className="glassmorphism rounded-xl p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                {React.createElement(getIcon("LogOut"), {
                  className: "h-6 w-6 text-purple-600 mr-3",
                })}
                <h5 className="font-black text-purple-900 text-base">
                  <span className="text-lg">S</span>WITCH TO STANDARD MODE
                </h5>
              </div>
              <p className="text-sm text-purple-800 font-medium">
                Enable password protection and cloud sync features. Your local data will be preserved.
              </p>
            </div>
            <button
              onClick={handleSwitchMode}
              disabled={loading}
              className="ml-4 glassmorphism rounded-lg px-6 py-3 border-2 border-black bg-purple-600 text-white font-black hover:bg-purple-700 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              SWITCH
            </button>
          </div>
        </div>

        {/* Clear All Data */}
        <div className="glassmorphism rounded-xl p-6 border-2 border-black bg-red-100/40 backdrop-blur-sm shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                {React.createElement(getIcon("Trash2"), {
                  className: "h-6 w-6 text-red-600 mr-3",
                })}
                <h5 className="font-black text-red-900 text-base">
                  <span className="text-lg">C</span>LEAR ALL DATA
                </h5>
              </div>
              <p className="text-sm text-red-800 font-medium">
                Permanently delete all envelopes, transactions, and settings. This cannot be undone.
              </p>
            </div>
            <button
              onClick={handleClearData}
              disabled={loading}
              className="ml-4 glassmorphism rounded-lg px-6 py-3 border-2 border-black bg-red-600 text-white font-black hover:bg-red-700 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              CLEAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalOnlyModeManagement;