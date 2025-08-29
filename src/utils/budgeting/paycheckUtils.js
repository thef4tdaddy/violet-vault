/**
 * Paycheck processing utilities
 * Handles paycheck calculations, allocations, and validation
 */

import { ENVELOPE_TYPES } from "../../constants/categories";
import { BIWEEKLY_MULTIPLIER } from "../../constants/frequency";

/**
 * Validates paycheck form data
 * @param {Object} formData - Paycheck form data
 * @returns {Object} Validation result
 */
export const validatePaycheckForm = (formData) => {
  const errors = {};

  // Amount validation
  if (!formData.amount) {
    errors.amount = "Paycheck amount is required";
  } else {
    const amount = parseFloat(formData.amount);
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
export const getPayerPrediction = (payer, paycheckHistory = []) => {
  const payerPaychecks = paycheckHistory
    .filter((p) => p.payerName === payer && p.amount > 0)
    .slice(0, 5) // Last 5 paychecks
    .map((p) => p.amount);

  if (payerPaychecks.length === 0) return null;

  // Calculate average and standard deviation for confidence
  const average = payerPaychecks.reduce((a, b) => a + b, 0) / payerPaychecks.length;
  const variance = payerPaychecks.reduce((a, b) => a + Math.pow(b - average, 2), 0) / payerPaychecks.length;
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
export const getUniquePayers = (paycheckHistory = [], tempPayers = []) => {
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

  return Array.from(payers).sort();
};

/**
 * Calculates envelope allocations for a paycheck
 * @param {number} paycheckAmount - Total paycheck amount
 * @param {Array} envelopes - Available envelopes
 * @param {string} allocationMode - 'allocate' or 'leftover'
 * @returns {Object} Allocation calculations
 */
export const calculateEnvelopeAllocations = (paycheckAmount, envelopes = [], allocationMode = "allocate") => {
  if (!paycheckAmount || paycheckAmount <= 0) {
    return {
      allocations: [],
      totalAllocated: 0,
      remainingAmount: paycheckAmount || 0,
      allocationRate: 0,
    };
  }

  const amount = parseFloat(paycheckAmount);
  const allocatableEnvelopes = envelopes.filter((env) => 
    env.autoAllocate && 
    env.envelopeType !== ENVELOPE_TYPES.SAVINGS &&
    env.id !== "unassigned"
  );

  if (allocatableEnvelopes.length === 0) {
    return {
      allocations: [],
      totalAllocated: 0,
      remainingAmount: amount,
      allocationRate: 0,
    };
  }

  const allocations = [];
  let totalAllocated = 0;

  if (allocationMode === "allocate") {
    // Standard allocation based on monthly amounts and biweekly conversion
    allocatableEnvelopes.forEach((envelope) => {
      let allocationAmount = 0;

      if (envelope.monthlyAmount > 0) {
        // Convert monthly to biweekly for standard allocation
        allocationAmount = envelope.monthlyAmount / BIWEEKLY_MULTIPLIER;
        allocationAmount = Math.round(allocationAmount * 100) / 100;
      }

      if (allocationAmount > 0) {
        allocations.push({
          envelopeId: envelope.id,
          envelopeName: envelope.name,
          amount: allocationAmount,
          monthlyAmount: envelope.monthlyAmount,
          envelopeType: envelope.envelopeType,
          priority: envelope.priority || "medium",
        });
        totalAllocated += allocationAmount;
      }
    });
  } else if (allocationMode === "leftover") {
    // Leftover mode: distribute remaining amount proportionally
    const totalMonthlyNeeds = allocatableEnvelopes.reduce(
      (sum, env) => sum + (env.monthlyAmount || 0),
      0
    );

    if (totalMonthlyNeeds > 0) {
      allocatableEnvelopes.forEach((envelope) => {
        if (envelope.monthlyAmount > 0) {
          const proportion = envelope.monthlyAmount / totalMonthlyNeeds;
          const allocationAmount = Math.round(amount * proportion * 100) / 100;

          allocations.push({
            envelopeId: envelope.id,
            envelopeName: envelope.name,
            amount: allocationAmount,
            monthlyAmount: envelope.monthlyAmount,
            envelopeType: envelope.envelopeType,
            priority: envelope.priority || "medium",
          });
          totalAllocated += allocationAmount;
        }
      });
    }
  }

  // Sort allocations by priority and amount
  const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  allocations.sort((a, b) => {
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
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
export const createPaycheckTransaction = (formData, allocations, currentUser) => {
  return {
    id: Date.now(),
    amount: parseFloat(formData.amount),
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
export const validateAllocations = (allocations, paycheckAmount) => {
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
export const formatPaycheckAmount = (amount) => {
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
export const getPaycheckStatistics = (paycheckHistory = [], payer = null) => {
  const filteredHistory = payer 
    ? paycheckHistory.filter(p => p.payerName === payer)
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

  const amounts = filteredHistory.map(p => p.amount);
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