import { budgetDb } from "../../db/budgetDb.ts";
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

const bulkAddIfPresent = async (table, data) => {
  if (data?.length) {
    await table.bulkAdd(data);
  }
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
      await bulkAddIfPresent(budgetDb.envelopes, data.envelopes);
      await bulkAddIfPresent(budgetDb.bills, data.bills);
      await bulkAddIfPresent(budgetDb.transactions, data.allTransactions);
      await bulkAddIfPresent(budgetDb.savingsGoals, data.savingsGoals);
      await bulkAddIfPresent(budgetDb.debts, data.debts);
      await bulkAddIfPresent(budgetDb.paycheckHistory, data.paycheckHistory);
      await bulkAddIfPresent(budgetDb.auditLog, data.auditLog);

      await budgetDb.budget.put({
        id: "metadata",
        lastModified: Date.now(),
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
