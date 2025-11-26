import React from "react";
import { Select, TextInput, Button } from "@/components/ui";
import { getIcon } from "@/utils";
import { getIconByName } from "@/utils/common/billIcons";
import { getFrequencyOptions } from "@/utils/common/frequencyCalculations";
import type { BillIconOption } from "@/utils/billIcons/iconOptions";
import type { BillFormData, Bill } from "@/types/bills";
import type { BillSuggestion } from "@/hooks/analytics/useSmartSuggestions";

/**
 * Bill entity type - flexible to accept any bill-like structure
 */
type BillEntity =
  | Bill
  | (Record<string, unknown> & {
      id?: string;
    });

const SmartSuggestionBanner = ({
  label,
  onApply,
  disabled,
  tone = "purple",
}: {
  label: string;
  onApply: () => void;
  disabled: boolean;
  tone?: "purple" | "emerald";
}) => {
  const colorClasses =
    tone === "emerald"
      ? {
          border: "border-emerald-200",
          background: "bg-emerald-50",
          text: "text-emerald-700",
          button: "bg-emerald-600 hover:bg-emerald-700",
        }
      : {
          border: "border-purple-200",
          background: "bg-purple-50",
          text: "text-purple-700",
          button: "bg-purple-600 hover:bg-purple-700",
        };

  return (
    <div
      className={`mt-2 flex items-center justify-between rounded-lg px-3 py-2 border ${colorClasses.border} ${colorClasses.background}`}
    >
      <div className={`flex items-center text-sm font-medium ${colorClasses.text}`}>
        {React.createElement(getIcon("Sparkles"), {
          className: "h-4 w-4 mr-2",
        })}
        {label}
      </div>
      <Button
        type="button"
        onClick={onApply}
        disabled={disabled}
        className={`px-3 py-1 text-xs text-white border-2 border-black rounded-lg ${colorClasses.button}`}
      >
        Apply
      </Button>
    </div>
  );
};

/**
 * Props for BillBasicFields component
 */
interface BillBasicFieldsProps {
  formData: BillFormData;
  updateField: (field: keyof BillFormData, value: string | boolean) => void;
  canEdit: boolean;
  editingBill: BillEntity | null | undefined;
  categories: string[];
  smartSuggestion: BillSuggestion | null;
  onApplySmartCategory: () => void;
}

/**
 * Basic information fields for BillFormFields
 * Extracted to reduce complexity
 */
export const BillBasicFields: React.FC<BillBasicFieldsProps> = ({
  formData,
  updateField,
  canEdit,
  editingBill,
  categories,
  smartSuggestion,
  onApplySmartCategory,
}) => {
  const frequencyOptions = getFrequencyOptions();
  const isReadOnly = Boolean(editingBill && !canEdit);

  const showCategorySuggestion =
    smartSuggestion && smartSuggestion.category && smartSuggestion.category !== formData.category;

  const categorySuggestionBanner = showCategorySuggestion ? (
    <SmartSuggestionBanner
      label={`Suggested: ${smartSuggestion.category}`}
      onApply={onApplySmartCategory}
      disabled={isReadOnly}
      tone="purple"
    />
  ) : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Bill Name */}
      <div className="md:col-span-2">
        <TextInput
          label="Bill Name *"
          value={formData.name}
          onChange={(e) => updateField("name", e.target.value)}
          disabled={isReadOnly}
          placeholder="e.g., Electric Bill, Internet, Rent"
          required
        />
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => updateField("amount", e.target.value)}
            disabled={isReadOnly}
            className={`w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
              isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
            placeholder="0.00"
            required
          />
        </div>
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
        <input
          type="date"
          value={formData.dueDate}
          onChange={(e) => updateField("dueDate", e.target.value)}
          disabled={isReadOnly}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
            isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
          required
        />
      </div>

      {/* Frequency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
        <Select
          value={formData.frequency}
          onChange={(e) => updateField("frequency", e.target.value)}
          disabled={isReadOnly}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
            isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
        >
          {frequencyOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <Select
          value={formData.category}
          onChange={(e) => updateField("category", e.target.value)}
          disabled={isReadOnly}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
            isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
        {categorySuggestionBanner}
      </div>
    </div>
  );
};

/**
 * Props for BillIconSelector component
 */
interface BillIconSelectorProps {
  formData: BillFormData;
  updateField: (field: keyof BillFormData, value: string | boolean) => void;
  canEdit: boolean;
  editingBill: BillEntity | null | undefined;
  suggestedIconName: string;
  iconSuggestions: BillIconOption[];
  onApplySmartIcon: () => void;
}

/**
 * Icon selection section for BillFormFields
 * Extracted to reduce complexity
 */
export const BillIconSelector: React.FC<BillIconSelectorProps> = ({
  formData,
  updateField,
  canEdit,
  editingBill,
  suggestedIconName,
  iconSuggestions,
  onApplySmartIcon,
}) => {
  const isReadOnly = Boolean(editingBill && !canEdit);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Bill Icon
        {suggestedIconName && (
          <Button
            type="button"
            onClick={onApplySmartIcon}
            className="ml-2 inline-flex items-center justify-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors"
            disabled={isReadOnly}
          >
            {React.createElement(getIcon("Sparkles"), {
              className: "h-3 w-3 mr-1",
            })}
            Suggested: {suggestedIconName}
          </Button>
        )}
      </label>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
        {iconSuggestions.map(({ name, Icon }) => {
          const iconName = name;
          const IconComponent = Icon || getIconByName(iconName);
          const isSelected = formData.iconName === iconName;
          return (
            <Button
              key={iconName}
              type="button"
              onClick={() => updateField("iconName", iconName)}
              disabled={isReadOnly}
              className={`p-3 rounded-lg border-2 hover:border-blue-300 focus:ring-2 focus:ring-blue-500 transition-colors ${
                isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
              } ${isReadOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              title={iconName}
            >
              {React.createElement(
                IconComponent as React.ComponentType<{
                  className?: string;
                  "data-testid"?: string;
                }>,
                {
                  className: `h-5 w-5 ${isSelected ? "text-blue-600" : "text-gray-600"}`,
                  "data-testid": `bill-icon-option-${iconName}`,
                }
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Props for BillFormActions component
 */
interface BillFormActionsProps {
  formData: BillFormData;
  editingBill: BillEntity | null | undefined;
  canEdit: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  calculateBiweeklyAmount: () => string | number;
  calculateMonthlyAmount: () => string | number;
  getNextDueDate: () => string;
}

/**
 * Form action buttons for BillFormFields
 * Extracted to reduce complexity
 */
export const BillFormActions: React.FC<BillFormActionsProps> = ({
  formData,
  editingBill,
  canEdit,
  isSubmitting,
  onClose,
  calculateBiweeklyAmount,
  calculateMonthlyAmount,
  getNextDueDate,
}) => {
  const isReadOnly = Boolean(editingBill && !canEdit);

  return (
    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
      <div className="text-sm text-gray-600">
        {formData.frequency === "biweekly" && formData.amount && (
          <div>Monthly equivalent: ~${calculateMonthlyAmount()}</div>
        )}
        {formData.frequency === "monthly" && formData.amount && (
          <div>Biweekly equivalent: ~${calculateBiweeklyAmount()}</div>
        )}
        {formData.dueDate && <div>Next due: {getNextDueDate()}</div>}
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="px-4 py-2 border-2 border-black rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isReadOnly}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 border-2 border-black disabled:opacity-50 flex items-center"
        >
          {React.createElement(getIcon("Save"), {
            className: "h-4 w-4 mr-2",
          })}
          {isSubmitting ? "Saving..." : editingBill ? "Update Bill" : "Add Bill"}
        </Button>
      </div>
    </div>
  );
};
