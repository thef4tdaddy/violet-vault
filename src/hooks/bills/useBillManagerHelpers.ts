/**
 * Helper functions for useBillManager
 * Extracted to reduce file size and complexity
 */
import { processRecurringBill } from "@/utils/bills/recurringBillUtils";
import { processBillCalculations, categorizeBills, calculateBillTotals, filterBills } from "@/utils/bills/billCalculations";
import { generateBillSuggestions } from "@/utils/common/billDiscovery";
import logger from "@/utils/common/logger";
import type { Bill, Envelope } from "@/types/bills";

interface Transaction {
  id: string;
  date: Date | string;
  amount: number;
  isBill?: boolean;
  type?: string;
  category?: string;
  [key: string]: unknown;
}

interface BillUpdateMutation {
  billId: string;
  updates: {
    isPaid: boolean;
    dueDate: Date | string;
    paidDate: string | null;
  };
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

interface UISetters {
  setSelectedBills: (bills: Set<string>) => void;
  setViewMode: (mode: string) => void;
  setShowBillDetail: (bill: Bill | null) => void;
  setShowAddBillModal: (show: boolean) => void;
  setEditingBill: (bill: Bill | null) => void;
  setShowBulkUpdateModal: (show: boolean) => void;
  setShowDiscoveryModal: (show: boolean) => void;
  setHistoryBill: (bill: Bill | null) => void;
  setFilterOptions: (options: FilterOptions) => void;
}

/**
 * Resolve transactions from multiple sources
 */
export const resolveTransactions = (
  propTransactions: Transaction[],
  tanStackTransactions: Transaction[],
  budgetTransactions: Transaction[]
): Transaction[] => {
  if (propTransactions && propTransactions.length) {
    return propTransactions;
  }
  if (tanStackTransactions.length) {
    return tanStackTransactions;
  }
  return budgetTransactions || [];
};

/**
 * Resolve envelopes from multiple sources
 */
export const resolveEnvelopes = (
  propEnvelopes: Envelope[],
  tanStackEnvelopes: Envelope[],
  budgetEnvelopes: Envelope[]
): Envelope[] => {
  if (propEnvelopes && propEnvelopes.length) {
    return propEnvelopes;
  }
  if (tanStackEnvelopes.length) {
    return tanStackEnvelopes;
  }
  return budgetEnvelopes || [];
};

/**
 * Extract bills from transactions
 */
export const extractBillsFromTransactions = (transactions: Transaction[]): Bill[] => {
  return transactions.filter(
    (t) => t.isBill || t.type === "bill" || t.category === "bill"
  ) as Bill[];
};

/**
 * Combine and deduplicate bills from multiple sources
 */
export const combineBills = (
  tanStackBills: Bill[],
  budgetBills: Bill[],
  billsFromTransactions: Bill[]
): Bill[] => {
  const allBills = [...tanStackBills, ...budgetBills, ...billsFromTransactions];
  
  // Remove duplicates by ID
  const combinedBills: Bill[] = [];
  allBills.forEach((bill) => {
    if (!combinedBills.find((b) => b.id === bill.id)) {
      combinedBills.push(bill);
    }
  });
  
  return combinedBills;
};

/**
 * Process bills with calculations and recurring logic
 */
export const processBills = (
  combinedBills: Bill[],
  onUpdateBill: ((bill: Bill) => void) | undefined,
  updateBillMutation: (updates: BillUpdateMutation) => Promise<void>
): Bill[] => {
  return combinedBills.map((bill) => {
    // Handle recurring bill logic using utility
    const processedBill = processRecurringBill(bill, (updatedBill) => {
      if (onUpdateBill) {
        onUpdateBill(updatedBill);
      } else {
        updateBillMutation({
          billId: updatedBill.id,
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
};

/**
 * Categorize and calculate totals for bills
 */
export const categorizeBillsWithTotals = (bills: Bill[]) => {
  const categorizedBills = categorizeBills(bills);
  const totals = calculateBillTotals(categorizedBills);
  return { categorizedBills, totals };
};

/**
 * Filter bills based on view mode and filter options
 */
export const getFilteredBills = (
  categorizedBills: CategorizedBills,
  viewMode: string,
  filterOptions: FilterOptions
): Bill[] => {
  const billsToFilter = categorizedBills[viewMode] || categorizedBills.all || [];
  return filterBills(billsToFilter, filterOptions);
};

/**
 * Discover new bills from transactions
 */
export const discoverNewBills = async (
  transactions: Transaction[],
  bills: Bill[],
  envelopes: Envelope[],
  onSearchNewBills?: () => void | Promise<void>
): Promise<Bill[]> => {
  const suggestions = generateBillSuggestions(transactions, bills, envelopes);
  await onSearchNewBills?.();
  return suggestions;
};

/**
 * Add discovered bills using appropriate method
 */
export const addDiscoveredBills = async (
  billsToAdd: Bill[],
  onCreateRecurringBill: ((bill: Bill) => void | Promise<void>) | undefined,
  addBill: (bill: Bill) => Promise<void>
): Promise<void> => {
  for (const bill of billsToAdd) {
    if (onCreateRecurringBill) {
      await onCreateRecurringBill(bill);
    } else {
      await addBill(bill);
    }
  }
};

/**
 * Create initial UI state
 */
export const createInitialUIState = () => ({
  selectedBills: new Set(),
  viewMode: "upcoming",
  isSearching: false,
  showBillDetail: null,
  showAddBillModal: false,
  editingBill: null,
  showBulkUpdateModal: false,
  showDiscoveryModal: false,
  discoveredBills: [],
  historyBill: null,
  filterOptions: {
    search: "",
    urgency: "all",
    envelope: "",
    amountMin: "",
    amountMax: "",
  },
});

/**
 * Create UI actions object
 */
export const createUIActions = (setters: UISetters) => ({
  setSelectedBills: setters.setSelectedBills,
  setViewMode: setters.setViewMode,
  setShowBillDetail: setters.setShowBillDetail,
  setShowAddBillModal: setters.setShowAddBillModal,
  setEditingBill: setters.setEditingBill,
  setShowBulkUpdateModal: setters.setShowBulkUpdateModal,
  setShowDiscoveryModal: setters.setShowDiscoveryModal,
  setHistoryBill: setters.setHistoryBill,
  setFilterOptions: setters.setFilterOptions,
});

/**
 * Handle search new bills action with state management
 */
export const handleSearchNewBills = async (
  transactions: Transaction[],
  bills: Bill[],
  envelopes: Envelope[],
  onSearchNewBills: (() => void | Promise<void>) | undefined,
  onError: ((error: string) => void) | undefined,
  setIsSearching: (value: boolean) => void,
  setDiscoveredBills: (bills: Bill[]) => void,
  setShowDiscoveryModal: (show: boolean) => void
): Promise<void> => {
  setIsSearching(true);
  try {
    const suggestions = await discoverNewBills(transactions, bills, envelopes, onSearchNewBills);
    setDiscoveredBills(suggestions);
    setShowDiscoveryModal(true);
  } catch (error) {
    logger.error("Error discovering bills:", error);
    onError?.(error.message || "Failed to discover new bills");
  } finally {
    setIsSearching(false);
  }
};

/**
 * Handle adding discovered bills with state management
 */
export const handleAddDiscoveredBillsAction = async (
  billsToAdd: Bill[],
  onCreateRecurringBill: ((bill: Bill) => void | Promise<void>) | undefined,
  addBill: (bill: Bill) => Promise<void>,
  onError: ((error: string) => void) | undefined,
  setShowDiscoveryModal: (show: boolean) => void,
  setDiscoveredBills: (bills: Bill[]) => void
): Promise<void> => {
  try {
    await addDiscoveredBills(billsToAdd, onCreateRecurringBill, addBill);
    setShowDiscoveryModal(false);
    setDiscoveredBills([]);
  } catch (error) {
    logger.error("Error adding discovered bills:", error);
    onError?.(error.message || "Failed to add discovered bills");
  }
};
