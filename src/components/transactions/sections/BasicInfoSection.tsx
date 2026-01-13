import React from "react";
import { Select, TextInput, Button } from "@/components/ui";
import { FormSection } from "@/components/primitives/forms";
import { getIcon } from "@/utils";
import type { Transaction } from "@/types/finance";
import type { TransactionFormData } from "@/domain/schemas/transaction";
import type { TransactionCategorySuggestion } from "@/hooks/platform/analytics/useSmartSuggestions";

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

  const showSuggestion =
    smartSuggestion &&
    smartSuggestion.category &&
    smartSuggestion.category !== transactionForm.category;

  return (
    <FormSection title="Basic Information" subtitle="Core transaction details">
      {/* Date and Type Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
          <input
            type="date"
            value={transactionForm.date}
            onChange={(e) =>
              setTransactionForm({
                ...transactionForm,
                date: e.target.value,
              })
            }
            disabled={!!editingTransaction && !canEdit}
            className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
              !!editingTransaction && !canEdit ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
          <div className="grid grid-cols-2 gap-3">
            {/* Expense Button */}
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setTransactionForm({
                  ...transactionForm,
                  type: "expense",
                })
              }
              disabled={!!editingTransaction && !canEdit}
              className={`p-3 h-auto rounded-lg transition-all ${
                transactionForm.type === "expense"
                  ? "border-2 border-black bg-red-600 text-black font-bold shadow-md opacity-100"
                  : "border-2 border-red-600 bg-red-100 text-gray-600 hover:bg-red-200"
              } ${!!editingTransaction && !canEdit ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              aria-pressed={transactionForm.type === "expense"}
              aria-label="Set transaction type to expense"
            >
              <div className="flex flex-col items-center">
                {React.createElement(getIcon("TrendingDown"), {
                  className: "h-5 w-5 mx-auto mb-1",
                })}
                <span className="text-sm font-semibold">Expense</span>
              </div>
            </Button>

            {/* Income Button */}
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setTransactionForm({
                  ...transactionForm,
                  type: "income",
                })
              }
              disabled={!!editingTransaction && !canEdit}
              className={`p-3 h-auto rounded-lg transition-all ${
                transactionForm.type === "income"
                  ? "border-2 border-black bg-green-600 text-black font-bold shadow-md opacity-100"
                  : "border-2 border-green-600 bg-green-100 text-gray-600 hover:bg-green-200"
              } ${!!editingTransaction && !canEdit ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              aria-pressed={transactionForm.type === "income"}
              aria-label="Set transaction type to income"
            >
              <div className="flex flex-col items-center">
                {React.createElement(getIcon("TrendingUp"), {
                  className: "h-5 w-5 mx-auto mb-1",
                })}
                <span className="text-sm font-semibold">Income</span>
              </div>
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {transactionForm.type === "expense"
              ? "Negative amount (money going out)"
              : "Positive amount (money coming in)"}
          </p>
        </div>
      </div>

      {/* Description */}
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

      {/* Amount and Category Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
          <TextInput
            type="number"
            step="0.01"
            value={transactionForm.amount}
            onChange={(e) =>
              setTransactionForm({
                ...transactionForm,
                amount: e.target.value,
              })
            }
            disabled={!!editingTransaction && !canEdit}
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <Select
            value={transactionForm.category}
            onChange={(e) =>
              setTransactionForm({
                ...transactionForm,
                category: e.target.value,
              })
            }
            disabled={!!editingTransaction && !canEdit}
            className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
              !!editingTransaction && !canEdit ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          >
            <option value="">Select category...</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
          {showSuggestion && (
            <div className="mt-2 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
              <div className="flex items-center text-sm text-emerald-700 font-medium">
                {React.createElement(getIcon("Sparkles"), {
                  className: "h-4 w-4 mr-2",
                })}
                Suggested: {smartSuggestion.category}
              </div>
              <Button
                type="button"
                onClick={() =>
                  setTransactionForm({
                    ...transactionForm,
                    category: smartSuggestion.category,
                  })
                }
                className="px-3 py-1 text-xs bg-emerald-600 text-white border-2 border-black rounded-lg hover:bg-emerald-700"
                disabled={!!editingTransaction && !canEdit}
              >
                Apply
              </Button>
            </div>
          )}
        </div>
      </div>
    </FormSection>
  );
};

export default BasicInfoSection;
