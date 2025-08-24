// Debt calculation utilities to prevent temporal dead zone issues
// This file contains pure functions that can be safely imported and used anywhere

import {
  DEBT_TYPES,
  DEBT_STATUS,
  PAYMENT_FREQUENCIES,
  COMPOUND_FREQUENCIES,
} from "../constants/debts";
import logger from "./logger.js";

/**
 * Calculate next payment date for a debt
 * @param {Object} debt - The debt object
 * @param {Object} relatedBill - Related bill object (optional)
 * @returns {string|null} ISO date string or null
 */
export function calculateNextPaymentDate(debt, relatedBill) {
  // Use bill due date if available
  if (relatedBill?.dueDate) {
    return relatedBill.dueDate;
  }

  // Use debt payment due date
  if (debt.paymentDueDate) {
    return debt.paymentDueDate;
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

/**
 * Calculate payoff projection for a debt
 * @param {Object} debt - The debt object
 * @returns {Object} Payoff projection with monthsToPayoff, totalInterest, payoffDate
 */
export function calculatePayoffProjection(debt) {
  // Ensure we have valid numeric values
  const currentBalance = parseFloat(debt.currentBalance) || 0;
  const minimumPayment = parseFloat(debt.minimumPayment) || 0;
  const interestRate = parseFloat(debt.interestRate) || 0;

  // Return null projection if missing essential data
  if (currentBalance <= 0 || minimumPayment <= 0 || interestRate <= 0) {
    return {
      monthsToPayoff: null,
      totalInterest: null,
      payoffDate: null,
    };
  }

  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayment = minimumPayment;
  const balance = currentBalance;

  // Check if payment covers interest (prevents infinite payoff scenarios)
  const monthlyInterest = balance * monthlyRate;
  if (monthlyPayment <= monthlyInterest) {
    return {
      monthsToPayoff: null,
      totalInterest: null,
      payoffDate: null,
    };
  }

  // Calculate months to payoff using amortization formula
  let monthsToPayoffCalculation;
  try {
    monthsToPayoffCalculation = Math.ceil(
      -Math.log(1 - (balance * monthlyRate) / monthlyPayment) /
        Math.log(1 + monthlyRate),
    );
  } catch (error) {
    return {
      monthsToPayoff: null,
      totalInterest: null,
      payoffDate: null,
    };
  }

  const monthsToPayoff = monthsToPayoffCalculation;
  const totalPayments = monthlyPayment * monthsToPayoff;
  const totalInterest = totalPayments - balance;

  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + monthsToPayoff);

  // Validate all calculations are finite numbers
  const validMonthsToPayoff =
    isFinite(monthsToPayoff) && monthsToPayoff > 0 ? monthsToPayoff : null;
  const validTotalInterest =
    isFinite(totalInterest) && totalInterest >= 0 ? totalInterest : null;
  const validPayoffDate = validMonthsToPayoff ? payoffDate.toISOString() : null;

  return {
    monthsToPayoff: validMonthsToPayoff,
    totalInterest: validTotalInterest,
    payoffDate: validPayoffDate,
  };
}

/**
 * Calculate interest portion of a payment
 * @param {Object} debt - The debt object
 * @param {number} paymentAmount - Payment amount
 * @returns {number} Interest portion of payment
 */
export function calculateInterestPortion(debt, paymentAmount) {
  if (!debt.interestRate || !debt.currentBalance) {
    return 0;
  }

  const monthlyRate = debt.interestRate / 100 / 12;
  const interestPortion = debt.currentBalance * monthlyRate;

  return Math.min(interestPortion, paymentAmount);
}

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
  try {
    const nextPaymentDate = calculateNextPaymentDate(debt, relatedBill);
    // const payoffInfo = calculatePayoffProjection(debt); // Temporarily disabled - still getting TDZ error
    const payoffInfo = {
      monthsToPayoff: null,
      totalInterest: null,
      payoffDate: null,
    };

    return {
      ...debt,
      relatedBill,
      relatedEnvelope,
      relatedTransactions,
      nextPaymentDate,
      payoffInfo,
    };
  } catch (error) {
    logger.error("Error enriching debt", error, {
      debtId: debt.id,
      debtName: debt.name,
    });

    // Return debt with null enrichment on error
    return {
      ...debt,
      relatedBill,
      relatedEnvelope,
      relatedTransactions,
      nextPaymentDate: null,
      payoffInfo: {
        monthsToPayoff: null,
        totalInterest: null,
        payoffDate: null,
      },
    };
  }
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
