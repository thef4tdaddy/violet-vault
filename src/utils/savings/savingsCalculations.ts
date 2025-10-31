// Savings Goal Calculations - Pure utility functions for savings goal math
import logger from "../common/logger";

/**
 * Calculate progress rate as percentage
 */
export const calculateProgressRate = (currentAmount: number, targetAmount: number): number => {
  if (!targetAmount || targetAmount <= 0) return 0;
  return Math.min(100, Math.max(0, (currentAmount / targetAmount) * 100));
};

/**
 * Calculate remaining amount needed to reach goal
 */
export const calculateRemainingAmount = (currentAmount: number, targetAmount: number): number => {
  return Math.max(0, (targetAmount || 0) - (currentAmount || 0));
};

/**
 * Check if savings goal is completed
 */
export const isGoalCompleted = (currentAmount: number, targetAmount: number): boolean => {
  return (currentAmount || 0) >= (targetAmount || 0) && targetAmount > 0;
};

/**
 * Calculate days remaining until target date
 */
export const calculateDaysRemaining = (
  targetDate: Date | string | undefined,
  fromDate: Date | string = new Date()
): number | null => {
  if (!targetDate) return null;

  try {
    const target = new Date(targetDate);
    const from = new Date(fromDate);

    if (isNaN(target.getTime()) || isNaN(from.getTime())) {
      return null;
    }

    const timeDiff = target.getTime() - from.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.warn("Invalid target date for savings goal:", { targetDate, error: errorMessage });
    return null;
  }
};

/**
 * Calculate monthly savings needed to reach goal by target date
 */
export const calculateMonthlySavingsNeeded = (
  remainingAmount: number,
  daysRemaining: number | null
): number => {
  if (!daysRemaining || daysRemaining <= 0) return 0;

  const monthsRemaining = Math.max(1, daysRemaining / 30);
  return remainingAmount / monthsRemaining;
};

/**
 * Urgency level type
 */
export type UrgencyLevel =
  | "completed"
  | "overdue"
  | "no-deadline"
  | "urgent"
  | "behind"
  | "on-track"
  | "normal"
  | "paused";

/**
 * Determine goal urgency level based on progress and timeline
 */
export const determineGoalUrgency = (
  progressRate: number,
  daysRemaining: number | null,
  monthlyNeeded: number,
  affordableMonthly: number = 0
): UrgencyLevel => {
  // Completed goals
  if (progressRate >= 100) return "completed";

  // Overdue goals (past target date)
  if (daysRemaining !== null && daysRemaining < 0) return "overdue";

  // No target date
  if (daysRemaining === null) return "no-deadline";

  // Urgent (less than 30 days remaining)
  if (daysRemaining <= 30) return "urgent";

  // Behind schedule (monthly needed exceeds affordable amount by 50%+)
  if (affordableMonthly > 0 && monthlyNeeded > affordableMonthly * 1.5) return "behind";

  // On track
  if (progressRate >= 25 && daysRemaining > 60) return "on-track";

  // Normal priority
  return "normal";
};

/**
 * Milestone interface
 */
export interface Milestone {
  percentage: number;
  amount: number;
  isReached: boolean;
  label: string;
}

/**
 * Calculate goal timeline milestones
 */
export const calculateGoalMilestones = (
  currentAmount: number,
  targetAmount: number
): Milestone[] => {
  if (!targetAmount || targetAmount <= 0) return [];

  const milestones: Milestone[] = [];
  const percentages = [25, 50, 75, 100];

  percentages.forEach((percentage) => {
    const milestoneAmount = (targetAmount * percentage) / 100;
    const isReached = currentAmount >= milestoneAmount;

    milestones.push({
      percentage,
      amount: milestoneAmount,
      isReached,
      label: percentage === 100 ? "Goal Complete" : `${percentage}% Milestone`,
    });
  });

  return milestones;
};

/**
 * Risk tolerance type
 */
export type RiskTolerance = "low" | "medium" | "high";

/**
 * Calculate recommended monthly contribution
 */
export const calculateRecommendedContribution = (
  remainingAmount: number,
  daysRemaining: number | null,
  availableCash: number = 0,
  riskTolerance: RiskTolerance = "medium"
): number => {
  if (!daysRemaining || daysRemaining <= 0) {
    // No deadline - base on available cash and risk tolerance
    const riskMultipliers: Record<RiskTolerance, number> = { low: 0.1, medium: 0.2, high: 0.3 };
    return availableCash * (riskMultipliers[riskTolerance] || 0.2);
  }

  const baseMonthlyNeeded = calculateMonthlySavingsNeeded(remainingAmount, daysRemaining);

  // Add buffer based on risk tolerance
  const bufferMultipliers: Record<RiskTolerance, number> = { low: 1.2, medium: 1.1, high: 1.05 };
  const recommendedAmount = baseMonthlyNeeded * (bufferMultipliers[riskTolerance] || 1.1);

  // Cap at available cash if specified
  if (availableCash > 0) {
    return Math.min(recommendedAmount, availableCash * 0.5); // Max 50% of available cash
  }

  return recommendedAmount;
};

/**
 * Savings goal input interface
 */
export interface SavingsGoalInput {
  id?: string;
  name?: string;
  category?: string;
  priority?: "low" | "medium" | "high";
  targetAmount?: number;
  currentAmount?: number;
  targetDate?: Date | string;
  isPaused?: boolean;
  isCompleted?: boolean;
  lastModified?: number;
  createdAt?: number;
  description?: string;
  monthlyContribution?: number;
  [key: string]: unknown;
}

/**
 * Enriched savings goal interface
 */
export interface EnrichedSavingsGoal extends SavingsGoalInput {
  progressRate: number;
  remainingAmount: number;
  isCompleted: boolean;
  daysRemaining: number | null;
  monthlyNeeded: number;
  urgency: UrgencyLevel;
  milestones: Milestone[];
  recommendedContribution: number;
}

/**
 * Process and enrich a savings goal with calculated fields
 */
export const processSavingsGoal = (
  goal: SavingsGoalInput,
  fromDate: Date | string = new Date()
): EnrichedSavingsGoal => {
  const currentAmount = goal.currentAmount || 0;
  const targetAmount = goal.targetAmount || 0;

  // Basic calculations
  const progressRate = calculateProgressRate(currentAmount, targetAmount);
  const remainingAmount = calculateRemainingAmount(currentAmount, targetAmount);
  const isCompleted = isGoalCompleted(currentAmount, targetAmount);
  const daysRemaining = calculateDaysRemaining(goal.targetDate, fromDate);

  // Timeline calculations
  const monthlyNeeded = calculateMonthlySavingsNeeded(remainingAmount, daysRemaining);
  const urgency = determineGoalUrgency(progressRate, daysRemaining, monthlyNeeded);
  const milestones = calculateGoalMilestones(currentAmount, targetAmount);

  // Recommendation
  const riskTolerance: RiskTolerance =
    goal.priority === "high" ? "high" : goal.priority === "low" ? "low" : "medium";
  const recommendedContribution = calculateRecommendedContribution(
    remainingAmount,
    daysRemaining,
    0, // Will be provided by component
    riskTolerance
  );

  return {
    ...goal,
    progressRate: Math.round(progressRate * 100) / 100, // Round to 2 decimal places
    remainingAmount,
    isCompleted,
    daysRemaining,
    monthlyNeeded: Math.round(monthlyNeeded * 100) / 100,
    urgency,
    milestones,
    recommendedContribution: Math.round(recommendedContribution * 100) / 100,
  };
};

/**
 * Sort field type
 */
export type SortField =
  | "name"
  | "targetDate"
  | "priority"
  | "progress"
  | "targetAmount"
  | "currentAmount"
  | "remainingAmount";

/**
 * Sort order type
 */
export type SortOrder = "asc" | "desc";

/**
 * Sort value type
 */
type SortValue = string | number | Date;

/**
 * Get sort value from goal based on field
 */
const getSavingsGoalSortValue = (goal: EnrichedSavingsGoal, sortBy: SortField): SortValue => {
  const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };

  const valueExtractors: Record<SortField, () => SortValue> = {
    name: () => goal.name?.toLowerCase() || "",
    targetDate: () => (goal.targetDate ? new Date(goal.targetDate) : new Date("2099-12-31")),
    priority: () => priorityOrder[goal.priority || "medium"] || 2,
    progress: () => goal.progressRate || 0,
    targetAmount: () => goal.targetAmount || 0,
    currentAmount: () => goal.currentAmount || 0,
    remainingAmount: () => goal.remainingAmount || 0,
  };

  const extractor = valueExtractors[sortBy];
  return extractor ? extractor() : goal.createdAt || "";
};

/**
 * Compare two values for sorting
 */
const compareSortValues = (aVal: SortValue, bVal: SortValue, sortOrder: SortOrder): number => {
  if (sortOrder === "desc") {
    return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
  }
  return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
};

/**
 * Sort savings goals by various criteria
 */
export const sortSavingsGoals = (
  goals: EnrichedSavingsGoal[],
  sortBy: SortField = "targetDate",
  sortOrder: SortOrder = "asc"
): EnrichedSavingsGoal[] => {
  return [...goals].sort((a, b) => {
    const aVal = getSavingsGoalSortValue(a, sortBy);
    const bVal = getSavingsGoalSortValue(b, sortBy);
    return compareSortValues(aVal, bVal, sortOrder);
  });
};

/**
 * Filter status type
 */
export type FilterStatus = "all" | "active" | "completed" | "overdue" | "urgent";

/**
 * Filter options interface
 */
export interface FilterOptions {
  status?: FilterStatus;
  category?: string;
  priority?: "low" | "medium" | "high";
  urgency?: UrgencyLevel;
  includeCompleted?: boolean;
  minAmount?: string | number;
  maxAmount?: string | number;
}

/**
 * Check if goal matches status filter
 */
const matchesStatusFilter = (goal: EnrichedSavingsGoal, status: FilterStatus): boolean => {
  if (status === "all") return true;

  switch (status) {
    case "active":
      return !goal.isCompleted && goal.urgency !== "paused";
    case "completed":
      return goal.isCompleted;
    case "overdue":
      return goal.urgency === "overdue";
    case "urgent":
      return goal.urgency === "urgent";
    default:
      return true;
  }
};

/**
 * Check if goal matches attribute filters
 */
const matchesAttributeFilters = (goal: EnrichedSavingsGoal, filters: FilterOptions): boolean => {
  const { category, priority, urgency, includeCompleted, minAmount, maxAmount } = filters;

  if (!includeCompleted && goal.isCompleted) return false;
  if (category && goal.category !== category) return false;
  if (priority && goal.priority !== priority) return false;
  if (urgency && goal.urgency !== urgency) return false;
  if (minAmount && (goal.targetAmount || 0) < parseFloat(String(minAmount))) return false;
  if (maxAmount && (goal.targetAmount || 0) > parseFloat(String(maxAmount))) return false;

  return true;
};

/**
 * Filter savings goals by status and other criteria
 */
export const filterSavingsGoals = (
  goals: EnrichedSavingsGoal[],
  filters: FilterOptions = {}
): EnrichedSavingsGoal[] => {
  const { status = "all", includeCompleted = true } = filters;

  return goals.filter((goal) => {
    if (!matchesStatusFilter(goal, status)) return false;
    if (!matchesAttributeFilters(goal, { ...filters, includeCompleted })) return false;
    return true;
  });
};

/**
 * Savings summary interface
 */
export interface SavingsSummary {
  totalGoals: number;
  completedGoals: number;
  activeGoals: number;
  totalTargetAmount: number;
  totalCurrentAmount: number;
  totalRemainingAmount: number;
  overallProgressRate: number;
  urgentGoals: number;
  overdueGoals: number;
  totalMonthlyNeeded: number;
}

/**
 * Calculate savings goals summary statistics
 */
export const calculateSavingsSummary = (goals: EnrichedSavingsGoal[]): SavingsSummary => {
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.isCompleted).length;
  const activeGoals = totalGoals - completedGoals;

  const totalTargetAmount = goals.reduce((sum, goal) => sum + (goal.targetAmount || 0), 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + (goal.currentAmount || 0), 0);
  const totalRemainingAmount = totalTargetAmount - totalCurrentAmount;

  const overallProgressRate =
    totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  const urgentGoals = goals.filter((g) => g.urgency === "urgent").length;
  const overdueGoals = goals.filter((g) => g.urgency === "overdue").length;

  const totalMonthlyNeeded = goals
    .filter((g) => !g.isCompleted)
    .reduce((sum, goal) => sum + (goal.monthlyNeeded || 0), 0);

  return {
    totalGoals,
    completedGoals,
    activeGoals,
    totalTargetAmount,
    totalCurrentAmount,
    totalRemainingAmount,
    overallProgressRate: Math.round(overallProgressRate * 100) / 100,
    urgentGoals,
    overdueGoals,
    totalMonthlyNeeded: Math.round(totalMonthlyNeeded * 100) / 100,
  };
};
