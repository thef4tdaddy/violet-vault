import React from "react";
import { getIcon } from "../../utils";

/**
 * Header section for TransactionForm
 * Pure UI component that preserves exact visual appearance
 */
const TransactionModalHeader = ({ editingTransaction, onClose }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-3 flex-1">
        <div className="p-2 bg-emerald-100 rounded-xl">
          {React.createElement(
            getIcon(editingTransaction ? "TrendingDown" : "TrendingUp"),
            {
              className: "h-6 w-6 text-emerald-600",
            },
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {editingTransaction ? "Edit Transaction" : "Add New Transaction"}
          </h2>
          <p className="text-sm text-gray-600">
            {editingTransaction
              ? "Update transaction details"
              : "Create a new financial transaction"}
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
      >
        {React.createElement(getIcon("X"), {
          className: "h-5 w-5 text-gray-500",
        })}
      </button>
    </div>
  );
};

export default TransactionModalHeader;
