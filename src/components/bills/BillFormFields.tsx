import type { BillFormData } from "@/types/bills";
import type { BillSuggestion } from "@/hooks/platform/analytics/useSmartSuggestions";
import { Textarea } from "@/components/ui";
import { UniversalConnectionManager } from "../ui/ConnectionDisplay";
import { BillBasicFields, BillIconSelector } from "./BillFormSections";

type BillBasicFieldsProps = Parameters<typeof BillBasicFields>[0];
type BillIconSelectorProps = Parameters<typeof BillIconSelector>[0];

interface BillFormFieldsProps {
  formData: BillFormData;
  updateField: BillBasicFieldsProps["updateField"];
  canEdit: BillBasicFieldsProps["canEdit"];
  editingBill: BillBasicFieldsProps["editingBill"];
  suggestedIconName: string;
  iconSuggestions: BillIconSelectorProps["iconSuggestions"];
  categories: string[];
  smartSuggestion: BillSuggestion | null;
  onApplySmartCategory: () => void;
  onApplySmartIcon: () => void;
  calculateBiweeklyAmount: () => string | number;
  calculateMonthlyAmount: () => string | number;
  getNextDueDate: () => string;
}

/**
 * Form fields section for AddBillModal
 * Pure UI component - form wrapper and buttons handled by FormModal primitive
 * Refactored to use FormModal primitive (Issue #1594)
 */
const BillFormFields = ({
  // Form data and handlers
  formData,
  updateField,

  // UI state
  canEdit,
  editingBill,

  // Computed values
  suggestedIconName,
  iconSuggestions,
  categories,
  smartSuggestion,
  onApplySmartCategory,
  onApplySmartIcon,

  // Utility functions
  calculateBiweeklyAmount,
  calculateMonthlyAmount,
  getNextDueDate,
}: BillFormFieldsProps) => {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <BillBasicFields
        formData={formData}
        updateField={updateField}
        canEdit={canEdit}
        editingBill={editingBill}
        categories={categories}
        smartSuggestion={smartSuggestion}
        onApplySmartCategory={onApplySmartCategory}
      />

      {/* Bill Icon Selection */}
      <BillIconSelector
        formData={formData}
        updateField={updateField}
        canEdit={canEdit}
        editingBill={editingBill}
        suggestedIconName={suggestedIconName}
        iconSuggestions={iconSuggestions}
        onApplySmartIcon={onApplySmartIcon}
      />

      {/* Envelope Connection - Universal component for consistent UX */}
      <UniversalConnectionManager
        entityType="bill"
        entityId={editingBill?.id ?? undefined}
        canEdit={!editingBill || canEdit}
        theme="purple"
        showSelector={true}
      />

      {/* Notes */}
      <div>
        <Textarea
          label="Notes"
          value={formData.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          disabled={!!editingBill && !canEdit}
          rows={3}
          placeholder="Additional notes about this bill..."
        />
      </div>

      {/* Helper Info Display */}
      <div className="text-sm text-gray-600 space-y-1">
        {formData.frequency === "biweekly" && formData.amount && (
          <div>Monthly equivalent: ~${calculateMonthlyAmount()}</div>
        )}
        {formData.frequency === "monthly" && formData.amount && (
          <div>Biweekly equivalent: ~${calculateBiweeklyAmount()}</div>
        )}
        {formData.dueDate && <div>Next due: {getNextDueDate()}</div>}
      </div>
    </div>
  );
};

export default BillFormFields;
