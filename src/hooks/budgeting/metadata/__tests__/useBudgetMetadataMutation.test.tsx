import { renderHook, waitFor } from "@testing-library/react";
import { useBudgetMetadataMutation } from "../useBudgetMetadataMutation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setBudgetMetadata } from "@/db/budgetDb";
import { queryKeys } from "@/utils/core/common/queryClient";
import logger from "@/utils/core/common/logger";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock dependencies
vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useMutation: vi.fn(),
    useQueryClient: vi.fn(),
  };
});

vi.mock("@/db/budgetDb", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    setBudgetMetadata: vi.fn(),
  };
});

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useBudgetMetadataMutation", () => {
  const mockInvalidateQueries = vi.fn();
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useQueryClient as any).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });
    (useMutation as any).mockImplementation(({ mutationFn, onSuccess, onError }: any) => ({
      mutateAsync: mockMutateAsync.mockImplementation(async (variables) => {
        try {
          const result = await mutationFn(variables);
          if (onSuccess) onSuccess(result);
          return result;
        } catch (error) {
          if (onError) onError(error);
          throw error;
        }
      }),
      isPending: false,
    }));
  });

  it("should update metadata and invalidate queries on success", async () => {
    const updates = { actualBalance: 1500 };
    (setBudgetMetadata as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useBudgetMetadataMutation());
    await result.current.updateMetadata(updates);

    expect(setBudgetMetadata).toHaveBeenCalledWith(updates);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.budgetMetadata });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.dashboard });
    expect(logger.info).toHaveBeenCalledWith("✅ Budget metadata updated", expect.any(Object));
  });

  it("should log error on failure", async () => {
    const error = new Error("Failed to update");
    (setBudgetMetadata as any).mockRejectedValue(error);

    const { result } = renderHook(() => useBudgetMetadataMutation());

    await expect(result.current.updateMetadata({ actualBalance: 1000 })).rejects.toThrow();
    expect(logger.error).toHaveBeenCalledWith("Failed to update budget metadata:", error);
  });
});
