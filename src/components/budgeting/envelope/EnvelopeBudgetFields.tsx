import React from "react";
import { getIcon } from "../../../utils";
import { ENVELOPE_TYPES } from "../../../constants/categories";
import { getFrequencyOptions } from "../../../utils/common/frequencyCalculations";

// Get section title based on envelope type
const getSectionTitle = (envelopeType) => {
  if (envelopeType === ENVELOPE_TYPES.BILL) return "Bill Payment Settings";
  if (envelopeType === ENVELOPE_TYPES.SINKING_FUND) return "Sinking Fund Settings";
  return "Variable Budget Settings";
};

// Build input classes
const getInputClasses = (hasError, canEdit) => {
  const baseClasses = "w-full pl-8 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const errorClasses = hasError ? "border-red-300 bg-red-50" : "border-gray-300";
  const disabledClasses = !canEdit ? "bg-gray-100 cursor-not-allowed" : "";
  return `${baseClasses} ${errorClasses} ${disabledClasses}`;
};

// Error message component
const ErrorMessage = ({ error }) => {
  if (!error) return null;
  
  return (
    <p className="mt-1 text-sm text-red-600 flex items-center">
      {React.createElement(getIcon("AlertCircle"), {
        className: "h-3 w-3 mr-1",
      })}
      {error}
    </p>
  );
};

// Currency input field component
const CurrencyInput = ({ label, value, onChange, error, canEdit, hint, icon, required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {icon && React.createElement(getIcon(icon), { className: "h-4 w-4 inline mr-1" })}
      {label}
      {required && " *"}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="text-gray-500 sm:text-sm">$</span>
      </div>
      <input
        type="number"
        value={value || ""}
        onChange={onChange}
        disabled={!canEdit}
        className={getInputClasses(!!error, canEdit)}
        placeholder="0.00"
        min="0"
        step="0.01"
      />
    </div>
    <ErrorMessage error={error} />
    {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
  </div>
);

// Frequency selector component
const FrequencySelector = ({ value, onChange, error, canEdit }) => {
  const frequencies = getFrequencyOptions();
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Frequency</label>
      <select
        value={value || "monthly"}
        onChange={onChange}
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
      <ErrorMessage error={error} />
    </div>
  );
};

const EnvelopeBudgetFields = ({
  formData,
  onUpdateField,
  errors = {},
  calculatedAmounts = {},
  canEdit = true,
}) => {
  const isBillEnvelope = formData.envelopeType === ENVELOPE_TYPES.BILL;
  const isSinkingFund = formData.envelopeType === ENVELOPE_TYPES.SINKING_FUND;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 flex items-center">
        {React.createElement(getIcon("DollarSign"), {
          className: "h-4 w-4 mr-2 text-blue-600",
        })}
        {getSectionTitle(formData.envelopeType)}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CurrencyInput
          label="Monthly Amount"
          value={formData.monthlyAmount}
          onChange={(e) => onUpdateField("monthlyAmount", e.target.value)}
          error={errors.monthlyAmount}
          canEdit={canEdit}
          required
          hint={
            calculatedAmounts.biweeklyAllocation > 0
              ? `Biweekly: $${calculatedAmounts.biweeklyAllocation.toFixed(2)}`
              : null
          }
        />

        <CurrencyInput
          label="Current Balance"
          value={formData.currentBalance}
          onChange={(e) => onUpdateField("currentBalance", e.target.value)}
          error={errors.currentBalance}
          canEdit={canEdit}
        />
      </div>

      {isSinkingFund && (
        <CurrencyInput
          label="Target Amount"
          icon="Target"
          value={formData.targetAmount}
          onChange={(e) => onUpdateField("targetAmount", e.target.value)}
          error={errors.targetAmount}
          canEdit={canEdit}
          required
        />
      )}

      {isBillEnvelope && (
        <FrequencySelector
          value={formData.frequency}
          onChange={(e) => onUpdateField("frequency", e.target.value)}
          error={errors.frequency}
          canEdit={canEdit}
        />
      )}
    </div>
  );
};

export default EnvelopeBudgetFields;
