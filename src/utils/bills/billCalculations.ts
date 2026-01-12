/**
 * Bill calculation utilities
 * Extracted from BillManager.jsx for Issue #152
 *
 * Pure functions for bill-related calculations, date parsing, and categorization
 * 
 * Phase 2 Migration Note: This utility supports both legacy bill fields and
 * Transaction-based bills via computed properties:
 * - name/description (both supported)
 * - dueDate/date (both supported)
 * - Works with Transaction-based bills that have computed backward-compatible fields
 */
import logger from "../common/logger";

interface Bill {
  id: string;
  name?: string;
  description?: string;
  provider?: string;
  amount?: number;
  monthlyAmount?: number;
  dueDate?: string | Date; // Legacy field or computed from date
  date?: string | Date; // Transaction field or computed from dueDate
  paidDate?: string | Date;
  isPaid?: boolean;
  envelopeId?: string;
  daysUntilDue?: number;
  urgency?: string;
  [key: string]: unknown;
}

interface FilterOptions {
  search?: string;
  urgency?: string;
  envelope?: string;
  amountMin?: string | number;
  amountMax?: string | number;
  [key: string]: unknown;
}

interface CategorizedBills {
  upcoming: Bill[];
  overdue: Bill[];
  paid: Bill[];
  all: Bill[];
}

/**
 * Convert two-digit year to four-digit year
 */
const TWO_DIGIT_YEAR_THRESHOLD = 30;

const convertTwoDigitYear = (year: string): string => {
  return parseInt(year) <= TWO_DIGIT_YEAR_THRESHOLD ? `20${year}` : `19${year}`;
};

/**
 * Parse date string in YYYY-MM-DD format
 */
const parseYYYYMMDD = (dateStr: string): Date => {
  const parts = dateStr.split("-");
  return new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
};

/**
 * Parse date string in MM/DD/YYYY or MM-DD-YYYY format
 */
const parseMMDDYYYY = (dateStr: string): Date => {
  const parts = dateStr.split(/[/-]/);
  return new Date(Date.UTC(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1])));
};

/**
 * Format Date object as YYYY-MM-DD
 */
const formatAsYYYYMMDD = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Parse date string based on format
 */
const parseDateString = (dateStr: string): Date => {
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return parseYYYYMMDD(dateStr);
  }
  if (dateStr.match(/^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/)) {
    return parseMMDDYYYY(dateStr);
  }
  return new Date(dateStr);
};

/**
 * Normalize date strings to YYYY-MM-DD format
 * @param {string|Date} dateInput - Raw date input
 * @returns {string} Normalized date string in YYYY-MM-DD format, or empty string if invalid
 */
export const normalizeBillDate = (dateInput: string | Date): string => {
  if (!dateInput) return "";

  try {
    // Handle Date object
    if (dateInput instanceof Date) {
      return dateInput.toISOString().split("T")[0];
    }

    // Handle ISO date strings
    if (typeof dateInput === "string" && dateInput.includes("T")) {
      return dateInput.split("T")[0];
    }

    // Handle various date formats
    if (typeof dateInput === "string") {
      // Convert 2-digit years to 4-digit
      const normalizedStr = dateInput.replace(
        /^(\d{1,2})[/-](\d{1,2})[/-](\d{2})$/,
        (_match, month, day, year) => {
          return `${month}/${day}/${convertTwoDigitYear(year)}`;
        }
      );

      const parsedDate = parseDateString(normalizedStr);

      if (isNaN(parsedDate.getTime())) {
        logger.warn(`Invalid date format: ${dateInput}`);
        return "";
      }

      return formatAsYYYYMMDD(parsedDate);
    }

    return "";
  } catch (error) {
    logger.warn(`Error normalizing date: ${dateInput}`, {
      error: error instanceof Error ? error.message : String(error),
    });
    return "";
  }
};

/**
 * Calculate days until a bill is due
 * @param {string|Date} dueDate - Bill due date
 * @param {Date} fromDate - Reference date (defaults to today)
 * @returns {number|null} Days until due (negative if overdue), null if invalid date
 */
export const calculateDaysUntilDue = (
  dueDate: string | Date | undefined,
  fromDate: Date = new Date()
): number | null => {
  if (!dueDate) return null;

  try {
    const normalizedDate = normalizeBillDate(dueDate);
    if (!normalizedDate) return null;

    const due = new Date(normalizedDate);

    // Validate date is valid
    if (isNaN(due.getTime())) {
      return null;
    }

    // Normalize both dates to UTC start of day for consistent calculation
    const from = new Date(fromDate);
    from.setUTCHours(0, 0, 0, 0);
    due.setUTCHours(0, 0, 0, 0);

    return Math.ceil((due.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  } catch (error) {
    logger.warn(`Invalid due date: ${dueDate}`, {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
};

/**
 * Determine bill urgency based on days until due
 * @param {number} daysUntilDue - Days until bill is due
 * @returns {string} Urgency level: 'overdue', 'urgent', 'soon', 'normal'
 */
export const calculateBillUrgency = (daysUntilDue: number | null | undefined): string => {
  if (daysUntilDue === null || daysUntilDue === undefined) return "normal";

  if (daysUntilDue < 0) return "overdue";
  if (daysUntilDue <= 2) return "urgent";
  if (daysUntilDue <= 7) return "soon";
  return "normal";
};

/**
 * Process a single bill to add calculated fields
 * Phase 2 Migration: Compatible with Transaction-based bills via computed fields
 * @param {Object} bill - Raw bill object (supports both legacy and Transaction fields)
 * @param {Date} fromDate - Reference date (defaults to today)
 * @returns {Object} Processed bill with daysUntilDue and urgency
 */
export const processBillCalculations = (bill: Bill, fromDate: Date = new Date()): Bill => {
  // Support both dueDate (legacy) and date (Transaction) fields
  const dueDateValue = bill.dueDate || bill.date;
  const daysUntilDue = calculateDaysUntilDue(dueDateValue, fromDate);
  const urgency = calculateBillUrgency(daysUntilDue);

  return {
    ...bill,
    // Ensure required fields have valid values
    amount: typeof bill.amount === "number" ? bill.amount : 0,
    // Support both description (Transaction) and name/provider (legacy)
    // Use nullish coalescing to handle empty strings correctly
    description: bill.description ?? bill.name ?? bill.provider ?? `Bill ${bill.id}`,
    isPaid: Boolean(bill.isPaid),
    daysUntilDue: daysUntilDue ?? undefined,
    urgency,
  };
};

/**
 * Categorize bills into upcoming, overdue, and paid groups
 * @param {Array} bills - Array of processed bills
 * @returns {Object} Categorized bills object with sorting applied
 */
export const categorizeBills = (bills: Bill[]): CategorizedBills => {
  const upcomingBills = bills.filter((b) => !b.isPaid && (b.daysUntilDue ?? 0) >= 0);
  const overdueBills = bills.filter((b) => !b.isPaid && (b.daysUntilDue ?? 0) < 0);
  const paidBills = bills.filter((b) => b.isPaid);

  return {
    upcoming: upcomingBills.sort((a, b) => (a.daysUntilDue ?? 999) - (b.daysUntilDue ?? 999)),
    overdue: overdueBills.sort((a, b) => (a.daysUntilDue ?? 0) - (b.daysUntilDue ?? 0)),
    paid: paidBills.sort(
      (a, b) =>
        new Date(b.paidDate || b.date || 0).getTime() -
        new Date(a.paidDate || a.date || 0).getTime()
    ),
    all: bills,
  };
};

/**
 * Calculate bill totals for different categories
 * @param {Object} categorizedBills - Output from categorizeBills()
 * @returns {Object} Totals object with overdue, upcoming, and paid amounts
 */
export const calculateBillTotals = (categorizedBills: CategorizedBills) => {
  const overdueTotal = (categorizedBills.overdue || []).reduce(
    (sum, b) => sum + Math.abs(b.amount || b.monthlyAmount || 0),
    0
  );
  const upcomingTotal = (categorizedBills.upcoming || []).reduce(
    (sum, b) => sum + Math.abs(b.amount || b.monthlyAmount || 0),
    0
  );
  const paidTotal = (categorizedBills.paid || []).reduce(
    (sum, b) => sum + Math.abs(b.amount || b.monthlyAmount || 0),
    0
  );

  return {
    overdue: overdueTotal,
    upcoming: upcomingTotal,
    paid: paidTotal,
    total: (categorizedBills.all || []).reduce(
      (sum, b) => sum + Math.abs(b.amount || b.monthlyAmount || 0),
      0
    ),
    // Add counts for summary cards
    overdueCount: (categorizedBills.overdue || []).length,
    upcomingCount: (categorizedBills.upcoming || []).length,
    paidCount: (categorizedBills.paid || []).length,
    totalCount: (categorizedBills.all || []).length,
  };
};

/**
 * Filter bills based on various criteria
 * @param {Array} bills - Bills to filter
 * @param {Object} filterOptions - Filter criteria
 * @returns {Array} Filtered bills
 */
export const filterBills = (bills: Bill[], filterOptions: FilterOptions = {}): Bill[] => {
  let filtered = [...bills];

  if (filterOptions.search) {
    const searchTerm = filterOptions.search.toLowerCase();
    filtered = filtered.filter(
      (bill) =>
        (bill.description || "").toLowerCase().includes(searchTerm) ||
        (bill.provider || "").toLowerCase().includes(searchTerm) ||
        (bill.name || "").toLowerCase().includes(searchTerm)
    );
  }

  if (filterOptions.urgency && filterOptions.urgency !== "all") {
    filtered = filtered.filter((bill) => bill.urgency === filterOptions.urgency);
  }

  if (filterOptions.envelope) {
    filtered = filtered.filter((bill) => bill.envelopeId === filterOptions.envelope);
  }

  if (filterOptions.amountMin !== undefined) {
    const minAmount = parseFloat(String(filterOptions.amountMin));
    if (!isNaN(minAmount)) {
      filtered = filtered.filter((bill) => Math.abs(bill.amount ?? 0) >= minAmount);
    }
  }

  if (filterOptions.amountMax !== undefined) {
    const maxAmount = parseFloat(String(filterOptions.amountMax));
    if (!isNaN(maxAmount)) {
      filtered = filtered.filter((bill) => Math.abs(bill.amount ?? 0) <= maxAmount);
    }
  }

  return filtered;
};
