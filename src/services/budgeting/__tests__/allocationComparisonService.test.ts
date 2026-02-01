/**
 * Tests for Allocation Comparison Service
 * Part of Issue #[NUMBER]: Historical Comparison View
 */

import { describe, it, expect, beforeEach } from "vitest";
import { AllocationComparisonService } from "../allocationComparisonService";
import type { AllocationSnapshot, AllocationHistoryEntry } from "@/types/allocation-comparison";

describe("AllocationComparisonService", () => {
  let currentSnapshot: AllocationSnapshot;
  let previousSnapshot: AllocationSnapshot;

  beforeEach(() => {
    // Setup test data
    const currentAllocations = new Map<string, number>();
    currentAllocations.set("env_savings", 50000); // $500
    currentAllocations.set("env_rent", 100000); // $1000
    currentAllocations.set("env_dining", 20000); // $200

    const previousAllocations = new Map<string, number>();
    previousAllocations.set("env_savings", 40000); // $400
    previousAllocations.set("env_rent", 100000); // $1000
    previousAllocations.set("env_dining", 15000); // $150

    currentSnapshot = {
      date: "2024-02-01T00:00:00.000Z",
      totalCents: 170000,
      envelopeAllocations: currentAllocations,
      payerName: "Acme Corp",
    };

    previousSnapshot = {
      date: "2024-01-15T00:00:00.000Z",
      totalCents: 155000,
      envelopeAllocations: previousAllocations,
      payerName: "Acme Corp",
    };
  });

  describe("compareAllocations", () => {
    it("should compare current and previous allocations", () => {
      const changes = AllocationComparisonService.compareAllocations(
        currentSnapshot,
        previousSnapshot
      );

      expect(changes).toHaveLength(3);
      expect(changes[0]?.envelopeId).toBe("env_savings"); // Largest change first
      expect(changes[0]?.changeCents).toBe(10000); // $100 increase
    });

    it("should calculate correct change amounts", () => {
      const changes = AllocationComparisonService.compareAllocations(
        currentSnapshot,
        previousSnapshot
      );

      const savingsChange = changes.find((c) => c.envelopeId === "env_savings");
      expect(savingsChange?.currentAmount).toBe(50000);
      expect(savingsChange?.previousAmount).toBe(40000);
      expect(savingsChange?.changeCents).toBe(10000);
      expect(savingsChange?.changePercent).toBe(25); // 25% increase
    });

    it("should detect stable allocations", () => {
      const changes = AllocationComparisonService.compareAllocations(
        currentSnapshot,
        previousSnapshot
      );

      const rentChange = changes.find((c) => c.envelopeId === "env_rent");
      expect(rentChange?.trend).toBe("stable"); // No change
      expect(rentChange?.changeCents).toBe(0);
    });

    it("should handle new envelopes (not in previous)", () => {
      const currentWithNew = new Map(currentSnapshot.envelopeAllocations);
      currentWithNew.set("env_emergency", 30000); // $300 new

      const snapshotWithNew: AllocationSnapshot = {
        ...currentSnapshot,
        envelopeAllocations: currentWithNew,
      };

      const changes = AllocationComparisonService.compareAllocations(
        snapshotWithNew,
        previousSnapshot
      );

      const emergencyChange = changes.find((c) => c.envelopeId === "env_emergency");
      expect(emergencyChange?.previousAmount).toBe(0);
      expect(emergencyChange?.currentAmount).toBe(30000);
      expect(emergencyChange?.changePercent).toBe(100); // New envelope
    });

    it("should handle removed envelopes (not in current)", () => {
      const previousWithExtra = new Map(previousSnapshot.envelopeAllocations);
      previousWithExtra.set("env_entertainment", 20000); // $200 removed

      const snapshotWithExtra: AllocationSnapshot = {
        ...previousSnapshot,
        envelopeAllocations: previousWithExtra,
      };

      const changes = AllocationComparisonService.compareAllocations(
        currentSnapshot,
        snapshotWithExtra
      );

      const entertainmentChange = changes.find((c) => c.envelopeId === "env_entertainment");
      expect(entertainmentChange?.currentAmount).toBe(0);
      expect(entertainmentChange?.previousAmount).toBe(20000);
      expect(entertainmentChange?.changeCents).toBe(-20000);
      expect(entertainmentChange?.trend).toBe("decrease");
    });
  });

  describe("determineTrend", () => {
    it("should detect increase", () => {
      const trend = AllocationComparisonService.determineTrend(10000);
      expect(trend).toBe("increase");
    });

    it("should detect decrease", () => {
      const trend = AllocationComparisonService.determineTrend(-10000);
      expect(trend).toBe("decrease");
    });

    it("should detect stable for small changes", () => {
      const trend = AllocationComparisonService.determineTrend(50); // Less than $1
      expect(trend).toBe("stable");
    });
  });

  describe("determineSentiment", () => {
    it("should return positive for increased savings", () => {
      const sentiment = AllocationComparisonService.determineSentiment("env_savings", 10000);
      expect(sentiment).toBe("positive");
    });

    it("should return negative for decreased savings", () => {
      const sentiment = AllocationComparisonService.determineSentiment("env_savings", -10000);
      expect(sentiment).toBe("negative");
    });

    it("should return warning for increased discretionary spending", () => {
      const sentiment = AllocationComparisonService.determineSentiment("env_dining", 10000);
      expect(sentiment).toBe("warning");
    });

    it("should return positive for decreased discretionary spending", () => {
      const sentiment = AllocationComparisonService.determineSentiment("env_dining", -10000);
      expect(sentiment).toBe("positive");
    });

    it("should return neutral for small changes", () => {
      const sentiment = AllocationComparisonService.determineSentiment("env_savings", 50);
      expect(sentiment).toBe("neutral");
    });

    it("should return neutral for unknown categories", () => {
      const sentiment = AllocationComparisonService.determineSentiment("env_other", 10000);
      expect(sentiment).toBe("neutral");
    });
  });

  describe("createCurrentSnapshot", () => {
    it("should create snapshot from wizard state", () => {
      const allocations = [
        { envelopeId: "env_savings", amountCents: 50000 },
        { envelopeId: "env_rent", amountCents: 100000 },
      ];

      const snapshot = AllocationComparisonService.createCurrentSnapshot(
        150000,
        allocations,
        "Acme Corp"
      );

      expect(snapshot.totalCents).toBe(150000);
      expect(snapshot.payerName).toBe("Acme Corp");
      expect(snapshot.envelopeAllocations.size).toBe(2);
      expect(snapshot.envelopeAllocations.get("env_savings")).toBe(50000);
    });

    it("should handle null payer name", () => {
      const allocations = [{ envelopeId: "env_savings", amountCents: 50000 }];

      const snapshot = AllocationComparisonService.createCurrentSnapshot(50000, allocations, null);

      expect(snapshot.payerName).toBeUndefined();
    });
  });

  describe("createSnapshotFromHistory", () => {
    it("should create snapshot from history entry", () => {
      const historyEntry: AllocationHistoryEntry = {
        id: "hist_123",
        date: "2024-01-01T00:00:00.000Z",
        paycheckAmountCents: 200000,
        payerName: "Acme Corp",
        allocations: [
          { envelopeId: "env_savings", amountCents: 50000 },
          { envelopeId: "env_rent", amountCents: 150000 },
        ],
        strategy: "target_first",
      };

      const snapshot = AllocationComparisonService.createSnapshotFromHistory(historyEntry);

      expect(snapshot.totalCents).toBe(200000);
      expect(snapshot.payerName).toBe("Acme Corp");
      expect(snapshot.date).toBe("2024-01-01T00:00:00.000Z");
      expect(snapshot.envelopeAllocations.size).toBe(2);
      expect(snapshot.envelopeAllocations.get("env_savings")).toBe(50000);
    });
  });

  describe("getComparison", () => {
    it("should return full comparison with changes", () => {
      const comparison = AllocationComparisonService.getComparison(
        currentSnapshot,
        previousSnapshot
      );

      expect(comparison.current).toBe(currentSnapshot);
      expect(comparison.previous).toBe(previousSnapshot);
      expect(comparison.changes).toHaveLength(3);
      expect(comparison.insights).toHaveLength(0); // Insights generated separately
    });
  });
});
