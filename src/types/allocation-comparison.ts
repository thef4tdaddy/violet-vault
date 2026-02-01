/**
 * Allocation Comparison Types
 * Type definitions for Historical Comparison View feature
 * Part of Issue #[NUMBER]: Historical Comparison View
 */

/**
 * Allocation Snapshot - A point-in-time allocation record
 */
export interface AllocationSnapshot {
  readonly date: string; // ISO date string
  readonly totalCents: number;
  readonly envelopeAllocations: Map<string, number>; // envelopeId -> amountCents
  readonly frequency?: "weekly" | "biweekly" | "semi-monthly" | "monthly";
  readonly payerName?: string;
}

/**
 * Envelope Change - Comparison between current and previous allocation
 */
export interface EnvelopeChange {
  readonly envelopeId: string;
  readonly envelopeName: string;
  readonly currentAmount: number; // cents
  readonly previousAmount: number; // cents
  readonly changeCents: number;
  readonly changePercent: number;
  readonly trend: "increase" | "decrease" | "stable";
  readonly sentiment: "positive" | "negative" | "neutral" | "warning";
}

/**
 * Insight - Smart analysis and suggestions
 */
export interface Insight {
  readonly type: "trend" | "goal_progress" | "anomaly" | "suggestion";
  readonly severity: "info" | "warning" | "success";
  readonly message: string;
  readonly envelopeIds?: string[];
}

/**
 * Allocation Comparison - Full comparison result
 */
export interface AllocationComparison {
  readonly current: AllocationSnapshot;
  readonly previous: AllocationSnapshot;
  readonly changes: EnvelopeChange[];
  readonly insights: Insight[];
}

/**
 * Trend Analysis - Historical trend data
 */
export interface TrendAnalysis {
  readonly average: number;
  readonly direction: "increasing" | "decreasing" | "stable";
  readonly volatility: number;
  readonly isStable: boolean;
}

/**
 * Allocation History Entry - Extended paycheck history with allocations
 */
export interface AllocationHistoryEntry {
  readonly id: string;
  readonly date: string; // ISO date
  readonly paycheckAmountCents: number;
  readonly payerName?: string;
  readonly allocations: ReadonlyArray<{
    readonly envelopeId: string;
    readonly amountCents: number;
  }>;
  readonly strategy?: "even_split" | "last_split" | "target_first" | "manual";
}
