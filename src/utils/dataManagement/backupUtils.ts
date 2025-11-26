import { budgetDb, getBudgetMetadata } from "../../db/budgetDb.ts";
import logger from "../common/logger";

export const backupCurrentData = async () => {
  try {
    logger.info("Creating backup of current data");
    const [
      envelopes,
      bills,
      transactions,
      savingsGoals,
      debts,
      paycheckHistory,
      auditLog,
      metadata,
    ] = await Promise.all([
      budgetDb.envelopes.toArray(),
      budgetDb.bills.toArray(),
      budgetDb.transactions.toArray(),
      budgetDb.savingsGoals.toArray(),
      budgetDb.debts.toArray(),
      budgetDb.paycheckHistory.toArray(),
      budgetDb.auditLog.toArray(),
      getBudgetMetadata(),
    ]);

    const currentData = {
      envelopes,
      bills,
      transactions,
      savingsGoals,
      debts,
      paycheckHistory,
      auditLog,
      unassignedCash: metadata?.unassignedCash || 0,
      biweeklyAllocation: metadata?.biweeklyAllocation || 0,
      actualBalance: metadata?.actualBalance || 0,
      isActualBalanceManual: metadata?.isActualBalanceManual || false,
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    localStorage.setItem(`dexie_backup_${timestamp}`, JSON.stringify(currentData));
    logger.info("Current Dexie data backed up successfully");
  } catch (backupError) {
    logger.warn("Failed to create backup", backupError as Record<string, unknown>);
  }
};
