/**
 * Bill Coverage Calculation Utilities - Issue #1853
 * Pure functions for coverage status, formatting, and visual indicators
 */

export type CoverageStatus = "covered" | "partial" | "uncovered";

/**
 * Get status icon based on coverage status
 */
export function getCoverageIcon(status: CoverageStatus): string {
  switch (status) {
    case "covered":
      return "✅";
    case "partial":
      return "⚠️";
    case "uncovered":
      return "❌";
    default:
      return "❓";
  }
}

/**
 * Get border color class based on coverage status
 */
export function getCoverageBorderColor(status: CoverageStatus): string {
  switch (status) {
    case "covered":
      return "border-green-500";
    case "partial":
      return "border-yellow-500";
    case "uncovered":
      return "border-red-500";
    default:
      return "border-slate-300";
  }
}

/**
 * Get background color class based on coverage status
 */
export function getCoverageBackgroundColor(status: CoverageStatus): string {
  switch (status) {
    case "covered":
      return "bg-green-50";
    case "partial":
      return "bg-yellow-50";
    case "uncovered":
      return "bg-red-50";
    default:
      return "bg-slate-50";
  }
}

/**
 * Get progress bar color class based on coverage status
 */
export function getCoverageProgressColor(status: CoverageStatus): string {
  switch (status) {
    case "covered":
      return "bg-green-500";
    case "partial":
      return "bg-yellow-500";
    case "uncovered":
      return "bg-red-500";
    default:
      return "bg-slate-300";
  }
}

/**
 * Get text color class for coverage percentage
 */
export function getCoverageTextColor(status: CoverageStatus): string {
  switch (status) {
    case "covered":
      return "text-green-700";
    case "partial":
      return "text-yellow-700";
    case "uncovered":
      return "text-red-700";
    default:
      return "text-slate-700";
  }
}

/**
 * Format cents as dollars with 2 decimal places
 */
export function formatCentsAsDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Format cents as dollars with currency symbol
 */
export function formatCentsAsCurrency(cents: number): string {
  return `$${formatCentsAsDollars(cents)}`;
}

/**
 * Calculate coverage percentage
 */
export function calculateCoveragePercent(projectedBalance: number, billAmount: number): number {
  if (billAmount <= 0) return 0;
  return Math.round((projectedBalance / billAmount) * 1000) / 10; // Round to 1 decimal
}

/**
 * Determine coverage status from percentage
 */
export function getCoverageStatus(coveragePercent: number): CoverageStatus {
  if (coveragePercent >= 100) return "covered";
  if (coveragePercent >= 50) return "partial";
  return "uncovered";
}

/**
 * Format days until due as human-readable text
 */
export function formatDaysUntilDue(days: number): string {
  if (days < 0) return "Overdue";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

/**
 * Get urgency level from days until due
 */
export function getUrgencyLevel(days: number): "overdue" | "urgent" | "soon" | "normal" {
  if (days < 0) return "overdue";
  if (days <= 2) return "urgent";
  if (days <= 7) return "soon";
  return "normal";
}

/**
 * Get urgency color class
 */
export function getUrgencyColor(days: number): string {
  const urgency = getUrgencyLevel(days);
  switch (urgency) {
    case "overdue":
      return "text-red-700";
    case "urgent":
      return "text-orange-700";
    case "soon":
      return "text-yellow-700";
    case "normal":
      return "text-slate-700";
  }
}
