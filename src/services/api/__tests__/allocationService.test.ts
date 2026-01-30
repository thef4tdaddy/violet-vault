import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  allocatePaycheck,
  allocateEvenSplit,
  allocateLastSplit,
  allocateTargetFirst,
  AllocationServiceError,
} from "@/services/api/allocationService";
import { AllocationRequestSchema } from "@/domain/schemas/allocation";

describe("allocationService", () => {
  const mockFetch = vi.spyOn(global, "fetch");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockEnvelopes = [
    { id: "rent", monthlyTargetCents: 100000, currentBalanceCents: 0, category: "bills" as const },
  ];

  const mockValidRequest = {
    strategy: "even_split",
    paycheckAmountCents: 250000,
    envelopes: mockEnvelopes,
  };

  const mockValidResponse = {
    allocations: [{ envelopeId: "rent", amountCents: 100000, reason: "Target met" }],
    totalAllocatedCents: 100000,
    remainingCents: 150000,
    strategy: "even_split",
  };

  describe("allocatePaycheck", () => {
    it("should successfully allocate paycheck with valid request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockValidResponse,
      } as Response);

      const result = await allocatePaycheck(mockValidRequest);

      expect(result).toEqual(mockValidResponse);
      expect(AllocationRequestSchema.safeParse(mockValidRequest).success).toBe(true);
    });

    it("should throw AllocationServiceError on invalid request validation", async () => {
      const invalidRequest = { ...mockValidRequest, strategy: "invalid_strategy" };

      await expect(allocatePaycheck(invalidRequest)).rejects.toThrow(AllocationServiceError);
    });

    it("should throw AllocationServiceError on API error response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: "Bad Request", message: "Insufficient funds" }),
      } as Response);

      await expect(allocatePaycheck(mockValidRequest)).rejects.toThrow(AllocationServiceError);
    });

    it("should throw AllocationServiceError on invalid API response structure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: "data" }),
      } as Response);

      await expect(allocatePaycheck(mockValidRequest)).rejects.toThrow(AllocationServiceError);
    });

    it("should handle network errors gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failure"));

      await expect(allocatePaycheck(mockValidRequest)).rejects.toThrow(AllocationServiceError);
    });
  });

  describe("Helper methods", () => {
    it("allocateEvenSplit should call allocatePaycheck with correct strategy", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockValidResponse,
      } as Response);

      await allocateEvenSplit(250000, mockEnvelopes);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(callBody.strategy).toBe("even_split");
    });

    it("allocateLastSplit should call allocatePaycheck with correct strategy", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockValidResponse,
      } as Response);

      const previous = [{ envelopeId: "rent", amountCents: 50000 }];
      await allocateLastSplit(250000, mockEnvelopes, previous);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(callBody.strategy).toBe("last_split");
    });

    it("allocateTargetFirst should call allocatePaycheck with correct strategy", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockValidResponse,
      } as Response);

      await allocateTargetFirst(250000, mockEnvelopes);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(callBody.strategy).toBe("target_first");
    });
  });
});
