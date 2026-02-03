/**
 * Allocation Comparison Service
 * Core logic for comparing current vs previous paycheck allocations
 * Part of Issue #[NUMBER]: Historical Comparison View
 */

import type {
  AllocationSnapshot,
  EnvelopeChange,
  AllocationComparison,
  AllocationHistoryEntry,
} from "@/types/allocation-comparison";
import logger from "@/utils/core/common/logger";

/**
 * Envelope categories for sentiment analysis
 */
const ESSENTIAL_CATEGORIES = ["rent", "utilities", "bills", "savings", "emergency"];
const DISCRETIONARY_CATEGORIES = ["dining", "entertainment", "shopping", "hobby"];

/**
 * Allocation Comparison Service
 * Provides methods to compare allocations and generate insights
 */
export class AllocationComparisonService {
  /**
   * Compare current allocation with previous allocation
   * @param current - Current allocation snapshot
   * @param previous - Previous allocation snapshot
   * @returns Array of envelope changes
   */
  static compareAllocations(
    current: AllocationSnapshot,
    previous: AllocationSnapshot
  ): EnvelopeChange[] {
    const changes: EnvelopeChange[] = [];

    // Compare all envelopes in current allocation
    Object.entries(current.envelopeAllocations).forEach(([envelopeId, currentAmount]) => {
      const previousAmount = previous.envelopeAllocations[envelopeId] || 0;
      const changeCents = currentAmount - previousAmount;

      // Handle new envelopes differently from 100% increases
      const changePercent =
        previousAmount > 0
          ? (changeCents / previousAmount) * 100
          : changeCents > 0
            ? Infinity // Mark as new envelope
            : 0;

      const trend = this.determineTrend(changeCents);
      const sentiment = this.determineSentiment(envelopeId, changeCents);

      changes.push({
        envelopeId,
        envelopeName: envelopeId, // TODO: Resolve actual envelope name from ID
        currentAmount,
        previousAmount,
        changeCents,
        changePercent,
        trend,
        sentiment,
      });
    });

    // Add envelopes that were in previous but not current (removed envelopes)
    Object.entries(previous.envelopeAllocations).forEach(([envelopeId, previousAmount]) => {
      if (!current.envelopeAllocations[envelopeId]) {
        changes.push({
          envelopeId,
          envelopeName: envelopeId,
          currentAmount: 0,
          previousAmount,
          changeCents: -previousAmount,
          changePercent: -100,
          trend: "decrease",
          sentiment: this.determineSentiment(envelopeId, -previousAmount),
        });
      }
    });

    // Sort by absolute change amount (largest changes first)
    return changes.sort((a, b) => Math.abs(b.changeCents) - Math.abs(a.changeCents));
  }

  /**
   * Determine trend from change amount
   * @param changeCents - Change in cents
   * @returns Trend indicator
   */
  static determineTrend(changeCents: number): "increase" | "decrease" | "stable" {
    const STABLE_THRESHOLD = 100; // $1.00 - changes less than this are "stable"

    if (Math.abs(changeCents) < STABLE_THRESHOLD) {
      return "stable";
    }
    return changeCents > 0 ? "increase" : "decrease";
  }

  /**
   * Determine sentiment for envelope change
   * @param envelopeId - Envelope identifier
   * @param changeCents - Change in cents
   * @returns Sentiment indicator
   */
  static determineSentiment(
    envelopeId: string,
    changeCents: number
  ): "positive" | "negative" | "neutral" | "warning" {
    const envelopeIdLower = envelopeId.toLowerCase();

    // Check if envelope is essential or discretionary
    const isEssential = ESSENTIAL_CATEGORIES.some((cat) => envelopeIdLower.includes(cat));
    const isDiscretionary = DISCRETIONARY_CATEGORIES.some((cat) => envelopeIdLower.includes(cat));

    if (Math.abs(changeCents) < 100) {
      return "neutral"; // Less than $1 change
    }

    if (changeCents > 0) {
      // Increase
      if (isEssential) {
        return "positive"; // 🎉 More to savings/bills!
      }
      if (isDiscretionary) {
        return "warning"; // ⚠️ More to dining/entertainment?
      }
      return "neutral";
    } else {
      // Decrease
      if (isEssential) {
        return "negative"; // 🔴 Less to savings!
      }
      if (isDiscretionary) {
        return "positive"; // 🎉 Cutting discretionary spending!
      }
      return "neutral";
    }
  }

  /**
   * Create allocation snapshot from history entry
   * @param entry - Allocation history entry
   * @returns Allocation snapshot
   */
  static createSnapshotFromHistory(entry: AllocationHistoryEntry): AllocationSnapshot {
    const envelopeAllocations: Record<string, number> = {};

    entry.allocations.forEach((allocation) => {
      envelopeAllocations[allocation.envelopeId] = allocation.amountCents;
    });

    return {
      date: entry.date,
      totalCents: entry.paycheckAmountCents,
      envelopeAllocations,
      payerName: entry.payerName,
    };
  }

  /**
   * Create allocation snapshot from current wizard state
   * @param paycheckAmountCents - Paycheck amount in cents
   * @param allocations - Current allocations
   * @param payerName - Optional payer name
   * @returns Allocation snapshot
   */
  static createCurrentSnapshot(
    paycheckAmountCents: number,
    allocations: ReadonlyArray<{ envelopeId: string; amountCents: number }>,
    payerName?: string | null
  ): AllocationSnapshot {
    const envelopeAllocations: Record<string, number> = {};

    allocations.forEach((allocation) => {
      envelopeAllocations[allocation.envelopeId] = allocation.amountCents;
    });

    return {
      date: new Date().toISOString(),
      totalCents: paycheckAmountCents,
      envelopeAllocations,
      payerName: payerName || undefined,
    };
  }

  /**
   * Get full comparison with insights
   * @param current - Current allocation snapshot
   * @param previous - Previous allocation snapshot
   * @returns Full allocation comparison
   */
  static getComparison(
    current: AllocationSnapshot,
    previous: AllocationSnapshot
  ): AllocationComparison {
    const changes = this.compareAllocations(current, previous);

    logger.info("Generated allocation comparison", {
      changeCount: changes.length,
      currentTotal: current.totalCents,
      previousTotal: previous.totalCents,
    });

    return {
      current,
      previous,
      changes,
      insights: [], // Insights will be generated by InsightsService
    };
  }
}
