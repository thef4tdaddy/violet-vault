import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useRulesQuery,
  useRuleByIdQuery,
  useExecutionHistoryQuery,
} from "../queries/useRuleQueries";
import { budgetDb } from "@/db/budgetDb";
import React from "react";

// Mock budgetDb
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    transaction: vi.fn((mode, table, callback) => callback()),
    autoFundingRules: {
      toArray: vi.fn(),
      get: vi.fn(),
      bulkPut: vi.fn(),
      add: vi.fn(),
    },
    autoFundingHistory: {
      orderBy: vi.fn().mockReturnThis(),
      reverse: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      toArray: vi.fn(),
    },
  },
}));

vi.mock("@/utils/common/logger", () => ({
  default: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useRuleQueries", () => {
  const mockRules = [
    { id: "1", name: "Rule 1" },
    { id: "2", name: "Rule 2" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("useRulesQuery", () => {
    it("fetches all rules from Dexie", async () => {
      vi.mocked(budgetDb.autoFundingRules.toArray).mockResolvedValue(mockRules as any);

      const { result } = renderHook(() => useRulesQuery(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockRules);
    });

    it("handles migration from localStorage", async () => {
      const legacyRules = JSON.stringify({ rules: [{ id: "legacy1", name: "Legacy Rule" }] });
      localStorage.setItem("violet_vault_autofunding_data", legacyRules);
      vi.mocked(budgetDb.autoFundingRules.toArray)
        .mockResolvedValueOnce([])
        .mockResolvedValue([{ id: "legacy1", name: "Legacy Rule" }] as any);

      const { result } = renderHook(() => useRulesQuery(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(budgetDb.autoFundingRules.add).toHaveBeenCalled();
      expect(localStorage.getItem("violet_vault_autofunding_migrated")).toBe("true");
    });
  });

  describe("useRuleByIdQuery", () => {
    it("fetches a single rule by ID", async () => {
      vi.mocked(budgetDb.autoFundingRules.get).mockResolvedValue(mockRules[0] as any);

      const { result } = renderHook(() => useRuleByIdQuery("1"), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockRules[0]);
    });
  });

  describe("useExecutionHistoryQuery", () => {
    it("fetches execution history", async () => {
      const mockHistory = [{ id: "exec1", trigger: "manual" }];
      vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue(mockHistory as any);

      const { result } = renderHook(() => useExecutionHistoryQuery(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockHistory);
    });
  });
});
