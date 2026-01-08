/**
 * useBillManager Hook
 * Refactored Composition Layer (v2.0)
 *
 * Orchestrates:
 * - useBills (Data Access)
 * - useBillCalculations (Logic/Processing)
 * - useBillDiscovery (Scanning)
 * - useAuth/UI (State)
 */
import { useCallback } from "react";
import { useBillProcessing } from "./useBillProcessing";
import { useTransactionQuery } from "@/hooks/budgeting/transactions/useTransactionQuery";
import { useEnvelopes } from "@/hooks/budgeting/envelopes/useEnvelopes";
import useBills from "@/hooks/budgeting/transactions/scheduled/expenses/useBills";
import { useBillPayment } from "@/hooks/budgeting/transactions/scheduled/expenses/useBillPayment";
import { useBillBulkMutations } from "@/hooks/budgeting/transactions/scheduled/expenses/useBillBulkMutations";
import { useBillDiscovery } from "@/hooks/budgeting/transactions/scheduled/expenses/useBillDiscovery";
import { useBillManagerUIState } from "./useBillManagerUIState";

// Types
import type { Bill } from "@/types/bills";
import type { BillRecord } from "./useBillCalculations";

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
  // 1. Data Access
  const { transactions: tanStackTransactions = [], isLoading: transactionsLoading } =
    useTransactionQuery();
  const { envelopes: tanStackEnvelopes = [], isLoading: envelopesLoading } = useEnvelopes();
  const {
    bills: tanStackBills = [],
    addBill,
    addBillAsync,
    updateBillAsync,
    deleteBill,
    isLoading: billsLoading,
  } = useBills();

  // 2. Local UI State
  const uiState = useBillManagerUIState();
  const {
    selectedBills: selectedBillsRaw,
    setSelectedBills,
    viewMode,
    setViewMode,
    isSearching,
    showBillDetail,
    setShowBillDetail,
    showAddBillModal,
    setShowAddBillModal,
    editingBill,
    setEditingBill,
    showBulkUpdateModal,
    setShowBulkUpdateModal,
    showDiscoveryModal,
    setShowDiscoveryModal,
    discoveredBills,
    historyBill,
    setHistoryBill,
    filterOptions,
    setFilterOptions,
  } = uiState;

  // 3. Logic & Processing
  const { discoverBills, addDiscoveredBills: performAddDiscoveredBills } = useBillDiscovery();

  const { handlePayBill } = useBillPayment();
  const { handleBulkUpdate: handleBulkUpdateAction } = useBillBulkMutations();

  // 4. Data Resolution & Processing (Purified)
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
  } = useBillProcessing({
    tanStackTransactions,
    tanStackEnvelopes,
    tanStackBills,
    onUpdateBill,
    onCreateRecurringBill: onCreateRecurringBill
      ? async (b: Bill) => {
          await onCreateRecurringBill(b);
        }
      : undefined,
    discoverBills: async (t, b, e, c) => {
      await discoverBills(t, b as unknown as BillRecord[], e, c);
    },
    performAddDiscoveredBills: async (bills, onRec, onStd) => {
      await performAddDiscoveredBills(
        bills as unknown as BillRecord[],
        onRec as unknown as (bill: BillRecord) => Promise<void>,
        onStd as unknown as (bill: BillRecord) => Promise<void>
      );
    },
    addBillAsync: async (b) => {
      await addBillAsync(b as unknown as BillRecord);
    },
    updateBillAsync: async (data: { billId: string; updates: Record<string, unknown> }) => {
      if (updateBillAsync) {
        await updateBillAsync({ billId: data.billId, updates: data.updates });
      }
    },
    handleBulkUpdateAction: async (bills) => {
      return await handleBulkUpdateAction(bills);
    },
    onSearchNewBills,
    onError,
    uiState: {
      viewMode: viewMode as "list" | "calendar",
      filterOptions: filterOptions || {},
      setSelectedBills,
    },
  });

  const updateBillWithFullRecord = useCallback(
    async (billId: string, updates: Partial<Bill>) => {
      onUpdateBill?.({ id: billId, ...updates } as Bill);
      await processedHandleUpdateBill({
        billId: billId, // Corrected from bill.id
        updates: updates as unknown as Record<string, unknown>, // Corrected from bill
      });
    },
    [processedHandleUpdateBill, onUpdateBill] // Added onUpdateBill to dependencies
  );

  const isLoading = transactionsLoading || envelopesLoading || billsLoading;

  return {
    // Data
    bills,
    categorizedBills,
    filteredBills,
    totals,
    transactions: resolvedTransactions,
    envelopes: resolvedEnvelopes,

    // UI State
    isLoading: isLoading,
    isSearching,
    discoveredBills,
    showDiscoveryModal,
    setShowDiscoveryModal,
    selectedBills: selectedBillsRaw,
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
