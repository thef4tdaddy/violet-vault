import React from "react";
import { useTransactionSplitter } from "../../hooks/budgeting/transactions/useTransactionSplitter.ts";
import { useConfirm } from "../../hooks/platform/ux/useConfirm";
import { TRANSACTION_CATEGORIES } from "../../constants/categories";
import { calculateSplitTotals } from "@/utils/domain/transactions/splitterHelpers";
import logger from "@/utils/core/common/logger";
import SplitterHeader from "./splitter/SplitterHeader";
import SplitAllocationsSection from "./splitter/SplitAllocationsSection";
import SplitTotals from "./splitter/SplitTotals";
import SplitActions from "./splitter/SplitActions";

import type { Transaction, Envelope } from "@/types/finance";

interface TransactionSplitterProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose?: () => void;
  onSave?: (splitTransactions: Transaction[], transaction: Transaction) => Promise<void>;
  envelopes?: Envelope[];
  availableCategories?: string[];
  className?: string;
}

const TransactionSplitter = ({
  isOpen,
  transaction,
  onClose,
  onSave,
  envelopes = [],
  availableCategories = [],
  className = "",
}: TransactionSplitterProps) => {
  const splitter = useTransactionSplitter({
    transaction: transaction ?? undefined,
    envelopes,
    onSplit: onSave,
  });
  const confirm = useConfirm();

  // Handle saving with validation
  const handleSave = async () => {
    try {
      const success = await splitter.submitSplit();
      if (success) {
        onClose?.();
      }
    } catch (error) {
      logger.error("Failed to save split transaction:", error);
    }
  };

  // Handle cancellation
  const handleCancel = async () => {
    if (splitter.hasUnsavedChanges) {
      const confirmed = await confirm({
        title: "Unsaved Changes",
        message: "You have unsaved changes. Are you sure you want to cancel?",
        confirmLabel: "Discard Changes",
        cancelLabel: "Keep Editing",
        destructive: true,
      });
      if (confirmed) {
        onClose?.();
      }
    } else {
      onClose?.();
    }
  };

  // Calculate totals for display
  const totals = React.useMemo(() => {
    if (!transaction) return null;
    return calculateSplitTotals(transaction.amount, splitter.splitAllocations);
  }, [transaction, splitter.splitAllocations]);

  // Get categories for dropdown
  const categoryOptions = React.useMemo<string[]>(() => {
    return availableCategories.length > 0 ? availableCategories : [...TRANSACTION_CATEGORIES];
  }, [availableCategories]);

  // Wrapper for updateSplit to match SplitAllocationsSection signature
  const handleUpdateSplit = React.useCallback(
    (id: string, field: string, value: string | number) => {
      splitter.updateSplit(id, field as keyof import("@/types/finance").SplitAllocation, value);
    },
    [splitter]
  );

  // Convert splitAllocations to ensure id and envelopeId are strings
  const splitAllocationsForSection = splitter.splitAllocations.map((split) => ({
    ...split,
    id: String(split.id),
    envelopeId: split.envelopeId ? String(split.envelopeId) : undefined,
  }));

  // Convert envelopes to ensure id is string
  const envelopesForSection = envelopes.map((env) => ({
    ...env,
    id: String(env.id),
  }));

  if (!isOpen || !transaction || !totals) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 ${className}`}
    >
      <div className="glassmorphism rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl border-2 border-black">
        <div className="flex flex-col h-full">
          <SplitterHeader
            transaction={transaction}
            onClose={onClose}
            hasUnsavedChanges={splitter.hasUnsavedChanges}
          />

          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Split Allocations - Takes 2/3 width */}
              <div className="xl:col-span-2">
                <SplitAllocationsSection
                  splitAllocations={splitAllocationsForSection}
                  availableCategories={categoryOptions}
                  envelopes={envelopesForSection}
                  errors={splitter.errors}
                  onUpdateSplit={handleUpdateSplit}
                  onRemoveSplit={splitter.removeSplit}
                  onAddSplit={splitter.addSplit}
                  onSmartSplit={splitter.distributeEvenly}
                  onAutoBalance={splitter.autoBalance}
                  canAutoBalance={!totals.isValid && totals.remaining !== 0}
                />
              </div>

              {/* Split Totals - Takes 1/3 width */}
              <div className="xl:col-span-1">
                <SplitTotals totals={totals} />
              </div>
            </div>
          </div>

          <SplitActions
            totals={totals}
            hasUnsavedChanges={splitter.hasUnsavedChanges}
            isSaving={splitter.isProcessing}
            errors={splitter.errors}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default TransactionSplitter;
