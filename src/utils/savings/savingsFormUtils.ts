// Savings Goal Form Utilities - Constants and validation for savings goals
import logger from "@/utils/common/logger";
import {
  validateSavingsGoalFormSafe,
  type SavingsGoalFormData,
} from "@/domain/schemas/savings-goal";

// Savings goal categories
export const SAVINGS_CATEGORIES = [
  "Emergency Fund",
  "Vacation",
  "Car",
  "Home",
  "Education",
  "Electronics",
  "Wedding",
  "Medical",
  "Retirement",
  "Investment",
  "Debt Payoff",
  "General",
];

// Priority levels
export const SAVINGS_PRIORITIES = [
  { value: "high", label: "High Priority", color: "#EF4444" },
  { value: "medium", label: "Medium Priority", color: "#F59E0B" },
  { value: "low", label: "Low Priority", color: "#10B981" },
];

// Color options for goals
export const SAVINGS_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#84CC16", // Lime
  "#EC4899", // Pink
  "#6B7280", // Gray
];

// Default form data structure
export const getDefaultSavingsGoalFormData = (editingGoal = null) => {
  if (editingGoal) {
    return {
      name: editingGoal.name || "",
      targetAmount: editingGoal.targetAmount?.toString() || "",
      currentAmount: editingGoal.currentAmount?.toString() || "0",
      targetDate: editingGoal.targetDate || "",
      category: editingGoal.category || "General",
      color: editingGoal.color || "#3B82F6",
      description: editingGoal.description || "",
      priority: editingGoal.priority || "medium",
    };
  }

  return {
    name: "",
    targetAmount: "",
    currentAmount: "0",
    targetDate: "",
    category: "General",
    color: "#3B82F6",
    description: "",
    priority: "medium",
  };
};

/**
 * Validate savings goal form data using Zod schema
 * @returns Array of error messages (empty if valid)
 */
export const validateSavingsGoalForm = (formData: unknown): string[] => {
  const result = validateSavingsGoalFormSafe(formData);

  if (result.success) {
    return [];
  }

  // Extract error messages from Zod validation errors
  return result.error?.issues.map((err) => err.message) || [];
};

interface SavingsGoalData {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  category: string;
  color: string;
  description: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  isCompleted?: boolean;
  monthlyNeeded?: number;
  remainingAmount?: number;
}

/**
 * Process form data into savings goal object
 */
export const processSavingsGoalFormData = (
  formData: SavingsGoalFormData,
  editingGoal: SavingsGoalData | null = null
): SavingsGoalData => {
  // Parse and validate with Zod schema
  const result = validateSavingsGoalFormSafe(formData);
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.issues.map((e) => e.message).join(", ")}`);
  }

  const validatedData = result.data;
  const targetAmount = parseFloat(validatedData.targetAmount);
  const currentAmount = parseFloat(validatedData.currentAmount);

  const goalData: SavingsGoalData = {
    id: editingGoal?.id || `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: validatedData.name,
    targetAmount,
    currentAmount,
    targetDate: validatedData.targetDate || null,
    category: validatedData.category,
    color: validatedData.color,
    description: validatedData.description || "",
    priority: validatedData.priority,
    createdAt: editingGoal?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return goalData;
};

/**
 * Calculate suggested target date based on current savings rate
 */
export const suggestTargetDate = (
  targetAmount: number,
  currentAmount: number,
  monthlySavings: number
): string | null => {
  if (!monthlySavings || monthlySavings <= 0) return null;

  const remainingAmount = Math.max(0, targetAmount - currentAmount);
  const monthsNeeded = Math.ceil(remainingAmount / monthlySavings);

  const suggestedDate = new Date();
  suggestedDate.setMonth(suggestedDate.getMonth() + monthsNeeded);

  return suggestedDate.toISOString().split("T")[0]; // Return YYYY-MM-DD format
};

/**
 * Calculate distribution amounts for multiple goals
 */
export const calculateGoalDistribution = (
  goals: SavingsGoalData[],
  totalAmount: number,
  distributionStrategy = "proportional"
): Record<string, number> => {
  if (!totalAmount || totalAmount <= 0) return {};

  const activeGoals = goals.filter((goal) => !goal.isCompleted);
  if (activeGoals.length === 0) return {};

  const distribution: Record<string, number> = {};

  switch (distributionStrategy) {
    case "equal": {
      // Distribute equally among all active goals
      const equalAmount = totalAmount / activeGoals.length;
      activeGoals.forEach((goal) => {
        distribution[goal.id] = Math.round(equalAmount * 100) / 100;
      });
      break;
    }

    case "priority": {
      // Distribute based on priority (high: 50%, medium: 30%, low: 20%)
      const priorityWeights = { high: 0.5, medium: 0.3, low: 0.2 };
      const totalWeight = activeGoals.reduce((sum, goal) => {
        return sum + (priorityWeights[goal.priority] || 0.3);
      }, 0);

      activeGoals.forEach((goal) => {
        const weight = priorityWeights[goal.priority] || 0.3;
        const amount = (totalAmount * weight) / totalWeight;
        distribution[goal.id] = Math.round(amount * 100) / 100;
      });
      break;
    }

    case "need": {
      // Distribute based on monthly savings needed
      const totalMonthlyNeeded = activeGoals.reduce((sum, goal) => {
        return sum + (goal.monthlyNeeded || 0);
      }, 0);

      if (totalMonthlyNeeded > 0) {
        activeGoals.forEach((goal) => {
          const monthlyNeeded = goal.monthlyNeeded || 0;
          const proportion = monthlyNeeded / totalMonthlyNeeded;
          distribution[goal.id] = Math.round(totalAmount * proportion * 100) / 100;
        });
      } else {
        // Fall back to equal distribution
        const equalAmount = totalAmount / activeGoals.length;
        activeGoals.forEach((goal) => {
          distribution[goal.id] = Math.round(equalAmount * 100) / 100;
        });
      }
      break;
    }

    case "proportional":
    default: {
      // Distribute proportionally based on remaining amounts
      const totalRemaining = activeGoals.reduce((sum, goal) => {
        return sum + (goal.remainingAmount || 0);
      }, 0);

      if (totalRemaining > 0) {
        activeGoals.forEach((goal) => {
          const remaining = goal.remainingAmount || 0;
          const proportion = remaining / totalRemaining;
          distribution[goal.id] = Math.round(totalAmount * proportion * 100) / 100;
        });
      } else {
        // Fall back to equal distribution
        const equalAmount = totalAmount / activeGoals.length;
        activeGoals.forEach((goal) => {
          distribution[goal.id] = Math.round(equalAmount * 100) / 100;
        });
      }
      break;
    }
  }

  return distribution;
};

/**
 * Validate distribution amounts
 */
export const validateDistribution = (
  distribution: Record<string, number>,
  totalAmount: number,
  tolerance = 0.01
) => {
  const distributionTotal = Object.values(distribution).reduce((sum, amount) => {
    return sum + (parseFloat(String(amount)) || 0);
  }, 0);

  const difference = Math.abs(distributionTotal - totalAmount);

  return {
    isValid: difference <= tolerance,
    difference,
    distributionTotal,
    expectedTotal: totalAmount,
  };
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number | string, currency = "USD"): string => {
  if (typeof amount !== "number") {
    amount = parseFloat(String(amount)) || 0;
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    logger.warn("Error formatting currency:", error);
    return `$${amount.toFixed(2)}`;
  }
};

/**
 * Format percentage for display
 */
export const formatPercentage = (value: number | string, decimals = 1): string => {
  if (typeof value !== "number") {
    value = parseFloat(String(value)) || 0;
  }

  return `${value.toFixed(decimals)}%`;
};
