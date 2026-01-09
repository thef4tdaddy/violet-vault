import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAutoFundingRules } from "../useAutoFundingRules";
import { budgetDb } from "@/db/budgetDb";
import { RULE_TYPES, TRIGGER_TYPES } from "@/utils/budgeting/autofunding/rules";
import React from "react";

// Mock dependencies
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    autoFundingRules: {
      toArray: vi.fn(),
      add: vi.fn(),
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      where: vi.fn().mockReturnThis(),
      anyOf: vi.fn().mockReturnThis(),
      bulkPut: vi.fn(),
      bulkDelete: vi.fn(),
    },
    autoFundingHistory: {
      reverse: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      toArray: vi.fn(),
    },
    transaction: vi.fn((type, tables, fn) => fn()),
  },
}));

vi.mock("@/utils/common/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
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

describe("useAutoFundingRules", () => {
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
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should fetch rules on mount", async () => {
    vi.mocked(budgetDb.autoFundingRules.toArray).mockResolvedValue([mockRule] as any);

    const { result } = renderHook(() => useAutoFundingRules(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.rules).toHaveLength(1);
    expect(result.current.rules[0].name).toBe("Test Rule");
  });

  it("should add a new rule", async () => {
    vi.mocked(budgetDb.autoFundingRules.toArray).mockResolvedValue([] as any);
    const { result } = renderHook(() => useAutoFundingRules(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await result.current.addRule({
      name: "New Rule",
      type: RULE_TYPES.FIXED_AMOUNT,
      trigger: TRIGGER_TYPES.MANUAL,
      config: { amount: 100, targetId: "env2", targetType: "envelope" },
    });

    expect(budgetDb.autoFundingRules.add).toHaveBeenCalled();
  });

  it("should delete a rule", async () => {
    vi.mocked(budgetDb.autoFundingRules.toArray).mockResolvedValue([mockRule] as any);
    const { result } = renderHook(() => useAutoFundingRules(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await result.current.deleteRule("rule1");

    expect(budgetDb.autoFundingRules.delete).toHaveBeenCalledWith("rule1");
  });

  it("should toggle rule status", async () => {
    vi.mocked(budgetDb.autoFundingRules.toArray).mockResolvedValue([mockRule] as any);
    vi.mocked(budgetDb.autoFundingRules.get).mockResolvedValue(mockRule as any);
    const { result } = renderHook(() => useAutoFundingRules(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await result.current.toggleRule("rule1");

    expect(budgetDb.autoFundingRules.put).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "rule1",
        enabled: false,
      })
    );
  });

  it("should provide filtering functionality", async () => {
    vi.mocked(budgetDb.autoFundingRules.toArray).mockResolvedValue([mockRule] as any);
    const { result } = renderHook(() => useAutoFundingRules(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const enabledRules = result.current.getFilteredRules({ enabled: true });
    expect(enabledRules).toHaveLength(1);
  });
});
