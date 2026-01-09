/**
 * useBillManager Hook
 * Lean Composition Layer (v2.0)
 *
 * Orchestrates UI state and the domain processing layer.
 */
import { useCallback } from "react";
import { useBillProcessing } from "./useBillProcessing";
import { useBillPayment } from "@/hooks/budgeting/transactions/scheduled/expenses/useBillPayment";
import { useBillManagerUIState } from "./useBillManagerUIState";

// Types
import type { Bill } from "@/types/bills";

interface UseBillManagerOptions {
  onUpdateBill?: (bill: Bill) => void | Promise<void>;
  onCreateRecurringBill?: (bill: Bill) => void | Promise<void>;
  onSearchNewBills?: () => void | Promise<void>;
  onError?: (error: string) => void;
}

export const useBillManager = ({
  onUpdateBill,
  onCreateRecurringBill,
  onSearchNewBills,
  onError,
}: UseBillManagerOptions = {}) => {
  // 1. Local UI State
  const uiState = useBillManagerUIState();
  const {
    selectedBills,
    setSelectedBills,
    viewMode,
    setViewMode,
    showBillDetail,
    setShowBillDetail,
    showAddBillModal,
    setShowAddBillModal,
    editingBill,
    setEditingBill,
    showBulkUpdateModal,
    setShowBulkUpdateModal,
    historyBill,
    setHistoryBill,
    filterOptions,
    setFilterOptions,
  } = uiState;

  // 2. Logic & Processing
  const { handlePayBill } = useBillPayment();

  // 3. Purified Processing Layer
  const processing = useBillProcessing({
    onUpdateBill: (bill: Bill) => {
      onUpdateBill?.(bill);
    },
    onCreateRecurringBill: onCreateRecurringBill
      ? async (b: Bill) => {
          await onCreateRecurringBill(b);
        }
      : undefined,
    onSearchNewBills,
    onError,
    uiState: {
      viewMode: viewMode as "list" | "calendar",
      filterOptions: filterOptions || {},
      setSelectedBills,
    },
  });

  const {
    categorizedBills,
    totals,
    filteredBills,
    searchNewBills,
    handleAddDiscoveredBills,
    handleBulkUpdate,
    handleUpdateBill: processedHandleUpdateBill,
    bills,
    resolvedTransactions,
    resolvedEnvelopes,
    isLoading,
    isSearching,
    discoveredBills,
    showDiscoveryModal,
    setShowDiscoveryModal,
    addBill,
    deleteBill,
  } = processing;

  const updateBillWithFullRecord = useCallback(
    async (billId: string, updates: Partial<Bill>) => {
      onUpdateBill?.({ id: billId, ...updates } as Bill);
      await processedHandleUpdateBill({
        billId: billId,
        updates: updates as unknown as Record<string, unknown>,
      });
    },
    [processedHandleUpdateBill, onUpdateBill]
  );

  return {
    // Data
    bills,
    categorizedBills,
    filteredBills,
    totals,
    transactions: resolvedTransactions,
    envelopes: resolvedEnvelopes,

    // UI State
    isLoading,
    isSearching,
    discoveredBills,
    showDiscoveryModal,
    setShowDiscoveryModal,
    selectedBills,
    viewMode,
    showBillDetail,
    showAddBillModal,
    editingBill,
    showBulkUpdateModal,
    historyBill,
    filterOptions,

    // State Setters
    setSelectedBills,
    setViewMode,
    setShowBillDetail,
    setShowAddBillModal,
    setEditingBill,
    setShowBulkUpdateModal,
    setHistoryBill,
    setFilterOptions,

    // Actions
    searchNewBills,
    handleAddDiscoveredBills,
    handleBulkUpdate,

    // Operations
    addBill,
    updateBill: updateBillWithFullRecord,
    deleteBill,
    handlePayBill,
    // Legacy Support
    billOperations: {
      handlePayBill,
    },
  };
};

export default useBillManager;
