// Debt calculation utilities to prevent temporal dead zone issues
// This file contains pure functions that can be safely imported and used anywhere

import type {
  DebtAccount,
  DebtType,
  PaymentFrequency,
  DebtSpecialTerms,
  PayoffProjection,
} from "@/types/debt";

import { DEBT_TYPES, DEBT_STATUS, PAYMENT_FREQUENCIES } from "@/constants/debts";

import { Bill, Envelope, Transaction } from "@/db/types";

// Import separated debt calculation functions
import { calculateNextPaymentDate } from "./calculations/nextPaymentDate";
import { calculatePayoffProjection } from "./calculations/payoffProjection";
import { calculateInterestPortion } from "./calculations/interestCalculation";

// Re-export the imported functions for backward compatibility
export { calculateNextPaymentDate, calculatePayoffProjection, calculateInterestPortion };

/**
 * Convert debt payment frequency to bill frequency
 */
export function convertPaymentFrequency(debtFrequency: PaymentFrequency): string {
  switch (debtFrequency) {
    case PAYMENT_FREQUENCIES.WEEKLY:
      return "weekly";
    case PAYMENT_FREQUENCIES.BIWEEKLY:
      return "biweekly";
    case PAYMENT_FREQUENCIES.QUARTERLY:
      return "quarterly";
    case PAYMENT_FREQUENCIES.ANNUALLY:
      return "yearly";
    default:
      return "monthly";
  }
}

/**
 * Create specialized terms based on debt type
 */
export function createSpecialTerms(
  debtType: DebtType,
  providedTerms: DebtSpecialTerms = {}
): DebtSpecialTerms {
  switch (debtType) {
    case DEBT_TYPES.MORTGAGE:
      return {
        pmi: providedTerms.pmi || 0,
        escrowPayment: providedTerms.escrowPayment || 0,
        ...providedTerms,
      };
    case DEBT_TYPES.CREDIT_CARD:
      return {
        creditLimit: providedTerms.creditLimit || 0,
        cashAdvanceLimit: providedTerms.cashAdvanceLimit || 0,
        ...providedTerms,
      };
    case DEBT_TYPES.CHAPTER13:
      return {
        planDuration: providedTerms.planDuration || 60, // months
        trusteePayment: providedTerms.trusteePayment || 0,
        priorityAmount: providedTerms.priorityAmount || 0,
        ...providedTerms,
      };
    default:
      return providedTerms;
  }
}

/**
 * Enrich a debt with calculated properties
 */
export function enrichDebt(
  debt: DebtAccount,
  relatedBill: Bill | null = null,
  relatedEnvelope: Envelope | null = null,
  relatedTransactions: Transaction[] = []
): DebtAccount {
  // Calculate next payment date (provide null for relatedBill parameter)
  const nextPaymentDateResult = calculateNextPaymentDate(debt, null);
  // Convert null to undefined to match DebtAccount.nextPaymentDate type
  const nextPaymentDate = nextPaymentDateResult ?? undefined;

  // Calculate payoff projection
  const payoffInfo = calculatePayoffProjection(debt) as unknown as PayoffProjection;

  return {
    ...debt,
    relatedBill,
    relatedEnvelope,
    relatedTransactions,
    nextPaymentDate,
    payoffInfo,
  };
}

/**
 * Calculate upcoming payments across debts
 */
export function getUpcomingPayments(debts: DebtAccount[], daysAhead: number = 30): DebtAccount[] {
  const today = new Date();
  const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  return debts.filter((debt) => {
    if (!debt.nextPaymentDate) return false;
    const paymentDate = new Date(debt.nextPaymentDate);
    return paymentDate >= today && paymentDate <= futureDate;
  });
}

/**
 * Calculate debt-to-income ratio
 */
export function calculateDebtToIncomeRatio(debts: DebtAccount[], monthlyIncome: number): number {
  if (monthlyIncome <= 0) return 0;

  const totalMonthlyPayments = debts
    .filter((debt) => debt.status === DEBT_STATUS.ACTIVE)
    .reduce((sum, debt) => sum + debt.minimumPayment, 0);

  return (totalMonthlyPayments / monthlyIncome) * 100;
}
