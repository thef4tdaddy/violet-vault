import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRuleOperations } from "../operations/useRuleOperations";
import { budgetDb } from "@/db/budgetDb";
import { RULE_TYPES, TRIGGER_TYPES } from "@/utils/budgeting/autofunding/rules";
import React from "react";

// Mock budgetDb
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    autoFundingRules: {
      add: vi.fn(),
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
    transaction: vi.fn((type, tables, fn) => fn()),
  },
}));

vi.mock("@/utils/common/logger", () => ({
  default: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useRuleOperations", () => {
  const mockRule = {
    id: "rule1",
    name: "Test Rule",
    type: RULE_TYPES.FIXED_AMOUNT,
    trigger: TRIGGER_TYPES.MANUAL,
    config: {
      amount: 200,
      targetId: "env1",
      targetType: "envelope",
    },
    priority: 100,
    enabled: true,
    createdAt: new Date().toISOString(),
    lastExecuted: null,
    executionCount: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should add a new rule", async () => {
    const { result } = renderHook(() => useRuleOperations(), { wrapper: createWrapper() });

    const newRuleConfig = {
      name: "New Rule",
      type: RULE_TYPES.FIXED_AMOUNT,
      trigger: TRIGGER_TYPES.MANUAL,
      config: {
        amount: 100,
        targetId: "env2",
        targetType: "envelope",
      },
    };

    let resultRule;
    await waitFor(async () => {
      resultRule = await result.current.addRule(newRuleConfig);
    });

    expect(budgetDb.autoFundingRules.add).toHaveBeenCalled();
    expect(resultRule.name).toBe("New Rule");
  });

  it("should update an existing rule", async () => {
    vi.mocked(budgetDb.autoFundingRules.get).mockResolvedValue(mockRule as any);
    const { result } = renderHook(() => useRuleOperations(), { wrapper: createWrapper() });

    await waitFor(async () => {
      await result.current.updateRule({
        ruleId: "rule1",
        updates: { name: "Updated Rule" },
      });
    });

    expect(budgetDb.autoFundingRules.put).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "rule1",
        name: "Updated Rule",
      })
    );
  });

  it("should delete a rule", async () => {
    const { result } = renderHook(() => useRuleOperations(), { wrapper: createWrapper() });

    await waitFor(async () => {
      await result.current.deleteRule("rule1");
    });

    expect(budgetDb.autoFundingRules.delete).toHaveBeenCalledWith("rule1");
  });

  it("should duplicate a rule", async () => {
    vi.mocked(budgetDb.autoFundingRules.get).mockResolvedValue(mockRule as any);
    const { result } = renderHook(() => useRuleOperations(), { wrapper: createWrapper() });

    let duplicated;
    await waitFor(async () => {
      duplicated = await result.current.duplicateRule("rule1");
    });

    expect(budgetDb.autoFundingRules.add).toHaveBeenCalled();
    expect(duplicated.name).toBe("Test Rule (Copy)");
  });
});
