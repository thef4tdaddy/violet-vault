import { budgetDb } from "../../db/budgetDb.js";
import logger from "../common/logger";

const clearTable = async (table) => {
  try {
    await table.clear();
  } catch (error) {
    logger.warn(`Standard clear failed for ${table.name}, using individual deletion`, error);
    await table.toCollection().delete();
  }
};

export const clearAllDexieData = async () => {
  logger.info("Clearing all data from Dexie");
  await budgetDb.transaction(
    "rw",
    [
      budgetDb.envelopes,
      budgetDb.bills,
      budgetDb.transactions,
      budgetDb.savingsGoals,
      budgetDb.debts,
      budgetDb.paycheckHistory,
      budgetDb.auditLog,
      budgetDb.budget,
    ],
    async () => {
      await clearTable(budgetDb.envelopes);
      await clearTable(budgetDb.bills);
      await clearTable(budgetDb.transactions);
      await clearTable(budgetDb.savingsGoals);
      await clearTable(budgetDb.debts);
      await clearTable(budgetDb.paycheckHistory);
      await clearTable(budgetDb.auditLog);
      await clearTable(budgetDb.budget);
    }
  );
  logger.info("All Dexie data cleared successfully");
};

export const importDataToDexie = async (data) => {
  logger.info("Importing data to Dexie");
  await budgetDb.transaction(
    "rw",
    [
      budgetDb.envelopes,
      budgetDb.bills,
      budgetDb.transactions,
      budgetDb.savingsGoals,
      budgetDb.debts,
      budgetDb.paycheckHistory,
      budgetDb.auditLog,
      budgetDb.budget,
    ],
    async () => {
      if (data.envelopes?.length) {
        await budgetDb.envelopes.bulkAdd(data.envelopes);
      }
      if (data.bills?.length) {
        await budgetDb.bills.bulkAdd(data.bills);
      }
      if (data.allTransactions?.length) {
        await budgetDb.transactions.bulkAdd(data.allTransactions);
      }
      if (data.savingsGoals?.length) {
        await budgetDb.savingsGoals.bulkAdd(data.savingsGoals);
      }
      if (data.debts?.length) {
        await budgetDb.debts.bulkAdd(data.debts);
      }
      if (data.paycheckHistory?.length) {
        await budgetDb.paycheckHistory.bulkAdd(data.paycheckHistory);
      }
      if (data.auditLog?.length) {
        await budgetDb.auditLog.bulkAdd(data.auditLog);
      }
      await budgetDb.budget.put({
        id: "metadata",
        unassignedCash: data.unassignedCash || 0,
        biweeklyAllocation: data.biweeklyAllocation || 0,
        actualBalance: data.actualBalance || 0,
        isActualBalanceManual: data.isActualBalanceManual || false,
        supplementalAccounts: data.supplementalAccounts || [],
        lastUpdated: new Date().toISOString(),
      });
    }
  );
  logger.info("Data imported to Dexie successfully");
};