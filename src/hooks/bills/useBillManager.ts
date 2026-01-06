/**
 * useBillManager Hook
 * Extracted from BillManager.jsx for Issue #152
 *
 * Handles all bill management business logic, data processing, and state management
 */
import { useMemo, useCallback } from "react";
import { useTransactions } from "@/hooks/common/useTransactions";
import { useEnvelopes } from "@/hooks/budgeting/useEnvelopes";
import useBills from "@/hooks/bills/useBills";
import { useBillPayment } from "@/hooks/bills/useBillPayment";
import { useBillBulkMutations } from "@/hooks/bills/useBillBulkMutations";
import { useBudgetStore, type UiStore } from "@/stores/ui/uiStore";
import { useShallow } from "zustand/react/shallow";
import {
  handleSearchNewBills,
  handleAddDiscoveredBillsAction,
  createUIActions,
  processAndResolveData,
} from "@/hooks/bills/useBillManagerHelpers";
import { useBillManagerUIState } from "./useBillManagerUIState";
import type { Bill as BillType, Envelope as EnvelopeType } from "@/types/bills";

interface Bill extends BillType {
  [key: string]: unknown;
}

interface Envelope extends EnvelopeType {
  [key: string]: unknown;
}

interface Transaction {
  id: string;
  date: Date | string;
  amount: number;
  [key: string]: unknown;
}

interface BudgetState {
  allTransactions: Transaction[];
  envelopes: Envelope[];
  bills: Bill[];
}

// Extended UiStore interface for legacy compatibility
interface ExtendedUiStore extends UiStore {
  allTransactions?: Transaction[];
  envelopes?: Envelope[];
  bills?: Bill[];
}

interface UseBillManagerOptions {
  propTransactions?: Transaction[];
  propEnvelopes?: Envelope[];
  onUpdateBill?: (bill: Bill) => void | Promise<void>;
  onCreateRecurringBill?: (bill: Bill) => void | Promise<void>;
  onSearchNewBills?: () => void | Promise<void>;
  onError?: (error: string) => void;
}

/**
 * Custom hook for bill management business logic
 * @param {UseBillManagerOptions} options - Configuration options
 * @returns {Object} Bill management state and actions
 */
export const useBillManager = ({
  propTransactions = [],
  propEnvelopes = [],
  onUpdateBill,
  onCreateRecurringBill,
  onSearchNewBills,
  onError,
}: UseBillManagerOptions = {}) => {
  const { transactions: tanStackTransactions = [], isLoading: transactionsLoading } =
    useTransactions();
  const { envelopes: tanStackEnvelopes = [], isLoading: envelopesLoading } = useEnvelopes();
  const {
    bills: tanStackBills = [],
    addBill,
    updateBillAsync,
    deleteBill,
    isLoading: billsLoading,
  } = useBills();

  // Initialize sub-hooks
  const { handlePayBill } = useBillPayment();
  const { handleBulkUpdate: handleBulkUpdateAction } = useBillBulkMutations();

  const updateBillWithFullRecord = useCallback(
    async (bill: Bill) => {
      await updateBillAsync({ billId: bill.id, updates: bill as Record<string, unknown> });
    },
    [updateBillAsync]
  );

  const budget = useBudgetStore(
    useShallow((state: ExtendedUiStore) => ({
      allTransactions: state.allTransactions ?? [],
      envelopes: state.envelopes ?? [],
      bills: state.bills ?? [],
    }))
  ) as BudgetState;

  // Note: useBillManagerUIState is NOT a Zustand store - it's a custom hook with useState
  // eslint-disable-next-line zustand-safe-patterns/zustand-selective-subscriptions
  const uiState = useBillManagerUIState();

  const { transactions, envelopes, bills, categorizedBills, totals, filteredBills } =
    useMemo(() => {
      return processAndResolveData(
        propTransactions as Transaction[],
        tanStackTransactions as unknown as Transaction[],
        budget.allTransactions as Transaction[],
        propEnvelopes as Envelope[],
        tanStackEnvelopes as unknown as Envelope[],
        budget.envelopes as Envelope[],
        tanStackBills as unknown as Bill[],
        (budget.bills as unknown as Bill[]) || [],
        uiState.viewMode,
        uiState.filterOptions,
        onUpdateBill as never,
        updateBillAsync as unknown as (updates: {
          billId: string;
          updates: Record<string, unknown>;
        }) => Promise<void>
      );
    }, [
      propTransactions,
      tanStackTransactions,
      budget.allTransactions,
      propEnvelopes,
      tanStackEnvelopes,
      budget.envelopes,
      tanStackBills,
      budget.bills,
      onUpdateBill,
      updateBillAsync,
      uiState.viewMode,
      uiState.filterOptions,
    ]);

  const searchNewBills = useCallback(
    () =>
      handleSearchNewBills(
        {
          transactions: transactions as never,
          bills: bills as never,
          envelopes: envelopes as never,
          onSearchNewBills,
          onError,
        },
        {
          setIsSearching: uiState.setIsSearching,
          setDiscoveredBills: uiState.setDiscoveredBills as never,
          setShowDiscoveryModal: uiState.setShowDiscoveryModal,
        }
      ),
    [transactions, bills, envelopes, onSearchNewBills, onError, uiState]
  );

  const handleAddDiscoveredBills = useCallback(
    (billsToAdd: Bill[]) =>
      handleAddDiscoveredBillsAction(
        {
          billsToAdd: billsToAdd as never,
          onCreateRecurringBill: onCreateRecurringBill as never,
          addBill: addBill as never,
          onError,
        },
        {
          setShowDiscoveryModal: uiState.setShowDiscoveryModal,
          setDiscoveredBills: uiState.setDiscoveredBills as never,
        }
      ),
    [addBill, onCreateRecurringBill, onError, uiState]
  );

  const handleBulkUpdate = useCallback(
    async (updatedBills: Bill[]) => {
      const result = await handleBulkUpdateAction(updatedBills);
      if (result.success) uiState.setSelectedBills(new Set());
    },
    [handleBulkUpdateAction, uiState]
  );

  const uiActions = createUIActions({
    setSelectedBills: (bills: Set<string>) => {
      uiState.setSelectedBills(bills);
    },
    setViewMode: uiState.setViewMode,
    setShowBillDetail: (bill) => uiState.setShowBillDetail(bill),
    setShowAddBillModal: uiState.setShowAddBillModal,
    setEditingBill: (bill) => uiState.setEditingBill(bill),
    setShowBulkUpdateModal: uiState.setShowBulkUpdateModal,
    setShowDiscoveryModal: uiState.setShowDiscoveryModal,
    setHistoryBill: (bill) => uiState.setHistoryBill(bill),
    setFilterOptions: uiState.setFilterOptions,
  });

  const isLoading = transactionsLoading || envelopesLoading || billsLoading;

  return {
    bills,
    categorizedBills,
    filteredBills,
    totals,
    transactions,
    envelopes,
    ...uiState,
    isLoading,
    searchNewBills,
    handleAddDiscoveredBills,
    handleBulkUpdate,
    ...uiActions,

    // Expose operations directly
    addBill,
    updateBill: updateBillWithFullRecord,
    deleteBill,
    handlePayBill,

    // Legacy support (some components might expect 'billOperations' object)
    // We can phase this out or keep it if current UI relies on it deep down
    billOperations: {
      handlePayBill,
      handleBulkUpdate: handleBulkUpdateAction,
    },
  };
};
