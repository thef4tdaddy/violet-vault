import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getPrediction,
  getPredictionFromHistory,
  checkPredictionServiceHealth,
  PredictionServiceError,
} from "@/services/api/predictionService";
import { PredictionRequestSchema } from "@/domain/schemas/prediction";

describe("predictionService", () => {
  const mockFetch = vi.spyOn(global, "fetch");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockHistoricalSessions = [
    { date: "2026-01-15T12:00:00Z", amountCents: 250000, ratios: [0.5, 0.5] },
    { date: "2026-01-01T12:00:00Z", amountCents: 240000, ratios: [0.4, 0.6] },
    { date: "2025-12-15T12:00:00Z", amountCents: 250000, ratios: [0.5, 0.5] },
  ];

  const mockValidRequest = {
    paycheckCents: 250000,
    historicalSessions: mockHistoricalSessions,
    currentMonth: 1,
    numEnvelopes: 2,
  };

  const mockValidResponse = {
    suggestedAllocationsCents: [125000, 125000],
    confidence: 0.9,
    reasoning: {
      basedOn: "Historical patterns",
      patternType: "biweekly_consistent",
      dataPoints: 3,
      seasonalAdjustment: false,
    },
    modelVersion: "1.0.0",
    lastTrainedDate: "2026-01-01T00:00:00Z",
  };

  describe("getPrediction", () => {
    it("should successfully get prediction with valid request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockValidResponse,
      } as Response);

      const result = await getPrediction(mockValidRequest);

      expect(result).toEqual(mockValidResponse);
      expect(PredictionRequestSchema.safeParse(mockValidRequest).success).toBe(true);
    });

    it("should throw PredictionServiceError on invalid request validation", async () => {
      const invalidRequest = { ...mockValidRequest, numEnvelopes: 0 };

      await expect(getPrediction(invalidRequest)).rejects.toThrow(PredictionServiceError);
    });

    it("should throw PredictionServiceError when historical sessions are inconsistent", async () => {
      const inconsistentSessions = [
        { date: "2026-01-15T12:00:00Z", amountCents: 250000, ratios: [0.5, 0.5] },
        { date: "2026-01-01T12:00:00Z", amountCents: 250000, ratios: [0.5, 0.3, 0.2] },
        { date: "2025-12-15T12:00:00Z", amountCents: 250000, ratios: [0.5, 0.5] },
      ];
      const invalidRequest = { ...mockValidRequest, historicalSessions: inconsistentSessions };

      await expect(getPrediction(invalidRequest)).rejects.toThrow(PredictionServiceError);
    });

    it("should throw PredictionServiceError on API error response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: "Insufficient data" }),
      } as Response);

      await expect(getPrediction(mockValidRequest)).rejects.toThrow(PredictionServiceError);
    });

    it("should handle privacy protection", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockValidResponse,
      } as Response);

      await getPrediction(mockValidRequest);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(callBody).not.toHaveProperty("userId");
      expect(callBody.historicalSessions[0]).not.toHaveProperty("envelopeNames");
    });
  });

  describe("getPredictionFromHistory", () => {
    it("should convert allocation history and call getPrediction", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockValidResponse,
      } as Response);

      const history = [
        {
          date: "2026-01-15T12:00:00Z",
          amountCents: 200000,
          envelopeAllocations: [
            { envelopeId: "env1", amountCents: 100000 },
            { envelopeId: "env2", amountCents: 100000 },
          ],
        },
        {
          date: "2026-01-01T12:00:00Z",
          amountCents: 200000,
          envelopeAllocations: [
            { envelopeId: "env1", amountCents: 80000 },
            { envelopeId: "env2", amountCents: 120000 },
          ],
        },
        {
          date: "2025-12-15T12:00:00Z",
          amountCents: 200000,
          envelopeAllocations: [
            { envelopeId: "env1", amountCents: 100000 },
            { envelopeId: "env2", amountCents: 100000 },
          ],
        },
      ];

      const result = await getPredictionFromHistory(250000, history, 2);

      expect(result).toEqual(mockValidResponse);
    });
  });

  describe("checkPredictionServiceHealth", () => {
    it("should return available: true on successful health check", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ version: "1.0.0" }),
      } as Response);

      const health = await checkPredictionServiceHealth();
      expect(health).toEqual({ available: true, version: "1.0.0" });
    });

    it("should return available: false on failed health check", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Service down" }),
      } as Response);

      const health = await checkPredictionServiceHealth();
      expect(health.available).toBe(false);
    });

    it("should return available: false on network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Down"));

      const health = await checkPredictionServiceHealth();
      expect(health.available).toBe(false);
    });
  });
});
