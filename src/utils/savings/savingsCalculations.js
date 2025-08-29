// Savings Goal Calculations - Pure utility functions for savings goal math
import logger from "../common/logger";

/**
 * Calculate progress rate as percentage
 */
export const calculateProgressRate = (currentAmount, targetAmount) => {
  if (!targetAmount || targetAmount <= 0) return 0;
  return Math.min(100, Math.max(0, (currentAmount / targetAmount) * 100));
};

/**
 * Calculate remaining amount needed to reach goal
 */
export const calculateRemainingAmount = (currentAmount, targetAmount) => {
  return Math.max(0, (targetAmount || 0) - (currentAmount || 0));
};

/**
 * Check if savings goal is completed
 */
export const isGoalCompleted = (currentAmount, targetAmount) => {
  return (currentAmount || 0) >= (targetAmount || 0) && targetAmount > 0;
};

/**
 * Calculate days remaining until target date
 */
export const calculateDaysRemaining = (targetDate, fromDate = new Date()) => {
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
    logger.warn("Invalid target date for savings goal:", targetDate, error);
    return null;
  }
};

/**
 * Calculate monthly savings needed to reach goal by target date
 */
export const calculateMonthlySavingsNeeded = (
  remainingAmount,
  daysRemaining,
) => {
  if (!daysRemaining || daysRemaining <= 0) return 0;

  const monthsRemaining = Math.max(1, daysRemaining / 30);
  return remainingAmount / monthsRemaining;
};

/**
 * Determine goal urgency level based on progress and timeline
 */
export const determineGoalUrgency = (
  progressRate,
  daysRemaining,
  monthlyNeeded,
  affordableMonthly = 0,
) => {
  // Completed goals
  if (progressRate >= 100) return "completed";

  // Overdue goals (past target date)
  if (daysRemaining !== null && daysRemaining < 0) return "overdue";

  // No target date
  if (daysRemaining === null) return "no-deadline";

  // Urgent (less than 30 days remaining)
  if (daysRemaining <= 30) return "urgent";

  // Behind schedule (monthly needed exceeds affordable amount by 50%+)
  if (affordableMonthly > 0 && monthlyNeeded > affordableMonthly * 1.5)
    return "behind";

  // On track
  if (progressRate >= 25 && daysRemaining > 60) return "on-track";

  // Normal priority
  return "normal";
};

/**
 * Calculate goal timeline milestones
 */
export const calculateGoalMilestones = (
  currentAmount,
  targetAmount,
) => {
  if (!targetAmount || targetAmount <= 0) return [];

  const milestones = [];
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
 * Calculate recommended monthly contribution
 */
export const calculateRecommendedContribution = (
  remainingAmount,
  daysRemaining,
  availableCash = 0,
  riskTolerance = "medium",
) => {
  if (!daysRemaining || daysRemaining <= 0) {
    // No deadline - base on available cash and risk tolerance
    const riskMultipliers = { low: 0.1, medium: 0.2, high: 0.3 };
    return availableCash * (riskMultipliers[riskTolerance] || 0.2);
  }

  const baseMonthlyNeeded = calculateMonthlySavingsNeeded(
    remainingAmount,
    daysRemaining,
  );

  // Add buffer based on risk tolerance
  const bufferMultipliers = { low: 1.2, medium: 1.1, high: 1.05 };
  const recommendedAmount =
    baseMonthlyNeeded * (bufferMultipliers[riskTolerance] || 1.1);

  // Cap at available cash if specified
  if (availableCash > 0) {
    return Math.min(recommendedAmount, availableCash * 0.5); // Max 50% of available cash
  }

  return recommendedAmount;
};

/**
 * Process and enrich a savings goal with calculated fields
 */
export const processSavingsGoal = (goal, fromDate = new Date()) => {
  const currentAmount = goal.currentAmount || 0;
  const targetAmount = goal.targetAmount || 0;

  // Basic calculations
  const progressRate = calculateProgressRate(currentAmount, targetAmount);
  const remainingAmount = calculateRemainingAmount(currentAmount, targetAmount);
  const isCompleted = isGoalCompleted(currentAmount, targetAmount);
  const daysRemaining = calculateDaysRemaining(goal.targetDate, fromDate);

  // Timeline calculations
  const monthlyNeeded = calculateMonthlySavingsNeeded(
    remainingAmount,
    daysRemaining,
  );
  const urgency = determineGoalUrgency(
    progressRate,
    daysRemaining,
    monthlyNeeded,
  );
  const milestones = calculateGoalMilestones(
    currentAmount,
    targetAmount,
  );

  // Recommendation
  const recommendedContribution = calculateRecommendedContribution(
    remainingAmount,
    daysRemaining,
    0, // Will be provided by component
    goal.priority === "high"
      ? "high"
      : goal.priority === "low"
        ? "low"
        : "medium",
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
 * Sort savings goals by various criteria
 */
export const sortSavingsGoals = (
  goals,
  sortBy = "targetDate",
  sortOrder = "asc",
) => {
  return [...goals].sort((a, b) => {
    let aVal, bVal;

    switch (sortBy) {
      case "name":
        aVal = a.name?.toLowerCase() || "";
        bVal = b.name?.toLowerCase() || "";
        break;
      case "targetDate":
        aVal = a.targetDate ? new Date(a.targetDate) : new Date("2099-12-31");
        bVal = b.targetDate ? new Date(b.targetDate) : new Date("2099-12-31");
        break;
      case "priority": {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        aVal = priorityOrder[a.priority] || 2;
        bVal = priorityOrder[b.priority] || 2;
        break;
      }
      case "progress":
        aVal = a.progressRate || 0;
        bVal = b.progressRate || 0;
        break;
      case "targetAmount":
        aVal = a.targetAmount || 0;
        bVal = b.targetAmount || 0;
        break;
      case "currentAmount":
        aVal = a.currentAmount || 0;
        bVal = b.currentAmount || 0;
        break;
      case "remainingAmount":
        aVal = a.remainingAmount || 0;
        bVal = b.remainingAmount || 0;
        break;
      default:
        aVal = a.createdAt || "";
        bVal = b.createdAt || "";
    }

    if (sortOrder === "desc") {
      return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
    } else {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    }
  });
};

/**
 * Filter savings goals by status and other criteria
 */
export const filterSavingsGoals = (goals, filters = {}) => {
  const {
    status = "all",
    category,
    priority,
    urgency,
    includeCompleted = true,
    minAmount,
    maxAmount,
  } = filters;

  return goals.filter((goal) => {
    // Status filter
    if (status !== "all") {
      switch (status) {
        case "active":
          if (goal.isCompleted || goal.urgency === "paused") return false;
          break;
        case "completed":
          if (!goal.isCompleted) return false;
          break;
        case "overdue":
          if (goal.urgency !== "overdue") return false;
          break;
        case "urgent":
          if (goal.urgency !== "urgent") return false;
          break;
      }
    }

    // Completed filter
    if (!includeCompleted && goal.isCompleted) return false;

    // Category filter
    if (category && goal.category !== category) return false;

    // Priority filter
    if (priority && goal.priority !== priority) return false;

    // Urgency filter
    if (urgency && goal.urgency !== urgency) return false;

    // Amount filters
    if (minAmount && (goal.targetAmount || 0) < parseFloat(minAmount))
      return false;
    if (maxAmount && (goal.targetAmount || 0) > parseFloat(maxAmount))
      return false;

    return true;
  });
};

/**
 * Calculate savings goals summary statistics
 */
export const calculateSavingsSummary = (goals) => {
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.isCompleted).length;
  const activeGoals = totalGoals - completedGoals;

  const totalTargetAmount = goals.reduce(
    (sum, goal) => sum + (goal.targetAmount || 0),
    0,
  );
  const totalCurrentAmount = goals.reduce(
    (sum, goal) => sum + (goal.currentAmount || 0),
    0,
  );
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
