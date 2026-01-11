import { describe, it, expect, beforeEach, vi } from "vitest";
import { processEnvelopes, calculateEnvelopeStats, getRepairUpdates } from "../filtering";
import { AUTO_CLASSIFY_ENVELOPE_TYPE, ENVELOPE_TYPES } from "../../../constants/categories";
import { isValidEnvelopeType } from "../../validation/envelopeValidation";
import logger from "../../common/logger";
import { render, screen, waitFor } from "../../../test/test-utils";
import "@testing-library/jest-dom";

vi.mock("../../../constants/categories", () => ({
  AUTO_CLASSIFY_ENVELOPE_TYPE: vi.fn((cat: string) => (cat === "Savings" ? "goal" : "standard")),
  ENVELOPE_TYPES: {
    BILL: "bill",
    VARIABLE: "standard",
    SAVINGS: "goal",
    SINKING_FUND: "sinking_fund",
    SUPPLEMENTAL: "supplemental",
  },
}));

vi.mock("../../validation/envelopeValidation", () => ({
  isValidEnvelopeType: vi.fn((type: string) => ["goal", "standard", "bill"].includes(type)),
}));

vi.mock("../../common/logger", () => ({
  default: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("budgeting filtering utilities", () => {
  const mockEnvelopes = [
    {
      id: "1",
      name: "Groceries",
      category: "expenses",
      currentBalance: 100,
      targetAmount: 200,
      type: "standard",
      archived: false,
    },
    {
      id: "2",
      name: "Emergency Fund",
      category: "savings",
      currentBalance: 500,
      targetAmount: 1000,
      type: "goal",
      archived: false,
    },
    {
      id: "3",
      name: "Vacation",
      category: "savings",
      currentBalance: 200,
      targetAmount: 200,
      type: "goal",
      archived: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("processEnvelopes", () => {
    it("should filter out archived envelopes by default", () => {
      const result = processEnvelopes(mockEnvelopes as any, {});
      expect(result).toHaveLength(2);
      expect(result.map((e) => e.id)).toEqual(["2", "1"]);
    });

    it("should include archived envelopes when requested", () => {
      const result = processEnvelopes(mockEnvelopes as any, { includeArchived: true });
      expect(result).toHaveLength(3);
    });

    it("should filter by category", () => {
      const result = processEnvelopes(mockEnvelopes as any, { category: "savings" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("2");
    });

    it("should filter by envelope types", () => {
      const result = processEnvelopes(mockEnvelopes as any, { envelopeTypes: ["goal"] });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("2");
    });

    it("should exclude envelope types", () => {
      const result = processEnvelopes(mockEnvelopes as any, { excludeEnvelopeTypes: ["standard"] });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("2");
    });

    it("should sort by name by default", () => {
      const result = processEnvelopes(mockEnvelopes as any, {});
      expect(result[0].name).toBe("Emergency Fund");
      expect(result[1].name).toBe("Groceries");
    });

    it("should sort by balance descending", () => {
      const result = processEnvelopes(mockEnvelopes as any, {
        sortBy: "currentBalance",
        sortOrder: "desc",
      });
      expect(result[0].id).toBe("2");
      expect(result[1].id).toBe("1");
    });

    it("should auto-classify envelopes with invalid types", () => {
      const corrupted = [
        { id: "corrupt", name: "Bad", category: "General", envelopeType: "invalid" },
      ];
      (isValidEnvelopeType as any).mockReturnValue(false);
      const result = processEnvelopes(corrupted as any, {});
      expect(AUTO_CLASSIFY_ENVELOPE_TYPE).toHaveBeenCalledWith("General");
      expect(result[0].type).toBe("standard");
    });

    it("should log warnings for corrupted envelopes missing name or category", () => {
      const highlyCorrupted = [{ id: "missing", currentBalance: 100 }];
      processEnvelopes(highlyCorrupted as any, {});
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("corrupted envelopes"),
        expect.any(Object)
      );
    });
  });

  describe("calculateEnvelopeStats", () => {
    it("should calculate correct totals and counts", () => {
      const processed = processEnvelopes(mockEnvelopes as any, {});
      const stats = calculateEnvelopeStats(processed);
      expect(stats.totalBalance).toBe(600);
      expect(stats.totalTargetAmount).toBe(1200);
      expect(stats.underfundedCount).toBe(2);
      expect(stats.overfundedCount).toBe(0);
      expect(stats.categories).toEqual(["expenses", "savings"]);
    });
  });

  describe("getRepairUpdates", () => {
    it("should return valid repair updates", () => {
      const updates = getRepairUpdates("Repaired", "Housing");
      expect(updates.name).toBe("Repaired");
      expect(updates.category).toBe("Housing");
      expect(updates.targetAmount).toBe(100);
      expect(updates.envelopeType).toBe("standard");
    });
  });
});
