/**
 * Helper functions for useExportData hook
 * Extracted to reduce complexity
 *
 * Updated for Issue #1337: Import/Export Data to Use Envelope-Based Model
 * - Savings goals are now exported as envelopes filtered by envelopeType: "savings"
 * - Supplemental accounts are now exported as envelopes filtered by envelopeType: "supplemental"
 * - Legacy arrays (savingsGoals, supplementalAccounts) are maintained for backward compatibility
 */

import type { Envelope } from "@/domain/schemas/envelope";

/**
 * Envelope type with optional envelopeType field for filtering
 */
interface EnvelopeWithType {
  id: string;
  name: string;
  category: string;
  envelopeType?: string;
  currentBalance?: number;
  targetAmount?: number;
  priority?: string;
  isPaused?: boolean;
  isCompleted?: boolean;
  targetDate?: Date | string;
  monthlyContribution?: number;
  annualContribution?: number;
  expirationDate?: Date | string | null;
  isActive?: boolean;
  accountType?: string;
  [key: string]: unknown;
}

/**
 * Build export metadata
 */
const buildExportMetadata = (
  currentUser: { userName?: string; budgetId?: string; userColor?: string } | null
) => ({
  exportedBy: currentUser?.userName || "Unknown User",
  exportDate: new Date().toISOString(),
  appVersion: "2.0.0",
  dataVersion: "2.0",
  dataSource: "dexie",
  exportedFrom: "develop-branch",
  budgetId: currentUser?.budgetId,
  userColor: currentUser?.userColor,
  modelVersion: "envelope-based",
  syncContext: {
    note: "This data uses the simplified envelope-based model. Savings goals and supplemental accounts are stored as envelopes.",
    originalBudgetId: currentUser?.budgetId,
    exportTimestamp: Date.now(),
  },
});

/**
 * Build data guide - updated for v2.0 envelope-based model
 */
const buildDataGuide = () => ({
  note: "For mass updates, use these primary arrays (v2.0 envelope-based model):",
  primaryArrays: {
    envelopes:
      "Main envelope data - includes regular envelopes, savings goals (envelopeType: savings), and supplemental accounts (envelopeType: supplemental)",
    bills: "Bill payment data - edit amount, dueDate, provider, etc.",
    debts: "Debt tracking data - edit currentBalance, minimumPayment, etc.",
    paycheckHistory: "Paycheck history for trend analysis",
    transactions: "Pure transactions only (filtered from allTransactions)",
    allTransactions: "All transactions + bills combined (auto-generated, don't edit directly)",
    auditLog: "Change history and audit trail (generally shouldn't be edited)",
  },
  envelopeTypes: {
    note: "Envelopes are categorized by envelopeType field:",
    types: {
      bill: "Envelopes linked to recurring bills",
      variable: "Regular budget envelopes for variable expenses",
      savings: "Savings goals (replaces legacy savingsGoals table)",
      supplemental: "Supplemental accounts like FSA/HSA (replaces legacy supplementalAccounts)",
    },
  },
  legacyArrays: {
    note: "These arrays are provided for backward compatibility during import. New exports use envelopes only.",
    savingsGoals: "Legacy savings goals data - now stored as envelopes with envelopeType: savings",
    supplementalAccounts:
      "Legacy supplemental accounts - now stored as envelopes with envelopeType: supplemental",
  },
  importInstructions:
    "Edit 'envelopes' array for all envelope types (including savings/supplemental). Legacy arrays are converted to envelopes on import.",
});

/**
 * Convert envelope-based savings goal to legacy format for backward compatibility
 */
const convertEnvelopeToLegacySavingsGoal = (envelope: EnvelopeWithType) => ({
  id: envelope.id,
  name: envelope.name,
  category: envelope.category,
  priority: envelope.priority || "medium",
  targetAmount: envelope.targetAmount || 0,
  currentAmount: envelope.currentBalance || 0,
  targetDate: envelope.targetDate,
  isPaused: envelope.isPaused || false,
  isCompleted: envelope.isCompleted || false,
  lastModified: envelope.lastModified as number,
  createdAt: envelope.createdAt as number,
  description: envelope.description as string | undefined,
  monthlyContribution: envelope.monthlyContribution,
});

/**
 * Convert envelope-based supplemental account to legacy format for backward compatibility
 */
const convertEnvelopeToLegacySupplementalAccount = (envelope: EnvelopeWithType) => ({
  id: envelope.id,
  name: envelope.name,
  category: envelope.category,
  currentBalance: envelope.currentBalance || 0,
  annualContribution: envelope.annualContribution,
  expirationDate: envelope.expirationDate,
  isActive: envelope.isActive !== false,
  accountType: envelope.accountType,
  lastModified: envelope.lastModified as number,
  createdAt: envelope.createdAt as number,
  description: envelope.description as string | undefined,
});

/**
 * Construct export object with all data and metadata
 * Updated for v2.0 envelope-based model:
 * - Filters envelopes by type for savings/supplemental exports
 * - Provides legacy arrays for backward compatibility
 * - Removes supplementalAccounts from metadata
 */
export const constructExportObject = (
  data: unknown[],
  currentUser: { userName?: string; budgetId?: string; userColor?: string } | null
) => {
  const [
    envelopes,
    bills,
    transactions,
    _legacySavingsGoals, // Ignored - we use envelope-filtered savings
    debts,
    paycheckHistory,
    auditLog,
    metadata,
  ] = data as [
    EnvelopeWithType[],
    unknown[],
    Array<{ type?: string }>,
    unknown[],
    unknown[],
    unknown[],
    unknown[],
    (
      | {
          unassignedCash?: number;
          biweeklyAllocation?: number;
          actualBalance?: number;
          isActualBalanceManual?: boolean;
        }
      | undefined
    ),
  ];

  const pureTransactions = transactions.filter((t) => !t.type || t.type === "transaction");

  // Filter envelopes by type
  const savingsEnvelopes = envelopes.filter((e) => e.envelopeType === "savings");
  const supplementalEnvelopes = envelopes.filter((e) => e.envelopeType === "supplemental");
  const regularEnvelopes = envelopes.filter(
    (e) => !e.envelopeType || (e.envelopeType !== "savings" && e.envelopeType !== "supplemental")
  );

  // Convert to legacy format for backward compatibility
  const legacySavingsGoals = savingsEnvelopes.map(convertEnvelopeToLegacySavingsGoal);
  const legacySupplementalAccounts = supplementalEnvelopes.map(
    convertEnvelopeToLegacySupplementalAccount
  );

  return {
    // All envelopes including savings and supplemental types
    envelopes: envelopes as Envelope[],
    // Regular envelopes only (for legacy consumers that don't understand envelope types)
    regularEnvelopes,
    bills,
    transactions: pureTransactions,
    allTransactions: transactions,
    // Legacy savings goals for backward compatibility (converted from savings envelopes)
    savingsGoals: legacySavingsGoals,
    // Legacy supplemental accounts for backward compatibility (converted from supplemental envelopes)
    supplementalAccounts: legacySupplementalAccounts,
    debts,
    paycheckHistory,
    auditLog,
    unassignedCash: metadata?.unassignedCash || 0,
    biweeklyAllocation: metadata?.biweeklyAllocation || 0,
    actualBalance: metadata?.actualBalance || 0,
    isActualBalanceManual: metadata?.isActualBalanceManual || false,
    exportMetadata: buildExportMetadata(currentUser),
    _dataGuide: buildDataGuide(),
  };
};
