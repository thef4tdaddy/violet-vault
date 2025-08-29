/**
 * Bill calculation utilities
 * Extracted from BillManager.jsx for Issue #152
 *
 * Pure functions for bill-related calculations, date parsing, and categorization
 */

/**
 * Normalize date strings, particularly handling 2-digit year conversion
 * @param {string|Date} dateInput - Raw date input
 * @returns {string} Normalized date string
 */
export const normalizeBillDate = (dateInput) => {
  if (!dateInput) return null;

  let normalizedDate = dateInput;

  // Handle various date formats and convert 2-digit years to 4-digit
  if (typeof normalizedDate === "string") {
    // Match patterns like MM/DD/YY, MM-DD-YY, etc.
    normalizedDate = normalizedDate.replace(
      /(\d{1,2})[/-](\d{1,2})[/-](\d{2})$/,
      (match, month, day, year) => {
        const fullYear = parseInt(year) <= 30 ? `20${year}` : `19${year}`;
        return `${month}/${day}/${fullYear}`;
      }
    );
  }

  return normalizedDate;
};

/**
 * Calculate days until a bill is due
 * @param {string|Date} dueDate - Bill due date
 * @param {Date} fromDate - Reference date (defaults to today)
 * @returns {number|null} Days until due (negative if overdue), null if invalid date
 */
export const calculateDaysUntilDue = (dueDate, fromDate = new Date()) => {
  if (!dueDate) return null;

  try {
    const normalizedDate = normalizeBillDate(dueDate);
    const due = new Date(normalizedDate);

    // Validate date is valid
    if (isNaN(due.getTime())) {
      return null;
    }

    return Math.ceil((due - fromDate) / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.warn(`Invalid due date: ${dueDate}`, error);
    return null;
  }
};

/**
 * Determine bill urgency based on days until due
 * @param {number} daysUntilDue - Days until bill is due
 * @returns {string} Urgency level: 'overdue', 'urgent', 'soon', 'normal'
 */
export const calculateBillUrgency = (daysUntilDue) => {
  if (daysUntilDue === null || daysUntilDue === undefined) return "normal";

  if (daysUntilDue < 0) return "overdue";
  if (daysUntilDue <= 3) return "urgent";
  if (daysUntilDue <= 7) return "soon";
  return "normal";
};

/**
 * Process a single bill to add calculated fields
 * @param {Object} bill - Raw bill object
 * @param {Function} onUpdate - Callback for bill updates (for recurring bills)
 * @returns {Object} Processed bill with daysUntilDue and urgency
 */
export const processBillCalculations = (bill) => {
  const daysUntilDue = calculateDaysUntilDue(bill.dueDate);
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
export const categorizeBills = (bills) => {
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
export const calculateBillTotals = (categorizedBills) => {
  const overdueTotal = categorizedBills.overdue.reduce((sum, b) => sum + Math.abs(b.amount), 0);
  const upcomingTotal = categorizedBills.upcoming.reduce((sum, b) => sum + Math.abs(b.amount), 0);
  const paidTotal = categorizedBills.paid.reduce((sum, b) => sum + Math.abs(b.amount), 0);

  return {
    overdue: overdueTotal,
    upcoming: upcomingTotal,
    paid: paidTotal,
    total: overdueTotal + upcomingTotal + paidTotal,
  };
};

/**
 * Filter bills based on various criteria
 * @param {Array} bills - Bills to filter
 * @param {Object} filterOptions - Filter criteria
 * @returns {Array} Filtered bills
 */
export const filterBills = (bills, filterOptions = {}) => {
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
    filtered = filtered.filter((bill) => Math.abs(bill.amount) >= filterOptions.amountMin);
  }

  if (filterOptions.amountMax !== undefined) {
    filtered = filtered.filter((bill) => Math.abs(bill.amount) <= filterOptions.amountMax);
  }

  return filtered;
};
