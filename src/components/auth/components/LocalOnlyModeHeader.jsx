import React from "react";
import { getIcon } from "../../../utils";

/**
 * Header component for Local-Only Mode Settings modal
 * Extracted from LocalOnlyModeSettings.jsx following refactoring pattern
 * 
 * Features:
 * - Branded title with monitor icon
 * - Status banner with privacy messaging
 * - Close button with loading state
 * - Error display when present
 */
const LocalOnlyModeHeader = ({ onClose, loading, error }) => {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="glassmorphism rounded-full p-3 bg-blue-500/20 border border-blue-400">
            {React.createElement(getIcon("Monitor"), {
              className: "h-8 w-8 text-blue-600",
            })}
          </div>
          <div>
            <h3 className="text-2xl font-black text-black uppercase tracking-wide">
              <span className="text-3xl">L</span>OCAL-ONLY MODE SETTINGS
            </h3>
            <p className="text-sm text-purple-900 font-medium mt-1">
              🔐 Privacy-first data management options
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 glassmorphism backdrop-blur-sm rounded-full p-3 shadow-lg hover:shadow-xl transition-all border-2 border-black"
          disabled={loading}
        >
          {React.createElement(getIcon("X"), { className: "h-6 w-6" })}
        </button>
      </div>

      {/* Status Banner */}
      <div className="glassmorphism rounded-xl p-6 border-2 border-black bg-blue-100/40 backdrop-blur-sm shadow-xl mb-6">
        <div className="flex items-start">
          {React.createElement(getIcon("Shield"), {
            className: "h-6 w-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0",
          })}
          <div className="text-sm">
            <p className="text-blue-900 font-black mb-1">
              <span className="text-lg">P</span>RIVACY-FIRST MODE ACTIVE
            </p>
            <p className="text-blue-800 font-medium">
              Your data is stored only on this device. No cloud sync or password required.
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="glassmorphism rounded-xl p-6 border-2 border-black bg-red-100/40 backdrop-blur-sm shadow-xl mb-6">
          <div className="flex items-start">
            {React.createElement(getIcon("AlertTriangle"), {
              className: "h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0",
            })}
            <div className="text-sm text-red-800 font-medium">{error}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default LocalOnlyModeHeader;