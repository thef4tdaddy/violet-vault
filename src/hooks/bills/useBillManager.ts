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
import { useBillOperations } from "@/hooks/bills/useBillOperations";
import { useBudgetStore } from "@/stores/ui/uiStore";
import { useShallow } from "zustand/react/shallow";
import {
  handleSearchNewBills,
  handleAddDiscoveredBillsAction,
  createUIActions,
  processAndResolveData,
  type FilterOptions,
} from "@/hooks/bills/useBillManagerHelpers";
import { useBillManagerUIState } from "./useBillManagerUIState";

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: Date | string | null;
  [key: string]: unknown;
}

interface Envelope {
  id: string;
  name: string;
  [key: string]: unknown;
}

interface Transaction {
  id: string;
  date: Date | string;
  amount: number;
  [key: string]: unknown;
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
    updateBill: updateBillFromHook,
    deleteBill,
    markBillPaid,
    isLoading: billsLoading,
  } = useBills();

  const updateBillMutation = updateBillFromHook as unknown as (bill: Bill) => Promise<void>;

  interface BudgetState {
    allTransactions: Transaction[];
    envelopes: Envelope[];
    bills: Bill[];
  }

  const budget = useBudgetStore(
    useShallow((state: BudgetState) => ({
      allTransactions: state.allTransactions,
      envelopes: state.envelopes,
      bills: state.bills,
    }))
  );

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
        onUpdateBill,
        updateBillMutation as unknown as (updates: {
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
      updateBillMutation,
      uiState.viewMode,
      uiState.filterOptions,
    ]);

  const billOperations = useBillOperations({
    bills,
    envelopes,
    updateBill: updateBillMutation,
    onUpdateBill,
    onError,
    budget,
  });

  const searchNewBills = useCallback(
    () =>
      handleSearchNewBills(
        {
          transactions,
          bills,
          envelopes,
          onSearchNewBills,
          onError,
        },
        {
          setIsSearching: uiState.setIsSearching,
          setDiscoveredBills: uiState.setDiscoveredBills,
          setShowDiscoveryModal: uiState.setShowDiscoveryModal,
        }
      ),
    [transactions, bills, envelopes, onSearchNewBills, onError, uiState]
  );

  const handleAddDiscoveredBills = useCallback(
    (billsToAdd: Bill[]) =>
      handleAddDiscoveredBillsAction(
        {
          billsToAdd,
          onCreateRecurringBill,
          addBill: addBill as unknown as (bill: Bill) => Promise<void>,
          onError,
        },
        {
          setShowDiscoveryModal: uiState.setShowDiscoveryModal,
          setDiscoveredBills: uiState.setDiscoveredBills,
        }
      ),
    [addBill, onCreateRecurringBill, onError, uiState]
  );

  const handleBulkUpdate = useCallback(
    async (updatedBills) => {
      const result = await billOperations.handleBulkUpdate(updatedBills);
      if (result.success) uiState.setSelectedBills(new Set());
    },
    [billOperations, uiState]
  );

  const uiActions = createUIActions({
    setSelectedBills: uiState.setSelectedBills,
    setViewMode: uiState.setViewMode,
    setShowBillDetail: uiState.setShowBillDetail,
    setShowAddBillModal: uiState.setShowAddBillModal,
    setEditingBill: uiState.setEditingBill,
    setShowBulkUpdateModal: uiState.setShowBulkUpdateModal,
    setShowDiscoveryModal: uiState.setShowDiscoveryModal,
    setHistoryBill: uiState.setHistoryBill,
    setFilterOptions: uiState.setFilterOptions as (options: FilterOptions) => void,
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
    billOperations,
    addBill,
    updateBill: updateBillMutation,
    deleteBill,
    markBillPaid,
  };
};
