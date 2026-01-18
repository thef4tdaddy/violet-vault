import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";
import type { TransactionFormData } from "@/domain/schemas/transaction";
import type { Transaction } from "@/types/finance";

interface DateTypeRowProps {
  transactionForm: TransactionFormData;
  setTransactionForm: (form: TransactionFormData) => void;
  canEdit: boolean;
  editingTransaction?: Transaction | null;
}

export const DateTypeRow: React.FC<DateTypeRowProps> = ({
  transactionForm,
  setTransactionForm,
  canEdit,
  editingTransaction,
}) => (
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
              ? "border-2 border-black bg-red-600 text-white font-bold shadow-md opacity-100"
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
              ? "border-2 border-black bg-green-600 text-white font-bold shadow-md opacity-100"
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
);
