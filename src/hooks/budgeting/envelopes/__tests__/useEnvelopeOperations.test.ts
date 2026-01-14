import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnvelopeOperations } from "../useEnvelopes";
import { budgetDb, getUnassignedCash, setUnassignedCash } from "@/db/budgetDb";
import { AUTO_CLASSIFY_ENVELOPE_TYPE } from "@/constants/categories";

// Mock dependencies
vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as Record<string, unknown>),
    useMutation: vi.fn(),
    useQueryClient: vi.fn(),
  };
});

vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    envelopes: {
      put: vi.fn(),
      get: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    bills: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn(() => []),
        })),
      })),
      delete: vi.fn(),
      update: vi.fn(),
    },
    transactions: {
      put: vi.fn(),
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          filter: vi.fn(() => ({
            toArray: vi.fn(() => []),
          })),
          toArray: vi.fn(() => []),
        })),
      })),
      delete: vi.fn(),
      update: vi.fn(),
    },
  },
  getUnassignedCash: vi.fn(),
  setUnassignedCash: vi.fn(),
}));

vi.mock("@/utils/core/common/queryClient", () => ({
  queryKeys: {
    envelopes: ["envelopes"],
    dashboard: ["dashboard"],
    bills: ["bills"],
    transactions: ["transactions"],
  },
  optimisticHelpers: {
    addEnvelope: vi.fn(),
    updateEnvelope: vi.fn(),
    removeEnvelope: vi.fn(),
    updateBill: vi.fn(),
    addTransaction: vi.fn(),
  },
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/constants/categories", () => ({
  AUTO_CLASSIFY_ENVELOPE_TYPE: vi.fn(() => "variable"),
  ENVELOPE_TYPES: {
    VARIABLE: "variable",
    SINKING_FUND: "sinking_fund",
    SAVINGS: "savings",
  },
}));

vi.mock("@/domain/schemas/envelope", () => ({
  validateEnvelopeSafe: vi.fn((data) => ({ success: true, data })),
  validateEnvelopePartialSafe: vi.fn((data) => ({ success: true, data })),
}));

vi.mock("@/domain/schemas/transaction", () => ({
  validateAndNormalizeTransaction: vi.fn((data) => data),
}));

// Mock window.cloudSyncService
const mockTriggerSync = vi.fn();
Object.defineProperty(window, "cloudSyncService", {
  value: {
    triggerSyncForCriticalChange: mockTriggerSync,
  },
  writable: true,
});

describe("useEnvelopeOperations", () => {
  const mockQueryClient = {
    invalidateQueries: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useQueryClient as Mock).mockReturnValue(mockQueryClient);

    // Default implementation for useMutation to simulate execution
    (useMutation as Mock).mockImplementation((options) => ({
      mutate: (data: any) => options.mutationFn(data).then(options.onSuccess),
      mutateAsync: (data: any) =>
        options.mutationFn(data).then((res: any) => {
          if (options.onSuccess) options.onSuccess(res);
          return res;
        }),
      isPending: false,
    }));
  });

  describe("addEnvelope", () => {
    it("should add an envelope and trigger sync", async () => {
      const { result } = renderHook(() => useEnvelopeOperations());
      const data = { name: "Test", category: "expenses" };

      await act(async () => {
        await result.current.addEnvelopeAsync(data);
      });

      expect(budgetDb.envelopes.put).toHaveBeenCalled();
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["envelopes"] });
      expect(mockTriggerSync).toHaveBeenCalledWith("envelope_created");
    });
  });

  describe("updateEnvelope", () => {
    it("should update an envelope and trigger sync", async () => {
      const { result } = renderHook(() => useEnvelopeOperations());
      const updates = { name: "Updated" };

      await act(async () => {
        await result.current.updateEnvelopeAsync("1", updates);
      });

      expect(budgetDb.envelopes.update).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({ name: "Updated" })
      );
      expect(mockTriggerSync).toHaveBeenCalledWith("envelope_updated");
    });
  });

  describe("deleteEnvelope", () => {
    it("should delete an envelope and handle unassigned cash", async () => {
      (budgetDb.envelopes.get as Mock).mockResolvedValue({ id: "1", currentBalance: 100 });
      (getUnassignedCash as Mock).mockResolvedValue(50);

      const { result } = renderHook(() => useEnvelopeOperations());

      await act(async () => {
        await result.current.deleteEnvelopeAsync({ envelopeId: "1" });
      });

      expect(setUnassignedCash).toHaveBeenCalledWith(150);
      expect(budgetDb.envelopes.delete).toHaveBeenCalledWith("1");
      expect(mockTriggerSync).toHaveBeenCalledWith("envelope_deleted");
    });
  });

  describe("transferFunds", () => {
    it("should transfer funds between envelopes and create a transaction", async () => {
      (budgetDb.envelopes.get as Mock).mockImplementation((id) => {
        if (id === "from") return Promise.resolve({ id: "from", currentBalance: 200 });
        if (id === "to") return Promise.resolve({ id: "to", currentBalance: 0 });
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useEnvelopeOperations());

      await act(async () => {
        await result.current.transferFundsAsync({
          fromEnvelopeId: "from",
          toEnvelopeId: "to",
          amount: 50,
          description: "Test Transfer",
        });
      });

      expect(budgetDb.envelopes.update).toHaveBeenCalledWith(
        "from",
        expect.objectContaining({ currentBalance: 150 })
      );
      expect(budgetDb.envelopes.update).toHaveBeenCalledWith(
        "to",
        expect.objectContaining({ currentBalance: 50 })
      );
      expect(budgetDb.transactions.put).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 50,
          category: "transfer",
        })
      );
      expect(mockTriggerSync).toHaveBeenCalledWith("envelope_transfer");
    });
  });
});
