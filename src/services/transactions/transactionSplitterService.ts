/**
 * Transaction Splitting Service
 * Handles all business logic for transaction splitting operations
 */
class TransactionSplitterService {
  /**
   * Find envelope by category name
   */
  findEnvelopeForCategory(envelopes, categoryName) {
    if (!categoryName) return null;
    return envelopes.find(
      (env) =>
        env.name.toLowerCase() === categoryName.toLowerCase() ||
        env.category?.toLowerCase() === categoryName.toLowerCase()
    );
  }

  /**
   * Initialize splits from transaction metadata
   */
  initializeSplitsFromTransaction(transaction, envelopes) {
    // Check if transaction has itemized metadata (like Amazon orders)
    if (transaction.metadata?.items && transaction.metadata.items.length > 1) {
      // Initialize with individual items
      const itemSplits = transaction.metadata.items.map((item, index) => ({
        id: Date.now() + index,
        description: item.name || `Item ${index + 1}`,
        amount: Math.abs(item.totalPrice || item.price || 0),
        category: item.category?.name || transaction.category || "",
        envelopeId:
          this.findEnvelopeForCategory(envelopes, item.category?.name || transaction.category || "")
            ?.id || "",
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

      return [...itemSplits, ...extraItems];
    } else {
      // Initialize with single split for the full amount
      return [
        {
          id: Date.now(),
          description: transaction.description || "Transaction Split",
          amount: Math.abs(transaction.amount),
          category: transaction.category || "",
          envelopeId: transaction.envelopeId || "",
          isOriginalItem: false,
        },
      ];
    }
  }

  /**
   * Calculate split totals and validation
   */
  calculateSplitTotals(splitAllocations, originalAmount) {
    const allocated = splitAllocations.reduce(
      (sum, split) => sum + (parseFloat(split.amount) || 0),
      0
    );
    const remaining = originalAmount - allocated;
    const isValid = Math.abs(remaining) < 0.01; // Account for rounding errors
    const isOverAllocated = remaining < -0.01;

    return {
      original: originalAmount,
      allocated: Math.round(allocated * 100) / 100,
      remaining: Math.round(remaining * 100) / 100,
      isValid,
      isOverAllocated,
    };
  }

  /**
   * Validate splits and return errors
   */
  validateSplits(splitAllocations, originalAmount) {
    const errors = [];

    // Check if any splits exist
    if (splitAllocations.length === 0) {
      errors.push("At least one split allocation is required");
      return errors;
    }

    // Validate each split
    splitAllocations.forEach((split, index) => {
      if (!split.description || split.description.trim() === "") {
        errors.push(`Split ${index + 1}: Description is required`);
      }

      if (!split.amount || split.amount <= 0) {
        errors.push(`Split ${index + 1}: Amount must be greater than 0`);
      }

      if (!split.category || split.category.trim() === "") {
        errors.push(`Split ${index + 1}: Category is required`);
      }
    });

    // Check totals
    const totals = this.calculateSplitTotals(splitAllocations, originalAmount);
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
  }

  /**
   * Auto-balance splits to equal the total
   */
  autoBalanceSplits(splitAllocations, originalAmount) {
    const totals = this.calculateSplitTotals(splitAllocations, originalAmount);
    if (totals.isValid || splitAllocations.length === 0) return splitAllocations;

    const difference = totals.remaining;
    const adjustmentPerSplit = difference / splitAllocations.length;

    return splitAllocations.map((split) => ({
      ...split,
      amount: Math.round((split.amount + adjustmentPerSplit) * 100) / 100,
    }));
  }

  /**
   * Split evenly across all allocations
   */
  splitEvenly(splitAllocations, originalAmount) {
    if (splitAllocations.length === 0) return splitAllocations;

    const amountPerSplit = Math.round((originalAmount / splitAllocations.length) * 100) / 100;

    return splitAllocations.map((split, index) => ({
      ...split,
      amount:
        index === 0
          ? originalAmount - amountPerSplit * (splitAllocations.length - 1) // First split gets remainder
          : amountPerSplit,
    }));
  }

  /**
   * Create split transactions from allocations
   */
  createSplitTransactions(transaction, splitAllocations) {
    return splitAllocations.map((split, index) => ({
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
  }

  /**
   * Create a new split allocation
   */
  createNewSplitAllocation(transaction, existingSplits) {
    const totalAmount = Math.abs(transaction.amount);
    const allocated = existingSplits.reduce(
      (sum, split) => sum + (parseFloat(split.amount) || 0),
      0
    );
    const remaining = totalAmount - allocated;

    return {
      id: Date.now(),
      description: "",
      amount: Math.max(0, Math.round(remaining * 100) / 100), // Round to 2 decimal places
      category: transaction.category || "",
      envelopeId: "",
      isOriginalItem: false,
    };
  }

  /**
   * Update a split allocation field
   */
  updateSplitAllocation(splitAllocations, id, field, value, envelopes) {
    return splitAllocations.map((split) => {
      if (split.id === id) {
        const updated = { ...split, [field]: value };

        // If category changes, try to find matching envelope
        if (field === "category") {
          const envelope = this.findEnvelopeForCategory(envelopes, value);
          updated.envelopeId = envelope?.id || split.envelopeId;
        }

        return updated;
      }
      return split;
    });
  }
}

export const transactionSplitterService = new TransactionSplitterService();
