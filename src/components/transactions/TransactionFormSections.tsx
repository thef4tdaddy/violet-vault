import React from "react";
import { Select, TextInput, Textarea, Checkbox, Button } from "@/components/ui";
import { getIcon } from "@/utils";
import ReceiptButton from "../receipts/ReceiptButton";
import logger from "../../utils/common/logger";
import type { Transaction } from "@/types/finance";
import type { TransactionFormData } from "@/domain/schemas/transaction";

interface TransactionBasicFieldsProps {
  transactionForm: TransactionFormData;
  setTransactionForm: (form: TransactionFormData) => void;
  canEdit: boolean;
  editingTransaction?: Transaction | null;
}

/**
 * Date and Type selector for TransactionFormFields
 * Extracted to reduce complexity
 */
export const TransactionBasicFields = ({
  transactionForm,
  setTransactionForm,
  canEdit,
  editingTransaction,
}: TransactionBasicFieldsProps) => {
  return (
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
          disabled={editingTransaction && !canEdit}
          className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
            editingTransaction && !canEdit ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            onClick={() =>
              setTransactionForm({
                ...transactionForm,
                type: "expense",
              })
            }
            disabled={editingTransaction && !canEdit}
            className={`p-2 rounded-lg border-2 transition-all ${
              transactionForm.type === "expense"
                ? "border-red-500 bg-red-50 text-red-700"
                : "border-gray-200 hover:border-red-300"
            } ${editingTransaction && !canEdit ? "bg-gray-100 cursor-not-allowed" : ""}`}
          >
            {React.createElement(getIcon("TrendingDown"), {
              className: "h-4 w-4 mx-auto mb-1",
            })}
            <span className="text-sm">Expense</span>
          </Button>
          <Button
            type="button"
            onClick={() =>
              setTransactionForm({
                ...transactionForm,
                type: "income",
              })
            }
            disabled={editingTransaction && !canEdit}
            className={`p-2 rounded-lg border-2 transition-all ${
              transactionForm.type === "income"
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-gray-200 hover:border-emerald-300"
            } ${editingTransaction && !canEdit ? "bg-gray-100 cursor-not-allowed" : ""}`}
          >
            {React.createElement(getIcon("TrendingUp"), {
              className: "h-4 w-4 mx-auto mb-1",
            })}
            <span className="text-sm">Income</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

interface TransactionDetailsFieldsProps {
  transactionForm: TransactionFormData;
  setTransactionForm: (form: TransactionFormData) => void;
  canEdit: boolean;
  editingTransaction?: Transaction | null;
  categories: string[];
}

/**
 * Description, Amount, and Category fields for TransactionFormFields
 * Extracted to reduce complexity
 */
export const TransactionDetailsFields = ({
  transactionForm,
  setTransactionForm,
  canEdit,
  editingTransaction,
  categories,
}: TransactionDetailsFieldsProps) => {
  return (
    <>
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
          disabled={editingTransaction && !canEdit}
          placeholder="e.g., Grocery shopping at Walmart"
          required
        />
      </div>

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
            disabled={editingTransaction && !canEdit}
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
            disabled={editingTransaction && !canEdit}
            className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
              editingTransaction && !canEdit ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          >
            <option value="">Select category...</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </>
  );
};

interface Envelope {
  id: string;
  name: string;
  envelopeType?: string;
}

interface TransactionEnvelopeSelectorProps {
  transactionForm: TransactionFormData;
  setTransactionForm: (form: TransactionFormData) => void;
  canEdit: boolean;
  editingTransaction?: Transaction | null;
  envelopes: Envelope[];
  suggestEnvelope?: (description: string) => { id: string; name: string } | null;
}

/**
 * Envelope selector with bill payment info and suggestions
 * Extracted to reduce complexity
 */
export const TransactionEnvelopeSelector = ({
  transactionForm,
  setTransactionForm,
  canEdit,
  editingTransaction,
  envelopes,
  suggestEnvelope,
}: TransactionEnvelopeSelectorProps) => {
  const selectedEnvelope = envelopes.find((env) => env.id === transactionForm.envelopeId);
  const isBillEnvelope = selectedEnvelope && selectedEnvelope.envelopeType === "bill";
  const suggested =
    transactionForm.description && suggestEnvelope
      ? suggestEnvelope(transactionForm.description)
      : null;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Envelope</label>
      <Select
        value={transactionForm.envelopeId}
        onChange={(e) =>
          setTransactionForm({
            ...transactionForm,
            envelopeId: e.target.value,
          })
        }
        disabled={editingTransaction && !canEdit}
        className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
          editingTransaction && !canEdit ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      >
        <option value="">Leave unassigned</option>
        {envelopes.map((envelope) => (
          <option key={envelope.id} value={envelope.id}>
            {envelope.name}
            {envelope.envelopeType === "bill" ? " 📝 (Bill)" : ""}
            {envelope.envelopeType === "variable" ? " 🔄 (Variable)" : ""}
            {envelope.envelopeType === "savings" ? " 💰 (Savings)" : ""}
          </option>
        ))}
      </Select>
      {transactionForm.envelopeId && isBillEnvelope && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Bill Payment:</strong> Assigning this transaction to "{selectedEnvelope.name}
            " will automatically mark it as a bill payment and deduct from the envelope balance.
          </p>
        </div>
      )}
      {suggested && (
        <div className="mt-2">
          <Button
            type="button"
            onClick={() =>
              setTransactionForm({
                ...transactionForm,
                envelopeId: suggested.id,
              })
            }
            className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center"
          >
            {React.createElement(getIcon("Zap"), {
              className: "h-3 w-3 mr-1",
            })}
            Suggested: {suggested.name}
          </Button>
        </div>
      )}
    </div>
  );
};

interface TransactionNotesAndReconciledProps {
  transactionForm: TransactionFormData;
  setTransactionForm: (form: TransactionFormData) => void;
  canEdit: boolean;
  editingTransaction?: Transaction | null;
}

/**
 * Notes textarea and reconciled checkbox
 * Extracted to reduce complexity
 */
export const TransactionNotesAndReconciled = ({
  transactionForm,
  setTransactionForm,
  canEdit,
  editingTransaction,
}: TransactionNotesAndReconciledProps) => {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
        <Textarea
          value={transactionForm.notes}
          onChange={(e) =>
            setTransactionForm({
              ...transactionForm,
              notes: e.target.value,
            })
          }
          rows={3}
          disabled={editingTransaction && !canEdit}
          placeholder="Additional notes about this transaction..."
        />
      </div>

      <div className="flex items-center justify-start">
        <Checkbox
          id="reconciled"
          checked={transactionForm.reconciled}
          onChange={(e) =>
            setTransactionForm({
              ...transactionForm,
              reconciled: e.target.checked,
            })
          }
          disabled={editingTransaction && !canEdit}
        />
        <label htmlFor="reconciled" className="ml-3 text-sm text-gray-700">
          Mark as reconciled
        </label>
      </div>
    </>
  );
};

interface TransactionReceiptSectionProps {
  editingTransaction?: Transaction | null;
  onClose: () => void;
}

/**
 * Receipt scanner section for new transactions
 * Extracted to reduce complexity
 */
export const TransactionReceiptSection = ({
  editingTransaction,
  onClose,
}: TransactionReceiptSectionProps) => {
  if (editingTransaction) return null;

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-purple-900 mb-1">Have a receipt?</p>
          <p className="text-sm text-purple-700">
            Scan a receipt to automatically fill in transaction details
          </p>
        </div>
        <ReceiptButton
          variant="secondary"
          onTransactionCreated={(transaction) => {
            logger.info("Transaction created from receipt in form", transaction);
            onClose();
          }}
        />
      </div>
    </div>
  );
};

interface TransactionFormActionsProps {
  editingTransaction?: Transaction | null;
  canEdit: boolean;
  lockedBy?: string;
  onClose: () => void;
}

/**
 * Form action buttons for TransactionFormFields
 * Extracted to reduce complexity
 */
export const TransactionFormActions = ({
  editingTransaction,
  canEdit,
  lockedBy,
  onClose,
}: TransactionFormActionsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-6">
      <Button
        type="button"
        onClick={onClose}
        className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={editingTransaction && !canEdit}
        className={`flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center ${
          editingTransaction && !canEdit ? "cursor-not-allowed" : ""
        }`}
      >
        {editingTransaction && !canEdit ? (
          <>
            {React.createElement(getIcon("Lock"), {
              className: "h-4 w-4 mr-2",
            })}
            Locked by {lockedBy}
          </>
        ) : editingTransaction ? (
          "Update Transaction"
        ) : (
          "Add Transaction"
        )}
      </Button>
    </div>
  );
};
