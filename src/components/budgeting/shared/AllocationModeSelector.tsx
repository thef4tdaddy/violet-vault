import React from "react";
import { getIcon } from "../../../utils";
import { Radio } from "@/components/ui";

interface AllocationModeSelectorProps {
  autoAllocate: boolean;
  onAutoAllocateChange: (value: boolean) => void;
  disabled?: boolean;
}

/**
 * Shared component for allocation mode selection using radio buttons
 * Follows the CSS Grid pattern from docs/UI-Component-Patterns.md
 */
const AllocationModeSelector = ({
  autoAllocate,
  onAutoAllocateChange,
  disabled = false,
}: AllocationModeSelectorProps) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Paycheck Allocation</label>

      <div className="space-y-2">
        {/* Auto-allocate option */}
        <div className="glassmorphism border-2 border-white/20 rounded-xl p-3">
          <div className="grid grid-cols-[auto_1fr] gap-3 items-start">
            <Radio
              id="autoAllocateTrue"
              name="autoAllocate"
              value="true"
              checked={autoAllocate === true}
              onChange={() => !disabled && onAutoAllocateChange(true)}
              disabled={disabled}
              className="mt-0.5 justify-self-start"
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
            <Radio
              id="autoAllocateFalse"
              name="autoAllocate"
              value="false"
              checked={autoAllocate === false}
              onChange={() => !disabled && onAutoAllocateChange(false)}
              disabled={disabled}
              className="mt-0.5 justify-self-start"
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
