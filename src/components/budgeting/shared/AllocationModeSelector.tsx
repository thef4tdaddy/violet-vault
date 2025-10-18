import React from "react";
import { Select } from "@/components/ui";
import { getIcon } from "../../../utils";

/**
 * Shared component for allocation mode selection using radio buttons
 * Follows the CSS Grid pattern from docs/UI-Component-Patterns.md
 */
const AllocationModeSelector = ({ autoAllocate, onAutoAllocateChange, disabled = false }) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Paycheck Allocation</label>

      <div className="space-y-2">
        {/* Auto-allocate option */}
        <div className="glassmorphism border-2 border-white/20 rounded-xl p-3">
          <div className="grid grid-cols-[auto_1fr] gap-3 items-start">
            <input
              type="radio"
              id="autoAllocateTrue"
              name="autoAllocate"
              value="true"
              checked={autoAllocate === true}
              onChange={() => !disabled && onAutoAllocateChange(true)}
              disabled={disabled}
              className="w-4 h-4 text-purple-600 mt-0.5 justify-self-start"
            />
            <div>
              <div className="flex items-center mb-1">
                {React.createElement(getIcon("Sparkles"), {
                  className: "h-4 w-4 mr-2 text-purple-600",
                })}
                <span className="font-medium text-sm">Auto-allocate</span>
              </div>
              <p className="text-xs text-gray-600 leading-tight">
                Automatically allocate funds from paychecks based on envelope priority
              </p>
            </div>
          </div>
        </div>

        {/* Manual allocation option */}
        <div className="glassmorphism border-2 border-white/20 rounded-xl p-3">
          <div className="grid grid-cols-[auto_1fr] gap-3 items-start">
            <input
              type="radio"
              id="autoAllocateFalse"
              name="autoAllocate"
              value="false"
              checked={autoAllocate === false}
              onChange={() => !disabled && onAutoAllocateChange(false)}
              disabled={disabled}
              className="w-4 h-4 text-purple-600 mt-0.5 justify-self-start"
            />
            <div>
              <div className="flex items-center mb-1">
                {React.createElement(getIcon("Settings"), {
                  className: "h-4 w-4 mr-2 text-gray-600",
                })}
                <span className="font-medium text-sm">Manual allocation</span>
              </div>
              <p className="text-xs text-gray-600 leading-tight">
                Manually allocate funds to this envelope as needed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllocationModeSelector;
