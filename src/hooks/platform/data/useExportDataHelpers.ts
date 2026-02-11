/**
 * Helper functions for useExportData hook
 * Extracted to reduce complexity
 *
 * Updated for Data Unification v2.0:
 * - Uses unified Envelope schema (type: "goal", "supplemental")
 * - Removes legacy table dependencies
 */

import type { Envelope } from "@/domain/schemas/envelope";

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
  modelVersion: "unified",
  budgetId: currentUser?.budgetId,
  userColor: currentUser?.userColor,
  syncContext: {
    note: "This data uses the unified v2.0 schema.",
    exportTimestamp: Date.now(),
  },
});

/**
 * Build data guide
 */
const buildDataGuide = () => ({
  note: "Primary arrays in v2.0 unified model:",
  primaryArrays: {
    envelopes: "All envelopes including goals and liabilities",
    transactions: "All transactions including scheduled/recurring",
    auditLog: "Change history and audit trail",
  },
  envelopeTypes: {
    types: {
      standard: "Regular budget envelopes",
      goal: "Savings goals",
      liability: "Bills and debts",
      supplemental: "FSA, HSA, etc.",
    },
  },
});

/**
 * Trigger file download
 */
export const triggerDownload = (exportableData: unknown): number => {
  const dataStr = JSON.stringify(exportableData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });

  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  link.download = `VioletVault Budget Backup ${timestamp}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return dataStr.length;
};

/**
 * Construct export object with all data and metadata
 */
export const constructExportObject = (
  data: [Envelope[], unknown[], unknown[], Record<string, unknown>],
  currentUser: { userName?: string; budgetId?: string; userColor?: string } | null
) => {
  const [envelopes, transactions, auditLog, metadata] = data;

  return {
    envelopes,
    transactions,
    auditLog,
    unassignedCash: metadata?.unassignedCash || 0,
    biweeklyAllocation: metadata?.biweeklyAllocation || 0,
    actualBalance: metadata?.actualBalance || 0,
    isActualBalanceManual: metadata?.isActualBalanceManual || false,
    exportMetadata: buildExportMetadata(currentUser),
    _dataGuide: buildDataGuide(),
  };
};
