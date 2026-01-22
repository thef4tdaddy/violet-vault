// Query Key Factories - Consistent query key generation for TanStack Query
/**
 * Comprehensive query key factories for consistency across the application.
 * These factories ensure that cache invalidation and data fetching work reliably.
 */

// Define types for our query keys
type QueryKey = readonly unknown[];
type EntityId = string | number;
type EntityType = string;
export type FilterParams = Record<string, unknown>;
type Timestamp = number;
type UserId = string;

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
  envelopesList: (filters: FilterParams = {}) => [...queryKeys.envelopes, "list", filters],
  envelopeById: (id: EntityId) => [...queryKeys.envelopes, "detail", id],
  envelopesByCategory: (category: string) => [...queryKeys.envelopes, "category", category],
  envelopeBalances: () => [...queryKeys.envelopes, "balances"],

  // Transactions
  transactions: ["transactions"],
  transactionsList: (filters: FilterParams = {}) => [...queryKeys.transactions, "list", filters],
  transactionById: (id: EntityId) => [...queryKeys.transactions, "detail", id],
  transactionsByDateRange: (start: string | Date, end: string | Date) => [
    ...queryKeys.transactions,
    "dateRange",
    start,
    end,
  ],
  transactionsByEnvelope: (envelopeId: EntityId) => [
    ...queryKeys.transactions,
    "envelope",
    envelopeId,
  ],

  // Bills
  bills: ["bills"],
  billsList: (filters: FilterParams = {}) => [...queryKeys.bills, "list", filters],
  billById: (id: EntityId) => [...queryKeys.bills, "detail", id],
  upcomingBills: (days: number = 30) => [...queryKeys.bills, "upcoming", days],
  overdueBills: () => [...queryKeys.bills, "overdue"],

  // Savings Goals
  savingsGoals: ["savingsGoals"],
  savingsGoalsList: () => [...queryKeys.savingsGoals, "list"],
  savingsGoalById: (id: EntityId) => [...queryKeys.savingsGoals, "detail", id],
  activeSavingsGoals: () => [...queryKeys.savingsGoals, "active"],

  // Receipts
  receipts: ["receipts"],
  receiptsList: (filters: FilterParams = {}) => [...queryKeys.receipts, "list", filters],
  receiptById: (id: EntityId) => [...queryKeys.receipts, "detail", id],
  receiptsByTransaction: (transactionId: EntityId) => [
    ...queryKeys.receipts,
    "transaction",
    transactionId,
  ],

  // Analytics
  analytics: ["analytics"],
  analyticsPredictions: (request?: Record<string, unknown>) =>
    [...queryKeys.analytics, "predictions", request] as const,
  analyticsSpending: (period: string) => [...queryKeys.analytics, "spending", period],
  analyticsTrends: (period: string) => [...queryKeys.analytics, "trends", period],
  analyticsCategories: (period: string) => [...queryKeys.analytics, "categories", period],
  analyticsBalance: () => [...queryKeys.analytics, "balance"],
  analyticsReport: (type: string, params: FilterParams) => [...queryKeys.analytics, type, params],

  // Dashboard
  dashboard: ["dashboard"],
  dashboardSummary: () => [...queryKeys.dashboard, "summary"],
  dashboardOverview: () => [...queryKeys.dashboard, "overview"],
  dashboardMetrics: () => [...queryKeys.dashboard, "metrics"],

  // Debt tracking
  debts: ["debts"],
  debtsList: () => [...queryKeys.debts, "list"],
  debtById: (id: EntityId) => [...queryKeys.debts, "detail", id],
  debtPaymentPlan: (id: EntityId) => [...queryKeys.debts, "paymentPlan", id],

  // Paycheck history
  paychecks: ["paychecks"],
  paycheckHistory: () => [...queryKeys.paychecks, "history"],
  paycheckPredictions: () => [...queryKeys.paychecks, "predictions"],

  // Budget History (version control)
  budgetHistory: ["budgetHistory"],
  budgetCommits: (options: FilterParams = {}) => [...queryKeys.budgetHistory, "commits", options],
  budgetCommit: (hash: string) => [...queryKeys.budgetHistory, "commit", hash],
  budgetChanges: (commitHash: string) => [...queryKeys.budgetHistory, "changes", commitHash],
  budgetHistoryStats: () => [...queryKeys.budgetHistory, "stats"],
  budgetBranches: () => [...queryKeys.budgetHistory, "branches"],
  budgetTags: () => [...queryKeys.budgetHistory, "tags"],

  // Sync and Cloud
  sync: ["sync"],
  syncStatus: () => [...queryKeys.sync, "status"],
  cloudData: () => [...queryKeys.sync, "cloudData"],
  syncActivity: () => [...queryKeys.sync, "activity"],

  // Auto-Funding
  autoFunding: {
    all: ["autoFunding"],
    rules: () => [...queryKeys.autoFunding.all, "rules"],
    rule: (id: EntityId) => [...queryKeys.autoFunding.all, "rule", id],
    history: (limit?: number) => [...queryKeys.autoFunding.all, "history", limit].filter(Boolean),
  },

  // SentinelShare - Cross-app transaction matching
  sentinelShare: ["sentinelShare"],
  sentinelReceipts: (filters: FilterParams = {}) => [
    ...queryKeys.sentinelShare,
    "receipts",
    filters,
  ],
  sentinelReceiptById: (id: EntityId) => [...queryKeys.sentinelShare, "receipt", id],
  sentinelPendingReceipts: () => [...queryKeys.sentinelShare, "pending"],
};

/**
 * Query key utilities for common operations
 */
export const queryKeyUtils = {
  /**
   * Get all query keys for a specific entity type
   */
  getEntityKeys: (entityType: EntityType) => {
    const baseKey = (queryKeys as Record<string, unknown>)[entityType];
    if (!baseKey) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }
    return baseKey;
  },

  /**
   * Check if a query key matches a pattern
   */
  matchesPattern: (queryKey: QueryKey, pattern: QueryKey) => {
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
  createMatcher: (pattern: QueryKey) => {
    return (queryKey: QueryKey) => queryKeyUtils.matchesPattern(queryKey, pattern);
  },

  /**
   * Get all related query keys for invalidation
   */
  getRelatedKeys: (entityType: EntityType) => {
    const related: Record<string, QueryKey[]> = {
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
  isValidQueryKey: (queryKey: QueryKey) => {
    return Array.isArray(queryKey) && queryKey.length > 0;
  },

  /**
   * Create query key with timestamp for cache busting
   */
  withTimestamp: (baseKey: QueryKey, timestamp: Timestamp = Date.now()) => {
    return [...baseKey, "ts", timestamp];
  },

  /**
   * Create query key with user context
   */
  withUser: (baseKey: QueryKey, userId: UserId) => {
    return [...baseKey, "user", userId];
  },

  /**
   * Extract entity type from query key
   */
  getEntityType: (queryKey: QueryKey) => {
    if (!Array.isArray(queryKey) || queryKey.length === 0) {
      return null;
    }
    return queryKey[0] as string;
  },

  /**
   * Create hierarchical query key
   */
  createHierarchical: (...segments: unknown[]) => {
    return segments.filter((segment) => segment !== null && segment !== undefined);
  },

  /**
   * Get query key depth
   */
  getDepth: (queryKey: QueryKey) => {
    return Array.isArray(queryKey) ? queryKey.length : 0;
  },
};
