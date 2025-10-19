/**
 * Bill calculation utilities
 * Extracted from BillManager.jsx for Issue #152
 *
 * Pure functions for bill-related calculations, date parsing, and categorization
 */
import logger from "../common/logger";

interface Bill {
  id: string;
  name?: string;
  description?: string;
  provider?: string;
  amount?: number;
  monthlyAmount?: number;
  dueDate?: string | Date;
  date?: string | Date;
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
 * Normalize date strings to YYYY-MM-DD format
 * @param {string|Date} dateInput - Raw date input
 * @returns {string} Normalized date string in YYYY-MM-DD format, or empty string if invalid
 */
export const normalizeBillDate = (dateInput: string | Date): string => {
  if (!dateInput) return "";

  try {
    let dateStr = dateInput;

    // Handle Date object
    if (dateInput instanceof Date) {
      return dateInput.toISOString().split("T")[0];
    }

    // Handle ISO date strings
    if (typeof dateStr === "string" && dateStr.includes("T")) {
      return dateStr.split("T")[0];
    }

    // Handle various date formats and convert 2-digit years to 4-digit
    if (typeof dateStr === "string") {
      // Handle MM/DD/YY, MM-DD-YY patterns (but not YYYY-MM-DD)
      dateStr = dateStr.replace(
        /^(\d{1,2})[/-](\d{1,2})[/-](\d{2})$/,
        (match, month, day, year) => {
          const fullYear = parseInt(year) <= 30 ? `20${year}` : `19${year}`;
          return `${month}/${day}/${fullYear}`;
        }
      );

      // Parse different formats
      let parsedDate;
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Already in YYYY-MM-DD format - use UTC to avoid timezone issues
        const parts = dateStr.split("-");
        parsedDate = new Date(
          Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
        );
      } else if (dateStr.match(/^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/)) {
        // MM/DD/YYYY or MM-DD-YYYY format
        const parts = dateStr.split(/[/-]/);
        parsedDate = new Date(
          Date.UTC(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]))
        );
      } else {
        // Try direct parsing
        parsedDate = new Date(dateStr);
      }

      if (isNaN(parsedDate.getTime())) {
        logger.warn(`Invalid date format: ${dateInput}`);
        return "";
      }

      // Format as YYYY-MM-DD
      const year = parsedDate.getUTCFullYear();
      const month = String(parsedDate.getUTCMonth() + 1).padStart(2, "0");
      const day = String(parsedDate.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    return "";
  } catch (error) {
    logger.warn(`Error normalizing date: ${dateInput}`, error);
    return "";
  }
};

/**
 * Calculate days until a bill is due
 * @param {string|Date} dueDate - Bill due date
 * @param {Date} fromDate - Reference date (defaults to today)
 * @returns {number|null} Days until due (negative if overdue), null if invalid date
 */
export const calculateDaysUntilDue = (dueDate: string | Date, fromDate: Date = new Date()): number | null => {
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

    return Math.ceil((due - from) / (1000 * 60 * 60 * 24));
  } catch (error) {
    logger.warn(`Invalid due date: ${dueDate}`, error);
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
 * @param {Object} bill - Raw bill object
 * @param {Date} fromDate - Reference date (defaults to today)
 * @returns {Object} Processed bill with daysUntilDue and urgency
 */
export const processBillCalculations = (bill: Bill, fromDate: Date = new Date()): Bill => {
  const daysUntilDue = calculateDaysUntilDue(bill.dueDate, fromDate);
  const urgency = calculateBillUrgency(daysUntilDue);

  return {
    ...bill,
    // Ensure required fields have valid values
    amount: typeof bill.amount === "number" ? bill.amount : 0,
    description: bill.description || bill.provider || `Bill ${bill.id}`,
    isPaid: Boolean(bill.isPaid),
    daysUntilDue,
    urgency,
  };
};

/**
 * Categorize bills into upcoming, overdue, and paid groups
 * @param {Array} bills - Array of processed bills
 * @returns {Object} Categorized bills object with sorting applied
 */
export const categorizeBills = (bills: Bill[]): CategorizedBills => {
  const upcomingBills = bills.filter((b) => !b.isPaid && b.daysUntilDue >= 0);
  const overdueBills = bills.filter((b) => !b.isPaid && b.daysUntilDue < 0);
  const paidBills = bills.filter((b) => b.isPaid);

  return {
    upcoming: upcomingBills.sort((a, b) => (a.daysUntilDue || 999) - (b.daysUntilDue || 999)),
    overdue: overdueBills.sort((a, b) => (a.daysUntilDue || 0) - (b.daysUntilDue || 0)),
    paid: paidBills.sort((a, b) => new Date(b.paidDate || b.date) - new Date(a.paidDate || a.date)),
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
    const minAmount = parseFloat(filterOptions.amountMin);
    if (!isNaN(minAmount)) {
      filtered = filtered.filter((bill) => Math.abs(bill.amount) >= minAmount);
    }
  }

  if (filterOptions.amountMax !== undefined) {
    const maxAmount = parseFloat(filterOptions.amountMax);
    if (!isNaN(maxAmount)) {
      filtered = filtered.filter((bill) => Math.abs(bill.amount) <= maxAmount);
    }
  }

  return filtered;
};
