import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRuleBulkOperations } from "../operations/useRuleBulkOperations";
import { budgetDb } from "@/db/budgetDb";
import React from "react";

// Mock budgetDb
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    autoFundingRules: {
      bulkPut: vi.fn(),
      bulkDelete: vi.fn(),
      where: vi.fn().mockReturnThis(),
      anyOf: vi.fn().mockReturnThis(),
      toArray: vi.fn(),
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
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useRuleBulkOperations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should bulk update rules", async () => {
    const mockRules = [
      { id: "1", name: "R1" },
      { id: "2", name: "R2" },
    ];
    vi.mocked(budgetDb.autoFundingRules.toArray).mockResolvedValue(mockRules as any);

    const { result } = renderHook(() => useRuleBulkOperations(), { wrapper: createWrapper() });

    await waitFor(async () => {
      await result.current.bulkUpdateRules({
        ruleIds: ["1", "2"],
        updates: { enabled: false },
      });
    });

    expect(budgetDb.autoFundingRules.bulkPut).toHaveBeenCalled();
  });

  it("should bulk delete rules", async () => {
    const { result } = renderHook(() => useRuleBulkOperations(), { wrapper: createWrapper() });

    await waitFor(async () => {
      await result.current.bulkDeleteRules(["1", "2"]);
    });

    expect(budgetDb.autoFundingRules.bulkDelete).toHaveBeenCalledWith(["1", "2"]);
  });

  it("should bulk toggle rules", async () => {
    const mockRules = [
      { id: "1", enabled: true },
      { id: "2", enabled: true },
    ];
    vi.mocked(budgetDb.autoFundingRules.toArray).mockResolvedValue(mockRules as any);

    const { result } = renderHook(() => useRuleBulkOperations(), { wrapper: createWrapper() });

    await waitFor(async () => {
      await result.current.bulkToggleRules({ ruleIds: ["1", "2"], enabled: false });
    });

    expect(budgetDb.autoFundingRules.bulkPut).toHaveBeenCalled();
  });
});
