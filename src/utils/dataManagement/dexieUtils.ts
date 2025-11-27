import { budgetDb } from "@/db/budgetDb";
import type { Table } from "dexie";
import logger from "@/utils/common/logger";
import {
  EnvelopeSchema,
  SavingsEnvelopeSchema,
  SupplementalAccountSchema,
} from "@/domain/schemas/envelope";
import type { Envelope } from "@/domain/schemas/envelope";
import { v4 as uuidv4 } from "uuid";

const clearTable = async (table: Table) => {
  try {
    await table.clear();
  } catch (error) {
    logger.warn(
      `Standard clear failed for ${table.name}, using individual deletion`,
      error as Record<string, unknown>
    );
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

const bulkAddIfPresent = async (table: Table, data: unknown[] | undefined | null) => {
  if (data?.length) {
    await table.bulkAdd(data);
  }
};

/**
 * Legacy SavingsGoal interface for backward compatibility during import
 */
interface LegacySavingsGoal {
  id?: string;
  name: string;
  category: string;
  priority?: "low" | "medium" | "high";
  targetAmount: number;
  currentAmount: number;
  targetDate?: Date | string;
  isPaused?: boolean;
  isCompleted?: boolean;
  lastModified?: number;
  createdAt?: number;
  description?: string;
  monthlyContribution?: number;
}

/**
 * Legacy SupplementalAccount interface for backward compatibility during import
 */
interface LegacySupplementalAccount {
  id?: string;
  name: string;
  category?: string;
  currentBalance?: number;
  annualContribution?: number;
  expirationDate?: Date | string | null;
  isActive?: boolean;
  accountType?: string;
  lastModified?: number;
  createdAt?: number;
  description?: string;
}

/**
 * Convert a legacy savings goal to an envelope with envelopeType: "savings"
 *
 * Note: Validation failures are logged but data is still imported to prevent data loss.
 * This is intentional for import functionality - we prioritize preserving user data
 * over strict validation, allowing the app to handle any inconsistencies at runtime.
 */
const convertSavingsGoalToEnvelope = (goal: LegacySavingsGoal): Envelope => {
  const now = Date.now();
  const envelope: Envelope = {
    id: goal.id || uuidv4(),
    name: goal.name,
    category: goal.category || "Savings",
    archived: false,
    lastModified: goal.lastModified || now,
    createdAt: goal.createdAt || now,
    currentBalance: goal.currentAmount || 0,
    targetAmount: goal.targetAmount || 0,
    description: goal.description,
    envelopeType: "savings",
    priority: goal.priority || "medium",
    isPaused: goal.isPaused || false,
    isCompleted: goal.isCompleted || false,
    targetDate: goal.targetDate,
    monthlyContribution: goal.monthlyContribution,
  };

  // Validate with SavingsEnvelopeSchema - warnings only, data is still imported
  const result = SavingsEnvelopeSchema.safeParse(envelope);
  if (!result.success) {
    logger.warn("Savings goal envelope validation failed, using raw data to prevent data loss", {
      id: envelope.id,
      errors: result.error.issues,
    });
  }

  return envelope;
};

/**
 * Convert a legacy supplemental account to an envelope with envelopeType: "supplemental"
 *
 * Note: Validation failures are logged but data is still imported to prevent data loss.
 * This is intentional for import functionality - we prioritize preserving user data
 * over strict validation, allowing the app to handle any inconsistencies at runtime.
 */
const convertSupplementalAccountToEnvelope = (account: LegacySupplementalAccount): Envelope => {
  const now = Date.now();
  const envelope: Envelope = {
    id: account.id || uuidv4(),
    name: account.name,
    category: account.category || "Supplemental",
    archived: false,
    lastModified: account.lastModified || now,
    createdAt: account.createdAt || now,
    currentBalance: account.currentBalance || 0,
    description: account.description,
    envelopeType: "supplemental",
    annualContribution: account.annualContribution,
    expirationDate: account.expirationDate,
    isActive: account.isActive !== false,
    accountType: account.accountType,
  };

  // Validate with SupplementalAccountSchema - warnings only, data is still imported
  const result = SupplementalAccountSchema.safeParse(envelope);
  if (!result.success) {
    logger.warn(
      "Supplemental account envelope validation failed, using raw data to prevent data loss",
      {
        id: envelope.id,
        errors: result.error.issues,
      }
    );
  }

  return envelope;
};

/**
 * Validate imported envelopes with EnvelopeSchema
 * Returns validated envelopes, logging warnings for invalid ones
 *
 * Note: Validation failures are logged but data is still imported to prevent data loss.
 * This is intentional for import functionality - we prioritize preserving user data
 * over strict validation, allowing the app to handle any inconsistencies at runtime.
 */
const validateEnvelopes = (envelopes: unknown[]): Envelope[] => {
  return envelopes.map((envelope) => {
    const result = EnvelopeSchema.safeParse(envelope);
    if (!result.success) {
      logger.warn("Envelope validation failed, using raw data to prevent data loss", {
        id: (envelope as Record<string, unknown>)?.id,
        errors: result.error.issues,
      });
      return envelope as Envelope;
    }
    return result.data;
  });
};

interface ImportData {
  envelopes?: unknown[];
  bills?: unknown[];
  allTransactions?: unknown[];
  savingsGoals?: unknown[];
  debts?: unknown[];
  paycheckHistory?: unknown[];
  auditLog?: unknown[];
  unassignedCash?: number;
  biweeklyAllocation?: number;
  actualBalance?: number;
  isActualBalanceManual?: boolean;
  supplementalAccounts?: unknown[];
}

export const importDataToDexie = async (data: ImportData) => {
  logger.info("Importing data to Dexie");

  // Convert savings goals to envelopes with envelopeType: "savings"
  const savingsEnvelopes: Envelope[] = (data.savingsGoals || []).map((goal) =>
    convertSavingsGoalToEnvelope(goal as LegacySavingsGoal)
  );

  // Convert supplemental accounts to envelopes with envelopeType: "supplemental"
  const supplementalEnvelopes: Envelope[] = (data.supplementalAccounts || []).map((account) =>
    convertSupplementalAccountToEnvelope(account as LegacySupplementalAccount)
  );

  // Validate and merge all envelopes
  const existingEnvelopes = validateEnvelopes(data.envelopes || []);

  // Filter out any savings/supplemental envelopes that already exist in the envelopes array
  // (to avoid duplicates if the export already contains them as envelopes)
  const existingEnvelopeIds = new Set(existingEnvelopes.map((e) => e.id));
  const newSavingsEnvelopes = savingsEnvelopes.filter((e) => !existingEnvelopeIds.has(e.id));
  const newSupplementalEnvelopes = supplementalEnvelopes.filter(
    (e) => !existingEnvelopeIds.has(e.id)
  );

  // Combine all envelopes
  const allEnvelopes = [...existingEnvelopes, ...newSavingsEnvelopes, ...newSupplementalEnvelopes];

  logger.info("Envelope conversion complete", {
    existingEnvelopes: existingEnvelopes.length,
    convertedSavingsGoals: newSavingsEnvelopes.length,
    convertedSupplementalAccounts: newSupplementalEnvelopes.length,
    totalEnvelopes: allEnvelopes.length,
  });

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
      // Import all envelopes (including converted savings and supplemental)
      await bulkAddIfPresent(budgetDb.envelopes, allEnvelopes);
      await bulkAddIfPresent(budgetDb.bills, data.bills);
      await bulkAddIfPresent(budgetDb.transactions, data.allTransactions);
      // Note: savingsGoals table is deprecated, but we keep it for backward compatibility
      // New savings goals are imported as envelopes with envelopeType: "savings"
      await bulkAddIfPresent(budgetDb.debts, data.debts);
      await bulkAddIfPresent(budgetDb.paycheckHistory, data.paycheckHistory);
      await bulkAddIfPresent(budgetDb.auditLog, data.auditLog);

      // Budget metadata no longer stores supplementalAccounts
      // They are now stored as envelopes with envelopeType: "supplemental"
      await budgetDb.budget.put({
        id: "metadata",
        lastModified: Date.now(),
        unassignedCash: data.unassignedCash || 0,
        biweeklyAllocation: data.biweeklyAllocation || 0,
        actualBalance: data.actualBalance || 0,
        isActualBalanceManual: data.isActualBalanceManual || false,
        lastUpdated: new Date().toISOString(),
      });
    }
  );
  logger.info("Data imported to Dexie successfully");
};
