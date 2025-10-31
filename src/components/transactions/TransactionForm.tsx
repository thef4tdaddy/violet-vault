import React, { useEffect, useMemo } from "react";
import { globalToast } from "@/stores/ui/toastStore";
import useEditLock from "@/hooks/common/useEditLock";
import { initializeEditLocks } from "@/services/editLockService";
import { useAuthManager } from "@/hooks/auth/useAuthManager";
import EditLockIndicator from "../ui/EditLockIndicator";
import TransactionModalHeader from "./TransactionModalHeader";
import TransactionFormFields from "./TransactionFormFields";
import type { Transaction } from "@/types/finance";
import type { TransactionFormData } from "@/domain/schemas/transaction";

// Local Envelope interface with minimal required properties
interface Envelope {
  id: string | number;
  name: string;
  envelopeType?: string;
}

interface BillPayment {
  billId: string | number;
  amount: number;
  paidDate: string;
  transactionId: number;
  notes: string;
}

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction?: Transaction | null;
  transactionForm: TransactionFormData;
  setTransactionForm: (data: TransactionFormData) => void;
  envelopes?: Envelope[];
  categories?: string[];
  onSubmit: () => void;
  suggestEnvelope?: (description: string) => { id: string; name: string } | null;
  onPayBill?: (billPayment: BillPayment) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
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
  const editLock = useEditLock("transaction", editingTransaction?.id?.toString() || "", {
    autoAcquire: isOpen && !!editingTransaction?.id, // Only auto-acquire for edits
    autoRelease: true,
    showToasts: true,
  });

  // Memoize lock data to avoid calling Date.now() during render
  const lockData = useMemo(
    () => ({
      userName: editLock.lockedBy,
      expiresAt: new Date(Date.now() + (editLock.timeRemaining || 0)),
      isExpired: editLock.isExpired,
    }),
    [editLock.lockedBy, editLock.timeRemaining, editLock.isExpired]
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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

  const handleClose = async () => {
    // Release lock when closing
    if (editLock.isOwnLock) {
      await editLock.releaseLock();
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
              lock={lockData}
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
          envelopes={envelopes as never}
          categories={categories}
          suggestEnvelope={suggestEnvelope}
        />
      </div>
    </div>
  );
};

export default TransactionForm;
