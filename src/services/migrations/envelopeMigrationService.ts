/**
 * Envelope Migration Service
 * Issue #1335: Database Schema Migration for Savings Goals and Supplemental Accounts
 *
 * Migrates:
 * - Savings goals to envelopes with envelopeType: "savings"
 * - Supplemental accounts to envelopes with envelopeType: "supplemental"
 * - SINKING_FUND envelope type to "savings" with targetDate metadata
 */

import { budgetDb } from "../../db/budgetDb";
import type { Envelope, SavingsGoal } from "../../db/types";
import { ENVELOPE_TYPES } from "../../constants/categories";
import logger from "@/utils/core/common/logger";
import { SupplementalAccountSchema } from "../../domain/schemas/envelope";
import { z } from "zod";
import { Table } from "dexie";

type SupplementalAccountType = z.infer<typeof SupplementalAccountSchema>["accountType"];

interface LegacyTable {
  count: () => Promise<number>;
  toArray: () => Promise<Record<string, unknown>[]>;
}
interface LegacyDb {
  savingsGoals: LegacyTable;
}

/**
 * Supplemental account record structure from budget metadata
 */
interface SupplementalAccountRecord {
  id?: string | number;
  name?: string;
  type?: string;
  balance?: number;
  currentBalance?: number;
  annualContribution?: number;
  expirationDate?: string | Date | null;
  isActive?: boolean;
  description?: string;
  color?: string;
  [key: string]: unknown;
}

/**
 * Migration result interface
 */
export interface MigrationResult {
  success: boolean;
  migratedSavingsGoals: number;
  migratedSupplementalAccounts: number;
  migratedSinkingFunds: number;
  errors: string[];
  warnings: string[];
}

/**
 * Converts a SavingsGoal to an Envelope with envelopeType: "savings"
 */
export const convertSavingsGoalToEnvelope = (goal: SavingsGoal): Envelope => {
  return {
    id: goal.id,
    name: goal.name,
    category: goal.category || "Savings",
    archived: goal.isCompleted || false,
    lastModified: goal.lastModified || Date.now(),
    createdAt: goal.createdAt,
    currentBalance: goal.currentAmount || 0,
    targetAmount: goal.targetAmount || 0,
    description: goal.description || "",
    type: "goal",
    priority: (goal.priority as "medium") || "medium",
    color: "gray",

    isPaused: (goal as Record<string, unknown>).isPaused === true,
    isCompleted: (goal as Record<string, unknown>).isCompleted === true,
    targetDate: goal.targetDate,
    monthlyContribution: goal.monthlyContribution,
    autoAllocate: true,
  };
};

/**
 * Converts a supplemental account record to an Envelope with envelopeType: "supplemental"
 */
export const convertSupplementalAccountToEnvelope = (
  account: SupplementalAccountRecord
): Envelope => {
  const accountId =
    typeof account.id === "string"
      ? account.id
      : `supplemental_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

  return {
    id: accountId,
    name: account.name || "Unnamed Account",
    category: account.type || "Supplemental",
    color: account.color || "blue",
    archived: false,
    lastModified: Date.now(),
    createdAt: Date.now(),
    currentBalance: account.balance ?? account.currentBalance ?? 0,
    type: "supplemental",
    annualContribution: account.annualContribution,
    expirationDate: account.expirationDate,
    isActive: account.isActive !== false,

    accountType: ((account.type as unknown as Record<string, string>)?.toString() ||
      "other") as SupplementalAccountType,
    description: account.description || "",
    autoAllocate: false,
  };
};

/**
 * Converts a SINKING_FUND envelope to a SAVINGS envelope
 * Preserves all existing data including targetDate
 */
export const convertSinkingFundToSavings = (envelope: Envelope): Envelope => {
  return {
    ...envelope,
    type: "goal",
    lastModified: Date.now(),
    // Ensure savings-specific fields are set

    isCompleted:
      (envelope as Record<string, unknown>).isCompleted === true ||
      (envelope.currentBalance !== undefined &&
        typeof (envelope as Record<string, unknown>).targetAmount === "number" &&
        envelope.currentBalance >= ((envelope as Record<string, unknown>).targetAmount as number)),

    isPaused: (envelope as Record<string, unknown>).isPaused === true,
    priority: ((envelope as Record<string, unknown>).priority as "medium") || "medium",
  } as Envelope;
};

/**
 * Checks if a migration is needed
 * Returns true if there are savings goals, supplemental accounts, or sinking fund envelopes
 */
export const isMigrationNeeded = async (): Promise<boolean> => {
  try {
    // Check for savings goals in separate table

    const savingsGoalsCount = await (budgetDb as unknown as LegacyDb).savingsGoals.count();
    if (savingsGoalsCount > 0) {
      return true;
    }

    // Check for SINKING_FUND envelopes
    const sinkingFundEnvelopes = await budgetDb.envelopes
      .toCollection()
      .filter((e: unknown) => {
        const record = e as Record<string, unknown>;
        return (
          record.type === ENVELOPE_TYPES.SINKING_FUND ||
          record.envelopeType === ENVELOPE_TYPES.SINKING_FUND
        );
      })
      .count();
    if (sinkingFundEnvelopes > 0) {
      return true;
    }

    // Check for supplemental accounts in budget metadata
    const metadata = await budgetDb.budget.get("metadata");
    if (metadata && Array.isArray(metadata.supplementalAccounts)) {
      const accounts = metadata.supplementalAccounts as SupplementalAccountRecord[];
      if (accounts.length > 0) {
        return true;
      }
    }

    return false;
  } catch (error) {
    logger.error("Error checking migration status:", error);
    return false;
  }
};

/**
 * Migrate savings goals from separate table to envelopes
 */
const migrateSavingsGoals = async (result: MigrationResult): Promise<void> => {
  try {
    const savingsGoals = await (budgetDb as unknown as LegacyDb).savingsGoals.toArray();

    for (const goal of savingsGoals) {
      try {
        // Check if an envelope with this ID already exists
        const goalId = String(goal.id);
        const existingEnvelope = await budgetDb.envelopes.get(goalId);
        if (existingEnvelope) {
          result.warnings.push(
            `Savings goal "${goal.name}" (${goal.id}) already has matching envelope - skipping`
          );
          continue;
        }

        // Convert and save as envelope
        const envelope = convertSavingsGoalToEnvelope(goal as unknown as SavingsGoal);
        await budgetDb.envelopes.put(envelope);
        result.migratedSavingsGoals++;

        logger.debug(`Migrated savings goal: ${goal.name} -> envelope`, { id: goal.id });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error during savings goal migration";
        result.errors.push(`Failed to migrate savings goal "${goal.name}": ${errorMessage}`);
      }
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error accessing savings goals";
    result.errors.push(`Failed to access savings goals table: ${errorMessage}`);
  }
};

/**
 * Migrate supplemental accounts from budget metadata to envelopes
 */
const migrateSupplementalAccounts = async (result: MigrationResult): Promise<void> => {
  try {
    const metadata = await budgetDb.budget.get("metadata");
    if (!metadata || !Array.isArray(metadata.supplementalAccounts)) {
      return;
    }

    const accounts = metadata.supplementalAccounts as SupplementalAccountRecord[];

    for (const account of accounts) {
      try {
        // Generate or use existing ID
        const accountId =
          typeof account.id === "string"
            ? account.id
            : `supplemental_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

        // Check if an envelope with this ID already exists
        const existingEnvelope = await budgetDb.envelopes.get(accountId);
        if (existingEnvelope) {
          result.warnings.push(
            `Supplemental account "${account.name}" (${accountId}) already has matching envelope - skipping`
          );
          continue;
        }

        // Convert and save as envelope
        const envelope = convertSupplementalAccountToEnvelope(account);
        await budgetDb.envelopes.put(envelope);
        result.migratedSupplementalAccounts++;

        logger.debug(`Migrated supplemental account: ${account.name} -> envelope`, {
          id: accountId,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unknown error during supplemental account migration";
        result.errors.push(
          `Failed to migrate supplemental account "${account.name}": ${errorMessage}`
        );
      }
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error accessing budget metadata";
    result.errors.push(`Failed to access supplemental accounts: ${errorMessage}`);
  }
};

/**
 * Migrate SINKING_FUND envelopes to SAVINGS type
 */
const migrateSinkingFunds = async (result: MigrationResult): Promise<void> => {
  try {
    const sinkingFundEnvelopes = await budgetDb.envelopes
      .toCollection()
      .filter((e: unknown) => {
        const record = e as Record<string, unknown>;
        return (
          record.type === ENVELOPE_TYPES.SINKING_FUND ||
          record.envelopeType === ENVELOPE_TYPES.SINKING_FUND
        );
      })
      .toArray();

    for (const envelope of sinkingFundEnvelopes) {
      try {
        const updatedEnvelope = convertSinkingFundToSavings(envelope);
        await budgetDb.envelopes.put(updatedEnvelope);
        result.migratedSinkingFunds++;

        logger.debug(`Migrated sinking fund: ${envelope.name} -> savings envelope`, {
          id: envelope.id,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error during sinking fund migration";
        result.errors.push(`Failed to migrate sinking fund "${envelope.name}": ${errorMessage}`);
      }
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error accessing sinking fund envelopes";
    result.errors.push(`Failed to access sinking fund envelopes: ${errorMessage}`);
  }
};

/**
 * Run the complete envelope migration
 * Converts savings goals, supplemental accounts, and sinking funds to envelope entities
 */
export const runEnvelopeMigration = async (): Promise<MigrationResult> => {
  const result: MigrationResult = {
    success: true,
    migratedSavingsGoals: 0,
    migratedSupplementalAccounts: 0,
    migratedSinkingFunds: 0,
    errors: [],
    warnings: [],
  };

  logger.info("Starting envelope migration (Issue #1335)...");

  try {
    // Run migrations in transaction if possible
    await budgetDb.transaction(
      "rw",
      [
        budgetDb.envelopes,
        (budgetDb as unknown as Record<string, Table>).savingsGoals,
        budgetDb.budget,
      ],
      async () => {
        // 1. Migrate savings goals to envelopes
        await migrateSavingsGoals(result);

        // 2. Migrate supplemental accounts to envelopes
        await migrateSupplementalAccounts(result);

        // 3. Convert SINKING_FUND envelopes to SAVINGS
        await migrateSinkingFunds(result);
      }
    );

    result.success = result.errors.length === 0;

    logger.info("Envelope migration completed", {
      success: result.success,
      migratedSavingsGoals: result.migratedSavingsGoals,
      migratedSupplementalAccounts: result.migratedSupplementalAccounts,
      migratedSinkingFunds: result.migratedSinkingFunds,
      errors: result.errors.length,
      warnings: result.warnings.length,
    });

    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error during envelope migration";
    result.errors.push(`Migration transaction failed: ${errorMessage}`);
    result.success = false;

    logger.error("Envelope migration failed", { error, result });

    return result;
  }
};

/**
 * Gets migration status summary
 */
export const getMigrationStatus = async (): Promise<{
  needsMigration: boolean;
  savingsGoalsCount: number;
  supplementalAccountsCount: number;
  sinkingFundsCount: number;
  savingsEnvelopesCount: number;
  supplementalEnvelopesCount: number;
}> => {
  try {
    const savingsGoalsCount = await (budgetDb as unknown as LegacyDb).savingsGoals.count();

    const metadata = await budgetDb.budget.get("metadata");
    const supplementalAccountsCount = Array.isArray(metadata?.supplementalAccounts)
      ? (metadata.supplementalAccounts as unknown[]).length
      : 0;

    const sinkingFundsCount = await budgetDb.envelopes
      .toCollection()
      .filter((e: unknown) => {
        const record = e as Record<string, unknown>;
        return (
          record.type === ENVELOPE_TYPES.SINKING_FUND ||
          record.envelopeType === ENVELOPE_TYPES.SINKING_FUND
        );
      })
      .count();

    const savingsEnvelopesCount = await budgetDb.envelopes.where("type").equals("goal").count();

    const supplementalEnvelopesCount = await budgetDb.envelopes
      .where("type")
      .equals("supplemental")
      .count();

    const needsMigration =
      savingsGoalsCount > 0 || supplementalAccountsCount > 0 || sinkingFundsCount > 0;

    return {
      needsMigration,
      savingsGoalsCount,
      supplementalAccountsCount,
      sinkingFundsCount,
      savingsEnvelopesCount,
      supplementalEnvelopesCount,
    };
  } catch (error) {
    logger.error("Error getting migration status:", error);
    return {
      needsMigration: false,
      savingsGoalsCount: 0,
      supplementalAccountsCount: 0,
      sinkingFundsCount: 0,
      savingsEnvelopesCount: 0,
      supplementalEnvelopesCount: 0,
    };
  }
};

export default {
  runEnvelopeMigration,
  isMigrationNeeded,
  getMigrationStatus,
  convertSavingsGoalToEnvelope,
  convertSupplementalAccountToEnvelope,
  convertSinkingFundToSavings,
};
