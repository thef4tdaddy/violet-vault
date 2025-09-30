/**
 * Transaction Splitting Service
 * Handles all business logic for transaction splitting operations
 */

/**
 * @typedef {Object} Envelope
 * @property {string} id - Envelope ID
 * @property {string} name - Envelope name
 * @property {string} [category] - Envelope category
 */

/**
 * @typedef {Object} TransactionItem
 * @property {string} [name] - Item name
 * @property {number} [totalPrice] - Total price
 * @property {number} [price] - Item price
 * @property {Object} [category] - Item category
 * @property {string} [category.name] - Category name
 */

/**
 * @typedef {Object} TransactionMetadata
 * @property {TransactionItem[]} [items] - Itemized transaction items
 * @property {number} [shipping] - Shipping cost
 * @property {number} [tax] - Tax amount
 */

/**
 * @typedef {Object} Transaction
 * @property {string} id - Transaction ID
 * @property {string} date - Transaction date
 * @property {string} description - Transaction description
 * @property {number} amount - Transaction amount
 * @property {string} category - Transaction category
 * @property {string} [envelopeId] - Envelope ID
 * @property {string} [source] - Transaction source
 * @property {boolean} [reconciled] - Reconciliation status
 * @property {string} [createdBy] - Creator name
 * @property {TransactionMetadata} [metadata] - Transaction metadata
 */

/**
 * @typedef {Object} SplitAllocation
 * @property {string|number} id - Split ID
 * @property {string} description - Split description
 * @property {number} amount - Split amount
 * @property {string} category - Split category
 * @property {string} envelopeId - Envelope ID
 * @property {boolean} [isOriginalItem] - Whether this is an original itemized item
 * @property {TransactionItem} [originalItem] - Original item data
 */

/**
 * @typedef {Object} SplitTotals
 * @property {number} original - Original amount
 * @property {number} allocated - Allocated amount
 * @property {number} remaining - Remaining amount
 * @property {boolean} isValid - Whether splits are valid
 * @property {boolean} isOverAllocated - Whether over-allocated
 */

class TransactionSplitterService {
  /**
   * Find envelope by category name
   * @param {Envelope[]} envelopes - Available envelopes
   * @param {string} categoryName - Category to search for
   * @returns {Envelope|null} Matching envelope or null
   */
  findEnvelopeForCategory(envelopes, categoryName) {
    if (!categoryName) return null;
    return envelopes.find(
      (env) =>
        env.name.toLowerCase() === categoryName.toLowerCase() ||
        env.category?.toLowerCase() === categoryName.toLowerCase(),
    );
  }

  /**
   * Initialize splits from transaction metadata
   * @param {Transaction} transaction - Transaction to split
   * @param {Envelope[]} envelopes - Available envelopes
   * @returns {SplitAllocation[]} Initial split allocations
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
          this.findEnvelopeForCategory(
            envelopes,
            item.category?.name || transaction.category || "",
          )?.id || "",
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
   * @param {SplitAllocation[]} splitAllocations - Split allocations
   * @param {number} originalAmount - Original transaction amount
   * @returns {SplitTotals} Calculation results
   */
  calculateSplitTotals(splitAllocations, originalAmount) {
    const allocated = splitAllocations.reduce(
      (sum, split) => sum + (parseFloat(split.amount) || 0),
      0,
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
   * @param {SplitAllocation[]} splitAllocations - Split allocations to validate
   * @param {number} originalAmount - Original transaction amount
   * @returns {string[]} Array of validation error messages
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
          `Total splits ($${totals.allocated.toFixed(2)}) exceed original amount ($${totals.original.toFixed(2)})`,
        );
      } else {
        errors.push(
          `Total splits ($${totals.allocated.toFixed(2)}) are less than original amount ($${totals.original.toFixed(2)})`,
        );
      }
    }

    return errors;
  }

  /**
   * Auto-balance splits to equal the total
   * @param {SplitAllocation[]} splitAllocations - Current split allocations
   * @param {number} originalAmount - Original transaction amount
   * @returns {SplitAllocation[]} Balanced split allocations
   */
  autoBalanceSplits(splitAllocations, originalAmount) {
    const totals = this.calculateSplitTotals(splitAllocations, originalAmount);
    if (totals.isValid || splitAllocations.length === 0)
      return splitAllocations;

    const difference = totals.remaining;
    const adjustmentPerSplit = difference / splitAllocations.length;

    return splitAllocations.map((split) => ({
      ...split,
      amount: Math.round((split.amount + adjustmentPerSplit) * 100) / 100,
    }));
  }

  /**
   * Split evenly across all allocations
   * @param {SplitAllocation[]} splitAllocations - Current split allocations
   * @param {number} originalAmount - Original transaction amount
   * @returns {SplitAllocation[]} Evenly split allocations
   */
  splitEvenly(splitAllocations, originalAmount) {
    if (splitAllocations.length === 0) return splitAllocations;

    const amountPerSplit =
      Math.round((originalAmount / splitAllocations.length) * 100) / 100;

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
   * @param {Transaction} transaction - Original transaction
   * @param {SplitAllocation[]} splitAllocations - Split allocations
   * @returns {Transaction[]} Array of split transactions
   */
  createSplitTransactions(transaction, splitAllocations) {
    return splitAllocations.map((split, index) => ({
      id: `${transaction.id}_split_${index}_${Date.now()}`,
      date: transaction.date,
      description: split.description.trim(),
      amount:
        transaction.amount < 0
          ? -Math.abs(split.amount)
          : Math.abs(split.amount), // Preserve original sign
      category: split.category.trim(),
      envelopeId: split.envelopeId || null,
      notes: `Split ${index + 1}/${splitAllocations.length} from: ${transaction.description}`,
      source: transaction.source
        ? `${transaction.source}_split`
        : "manual_split",
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
   * @param {Transaction} transaction - Original transaction
   * @param {SplitAllocation[]} existingSplits - Existing split allocations
   * @returns {SplitAllocation} New split allocation
   */
  createNewSplitAllocation(transaction, existingSplits) {
    const totalAmount = Math.abs(transaction.amount);
    const allocated = existingSplits.reduce(
      (sum, split) => sum + (parseFloat(split.amount) || 0),
      0,
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
   * @param {SplitAllocation[]} splitAllocations - Current split allocations
   * @param {string|number} id - Split ID to update
   * @param {string} field - Field name to update
   * @param {any} value - New value
   * @param {Envelope[]} envelopes - Available envelopes for category matching
   * @returns {SplitAllocation[]} Updated split allocations
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
