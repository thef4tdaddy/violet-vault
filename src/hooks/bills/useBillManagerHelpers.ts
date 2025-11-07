/**
 * Helper functions for useBillManager
 * Extracted to reduce file size and complexity
 */
import { processRecurringBill } from "@/utils/bills/recurringBillUtils";
import {
  processBillCalculations,
  categorizeBills,
  calculateBillTotals,
  filterBills,
  normalizeBillDate,
} from "@/utils/bills/billCalculations";
import { generateBillSuggestions } from "@/utils/common/billDiscovery";
import logger from "@/utils/common/logger";

interface BillRecord {
  id: string;
  name: string;
  amount: number;
  category?: string;
  dueDate: Date | string | null;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

interface TransactionRecord {
  id: string;
  date: Date | string;
  amount: number;
  isBill?: boolean;
  type?: string;
  category?: string;
  [key: string]: unknown;
}

/**
 * Resolve transactions from multiple sources
 */
export const resolveTransactions = (
  propTransactions: TransactionRecord[],
  tanStackTransactions: TransactionRecord[],
  budgetTransactions: TransactionRecord[]
): TransactionRecord[] => {
  if (propTransactions && propTransactions.length) {
    return propTransactions;
  }
  if (tanStackTransactions.length) {
    return tanStackTransactions;
  }
  return budgetTransactions || [];
};

interface Envelope {
  id: string;
  name: string;
  [key: string]: unknown;
}

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
export const extractBillsFromTransactions = (transactions: TransactionRecord[]): BillRecord[] => {
  return transactions.filter(
    (t) => t.isBill || t.type === "bill" || t.category === "bill"
  ) as unknown as BillRecord[];
};

/**
 * Combine and deduplicate bills from multiple sources
 */
export const combineBills = (
  tanStackBills: BillRecord[],
  budgetBills: BillRecord[],
  billsFromTransactions: BillRecord[]
): BillRecord[] => {
  const allBills = [...tanStackBills, ...budgetBills, ...billsFromTransactions];

  // Remove duplicates by ID
  const combinedBills: BillRecord[] = [];
  allBills.forEach((bill) => {
    if (!combinedBills.find((b) => b.id === bill.id)) {
      combinedBills.push(bill);
    }
  });

  return combinedBills;
};

const getMetadataDueDate = (bill: BillRecord): unknown => {
  const metadata = bill.metadata;
  if (!metadata || typeof metadata !== "object") {
    return undefined;
  }
  const candidate = (metadata as Record<string, unknown>).dueDate;
  return candidate;
};

const coerceString = (value: unknown): string | null => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed !== "" ? trimmed : null;
  }
  return null;
};

const coerceNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return null;
    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const resolveRawDueDate = (bill: BillRecord): string | Date | null => {
  const candidates: unknown[] = [
    bill.dueDate,
    bill.nextDueDate,
    bill.expectedDueDate,
    bill.nextPaymentDate,
    getMetadataDueDate(bill),
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (candidate instanceof Date) return candidate;
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return new Date(candidate);
    }
    const stringCandidate = coerceString(candidate);
    if (stringCandidate) {
      return stringCandidate;
    }
  }

  return null;
};

const resolveAmount = (bill: BillRecord): number => {
  const amount = coerceNumber(bill.amount);
  if (amount !== null) {
    return amount;
  }

  const monthlyAmount = coerceNumber((bill as Record<string, unknown>).monthlyAmount);
  if (monthlyAmount !== null) {
    return monthlyAmount;
  }

  return 0;
};

const resolveName = (bill: BillRecord, index: number): string => {
  const name = coerceString(bill.name);
  if (name) return name;

  const provider = coerceString((bill as Record<string, unknown>).provider);
  if (provider) return provider;

  const description = coerceString((bill as Record<string, unknown>).description);
  if (description) return description;

  const category = coerceString((bill as Record<string, unknown>).category);
  if (category) return category;

  return `Bill ${index + 1}`;
};

const resolveCategory = (bill: BillRecord): string => {
  const category = coerceString((bill as Record<string, unknown>).category);
  if (category) return category;

  const type = coerceString((bill as Record<string, unknown>).type);
  if (type) return type;

  return "Uncategorized";
};

const resolveId = (bill: BillRecord, resolvedName: string, index: number): string => {
  if (typeof bill.id === "string" && bill.id.trim() !== "") {
    return bill.id;
  }

  if (typeof bill.id === "number") {
    return `bill-${bill.id}`;
  }

  const slug = resolvedName.toLowerCase().replace(/\s+/g, "-");
  return `${slug}-${index}`;
};

const normalizeBillForUI = (bill: BillRecord, index: number): BillRecord => {
  const normalizedDueDate = (() => {
    const rawDueDate = resolveRawDueDate(bill);
    if (!rawDueDate) return null;
    const normalized = normalizeBillDate(rawDueDate);
    return normalized || null;
  })();

  const resolvedName = resolveName(bill, index);
  const resolvedCategory = resolveCategory(bill);
  const resolvedAmount = resolveAmount(bill);
  const resolvedId = resolveId(bill, resolvedName, index);

  return {
    ...bill,
    id: resolvedId,
    name: resolvedName,
    amount: resolvedAmount,
    category: resolvedCategory,
    dueDate: normalizedDueDate,
    isPaid: Boolean(bill.isPaid),
    isRecurring: Boolean(bill.isRecurring),
  };
};

/**
 * Process bills with calculations and recurring logic
 */
export const processBills = (
  combinedBills: BillRecord[],
  onUpdateBill: ((bill: BillRecord) => void) | undefined,
  updateBillMutation: (updates: {
    billId: string;
    updates: Record<string, unknown>;
  }) => Promise<void>
): BillRecord[] => {
  return combinedBills.map((bill, index) => {
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
    const calculatedBill = processBillCalculations(processedBill) as unknown as BillRecord;
    return normalizeBillForUI(calculatedBill, index);
  });
};

/**
 * Categorize and calculate totals for bills
 */
export const categorizeBillsWithTotals = (bills: BillRecord[]) => {
  const categorizedBills = categorizeBills(bills) as unknown as ReturnType<typeof categorizeBills>;
  const totals = calculateBillTotals(categorizedBills);
  return { categorizedBills, totals };
};

export interface CategorizedBills {
  all: BillRecord[];
  upcoming: BillRecord[];
  overdue: BillRecord[];
  paid: BillRecord[];
  [key: string]: BillRecord[];
}

export interface FilterOptions {
  search?: string;
  urgency?: string;
  envelope?: string;
  amountMin?: string;
  amountMax?: string;
  [key: string]: unknown;
}

/**
 * Filter bills based on view mode and filter options
 */
export const getFilteredBills = (
  categorizedBills: CategorizedBills,
  viewMode: string,
  filterOptions: FilterOptions
): BillRecord[] => {
  const billsToFilter = categorizedBills[viewMode] || categorizedBills.all || [];
  return filterBills(billsToFilter, filterOptions) as unknown as BillRecord[];
};

/**
 * Discover new bills from transactions
 */
export const discoverNewBills = async (
  transactions: TransactionRecord[],
  bills: BillRecord[],
  envelopes: Envelope[],
  onSearchNewBills?: () => void | Promise<void>
): Promise<BillRecord[]> => {
  const suggestions = generateBillSuggestions(transactions, bills, envelopes);
  await onSearchNewBills?.();
  return suggestions;
};

/**
 * Add discovered bills using appropriate method
 */
export const addDiscoveredBills = async (
  billsToAdd: BillRecord[],
  onCreateRecurringBill: ((bill: BillRecord) => void | Promise<void>) | undefined,
  addBill: (bill: BillRecord) => Promise<void>
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

interface UISetters {
  setSelectedBills: (bills: Set<string>) => void;
  setViewMode: (mode: string) => void;
  setShowBillDetail: (bill: BillRecord | null) => void;
  setShowAddBillModal: (show: boolean) => void;
  setEditingBill: (bill: BillRecord | null) => void;
  setShowBulkUpdateModal: (show: boolean) => void;
  setShowDiscoveryModal: (show: boolean) => void;
  setHistoryBill: (bill: BillRecord | null) => void;
  setFilterOptions: (options: FilterOptions) => void;
}

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
 * Process and resolve all bill data from multiple sources
 * Extracted to reduce complexity in main hook
 * Max params justified: Refactored from larger function, parameters represent distinct data sources
 * Further reduction would require major architecture changes (grouping into objects breaks backward compatibility)
 */
export const processAndResolveData = (
  propTransactions: TransactionRecord[],
  tanStackTransactions: TransactionRecord[],
  budgetTransactions: TransactionRecord[],
  propEnvelopes: unknown[],
  tanStackEnvelopes: unknown[],
  budgetEnvelopes: unknown[],
  tanStackBills: unknown[],
  budgetBills: unknown[],
  viewMode: string,
  filterOptions: FilterOptions,
  onUpdateBill?: (bill: BillRecord) => void | Promise<void>,
  updateBillMutation?: (updates: {
    billId: string;
    updates: Record<string, unknown>;
  }) => Promise<void>
  // eslint-disable-next-line max-params
) => {
  const resolvedTransactions: TransactionRecord[] = resolveTransactions(
    propTransactions as TransactionRecord[],
    tanStackTransactions as unknown as TransactionRecord[],
    budgetTransactions as TransactionRecord[]
  );

  const resolvedEnvelopes = resolveEnvelopes(
    propEnvelopes as unknown as Envelope[],
    tanStackEnvelopes as unknown as Envelope[],
    budgetEnvelopes as unknown as Envelope[]
  );

  const billsFromTransactions: BillRecord[] = extractBillsFromTransactions(resolvedTransactions);

  const combinedBills: BillRecord[] = combineBills(
    tanStackBills as unknown as BillRecord[],
    (budgetBills as unknown as BillRecord[]) || [],
    billsFromTransactions
  );

  const processedBills: BillRecord[] = processBills(
    combinedBills,
    onUpdateBill,
    updateBillMutation as unknown as (updates: {
      billId: string;
      updates: Record<string, unknown>;
    }) => Promise<void>
  );

  const { categorizedBills: catBills, totals: billTotals } =
    categorizeBillsWithTotals(processedBills);

  const filtered: BillRecord[] = getFilteredBills(
    catBills as CategorizedBills,
    viewMode,
    filterOptions
  );

  return {
    transactions: resolvedTransactions,
    envelopes: resolvedEnvelopes,
    bills: processedBills,
    categorizedBills: catBills,
    totals: billTotals,
    filteredBills: filtered,
  };
};

/**
 * Handle search new bills action with state management
 */
export const handleSearchNewBills = async (
  params: {
    transactions: TransactionRecord[];
    bills: BillRecord[];
    envelopes: Envelope[];
    onSearchNewBills?: () => void | Promise<void>;
    onError?: (error: string) => void;
  },
  callbacks: {
    setIsSearching: (value: boolean) => void;
    setDiscoveredBills: (bills: BillRecord[]) => void;
    setShowDiscoveryModal: (show: boolean) => void;
  }
): Promise<void> => {
  callbacks.setIsSearching(true);
  try {
    const suggestions = await discoverNewBills(
      params.transactions,
      params.bills,
      params.envelopes,
      params.onSearchNewBills
    );
    callbacks.setDiscoveredBills(suggestions);
    callbacks.setShowDiscoveryModal(true);
  } catch (error) {
    logger.error("Error discovering bills:", error);
    params.onError?.((error as Error).message || "Failed to discover new bills");
  } finally {
    callbacks.setIsSearching(false);
  }
};

/**
 * Handle adding discovered bills with state management
 */
export const handleAddDiscoveredBillsAction = async (
  params: {
    billsToAdd: BillRecord[];
    onCreateRecurringBill?: (bill: BillRecord) => void | Promise<void>;
    addBill: (bill: BillRecord) => Promise<void>;
    onError?: (error: string) => void;
  },
  callbacks: {
    setShowDiscoveryModal: (show: boolean) => void;
    setDiscoveredBills: (bills: BillRecord[]) => void;
  }
): Promise<void> => {
  try {
    await addDiscoveredBills(params.billsToAdd, params.onCreateRecurringBill, params.addBill);
    callbacks.setShowDiscoveryModal(false);
    callbacks.setDiscoveredBills([]);
  } catch (error) {
    logger.error("Error adding discovered bills:", error);
    params.onError?.((error as Error).message || "Failed to add discovered bills");
  }
};
