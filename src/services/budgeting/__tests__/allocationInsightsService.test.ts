/**
 * Tests for Allocation Insights Service
 * Part of Issue #[NUMBER]: Historical Comparison View
 */

import { describe, it, expect, beforeEach } from "vitest";
import { AllocationInsightsService } from "../allocationInsightsService";
import type { EnvelopeChange, AllocationSnapshot } from "@/types/allocation-comparison";

describe("AllocationInsightsService", () => {
  let currentSnapshot: AllocationSnapshot;
  let previousSnapshot: AllocationSnapshot;

  beforeEach(() => {
    const currentAllocations: Record<string, number> = {
      env_savings: 50000,
      env_rent: 100000,
      env_dining: 20000,
    };

    const previousAllocations: Record<string, number> = {
      env_savings: 40000,
      env_rent: 100000,
      env_dining: 15000,
    };

    currentSnapshot = {
      date: "2024-02-01T00:00:00.000Z",
      totalCents: 170000,
      envelopeAllocations: currentAllocations,
    };

    previousSnapshot = {
      date: "2024-01-15T00:00:00.000Z",
      totalCents: 155000,
      envelopeAllocations: previousAllocations,
    };
  });

  describe("generateInsights", () => {
    it("should generate savings increase insight", () => {
      const changes: EnvelopeChange[] = [
        {
          envelopeId: "env_savings",
          envelopeName: "Savings",
          currentAmount: 50000,
          previousAmount: 40000,
          changeCents: 10000,
          changePercent: 25,
          trend: "increase",
          sentiment: "positive",
        },
      ];

      const insights = AllocationInsightsService.generateInsights(
        changes,
        currentSnapshot,
        previousSnapshot
      );

      const savingsInsight = insights.find((i) => i.type === "trend" && i.severity === "success");
      expect(savingsInsight).toBeDefined();
      expect(savingsInsight?.message).toContain("Savings increased");
    });

    it("should generate savings decrease warning", () => {
      const changes: EnvelopeChange[] = [
        {
          envelopeId: "env_savings",
          envelopeName: "Savings",
          currentAmount: 30000,
          previousAmount: 40000,
          changeCents: -10000,
          changePercent: -25,
          trend: "decrease",
          sentiment: "negative",
        },
      ];

      const insights = AllocationInsightsService.generateInsights(
        changes,
        currentSnapshot,
        previousSnapshot
      );

      const savingsWarning = insights.find((i) => i.type === "trend" && i.severity === "warning");
      expect(savingsWarning).toBeDefined();
      expect(savingsWarning?.message).toContain("Savings decreased");
    });

    it("should generate discretionary spending warning", () => {
      const changes: EnvelopeChange[] = [
        {
          envelopeId: "env_dining",
          envelopeName: "Dining",
          currentAmount: 30000,
          previousAmount: 15000,
          changeCents: 15000,
          changePercent: 100,
          trend: "increase",
          sentiment: "warning",
        },
      ];

      const insights = AllocationInsightsService.generateInsights(
        changes,
        currentSnapshot,
        previousSnapshot
      );

      const discretionaryWarning = insights.find(
        (i) => i.type === "trend" && i.message.includes("Discretionary")
      );
      expect(discretionaryWarning).toBeDefined();
      expect(discretionaryWarning?.severity).toBe("warning");
    });

    it("should generate total change insight", () => {
      const modifiedCurrent: AllocationSnapshot = {
        ...currentSnapshot,
        totalCents: 200000, // 29% increase
      };

      const changes: EnvelopeChange[] = [];

      const insights = AllocationInsightsService.generateInsights(
        changes,
        modifiedCurrent,
        previousSnapshot
      );

      const totalChangeInsight = insights.find((i) => i.type === "anomaly");
      expect(totalChangeInsight).toBeDefined();
      expect(totalChangeInsight?.message).toContain("increased");
    });

    it("should generate significant change suggestion", () => {
      const changes: EnvelopeChange[] = [
        {
          envelopeId: "env_rent",
          envelopeName: "Rent",
          currentAmount: 150000,
          previousAmount: 100000,
          changeCents: 50000,
          changePercent: 50,
          trend: "increase",
          sentiment: "neutral",
        },
      ];

      const insights = AllocationInsightsService.generateInsights(
        changes,
        currentSnapshot,
        previousSnapshot
      );

      const suggestion = insights.find((i) => i.type === "suggestion");
      expect(suggestion).toBeDefined();
      expect(suggestion?.message).toContain("increased significantly");
    });

    it("should not generate insights for small changes", () => {
      const changes: EnvelopeChange[] = [
        {
          envelopeId: "env_savings",
          envelopeName: "Savings",
          currentAmount: 40100,
          previousAmount: 40000,
          changeCents: 100,
          changePercent: 0.25,
          trend: "stable",
          sentiment: "neutral",
        },
      ];

      const insights = AllocationInsightsService.generateInsights(
        changes,
        currentSnapshot,
        previousSnapshot
      );

      expect(insights.length).toBe(0);
    });
  });

  describe("formatChange", () => {
    it("should format positive change", () => {
      const formatted = AllocationInsightsService.formatChange(10000);
      expect(formatted).toBe("+$100.00");
    });

    it("should format negative change", () => {
      const formatted = AllocationInsightsService.formatChange(-10000);
      expect(formatted).toBe("-$100.00");
    });

    it("should format zero change", () => {
      const formatted = AllocationInsightsService.formatChange(0);
      expect(formatted).toBe("$0.00");
    });
  });

  describe("getSentimentEmoji", () => {
    it("should return correct emoji for positive sentiment", () => {
      const emoji = AllocationInsightsService.getSentimentEmoji("positive");
      expect(emoji).toBe("🎉");
    });

    it("should return correct emoji for warning sentiment", () => {
      const emoji = AllocationInsightsService.getSentimentEmoji("warning");
      expect(emoji).toBe("⚠️");
    });

    it("should return correct emoji for negative sentiment", () => {
      const emoji = AllocationInsightsService.getSentimentEmoji("negative");
      expect(emoji).toBe("🔴");
    });

    it("should return default emoji for neutral sentiment", () => {
      const emoji = AllocationInsightsService.getSentimentEmoji("neutral");
      expect(emoji).toBe("→");
    });
  });

  describe("getTrendArrow", () => {
    it("should return up arrow for increase", () => {
      const arrow = AllocationInsightsService.getTrendArrow("increase");
      expect(arrow).toBe("↑");
    });

    it("should return down arrow for decrease", () => {
      const arrow = AllocationInsightsService.getTrendArrow("decrease");
      expect(arrow).toBe("↓");
    });

    it("should return right arrow for stable", () => {
      const arrow = AllocationInsightsService.getTrendArrow("stable");
      expect(arrow).toBe("→");
    });
  });
});
