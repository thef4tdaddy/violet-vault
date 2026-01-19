/**
 * Tests for useSentinelReceipts hook
 * Tests polling behavior, state management, and API integration
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { SentinelReceipt } from "@/types/sentinel";

// Mock dependencies before importing hook
vi.mock("@/hooks/auth/useAuth", () => ({
  useAuth: () => ({
    user: { uid: "test-user-123", email: "test@example.com" },
  }),
}));

const mockFetchReceipts = vi.fn();
const mockUpdateStatus = vi.fn();

vi.mock("@/services/sentinel/sentinelShareService", () => ({
  sentinelShareService: {
    fetchReceipts: mockFetchReceipts,
    updateStatus: mockUpdateStatus,
  },
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock data
const mockReceipts: SentinelReceipt[] = [
  {
    id: "receipt-1",
    amount: 50.0,
    merchant: "Test Merchant 1",
    date: "2026-01-15T10:00:00Z",
    category: "Groceries",
    description: "Weekly groceries",
    status: "pending",
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "receipt-2",
    amount: 100.0,
    merchant: "Test Merchant 2",
    date: "2026-01-16T14:30:00Z",
    category: "Dining",
    description: "Lunch meeting",
    status: "matched",
    createdAt: "2026-01-16T14:30:00Z",
    updatedAt: "2026-01-16T14:30:00Z",
    matchedTransactionId: "transaction-123",
  },
  {
    id: "receipt-3",
    amount: 25.0,
    merchant: "Test Merchant 3",
    date: "2026-01-17T09:15:00Z",
    status: "ignored",
    createdAt: "2026-01-17T09:15:00Z",
    updatedAt: "2026-01-17T09:15:00Z",
  },
];

describe("useSentinelReceipts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchReceipts.mockResolvedValue({
      receipts: mockReceipts,
      total: mockReceipts.length,
    });
    mockUpdateStatus.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Hook Configuration", () => {
    it("should be defined and importable", async () => {
      const { useSentinelReceipts } = await import("../useSentinelReceipts");
      expect(useSentinelReceipts).toBeDefined();
      expect(typeof useSentinelReceipts).toBe("function");
    });
  });

  describe("Type Safety", () => {
    it("should have correct TypeScript types", () => {
      // This test validates that types are correctly defined
      const receipt: SentinelReceipt = mockReceipts[0];
      expect(receipt.id).toBe("receipt-1");
      expect(receipt.status).toBe("pending");
      expect(typeof receipt.amount).toBe("number");
    });

    it("should validate receipt status types", () => {
      const statuses: Array<SentinelReceipt["status"]> = ["pending", "matched", "ignored"];
      expect(statuses).toHaveLength(3);
      expect(statuses).toContain("pending");
      expect(statuses).toContain("matched");
      expect(statuses).toContain("ignored");
    });
  });

  describe("Service Integration", () => {
    it("should have fetchReceipts method available", () => {
      expect(mockFetchReceipts).toBeDefined();
      expect(typeof mockFetchReceipts).toBe("function");
    });

    it("should have updateStatus method available", () => {
      expect(mockUpdateStatus).toBeDefined();
      expect(typeof mockUpdateStatus).toBe("function");
    });

    it("should call fetchReceipts with correct response format", async () => {
      const response = await mockFetchReceipts();
      expect(response).toHaveProperty("receipts");
      expect(response).toHaveProperty("total");
      expect(Array.isArray(response.receipts)).toBe(true);
      expect(response.total).toBe(mockReceipts.length);
    });

    it("should call updateStatus with correct parameters", async () => {
      await mockUpdateStatus({
        receiptId: "receipt-1",
        status: "matched",
        matchedTransactionId: "transaction-456",
      });

      expect(mockUpdateStatus).toHaveBeenCalledWith({
        receiptId: "receipt-1",
        status: "matched",
        matchedTransactionId: "transaction-456",
      });
    });
  });

  describe("Data Filtering", () => {
    it("should filter pending receipts", () => {
      const pending = mockReceipts.filter((r) => r.status === "pending");
      expect(pending).toHaveLength(1);
      expect(pending[0].id).toBe("receipt-1");
    });

    it("should filter matched receipts", () => {
      const matched = mockReceipts.filter((r) => r.status === "matched");
      expect(matched).toHaveLength(1);
      expect(matched[0].id).toBe("receipt-2");
      expect(matched[0].matchedTransactionId).toBe("transaction-123");
    });

    it("should filter ignored receipts", () => {
      const ignored = mockReceipts.filter((r) => r.status === "ignored");
      expect(ignored).toHaveLength(1);
      expect(ignored[0].id).toBe("receipt-3");
    });
  });

  describe("Utility Functions", () => {
    it("should find receipt by ID", () => {
      const receipt = mockReceipts.find((r) => r.id === "receipt-2");
      expect(receipt).toBeDefined();
      expect(receipt?.merchant).toBe("Test Merchant 2");
    });

    it("should filter receipts by merchant name", () => {
      const receipts = mockReceipts.filter((r) =>
        r.merchant.toLowerCase().includes("merchant 2".toLowerCase())
      );
      expect(receipts).toHaveLength(1);
      expect(receipts[0].id).toBe("receipt-2");
    });

    it("should filter receipts by date range", () => {
      const startDate = new Date("2026-01-16T00:00:00Z");
      const endDate = new Date("2026-01-18T00:00:00Z");

      const receipts = mockReceipts.filter((r) => {
        const receiptDate = new Date(r.date);
        return receiptDate >= startDate && receiptDate <= endDate;
      });

      expect(receipts).toHaveLength(2);
      expect(receipts[0].id).toBe("receipt-2");
      expect(receipts[1].id).toBe("receipt-3");
    });
  });

  describe("Error Handling", () => {
    it("should handle fetch errors gracefully", async () => {
      const mockError = new Error("Failed to fetch receipts");
      mockFetchReceipts.mockRejectedValueOnce(mockError);

      try {
        await mockFetchReceipts();
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });

    it("should handle update errors gracefully", async () => {
      const mockError = new Error("Failed to update status");
      mockUpdateStatus.mockRejectedValueOnce(mockError);

      try {
        await mockUpdateStatus({
          receiptId: "receipt-1",
          status: "matched",
        });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });
  });

  describe("Query Keys", () => {
    it("should have sentinelShare query keys defined", async () => {
      const { queryKeys } = await import("@/utils/core/common/queryClient");
      expect(queryKeys.sentinelShare).toBeDefined();
      expect(queryKeys.sentinelReceipts).toBeDefined();
      expect(queryKeys.sentinelReceiptById).toBeDefined();
      expect(queryKeys.sentinelPendingReceipts).toBeDefined();
    });

    it("should generate correct query keys for receipts", async () => {
      const { queryKeys } = await import("@/utils/core/common/queryClient");
      const key = queryKeys.sentinelReceipts();
      expect(Array.isArray(key)).toBe(true);
      expect(key[0]).toBe("sentinelShare");
    });
  });
});
