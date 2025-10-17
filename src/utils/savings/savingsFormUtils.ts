// Savings Goal Form Utilities - Constants and validation for savings goals
import logger from "../common/logger";

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
 * Validate savings goal form data
 */
export const validateSavingsGoalForm = (formData) => {
  const errors = [];

  // Required field validation
  if (!formData.name?.trim()) {
    errors.push("Goal name is required");
  }

  if (
    !formData.targetAmount ||
    isNaN(parseFloat(formData.targetAmount)) ||
    parseFloat(formData.targetAmount) <= 0
  ) {
    errors.push("Valid target amount is required");
  }

  // Current amount validation
  const currentAmount = parseFloat(formData.currentAmount) || 0;
  const targetAmount = parseFloat(formData.targetAmount) || 0;

  if (currentAmount < 0) {
    errors.push("Current amount cannot be negative");
  }

  if (currentAmount > targetAmount) {
    errors.push("Current amount cannot exceed target amount");
  }

  // Date validation
  if (formData.targetDate) {
    const targetDate = new Date(formData.targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(targetDate.getTime())) {
      errors.push("Invalid target date");
    } else if (targetDate < today) {
      errors.push("Target date cannot be in the past");
    }
  }

  // Category validation
  if (!SAVINGS_CATEGORIES.includes(formData.category)) {
    errors.push("Invalid category selected");
  }

  // Priority validation
  const validPriorities = SAVINGS_PRIORITIES.map((p) => p.value);
  if (!validPriorities.includes(formData.priority)) {
    errors.push("Invalid priority level");
  }

  // Color validation (basic hex color check)
  if (formData.color && !/^#[0-9A-F]{6}$/i.test(formData.color)) {
    errors.push("Invalid color format");
  }

  // Name length validation
  if (formData.name && formData.name.length > 100) {
    errors.push("Goal name cannot exceed 100 characters");
  }

  // Description length validation
  if (formData.description && formData.description.length > 500) {
    errors.push("Description cannot exceed 500 characters");
  }

  return errors;
};

/**
 * Process form data into savings goal object
 */
export const processSavingsGoalFormData = (formData, editingGoal = null) => {
  const validation = validateSavingsGoalForm(formData);
  if (validation.length > 0) {
    throw new Error(`Validation failed: ${validation.join(", ")}`);
  }

  const targetAmount = parseFloat(formData.targetAmount);
  const currentAmount = parseFloat(formData.currentAmount) || 0;

  const goalData = {
    name: formData.name.trim(),
    targetAmount,
    currentAmount,
    targetDate: formData.targetDate || null,
    category: formData.category,
    color: formData.color,
    description: formData.description?.trim() || "",
    priority: formData.priority,
    updatedAt: new Date().toISOString(),
  };

  // Add creation data for new goals
  if (!editingGoal) {
    goalData.createdAt = new Date().toISOString();
    goalData.id = `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  } else {
    goalData.id = editingGoal.id;
    goalData.createdAt = editingGoal.createdAt;
  }

  return goalData;
};

/**
 * Calculate suggested target date based on current savings rate
 */
export const suggestTargetDate = (targetAmount, currentAmount, monthlySavings) => {
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
  goals,
  totalAmount,
  distributionStrategy = "proportional"
) => {
  if (!totalAmount || totalAmount <= 0) return {};

  const activeGoals = goals.filter((goal) => !goal.isCompleted);
  if (activeGoals.length === 0) return {};

  const distribution = {};

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
export const validateDistribution = (distribution, totalAmount, tolerance = 0.01) => {
  const distributionTotal = Object.values(distribution).reduce((sum, amount) => {
    return sum + (parseFloat(amount) || 0);
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
export const formatCurrency = (amount, currency = "USD") => {
  if (typeof amount !== "number") {
    amount = parseFloat(amount) || 0;
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
export const formatPercentage = (value, decimals = 1) => {
  if (typeof value !== "number") {
    value = parseFloat(value) || 0;
  }

  return `${value.toFixed(decimals)}%`;
};
