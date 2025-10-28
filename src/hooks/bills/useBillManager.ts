/**
 * useBillManager Hook
 * Extracted from BillManager.jsx for Issue #152
 *
 * Handles all bill management business logic, data processing, and state management
 */
import { useState, useMemo, useCallback } from "react";
import { useTransactions } from "@/hooks/common/useTransactions";
import { useEnvelopes } from "@/hooks/budgeting/useEnvelopes";
import useBills from "@/hooks/bills/useBills";
import { useBillOperations } from "@/hooks/bills/useBillOperations";
import { useBudgetStore } from "@/stores/ui/uiStore";
import { useShallow } from "zustand/react/shallow";
import {
  resolveTransactions,
  resolveEnvelopes,
  extractBillsFromTransactions,
  combineBills,
  processBills,
  categorizeBillsWithTotals,
  getFilteredBills,
  handleSearchNewBills,
  handleAddDiscoveredBillsAction,
  createUIActions,
} from "@/hooks/bills/useBillManagerHelpers";

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: Date | string;
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

interface CategorizedBills {
  all: Bill[];
  upcoming: Bill[];
  overdue: Bill[];
  paid: Bill[];
  [key: string]: Bill[];
}

interface FilterOptions {
  search: string;
  urgency: string;
  envelope: string;
  amountMin: string;
  amountMax: string;
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
  // Data fetching hooks
  const { transactions: tanStackTransactions = [], isLoading: transactionsLoading } = useTransactions();
  const { envelopes: tanStackEnvelopes = [], isLoading: envelopesLoading } = useEnvelopes();
  const {
    bills: tanStackBills = [],
    addBill,
    updateBill: updateBillFromHook,
    deleteBill,
    markBillPaid,
    isLoading: billsLoading,
  } = useBills();

  // Type-safe wrapper for updateBill
  const updateBillMutation = updateBillFromHook as unknown as (bill: Bill) => Promise<void>;

  // Fallback to Zustand for backward compatibility
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

  // UI State Management
  const [selectedBills, setSelectedBills] = useState(new Set());
  const [viewMode, setViewMode] = useState("upcoming");
  const [isSearching, setIsSearching] = useState(false);
  const [showBillDetail, setShowBillDetail] = useState(null);
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);
  const [discoveredBills, setDiscoveredBills] = useState([]);
  const [historyBill, setHistoryBill] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    search: "",
    urgency: "all",
    envelope: "",
    amountMin: "",
    amountMax: "",
  });

  // Data Resolution and Processing - combined to reduce statements
  const { transactions, envelopes, bills, categorizedBills, totals, filteredBills } = useMemo(() => {
    const resolvedTransactions = resolveTransactions(propTransactions, tanStackTransactions, budget.allTransactions);
    const resolvedEnvelopes = resolveEnvelopes(propEnvelopes, tanStackEnvelopes, budget.envelopes);
    const billsFromTransactions = extractBillsFromTransactions(resolvedTransactions as unknown[]);
    const combinedBills = combineBills(tanStackBills as unknown[], budget.bills as unknown[] || [], billsFromTransactions);
    const processedBills = processBills(combinedBills, onUpdateBill, updateBillMutation as unknown as (updates: { billId: string; updates: Record<string, unknown> }) => Promise<void>);
    const { categorizedBills: catBills, totals: billTotals } = categorizeBillsWithTotals(processedBills);
    const filtered = getFilteredBills(catBills as unknown as CategorizedBills, viewMode, filterOptions);
    
    return {
      transactions: resolvedTransactions,
      envelopes: resolvedEnvelopes,
      bills: processedBills,
      categorizedBills: catBills,
      totals: billTotals,
      filteredBills: filtered,
    };
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
    viewMode,
    filterOptions,
  ]);

  // Initialize bill operations hook
  const billOperations = useBillOperations({
    bills,
    envelopes,
    updateBill: updateBillMutation,
    onUpdateBill,
    onError,
    budget,
  });

  // Business Logic Actions
  const searchNewBills = useCallback(
    () => handleSearchNewBills(
      {
        transactions: transactions as unknown[],
        bills: bills as unknown[],
        envelopes: envelopes as unknown[],
        onSearchNewBills,
        onError,
      },
      {
        setIsSearching,
        setDiscoveredBills,
        setShowDiscoveryModal,
      }
    ),
    [transactions, bills, envelopes, onSearchNewBills, onError]
  );

  const handleAddDiscoveredBills = useCallback(
    (billsToAdd: unknown[]) => handleAddDiscoveredBillsAction(
      {
        billsToAdd,
        onCreateRecurringBill,
        addBill: addBill as (bill: unknown) => void,
        onError,
      },
      {
        setShowDiscoveryModal,
        setDiscoveredBills,
      }
    ),
    [addBill, onCreateRecurringBill, onError]
  );

  const handleBulkUpdate = useCallback(
    async (updatedBills) => {
      const result = await billOperations.handleBulkUpdate(updatedBills);
      if (result.success) setSelectedBills(new Set());
    },
    [billOperations]
  );

  // UI State Actions and loading
  const uiActions = createUIActions({
    setSelectedBills,
    setViewMode,
    setShowBillDetail,
    setShowAddBillModal,
    setEditingBill,
    setShowBulkUpdateModal,
    setShowDiscoveryModal,
    setHistoryBill,
    setFilterOptions: setFilterOptions as (options: FilterOptions) => void,
  });
  const isLoading = transactionsLoading || envelopesLoading || billsLoading;

  return {
    bills, categorizedBills, filteredBills, totals, transactions, envelopes,
    selectedBills, viewMode, isSearching, showBillDetail, showAddBillModal, editingBill,
    showBulkUpdateModal, showDiscoveryModal, discoveredBills, historyBill, filterOptions, isLoading,
    searchNewBills, handleAddDiscoveredBills, handleBulkUpdate, ...uiActions,
    billOperations, addBill, updateBill: updateBillMutation, deleteBill, markBillPaid,
  };
};
