import React from "react";
import { X, TrendingDown, TrendingUp, Zap } from "lucide-react";

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
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!transactionForm.description.trim() || !transactionForm.amount) {
      alert("Please fill in description and amount");
      return;
    }
    onSubmit();
  };

  const resetAndClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glassmorphism rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/30 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">
            {editingTransaction ? "Edit Transaction" : "Add New Transaction"}
          </h3>
          <button
            onClick={resetAndClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

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
                className="glassmorphism w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500"
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
                  className={`p-2 rounded-lg border-2 transition-all ${
                    transactionForm.type === "expense"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 hover:border-red-300"
                  }`}
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
                </option>
              ))}
            </select>
            {transactionForm.description && suggestEnvelope && (
              <div className="mt-2">
                {(() => {
                  const suggested = suggestEnvelope(transactionForm.description);
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

          <div className="flex items-center">
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
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            <label
              htmlFor="reconciled"
              className="ml-2 block text-sm text-gray-900"
            >
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
              className="flex-1 btn btn-primary"
            >
              {editingTransaction ? "Update Transaction" : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;