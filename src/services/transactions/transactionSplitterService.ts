import type {
  Envelope,
  SplitAllocation,
  SplitTotals,
  Transaction,
  TransactionMetadata,
} from "@/types/finance";

/**
 * Transaction Splitting Service
 * Handles all business logic for transaction splitting operations
 */
class TransactionSplitterService {
  /**
   * Find envelope by category name
   */
  findEnvelopeForCategory(
    envelopes: Envelope[],
    categoryName: string | null | undefined
  ): Envelope | null {
    if (!categoryName) return null;
    const normalizedCategory = categoryName.toLowerCase();

    return (
      envelopes.find((env) => {
        const envelopeName = env.name.toLowerCase();
        const envelopeCategory = env.category?.toLowerCase();
        return envelopeName === normalizedCategory || envelopeCategory === normalizedCategory;
      }) || null
    );
  }

  /**
   * Initialize splits from transaction metadata
   */
  initializeSplitsFromTransaction(
    transaction: Transaction,
    envelopes: Envelope[]
  ): SplitAllocation[] {
    const metadataItems = transaction.metadata?.items;

    if (metadataItems && metadataItems.length > 1) {
      const itemSplits: SplitAllocation[] = metadataItems.map((item, index) => {
        const categoryFromItem = item.category?.name ?? transaction.category;
        const matchingEnvelope = this.findEnvelopeForCategory(envelopes, categoryFromItem);

        return {
          id: Date.now() + index,
          description: item.name || `Item ${index + 1}`,
          amount: Math.abs(item.totalPrice ?? item.price ?? 0),
          category: categoryFromItem,
          envelopeId: matchingEnvelope?.id ?? "",
          isOriginalItem: true,
          originalItem: item,
        };
      });

      const extraItems: SplitAllocation[] = [];
      const shippingAmount = Number(transaction.metadata?.shipping ?? 0);
      if (shippingAmount > 0) {
        extraItems.push({
          id: Date.now() + 1000,
          description: "Shipping & Handling",
          amount: shippingAmount,
          category: "Shipping",
          envelopeId: "",
          isOriginalItem: false,
        });
      }

      const taxAmount = Number(transaction.metadata?.tax ?? 0);
      if (taxAmount > 0) {
        extraItems.push({
          id: Date.now() + 2000,
          description: "Sales Tax",
          amount: taxAmount,
          category: "Tax",
          envelopeId: "",
          isOriginalItem: false,
        });
      }

      return [...itemSplits, ...extraItems];
    }

    return [
      {
        id: Date.now(),
        description: transaction.description || "Transaction Split",
        amount: Math.abs(transaction.amount),
        category: transaction.category,
        envelopeId: transaction.envelopeId ?? "",
        isOriginalItem: false,
      },
    ];
  }

  /**
   * Calculate split totals and validation
   */
  calculateSplitTotals(splitAllocations: SplitAllocation[], originalAmount: number): SplitTotals {
    const allocated = splitAllocations.reduce((sum, split) => sum + (split.amount ?? 0), 0);
    const remaining = originalAmount - allocated;
    const isValid = Math.abs(remaining) < 0.01;
    const isOverAllocated = remaining < -0.01;
    const isUnderAllocated = remaining > 0.01;

    return {
      original: originalAmount,
      allocated: Math.round(allocated * 100) / 100,
      remaining: Math.round(remaining * 100) / 100,
      isValid,
      isOverAllocated,
      isUnderAllocated,
    };
  }

  /**
   * Validate splits and return errors
   */
  validateSplits(splitAllocations: SplitAllocation[], originalAmount: number): string[] {
    const errors: string[] = [];

    if (splitAllocations.length === 0) {
      errors.push("At least one split allocation is required");
      return errors;
    }

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

    const totals = this.calculateSplitTotals(splitAllocations, originalAmount);
    if (!totals.isValid) {
      const formattedAllocated = totals.allocated.toFixed(2);
      const formattedOriginal = totals.original.toFixed(2);

      if (totals.isOverAllocated) {
        errors.push(
          `Total splits ($${formattedAllocated}) exceed original amount ($${formattedOriginal})`
        );
      } else {
        errors.push(
          `Total splits ($${formattedAllocated}) are less than original amount ($${formattedOriginal})`
        );
      }
    }

    return errors;
  }

  /**
   * Auto-balance splits to equalizes total
   */
  autoBalanceSplits(
    splitAllocations: SplitAllocation[],
    originalAmount: number
  ): SplitAllocation[] {
    const totals = this.calculateSplitTotals(splitAllocations, originalAmount);
    if (totals.isValid || splitAllocations.length === 0) return splitAllocations;

    const remainder = Math.abs(totals.allocated - originalAmount);
    const remainderSplit: SplitAllocation = {
      id: `${Date.now()}`,
      description: "Balance Adjustment",
      amount: remainder,
      category: "Balance Adjustment",
      envelopeId: "",
      isOriginalItem: false,
    };

    return [...splitAllocations, remainderSplit];
  }

  /**
   * Split evenly across all allocations
   */
  splitEvenly(splitAllocations: SplitAllocation[], originalAmount: number): SplitAllocation[] {
    if (splitAllocations.length === 0) return splitAllocations;

    const amountPerSplit = Math.abs(originalAmount) / splitAllocations.length;

    return splitAllocations.map((split) => ({
      ...split,
      amount: amountPerSplit,
      description: `${split.description} (evenly split)`,
    }));
  }

  /**
   * Create split transactions from allocations
   */
  createSplitTransactions(
    transaction: Transaction,
    splitAllocations: SplitAllocation[]
  ): Transaction[] {
    const totalSplits = splitAllocations.length;
    const baseMetadata: TransactionMetadata = transaction.metadata ?? {};

    return splitAllocations.map((split, index) => {
      const normalizedEnvelopeId =
        typeof split.envelopeId === "string" || typeof split.envelopeId === "number"
          ? split.envelopeId
          : undefined;

      const amount = transaction.amount < 0 ? -Math.abs(split.amount) : Math.abs(split.amount);

      return {
        id: `${transaction.id}_split_${index}_${Date.now()}`,
        date: transaction.date,
        description: split.description.trim(),
        amount,
        category: split.category.trim(),
        envelopeId: normalizedEnvelopeId,
        notes: `Split ${index + 1}/${totalSplits} from: ${transaction.description}`,
        source: transaction.source ? `${transaction.source}_split` : "manual_split",
        reconciled: transaction.reconciled ?? false,
        createdBy: transaction.createdBy ?? "User",
        createdAt: new Date().toISOString(),
        type: transaction.type,
        isSplit: true,
        splitIndex: index,
        splitTotal: totalSplits,
        parentTransactionId: transaction.id,
        originalAmount: Math.abs(transaction.amount),
        metadata: {
          ...baseMetadata,
          splitData: {
            splitIndex: index,
            totalSplits,
            originalTransactionId: transaction.id,
            isOriginalItem: split.isOriginalItem,
            originalItem: split.originalItem ?? null,
          },
        },
      };
    });
  }

  /**
   * Create a new split allocation
   */
  createNewSplitAllocation(
    transaction: Transaction,
    existingSplits: SplitAllocation[]
  ): SplitAllocation {
    const totalAmount = Math.abs(transaction.amount);
    const allocated = existingSplits.reduce((sum, split) => sum + (split.amount ?? 0), 0);
    const remaining = totalAmount - allocated;

    return {
      id: Date.now(),
      description: "",
      amount: Math.max(0, Math.round(remaining * 100) / 100),
      category: transaction.category,
      envelopeId: "",
      isOriginalItem: false,
    };
  }

  /**
   * Update a split allocation field
   */
  updateSplitAllocation<K extends keyof SplitAllocation>(
    splitAllocations: SplitAllocation[],
    id: SplitAllocation["id"],
    field: K,
    value: SplitAllocation[K],
    envelopes: Envelope[]
  ): SplitAllocation[] {
    return splitAllocations.map((split) => {
      if (split.id === id) {
        const updatedSplit: SplitAllocation = {
          ...split,
          [field]: value,
        } as SplitAllocation;

        if (field === "category" && typeof value === "string") {
          const matchingEnvelope = this.findEnvelopeForCategory(envelopes, value);
          updatedSplit.envelopeId = matchingEnvelope?.id ?? split.envelopeId;
        }

        return updatedSplit;
      }

      return split;
    });
  }
}

export const transactionSplitterService = new TransactionSplitterService();
