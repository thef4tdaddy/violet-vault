import { budgetDb } from "@/db/budgetDb";
import type { Table } from "dexie";
import logger from "@/utils/common/logger";
import {
  EnvelopeSchema,
  GoalEnvelopeSchema,
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
    [budgetDb.envelopes, budgetDb.transactions, budgetDb.auditLog, budgetDb.budget],
    async () => {
      await clearTable(budgetDb.envelopes);
      await clearTable(budgetDb.transactions);
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
 * Normalize date field to Unix timestamp (number)
 */
const normalizeDate = (date: unknown): number => {
  if (typeof date === "number") {
    return date;
  }
  if (typeof date === "string") {
    const parsed = Date.parse(date);
    return isNaN(parsed) ? Date.now() : parsed;
  }
  if (date instanceof Date) {
    return date.getTime();
  }
  return Date.now();
};

/**
 * Convert a legacy savings goal to an envelope with type: "goal"
 */
const convertSavingsGoalToEnvelope = (goal: LegacySavingsGoal): Envelope => {
  const now = Date.now();
  const envelopeData = {
    id: goal.id || uuidv4(),
    name: goal.name,
    category: goal.category || "Savings",
    archived: false,
    lastModified: goal.lastModified ? normalizeDate(goal.lastModified) : now,
    createdAt: goal.createdAt ? normalizeDate(goal.createdAt) : now,
    currentBalance: goal.currentAmount || 0,
    targetAmount: goal.targetAmount || 0,
    description: goal.description || "",
    type: "goal" as const,
    priority: goal.priority || "medium",
    isPaused: goal.isPaused || false,
    isCompleted: goal.isCompleted || false,
    targetDate: goal.targetDate,
    monthlyContribution: goal.monthlyContribution,
  };

  const result = GoalEnvelopeSchema.safeParse(envelopeData);
  if (!result.success) {
    logger.warn("Savings goal envelope validation failed, using raw data to prevent data loss", {
      id: envelopeData.id,
      errors: result.error.issues,
    });
    return envelopeData as unknown as Envelope;
  }

  return result.data as Envelope;
};

/**
 * Convert a legacy supplemental account to an envelope with type: "supplemental"
 */
const convertSupplementalAccountToEnvelope = (account: LegacySupplementalAccount): Envelope => {
  const now = Date.now();
  const envelopeData = {
    id: account.id || uuidv4(),
    name: account.name,
    category: account.category || "Supplemental",
    archived: false,
    lastModified: account.lastModified ? normalizeDate(account.lastModified) : now,
    createdAt: account.createdAt ? normalizeDate(account.createdAt) : now,
    currentBalance: account.currentBalance || 0,
    description: account.description || "",
    type: "supplemental" as const,
    accountType: (account.accountType as string) || "other",
    annualContribution: account.annualContribution,
    expirationDate: account.expirationDate,
    isActive: account.isActive !== false,
  };

  const result = SupplementalAccountSchema.safeParse(envelopeData);
  if (!result.success) {
    logger.warn(
      "Supplemental account envelope validation failed, using raw data to prevent data loss",
      {
        id: envelopeData.id,
        errors: result.error.issues,
      }
    );
    return envelopeData as unknown as Envelope;
  }

  return result.data as Envelope;
};

/**
 * Validate imported envelopes
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
  transactions?: unknown[];
  allTransactions?: unknown[]; // Legacy alias
  savingsGoals?: unknown[];
  unassignedCash?: number;
  biweeklyAllocation?: number;
  actualBalance?: number;
  isActualBalanceManual?: boolean;
  supplementalAccounts?: unknown[];
  auditLog?: unknown[];
}

export const importDataToDexie = async (data: ImportData) => {
  logger.info("Importing data to Dexie");

  const savingsEnvelopes = (data.savingsGoals || []).map((goal) =>
    convertSavingsGoalToEnvelope(goal as LegacySavingsGoal)
  );

  const supplementalEnvelopes = (data.supplementalAccounts || []).map((account) =>
    convertSupplementalAccountToEnvelope(account as LegacySupplementalAccount)
  );

  const existingEnvelopes = validateEnvelopes(data.envelopes || []);
  const existingEnvelopeIds = new Set(existingEnvelopes.map((e) => e.id));

  const newSavingsEnvelopes = savingsEnvelopes.filter((e) => !existingEnvelopeIds.has(e.id));
  const newSupplementalEnvelopes = supplementalEnvelopes.filter(
    (e) => !existingEnvelopeIds.has(e.id)
  );

  const allEnvelopes = [...existingEnvelopes, ...newSavingsEnvelopes, ...newSupplementalEnvelopes];

  await budgetDb.transaction(
    "rw",
    [budgetDb.envelopes, budgetDb.transactions, budgetDb.auditLog, budgetDb.budget],
    async () => {
      await bulkAddIfPresent(budgetDb.envelopes, allEnvelopes);
      await bulkAddIfPresent(budgetDb.transactions, data.allTransactions || data.transactions);
      await bulkAddIfPresent(budgetDb.auditLog, data.auditLog);

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
