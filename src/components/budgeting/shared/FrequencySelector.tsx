import React from "react";
import { Select } from "@/components/ui";
import { getIcon } from "../../../utils";
import { getFrequencyOptions } from "@/utils/core/common/frequencyCalculations";

interface FrequencySelectorProps {
  selectedFrequency: string;
  onFrequencyChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
  error?: string | null;
  className?: string;
}

/**
 * Shared component for frequency selection
 * Used across envelope and bill forms
 */
const FrequencySelector = ({
  selectedFrequency,
  onFrequencyChange,
  label = "Payment Frequency",
  disabled = false,
  error = null,
  className = "",
}: FrequencySelectorProps) => {
  const frequencies = getFrequencyOptions();

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {React.createElement(getIcon("Calendar"), {
            className: "h-4 w-4 text-gray-400",
          })}
        </div>
        <Select
          value={selectedFrequency}
          onChange={(e) => !disabled && onFrequencyChange(e.target.value)}
          disabled={disabled}
          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            error ? "border-red-300 bg-red-50" : "border-gray-300"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {frequencies.map((freq) => (
            <option key={freq.value} value={freq.value}>
              {freq.label}
            </option>
          ))}
        </Select>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FrequencySelector;
