import React from "react";
import { getIcon } from "../../../../utils";
import { PROFILE_COLORS } from "../utils/localOnlySetupUtils";

/**
 * ColorSelector - Color selection component for user profile
 * Extracted from LocalOnlyCustomizeStep to reduce complexity
 */
const ColorSelector = ({ userColor, setUserColor }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        {React.createElement(getIcon("Palette"), {
          className: "h-4 w-4 inline mr-1",
        })}
        Profile Color
      </label>
      <div className="grid grid-cols-4 gap-3">
        {PROFILE_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => setUserColor(color.value)}
            className={`w-12 h-12 rounded-xl border-2 transition-all ${
              userColor === color.value
                ? "border-gray-900 scale-110 shadow-lg ring-2 ring-purple-200"
                : "border-gray-200 hover:border-gray-400 hover:scale-105"
            }`}
            style={{ backgroundColor: color.value }}
            title={color.name}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorSelector;