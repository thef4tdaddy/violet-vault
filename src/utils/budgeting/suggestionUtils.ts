/**
 * Smart envelope suggestion utilities
 * Handles transaction analysis, pattern detection, and budget optimization
 */

/**
 * Chart colors for new envelope suggestions
 */
export const SUGGESTION_COLORS = [
  "#a855f7",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
  "#f97316",
  "#84cc16",
  "#6366f1",
];

/**
 * Default analysis settings
 */
export const DEFAULT_ANALYSIS_SETTINGS = {
  minAmount: 50,
  minTransactions: 3,
  overspendingThreshold: 1.2, // 120% of budget
  overfundingThreshold: 3.0, // 3x monthly budget in balance
  bufferPercentage: 1.1, // 110% for suggestions
};

/**
 * Merchant pattern matchers for spending categorization
 */
export const MERCHANT_PATTERNS = {
  "Online Shopping": /amazon|amzn|ebay|etsy|online/i,
  "Coffee & Drinks": /starbucks|coffee|cafe|dunkin|dutch|brew/i,
  "Gas Stations": /shell|exxon|chevron|bp|mobil|gas|fuel/i,
  Subscriptions: /netflix|spotify|hulu|disney|prime|subscription/i,
  Rideshare: /uber|lyft|taxi|ride/i,
  Pharmacy: /cvs|walgreens|pharmacy|drug/i,
  "Fast Food": /mcdonald|burger|taco|pizza|subway|kfc|wendy/i,
  "Grocery Delivery": /instacart|shipt|fresh|delivery/i,
  Streaming: /netflix|hulu|disney|hbo|paramount|apple.*tv/i,
  Fitness: /gym|fitness|planet|la.*fitness|crossfit/i,
};

// Type definitions
interface Transaction {
  amount: number;
  envelopeId?: string | number;
  category?: string;
  description?: string;
  date: string;
}

interface CategoryData {
  category: string;
  amount: number;
  count: number;
  transactions: Transaction[];
}

interface MerchantData {
  amount: number;
  count: number;
  transactions: Transaction[];
}

interface Envelope {
  id: string | number;
  name: string;
  category?: string;
  monthlyAmount?: number;
  currentBalance?: number;
}

interface AnalysisSettings {
  minAmount: number;
  minTransactions: number;
  overspendingThreshold?: number;
  overfundingThreshold?: number;
  bufferPercentage: number;
}

interface GenerateSuggestionsOptions {
  dismissedSuggestions?: Set<string>;
  showDismissed?: boolean;
}

// Suggestion interface
interface Suggestion {
  id: string;
  type: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  suggestedAmount: number;
  reasoning: string;
  action: string;
  impact: string;
  data: Record<string, unknown>;
}

/**
 * Filters transactions by date range
 * @param {Array} transactions - All transactions
 * @param {string|number} dateRange - Range identifier (7, 30, 90, etc.)
 * @returns {Array} Filtered transactions
 */
export const filterTransactionsByDateRange = (
  transactions: Transaction[],
  dateRange: string | number
): Transaction[] => {
  const now = new Date();
  const ranges: Record<string | number, Date> = {
    7: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    30: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    90: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
    "6months": new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
  };

  const startDate = ranges[dateRange] || ranges["6months"];
  return transactions.filter((t) => new Date(t.date) >= startDate);
};

/**
 * Calculates months of data for accurate monthly averages
 * @param {Array} transactions - Filtered transactions
 * @returns {number} Number of months represented in data
 */
export const calculateMonthsOfData = (transactions: Transaction[]): number => {
  if (transactions.length === 0) return 1;

  const dates = transactions.map((t) => new Date(t.date));
  const earliest = new Date(Math.min(...dates.map((d) => d.getTime())));
  const latest = new Date(Math.max(...dates.map((d) => d.getTime())));

  const monthsDiff =
    (latest.getFullYear() - earliest.getFullYear()) * 12 +
    (latest.getMonth() - earliest.getMonth()) +
    1;

  return Math.max(1, monthsDiff);
};

/**
 * Analyzes unassigned transactions and suggests new envelopes
 * @param {Array} transactions - All transactions
 * @param {number} monthsOfData - Months of data for calculations
 * @param {Object} settings - Analysis settings
 * @returns {Array} Array of suggestions
 */
export const analyzeUnassignedTransactions = (
  transactions: Transaction[],
  monthsOfData: number,
  settings: AnalysisSettings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Suggestion[] => {
  const suggestions: Suggestion[] = [];
  const { minAmount, minTransactions, bufferPercentage } = settings;

  // Get unassigned outgoing transactions
  const unassignedTransactions = transactions.filter(
    (t) => t.amount < 0 && (!t.envelopeId || t.envelopeId === "")
  );

  // Group by category
  const unassignedByCategory: Record<string, CategoryData> = {};
  unassignedTransactions.forEach((transaction) => {
    const category = transaction.category || "Uncategorized";
    if (!unassignedByCategory[category]) {
      unassignedByCategory[category] = {
        category,
        amount: 0,
        count: 0,
        transactions: [],
      };
    }
    unassignedByCategory[category].amount += Math.abs(transaction.amount);
    unassignedByCategory[category].count++;
    unassignedByCategory[category].transactions.push(transaction);
  });

  // Generate suggestions for significant categories
  Object.values(unassignedByCategory).forEach((categoryData, index) => {
    if (categoryData.amount >= minAmount && categoryData.count >= minTransactions) {
      const monthlyAverage = categoryData.amount / monthsOfData;
      const suggestedAmount = Math.ceil(monthlyAverage * bufferPercentage);

      suggestions.push({
        id: `unassigned_${categoryData.category}`,
        type: "new_envelope",
        priority: categoryData.amount > 200 ? "high" : "medium",
        title: `Create "${categoryData.category}" Envelope`,
        description: `$${categoryData.amount.toFixed(2)} spent in ${categoryData.count} unassigned transactions`,
        suggestedAmount: suggestedAmount,
        reasoning: `Based on ${categoryData.count} transactions, averaging $${monthlyAverage.toFixed(2)}/month`,
        action: "create_envelope",
        impact: "organization",
        data: {
          name: categoryData.category,
          monthlyAmount: suggestedAmount,
          category: categoryData.category,
          color: SUGGESTION_COLORS[index % SUGGESTION_COLORS.length],
        },
      });
    }
  });

  return suggestions;
};

/**
 * Analyzes merchant patterns in unassigned transactions
 * @param {Array} transactions - All transactions
 * @param {Array} envelopes - Existing envelopes
 * @param {number} monthsOfData - Months of data for calculations
 * @param {Object} settings - Analysis settings
 * @returns {Array} Array of merchant pattern suggestions
 */
export const analyzeMerchantPatterns = (
  transactions: Transaction[],
  envelopes: Envelope[],
  monthsOfData: number,
  settings: AnalysisSettings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Suggestion[] => {
  const suggestions: Suggestion[] = [];
  const { minAmount, minTransactions, bufferPercentage } = settings;

  // Get unassigned transactions
  const unassignedTransactions = transactions.filter(
    (t) => t.amount < 0 && (!t.envelopeId || t.envelopeId === "")
  );

  const merchantSpending: Record<string, MerchantData> = {};
  unassignedTransactions.forEach((transaction) => {
    const desc = (transaction.description || "").toLowerCase();

    Object.entries(MERCHANT_PATTERNS).forEach(([category, regex]) => {
      if (regex.test(desc)) {
        if (!merchantSpending[category]) {
          merchantSpending[category] = {
            amount: 0,
            count: 0,
            transactions: [],
          };
        }
        merchantSpending[category].amount += Math.abs(transaction.amount);
        merchantSpending[category].count++;
        merchantSpending[category].transactions.push(transaction);
      }
    });
  });

  // Generate suggestions for merchant patterns
  let colorIndex = 0;
  Object.entries(merchantSpending).forEach(([category, data]) => {
    if (data.amount >= minAmount && data.count >= minTransactions) {
      const monthlyAverage = data.amount / monthsOfData;
      const suggestedAmount = Math.ceil(monthlyAverage * bufferPercentage);

      // Check if similar envelope already exists
      const existingEnvelope = envelopes.find(
        (e) =>
          e.name.toLowerCase().includes(category.toLowerCase()) ||
          e.category?.toLowerCase().includes(category.toLowerCase())
      );

      if (!existingEnvelope) {
        suggestions.push({
          id: `merchant_${category}`,
          type: "merchant_pattern",
          priority: data.amount > 200 ? "high" : "medium",
          title: `Create "${category}" Envelope`,
          description: `$${data.amount.toFixed(2)} spent across ${data.count} ${category.toLowerCase()} transactions`,
          suggestedAmount: suggestedAmount,
          reasoning: `Detected spending pattern averaging $${monthlyAverage.toFixed(2)}/month`,
          action: "create_envelope",
          impact: "tracking",
          data: {
            name: category,
            monthlyAmount: suggestedAmount,
            category: category,
            color: SUGGESTION_COLORS[colorIndex % SUGGESTION_COLORS.length],
          },
        });
        colorIndex++;
      }
    }
  });

  return suggestions;
};

/**
 * Analyzes existing envelopes for budget optimization opportunities
 * @param {Array} transactions - All transactions
 * @param {Array} envelopes - Existing envelopes
 * @param {number} monthsOfData - Months of data for calculations
 * @param {Object} settings - Analysis settings
 * @returns {Array} Array of optimization suggestions
 */
export const analyzeEnvelopeOptimization = (
  transactions: Transaction[],
  envelopes: Envelope[],
  monthsOfData: number,
  settings: AnalysisSettings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Suggestion[] => {
  const suggestions: Suggestion[] = [];
  const { overspendingThreshold = 1.2, overfundingThreshold = 3.0, bufferPercentage } = settings;

  envelopes.forEach((envelope) => {
    const envelopeTransactions = transactions.filter(
      (t) => t.amount < 0 && t.envelopeId === envelope.id
    );

    if (envelopeTransactions.length === 0) return;

    const totalSpent = envelopeTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const monthlySpent = totalSpent / monthsOfData;
    const monthlyBudget = envelope.monthlyAmount || 0;

    // Overspending detection
    if (monthlySpent > monthlyBudget * overspendingThreshold && monthlyBudget > 0) {
      const overage = monthlySpent - monthlyBudget;
      const suggestedAmount = Math.ceil(monthlySpent * bufferPercentage);

      suggestions.push({
        id: `overspend_${envelope.id}`,
        type: "increase_envelope",
        priority: monthlySpent > monthlyBudget * 1.5 ? "high" : "medium",
        title: `Increase "${envelope.name}" Budget`,
        description: `Spending $${monthlySpent.toFixed(2)}/month vs $${monthlyBudget.toFixed(2)} budgeted`,
        suggestedAmount: suggestedAmount,
        reasoning: `Overspending by $${overage.toFixed(2)}/month consistently`,
        action: "increase_budget",
        impact: "accuracy",
        data: {
          envelopeId: envelope.id,
          currentAmount: monthlyBudget,
          suggestedAmount: suggestedAmount,
        },
      });
    }

    // Overfunding detection
    const currentBalance = envelope.currentBalance || 0;
    if (
      currentBalance > monthlyBudget * overfundingThreshold &&
      monthlyBudget > 0 &&
      monthlySpent < monthlyBudget * 0.6
    ) {
      const suggestedAmount = Math.ceil(monthlySpent * 1.3); // 30% buffer for low-usage

      suggestions.push({
        id: `overfund_${envelope.id}`,
        type: "decrease_envelope",
        priority: "low",
        title: `Reduce "${envelope.name}" Budget`,
        description: `Using only $${monthlySpent.toFixed(2)}/month of $${monthlyBudget.toFixed(2)} budget`,
        suggestedAmount: suggestedAmount,
        reasoning: `Balance of $${currentBalance.toFixed(2)} suggests overfunding`,
        action: "decrease_budget",
        impact: "efficiency",
        data: {
          envelopeId: envelope.id,
          currentAmount: monthlyBudget,
          suggestedAmount: suggestedAmount,
        },
      });
    }
  });

  return suggestions;
};

/**
 * Combines all suggestion types and sorts by priority
 * @param {Array} transactions - All transactions
 * @param {Array} envelopes - Existing envelopes
 * @param {Object} settings - Analysis settings
 * @param {string} dateRange - Date range for analysis
 * @param {Object} options - Additional options (dismissedSuggestions, showDismissed)
 * @returns {Array} Sorted array of all suggestions
 */
export const generateAllSuggestions = (
  transactions: Transaction[],
  envelopes: Envelope[],
  settings: AnalysisSettings,
  dateRange: string | number,
  options: GenerateSuggestionsOptions = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Suggestion[] => {
  const { dismissedSuggestions = new Set(), showDismissed = false } = options;
  const filteredTransactions = filterTransactionsByDateRange(transactions, dateRange);
  const monthsOfData = calculateMonthsOfData(filteredTransactions);

  const allSuggestions = [
    ...analyzeUnassignedTransactions(filteredTransactions, monthsOfData, settings),
    ...analyzeMerchantPatterns(filteredTransactions, envelopes, monthsOfData, settings),
    ...analyzeEnvelopeOptimization(filteredTransactions, envelopes, monthsOfData, settings),
  ];

  // Sort by priority and filter dismissed
  const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
  return allSuggestions
    .filter((s) => showDismissed || !dismissedSuggestions.has(s.id))
    .sort((a, b) => {
      const aPriority = priorityOrder[a.priority] ?? 0;
      const bPriority = priorityOrder[b.priority] ?? 0;
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      return b.suggestedAmount - a.suggestedAmount;
    })
    .slice(0, 10); // Limit to top 10
};

/**
 * Gets appropriate icon component name for suggestion type
 * @param {string} type - Suggestion type
 * @returns {string} Icon component name
 */
export const getSuggestionTypeIcon = (type: string): string => {
  switch (type) {
    case "new_envelope":
    case "merchant_pattern":
      return "Plus";
    case "increase_envelope":
      return "TrendingUp";
    case "decrease_envelope":
      return "TrendingDown";
    default:
      return "Eye";
  }
};

/**
 * Gets appropriate icon component name for priority level
 * @param {string} priority - Priority level
 * @returns {string} Icon component name
 */
export const getSuggestionPriorityIcon = (priority: string): string => {
  switch (priority) {
    case "high":
      return "AlertTriangle";
    case "medium":
      return "Lightbulb";
    case "low":
      return "Target";
    default:
      return "Zap";
  }
};

/**
 * Gets CSS color class for priority level
 * @param {string} priority - Priority level
 * @returns {string} CSS color class
 */
export const getSuggestionPriorityColor = (priority: string): string => {
  switch (priority) {
    case "high":
      return "text-red-500";
    case "medium":
      return "text-amber-500";
    case "low":
      return "text-blue-500";
    default:
      return "text-gray-500";
  }
};
