import React from "react";
import { Button, TextInput, Radio } from "@/components/ui";
import { getIcon } from "../../../utils";
import { useTouchFeedback } from "../../../utils/ui/touchFeedback";

// Type definitions
interface PayerStats {
  count: number;
  averageAmount: number;
  minAmount: number;
  maxAmount: number;
  lastPaycheckDate: string | null;
}

interface FormData {
  amount: string;
  payerName: string;
  allocationMode: string;
  date: string;
  [key: string]: unknown;
}

interface FormErrors {
  [key: string]: string;
}

// PayerStats component - displays payer history
const PayerStats = ({ stats, payerName }: { stats: PayerStats | null; payerName: string }) => {
  if (!stats || stats.count === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <h4 className="font-medium text-blue-900 mb-2">Recent History for {payerName}</h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-blue-700">Average:</span>
          <span className="font-medium ml-2">${stats.averageAmount.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-blue-700">Count:</span>
          <span className="font-medium ml-2">{stats.count}</span>
        </div>
        <div>
          <span className="text-blue-700">Range:</span>
          <span className="font-medium ml-2">
            ${stats.minAmount.toFixed(2)} - ${stats.maxAmount.toFixed(2)}
          </span>
        </div>
        <div>
          <span className="text-blue-700">Last:</span>
          <span className="font-medium ml-2">
            {stats.lastPaycheckDate ? new Date(stats.lastPaycheckDate).toLocaleDateString() : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
};

// AllocationModeOption component - single radio option
const AllocationModeOption = ({
  value,
  checked,
  onChange,
  title,
  description,
}: {
  value: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  title: string;
  description: string;
}) => (
  <label className="grid grid-cols-[auto_1fr] gap-3 items-start cursor-pointer">
    <div className="relative grid place-items-center">
      <Radio
        name="allocationMode"
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <div
        className={`w-5 h-5 rounded-full border-2 border-black grid place-items-center transition-colors ${
          checked ? "bg-green-600" : "bg-white hover:bg-gray-50"
        }`}
      >
        {checked && <div className="w-2 h-2 rounded-full bg-white"></div>}
      </div>
    </div>
    <div className="text-sm">
      <div className="font-medium text-gray-900">{title}</div>
      <div className="text-gray-600 mt-1">{description}</div>
    </div>
  </label>
);

interface PaycheckFormProps {
  formData: FormData;
  errors: FormErrors;
  uniquePayers: string[];
  selectedPayerStats: PayerStats | null;
  onUpdateField: (field: string, value: string) => void;
  onApplyPrediction: (payerName: string) => void;
  canSubmit: boolean;
  isLoading: boolean;
  onProcess: () => void;
  onReset: () => void;
}

const PaycheckForm = ({
  formData,
  errors,
  uniquePayers,
  selectedPayerStats,
  onUpdateField,
  onApplyPrediction,
  canSubmit,
  isLoading,
  onProcess,
  onReset,
}: PaycheckFormProps) => {
  // Enhanced haptic feedback for success actions
  const successFeedback = useTouchFeedback("success", "success");

  const handlePayerChange = (payerName: string) => {
    onUpdateField("payerName", payerName);
    if (payerName && !formData.amount) {
      onApplyPrediction(payerName);
    }
  };

  return (
    <div className="space-y-6">
      {/* Amount Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {React.createElement(getIcon("DollarSign"), {
            className: "h-4 w-4 inline mr-1 text-green-600",
          })}
          Paycheck Amount
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <span className="text-gray-500 text-lg">$</span>
          </div>
          <TextInput
            type="number"
            value={formData.amount}
            onChange={(e) => onUpdateField("amount", e.target.value)}
            className={`pl-8 ${errors.amount ? "border-red-300 bg-red-50" : ""}`}
            placeholder="0.00"
            step="0.01"
            min="0"
            error={errors.amount}
          />
        </div>
        {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
      </div>

      {/* Payer Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {React.createElement(getIcon("User"), {
            className: "h-4 w-4 inline mr-1 text-green-600",
          })}
          Payer
        </label>
        <div className="relative">
          <TextInput
            type="text"
            list="payers"
            value={formData.payerName}
            onChange={(e) => handlePayerChange(e.target.value)}
            placeholder="Enter payer name"
            error={errors.payerName}
          />
          <datalist id="payers">
            {uniquePayers.map((payer) => (
              <option key={payer} value={payer} />
            ))}
          </datalist>
        </div>
        {errors.payerName && <p className="mt-1 text-sm text-red-600">{errors.payerName}</p>}
      </div>

      {/* Payer Statistics */}
      <PayerStats stats={selectedPayerStats} payerName={formData.payerName} />

      {/* Allocation Mode */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {React.createElement(getIcon("Target"), {
            className: "h-4 w-4 inline mr-1 text-green-600",
          })}
          Allocation Mode
        </label>
        <div className="grid grid-cols-1 gap-3">
          <AllocationModeOption
            value="allocate"
            checked={formData.allocationMode === "allocate"}
            onChange={(e) => onUpdateField("allocationMode", e.target.value)}
            title="Standard Allocation"
            description="Allocate based on envelope monthly amounts (biweekly conversion)"
          />
          <AllocationModeOption
            value="leftover"
            checked={formData.allocationMode === "leftover"}
            onChange={(e) => onUpdateField("allocationMode", e.target.value)}
            title="Proportional Distribution"
            description="Distribute entire paycheck proportionally across envelopes"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          onClick={successFeedback.onClick(onProcess)}
          disabled={!canSubmit}
          className={`flex-1 flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors border-2 border-black ${successFeedback.className}`}
        >
          {React.createElement(getIcon("DollarSign"), {
            className: "h-4 w-4 mr-2",
          })}
          {isLoading ? "Processing..." : "Process Paycheck"}
        </Button>
        <Button
          type="button"
          onClick={onReset}
          className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-green-500 transition-colors"
        >
          {React.createElement(getIcon("RotateCcw"), { className: "h-4 w-4" })}
        </Button>
      </div>

      {errors.allocations && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.allocations}</p>
        </div>
      )}
    </div>
  );
};

export default PaycheckForm;
