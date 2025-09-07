import React from "react";
import { DollarSign, AlertCircle, Target } from "lucide-react";
import { ENVELOPE_TYPES } from "../../../constants/categories";
import { getFrequencyOptions } from "../../../utils/common/frequencyCalculations";

const EnvelopeBudgetFields = ({
  formData,
  onUpdateField,
  errors = {},
  calculatedAmounts = {},
  canEdit = true,
}) => {
  const frequencies = getFrequencyOptions();

  const getSectionTitle = () => {
    switch (formData.envelopeType) {
      case ENVELOPE_TYPES.BILL:
        return "Bill Payment Settings";
      case ENVELOPE_TYPES.SINKING_FUND:
        return "Sinking Fund Settings";
      default:
        return "Variable Budget Settings";
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 flex items-center">
        <DollarSign className="h-4 w-4 mr-2 text-blue-600" />
        {getSectionTitle()}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Monthly Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Amount *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              value={formData.monthlyAmount || ""}
              onChange={(e) => onUpdateField("monthlyAmount", e.target.value)}
              disabled={!canEdit}
              className={`w-full pl-8 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.monthlyAmount
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300"
              } ${!canEdit ? "bg-gray-100 cursor-not-allowed" : ""}`}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          {errors.monthlyAmount && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.monthlyAmount}
            </p>
          )}
          {calculatedAmounts.biweeklyAllocation > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              Biweekly: ${calculatedAmounts.biweeklyAllocation.toFixed(2)}
            </p>
          )}
        </div>

        {/* Current Balance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Balance
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              value={formData.currentBalance || ""}
              onChange={(e) => onUpdateField("currentBalance", e.target.value)}
              disabled={!canEdit}
              className={`w-full pl-8 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.currentBalance
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300"
              } ${!canEdit ? "bg-gray-100 cursor-not-allowed" : ""}`}
              placeholder="0.00"
              step="0.01"
            />
          </div>
          {errors.currentBalance && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.currentBalance}
            </p>
          )}
        </div>
      </div>

      {/* Sinking Fund Target Amount */}
      {formData.envelopeType === ENVELOPE_TYPES.SINKING_FUND && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Target className="h-4 w-4 inline mr-1" />
            Target Amount *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              value={formData.targetAmount || ""}
              onChange={(e) => onUpdateField("targetAmount", e.target.value)}
              disabled={!canEdit}
              className={`w-full pl-8 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.targetAmount
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300"
              } ${!canEdit ? "bg-gray-100 cursor-not-allowed" : ""}`}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          {errors.targetAmount && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.targetAmount}
            </p>
          )}
        </div>
      )}

      {/* Payment Frequency (for bills) */}
      {formData.envelopeType === ENVELOPE_TYPES.BILL && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Frequency
          </label>
          <select
            value={formData.frequency || "monthly"}
            onChange={(e) => onUpdateField("frequency", e.target.value)}
            disabled={!canEdit}
            className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              !canEdit ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          >
            {frequencies.map((freq) => (
              <option key={freq.value} value={freq.value}>
                {freq.label}
              </option>
            ))}
          </select>
          {errors.frequency && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.frequency}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default EnvelopeBudgetFields;
