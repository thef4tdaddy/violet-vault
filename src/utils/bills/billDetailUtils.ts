/**
 * Utility functions for bill detail calculations and formatting
 * Extracted from components following Issue #152 pattern
 */

interface Bill {
  status?: string;
  dueDate?: string;
  paymentHistory?: Array<{ amount?: number }>;
}

/**
 * Calculate the next due date for a recurring bill
 * @param {Date} currentDueDate - Current due date
 * @param {string} frequency - Bill frequency (monthly, weekly, etc.)
 * @param {number} customFrequency - Custom frequency multiplier
 * @returns {Date|null} Next due date or null if not applicable
 */
export const calculateNextDueDate = (
  currentDueDate: Date | string,
  frequency: string,
  customFrequency = 1
): Date | null => {
  if (!currentDueDate || frequency === "once") return null;

  const current = new Date(currentDueDate);
  const next = new Date(current);

  switch (frequency) {
    case "weekly":
      next.setDate(current.getDate() + 7 * customFrequency);
      break;
    case "biweekly":
      next.setDate(current.getDate() + 14 * customFrequency);
      break;
    case "monthly":
      next.setMonth(current.getMonth() + customFrequency);
      break;
    case "quarterly":
      next.setMonth(current.getMonth() + 3 * customFrequency);
      break;
    case "biannual":
      next.setMonth(current.getMonth() + 6 * customFrequency);
      break;
    case "annual":
      next.setFullYear(current.getFullYear() + customFrequency);
      break;
    default:
      return null;
  }

  return next;
};

/**
 * Get status icon component name based on bill status
 * @param {string} status - Bill status
 * @param {boolean} isOverdue - Whether bill is overdue
 * @param {boolean} isDueSoon - Whether bill is due soon
 * @returns {string} Icon component name
 */
export const getBillStatusIcon = (
  status: string,
  isOverdue: boolean,
  isDueSoon: boolean
): string => {
  if (status === "paid") return "CheckCircle";
  if (isOverdue) return "AlertTriangle";
  if (isDueSoon) return "Clock";
  return "Bell";
};

/**
 * Format bill amount for display
 * @param {number|string} amount - Bill amount
 * @returns {string} Formatted amount string
 */
export const formatBillAmount = (amount: number | string): string => {
  const numAmount = parseFloat(String(amount) || "0");
  return numAmount.toFixed(2);
};

/**
 * Get bill payment statistics
 * @param {Object} bill - Bill object
 * @returns {Object} Payment statistics
 */
export const getBillPaymentStats = (bill: Bill) => {
  if (!bill.paymentHistory || !Array.isArray(bill.paymentHistory)) {
    return {
      totalPaid: 0,
      paymentCount: 0,
      lastPayment: null,
      averagePayment: 0,
    };
  }

  const payments = bill.paymentHistory;
  const totalPaid = payments.reduce((sum: number, payment) => sum + (payment.amount || 0), 0);
  const paymentCount = payments.length;
  const lastPayment = payments.length > 0 ? payments[payments.length - 1] : null;
  const averagePayment = paymentCount > 0 ? totalPaid / paymentCount : 0;

  return {
    totalPaid,
    paymentCount,
    lastPayment,
    averagePayment,
  };
};

/**
 * Check if bill needs attention (overdue or due soon)
 * @param {Object} bill - Bill object
 * @returns {boolean} Whether bill needs attention
 */
export const billNeedsAttention = (bill: Bill): boolean => {
  if (bill.status === "paid") return false;
  if (!bill.dueDate) return false;

  const daysUntilDue = Math.ceil(
    (new Date(bill.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysUntilDue < 0 || (daysUntilDue <= 3 && daysUntilDue >= 0);
};

/**
 * Get bill urgency level for sorting/prioritization
 * @param {Object} bill - Bill object
 * @returns {number} Urgency score (higher = more urgent)
 */
export const getBillUrgencyScore = (bill: Bill): number => {
  if (bill.status === "paid") return 0;
  if (!bill.dueDate) return 1;

  const daysUntilDue = Math.ceil(
    (new Date(bill.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilDue < 0) return 100 + Math.abs(daysUntilDue); // Overdue bills get highest priority
  if (daysUntilDue <= 3) return 50 + (3 - daysUntilDue); // Due soon bills
  if (daysUntilDue <= 7) return 25 + (7 - daysUntilDue); // Due this week

  return Math.max(1, 20 - daysUntilDue); // Future bills, lower priority as they get further out
};
