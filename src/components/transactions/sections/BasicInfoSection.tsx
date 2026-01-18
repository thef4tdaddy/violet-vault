import React from "react";
import { TextInput } from "@/components/ui";
import { FormSection } from "@/components/primitives/forms";
import type { Transaction } from "@/types/finance";
import type { TransactionFormData } from "@/domain/schemas/transaction";
import type { TransactionCategorySuggestion } from "@/hooks/platform/analytics/useSmartSuggestions";
import { DateTypeRow } from "./subcomponents/DateTypeRow";
import { AmountCategoryRow } from "./subcomponents/AmountCategoryRow";

interface BasicInfoSectionProps {
  transactionForm: TransactionFormData;
  setTransactionForm: (form: TransactionFormData) => void;
  canEdit: boolean;
  editingTransaction?: Transaction | null;
  categories: string[];
  smartCategorySuggestion?: (description: string) => TransactionCategorySuggestion | null;
}

/**
 * BasicInfoSection - Date, Type, Description, Amount, and Category fields
 * Uses FormSection primitive for consistent layout
 */
export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  transactionForm,
  setTransactionForm,
  canEdit,
  editingTransaction,
  categories,
  smartCategorySuggestion,
}) => {
  const smartSuggestion = React.useMemo(() => {
    return smartCategorySuggestion?.(transactionForm.description) ?? null;
  }, [smartCategorySuggestion, transactionForm.description]);

  return (
    <FormSection title="Basic Information" subtitle="Core transaction details">
      <DateTypeRow
        transactionForm={transactionForm}
        setTransactionForm={setTransactionForm}
        canEdit={canEdit}
        editingTransaction={editingTransaction}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
        <TextInput
          type="text"
          value={transactionForm.description}
          onChange={(e) =>
            setTransactionForm({
              ...transactionForm,
              description: e.target.value,
            })
          }
          disabled={!!editingTransaction && !canEdit}
          placeholder="e.g., Grocery shopping at Walmart"
          required
        />
      </div>

      <AmountCategoryRow
        transactionForm={transactionForm}
        setTransactionForm={setTransactionForm}
        canEdit={canEdit}
        editingTransaction={editingTransaction}
        categories={categories}
        smartSuggestion={smartSuggestion}
      />
    </FormSection>
  );
};

export default BasicInfoSection;
