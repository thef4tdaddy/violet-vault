/**
 * Interest calculation utilities for debt management
 * Isolated to prevent temporal dead zone issues during minification
 */

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
