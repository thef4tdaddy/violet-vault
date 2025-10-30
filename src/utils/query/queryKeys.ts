// Query Key Factories - Consistent query key generation for TanStack Query
/**
 * Comprehensive query key factories for consistency across the application.
 * These factories ensure that cache invalidation and data fetching work reliably.
 */
export const queryKeys = {
  // Budget data
  budget: ["budget"],
  budgetData: () => [...queryKeys.budget, "data"],
  budgetSummary: () => [...queryKeys.budget, "summary"],

  // Budget metadata (unassigned cash, actual balance, etc.)
  budgetMetadata: ["budgetMetadata"],
  unassignedCash: () => [...queryKeys.budgetMetadata, "unassignedCash"],
  actualBalance: () => [...queryKeys.budgetMetadata, "actualBalance"],

  // Envelopes
  envelopes: ["envelopes"],
  envelopesList: (filters = {}) => [...queryKeys.envelopes, "list", filters],
  envelopeById: (id) => [...queryKeys.envelopes, "detail", id],
  envelopesByCategory: (category) => [...queryKeys.envelopes, "category", category],
  envelopeBalances: () => [...queryKeys.envelopes, "balances"],

  // Transactions
  transactions: ["transactions"],
  transactionsList: (filters = {}) => [...queryKeys.transactions, "list", filters],
  transactionById: (id) => [...queryKeys.transactions, "detail", id],
  transactionsByDateRange: (start, end) => [...queryKeys.transactions, "dateRange", start, end],
  transactionsByEnvelope: (envelopeId) => [...queryKeys.transactions, "envelope", envelopeId],

  // Bills
  bills: ["bills"],
  billsList: (filters = {}) => [...queryKeys.bills, "list", filters],
  billById: (id) => [...queryKeys.bills, "detail", id],
  upcomingBills: (days = 30) => [...queryKeys.bills, "upcoming", days],
  overdueBills: () => [...queryKeys.bills, "overdue"],

  // Savings Goals
  savingsGoals: ["savingsGoals"],
  savingsGoalsList: () => [...queryKeys.savingsGoals, "list"],
  savingsGoalById: (id) => [...queryKeys.savingsGoals, "detail", id],
  activeSavingsGoals: () => [...queryKeys.savingsGoals, "active"],

  // Receipts
  receipts: ["receipts"],
  receiptsList: (filters = {}) => [...queryKeys.receipts, "list", filters],
  receiptById: (id) => [...queryKeys.receipts, "detail", id],
  receiptsByTransaction: (transactionId) => [...queryKeys.receipts, "transaction", transactionId],

  // Analytics
  analytics: ["analytics"],
  analyticsSpending: (period) => [...queryKeys.analytics, "spending", period],
  analyticsTrends: (period) => [...queryKeys.analytics, "trends", period],
  analyticsCategories: (period) => [...queryKeys.analytics, "categories", period],
  analyticsBalance: () => [...queryKeys.analytics, "balance"],
  analyticsReport: (type, params) => [...queryKeys.analytics, type, params],

  // Dashboard
  dashboard: ["dashboard"],
  dashboardSummary: () => [...queryKeys.dashboard, "summary"],
  dashboardOverview: () => [...queryKeys.dashboard, "overview"],
  dashboardMetrics: () => [...queryKeys.dashboard, "metrics"],

  // Debt tracking
  debts: ["debts"],
  debtsList: () => [...queryKeys.debts, "list"],
  debtById: (id) => [...queryKeys.debts, "detail", id],
  debtPaymentPlan: (id) => [...queryKeys.debts, "paymentPlan", id],

  // Paycheck history
  paychecks: ["paychecks"],
  paycheckHistory: () => [...queryKeys.paychecks, "history"],
  paycheckPredictions: () => [...queryKeys.paychecks, "predictions"],

  // Budget History (version control)
  budgetHistory: ["budgetHistory"],
  budgetCommits: (options = {}) => [...queryKeys.budgetHistory, "commits", options],
  budgetCommit: (hash) => [...queryKeys.budgetHistory, "commit", hash],
  budgetChanges: (commitHash) => [...queryKeys.budgetHistory, "changes", commitHash],
  budgetHistoryStats: () => [...queryKeys.budgetHistory, "stats"],
  budgetBranches: () => [...queryKeys.budgetHistory, "branches"],
  budgetTags: () => [...queryKeys.budgetHistory, "tags"],

  // Sync and Cloud
  sync: ["sync"],
  syncStatus: () => [...queryKeys.sync, "status"],
  cloudData: () => [...queryKeys.sync, "cloudData"],
  syncActivity: () => [...queryKeys.sync, "activity"],
};

/**
 * Query key utilities for common operations
 */
export const queryKeyUtils = {
  /**
   * Get all query keys for a specific entity type
   */
  getEntityKeys: (entityType) => {
    const baseKey = queryKeys[entityType];
    if (!baseKey) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }
    return baseKey;
  },

  /**
   * Check if a query key matches a pattern
   */
  matchesPattern: (queryKey, pattern) => {
    if (!Array.isArray(queryKey) || !Array.isArray(pattern)) {
      return false;
    }

    return pattern.every((item, index) => {
      if (index >= queryKey.length) {
        return false;
      }
      return item === queryKey[index];
    });
  },

  /**
   * Create a query key matcher function
   */
  createMatcher: (pattern) => {
    return (queryKey) => queryKeyUtils.matchesPattern(queryKey, pattern);
  },

  /**
   * Get all related query keys for invalidation
   */
  getRelatedKeys: (entityType) => {
    const related = {
      envelopes: [queryKeys.envelopes, queryKeys.dashboard, queryKeys.budgetMetadata],
      transactions: [
        queryKeys.transactions,
        queryKeys.analytics,
        queryKeys.dashboard,
        queryKeys.budgetMetadata,
      ],
      bills: [queryKeys.bills, queryKeys.dashboard],
      savingsGoals: [queryKeys.savingsGoals, queryKeys.dashboard],
      debts: [queryKeys.debts, queryKeys.dashboard],
    };

    return related[entityType] || [[entityType]];
  },

  /**
   * Validate query key structure
   */
  isValidQueryKey: (queryKey) => {
    return Array.isArray(queryKey) && queryKey.length > 0;
  },

  /**
   * Create query key with timestamp for cache busting
   */
  withTimestamp: (baseKey, timestamp = Date.now()) => {
    return [...baseKey, "ts", timestamp];
  },

  /**
   * Create query key with user context
   */
  withUser: (baseKey, userId) => {
    return [...baseKey, "user", userId];
  },

  /**
   * Extract entity type from query key
   */
  getEntityType: (queryKey) => {
    if (!Array.isArray(queryKey) || queryKey.length === 0) {
      return null;
    }
    return queryKey[0];
  },

  /**
   * Create hierarchical query key
   */
  createHierarchical: (...segments) => {
    return segments.filter((segment) => segment !== null && segment !== undefined);
  },

  /**
   * Get query key depth
   */
  getDepth: (queryKey) => {
    return Array.isArray(queryKey) ? queryKey.length : 0;
  },
};
