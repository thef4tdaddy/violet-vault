import { Textarea } from "@/components/ui";
import { UniversalConnectionManager } from "../ui/ConnectionDisplay";
import {
  BillBasicFields,
  BillIconSelector,
  BillFormActions,
} from "./BillFormSections";

/**
 * Form fields section for AddBillModal
 * Pure UI component that preserves exact visual appearance
 * Refactored to reduce complexity by extracting sub-components
 */
const BillFormFields = ({
  // Form data and handlers
  formData,
  updateField,

  // UI state
  canEdit,
  editingBill,

  // Form handlers
  handleSubmit,
  isSubmitting,
  onClose,

  // Computed values
  suggestedIconName,
  iconSuggestions,
  categories,

  // Utility functions
  calculateBiweeklyAmount,
  calculateMonthlyAmount,
  getNextDueDate,
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      {/* Basic Information */}
      <BillBasicFields
        formData={formData}
        updateField={updateField}
        canEdit={canEdit}
        editingBill={editingBill}
        categories={categories}
      />

      {/* Bill Icon Selection */}
      <BillIconSelector
        formData={formData}
        updateField={updateField}
        canEdit={canEdit}
        editingBill={editingBill}
        suggestedIconName={suggestedIconName}
        iconSuggestions={iconSuggestions}
      />

      {/* Envelope Connection - Universal component for consistent UX */}
      <UniversalConnectionManager
        entityType="bill"
        entityId={editingBill?.id}
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
          disabled={editingBill && !canEdit}
          rows={3}
          placeholder="Additional notes about this bill..."
        />
      </div>

      {/* Action Buttons */}
      <BillFormActions
        formData={formData}
        editingBill={editingBill}
        canEdit={canEdit}
        isSubmitting={isSubmitting}
        onClose={onClose}
        calculateBiweeklyAmount={calculateBiweeklyAmount}
        calculateMonthlyAmount={calculateMonthlyAmount}
        getNextDueDate={getNextDueDate}
      />
    </form>
  );
};

export default BillFormFields;
