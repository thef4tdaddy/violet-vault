import {
  TransactionBasicFields,
  TransactionDetailsFields,
  TransactionEnvelopeSelector,
  TransactionNotesAndReconciled,
  TransactionReceiptSection,
  TransactionFormActions,
} from "./TransactionFormSections";

/**
 * Form fields section for TransactionForm
 * Pure UI component that preserves exact visual appearance
 * Refactored to reduce complexity by extracting sub-components
 */
const TransactionFormFields = ({
  // Form data and handlers
  transactionForm,
  setTransactionForm,

  // Form submission
  handleFormSubmit,
  onClose,

  // UI state
  canEdit,
  editingTransaction,
  lockedBy,

  // Data
  envelopes,
  categories,

  // Optional features
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
