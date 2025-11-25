/**
 * Payoff projection calculations for debt management
 * Isolated to prevent temporal dead zone issues during minification
 */

/**
 * Calculate payoff projection for a debt
 * @param {Object} debt - The debt object
 * @returns {Object} Payoff projection with monthsToPayoff, totalInterest, payoffDate
 */
interface DebtInput {
  currentBalance: number | string;
  minimumPayment: number | string;
  interestRate: number | string;
}

export function calculatePayoffProjection(debt: DebtInput) {
  // Ensure we have valid numeric values
  const currentBalance = parseFloat(String(debt.currentBalance)) || 0;
  const minimumPayment = parseFloat(String(debt.minimumPayment)) || 0;
  const interestRate = parseFloat(String(debt.interestRate)) || 0;

  // Return null projection if missing essential data
  if (currentBalance <= 0 || minimumPayment <= 0 || interestRate <= 0) {
    return {
      monthsToPayoff: null,
      totalInterest: null,
      payoffDate: null,
    };
  }

  const monthlyRate = interestRate / 100 / 12;
  const monthlyInterest = currentBalance * monthlyRate;

  // Check if payment covers interest (prevents infinite payoff scenarios)
  if (minimumPayment <= monthlyInterest) {
    return {
      monthsToPayoff: null,
      totalInterest: null,
      payoffDate: null,
    };
  }

  // Calculate months to payoff using amortization formula
  let calculatedMonths;
  try {
    const ratio = (currentBalance * monthlyRate) / minimumPayment;
    const logValue = 1 - ratio;

    if (logValue <= 0) {
      return {
        monthsToPayoff: null,
        totalInterest: null,
        payoffDate: null,
      };
    }

    calculatedMonths = Math.ceil(-Math.log(logValue) / Math.log(1 + monthlyRate));
  } catch {
    return {
      monthsToPayoff: null,
      totalInterest: null,
      payoffDate: null,
    };
  }

  // Validate and build return values
  if (!isFinite(calculatedMonths) || calculatedMonths <= 0) {
    return {
      monthsToPayoff: null,
      totalInterest: null,
      payoffDate: null,
    };
  }

  const totalPayments = minimumPayment * calculatedMonths;
  const calculatedInterest = totalPayments - currentBalance;

  if (!isFinite(calculatedInterest) || calculatedInterest < 0) {
    return {
      monthsToPayoff: calculatedMonths,
      totalInterest: null,
      payoffDate: null,
    };
  }

  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + calculatedMonths);

  return {
    monthsToPayoff: calculatedMonths,
    totalInterest: calculatedInterest,
    payoffDate: futureDate.toISOString(),
  };
}
