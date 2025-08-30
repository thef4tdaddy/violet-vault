/**
 * Transaction Splitter V2 - UI Only Component
 * Pure UI component for transaction splitting interface
 * Created for Issue #508 - Logic extracted to useTransactionSplitter hook
 */
import React from "react";
import {
  Zap,
  Plus,
  X,
  DollarSign,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Tag,
  Target,
  Scissors,
  ArrowRight,
  Calculator,
} from "lucide-react";
import useTransactionSplitter from "../../hooks/transactions/useTransactionSplitter.js";
import { TRANSACTION_CATEGORIES } from "../../constants/categories";
import { globalToast } from "../../stores/ui/toastStore";

/**
 * Split allocation row component
 */
const SplitAllocationRow = ({
  split,
  index,
  canRemove,
  onUpdate,
  onRemove,
  availableCategories,
  envelopes,
}) => {
  return (
    <div className="grid grid-cols-12 gap-3 items-center py-3 px-4 bg-gray-50 rounded-lg">
      {/* Description */}
      <div className="col-span-4">
        <input
          type="text"
          value={split.description}
          onChange={(e) => onUpdate(split.id, "description", e.target.value)}
          placeholder="Description..."
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Amount */}
      <div className="col-span-2">
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="number"
            step="0.01"
            min="0"
            value={split.amount}
            onChange={(e) => onUpdate(split.id, "amount", parseFloat(e.target.value) || 0)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Category */}
      <div className="col-span-3">
        <select
          value={split.category}
          onChange={(e) => onUpdate(split.id, "category", e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select category...</option>
          {availableCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Envelope */}
      <div className="col-span-2">
        <select
          value={split.envelopeId}
          onChange={(e) => onUpdate(split.id, "envelopeId", e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">No envelope</option>
          {envelopes.map((env) => (
            <option key={env.id} value={env.id}>
              {env.name}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="col-span-1 flex justify-end">
        {canRemove && (
          <button
            onClick={() => onRemove(split.id)}
            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
            title="Remove split"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Split totals display component
 */
const SplitTotals = ({ totals }) => {
  const { original, allocated, remaining, isValid, isOverAllocated, isUnderAllocated } = totals;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
        <Calculator className="h-4 w-4 mr-2" />
        Split Summary
      </h4>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Original Amount:</span>
          <span className="font-medium">${original.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Total Allocated:</span>
          <span className={`font-medium ${isOverAllocated ? "text-red-600" : ""}`}>
            ${allocated.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between border-t pt-2">
          <span className="text-gray-600">Remaining:</span>
          <span
            className={`font-medium ${
              isValid ? "text-green-600" : isOverAllocated ? "text-red-600" : "text-orange-600"
            }`}
          >
            ${remaining.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center mt-2 pt-2 border-t">
          {isValid ? (
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
          ) : (
            <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
          )}
          <span className={`text-xs ${isValid ? "text-green-600" : "text-orange-600"}`}>
            {isValid ? "Perfect balance!" : isOverAllocated ? "Over-allocated" : "Under-allocated"}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Main TransactionSplitter component
 */
const TransactionSplitterV2 = ({
  transaction,
  isOpen = false,
  onClose,
  onSplitTransaction,
  envelopes = [],
  availableCategories = [],
  className = "",
}) => {
  // Use the transaction splitter hook for all logic
  const splitter = useTransactionSplitter({
    transaction,
    envelopes,
    onSplit: onSplitTransaction,
  });

  // Handle successful split
  const handleSubmit = async () => {
    try {
      const success = await splitter.submitSplit();

      if (success) {
        globalToast.showSuccess(
          `Transaction split into ${splitter.splitAllocations.length} parts successfully!`,
          "Split Complete"
        );
        onClose?.();
      }
    } catch (error) {
      globalToast.showError("Failed to split transaction: " + error.message, "Split Failed");
    }
  };

  // Handle close with confirmation if unsaved changes
  const handleClose = () => {
    if (splitter.hasUnsavedChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to close?")) {
        onClose?.();
      }
    } else {
      onClose?.();
    }
  };

  // Get categories for dropdown
  const categoryOptions =
    availableCategories.length > 0
      ? availableCategories
      : Object.values(TRANSACTION_CATEGORIES).flat();

  if (!isOpen || !transaction) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ${className}`}
    >
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white/20 p-2 rounded-xl mr-3">
                  <Scissors className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Split Transaction</h2>
                  <p className="text-blue-100 text-sm">
                    {transaction.description} • ${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Split Allocations */}
              <div className="xl:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Tag className="h-4 w-4 mr-2" />
                    Split Allocations ({splitter.splitAllocations.length})
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={splitter.distributeEvenly}
                      className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center"
                      title="Split evenly across all allocations"
                    >
                      <Target className="h-4 w-4 mr-1" />
                      Split Even
                    </button>
                    <button
                      onClick={splitter.autoBalance}
                      className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
                      title="Auto-balance to match total"
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      Auto Balance
                    </button>
                    <button
                      onClick={splitter.addSplit}
                      className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Split
                    </button>
                  </div>
                </div>

                {/* Column Headers */}
                <div className="grid grid-cols-12 gap-3 items-center py-2 px-4 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 mb-2">
                  <div className="col-span-4">Description</div>
                  <div className="col-span-2">Amount</div>
                  <div className="col-span-3">Category</div>
                  <div className="col-span-2">Envelope</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Split Rows */}
                <div className="space-y-2 mb-4">
                  {splitter.splitAllocations.map((split, index) => (
                    <SplitAllocationRow
                      key={split.id}
                      split={split}
                      index={index}
                      canRemove={splitter.splitAllocations.length > 1}
                      onUpdate={splitter.updateSplit}
                      onRemove={splitter.removeSplit}
                      availableCategories={categoryOptions}
                      envelopes={envelopes}
                    />
                  ))}
                </div>

                {/* Error Messages */}
                {splitter.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-red-800 mb-1">Validation Errors</h4>
                        <ul className="text-sm text-red-700 space-y-1">
                          {splitter.errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Sidebar - Totals and Actions */}
              <div className="space-y-4">
                <SplitTotals totals={splitter.totals} />

                {/* Quick Actions */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Quick Actions
                  </h4>
                  <div className="space-y-2">
                    <button
                      onClick={splitter.resetSplits}
                      className="w-full px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset to Original
                    </button>
                  </div>
                </div>

                {/* Transaction Info */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Original Transaction</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Description:</span>
                      <p className="font-medium mt-1">{transaction.description}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <p className="font-medium">${Math.abs(transaction.amount).toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <p className="font-medium">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                    {transaction.category && (
                      <div>
                        <span className="text-gray-600">Category:</span>
                        <p className="font-medium">{transaction.category}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {splitter.hasValidSplits ? (
                  <span className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Ready to split
                  </span>
                ) : (
                  <span className="flex items-center text-orange-600">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Please fix errors before splitting
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!splitter.canSubmit}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {splitter.isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Split Transaction
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionSplitterV2;
