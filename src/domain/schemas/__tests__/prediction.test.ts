/**
 * Tests for Prediction API Schemas - Issue #1847
 * Validates Zod schemas match Python Pydantic models exactly
 * PRIVACY: Validates that no PII can be sent
 */

import { describe, it, expect } from "vitest";
import {
  HistoricalSessionSchema,
  PredictionRequestSchema,
  PredictionResponseSchema,
  PredictionErrorSchema,
  validatePredictionRequest,
  validatePredictionRequestSafe,
  isPredictionError,
  convertAllocationHistoryToRatios,
  validateHistoricalSessionsConsistency,
} from "../prediction";

describe("HistoricalSessionSchema", () => {
  it("should validate a valid historical session", () => {
    const session = {
      date: "2026-01-15T00:00:00Z",
      amountCents: 250000,
      ratios: [0.5, 0.3, 0.2],
    };

    const result = HistoricalSessionSchema.safeParse(session);
    expect(result.success).toBe(true);
  });

  it("should reject ratios that don't sum to 1.0", () => {
    const session = {
      date: "2026-01-15T00:00:00Z",
      amountCents: 250000,
      ratios: [0.5, 0.3], // Sums to 0.8, not 1.0
    };

    const result = HistoricalSessionSchema.safeParse(session);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("sum to approximately 1.0");
    }
  });

  it("should accept ratios that sum to approximately 1.0", () => {
    const session = {
      date: "2026-01-15T00:00:00Z",
      amountCents: 250000,
      ratios: [0.333, 0.333, 0.334], // Sums to 1.0 (within tolerance)
    };

    const result = HistoricalSessionSchema.safeParse(session);
    expect(result.success).toBe(true);
  });

  it("should reject negative ratios", () => {
    const session = {
      date: "2026-01-15T00:00:00Z",
      amountCents: 250000,
      ratios: [-0.1, 0.6, 0.5],
    };

    const result = HistoricalSessionSchema.safeParse(session);
    expect(result.success).toBe(false);
  });

  it("should reject ratios > 1.0", () => {
    const session = {
      date: "2026-01-15T00:00:00Z",
      amountCents: 250000,
      ratios: [1.5, -0.5],
    };

    const result = HistoricalSessionSchema.safeParse(session);
    expect(result.success).toBe(false);
  });

  it("should reject invalid date format", () => {
    const session = {
      date: "not-a-date",
      amountCents: 250000,
      ratios: [1.0],
    };

    const result = HistoricalSessionSchema.safeParse(session);
    expect(result.success).toBe(false);
  });

  it("should reject zero or negative amount", () => {
    const session = {
      date: "2026-01-15T00:00:00Z",
      amountCents: 0,
      ratios: [1.0],
    };

    const result = HistoricalSessionSchema.safeParse(session);
    expect(result.success).toBe(false);
  });
});

describe("PredictionRequestSchema", () => {
  const validSessions = [
    { date: "2026-01-15T00:00:00Z", amountCents: 250000, ratios: [0.5, 0.5] },
    { date: "2025-12-31T00:00:00Z", amountCents: 240000, ratios: [0.5, 0.5] },
    { date: "2025-12-15T00:00:00Z", amountCents: 250000, ratios: [0.5, 0.5] },
  ];

  it("should validate a complete prediction request", () => {
    const request = {
      paycheckCents: 250000,
      historicalSessions: validSessions,
      currentMonth: 1,
      numEnvelopes: 2,
    };

    const result = PredictionRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
  });

  it("should reject request with < 3 historical sessions", () => {
    const request = {
      paycheckCents: 250000,
      historicalSessions: validSessions.slice(0, 2),
      currentMonth: 1,
      numEnvelopes: 2,
    };

    const result = PredictionRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("at least 3");
    }
  });

  it("should reject request with > 50 historical sessions", () => {
    const request = {
      paycheckCents: 250000,
      historicalSessions: Array(51).fill(validSessions[0]),
      currentMonth: 1,
      numEnvelopes: 2,
    };

    const result = PredictionRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });

  it("should reject invalid month", () => {
    const request = {
      paycheckCents: 250000,
      historicalSessions: validSessions,
      currentMonth: 13,
      numEnvelopes: 2,
    };

    const result = PredictionRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });

  it("should reject paycheck over $100,000", () => {
    const request = {
      paycheckCents: 10_000_001,
      historicalSessions: validSessions,
      currentMonth: 1,
      numEnvelopes: 2,
    };

    const result = PredictionRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });

  it("should reject more than 200 envelopes", () => {
    const request = {
      paycheckCents: 250000,
      historicalSessions: validSessions,
      currentMonth: 1,
      numEnvelopes: 201,
    };

    const result = PredictionRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });
});

describe("PredictionResponseSchema", () => {
  it("should validate a complete prediction response", () => {
    const response = {
      suggestedAllocationsCents: [125000, 62500, 37500, 25000],
      confidence: 0.87,
      reasoning: {
        basedOn: "historical_patterns",
        dataPoints: 3,
        patternType: "biweekly_consistent",
        seasonalAdjustment: true,
      },
      modelVersion: "v1.0.0",
      lastTrainedDate: "2026-01-30",
    };

    const result = PredictionResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
  });

  it("should reject confidence outside 0.0-1.0 range", () => {
    const response = {
      suggestedAllocationsCents: [250000],
      confidence: 1.5,
      reasoning: {
        basedOn: "historical_patterns",
        dataPoints: 3,
        patternType: "monthly",
        seasonalAdjustment: false,
      },
      modelVersion: "v1.0.0",
      lastTrainedDate: "2026-01-30",
    };

    const result = PredictionResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });

  it("should reject negative allocation amounts", () => {
    const response = {
      suggestedAllocationsCents: [-100, 250100],
      confidence: 0.8,
      reasoning: {
        basedOn: "historical_patterns",
        dataPoints: 3,
        patternType: "monthly",
        seasonalAdjustment: false,
      },
      modelVersion: "v1.0.0",
      lastTrainedDate: "2026-01-30",
    };

    const result = PredictionResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });
});

describe("Privacy Compliance", () => {
  it("convertAllocationHistoryToRatios should strip envelope names", () => {
    const allocation = {
      date: "2026-01-15T00:00:00Z",
      amountCents: 250000,
      envelopeAllocations: [
        { envelopeId: "rent_envelope_with_private_name", amountCents: 125000 },
        { envelopeId: "savings_envelope_private", amountCents: 125000 },
      ],
    };

    const session = convertAllocationHistoryToRatios(allocation);

    // Verify NO envelope IDs in result
    expect(JSON.stringify(session)).not.toContain("rent_envelope");
    expect(JSON.stringify(session)).not.toContain("savings_envelope");

    // Verify only ratios present
    expect(session.ratios).toEqual([0.5, 0.5]);
    expect(session.date).toBe(allocation.date);
    expect(session.amountCents).toBe(allocation.amountCents);
  });

  it("should not allow envelope names in schema", () => {
    const sessionWithNames = {
      date: "2026-01-15T00:00:00Z",
      amountCents: 250000,
      ratios: [0.5, 0.5],
      envelopeNames: ["Rent", "Savings"], // Should be stripped
    };

    // Schema should only keep defined fields
    const result = HistoricalSessionSchema.parse(sessionWithNames);
    expect(result).not.toHaveProperty("envelopeNames");
  });
});

describe("Validation Helpers", () => {
  const validRequest = {
    paycheckCents: 250000,
    historicalSessions: [
      { date: "2026-01-15T00:00:00Z", amountCents: 250000, ratios: [0.5, 0.5] },
      { date: "2025-12-31T00:00:00Z", amountCents: 250000, ratios: [0.5, 0.5] },
      { date: "2025-12-15T00:00:00Z", amountCents: 250000, ratios: [0.5, 0.5] },
    ],
    currentMonth: 1,
    numEnvelopes: 2,
  };

  it("validatePredictionRequest should parse valid request", () => {
    expect(() => validatePredictionRequest(validRequest)).not.toThrow();
  });

  it("validatePredictionRequest should throw on invalid request", () => {
    const invalid = { ...validRequest, currentMonth: 13 };
    expect(() => validatePredictionRequest(invalid)).toThrow();
  });

  it("validatePredictionRequestSafe should return success for valid", () => {
    const result = validatePredictionRequestSafe(validRequest);
    expect(result.success).toBe(true);
  });

  it("validateHistoricalSessionsConsistency should validate same envelope count", () => {
    const sessions = [
      { date: "2026-01-15T00:00:00Z", amountCents: 250000, ratios: [0.5, 0.5] },
      { date: "2025-12-31T00:00:00Z", amountCents: 250000, ratios: [0.5, 0.5] },
    ];

    const result = validateHistoricalSessionsConsistency(sessions);
    expect(result.valid).toBe(true);
  });

  it("validateHistoricalSessionsConsistency should reject inconsistent envelope count", () => {
    const sessions = [
      { date: "2026-01-15T00:00:00Z", amountCents: 250000, ratios: [0.5, 0.5] },
      { date: "2025-12-31T00:00:00Z", amountCents: 250000, ratios: [0.33, 0.33, 0.34] }, // 3 envelopes!
    ];

    const result = validateHistoricalSessionsConsistency(sessions);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Inconsistent envelope count");
  });

  it("isPredictionError should identify error responses", () => {
    const error = {
      error: "Insufficient historical data",
      detail: "Need at least 3 paychecks",
    };

    expect(isPredictionError(error)).toBe(true);
  });
});

describe("Edge Cases", () => {
  it("should handle single cent paycheck", () => {
    const request = {
      paycheckCents: 1,
      historicalSessions: [
        { date: "2026-01-15T00:00:00Z", amountCents: 1, ratios: [1.0] },
        { date: "2025-12-31T00:00:00Z", amountCents: 1, ratios: [1.0] },
        { date: "2025-12-15T00:00:00Z", amountCents: 1, ratios: [1.0] },
      ],
      currentMonth: 1,
      numEnvelopes: 1,
    };

    const result = PredictionRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
  });

  it("should handle maximum paycheck amount", () => {
    const request = {
      paycheckCents: 10_000_000,
      historicalSessions: [
        { date: "2026-01-15T00:00:00Z", amountCents: 10_000_000, ratios: [1.0] },
        { date: "2025-12-31T00:00:00Z", amountCents: 10_000_000, ratios: [1.0] },
        { date: "2025-12-15T00:00:00Z", amountCents: 10_000_000, ratios: [1.0] },
      ],
      currentMonth: 1,
      numEnvelopes: 1,
    };

    const result = PredictionRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
  });

  it("should handle 200 envelopes (max)", () => {
    const ratios = Array(200).fill(1 / 200);

    const request = {
      paycheckCents: 1_000_000,
      historicalSessions: [
        { date: "2026-01-15T00:00:00Z", amountCents: 1_000_000, ratios },
        { date: "2025-12-31T00:00:00Z", amountCents: 1_000_000, ratios },
        { date: "2025-12-15T00:00:00Z", amountCents: 1_000_000, ratios },
      ],
      currentMonth: 1,
      numEnvelopes: 200,
    };

    const result = PredictionRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
  });
});
