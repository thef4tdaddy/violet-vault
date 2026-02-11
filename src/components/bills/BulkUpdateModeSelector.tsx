import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../utils";

type UpdateMode = "amounts" | "dates" | "both";

interface BulkUpdateModeSelectorProps {
  updateMode: UpdateMode;
  setUpdateMode: (mode: UpdateMode) => void;
}

/**
 * Update mode selector for BulkBillUpdateModal
 * Extracted to reduce complexity
 */
const BulkUpdateModeSelector = ({ updateMode, setUpdateMode }: BulkUpdateModeSelectorProps) => {
  const modes = [
    { value: "amounts", icon: "DollarSign", label: "Amounts Only" },
    { value: "dates", icon: "Calendar", label: "Due Dates Only" },
    { value: "both", icon: "Edit3", label: "Both" },
  ];

  return (
    <div className="flex gap-2 mb-6">
      {modes.map((mode) => (
        <Button
          key={mode.value}
          onClick={() => setUpdateMode(mode.value as UpdateMode)}
          className={`px-4 py-2 rounded-lg flex items-center border-2 border-black shadow-md hover:shadow-lg transition-all font-bold ${
            updateMode === mode.value
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
              : "bg-white/60 backdrop-blur-sm text-gray-700 hover:bg-white/80"
          }`}
        >
          {React.createElement(getIcon(mode.icon), {
            className: "h-4 w-4 mr-2",
          })}
          {mode.label}
        </Button>
      ))}
    </div>
  );
};

export default BulkUpdateModeSelector;
