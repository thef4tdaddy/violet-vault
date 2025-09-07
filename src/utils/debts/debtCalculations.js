// Debt calculation utilities to prevent temporal dead zone issues
// This file contains pure functions that can be safely imported and used anywhere

import {
  DEBT_TYPES,
  DEBT_STATUS,
  PAYMENT_FREQUENCIES,
  COMPOUND_FREQUENCIES,
} from "../../constants/debts";

// Import separated debt calculation functions
import { calculateNextPaymentDate } from "./calculations/nextPaymentDate";
import { calculatePayoffProjection } from "./calculations/payoffProjection";
import { calculateInterestPortion } from "./calculations/interestCalculation";

// Re-export the imported functions for backward compatibility
export {
  calculateNextPaymentDate,
  calculatePayoffProjection,
  calculateInterestPortion,
};

/**
 * Convert debt payment frequency to bill frequency
 * @param {string} debtFrequency - Debt payment frequency
 * @returns {string} Bill frequency
 */
export function convertPaymentFrequency(debtFrequency) {
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
 * @param {string} debtType - Type of debt
 * @param {Object} providedTerms - Terms provided by user
 * @returns {Object} Specialized terms
 */
export function createSpecialTerms(debtType, providedTerms = {}) {
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
 * @param {Object} debt - Base debt object
 * @param {Object} relatedBill - Related bill object
 * @param {Object} relatedEnvelope - Related envelope object
 * @param {Array} relatedTransactions - Related transactions
 * @returns {Object} Enriched debt object
 */
export function enrichDebt(
  debt,
  relatedBill = null,
  relatedEnvelope = null,
  relatedTransactions = [],
) {
  // Calculate next payment date
  const nextPaymentDate = calculateNextPaymentDate(debt);

  // Calculate payoff projection
  const payoffInfo = calculatePayoffProjection(debt);

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
 * @param {Array} debts - Array of debt objects
 * @param {number} daysAhead - Days to look ahead
 * @returns {Array} Array of debts with upcoming payments
 */
export function getUpcomingPayments(debts, daysAhead = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + daysAhead);

  return debts
    .filter(
      (debt) => debt.status === DEBT_STATUS.ACTIVE && debt.nextPaymentDate,
    )
    .filter((debt) => new Date(debt.nextPaymentDate) <= cutoffDate)
    .sort((a, b) => new Date(a.nextPaymentDate) - new Date(b.nextPaymentDate));
}

/**
 * Calculate debt-to-income ratio
 * @param {Array} debts - Array of debt objects
 * @param {number} monthlyIncome - Monthly income
 * @returns {number} Debt-to-income ratio as percentage
 */
export function calculateDebtToIncomeRatio(debts, monthlyIncome) {
  if (!monthlyIncome || monthlyIncome <= 0) {
    return 0;
  }

  const totalMonthlyPayments = debts
    .filter((debt) => debt.status === DEBT_STATUS.ACTIVE)
    .reduce((sum, debt) => {
      const payment = debt.minimumPayment || 0;
      // Convert payment to monthly if needed
      switch (debt.paymentFrequency) {
        case PAYMENT_FREQUENCIES.WEEKLY:
          return sum + (payment * 52) / 12;
        case PAYMENT_FREQUENCIES.BIWEEKLY:
          return sum + (payment * 26) / 12;
        case PAYMENT_FREQUENCIES.QUARTERLY:
          return sum + payment / 3;
        case PAYMENT_FREQUENCIES.ANNUALLY:
          return sum + payment / 12;
        default: // monthly
          return sum + payment;
      }
    }, 0);

  return (totalMonthlyPayments / monthlyIncome) * 100;
}
