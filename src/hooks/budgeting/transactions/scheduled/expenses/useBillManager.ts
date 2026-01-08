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
import { useTransactions } from "@/hooks/common/useTransactions";
import { useEnvelopes } from "@/hooks/budgeting/envelopes/useEnvelopes";
import useBills from "@/hooks/budgeting/transactions/scheduled/expenses/useBills";
import { useBillPayment } from "@/hooks/budgeting/transactions/scheduled/expenses/useBillPayment";
import { useBillBulkMutations } from "@/hooks/budgeting/transactions/scheduled/expenses/useBillBulkMutations";
import { useBillDiscovery } from "@/hooks/budgeting/transactions/scheduled/expenses/useBillDiscovery";
import { useBudgetStore, type UiStore } from "@/stores/ui/uiStore";
import { useBillManagerUIState } from "./useBillManagerUIState";
// Types
import type { Bill } from "@/types/bills";
import type { BillRecord, EnvelopeRecord, TransactionRecord } from "./useBillCalculations";

interface UseBillManagerOptions {
  propTransactions?: TransactionRecord[];
  propEnvelopes?: EnvelopeRecord[];
  onUpdateBill?: (bill: Bill) => void | Promise<void>;
  onCreateRecurringBill?: (bill: Bill) => void | Promise<void>;
  onSearchNewBills?: () => void | Promise<void>;
  onError?: (error: string) => void;
}

interface LegacyBudgetStoreState extends UiStore {
  allTransactions?: TransactionRecord[];
  envelopes?: EnvelopeRecord[];
  bills?: BillRecord[];
}

// eslint-disable-next-line max-lines-per-function
export const useBillManager = ({
  propTransactions,
  propEnvelopes,
  onUpdateBill,
  onCreateRecurringBill,
  onSearchNewBills,
  onError,
}: UseBillManagerOptions = {}) => {
  // 1. Data Access
  const { transactions: tanStackTransactions = [], isLoading: transactionsLoading } =
    useTransactions();
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

  // 4. Global State (Legacy Store Support)
  const legacyAllTransactions = useBudgetStore(
    (state) => (state as LegacyBudgetStoreState).allTransactions ?? []
  ) as TransactionRecord[];

  const legacyEnvelopes = useBudgetStore(
    (state) => (state as LegacyBudgetStoreState).envelopes ?? []
  ) as EnvelopeRecord[];

  const legacyBills = useBudgetStore(
    (state) => (state as LegacyBudgetStoreState).bills ?? []
  ) as BillRecord[];

  const budget = {
    allTransactions: legacyAllTransactions,
    envelopes: legacyEnvelopes,
    bills: legacyBills,
  };

  // 5. Data Resolution & Processing
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
    // resolvedBills,
  } = useBillProcessing({
    propTransactions: propTransactions || [],
    storeTransactions: budget.allTransactions,
    tanStackTransactions,
    propEnvelopes: propEnvelopes || [],
    storeEnvelopes: budget.envelopes,
    tanStackEnvelopes,
    storeBills: budget.bills,
    tanStackBills,
    onUpdateBill,
    // Use correct types from useBillProcessing
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
        // Enforce the correct shape for updateBillAsync prop
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
