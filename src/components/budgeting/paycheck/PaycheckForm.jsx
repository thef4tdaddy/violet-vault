import React from "react";
import { getIcon } from "../../../utils";

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
}) => {
  const handlePayerChange = (payerName) => {
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
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 text-lg">$</span>
          </div>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => onUpdateField("amount", e.target.value)}
            className={`block w-full pl-8 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
              errors.amount
                ? "border-red-300 bg-red-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
        )}
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
          <input
            type="text"
            list="payers"
            value={formData.payerName}
            onChange={(e) => handlePayerChange(e.target.value)}
            className={`block w-full px-3 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
              errors.payerName
                ? "border-red-300 bg-red-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            placeholder="Enter payer name"
          />
          <datalist id="payers">
            {uniquePayers.map((payer) => (
              <option key={payer} value={payer} />
            ))}
          </datalist>
        </div>
        {errors.payerName && (
          <p className="mt-1 text-sm text-red-600">{errors.payerName}</p>
        )}
      </div>

      {/* Payer Statistics */}
      {selectedPayerStats && selectedPayerStats.count > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-medium text-blue-900 mb-2">
            Recent History for {formData.payerName}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Average:</span>
              <span className="font-medium ml-2">
                ${selectedPayerStats.averageAmount.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Count:</span>
              <span className="font-medium ml-2">
                {selectedPayerStats.count}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Range:</span>
              <span className="font-medium ml-2">
                ${selectedPayerStats.minAmount.toFixed(2)} - $
                {selectedPayerStats.maxAmount.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Last:</span>
              <span className="font-medium ml-2">
                {selectedPayerStats.lastPaycheckDate
                  ? new Date(
                      selectedPayerStats.lastPaycheckDate,
                    ).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Allocation Mode */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {React.createElement(getIcon("Target"), {
            className: "h-4 w-4 inline mr-1 text-green-600",
          })}
          Allocation Mode
        </label>
        <div className="grid grid-cols-1 gap-3">
          <label className="grid grid-cols-[auto_1fr] gap-3 items-start cursor-pointer">
            <div className="relative grid place-items-center">
              <input
                type="radio"
                name="allocationMode"
                value="allocate"
                checked={formData.allocationMode === "allocate"}
                onChange={(e) =>
                  onUpdateField("allocationMode", e.target.value)
                }
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded-full border-2 border-black grid place-items-center transition-colors ${
                  formData.allocationMode === "allocate"
                    ? "bg-green-600"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                {formData.allocationMode === "allocate" && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
            </div>
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                Standard Allocation
              </div>
              <div className="text-gray-600 mt-1">
                Allocate based on envelope monthly amounts (biweekly conversion)
              </div>
            </div>
          </label>
          <label className="grid grid-cols-[auto_1fr] gap-3 items-start cursor-pointer">
            <div className="relative grid place-items-center">
              <input
                type="radio"
                name="allocationMode"
                value="leftover"
                checked={formData.allocationMode === "leftover"}
                onChange={(e) =>
                  onUpdateField("allocationMode", e.target.value)
                }
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded-full border-2 border-black grid place-items-center transition-colors ${
                  formData.allocationMode === "leftover"
                    ? "bg-green-600"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                {formData.allocationMode === "leftover" && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
            </div>
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                Proportional Distribution
              </div>
              <div className="text-gray-600 mt-1">
                Distribute entire paycheck proportionally across envelopes
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onProcess}
          disabled={!canSubmit}
          className="flex-1 flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {React.createElement(getIcon("DollarSign"), {
            className: "h-4 w-4 mr-2",
          })}
          {isLoading ? "Processing..." : "Process Paycheck"}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-green-500 transition-colors"
        >
          {React.createElement(getIcon("RotateCcw"), { className: "h-4 w-4" })}
        </button>
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
