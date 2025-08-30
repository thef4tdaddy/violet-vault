/**
 * useBillManager Hook
 * Extracted from BillManager.jsx for Issue #152
 *
 * Handles all bill management business logic, data processing, and state management
 */
import { useState, useMemo, useCallback } from "react";
import { useTransactions } from "../common/useTransactions";
import { useEnvelopes } from "../budgeting/useEnvelopes";
import useBills from "./useBills";
import { useBillOperations } from "./useBillOperations";
import { useBudgetStore } from "../../stores/ui/uiStore";
import { processRecurringBill } from "../../utils/bills/recurringBillUtils";
import { generateBillSuggestions } from "../../utils/common/billDiscovery";
import {
  processBillCalculations,
  categorizeBills,
  calculateBillTotals,
  filterBills,
} from "../../utils/bills/billCalculations";
import logger from "../../utils/common/logger";

/**
 * Custom hook for bill management business logic
 * @param {Object} options - Configuration options
 * @returns {Object} Bill management state and actions
 */
export const useBillManager = ({
  propTransactions = [],
  propEnvelopes = [],
  onUpdateBill,
  onCreateRecurringBill,
  onSearchNewBills,
  onError,
} = {}) => {
  // Data fetching hooks
  const { data: tanStackTransactions = [], isLoading: transactionsLoading } = useTransactions();
  const { envelopes: tanStackEnvelopes = [], isLoading: envelopesLoading } = useEnvelopes();
  const {
    bills: tanStackBills = [],
    addBill,
    updateBill,
    deleteBill,
    markBillPaid,
    isLoading: billsLoading,
  } = useBills();

  // Fallback to Zustand for backward compatibility
  const budget = useBudgetStore();

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

  // Data Resolution - prioritize props, then TanStack, then Zustand fallback
  const transactions = useMemo(
    () =>
      propTransactions && propTransactions.length
        ? propTransactions
        : tanStackTransactions.length
          ? tanStackTransactions
          : budget.allTransactions || [],
    [propTransactions, tanStackTransactions, budget.allTransactions]
  );

  const envelopes = useMemo(() => {
    const result =
      propEnvelopes && propEnvelopes.length
        ? propEnvelopes
        : tanStackEnvelopes.length
          ? tanStackEnvelopes
          : budget.envelopes || [];

    logger.debug("🔍 useBillManager envelopes resolution:", {
      propEnvelopesLength: propEnvelopes?.length || 0,
      tanStackEnvelopesLength: tanStackEnvelopes?.length || 0,
      budgetEnvelopesLength: budget.envelopes?.length || 0,
      resultLength: result?.length || 0,
      envelopesLoading,
    });

    return result;
  }, [propEnvelopes, tanStackEnvelopes, budget.envelopes, envelopesLoading]);

  // Process bills with calculations and recurring bill logic
  const bills = useMemo(() => {
    // Get bills from transactions (existing bills marked in transactions)
    const billsFromTransactions = transactions.filter(
      (t) => t.isBill || t.type === "bill" || t.category === "bill"
    );

    // Combine with TanStack bills and Zustand fallback
    const allBills = [...tanStackBills, ...(budget.bills || []), ...billsFromTransactions];

    // Remove duplicates by ID
    const combinedBills = [];
    allBills.forEach((bill) => {
      if (!combinedBills.find((b) => b.id === bill.id)) {
        combinedBills.push(bill);
      }
    });

    logger.debug("🔍 useBillManager bills processing:", {
      transactionBills: billsFromTransactions?.length || 0,
      tanStackBills: tanStackBills?.length || 0,
      budgetBills: budget.bills?.length || 0,
      combinedBills: combinedBills?.length || 0,
      sampleRawBill: combinedBills?.[0] ? {
        id: combinedBills[0].id,
        name: combinedBills[0].name,
        dueDate: combinedBills[0].dueDate,
        isPaid: combinedBills[0].isPaid
      } : null
    });

    // Process each bill with calculations and recurring logic
    const processedBills = combinedBills.map((bill) => {
      // Handle recurring bill logic using utility
      const processedBill = processRecurringBill(bill, (updatedBill) => {
        if (onUpdateBill) {
          onUpdateBill(updatedBill);
        } else {
          updateBill({
            id: updatedBill.id,
            updates: {
              isPaid: false,
              dueDate: updatedBill.dueDate,
              paidDate: null,
            },
          });
        }
      });

      // Apply calculations (days until due, urgency)
      return processBillCalculations(processedBill);
    });

    logger.debug("🔍 useBillManager bills processed:", {
      processedCount: processedBills?.length || 0,
      sampleProcessedBill: processedBills?.[0] ? {
        id: processedBills[0].id,
        name: processedBills[0].name,
        dueDate: processedBills[0].dueDate,
        daysUntilDue: processedBills[0].daysUntilDue,
        isPaid: processedBills[0].isPaid,
        urgency: processedBills[0].urgency
      } : null
    });

    return processedBills;
  }, [transactions, tanStackBills, budget.bills, onUpdateBill, updateBill]);

  // Categorize bills into upcoming, overdue, paid
  const categorizedBills = useMemo(() => {
    const result = categorizeBills(bills);
    logger.debug("🔍 useBillManager categorizedBills:", {
      allBills: bills?.length || 0,
      upcoming: result.upcoming?.length || 0,
      overdue: result.overdue?.length || 0,
      paid: result.paid?.length || 0,
      sampleBill: bills?.[0] ? {
        id: bills[0].id,
        name: bills[0].name,
        dueDate: bills[0].dueDate,
        daysUntilDue: bills[0].daysUntilDue,
        isPaid: bills[0].isPaid,
        urgency: bills[0].urgency
      } : null
    });
    return result;
  }, [bills]);

  // Calculate totals for each category
  const totals = useMemo(() => calculateBillTotals(categorizedBills), [categorizedBills]);

  // Apply filters to bills
  const filteredBills = useMemo(() => {
    const billsToFilter = categorizedBills[viewMode] || categorizedBills.all;
    const result = filterBills(billsToFilter, filterOptions);
    logger.debug("🔍 useBillManager filteredBills:", {
      viewMode,
      billsToFilter: billsToFilter?.length || 0,
      filteredCount: result?.length || 0,
      filterOptions
    });
    return result;
  }, [categorizedBills, viewMode, filterOptions]);

  // Initialize bill operations hook
  const billOperations = useBillOperations({
    bills,
    envelopes,
    updateBill,
    onUpdateBill,
    onError,
    budget,
  });

  // Business Logic Actions
  const searchNewBills = useCallback(async () => {
    setIsSearching(true);
    try {
      // Use real bill discovery logic
      const suggestions = generateBillSuggestions(transactions, bills, envelopes);
      setDiscoveredBills(suggestions);
      setShowDiscoveryModal(true);

      // Also call the prop function for backward compatibility
      await onSearchNewBills?.();
    } catch (error) {
      logger.error("Error discovering bills:", error);
      onError?.(error.message || "Failed to discover new bills");
    } finally {
      setIsSearching(false);
    }
  }, [transactions, bills, envelopes, onSearchNewBills, onError]);

  const handleAddDiscoveredBills = useCallback(
    async (billsToAdd) => {
      try {
        for (const bill of billsToAdd) {
          // Use the existing addBill logic
          if (onCreateRecurringBill) {
            await onCreateRecurringBill(bill);
          } else {
            await addBill(bill);
          }
        }
        setShowDiscoveryModal(false);
        setDiscoveredBills([]);
      } catch (error) {
        logger.error("Error adding discovered bills:", error);
        onError?.(error.message || "Failed to add discovered bills");
      }
    },
    [addBill, onCreateRecurringBill, onError]
  );

  const handleBulkUpdate = useCallback(
    async (updatedBills) => {
      const result = await billOperations.handleBulkUpdate(updatedBills);

      if (result.success) {
        setSelectedBills(new Set());
      }
    },
    [billOperations]
  );

  // UI State Actions
  const uiActions = {
    setSelectedBills,
    setViewMode,
    setShowBillDetail,
    setShowAddBillModal,
    setEditingBill,
    setShowBulkUpdateModal,
    setShowDiscoveryModal,
    setHistoryBill,
    setFilterOptions,
  };

  // Loading state
  const isLoading = transactionsLoading || envelopesLoading || billsLoading;

  return {
    // Data
    bills,
    categorizedBills,
    filteredBills,
    totals,
    transactions,
    envelopes,

    // UI State
    selectedBills,
    viewMode,
    isSearching,
    showBillDetail,
    showAddBillModal,
    editingBill,
    showBulkUpdateModal,
    showDiscoveryModal,
    discoveredBills,
    historyBill,
    filterOptions,
    isLoading,

    // Actions
    searchNewBills,
    handleAddDiscoveredBills,
    handleBulkUpdate,
    ...uiActions,

    // Bill operations (from useBillOperations)
    billOperations,

    // Raw bill CRUD from useBills
    addBill,
    updateBill,
    deleteBill,
    markBillPaid,
  };
};
