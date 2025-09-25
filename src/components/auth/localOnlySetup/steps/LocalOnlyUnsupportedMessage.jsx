import React from "react";
import { getIcon } from "../../../../utils";

/**
 * LocalOnlyUnsupportedMessage - Displays when browser doesn't support local-only mode
 * Extracted from LocalOnlySetup.jsx to reduce component complexity
 */
const LocalOnlyUnsupportedMessage = ({ onSwitchToAuth }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glassmorphism rounded-2xl p-8 w-full max-w-md text-center border border-white/30 shadow-2xl">
        {React.createElement(getIcon("ShieldOff"), {
          className: "h-16 w-16 text-red-500 mx-auto mb-4",
        })}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Local-Only Mode Unavailable
        </h2>
        <p className="text-gray-600 mb-6">
          Your browser doesn't support the features required for local-only mode.
        </p>
        <button
          onClick={onSwitchToAuth}
          className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors border-2 border-black"
        >
          Use Standard Mode
        </button>
      </div>
    </div>
  );
};

export default LocalOnlyUnsupportedMessage;