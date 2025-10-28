// Query Keys Tests
import { describe, it, expect } from "vitest";
import { queryKeys, queryKeyUtils } from "../queryKeys";

describe("queryKeys", () => {
  describe("budget keys", () => {
    it("should generate correct budget keys", () => {
      expect(queryKeys.budget).toEqual(["budget"]);
      expect(queryKeys.budgetData()).toEqual(["budget", "data"]);
      expect(queryKeys.budgetSummary()).toEqual(["budget", "summary"]);
    });

    it("should generate budget metadata keys", () => {
      expect(queryKeys.budgetMetadata).toEqual(["budgetMetadata"]);
      expect(queryKeys.unassignedCash()).toEqual(["budgetMetadata", "unassignedCash"]);
      expect(queryKeys.actualBalance()).toEqual(["budgetMetadata", "actualBalance"]);
    });
  });

  describe("envelope keys", () => {
    it("should generate correct envelope keys", () => {
      expect(queryKeys.envelopes).toEqual(["envelopes"]);
      expect(queryKeys.envelopesList()).toEqual(["envelopes", "list", {}]);
      expect(queryKeys.envelopeById("env1")).toEqual(["envelopes", "detail", "env1"]);
      expect(queryKeys.envelopesByCategory("food")).toEqual(["envelopes", "category", "food"]);
      expect(queryKeys.envelopeBalances()).toEqual(["envelopes", "balances"]);
    });

    it("should handle envelope list filters", () => {
      const filters = { category: "food", archived: false };
      expect(queryKeys.envelopesList(filters)).toEqual(["envelopes", "list", filters]);
    });
  });

  describe("transaction keys", () => {
    it("should generate correct transaction keys", () => {
      expect(queryKeys.transactions).toEqual(["transactions"]);
      expect(queryKeys.transactionsList()).toEqual(["transactions", "list", {}]);
      expect(queryKeys.transactionById("tx1")).toEqual(["transactions", "detail", "tx1"]);
    });

    it("should generate date range keys", () => {
      const startDate = "2024-01-01";
      const endDate = "2024-01-31";
      expect(queryKeys.transactionsByDateRange(startDate, endDate)).toEqual([
        "transactions",
        "dateRange",
        startDate,
        endDate,
      ]);
    });

    it("should generate envelope-specific transaction keys", () => {
      expect(queryKeys.transactionsByEnvelope("env1")).toEqual([
        "transactions",
        "envelope",
        "env1",
      ]);
    });
  });

  describe("bill keys", () => {
    it("should generate correct bill keys", () => {
      expect(queryKeys.bills).toEqual(["bills"]);
      expect(queryKeys.billsList()).toEqual(["bills", "list", {}]);
      expect(queryKeys.billById("bill1")).toEqual(["bills", "detail", "bill1"]);
      expect(queryKeys.upcomingBills()).toEqual(["bills", "upcoming", 30]);
      expect(queryKeys.upcomingBills(7)).toEqual(["bills", "upcoming", 7]);
      expect(queryKeys.overdueBills()).toEqual(["bills", "overdue"]);
    });
  });

  describe("savings goal keys", () => {
    it("should generate correct savings goal keys", () => {
      expect(queryKeys.savingsGoals).toEqual(["savingsGoals"]);
      expect(queryKeys.savingsGoalsList()).toEqual(["savingsGoals", "list"]);
      expect(queryKeys.savingsGoalById("goal1")).toEqual(["savingsGoals", "detail", "goal1"]);
      expect(queryKeys.activeSavingsGoals()).toEqual(["savingsGoals", "active"]);
    });
  });

  describe("analytics keys", () => {
    it("should generate correct analytics keys", () => {
      expect(queryKeys.analytics).toEqual(["analytics"]);
      expect(queryKeys.analyticsSpending("month")).toEqual(["analytics", "spending", "month"]);
      expect(queryKeys.analyticsTrends("week")).toEqual(["analytics", "trends", "week"]);
      expect(queryKeys.analyticsCategories("year")).toEqual(["analytics", "categories", "year"]);
      expect(queryKeys.analyticsBalance()).toEqual(["analytics", "balance"]);
    });

    it("should generate analytics report keys", () => {
      const params = { period: "month", includeTransfers: false };
      expect(queryKeys.analyticsReport("spending", params)).toEqual([
        "analytics",
        "spending",
        params,
      ]);
    });
  });

  describe("dashboard keys", () => {
    it("should generate correct dashboard keys", () => {
      expect(queryKeys.dashboard).toEqual(["dashboard"]);
      expect(queryKeys.dashboardSummary()).toEqual(["dashboard", "summary"]);
      expect(queryKeys.dashboardOverview()).toEqual(["dashboard", "overview"]);
      expect(queryKeys.dashboardMetrics()).toEqual(["dashboard", "metrics"]);
    });
  });

  describe("history keys", () => {
    it("should generate correct budget history keys", () => {
      expect(queryKeys.budgetHistory).toEqual(["budgetHistory"]);
      expect(queryKeys.budgetCommits()).toEqual(["budgetHistory", "commits", {}]);
      expect(queryKeys.budgetCommit("hash123")).toEqual(["budgetHistory", "commit", "hash123"]);
      expect(queryKeys.budgetChanges("hash123")).toEqual(["budgetHistory", "changes", "hash123"]);
      expect(queryKeys.budgetHistoryStats()).toEqual(["budgetHistory", "stats"]);
      expect(queryKeys.budgetBranches()).toEqual(["budgetHistory", "branches"]);
      expect(queryKeys.budgetTags()).toEqual(["budgetHistory", "tags"]);
    });
  });

  describe("sync keys", () => {
    it("should generate correct sync keys", () => {
      expect(queryKeys.sync).toEqual(["sync"]);
      expect(queryKeys.syncStatus()).toEqual(["sync", "status"]);
      expect(queryKeys.cloudData()).toEqual(["sync", "cloudData"]);
      expect(queryKeys.syncActivity()).toEqual(["sync", "activity"]);
    });
  });
});

describe("queryKeyUtils", () => {
  describe("getEntityKeys", () => {
    it("should return base keys for valid entity types", () => {
      expect(queryKeyUtils.getEntityKeys("envelopes")).toEqual(["envelopes"]);
      expect(queryKeyUtils.getEntityKeys("transactions")).toEqual(["transactions"]);
      expect(queryKeyUtils.getEntityKeys("bills")).toEqual(["bills"]);
    });

    it("should throw error for unknown entity type", () => {
      expect(() => queryKeyUtils.getEntityKeys("unknown")).toThrow("Unknown entity type: unknown");
    });
  });

  describe("matchesPattern", () => {
    it("should match exact patterns", () => {
      const queryKey = ["envelopes", "list", "filter"];
      const pattern = ["envelopes", "list"];
      expect(queryKeyUtils.matchesPattern(queryKey, pattern)).toBe(true);
    });

    it("should not match when pattern is longer", () => {
      const queryKey = ["envelopes"];
      const pattern = ["envelopes", "list"];
      expect(queryKeyUtils.matchesPattern(queryKey, pattern)).toBe(false);
    });

    it("should not match different patterns", () => {
      const queryKey = ["envelopes", "list"];
      const pattern = ["transactions", "list"];
      expect(queryKeyUtils.matchesPattern(queryKey, pattern)).toBe(false);
    });

    it("should handle non-array inputs", () => {
      expect(queryKeyUtils.matchesPattern("not-array", ["pattern"])).toBe(false);
      expect(queryKeyUtils.matchesPattern(["key"], "not-array")).toBe(false);
    });
  });

  describe("createMatcher", () => {
    it("should create a matcher function", () => {
      const matcher = queryKeyUtils.createMatcher(["envelopes"]);
      expect(typeof matcher).toBe("function");
      expect(matcher(["envelopes", "list"])).toBe(true);
      expect(matcher(["transactions", "list"])).toBe(false);
    });
  });

  describe("getRelatedKeys", () => {
    it("should return related keys for envelopes", () => {
      const related = queryKeyUtils.getRelatedKeys("envelopes");
      expect(related).toContain(queryKeys.envelopes);
      expect(related).toContain(queryKeys.dashboard);
      expect(related).toContain(queryKeys.budgetMetadata);
    });

    it("should return related keys for transactions", () => {
      const related = queryKeyUtils.getRelatedKeys("transactions");
      expect(related).toContain(queryKeys.transactions);
      expect(related).toContain(queryKeys.analytics);
      expect(related).toContain(queryKeys.dashboard);
      expect(related).toContain(queryKeys.budgetMetadata);
    });

    it("should return base key for unknown entity", () => {
      const related = queryKeyUtils.getRelatedKeys("unknown");
      expect(related).toEqual([queryKeys.unknown]);
    });
  });

  describe("isValidQueryKey", () => {
    it("should validate correct query keys", () => {
      expect(queryKeyUtils.isValidQueryKey(["envelopes"])).toBe(true);
      expect(queryKeyUtils.isValidQueryKey(["envelopes", "list"])).toBe(true);
    });

    it("should reject invalid query keys", () => {
      expect(queryKeyUtils.isValidQueryKey([])).toBe(false);
      expect(queryKeyUtils.isValidQueryKey(null)).toBe(false);
      expect(queryKeyUtils.isValidQueryKey("not-array")).toBe(false);
      expect(queryKeyUtils.isValidQueryKey(undefined)).toBe(false);
    });
  });

  describe("withTimestamp", () => {
    it("should add timestamp to query key", () => {
      const baseKey = ["envelopes", "list"];
      const timestamp = 1234567890;
      const result = queryKeyUtils.withTimestamp(baseKey, timestamp);
      expect(result).toEqual(["envelopes", "list", "ts", timestamp]);
    });

    it("should use current timestamp when not provided", () => {
      const baseKey = ["envelopes"];
      const result = queryKeyUtils.withTimestamp(baseKey);
      expect(result).toHaveLength(3);
      expect(result[0]).toBe("envelopes");
      expect(result[1]).toBe("ts");
      expect(typeof result[2]).toBe("number");
    });
  });

  describe("withUser", () => {
    it("should add user context to query key", () => {
      const baseKey = ["envelopes", "list"];
      const userId = "user123";
      const result = queryKeyUtils.withUser(baseKey, userId);
      expect(result).toEqual(["envelopes", "list", "user", userId]);
    });
  });

  describe("getEntityType", () => {
    it("should extract entity type from query key", () => {
      expect(queryKeyUtils.getEntityType(["envelopes", "list"])).toBe("envelopes");
      expect(queryKeyUtils.getEntityType(["transactions"])).toBe("transactions");
      expect(queryKeyUtils.getEntityType(["dashboard", "summary"])).toBe("dashboard");
    });

    it("should return null for invalid query keys", () => {
      expect(queryKeyUtils.getEntityType([])).toBeNull();
      expect(queryKeyUtils.getEntityType(null)).toBeNull();
      expect(queryKeyUtils.getEntityType("not-array")).toBeNull();
    });
  });

  describe("createHierarchical", () => {
    it("should create hierarchical query key", () => {
      const result = queryKeyUtils.createHierarchical("envelopes", "list", "active");
      expect(result).toEqual(["envelopes", "list", "active"]);
    });

    it("should filter out null and undefined values", () => {
      const result = queryKeyUtils.createHierarchical(
        "envelopes",
        null,
        "list",
        undefined,
        "active"
      );
      expect(result).toEqual(["envelopes", "list", "active"]);
    });
  });

  describe("getDepth", () => {
    it("should return correct depth for query keys", () => {
      expect(queryKeyUtils.getDepth(["envelopes"])).toBe(1);
      expect(queryKeyUtils.getDepth(["envelopes", "list"])).toBe(2);
      expect(queryKeyUtils.getDepth(["envelopes", "list", "active"])).toBe(3);
    });

    it("should return 0 for non-arrays", () => {
      expect(queryKeyUtils.getDepth(null)).toBe(0);
      expect(queryKeyUtils.getDepth("not-array")).toBe(0);
      expect(queryKeyUtils.getDepth(undefined)).toBe(0);
    });
  });
});
