import React, { useEffect } from "react";
import { TRANSACTION_CATEGORIES } from "../../constants/categories";
import { globalToast } from "../../stores/ui/toastStore";
import {
  useTransactionSplitterUI,
  useTransactionSplitterLogic,
  useTransactionSplitterOperations,
} from "../../hooks/transactions/useTransactionSplitterUI";
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

const TransactionSplitter = ({
  transaction,
  isOpen = false,
  onClose,
  onSplitTransaction,
  envelopes = [],
  availableCategories = [],
  className = "", // eslint-disable-line no-unused-vars
}) => {
  // UI state management
  const { splitAllocations, setSplitAllocations, isProcessing, setIsProcessing, resetState } =
    useTransactionSplitterUI();

  // Business logic operations
  const {
    initializeSplits,
    addSplitAllocation,
    updateSplitAllocation,
    removeSplitAllocation,
    calculateSplitTotals,
    validateSplits,
    autoBalance,
    splitEvenly,
  } = useTransactionSplitterLogic(splitAllocations, setSplitAllocations, transaction, envelopes);

  // Transaction operations
  const { applySplitTransaction } = useTransactionSplitterOperations(
    splitAllocations,
    transaction,
    setIsProcessing,
    onSplitTransaction,
    onClose
  );

  // Initialize splits when modal opens
  useEffect(() => {
    if (isOpen && transaction) {
      initializeSplits();
    }
  }, [isOpen, transaction, initializeSplits]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen, resetState]);

  // Handle apply with validation and error display
  const handleApplySplit = async () => {
    const errors = validateSplits();
    if (errors.length > 0) {
      globalToast.showError(
        "Please fix the following errors:\n\n" + errors.join("\n"),
        "Validation Errors"
      );
      return;
    }

    const result = await applySplitTransaction();
    if (!result.success) {
      if (result.errors) {
        globalToast.showError(
          "Please fix the following errors:\n\n" + result.errors.join("\n"),
          "Validation Errors"
        );
      } else if (result.error) {
        globalToast.showError("Failed to split transaction. Please try again.", "Split Failed");
      }
    }
  };

  // Get all unique categories
  const allCategories = [
    ...new Set([
      ...availableCategories,
      ...envelopes.map((env) => env.name),
      ...envelopes.map((env) => env.category).filter(Boolean),
      ...TRANSACTION_CATEGORIES,
    ]),
  ].sort();

  if (!isOpen || !transaction) return null;

  const totals = calculateSplitTotals();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
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
                  Break down this transaction into multiple categories
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Original Transaction Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Original Transaction
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Description:</span>
                <p className="font-medium">{transaction.description}</p>
              </div>
              <div>
                <span className="text-gray-600">Amount:</span>
                <p className="font-medium text-lg">
                  {transaction.amount >= 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Category:</span>
                <p className="font-medium">{transaction.category || "Uncategorized"}</p>
              </div>
            </div>
          </div>

          {/* Split Controls */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <button
                onClick={addSplitAllocation}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Split
              </button>

              <button
                onClick={splitEvenly}
                disabled={splitAllocations.length <= 1}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Split Evenly
              </button>

              <button
                onClick={autoBalance}
                disabled={totals.isValid}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Auto Balance
              </button>
            </div>

            {/* Split Summary */}
            <div className="text-right">
              <div className="text-sm text-gray-600">Original: ${totals.original.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Allocated: ${totals.allocated.toFixed(2)}</div>
              <div
                className={`text-sm font-bold ${
                  totals.isValid
                    ? "text-green-600"
                    : totals.isOverAllocated
                      ? "text-red-600"
                      : "text-amber-600"
                }`}
              >
                {totals.isValid
                  ? "✓ Balanced"
                  : totals.isOverAllocated
                    ? `Over by $${Math.abs(totals.remaining).toFixed(2)}`
                    : `Under by $${totals.remaining.toFixed(2)}`}
              </div>
            </div>
          </div>

          {/* Split Allocations */}
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {splitAllocations.map((split, index) => (
              <div
                key={split.id}
                className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <input
                      type="text"
                      value={split.description}
                      onChange={(e) =>
                        updateSplitAllocation(split.id, "description", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="What is this split for?"
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Amount *</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={split.amount}
                        onChange={(e) =>
                          updateSplitAllocation(split.id, "amount", parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={split.category}
                      onChange={(e) => updateSplitAllocation(split.id, "category", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select category...</option>
                      {allCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Envelope */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Envelope</label>
                    <select
                      value={split.envelopeId}
                      onChange={(e) =>
                        updateSplitAllocation(split.id, "envelopeId", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">No envelope</option>
                      {envelopes.map((envelope) => (
                        <option key={envelope.id} value={envelope.id}>
                          {envelope.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Split metadata and actions */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>
                      Split {index + 1} of {splitAllocations.length}
                    </span>
                    {split.isOriginalItem && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        Original Item
                      </span>
                    )}
                    {split.envelopeId && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        → {envelopes.find((e) => e.id === split.envelopeId)?.name}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => removeSplitAllocation(split.id)}
                    disabled={splitAllocations.length <= 1}
                    className="p-1 text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                    title="Remove this split"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Validation Messages */}
          {!totals.isValid && (
            <div
              className={`mb-4 p-3 rounded-lg border ${
                totals.isOverAllocated ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
              }`}
            >
              <div className="flex items-center">
                <AlertCircle
                  className={`h-4 w-4 mr-2 ${
                    totals.isOverAllocated ? "text-red-600" : "text-amber-600"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    totals.isOverAllocated ? "text-red-800" : "text-amber-800"
                  }`}
                >
                  {totals.isOverAllocated
                    ? `Splits total $${Math.abs(totals.remaining).toFixed(2)} more than the original transaction`
                    : `You still need to allocate $${totals.remaining.toFixed(2)}`}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApplySplit}
              disabled={isProcessing || !totals.isValid || splitAllocations.length === 0}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating Splits...
                </>
              ) : (
                <>
                  <Scissors className="h-4 w-4 mr-2" />
                  Create {splitAllocations.length} Split Transaction
                  {splitAllocations.length !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionSplitter;
