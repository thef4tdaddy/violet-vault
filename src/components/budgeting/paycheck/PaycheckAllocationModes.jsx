import React from "react";
import { getIcon } from "../../../utils";

/**
 * Paycheck allocation mode selector component
 * Radio button selection for allocation strategy
 */
const PaycheckAllocationModes = ({
  allocationMode,
  onChange,
  disabled = false,
}) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-purple-900 mb-4">
        {React.createElement(getIcon("Calculator"), {
          className: "h-4 w-4 inline mr-2",
        })}
        How should this be allocated?
      </label>
      <div className="space-y-4">
        <AllocationModeOption
          value="allocate"
          checked={allocationMode === "allocate"}
          onChange={onChange}
          disabled={disabled}
          icon="Wallet"
          iconColor="text-purple-600"
          title="Auto-allocate to Envelopes"
          description="Fill up bill and variable expense envelopes based on their funding needs, then put leftovers in unassigned cash"
        />

        <AllocationModeOption
          value="leftover"
          checked={allocationMode === "leftover"}
          onChange={onChange}
          disabled={disabled}
          icon="TrendingUp"
          iconColor="text-emerald-600"
          title="All to Unassigned Cash"
          description="Put the entire paycheck into unassigned cash for manual allocation later"
        />
      </div>
    </div>
  );
};

/**
 * Individual allocation mode option component
 */
const AllocationModeOption = ({
  value,
  checked,
  onChange,
  disabled,
  icon,
  iconColor,
  title,
  description,
}) => (
  <div className="glassmorphism border-2 border-black rounded-2xl hover:border-purple-300 transition-all p-6">
    <div className="grid grid-cols-[auto_1fr] gap-4 items-start">
      <input
        type="radio"
        value={value}
        checked={checked}
        onChange={(e) => onChange(e.target.value)}
        className={`w-5 h-5 mt-0.5 justify-self-start ${
          value === "allocate" ? "text-purple-600" : "text-emerald-600"
        }`}
        disabled={disabled}
      />
      <div>
        <div className="flex items-center mb-2">
          {React.createElement(getIcon(icon), {
            className: `h-5 w-5 mr-3 ${iconColor}`,
          })}
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  </div>
);

export default PaycheckAllocationModes;
