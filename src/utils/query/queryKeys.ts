// Query Key Factories - Consistent query key generation for TanStack Query
/**
 * Comprehensive query key factories for consistency across the application.
 * These factories ensure that cache invalidation and data fetching work reliably.
 */
export const queryKeys = {
  // Budget data
  budget: ["budget"] as const,
  budgetData: () => [...queryKeys.budget, "data"] as const,
  budgetSummary: () => [...queryKeys.budget, "summary"] as const,

  // Budget metadata (unassigned cash, actual balance, etc.)
  budgetMetadata: ["budgetMetadata"] as const,
  unassignedCash: () => [...queryKeys.budgetMetadata, "unassignedCash"] as const,
  actualBalance: () => [...queryKeys.budgetMetadata, "actualBalance"] as const,

  // Envelopes
  envelopes: ["envelopes"] as const,
  envelopesList: (filters: Record<string, unknown> = {}) =>
    [...queryKeys.envelopes, "list", filters] as const,
  envelopeById: (id: string) => [...queryKeys.envelopes, "detail", id] as const,
  envelopesByCategory: (category: string) =>
    [...queryKeys.envelopes, "category", category] as const,
  envelopeBalances: () => [...queryKeys.envelopes, "balances"] as const,

  // Transactions
  transactions: ["transactions"] as const,
  transactionsList: (filters: Record<string, unknown> = {}) =>
    [...queryKeys.transactions, "list", filters] as const,
  transactionById: (id: string) => [...queryKeys.transactions, "detail", id] as const,
  transactionsByDateRange: (start: string | number | Date, end: string | number | Date) =>
    [...queryKeys.transactions, "dateRange", start, end] as const,
  transactionsByEnvelope: (envelopeId: string) =>
    [...queryKeys.transactions, "envelope", envelopeId] as const,

  // Bills
  bills: ["bills"] as const,
  billsList: (filters: Record<string, unknown> = {}) =>
    [...queryKeys.bills, "list", filters] as const,
  billById: (id: string) => [...queryKeys.bills, "detail", id] as const,
  upcomingBills: (days: number = 30) => [...queryKeys.bills, "upcoming", days] as const,
  overdueBills: () => [...queryKeys.bills, "overdue"] as const,

  // Savings Goals
  savingsGoals: ["savingsGoals"] as const,
  savingsGoalsList: () => [...queryKeys.savingsGoals, "list"] as const,
  savingsGoalById: (id: string) => [...queryKeys.savingsGoals, "detail", id] as const,
  activeSavingsGoals: () => [...queryKeys.savingsGoals, "active"] as const,

  // Receipts
  receipts: ["receipts"] as const,
  receiptsList: (filters: Record<string, unknown> = {}) =>
    [...queryKeys.receipts, "list", filters] as const,
  receiptById: (id: string) => [...queryKeys.receipts, "detail", id] as const,
  receiptsByTransaction: (transactionId: string) =>
    [...queryKeys.receipts, "transaction", transactionId] as const,

  // Analytics
  analytics: ["analytics"] as const,
  analyticsSpending: (period: string) => [...queryKeys.analytics, "spending", period] as const,
  analyticsTrends: (period: string) => [...queryKeys.analytics, "trends", period] as const,
  analyticsCategories: (period: string) => [...queryKeys.analytics, "categories", period] as const,
  analyticsBalance: () => [...queryKeys.analytics, "balance"] as const,
  analyticsReport: (type: string, params: Record<string, unknown>) =>
    [...queryKeys.analytics, type, params] as const,

  // Dashboard
  dashboard: ["dashboard"] as const,
  dashboardSummary: () => [...queryKeys.dashboard, "summary"] as const,
  dashboardOverview: () => [...queryKeys.dashboard, "overview"] as const,
  dashboardMetrics: () => [...queryKeys.dashboard, "metrics"] as const,

  // Debt tracking
  debts: ["debts"] as const,
  debtsList: () => [...queryKeys.debts, "list"] as const,
  debtById: (id: string) => [...queryKeys.debts, "detail", id] as const,
  debtPaymentPlan: (id: string) => [...queryKeys.debts, "paymentPlan", id] as const,

  // Paycheck history
  paychecks: ["paychecks"] as const,
  paycheckHistory: () => [...queryKeys.paychecks, "history"] as const,
  paycheckPredictions: () => [...queryKeys.paychecks, "predictions"] as const,

  // Budget History (version control)
  budgetHistory: ["budgetHistory"] as const,
  budgetCommits: (options: Record<string, unknown> = {}) =>
    [...queryKeys.budgetHistory, "commits", options] as const,
  budgetCommit: (hash: string) => [...queryKeys.budgetHistory, "commit", hash] as const,
  budgetChanges: (commitHash: string) =>
    [...queryKeys.budgetHistory, "changes", commitHash] as const,
  budgetHistoryStats: () => [...queryKeys.budgetHistory, "stats"] as const,
  budgetBranches: () => [...queryKeys.budgetHistory, "branches"] as const,
  budgetTags: () => [...queryKeys.budgetHistory, "tags"] as const,

  // Sync and Cloud
  sync: ["sync"] as const,
  syncStatus: () => [...queryKeys.sync, "status"] as const,
  cloudData: () => [...queryKeys.sync, "cloudData"] as const,
  syncActivity: () => [...queryKeys.sync, "activity"] as const,
};

/**
 * Query key utilities for common operations
 */
type EntityType = "envelopes" | "transactions" | "bills" | "savingsGoals" | "debts";

type RelatedKeysMap = {
  [K in EntityType]: ReadonlyArray<readonly unknown[]>;
};

export const queryKeyUtils = {
  /**
   * Get all query keys for a specific entity type
   */
  getEntityKeys: (entityType: string): readonly unknown[] => {
    const baseKey = queryKeys[entityType as keyof typeof queryKeys];
    if (!baseKey) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }
    return baseKey as readonly unknown[];
  },

  /**
   * Check if a query key matches a pattern
   */
  matchesPattern: (queryKey: unknown[], pattern: unknown[]): boolean => {
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
  createMatcher: (pattern: unknown[]) => {
    return (queryKey: unknown[]): boolean => queryKeyUtils.matchesPattern(queryKey, pattern);
  },

  /**
   * Get all related query keys for invalidation
   */
  getRelatedKeys: (entityType: EntityType): ReadonlyArray<readonly unknown[]> => {
    const related: RelatedKeysMap = {
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
  isValidQueryKey: (queryKey: unknown): queryKey is unknown[] => {
    return Array.isArray(queryKey) && queryKey.length > 0;
  },

  /**
   * Create query key with timestamp for cache busting
   */
  withTimestamp: (
    baseKey: readonly unknown[],
    timestamp: number = Date.now()
  ): readonly unknown[] => {
    return [...baseKey, "ts", timestamp] as const;
  },

  /**
   * Create query key with user context
   */
  withUser: (baseKey: readonly unknown[], userId: string): readonly unknown[] => {
    return [...baseKey, "user", userId] as const;
  },

  /**
   * Extract entity type from query key
   */
  getEntityType: (queryKey: unknown[]): unknown => {
    if (!Array.isArray(queryKey) || queryKey.length === 0) {
      return null;
    }
    return queryKey[0];
  },

  /**
   * Create hierarchical query key
   */
  createHierarchical: (...segments: unknown[]): unknown[] => {
    return segments.filter((segment) => segment !== null && segment !== undefined);
  },

  /**
   * Get query key depth
   */
  getDepth: (queryKey: unknown): number => {
    return Array.isArray(queryKey) ? queryKey.length : 0;
  },
};
