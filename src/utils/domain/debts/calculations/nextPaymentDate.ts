/**
 * Next payment date calculations for debt management
 * Isolated to prevent temporal dead zone issues during minification
 */
import { PAYMENT_FREQUENCIES } from "../../../constants/debts";

interface PaymentHistoryEntry {
  date: string | Date;
  amount?: number;
}

interface Debt {
  paymentDueDate?: string;
  nextPaymentDate?: string | Date;
  paymentFrequency?: string;
  paymentHistory?: PaymentHistoryEntry[];
}

interface RelatedBill {
  dueDate?: string;
}

/**
 * Calculate next payment date for a debt
 * @param debt - The debt object
 * @param relatedBill - Related bill object (optional)
 * @returns ISO date string or null
 */
export function calculateNextPaymentDate(
  debt: Debt,
  relatedBill?: RelatedBill | null
): string | null {
  // Use bill due date if available
  if (relatedBill?.dueDate) {
    return relatedBill.dueDate;
  }

  // Use precomputed debt payment dates when available
  if (debt.paymentDueDate) {
    return debt.paymentDueDate;
  }

  if (debt.nextPaymentDate) {
    return typeof debt.nextPaymentDate === "string"
      ? debt.nextPaymentDate
      : debt.nextPaymentDate.toISOString();
  }

  // Calculate based on payment frequency and last payment
  const lastPayment = debt.paymentHistory?.[debt.paymentHistory.length - 1];
  if (!lastPayment) {
    return null;
  }

  const lastPaymentDate = new Date(lastPayment.date);
  const nextDate = new Date(lastPaymentDate);

  switch (debt.paymentFrequency) {
    case PAYMENT_FREQUENCIES.WEEKLY:
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case PAYMENT_FREQUENCIES.BIWEEKLY:
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case PAYMENT_FREQUENCIES.QUARTERLY:
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case PAYMENT_FREQUENCIES.ANNUALLY:
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    default: // monthly
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
  }

  return nextDate.toISOString();
}
