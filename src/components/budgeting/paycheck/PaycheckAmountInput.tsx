import React from "react";
import { getIcon } from "../../../utils";

// Type definitions
interface PaycheckAmountInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Paycheck amount input component
 * Handles amount input with proper styling and validation
 */
const PaycheckAmountInput = ({ value, onChange, disabled = false }: PaycheckAmountInputProps) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-purple-900 mb-3">
        {React.createElement(getIcon("DollarSign"), {
          className: "h-4 w-4 inline mr-2",
        })}
        Paycheck Amount
      </label>
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="glassmorphism w-full px-6 py-4 text-xl font-semibold border-2 border-black rounded-2xl focus:ring-2 focus:ring-purple-500"
        placeholder="0.00"
        disabled={disabled}
      />
    </div>
  );
};

export default PaycheckAmountInput;
