import React from "react";
import { getIcon } from "../../utils";

const ReconcileTransactionModal = ({
  isOpen,
  onClose,
  newTransaction,
  onUpdateTransaction,
  onReconcile,
  getEnvelopeOptions = () => [],
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glassmorphism rounded-2xl p-6 w-full max-w-md border border-white/30 shadow-2xl">
        <h3 className="font-black text-black text-base mb-4">
          <span className="text-lg">R</span>ECONCILE <span className="text-lg">T</span>RANSACTION
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onUpdateTransaction({ type: "expense" })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  newTransaction.type === "expense"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 hover:border-red-300"
                }`}
              >
                {React.createElement(getIcon("Minus"), {
                  className: "h-5 w-5 mx-auto mb-1",
                })}
                <span className="text-sm">Expense</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateTransaction({ type: "income" })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  newTransaction.type === "income"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-green-300"
                }`}
              >
                {React.createElement(getIcon("Plus"), {
                  className: "h-5 w-5 mx-auto mb-1",
                })}
                <span className="text-sm">Income</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input
              type="number"
              step="0.01"
              value={newTransaction.amount}
              onChange={(e) => onUpdateTransaction({ amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <input
              type="text"
              value={newTransaction.description}
              onChange={(e) => onUpdateTransaction({ description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="What was this transaction for?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign to Envelope
            </label>
            <select
              value={newTransaction.envelopeId}
              onChange={(e) => onUpdateTransaction({ envelopeId: e.target.value })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select envelope...</option>
              {getEnvelopeOptions().map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={newTransaction.date}
              onChange={(e) => onUpdateTransaction({ date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onReconcile}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Reconcile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReconcileTransactionModal;
