import React from "react";
import ColorSelector from "./ColorSelector";
import UserPreview from "./UserPreview";

/**
 * LocalOnlyCustomizeStep - User customization step (name, color, preview)
 * Extracted from LocalOnlySetup.jsx to reduce component complexity
 */
const LocalOnlyCustomizeStep = ({
  userName,
  setUserName,
  userColor,
  setUserColor,
  onBack,
  onStartLocalOnly,
  loading,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Customize Your Profile
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={50}
            />
          </div>

          <ColorSelector userColor={userColor} setUserColor={setUserColor} />
          <UserPreview userName={userName} userColor={userColor} />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border-2 border-black"
        >
          Back
        </button>
        <button
          onClick={onStartLocalOnly}
          disabled={loading || !userName.trim()}
          className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 border-2 border-black"
        >
          {loading ? "Starting..." : "Start Local-Only Mode"}
        </button>
      </div>
    </div>
  );
};

export default LocalOnlyCustomizeStep;