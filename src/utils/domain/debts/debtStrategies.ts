// Debt payment strategy calculations
// Implements Avalanche, Snowball, and Custom debt payoff strategies

import type {
  DebtAccount,
  DebtStrategy,
  DebtStrategyResult,
  StrategyComparison,
  StrategyMonth,
} from "../../types/debt";

/**
 * Calculate optimal debt payment strategies
 */

// Strategy types - using function to avoid temporal dead zone issues
export function getDebtStrategies() {
  return {
    AVALANCHE: "avalanche" as const, // Highest interest rate first
    SNOWBALL: "snowball" as const, // Smallest balance first
    CUSTOM: "custom" as const, // User-defined priority
  };
}

// Export as constant for backwards compatibility
export const DEBT_STRATEGIES = getDebtStrategies();

// Helper functions (placed before usage to avoid temporal dead zone issues)

interface WorkingDebt extends DebtAccount {
  remainingBalance: number;
}

/**
 * Calculate interest and principal for a debt payment
 */
function calculateDebtPayment(
  debt: WorkingDebt,
  availableExtra: number
): {
  principalPayment: number;
  interestPayment: number;
  totalPayment: number;
  extraUsed: number;
} {
  const monthlyInterestRate = debt.interestRate / 100 / 12;
  const interestPayment = debt.remainingBalance * monthlyInterestRate;
  let principalPayment = Math.max(0, debt.minimumPayment - interestPayment);

  // Add extra payment if available
  const extraForThisDebt = Math.min(availableExtra, debt.remainingBalance - principalPayment);
  principalPayment += extraForThisDebt;

  // Ensure we don't overpay
  principalPayment = Math.min(principalPayment, debt.remainingBalance);
  const totalPayment = principalPayment + interestPayment;

  return {
    principalPayment,
    interestPayment,
    totalPayment,
    extraUsed: extraForThisDebt,
  };
}

/**
 * Process a single month of debt payments
 */
function processMonthlyPayments(
  workingDebts: WorkingDebt[],
  extraPayment: number,
  month: number,
  debtPayoffOrder: string[]
): { monthData: StrategyMonth; totalInterest: number } {
  const monthData: StrategyMonth = {
    month,
    totalPayment: 0,
    debts: [],
  };

  let availableExtra = extraPayment;
  let monthInterest = 0;

  for (const debt of workingDebts) {
    if (debt.remainingBalance <= 0) continue;

    const payment = calculateDebtPayment(debt, availableExtra);
    availableExtra -= payment.extraUsed;

    debt.remainingBalance -= payment.principalPayment;
    monthInterest += payment.interestPayment;

    monthData.debts.push({
      debtId: debt.id,
      payment: payment.totalPayment,
      principal: payment.principalPayment,
      interest: payment.interestPayment,
      remainingBalance: debt.remainingBalance,
    });

    monthData.totalPayment += payment.totalPayment;

    // Track when debt is paid off
    if (debt.remainingBalance <= 0 && !debtPayoffOrder.includes(debt.id)) {
      debtPayoffOrder.push(debt.id);
    }
  }

  return { monthData, totalInterest: monthInterest };
}

/**
 * Simulate month-by-month debt payoff
 */
function simulatePayoffStrategy(debts: DebtAccount[], extraPayment: number): DebtStrategyResult {
  const workingDebts: WorkingDebt[] = debts.map((debt) => ({
    ...debt,
    remainingBalance: debt.balance,
  }));

  const monthlyBreakdown: StrategyMonth[] = [];
  const debtPayoffOrder: string[] = [];
  let totalInterest = 0;
  let month = 0;
  const MAX_MONTHS = 600; // 50 year limit

  while (workingDebts.some((debt) => debt.remainingBalance > 0) && month < MAX_MONTHS) {
    month++;
    const result = processMonthlyPayments(workingDebts, extraPayment, month, debtPayoffOrder);
    totalInterest += result.totalInterest;
    monthlyBreakdown.push(result.monthData);
  }

  return {
    strategy: "custom" as DebtStrategy,
    totalMonths: month,
    totalInterest,
    totalPayment: monthlyBreakdown.reduce((sum, m) => sum + m.totalPayment, 0),
    monthlyBreakdown,
    debtPayoffOrder,
  };
}

/**
 * Core strategy calculation function
 */
function calculateStrategy(
  sortedDebts: DebtAccount[],
  extraPayment: number,
  strategy: DebtStrategy
): DebtStrategyResult {
  const result = simulatePayoffStrategy(sortedDebts, extraPayment);
  return {
    ...result,
    strategy,
  };
}

/**
 * Calculate Avalanche strategy (highest interest rate first)
 */
export function calculateDebtAvalanche(
  debts: DebtAccount[],
  extraPayment: number = 0
): DebtStrategyResult {
  const sortedDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);
  return calculateStrategy(sortedDebts, extraPayment, "avalanche");
}

/**
 * Calculate Snowball strategy (smallest balance first)
 */
export function calculateDebtSnowball(
  debts: DebtAccount[],
  extraPayment: number = 0
): DebtStrategyResult {
  const sortedDebts = [...debts].sort((a, b) => a.balance - b.balance);
  return calculateStrategy(sortedDebts, extraPayment, "snowball");
}

/**
 * Calculate custom strategy (user-defined order)
 */
export function calculateDebtCustom(
  debts: DebtAccount[],
  extraPayment: number = 0
): DebtStrategyResult {
  // For custom strategy, maintain the order provided by user
  return calculateStrategy(debts, extraPayment, "custom");
}

/**
 * Compare all debt strategies
 */
export function compareDebtStrategies(
  debts: DebtAccount[],
  extraPayment: number = 0
): StrategyComparison {
  const avalanche = calculateDebtAvalanche(debts, extraPayment);
  const snowball = calculateDebtSnowball(debts, extraPayment);

  return {
    extraPayment,
    strategies: {
      avalanche,
      snowball,
    },
    recommendation: {
      bestForInterest: avalanche.totalInterest <= snowball.totalInterest ? "avalanche" : "snowball",
      bestForTime: avalanche.totalMonths <= snowball.totalMonths ? "avalanche" : "snowball",
      bestForMotivation: "snowball", // Snowball typically better for psychological wins
    },
    comparison: {
      interestDifference: Math.abs(avalanche.totalInterest - snowball.totalInterest),
      timeDifference: Math.abs(avalanche.totalMonths - snowball.totalMonths),
      savingsWithAvalanche: snowball.totalInterest - avalanche.totalInterest,
      timeWithSnowball: avalanche.totalMonths - snowball.totalMonths,
    },
  };
}
