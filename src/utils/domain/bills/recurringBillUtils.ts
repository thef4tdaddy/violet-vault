import logger from "@/utils/core/common/logger";
import type { Bill } from "@/types/bills";

/**
 * Recurring bill utilities
 * Phase 2 Migration: Compatible with Transaction-based bills via computed fields
 */

/**
 * Calculate the next due date based on payment date and frequency
 * @param {string|Date} paidDate - The date the bill was paid
 * @param {string} frequency - The billing frequency (monthly, biweekly, weekly, quarterly, yearly)
 * @returns {Date|null} The next due date
 */
export const calculateNextDueDate = (paidDate: string | Date, frequency: string): Date | null => {
  try {
    const paid = new Date(paidDate);

    if (isNaN(paid.getTime())) {
      logger.warn("Invalid paid date:", { paidDate: String(paidDate) });
      return null;
    }

    switch (frequency?.toLowerCase()) {
      case "weekly":
        paid.setDate(paid.getDate() + 7);
        break;
      case "biweekly":
        paid.setDate(paid.getDate() + 14);
        break;
      case "monthly":
        paid.setMonth(paid.getMonth() + 1);
        break;
      case "quarterly":
        paid.setMonth(paid.getMonth() + 3);
        break;
      case "yearly":
      case "annual":
        paid.setFullYear(paid.getFullYear() + 1);
        break;
      default:
        logger.warn("Unknown frequency:", { frequency });
        return null;
    }

    return paid;
  } catch (error) {
    logger.error("Error calculating next due date:", error);
    return null;
  }
};

/**
 * Process a bill for recurring logic - resets paid bills when their next cycle arrives
 * Phase 2 Migration: Uses computed dueDate field (from Transaction.date)
 * @param {Object} bill - The bill to process (supports both legacy and Transaction fields)
 * @param {Function} updateBillFn - Function to update the bill in database
 * @returns {Object} The processed bill
 */
export const processRecurringBill = (bill: Bill, updateBillFn: (bill: Bill) => void): Bill => {
  const processedBill = { ...bill };

  // Handle recurring bill logic - reset paid bills when their next cycle arrives
  if (processedBill.isPaid && processedBill.paidDate && processedBill.frequency) {
    const nextDueDate = calculateNextDueDate(processedBill.paidDate, processedBill.frequency);
    const today = new Date();

    // If today is on or after the next due date, reset the bill to unpaid
    if (nextDueDate && today >= nextDueDate) {
      processedBill.isPaid = false;
      // Update both dueDate (legacy) and date (Transaction) for compatibility
      const nextDueDateStr = nextDueDate.toISOString().split("T")[0];
      processedBill.dueDate = nextDueDateStr;
      processedBill.date = nextDueDateStr; // Keep as string for consistency
      processedBill.paidDate = undefined;

      // Update the bill in the database
      if (updateBillFn) {
        try {
          updateBillFn(processedBill);
          logger.info(
            `Reset recurring bill ${processedBill.id} - next due: ${processedBill.dueDate}`
          );
        } catch (error) {
          logger.warn("Failed to reset recurring bill", {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }
  }

  return processedBill;
};

/**
 * Process multiple bills for recurring logic
 * @param {Array} bills - Array of bills to process
 * @param {Function} updateBillFn - Function to update bills in database
 * @returns {Array} Array of processed bills
 */
export const processRecurringBills = (
  bills: Bill[],
  updateBillFn: (bill: Bill) => void
): Bill[] => {
  return bills.map((bill: Bill) => processRecurringBill(bill, updateBillFn));
};
