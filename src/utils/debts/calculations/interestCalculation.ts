/**
 * Interest calculation utilities for debt management
 * Isolated to prevent temporal dead zone issues during minification
 */

interface Debt {
  interestRate?: number;
  currentBalance?: number;
  [key: string]: unknown;
}

/**
 * Calculate interest portion of a payment
 * @param debt - The debt object
 * @param paymentAmount - Payment amount
 * @returns Interest portion of payment
 */
export function calculateInterestPortion(debt: Debt, paymentAmount: number): number {
  if (!debt.interestRate || !debt.currentBalance) {
    return 0;
  }

  const monthlyRate = debt.interestRate / 100 / 12;
  const interestPortion = debt.currentBalance * monthlyRate;

  return Math.min(interestPortion, paymentAmount);
}
