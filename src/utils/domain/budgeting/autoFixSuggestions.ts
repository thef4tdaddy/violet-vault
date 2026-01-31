/**
 * Auto-Fix Suggestion Algorithm - Issue #1853
 * Rule-based fund redistribution from discretionary to bill envelopes
 */

import type { BillCoverageResult } from "@/services/forecasting/forecastingService";

export interface AutoFixSuggestion {
  fromEnvelopeId: string;
  fromEnvelopeName: string;
  toEnvelopeId: string;
  toEnvelopeName: string;
  amountCents: number;
  reason: string;
}

export interface EnvelopeWithAllocation {
  id: string;
  name: string;
  currentBalance: number;
  monthlyTarget: number;
  isDiscretionary: boolean;
  category: string;
  allocationAmount: number;
}

/**
 * Generate auto-fix suggestions to cover bill shortages
 *
 * Algorithm:
 * 1. Identify discretionary envelopes with excess allocation
 * 2. Sort by excess amount (highest first)
 * 3. Distribute excess to critical bills by shortage amount
 */
export function generateAutoFixSuggestions(
  bills: BillCoverageResult[],
  envelopes: EnvelopeWithAllocation[]
): AutoFixSuggestion[] {
  // Filter bills with shortages, sort by shortage amount (critical first)
  const criticalBills = bills.filter((b) => b.shortage > 0).sort((a, b) => b.shortage - a.shortage);

  if (criticalBills.length === 0) {
    return []; // No shortages to fix
  }

  // Identify discretionary envelopes with excess
  const discretionaryCategories = [
    "Food & Dining",
    "Entertainment",
    "Shopping",
    "Personal Care",
    "Pets",
    "Gifts & Donations",
  ];

  const excessEnvelopes = envelopes
    .filter((env) => {
      // Must be discretionary and have allocation
      if (!env.isDiscretionary && !discretionaryCategories.includes(env.category)) {
        return false;
      }

      // Calculate projected balance
      const projected = env.currentBalance + env.allocationAmount;
      const monthlyTarget = env.monthlyTarget || 0;

      // Has excess if projected > target
      return projected > monthlyTarget;
    })
    .map((env) => {
      const projected = env.currentBalance + env.allocationAmount;
      const monthlyTarget = env.monthlyTarget || 0;
      const excess = projected - monthlyTarget;

      return {
        ...env,
        excessCents: Math.max(0, excess),
      };
    })
    .filter((env) => env.excessCents > 0)
    .sort((a, b) => b.excessCents - a.excessCents); // Highest excess first

  if (excessEnvelopes.length === 0) {
    return []; // No discretionary funds to redistribute
  }

  // Generate transfer suggestions
  const suggestions: AutoFixSuggestion[] = [];

  for (const criticalBill of criticalBills) {
    let remainingShortage = criticalBill.shortage;

    // Find envelope for this bill
    const billEnvelope = envelopes.find((e) => e.id === criticalBill.envelopeId);
    if (!billEnvelope) continue;

    // Try to cover shortage from discretionary envelopes
    for (const excessEnv of excessEnvelopes) {
      if (remainingShortage <= 0) break;

      const transferAmount = Math.min(excessEnv.excessCents, remainingShortage);

      if (transferAmount > 0) {
        suggestions.push({
          fromEnvelopeId: excessEnv.id,
          fromEnvelopeName: excessEnv.name,
          toEnvelopeId: billEnvelope.id,
          toEnvelopeName: billEnvelope.name,
          amountCents: transferAmount,
          reason: `Cover ${billEnvelope.name} shortage (due in ${criticalBill.daysUntilDue} days)`,
        });

        // Reduce available excess
        excessEnv.excessCents -= transferAmount;
        remainingShortage -= transferAmount;
      }
    }
  }

  return suggestions;
}

/**
 * Calculate total amount that would be transferred
 */
export function calculateTotalTransferAmount(suggestions: AutoFixSuggestion[]): number {
  return suggestions.reduce((sum, s) => sum + s.amountCents, 0);
}

/**
 * Apply auto-fix suggestions to allocations
 */
export function applyAutoFixSuggestions(
  allocations: Array<{ envelopeId: string; amountCents: number }>,
  suggestions: AutoFixSuggestion[]
): Array<{ envelopeId: string; amountCents: number }> {
  // Create a copy of allocations
  const updatedAllocations = new Map(allocations.map((a) => [a.envelopeId, a.amountCents]));

  // Apply each suggestion
  for (const suggestion of suggestions) {
    // Reduce from source envelope
    const fromAmount = updatedAllocations.get(suggestion.fromEnvelopeId) || 0;
    updatedAllocations.set(
      suggestion.fromEnvelopeId,
      Math.max(0, fromAmount - suggestion.amountCents)
    );

    // Increase to target envelope
    const toAmount = updatedAllocations.get(suggestion.toEnvelopeId) || 0;
    updatedAllocations.set(suggestion.toEnvelopeId, toAmount + suggestion.amountCents);
  }

  // Convert back to array
  return Array.from(updatedAllocations.entries()).map(([envelopeId, amountCents]) => ({
    envelopeId,
    amountCents,
  }));
}

/**
 * Validate that auto-fix suggestions won't create negative allocations
 */
export function validateAutoFixSuggestions(
  allocations: Array<{ envelopeId: string; amountCents: number }>,
  suggestions: AutoFixSuggestion[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const allocationMap = new Map(allocations.map((a) => [a.envelopeId, a.amountCents]));

  for (const suggestion of suggestions) {
    const fromAmount = allocationMap.get(suggestion.fromEnvelopeId) || 0;

    if (suggestion.amountCents > fromAmount) {
      errors.push(
        `Cannot transfer ${suggestion.amountCents} from ${suggestion.fromEnvelopeName} (only ${fromAmount} available)`
      );
    }

    if (suggestion.amountCents <= 0) {
      errors.push(`Invalid transfer amount: ${suggestion.amountCents}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
