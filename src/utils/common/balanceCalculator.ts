/**
 * Centralized Balance Calculator Utility
 * Single source of truth for all balance and cash calculations
 * Prevents double-counting and sync conflicts
 */

import logger from "./logger.ts";

// Type definitions
interface Envelope {
  currentBalance?: number;
}

interface Transaction {
  amount: number;
  type?: string;
}

interface SavingsGoal {
  currentAmount?: number;
}

interface BalanceData {
  envelopes?: Envelope[];
  transactions?: Transaction[];
  savingsGoals?: SavingsGoal[];
  manualActualBalance?: number | null;
}

interface BalanceResult {
  actualBalance: number;
  virtualBalance: number;
  unassignedCash: number;
  totalEnvelopeBalance: number;
  totalSavingsBalance: number;
  isActualBalanceManual: boolean;
}

export interface CurrentBalancesDetailed {
  actualBalance: number;
  virtualBalance: number;
  unassignedCash: number;
  totalEnvelopeBalance: number;
  totalSavingsBalance: number;
  isActualBalanceManual: boolean;
}

export interface CurrentBalances {
  actualBalance: number;
  virtualBalance: number;
  unassignedCash: number;
  isActualBalanceManual: boolean;
}

interface Paycheck {
  amount: number;
  mode: string;
}

interface Allocation {
  amount: number;
}

interface Distribution {
  amount: number;
}

interface ValidationResult {
  isValid: boolean;
  warnings: Array<{ type: string; message: string; amount?: number }>;
  errors: Array<{ type: string; message: string; difference?: number }>;
  difference?: number;
}

/**
 * Calculate all balances from raw data
 * @param {Object} data - Raw data from database
 * @param {Array} data.envelopes - Array of envelopes
 * @param {Array} data.transactions - Array of transactions
 * @param {Array} data.savingsGoals - Array of savings goals
 * @param {number} data.manualActualBalance - Manual actual balance override (optional)
 * @returns {Object} Complete balance calculations
 */
export const calculateBalances = (data: BalanceData): BalanceResult => {
  const { envelopes = [], transactions = [], savingsGoals = [], manualActualBalance = null } = data;

  logger.debug("Balance calculation input", {
    envelopesCount: envelopes.length,
    transactionsCount: transactions.length,
    savingsGoalsCount: savingsGoals.length,
    hasManualActualBalance: manualActualBalance !== null,
  });

  // Calculate envelope balances
  const totalEnvelopeBalance = envelopes.reduce((sum: number, envelope: Envelope) => {
    return sum + (envelope.currentBalance || 0);
  }, 0);

  // Calculate savings balances
  const totalSavingsBalance = savingsGoals.reduce((sum: number, goal: SavingsGoal) => {
    return sum + (goal.currentAmount || 0);
  }, 0);

  // Calculate actual balance from transactions (unless manually overridden)
  let actualBalance: number;
  if (manualActualBalance !== null) {
    actualBalance = manualActualBalance;
  } else {
    actualBalance = transactions.reduce((sum: number, transaction: Transaction) => {
      // Only count income/expense transactions, not transfers between envelopes
      if (transaction.type !== "transfer") {
        return sum + transaction.amount;
      }
      return sum;
    }, 0);
  }

  // Virtual balance = envelope balances + savings balances
  const virtualBalance = totalEnvelopeBalance + totalSavingsBalance;

  // Unassigned cash = actual balance - virtual balance
  const unassignedCash = actualBalance - virtualBalance;

  const result = {
    actualBalance,
    virtualBalance,
    unassignedCash,
    totalEnvelopeBalance,
    totalSavingsBalance,
    isActualBalanceManual: manualActualBalance !== null,
  };

  logger.debug("Balance calculation result", result);

  return result;
};

/**
 * Calculate balance changes after a paycheck
 * @param {Object} currentBalances - Current balance state
 * @param {Object} paycheck - Paycheck data
 * @param {Array} allocations - Envelope allocations (optional)
 * @returns {Object} New balance state after paycheck
 */
export const calculatePaycheckBalances = (
  currentBalances: CurrentBalances,
  paycheck: Paycheck,
  allocations: Allocation[] = []
): CurrentBalances => {
  logger.debug("Calculating paycheck balance changes", {
    currentBalances,
    paycheck,
    allocationsCount: allocations.length,
  });

  const { actualBalance, virtualBalance, unassignedCash } = currentBalances;

  // Actual balance always increases by full paycheck amount
  const newActualBalance = actualBalance + paycheck.amount;

  // Calculate total allocated to envelopes
  const totalAllocated = allocations.reduce(
    (sum: number, allocation: Allocation) => sum + allocation.amount,
    0
  );

  let newVirtualBalance = virtualBalance;
  let newUnassignedCash = unassignedCash;

  if (paycheck.mode === "leftover") {
    // All paycheck goes to unassigned cash
    newUnassignedCash = unassignedCash + paycheck.amount;
  } else if (paycheck.mode === "allocate") {
    // Allocated portions go to envelopes (increase virtual balance)
    // Remaining goes to unassigned cash
    const remainingAmount = paycheck.amount - totalAllocated;
    newVirtualBalance = virtualBalance + totalAllocated;
    newUnassignedCash = unassignedCash + remainingAmount;
  }

  const result = {
    actualBalance: newActualBalance,
    virtualBalance: newVirtualBalance,
    unassignedCash: newUnassignedCash,
    isActualBalanceManual: currentBalances.isActualBalanceManual,
  };

  logger.info("Paycheck balance calculation complete", {
    paycheckAmount: paycheck.amount,
    paycheckMode: paycheck.mode,
    totalAllocated,
    balanceChanges: {
      actualBalance: `${actualBalance} → ${newActualBalance}`,
      virtualBalance: `${virtualBalance} → ${newVirtualBalance}`,
      unassignedCash: `${unassignedCash} → ${newUnassignedCash}`,
    },
  });

  return result;
};

/**
 * Calculate balance changes after unassigned cash distribution
 * @param {Object} currentBalances - Current balance state
 * @param {Array} distributions - Array of {envelopeId, amount} distributions
 * @returns {Object} New balance state after distribution
 */
export const calculateDistributionBalances = (
  currentBalances: CurrentBalances,
  distributions: Distribution[]
): CurrentBalances => {
  logger.debug("Calculating unassigned cash distribution", {
    currentBalances,
    distributionsCount: distributions.length,
  });

  const { actualBalance, virtualBalance, unassignedCash } = currentBalances;

  // Calculate total being distributed
  const totalDistributed = distributions.reduce(
    (sum: number, dist: Distribution) => sum + dist.amount,
    0
  );

  // Actual balance stays the same (money just moves between virtual allocations)
  const newActualBalance = actualBalance;

  // Virtual balance increases by distributed amount
  const newVirtualBalance = virtualBalance + totalDistributed;

  // Unassigned cash decreases by distributed amount
  const newUnassignedCash = unassignedCash - totalDistributed;

  const result = {
    actualBalance: newActualBalance,
    virtualBalance: newVirtualBalance,
    unassignedCash: newUnassignedCash,
    isActualBalanceManual: currentBalances.isActualBalanceManual,
  };

  logger.info("Distribution balance calculation complete", {
    totalDistributed,
    balanceChanges: {
      virtualBalance: `${virtualBalance} → ${newVirtualBalance}`,
      unassignedCash: `${unassignedCash} → ${newUnassignedCash}`,
    },
  });

  return result;
};

/**
 * Validate balance consistency
 * @param {Object} balances - Balance data to validate
 * @returns {Object} Validation result with warnings/errors
 */
export const validateBalances = (balances: CurrentBalances): ValidationResult => {
  const { actualBalance, virtualBalance, unassignedCash } = balances;

  const warnings: Array<{ type: string; message: string; amount?: number }> = [];
  const errors: Array<{ type: string; message: string; difference?: number }> = [];

  // Check if actual balance equals virtual balance + unassigned cash
  const calculatedActual = virtualBalance + unassignedCash;
  const difference = Math.abs(actualBalance - calculatedActual);

  if (difference > 0.01) {
    // Allow for small floating point differences
    errors.push({
      type: "BALANCE_MISMATCH",
      message: `Actual balance (${actualBalance}) doesn't match virtual + unassigned (${calculatedActual})`,
      difference: actualBalance - calculatedActual,
    });
  }

  // Check for unusual negative unassigned cash (might be valid but worth noting)
  if (unassignedCash < -1000) {
    warnings.push({
      type: "LARGE_NEGATIVE_UNASSIGNED",
      message: `Large negative unassigned cash: $${unassignedCash}`,
      amount: unassignedCash,
    });
  }

  const isValid = errors.length === 0;

  logger.debug("Balance validation", {
    isValid,
    warningsCount: warnings.length,
    errorsCount: errors.length,
    difference,
  });

  return {
    isValid,
    warnings,
    errors,
    difference,
  };
};

export default {
  calculateBalances,
  calculatePaycheckBalances,
  calculateDistributionBalances,
  validateBalances,
};
