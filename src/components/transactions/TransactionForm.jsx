import React, { useEffect } from "react";
import {
  X,
  TrendingDown,
  TrendingUp,
  Zap,
  Lock,
  Unlock,
  User,
  Clock,
} from "lucide-react";
import useEditLock from "../../hooks/useEditLock";
import { initializeEditLocks } from "../../services/editLockService";
import { useAuth } from "../../stores/authStore";
import logger from "../../utils/logger";

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
  const { budgetId, currentUser } = useAuth();

  // Initialize edit lock service when modal opens
  useEffect(() => {
    if (isOpen && budgetId && currentUser) {
      initializeEditLocks(budgetId, currentUser);
    }
  }, [isOpen, budgetId, currentUser]);

  // Edit locking for the transaction (only when editing existing transaction)
  const {
    isLocked,
    isOwnLock,
    canEdit,
    lockedBy,
    timeRemaining,
    isExpired,
    releaseLock,
    breakLock,
    isLoading: lockLoading,
  } = useEditLock("transaction", editingTransaction?.id, {
    autoAcquire: isOpen && editingTransaction?.id, // Only auto-acquire for edits
    autoRelease: true,
    showToasts: true,
  });

  if (!isOpen) return null;

  // Removed excessive debug logging that was spamming console (issue #463)

  const handleSubmit = (e) => {
    e.preventDefault();

    logger.debug("TransactionForm submit attempted", {
      editingTransaction: !!editingTransaction,
      formData: {
        description: transactionForm.description?.slice(0, 50) + "...",
        amount: transactionForm.amount,
        envelopeId: transactionForm.envelopeId,
        category: transactionForm.category,
        type: transactionForm.type,
        date: transactionForm.date,
      },
    });

    if (!transactionForm.description.trim() || !transactionForm.amount) {
      logger.warn("Transaction form validation failed", {
        hasDescription: !!transactionForm.description.trim(),
        hasAmount: !!transactionForm.amount,
        description: transactionForm.description,
        amount: transactionForm.amount,
      });
      alert("Please fill in description and amount");
      return;
    }

    // Handle bill payment if transaction is assigned to a bill envelope
    if (transactionForm.envelopeId && onPayBill) {
      const selectedEnvelope = envelopes.find(
        (env) => env.id === transactionForm.envelopeId,
      );
      if (selectedEnvelope && selectedEnvelope.envelopeType === "bill") {
        logger.info("Creating bill payment from transaction", {
          billId: selectedEnvelope.id,
          billName: selectedEnvelope.name,
          amount: Math.abs(parseFloat(transactionForm.amount)),
          paidDate: transactionForm.date,
        });

        // Create a bill payment record
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

    logger.info(
      `Transaction ${editingTransaction ? "updated" : "created"} successfully`,
      {
        transactionId: editingTransaction?.id,
        amount: transactionForm.amount,
        envelopeId: transactionForm.envelopeId,
      },
    );

    onSubmit();
  };

  const resetAndClose = () => {
    logger.debug("TransactionForm closed", {
      wasEditing: !!editingTransaction,
      hadData: !!(transactionForm.description || transactionForm.amount),
    });
    // Release lock when closing
    if (isOwnLock) {
      releaseLock();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glassmorphism rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/30 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3 flex-1">
            <h3 className="text-xl font-semibold">
              {editingTransaction ? "Edit Transaction" : "Add New Transaction"}
            </h3>
            {/* Edit Lock Status for existing transactions */}
            {editingTransaction && isLocked && (
              <div
                className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  isOwnLock
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                {isOwnLock ? (
                  <>
                    <Unlock className="h-3 w-3 mr-1" />
                    You're Editing
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3 mr-1" />
                    <User className="h-3 w-3 mr-1" />
                    {lockedBy}
                  </>
                )}
              </div>
            )}
            {editingTransaction && lockLoading && (
              <div className="bg-yellow-100 text-yellow-800 border border-yellow-200 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border border-yellow-600 border-t-transparent mr-1" />
                Acquiring Lock...
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Lock Controls for expired locks */}
            {editingTransaction && isLocked && !isOwnLock && isExpired && (
              <button
                onClick={breakLock}
                className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center"
              >
                <Unlock className="h-3 w-3 mr-1" />
                Break Lock
              </button>
            )}
            <button
              onClick={resetAndClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Lock Warning Banner for existing transactions */}
        {editingTransaction && isLocked && !canEdit && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex items-center">
              <Lock className="h-5 w-5 text-red-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Currently Being Edited
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {lockedBy} is currently editing this transaction.
                  {isExpired
                    ? "The lock has expired and can be broken."
                    : `Lock expires in ${Math.ceil(timeRemaining / 1000)} seconds.`}
                </p>
                {isExpired && (
                  <button
                    onClick={breakLock}
                    className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                  >
                    Break Lock & Take Control
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
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
                className={`glassmorphism w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                  editingTransaction && !canEdit
                    ? "bg-gray-100 cursor-not-allowed"
                    : ""
                }`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
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
                  <TrendingDown className="h-4 w-4 mx-auto mb-1" />
                  <span className="text-sm">Expense</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTransactionForm({
                      ...transactionForm,
                      type: "income",
                    })
                  }
                  className={`p-2 rounded-lg border-2 transition-all ${
                    transactionForm.type === "income"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <TrendingUp className="h-4 w-4 mx-auto mb-1" />
                  <span className="text-sm">Income</span>
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <input
              type="text"
              value={transactionForm.description}
              onChange={(e) =>
                setTransactionForm({
                  ...transactionForm,
                  description: e.target.value,
                })
              }
              className="glassmorphism w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g., Grocery shopping at Walmart"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                value={transactionForm.amount}
                onChange={(e) =>
                  setTransactionForm({
                    ...transactionForm,
                    amount: e.target.value,
                  })
                }
                className="glassmorphism w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={transactionForm.category}
                onChange={(e) =>
                  setTransactionForm({
                    ...transactionForm,
                    category: e.target.value,
                  })
                }
                className="glassmorphism w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select category...</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign to Envelope
            </label>
            <select
              value={transactionForm.envelopeId}
              onChange={(e) =>
                setTransactionForm({
                  ...transactionForm,
                  envelopeId: e.target.value,
                })
              }
              className="glassmorphism w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500"
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
            </select>
            {transactionForm.envelopeId &&
              (() => {
                const selectedEnvelope = envelopes.find(
                  (env) => env.id === transactionForm.envelopeId,
                );
                return selectedEnvelope &&
                  selectedEnvelope.envelopeType === "bill" ? (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Bill Payment:</strong> Assigning this
                      transaction to "{selectedEnvelope.name}" will
                      automatically mark it as a bill payment and deduct from
                      the envelope balance.
                    </p>
                  </div>
                ) : null;
              })()}
            {transactionForm.description && suggestEnvelope && (
              <div className="mt-2">
                {(() => {
                  const suggested = suggestEnvelope(
                    transactionForm.description,
                  );
                  return suggested ? (
                    <button
                      type="button"
                      onClick={() =>
                        setTransactionForm({
                          ...transactionForm,
                          envelopeId: suggested.id,
                        })
                      }
                      className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Suggested: {suggested.name}
                    </button>
                  ) : null;
                })()}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={transactionForm.notes}
              onChange={(e) =>
                setTransactionForm({
                  ...transactionForm,
                  notes: e.target.value,
                })
              }
              rows={3}
              className="glassmorphism w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="Additional notes about this transaction..."
            />
          </div>

          <div className="flex items-center justify-start">
            <input
              type="checkbox"
              id="reconciled"
              checked={transactionForm.reconciled}
              onChange={(e) =>
                setTransactionForm({
                  ...transactionForm,
                  reconciled: e.target.checked,
                })
              }
              className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="reconciled" className="ml-3 text-sm text-gray-700">
              Mark as reconciled
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              type="button"
              onClick={resetAndClose}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editingTransaction && !canEdit}
              className={`flex-1 btn btn-primary flex items-center justify-center ${
                editingTransaction && !canEdit
                  ? "bg-gray-400 cursor-not-allowed"
                  : ""
              }`}
            >
              {editingTransaction && !canEdit ? (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Locked by {lockedBy}
                </>
              ) : editingTransaction ? (
                "Update Transaction"
              ) : (
                "Add Transaction"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
