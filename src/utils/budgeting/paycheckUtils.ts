/**
 * Paycheck processing utilities
 * Handles paycheck calculations, allocations, and validation
 */

import { ENVELOPE_TYPES } from "../../constants/categories";
import { BIWEEKLY_MULTIPLIER } from "../../constants/frequency";

/**
 * Paycheck form data interface
 */
interface PaycheckFormData {
  amount: string | number;
  payerName: string;
  allocationMode: string;
}

/**
 * Validation result interface
 */
interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Paycheck prediction interface
 */
interface PaycheckPrediction {
  amount: number;
  confidence: number;
  sampleSize: number;
  range: {
    min: number;
    max: number;
  };
}

/**
 * Historical paycheck record
 */
interface PaycheckRecord {
  payerName: string;
  amount: number;
  processedAt?: string;
}

/**
 * Envelope interface for allocations
 */
interface Envelope {
  id: string;
  name: string;
  autoAllocate?: boolean;
  envelopeType: string;
  monthlyAmount?: number;
  priority?: string;
  currentBalance?: number;
  biweeklyAllocation?: number;
  category?: string;
}

/**
 * Allocation result
 */
interface AllocationItem {
  envelopeId: string;
  envelopeName: string;
  amount: number;
  monthlyAmount: number;
  envelopeType: string;
  priority: string;
}

/**
 * Allocation calculations result
 */
interface AllocationResult {
  allocations: AllocationItem[];
  totalAllocated: number;
  remainingAmount: number;
  allocationRate: number;
}

/**
 * Paycheck transaction
 */
interface PaycheckTransaction {
  id: number;
  amount: number;
  payerName: string;
  allocationMode: string;
  allocations: AllocationItem[];
  totalAllocated: number;
  remainingAmount: number;
  processedBy: string;
  processedAt: string;
  date: string;
  proportionalBreakdown?: Record<string, number>;
  allocationFlag?: "partial" | "full" | "none";
}

/**
 * User info
 */
interface UserInfo {
  userName?: string;
}

/**
 * Paycheck statistics
 */
interface PaycheckStatistics {
  count: number;
  totalAmount: number;
  averageAmount: number;
  minAmount: number;
  maxAmount: number;
  lastPaycheckDate: string | null;
}

/**
 * Validates paycheck form data
 * @param {Object} formData - Paycheck form data
 * @returns {Object} Validation result
 */
export const validatePaycheckForm = (formData: PaycheckFormData): ValidationResult => {
  const errors: Record<string, string> = {};

  // Amount validation
  if (!formData.amount) {
    errors.amount = "Paycheck amount is required";
  } else {
    const amount = parseFloat(String(formData.amount));
    if (isNaN(amount) || amount <= 0) {
      errors.amount = "Paycheck amount must be a positive number";
    } else if (amount > 1000000) {
      errors.amount = "Paycheck amount cannot exceed $1,000,000";
    }
  }

  // Payer name validation
  if (!formData.payerName?.trim()) {
    errors.payerName = "Payer name is required";
  } else if (formData.payerName.trim().length > 100) {
    errors.payerName = "Payer name must be less than 100 characters";
  }

  // Allocation mode validation
  if (!["allocate", "leftover"].includes(formData.allocationMode)) {
    errors.allocationMode = "Invalid allocation mode";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Gets smart prediction for a specific payer based on history
 * @param {string} payer - Payer name
 * @param {Array} paycheckHistory - Historical paycheck data
 * @returns {Object|null} Prediction with amount and confidence
 */
export const getPayerPrediction = (
  payer: string,
  paycheckHistory: PaycheckRecord[] = []
): PaycheckPrediction | null => {
  const payerPaychecks = paycheckHistory
    .filter((p) => p.payerName === payer && p.amount > 0)
    .slice(0, 5) // Last 5 paychecks
    .map((p) => p.amount);

  if (payerPaychecks.length === 0) return null;

  // Calculate average and standard deviation for confidence
  const average = payerPaychecks.reduce((a, b) => a + b, 0) / payerPaychecks.length;
  const variance =
    payerPaychecks.reduce((a, b) => a + Math.pow(b - average, 2), 0) / payerPaychecks.length;
  const stdDev = Math.sqrt(variance);

  // Confidence based on consistency (lower std dev = higher confidence)
  const consistency = Math.max(0, Math.min(100, 100 - (stdDev / average) * 100));

  return {
    amount: Math.round(average * 100) / 100,
    confidence: Math.round(consistency),
    sampleSize: payerPaychecks.length,
    range: {
      min: Math.min(...payerPaychecks),
      max: Math.max(...payerPaychecks),
    },
  };
};

/**
 * Gets unique payers from paycheck history and temporary additions
 * @param {Array} paycheckHistory - Historical paycheck data
 * @param {Array} tempPayers - Temporary payers from current session
 * @returns {Array} Sorted unique payer names
 */
export const getUniquePayers = (
  paycheckHistory: PaycheckRecord[] = [],
  tempPayers: string[] = []
): string[] => {
  const payers = new Set();

  // Add payers from history
  paycheckHistory.forEach((paycheck) => {
    if (paycheck.payerName && paycheck.payerName.trim()) {
      payers.add(paycheck.payerName);
    }
  });

  // Add temporary payers from this session
  tempPayers.forEach((payer) => {
    if (payer && payer.trim()) {
      payers.add(payer);
    }
  });

  return Array.from(payers).sort() as string[];
};

/**
 * Calculates envelope allocations for a paycheck
 * @param {number} paycheckAmount - Total paycheck amount
 * @param {Array} envelopes - Available envelopes
 * @param {string} allocationMode - 'allocate' or 'leftover'
 * @returns {Object} Allocation calculations
 */
export const calculateEnvelopeAllocations = (
  paycheckAmount: number,
  envelopes: Envelope[] = [],
  allocationMode = "allocate"
): AllocationResult => {
  if (!paycheckAmount || paycheckAmount <= 0) {
    return {
      allocations: [],
      totalAllocated: 0,
      remainingAmount: paycheckAmount || 0,
      allocationRate: 0,
    };
  }

  const amount = parseFloat(String(paycheckAmount));
  const allocatableEnvelopes = envelopes.filter(
    (env) =>
      env.autoAllocate && env.envelopeType !== ENVELOPE_TYPES.SAVINGS && env.id !== "unassigned"
  );

  if (allocatableEnvelopes.length === 0) {
    return {
      allocations: [],
      totalAllocated: 0,
      remainingAmount: amount,
      allocationRate: 0,
    };
  }

  const allocations: AllocationItem[] = [];
  let totalAllocated = 0;

  if (allocationMode === "allocate") {
    // Baseline allocation using biweekly conversion
    const baseline = allocatableEnvelopes.map((envelope) => {
      const biweeklyNeed =
        typeof envelope.monthlyAmount === "number"
          ? Math.round((envelope.monthlyAmount / BIWEEKLY_MULTIPLIER) * 100) / 100
          : 0;

      return {
        envelope,
        biweeklyNeed,
        outstanding: Math.max(0, biweeklyNeed - (envelope.currentBalance ?? 0)),
      };
    });

    const totalOutstanding = baseline.reduce((sum, entry) => sum + entry.outstanding, 0);

    baseline.forEach(({ envelope, biweeklyNeed, outstanding }) => {
      if (outstanding <= 0 || biweeklyNeed <= 0) {
        return;
      }

      let allocationAmount = outstanding;

      if (totalOutstanding > amount && totalOutstanding > 0) {
        const proportion = outstanding / totalOutstanding;
        allocationAmount = Math.round(amount * proportion * 100) / 100;
      }

      allocationAmount = Math.min(allocationAmount, Math.max(0, amount - totalAllocated));
      allocationAmount = Math.round(allocationAmount * 100) / 100;

      if (allocationAmount > 0) {
        allocations.push({
          envelopeId: envelope.id,
          envelopeName: envelope.name,
          amount: allocationAmount,
          monthlyAmount: envelope.monthlyAmount || 0,
          envelopeType: envelope.envelopeType,
          priority: envelope.priority || "medium",
        });
        totalAllocated += allocationAmount;
      }
    });
  } else if (allocationMode === "leftover") {
    const totalMonthlyNeeds = allocatableEnvelopes.reduce(
      (sum, env) => sum + (env.monthlyAmount || 0),
      0
    );

    if (totalMonthlyNeeds > 0) {
      allocatableEnvelopes.forEach((envelope) => {
        if ((envelope.monthlyAmount || 0) > 0) {
          const proportion = (envelope.monthlyAmount || 0) / totalMonthlyNeeds;
          const allocationAmount = Math.round(amount * proportion * 100) / 100;

          allocations.push({
            envelopeId: envelope.id,
            envelopeName: envelope.name,
            amount: allocationAmount,
            monthlyAmount: envelope.monthlyAmount || 0,
            envelopeType: envelope.envelopeType,
            priority: envelope.priority || "medium",
          });
          totalAllocated += allocationAmount;
        }
      });
    }
  }

  const priorityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  allocations.sort((a, b) => {
    const priorityDiff = (priorityOrder[b.priority] ?? 0) - (priorityOrder[a.priority] ?? 0);
    return priorityDiff !== 0 ? priorityDiff : b.amount - a.amount;
  });

  return {
    allocations,
    totalAllocated: Math.round(totalAllocated * 100) / 100,
    remainingAmount: Math.round((amount - totalAllocated) * 100) / 100,
    allocationRate: totalAllocated > 0 ? Math.round((totalAllocated / amount) * 100) : 0,
  };
};

/**
 * Creates paycheck transaction object
 * @param {Object} formData - Paycheck form data
 * @param {Object} allocations - Calculated allocations
 * @param {Object} currentUser - Current user info
 * @returns {Object} Paycheck transaction
 */
export const createPaycheckTransaction = (
  formData: PaycheckFormData,
  allocations: AllocationResult,
  currentUser: UserInfo | null
): PaycheckTransaction => {
  return {
    id: Date.now(),
    amount: parseFloat(String(formData.amount)),
    payerName: formData.payerName.trim(),
    allocationMode: formData.allocationMode,
    allocations: allocations.allocations,
    totalAllocated: allocations.totalAllocated,
    remainingAmount: allocations.remainingAmount,
    processedBy: currentUser?.userName || "Unknown User",
    processedAt: new Date().toISOString(),
    date: new Date().toISOString().split("T")[0], // Today's date
  };
};

/**
 * Validates allocation amounts don't exceed paycheck
 * @param {Array} allocations - Envelope allocations
 * @param {number} paycheckAmount - Total paycheck amount
 * @returns {Object} Validation result
 */
export const validateAllocations = (
  allocations: AllocationItem[],
  paycheckAmount: number
): { isValid: boolean; message: string; overage?: number } => {
  const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.amount, 0);

  if (totalAllocated > paycheckAmount) {
    return {
      isValid: false,
      message: `Total allocations ($${totalAllocated.toFixed(2)}) exceed paycheck amount ($${paycheckAmount.toFixed(2)})`,
      overage: totalAllocated - paycheckAmount,
    };
  }

  if (totalAllocated < 0) {
    return {
      isValid: false,
      message: "Allocations cannot be negative",
    };
  }

  return {
    isValid: true,
    message: "Allocations are valid",
  };
};

/**
 * Formats paycheck amount for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount
 */
export const formatPaycheckAmount = (amount: number): string => {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "$0.00";
  }
  return `$${amount.toFixed(2)}`;
};

/**
 * Gets paycheck statistics from history
 * @param {Array} paycheckHistory - Historical paycheck data
 * @param {string} payer - Optional payer filter
 * @returns {Object} Statistics
 */
export const getPaycheckStatistics = (
  paycheckHistory: PaycheckRecord[] = [],
  payer: string | null = null
): PaycheckStatistics => {
  const filteredHistory = payer
    ? paycheckHistory.filter((p) => p.payerName === payer)
    : paycheckHistory;

  if (filteredHistory.length === 0) {
    return {
      count: 0,
      totalAmount: 0,
      averageAmount: 0,
      minAmount: 0,
      maxAmount: 0,
      lastPaycheckDate: null,
    };
  }

  const amounts = filteredHistory.map((p) => p.amount);
  const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);

  return {
    count: filteredHistory.length,
    totalAmount,
    averageAmount: totalAmount / filteredHistory.length,
    minAmount: Math.min(...amounts),
    maxAmount: Math.max(...amounts),
    lastPaycheckDate: filteredHistory[0]?.processedAt || null,
  };
};
