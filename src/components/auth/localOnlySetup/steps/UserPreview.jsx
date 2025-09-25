import React from "react";

/**
 * UserPreview - Preview component showing user name and color
 * Extracted from LocalOnlyCustomizeStep to reduce complexity
 */
const UserPreview = ({ userName, userColor }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <label className="block text-xs font-semibold text-gray-500 mb-2">
        PREVIEW
      </label>
      <div className="flex items-center gap-3">
        <div
          className="w-4 h-4 rounded-full ring-2 ring-white shadow-sm"
          style={{ backgroundColor: userColor }}
        />
        <span className="font-semibold text-gray-900">
          {userName.trim() || "Your Name"}
        </span>
      </div>
    </div>
  );
};

export default UserPreview;