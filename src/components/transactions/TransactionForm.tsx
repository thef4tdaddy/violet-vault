import { globalToast } from "../../stores/ui/toastStore";
import useEditLock from "../../hooks/common/useEditLock";
// eslint-disable-next-line no-restricted-imports -- TODO: Refactor to use useEditLock hook instead
import { initializeEditLocks } from "../../services/editLockService";
import { useAuthManager } from "../../hooks/auth/useAuthManager";
import EditLockIndicator from "../ui/EditLockIndicator";
import TransactionModalHeader from "./TransactionModalHeader";
import TransactionFormFields from "./TransactionFormFields";

const TransactionForm = ({
  isOpen,
  onClose,
  editingTransaction,
  transactionForm,
  setTransactionForm,
  envelopes = [],
  categories = [],
  onSubmit,
  suggestEnvelope,
  onPayBill, // Optional callback for handling bill payments
}) => {
  // Get auth context for edit locking
  const {
    securityContext: { budgetId },
    user: currentUser,
  } = useAuthManager();

  // Initialize edit lock service when modal opens
  useEffect(() => {
    if (isOpen && budgetId && currentUser) {
      initializeEditLocks(budgetId, currentUser);
    }
  }, [isOpen, budgetId, currentUser]);

  // Edit locking for the transaction (only when editing existing transaction)
  const editLock = useEditLock("transaction", editingTransaction?.id, {
    autoAcquire: isOpen && editingTransaction?.id, // Only auto-acquire for edits
    autoRelease: true,
    showToasts: true,
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!transactionForm.description.trim() || !transactionForm.amount) {
      globalToast.showError("Please fill in description and amount", "Required Fields", 8000);
      return;
    }

    // Handle bill payment if transaction is assigned to a bill envelope
    if (transactionForm.envelopeId && onPayBill) {
      const selectedEnvelope = envelopes.find((env) => env.id === transactionForm.envelopeId);
      if (selectedEnvelope && selectedEnvelope.envelopeType === "bill") {
        const billPayment = {
          billId: selectedEnvelope.id,
          amount: Math.abs(parseFloat(transactionForm.amount)),
          paidDate: transactionForm.date,
          transactionId: Date.now(), // Will be updated after transaction creation
          notes: `Payment for ${selectedEnvelope.name} - ${transactionForm.description}`,
        };
        onPayBill(billPayment);
      }
    }

    onSubmit();
  };

  const handleClose = () => {
    // Release lock when closing
    if (editLock.isOwnLock) {
      editLock.releaseLock();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <TransactionModalHeader editingTransaction={editingTransaction} onClose={handleClose} />

        {/* Standardized Edit Lock Indicator */}
        {editingTransaction && (editLock.isLocked || editLock.isLoading) && (
          <div className="mb-6">
            <EditLockIndicator
              isLocked={editLock.isLocked && !editLock.canEdit}
              isOwnLock={editLock.isOwnLock}
              isLoading={editLock.isLoading}
              lock={{
                userName: editLock.lockedBy,
                expiresAt: new Date(Date.now() + (editLock.timeRemaining || 0)),
                isExpired: editLock.isExpired,
              }}
              onBreakLock={editLock.breakLock}
              showDetails={true}
            />
          </div>
        )}

        <TransactionFormFields
          transactionForm={transactionForm}
          setTransactionForm={setTransactionForm}
          handleFormSubmit={handleSubmit}
          onClose={handleClose}
          canEdit={editLock.canEdit}
          editingTransaction={editingTransaction}
          lockedBy={editLock.lockedBy}
          envelopes={envelopes}
          categories={categories}
          suggestEnvelope={suggestEnvelope}
        />
      </div>
    </div>
  );
};

export default TransactionForm;
