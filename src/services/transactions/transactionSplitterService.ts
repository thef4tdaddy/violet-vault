import type { Envelope, Transaction } from "@/db/types";

/**
 * Split allocation interface for transaction splitting
 */
interface SplitAllocation {
  id: number;
  description: string;
  amount: number;
  category: string;
  envelopeId: string;
  isOriginalItem: boolean;
  originalItem?: unknown;
}

/**
 * Split totals interface
 */
interface SplitTotals {
  original: number;
  allocated: number;
  remaining: number;
  isValid: boolean;
  isOverAllocated: boolean;
}

/**
 * Transaction Splitting Service
 * Handles all business logic for transaction splitting operations
 */
class TransactionSplitterService {
  /**
   * Find envelope by category name
   */
  findEnvelopeForCategory(envelopes: Envelope[], categoryName: string): Envelope | null {
    if (!categoryName) return null;
    return (
      envelopes.find(
        (env) =>
          env.name.toLowerCase() === categoryName.toLowerCase() ||
          env.category?.toLowerCase() === categoryName.toLowerCase()
      ) || null
    );
  }

  /**
   * Initialize splits from transaction metadata
   */
  initializeSplitsFromTransaction(
    transaction: Transaction & { metadata?: Record<string, unknown> },
    envelopes: Envelope[]
  ): SplitAllocation[] {
    // Check if transaction has itemized metadata (like Amazon orders)
    const metadata = transaction.metadata;
    const hasItems =
      metadata &&
      typeof metadata === "object" &&
      "items" in metadata &&
      Array.isArray(metadata.items) &&
      metadata.items.length > 1;

    if (hasItems) {
      // Initialize with individual items
      const items = metadata.items as Array<{
        name?: string;
        totalPrice?: number;
        price?: number;
        category?: { name?: string };
      }>;

      const itemSplits: SplitAllocation[] = items.map((item, index) => ({
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
      const extraItems: SplitAllocation[] = [];
      const shipping = typeof metadata.shipping === "number" ? metadata.shipping : 0;
      const tax = typeof metadata.tax === "number" ? metadata.tax : 0;

      if (shipping > 0) {
        extraItems.push({
          id: Date.now() + 1000,
          description: "Shipping & Handling",
          amount: shipping,
          category: "Shipping",
          envelopeId: "",
          isOriginalItem: false,
        });
      }

      if (tax > 0) {
        extraItems.push({
          id: Date.now() + 2000,
          description: "Sales Tax",
          amount: tax,
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
  calculateSplitTotals(splitAllocations: SplitAllocation[], originalAmount: number): SplitTotals {
    const allocated = splitAllocations.reduce(
      (sum, split) => sum + (parseFloat(String(split.amount)) || 0),
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
  validateSplits(splitAllocations: SplitAllocation[], originalAmount: number): string[] {
    const errors: string[] = [];

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
  autoBalanceSplits(
    splitAllocations: SplitAllocation[],
    originalAmount: number
  ): SplitAllocation[] {
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
  splitEvenly(splitAllocations: SplitAllocation[], originalAmount: number): SplitAllocation[] {
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
  createSplitTransactions(
    transaction: Transaction & { source?: string; createdBy?: string; reconciled?: boolean },
    splitAllocations: SplitAllocation[]
  ): unknown[] {
    return splitAllocations.map((split, index) => ({
      id: `${transaction.id}_split_${index}_${Date.now()}`,
      date: transaction.date,
      description: split.description.trim(),
      amount: transaction.amount < 0 ? -Math.abs(split.amount) : Math.abs(split.amount), // Preserve original sign
      category: split.category.trim(),
      envelopeId: split.envelopeId || "",
      type: transaction.type,
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
  createNewSplitAllocation(
    transaction: Transaction,
    existingSplits: SplitAllocation[]
  ): SplitAllocation {
    const totalAmount = Math.abs(transaction.amount);
    const allocated = existingSplits.reduce(
      (sum, split) => sum + (parseFloat(String(split.amount)) || 0),
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
  updateSplitAllocation(
    splitAllocations: SplitAllocation[],
    id: number,
    field: keyof SplitAllocation,
    value: string | number | boolean | unknown,
    envelopes: Envelope[]
  ): SplitAllocation[] {
    return splitAllocations.map((split) => {
      if (split.id === id) {
        const updated = { ...split, [field]: value };

        // If category changes, try to find matching envelope
        if (field === "category" && typeof value === "string") {
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
