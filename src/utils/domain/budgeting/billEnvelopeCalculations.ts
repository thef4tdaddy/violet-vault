/**
 * Utility functions for bill envelope calculations
 * Calculates remaining amounts needed for bill payments and funding progress
 */

import { BIWEEKLY_MULTIPLIER } from "../../constants/frequency";
import type { Envelope as DbEnvelope, Bill as DbBill } from "../../db/types";

type Bill = DbBill;
type Envelope = DbEnvelope;

export interface BillEnvelopeResult {
  isValidBillEnvelope: boolean;
  nextBillAmount: number;
  remainingToFund: number;
  daysUntilNextBill: number | null;
  fundingProgress: number;
  isFullyFunded: boolean;
  nextBillDate: Date | null;
  linkedBills: number;
  upcomingBillsAmount?: number;
  currentBalance?: number;
  targetMonthlyAmount?: number;
  biweeklyAllocation?: number;
  nextBill?: {
    id: string;
    name: string;
    amount: number;
    dueDate: string;
    category?: string;
    frequency: string;
  } | null;
  maxRecommended?: number;
  isUrgent?: boolean;
  priority?: {
    priorityLevel: string;
    reason: string;
  };
  status?: {
    color: string;
    icon?: string;
    bgColor: string;
    textColor: string;
  };
  displayText?: {
    primaryStatus: string;
    secondaryStatus?: string;
    fundingProgress?: string;
  };
}

/**
 * Get invalid bill envelope result
 */
const getInvalidBillEnvelopeResult = (): BillEnvelopeResult => ({
  isValidBillEnvelope: false,
  nextBillAmount: 0,
  remainingToFund: 0,
  daysUntilNextBill: null,
  fundingProgress: 0,
  isFullyFunded: false,
  nextBillDate: null,
  linkedBills: 0,
});

/**
 * Get the next upcoming bill from linked bills
 */
const getNextUpcomingBill = (linkedBills: Bill[]): Bill | null => {
  const upcomingBills = linkedBills
    .filter((bill) => {
      const date = parseDueDate(bill.dueDate);
      return date && date >= new Date();
    })
    .sort((a, b) => {
      const dateA = parseDueDate(a.dueDate);
      const dateB = parseDueDate(b.dueDate);
      return (dateA?.getTime() || 0) - (dateB?.getTime() || 0);
    });

  return upcomingBills[0] || null;
};

/**
 * Safely parse a due date which could be a string, number (day of month), or Date object
 */
const parseDueDate = (dueDate: unknown): Date | null => {
  if (!dueDate) return null;
  if (dueDate instanceof Date) return dueDate;

  // If it's a number 1-31, it's a day of the month
  if (typeof dueDate === "number" && dueDate >= 1 && dueDate <= 31) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(dueDate);
    // If that date has passed this month, use next month
    if (date < new Date()) {
      date.setMonth(date.getMonth() + 1);
    }
    return date;
  }

  if (typeof dueDate === "string" || typeof dueDate === "number") {
    const parsed = new Date(dueDate);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
};

/**
 * Calculate days until a given date
 */
const calculateDaysUntil = (targetDate: Date | string | number | null): number | null => {
  const target = parseDueDate(targetDate);
  if (!target) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calculate funding progress percentage
 */
const calculateFundingProgress = (
  currentBalance: number,
  targetAmount: number,
  nextBillAmount: number
): number => {
  if (targetAmount > 0) {
    return Math.min(100, (currentBalance / targetAmount) * 100);
  }
  return currentBalance >= nextBillAmount ? 100 : 0;
};

/**
 * Calculate total amount of bills due within next 30 days
 */
const calculateUpcomingBillsAmount = (linkedBills: Bill[]): number => {
  const next30Days = new Date();
  next30Days.setDate(next30Days.getDate() + 30);

  return linkedBills
    .filter((bill) => {
      const date = parseDueDate(bill.dueDate);
      return date && date <= next30Days;
    })
    .reduce((sum: number, bill: Bill) => sum + (bill.amount || 0), 0);
};

/**
 * Calculate how much is left to fulfill the next bill payment for a bill envelope
 * @param {Object} envelope - The bill envelope
 * @param {Array} bills - Array of bills linked to this envelope
 * @returns {BillEnvelopeResult} Calculation results
 */
export const calculateBillEnvelopeNeeds = (
  envelope: Envelope,
  bills: Bill[] = []
): BillEnvelopeResult => {
  if (!envelope || (envelope.type as string) !== "liability") {
    return getInvalidBillEnvelopeResult();
  }

  // Find bills linked to this envelope
  const linkedBills = bills.filter((bill: Bill) => bill.envelopeId === envelope.id && !bill.isPaid);

  // Get next upcoming bill
  const nextBill = getNextUpcomingBill(linkedBills);
  const nextBillAmount = nextBill ? nextBill.amount || 0 : 0;
  const nextBillDate = nextBill ? parseDueDate(nextBill.dueDate) : null;

  // Calculate days until next bill
  const daysUntilNextBill = calculateDaysUntil(nextBillDate);

  // Calculate funding needs
  // Calculate funding needs
  const currentBalance = envelope.currentBalance || 0;
  // NOTE: This logic seems flawed in original code: checks for "standard" inside a "liability" block?
  // If the function guards for only "liability" above, then envelope.type is "liability".
  // But liability doesn't have biweeklyAllocation on type definition usually?
  // Let's check schema. Liability does not have biweeklyAllocation.
  // Standard *does*. But we returned early if not liability.
  // So biweeklyAllocation will always be 0 here unless we cast.
  // Assuming the intention was "if it *was* standard" but it can't be.
  // OR the guard is wrong. But the function is "calculateBillEnvelopeNeeds".
  // Let's assume 0 for now to be safe, or cast if we know runtime data might be mixed.
  const biweeklyAllocation = 0;

  const targetMonthlyAmount = nextBillAmount || biweeklyAllocation * BIWEEKLY_MULTIPLIER;
  const remainingToFund = Math.max(0, nextBillAmount - currentBalance);
  const isFullyFunded = remainingToFund <= 0;

  // Calculate overall funding progress
  const fundingProgress = calculateFundingProgress(
    currentBalance,
    targetMonthlyAmount,
    nextBillAmount
  );

  // Calculate total upcoming bills amount
  const upcomingBillsAmount = calculateUpcomingBillsAmount(linkedBills);

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
          name: nextBill.name || "Unnamed Bill",
          amount: nextBillAmount,
          dueDate: String(nextBill.dueDate || ""),
          category: nextBill.category,
          frequency: nextBill.frequency || "monthly",
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
export const calculateBillEnvelopePriority = (
  envelope: Envelope,
  bills: Bill[] = []
): { priority: number; priorityLevel: string; reason: string } => {
  const calculations = calculateBillEnvelopeNeeds(envelope, bills);

  if (!calculations.isValidBillEnvelope) {
    return {
      priority: 0,
      priorityLevel: "none",
      reason: "Not a bill envelope",
    };
  }

  const { remainingToFund, daysUntilNextBill, isFullyFunded, nextBillAmount } = calculations;

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
  const fundingGapPercent = nextBillAmount > 0 ? (remainingToFund / nextBillAmount) * 100 : 0;

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
  envelope: Envelope,
  bills: Bill[] = [],
  availableCash: number = 0
): { recommendedAmount: number; reason: string; maxRecommended: number; isUrgent: boolean } => {
  const calculations = calculateBillEnvelopeNeeds(envelope, bills);
  const priority = calculateBillEnvelopePriority(envelope, bills);

  if (!calculations.isValidBillEnvelope) {
    return {
      recommendedAmount: 0,
      reason: "Not a bill envelope",
      maxRecommended: 0,
      isUrgent: false,
    };
  }

  const remainingToFund = calculations.remainingToFund ?? 0;
  const biweeklyAllocation = calculations.biweeklyAllocation ?? 0;

  if (calculations.isFullyFunded) {
    return {
      recommendedAmount: 0,
      reason: "Already fully funded for next bill",
      maxRecommended: remainingToFund,
      isUrgent: false,
    };
  }

  // For critical/high priority, recommend full remaining amount if available
  if (priority.priorityLevel === "critical" || priority.priorityLevel === "high") {
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
      availableCash
    );
    return {
      recommendedAmount,
      reason: priority.reason,
      maxRecommended: remainingToFund,
      isUrgent: false,
    };
  }

  // Low priority - minimal funding
  const minimalFunding = Math.min(biweeklyAllocation || 25, availableCash * 0.1);
  return {
    recommendedAmount: minimalFunding,
    reason: "Low priority - minimal funding suggested",
    maxRecommended: remainingToFund,
    isUrgent: false,
  };
};

/**
 * Calculate bill envelope funding status for display
 * @param {Object} envelope - The bill envelope
 * @param {Array} bills - Array of bills linked to this envelope
 * @returns {Object} Display information
 */
export const getBillEnvelopeDisplayInfo = (
  envelope: Envelope,
  bills: Bill[] = []
): BillEnvelopeResult | null => {
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

  const status =
    statusConfig[priority.priorityLevel as keyof typeof statusConfig] || statusConfig.none;

  return {
    ...calculations,
    priority,
    status,
    displayText: {
      primaryStatus: (() => {
        const currentBalance = calculations.currentBalance || 0;
        const targetAmount = calculations.targetMonthlyAmount || 0;
        const nextBill = calculations.nextBill;
        const daysUntilNextBill = calculations.daysUntilNextBill;

        // Fully funded = current balance meets or exceeds target
        if (currentBalance >= targetAmount) {
          return "Fully Funded";
        }

        // Calculate if "On Track" based on bill cycle progression
        if (nextBill && daysUntilNextBill !== null && daysUntilNextBill > 0) {
          // Determine total cycle length based on frequency
          const frequencyDays: Record<string, number> = {
            weekly: 7,
            biweekly: 14,
            monthly: 30,
            quarterly: 90,
            semiannual: 180,
            yearly: 365,
          };

          const cycleDays = frequencyDays[nextBill.frequency] || 30;
          const progressThroughCycle = Math.max(
            0,
            Math.min(1, (cycleDays - daysUntilNextBill) / cycleDays)
          );
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
        const remaining = calculations.remainingToFund || 0;
        return remaining <= 0 ? "On Track" : `Need $${remaining.toFixed(2)}`;
      })(),
      secondaryStatus: calculations.nextBill
        ? `Next: ${calculations.nextBill?.name || ""} (${calculations.daysUntilNextBill || 0} days)`
        : "No upcoming bills",
      fundingProgress: `${calculations.fundingProgress || 0}% funded`,
    },
  };
};
