import React from "react";
import {
  TransactionBasicFields,
  TransactionDetailsFields,
  TransactionEnvelopeSelector,
  TransactionNotesAndReconciled,
  TransactionReceiptSection,
  TransactionFormActions,
} from "./TransactionFormSections";
import type { Transaction, Envelope } from "@/types/finance";
import type { TransactionFormData } from "@/domain/schemas/transaction";

interface TransactionFormFieldsProps {
  transactionForm: TransactionFormData;
  setTransactionForm: (form: TransactionFormData) => void;
  handleFormSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  canEdit: boolean;
  editingTransaction?: Transaction | null;
  lockedBy?: string;
  envelopes?: Envelope[];
  categories?: string[];
  suggestEnvelope?: (description: string) => { id: string; name: string } | null;
}

/**
 * Form fields section for TransactionForm
 * Pure UI component that preserves exact visual appearance
 * Refactored to reduce complexity by extracting sub-components
 */
const TransactionFormFields: React.FC<TransactionFormFieldsProps> = ({
  transactionForm,
  setTransactionForm,
  handleFormSubmit,
  onClose,
  canEdit,
  editingTransaction,
  lockedBy,
  envelopes = [],
  categories = [],
  suggestEnvelope,
}) => {
  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      {/* Date and Type */}
      <TransactionBasicFields
        transactionForm={transactionForm}
        setTransactionForm={setTransactionForm}
        canEdit={canEdit}
        editingTransaction={editingTransaction}
      />

      {/* Description, Amount, Category */}
      <TransactionDetailsFields
        transactionForm={transactionForm}
        setTransactionForm={setTransactionForm}
        canEdit={canEdit}
        editingTransaction={editingTransaction}
        categories={categories}
      />

      {/* Envelope Assignment */}
      <TransactionEnvelopeSelector
        transactionForm={transactionForm}
        setTransactionForm={setTransactionForm}
        canEdit={canEdit}
        editingTransaction={editingTransaction}
        envelopes={envelopes}
        suggestEnvelope={suggestEnvelope}
      />

      {/* Notes and Reconciled */}
      <TransactionNotesAndReconciled
        transactionForm={transactionForm}
        setTransactionForm={setTransactionForm}
        canEdit={canEdit}
        editingTransaction={editingTransaction}
      />

      {/* Receipt Scanner */}
      <TransactionReceiptSection editingTransaction={editingTransaction} onClose={onClose} />

      {/* Action Buttons */}
      <TransactionFormActions
        editingTransaction={editingTransaction}
        canEdit={canEdit}
        lockedBy={lockedBy}
        onClose={onClose}
      />
    </form>
  );
};

export default TransactionFormFields;
