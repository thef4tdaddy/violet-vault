/**
 * Allocation Insights Service
 * Smart insight generation for allocation comparisons
 * Part of Issue #[NUMBER]: Historical Comparison View
 */

import type { Insight, EnvelopeChange, AllocationSnapshot } from "@/types/allocation-comparison";
import logger from "@/utils/core/common/logger";

/**
 * Allocation Insights Service
 * Generates actionable insights from allocation comparisons
 */
export class AllocationInsightsService {
  /**
   * Generate insights from allocation changes
   * @param changes - Array of envelope changes
   * @param current - Current allocation snapshot
   * @param previous - Previous allocation snapshot
   * @returns Array of insights
   */
  static generateInsights(
    changes: EnvelopeChange[],
    current: AllocationSnapshot,
    previous: AllocationSnapshot
  ): Insight[] {
    const insights: Insight[] = [];

    // Insight 1: Savings progress
    const savingsInsight = this.generateSavingsInsight(changes);
    if (savingsInsight) {
      insights.push(savingsInsight);
    }

    // Insight 2: Discretionary spending warning
    const discretionaryInsight = this.generateDiscretionaryInsight(changes);
    if (discretionaryInsight) {
      insights.push(discretionaryInsight);
    }

    // Insight 3: Total allocation change
    const totalInsight = this.generateTotalChangeInsight(current, previous);
    if (totalInsight) {
      insights.push(totalInsight);
    }

    // Insight 4: Significant category changes
    const significantChanges = this.generateSignificantChangesInsight(changes);
    insights.push(...significantChanges);

    logger.info("Generated allocation insights", {
      insightCount: insights.length,
      types: insights.map((i) => i.type),
    });

    return insights;
  }

  /**
   * Generate savings-related insight
   * @param changes - Envelope changes
   * @returns Insight or null
   */
  private static generateSavingsInsight(changes: EnvelopeChange[]): Insight | null {
    const savingsChanges = changes.filter(
      (c) =>
        c.envelopeId.toLowerCase().includes("savings") ||
        c.envelopeId.toLowerCase().includes("emergency")
    );

    if (savingsChanges.length === 0) return null;

    const totalSavingsChange = savingsChanges.reduce((sum, c) => sum + c.changeCents, 0);

    if (totalSavingsChange > 500) {
      // More than $5 increase
      const changePercent = Math.round(savingsChanges[0]?.changePercent || 0);
      return {
        type: "trend",
        severity: "success",
        message: `🎉 Savings increased ${changePercent}% - keep up the great work!`,
        envelopeIds: savingsChanges.map((c) => c.envelopeId),
      };
    } else if (totalSavingsChange < -500) {
      // More than $5 decrease
      return {
        type: "trend",
        severity: "warning",
        message: `⚠️ Savings decreased this paycheck. Consider adjusting other categories to maintain your savings goals.`,
        envelopeIds: savingsChanges.map((c) => c.envelopeId),
      };
    }

    return null;
  }

  /**
   * Generate discretionary spending insight
   * @param changes - Envelope changes
   * @returns Insight or null
   */
  private static generateDiscretionaryInsight(changes: EnvelopeChange[]): Insight | null {
    const discretionaryChanges = changes.filter(
      (c) =>
        c.envelopeId.toLowerCase().includes("dining") ||
        c.envelopeId.toLowerCase().includes("entertainment") ||
        c.envelopeId.toLowerCase().includes("shopping")
    );

    if (discretionaryChanges.length === 0) return null;

    const totalDiscretionaryChange = discretionaryChanges.reduce(
      (sum, c) => sum + c.changeCents,
      0
    );

    if (totalDiscretionaryChange > 1000) {
      // More than $10 increase
      const categories = discretionaryChanges.map((c) => c.envelopeName).join(", ");
      return {
        type: "trend",
        severity: "warning",
        message: `⚠️ Discretionary spending up in ${categories}. Watch your budget to stay on track.`,
        envelopeIds: discretionaryChanges.map((c) => c.envelopeId),
      };
    } else if (totalDiscretionaryChange < -1000) {
      // More than $10 decrease
      return {
        type: "trend",
        severity: "success",
        message: `🎉 Great job reducing discretionary spending! This helps your overall budget health.`,
        envelopeIds: discretionaryChanges.map((c) => c.envelopeId),
      };
    }

    return null;
  }

  /**
   * Generate total change insight
   * @param current - Current snapshot
   * @param previous - Previous snapshot
   * @returns Insight or null
   */
  private static generateTotalChangeInsight(
    current: AllocationSnapshot,
    previous: AllocationSnapshot
  ): Insight | null {
    const totalChange = current.totalCents - previous.totalCents;
    const changePercent = previous.totalCents > 0 ? (totalChange / previous.totalCents) * 100 : 0;

    if (Math.abs(changePercent) > 10) {
      // More than 10% change
      const dollars = Math.abs(totalChange) / 100;
      const direction = totalChange > 0 ? "increased" : "decreased";

      return {
        type: "anomaly",
        severity: "info",
        message: `Your paycheck ${direction} by $${dollars.toFixed(2)} (${Math.abs(changePercent).toFixed(1)}%) compared to last time.`,
      };
    }

    return null;
  }

  /**
   * Generate insights for significant category changes
   * @param changes - Envelope changes
   * @returns Array of insights
   */
  private static generateSignificantChangesInsight(changes: EnvelopeChange[]): Insight[] {
    const insights: Insight[] = [];

    // Find changes with >20% increase and >$10
    const significantIncreases = changes.filter(
      (c) => c.changePercent > 20 && c.changeCents > 1000 && c.trend === "increase"
    );

    if (significantIncreases.length > 0 && significantIncreases.length <= 2) {
      const envelopes = significantIncreases.map((c) => c.envelopeName).join(" and ");
      insights.push({
        type: "suggestion",
        severity: "info",
        message: `💡 ${envelopes} increased significantly. Make sure this aligns with your budget goals.`,
        envelopeIds: significantIncreases.map((c) => c.envelopeId),
      });
    }

    return insights;
  }

  /**
   * Format change amount for display
   * @param cents - Amount in cents
   * @returns Formatted string (e.g., "+$50.00" or "-$25.00")
   */
  static formatChange(cents: number): string {
    const dollars = Math.abs(cents) / 100;
    const sign = cents > 0 ? "+" : cents < 0 ? "-" : "";
    return `${sign}$${dollars.toFixed(2)}`;
  }

  /**
   * Get emoji for sentiment
   * @param sentiment - Sentiment type
   * @returns Emoji string
   */
  static getSentimentEmoji(sentiment: "positive" | "negative" | "neutral" | "warning"): string {
    switch (sentiment) {
      case "positive":
        return "🎉";
      case "warning":
        return "⚠️";
      case "negative":
        return "🔴";
      default:
        return "→";
    }
  }

  /**
   * Get arrow for trend
   * @param trend - Trend type
   * @returns Arrow string
   */
  static getTrendArrow(trend: "increase" | "decrease" | "stable"): string {
    switch (trend) {
      case "increase":
        return "↑";
      case "decrease":
        return "↓";
      default:
        return "→";
    }
  }
}
