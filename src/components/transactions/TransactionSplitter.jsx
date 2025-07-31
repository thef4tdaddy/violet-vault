import React, { useState, useEffect, useCallback } from "react";
import { TRANSACTION_CATEGORIES } from "../../constants/categories";
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
  const [splitAllocations, setSplitAllocations] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize split allocations when modal opens
  useEffect(() => {
    if (isOpen && transaction) {
      initializeSplits();
    }
  }, [isOpen, transaction, initializeSplits]);

  const initializeSplits = useCallback(() => {
    // Check if transaction has itemized metadata (like Amazon orders)
    if (transaction.metadata?.items && transaction.metadata.items.length > 1) {
      // Initialize with individual items
      const itemSplits = transaction.metadata.items.map((item, index) => ({
        id: Date.now() + index,
        description: item.name || `Item ${index + 1}`,
        amount: Math.abs(item.totalPrice || item.price || 0),
        category: item.category?.name || transaction.category || "",
        envelopeId:
          findEnvelopeForCategory(item.category?.name || transaction.category || "")?.id || "",
        isOriginalItem: true,
        originalItem: item,
      }));

      // Add shipping/tax if present
      const extraItems = [];
      if (transaction.metadata.shipping > 0) {
        extraItems.push({
          id: Date.now() + 1000,
          description: "Shipping & Handling",
          amount: transaction.metadata.shipping,
          category: "Shipping",
          envelopeId: "",
          isOriginalItem: false,
        });
      }

      if (transaction.metadata.tax > 0) {
        extraItems.push({
          id: Date.now() + 2000,
          description: "Sales Tax",
          amount: transaction.metadata.tax,
          category: "Tax",
          envelopeId: "",
          isOriginalItem: false,
        });
      }

      setSplitAllocations([...itemSplits, ...extraItems]);
    } else {
      // Initialize with single split for the full amount
      setSplitAllocations([
        {
          id: Date.now(),
          description: transaction.description || "Transaction Split",
          amount: Math.abs(transaction.amount),
          category: transaction.category || "",
          envelopeId: transaction.envelopeId || "",
          isOriginalItem: false,
        },
      ]);
    }
  }, [transaction, findEnvelopeForCategory]);

  // Add new split allocation
  const addSplitAllocation = () => {
    const totalAmount = Math.abs(transaction.amount);
    const allocated = splitAllocations.reduce(
      (sum, split) => sum + (parseFloat(split.amount) || 0),
      0
    );
    const remaining = totalAmount - allocated;

    setSplitAllocations((prev) => [
      ...prev,
      {
        id: Date.now(),
        description: "",
        amount: Math.max(0, Math.round(remaining * 100) / 100), // Round to 2 decimal places
        category: transaction.category || "",
        envelopeId: "",
        isOriginalItem: false,
      },
    ]);
  };

  // Update split allocation
  const updateSplitAllocation = (id, field, value) => {
    setSplitAllocations((prev) =>
      prev.map((split) => {
        if (split.id === id) {
          const updated = { ...split, [field]: value };

          // If category changes, try to find matching envelope
          if (field === "category") {
            const envelope = findEnvelopeForCategory(value);
            updated.envelopeId = envelope?.id || split.envelopeId;
          }

          return updated;
        }
        return split;
      })
    );
  };

  // Remove split allocation
  const removeSplitAllocation = (id) => {
    if (splitAllocations.length <= 1) return;
    setSplitAllocations((prev) => prev.filter((split) => split.id !== id));
  };

  // Find envelope by category name
  const findEnvelopeForCategory = useCallback(
    (categoryName) => {
      if (!categoryName) return null;
      return envelopes.find(
        (env) =>
          env.name.toLowerCase() === categoryName.toLowerCase() ||
          env.category?.toLowerCase() === categoryName.toLowerCase()
      );
    },
    [envelopes]
  );

  // Calculate split totals and validation
  const calculateSplitTotals = () => {
    const originalAmount = Math.abs(transaction.amount);
    const allocated = splitAllocations.reduce(
      (sum, split) => sum + (parseFloat(split.amount) || 0),
      0
    );
    const remaining = originalAmount - allocated;

    return {
      original: originalAmount,
      allocated: allocated,
      remaining: remaining,
      isValid: Math.abs(remaining) < 0.01, // Allow for small rounding differences
      isOverAllocated: remaining < -0.01,
      isUnderAllocated: remaining > 0.01,
    };
  };

  // Validate all splits
  const validateSplits = () => {
    const errors = [];

    splitAllocations.forEach((split, index) => {
      if (!split.description.trim()) {
        errors.push(`Split ${index + 1}: Description is required`);
      }
      if (!split.category.trim()) {
        errors.push(`Split ${index + 1}: Category is required`);
      }
      if (!split.amount || split.amount <= 0) {
        errors.push(`Split ${index + 1}: Amount must be greater than 0`);
      }
    });

    const totals = calculateSplitTotals();
    if (!totals.isValid) {
      if (totals.isOverAllocated) {
        errors.push(
          `Total splits ($${totals.allocated.toFixed(2)}) exceed original amount ($${totals.original.toFixed(2)})`
        );
      } else {
        errors.push(
          `Total splits ($${totals.allocated.toFixed(2)}) are less than original amount ($${totals.original.toFixed(2)})`
        );
      }
    }

    return errors;
  };

  // Auto-balance splits to equal the total
  const autoBalance = () => {
    const totals = calculateSplitTotals();
    if (totals.isValid || splitAllocations.length === 0) return;

    const difference = totals.remaining;
    const adjustmentPerSplit = difference / splitAllocations.length;

    setSplitAllocations((prev) =>
      prev.map((split) => ({
        ...split,
        amount: Math.round((split.amount + adjustmentPerSplit) * 100) / 100,
      }))
    );
  };

  // Split evenly across all allocations
  const splitEvenly = () => {
    if (splitAllocations.length === 0) return;

    const originalAmount = Math.abs(transaction.amount);
    const amountPerSplit = Math.round((originalAmount / splitAllocations.length) * 100) / 100;

    setSplitAllocations((prev) =>
      prev.map((split, index) => ({
        ...split,
        amount:
          index === 0
            ? originalAmount - amountPerSplit * (splitAllocations.length - 1) // First split gets remainder
            : amountPerSplit,
      }))
    );
  };

  // Apply the split transaction
  const applySplitTransaction = async () => {
    const errors = validateSplits();
    if (errors.length > 0) {
      alert("Please fix the following errors:\n\n" + errors.join("\n"));
      return;
    }

    setIsProcessing(true);

    try {
      // Create split transactions
      const splitTransactions = splitAllocations.map((split, index) => ({
        id: `${transaction.id}_split_${index}_${Date.now()}`,
        date: transaction.date,
        description: split.description.trim(),
        amount: transaction.amount < 0 ? -Math.abs(split.amount) : Math.abs(split.amount), // Preserve original sign
        category: split.category.trim(),
        envelopeId: split.envelopeId || null,
        notes: `Split ${index + 1}/${splitAllocations.length} from: ${transaction.description}`,
        source: transaction.source ? `${transaction.source}_split` : "manual_split",
        reconciled: transaction.reconciled || false,
        createdBy: transaction.createdBy || "User",
        createdAt: new Date().toISOString(),
        metadata: {
          parentTransactionId: transaction.id,
          splitIndex: index,
          totalSplits: splitAllocations.length,
          originalAmount: Math.abs(transaction.amount),
          originalDescription: transaction.description,
          isOriginalItem: split.isOriginalItem,
          originalItem: split.originalItem || null,
        },
      }));

      // Send split transactions to parent
      await onSplitTransaction?.(transaction, splitTransactions);

      // Close modal
      onClose?.();
    } catch (error) {
      console.error("Error creating split transactions:", error);
      alert("Failed to split transaction. Please try again.");
    } finally {
      setIsProcessing(false);
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

  const totals = calculateSplitTotals();

  if (!isOpen || !transaction) return null;

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
              onClick={applySplitTransaction}
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
