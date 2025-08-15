/**
 * Utility functions for bill envelope calculations
 * Calculates remaining amounts needed for bill payments and funding progress
 */

import { ENVELOPE_TYPES } from "../constants/categories";
import { BIWEEKLY_MULTIPLIER } from "../constants/frequency";

/**
 * Calculate how much is left to fulfill the next bill payment for a bill envelope
 * @param {Object} envelope - The bill envelope
 * @param {Array} bills - Array of bills linked to this envelope
 * @returns {Object} Calculation results
 */
export const calculateBillEnvelopeNeeds = (envelope, bills = []) => {
  if (!envelope || envelope.envelopeType !== ENVELOPE_TYPES.BILL) {
    return {
      isValidBillEnvelope: false,
      nextBillAmount: 0,
      remainingToFund: 0,
      daysUntilNextBill: null,
      fundingProgress: 0,
      isFullyFunded: false,
      nextBillDate: null,
      linkedBills: [],
    };
  }

  // Find bills linked to this envelope
  const linkedBills = bills.filter(
    (bill) => bill.envelopeId === envelope.id && !bill.isPaid,
  );

  // Get the next upcoming bill (earliest due date)
  const upcomingBills = linkedBills
    .filter((bill) => new Date(bill.dueDate) >= new Date())
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const nextBill = upcomingBills[0];
  const nextBillAmount = nextBill
    ? nextBill.amount || nextBill.estimatedAmount || 0
    : 0;
  const nextBillDate = nextBill ? new Date(nextBill.dueDate) : null;

  // Calculate days until next bill
  let daysUntilNextBill = null;
  if (nextBillDate) {
    const today = new Date();
    const diffTime = nextBillDate.getTime() - today.getTime();
    daysUntilNextBill = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Calculate funding needs
  const currentBalance = envelope.currentBalance || 0;
  const biweeklyAllocation = envelope.biweeklyAllocation || 0;
  
  // For bill envelopes, target should be the actual bill amount, not biweekly * multiplier
  // The biweekly allocation is how much to save per paycheck, target is the bill amount
  const targetMonthlyAmount = nextBillAmount || (biweeklyAllocation * BIWEEKLY_MULTIPLIER);

  // Calculate remaining to fund for next bill
  const remainingToFund = Math.max(0, nextBillAmount - currentBalance);

  // Calculate overall funding progress (current balance vs target monthly amount)
  const fundingProgress =
    targetMonthlyAmount > 0
      ? Math.min(100, (currentBalance / targetMonthlyAmount) * 100)
      : currentBalance >= nextBillAmount
        ? 100
        : 0;

  const isFullyFunded = remainingToFund <= 0;

  // Calculate total upcoming bills amount in next 30 days
  const next30Days = new Date();
  next30Days.setDate(next30Days.getDate() + 30);

  const upcomingBillsAmount = linkedBills
    .filter((bill) => {
      const billDate = new Date(bill.dueDate);
      return billDate <= next30Days;
    })
    .reduce((sum, bill) => sum + (bill.amount || bill.estimatedAmount || 0), 0);

  return {
    isValidBillEnvelope: true,
    nextBillAmount,
    remainingToFund,
    daysUntilNextBill,
    fundingProgress: Math.round(fundingProgress),
    isFullyFunded,
    nextBillDate,
    linkedBills: linkedBills.length,
    upcomingBillsAmount,
    currentBalance,
    targetMonthlyAmount,
    biweeklyAllocation,
    nextBill: nextBill
      ? {
          id: nextBill.id,
          name: nextBill.name || nextBill.provider || nextBill.description,
          amount: nextBillAmount,
          dueDate: nextBill.dueDate,
          category: nextBill.category,
          frequency: nextBill.frequency || 'monthly',
        }
      : null,
  };
};

/**
 * Calculate bill envelope funding priority
 * Higher priority means more urgent need for funding
 * @param {Object} envelope - The bill envelope
 * @param {Array} bills - Array of bills linked to this envelope
 * @returns {Object} Priority information
 */
export const calculateBillEnvelopePriority = (envelope, bills = []) => {
  const calculations = calculateBillEnvelopeNeeds(envelope, bills);

  if (!calculations.isValidBillEnvelope) {
    return {
      priority: 0,
      priorityLevel: "none",
      reason: "Not a bill envelope",
    };
  }

  const { remainingToFund, daysUntilNextBill, isFullyFunded, nextBillAmount } =
    calculations;

  if (isFullyFunded) {
    return {
      priority: 1,
      priorityLevel: "low",
      reason: "Fully funded for next bill",
    };
  }

  if (!daysUntilNextBill || daysUntilNextBill > 30) {
    return {
      priority: 2,
      priorityLevel: "low",
      reason: "No immediate bills or bills are far out",
    };
  }

  // Calculate urgency based on days and funding gap
  const fundingGapPercent =
    nextBillAmount > 0 ? (remainingToFund / nextBillAmount) * 100 : 0;

  if (daysUntilNextBill <= 3 && remainingToFund > 0) {
    return {
      priority: 10,
      priorityLevel: "critical",
      reason: `Bill due in ${daysUntilNextBill} days, need $${remainingToFund.toFixed(2)}`,
    };
  }

  if (daysUntilNextBill <= 7 && fundingGapPercent > 50) {
    return {
      priority: 8,
      priorityLevel: "high",
      reason: `Bill due in ${daysUntilNextBill} days, ${Math.round(fundingGapPercent)}% underfunded`,
    };
  }

  if (daysUntilNextBill <= 14 && remainingToFund > 0) {
    return {
      priority: 6,
      priorityLevel: "medium",
      reason: `Bill due in ${daysUntilNextBill} days, need $${remainingToFund.toFixed(2)}`,
    };
  }

  if (remainingToFund > 0) {
    return {
      priority: 4,
      priorityLevel: "medium",
      reason: `Need $${remainingToFund.toFixed(2)} for upcoming bill`,
    };
  }

  return {
    priority: 1,
    priorityLevel: "low",
    reason: "Well funded",
  };
};

/**
 * Get recommended funding amount for a bill envelope
 * @param {Object} envelope - The bill envelope
 * @param {Array} bills - Array of bills linked to this envelope
 * @param {number} availableCash - Available unassigned cash
 * @returns {Object} Funding recommendation
 */
export const getRecommendedBillFunding = (
  envelope,
  bills = [],
  availableCash = 0,
) => {
  const calculations = calculateBillEnvelopeNeeds(envelope, bills);
  const priority = calculateBillEnvelopePriority(envelope, bills);

  if (!calculations.isValidBillEnvelope) {
    return { recommendedAmount: 0, reason: "Not a bill envelope" };
  }

  const { remainingToFund, biweeklyAllocation } = calculations;

  if (calculations.isFullyFunded) {
    return {
      recommendedAmount: 0,
      reason: "Already fully funded for next bill",
    };
  }

  // For critical/high priority, recommend full remaining amount if available
  if (
    priority.priorityLevel === "critical" ||
    priority.priorityLevel === "high"
  ) {
    const recommendedAmount = Math.min(remainingToFund, availableCash);
    return {
      recommendedAmount,
      reason: `${priority.priorityLevel === "critical" ? "URGENT" : "High priority"}: ${priority.reason}`,
      maxRecommended: remainingToFund,
      isUrgent: priority.priorityLevel === "critical",
    };
  }

  // For medium priority, recommend based on biweekly allocation or partial funding
  if (priority.priorityLevel === "medium") {
    const biweeklyAmount = biweeklyAllocation || 0;
    const recommendedAmount = Math.min(
      Math.max(biweeklyAmount, remainingToFund * 0.5),
      availableCash,
    );
    return {
      recommendedAmount,
      reason: priority.reason,
      maxRecommended: remainingToFund,
    };
  }

  // Low priority - minimal funding
  const minimalFunding = Math.min(
    biweeklyAllocation || 25,
    availableCash * 0.1,
  );
  return {
    recommendedAmount: minimalFunding,
    reason: "Low priority - minimal funding suggested",
    maxRecommended: remainingToFund,
  };
};

/**
 * Calculate bill envelope funding status for display
 * @param {Object} envelope - The bill envelope
 * @param {Array} bills - Array of bills linked to this envelope
 * @returns {Object} Display information
 */
export const getBillEnvelopeDisplayInfo = (envelope, bills = []) => {
  const calculations = calculateBillEnvelopeNeeds(envelope, bills);
  const priority = calculateBillEnvelopePriority(envelope, bills);

  if (!calculations.isValidBillEnvelope) {
    return null;
  }

  const statusConfig = {
    critical: {
      color: "red",
      icon: "AlertTriangle",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
    },
    high: {
      color: "orange",
      icon: "Clock",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
    },
    medium: {
      color: "yellow",
      icon: "Calendar",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
    },
    low: {
      color: "green",
      icon: "CheckCircle",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
    },
    none: {
      color: "gray",
      icon: "DollarSign",
      bgColor: "bg-gray-50",
      textColor: "text-gray-700",
    },
  };

  const status = statusConfig[priority.priorityLevel] || statusConfig.none;

  return {
    ...calculations,
    priority,
    status,
    displayText: {
      primaryStatus: (() => {
        const currentBalance = calculations.currentBalance;
        const targetAmount = calculations.targetMonthlyAmount;
        const nextBill = calculations.nextBill;
        const daysUntilNextBill = calculations.daysUntilNextBill;
        
        
        // Fully funded = current balance meets or exceeds target
        if (currentBalance >= targetAmount) {
          return "Fully Funded";
        }
        
        // Calculate if "On Track" based on bill cycle progression
        if (nextBill && daysUntilNextBill > 0) {
          // Determine total cycle length based on frequency
          const frequencyDays = {
            'weekly': 7,
            'biweekly': 14, 
            'monthly': 30,
            'quarterly': 90,
            'semiannual': 180,
            'yearly': 365
          };
          
          const cycleDays = frequencyDays[nextBill.frequency] || 30;
          const progressThroughCycle = Math.max(0, Math.min(1, (cycleDays - daysUntilNextBill) / cycleDays));
          const expectedFunding = targetAmount * progressThroughCycle;
          
          
          // On Track = current funding is within reasonable range of expected
          // Allow some buffer (±20%) for timing variations
          const buffer = 0.2;
          const minExpected = expectedFunding * (1 - buffer);
          
          if (currentBalance >= minExpected) {
            return "On Track";
          } else {
            // Behind schedule - show how much behind expected pace
            const amountBehind = expectedFunding - currentBalance;
            return `Behind: $${Math.max(0, amountBehind).toFixed(2)}`;
          }
        }
        
        // Fallback - show how much is still needed, but if $0 then say On Track
        const remaining = calculations.remainingToFund;
        return remaining <= 0 ? "On Track" : `Need $${remaining.toFixed(2)}`;
      })(),
      secondaryStatus: calculations.nextBill
        ? `Next: ${calculations.nextBill.name} (${calculations.daysUntilNextBill} days)`
        : "No upcoming bills",
      fundingProgress: `${calculations.fundingProgress}% funded`,
    },
  };
};
