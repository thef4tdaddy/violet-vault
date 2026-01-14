import { budgetDb } from "@/db/budgetDb";
import logger from "@/utils/core/common/logger";

type EnvelopeWithOptionalFields = {
  id: string | number;
  name?: string;
  category?: string;
  monthlyAmount?: number;
  currentBalance?: number;
  createdAt?: string;
  [key: string]: unknown;
};

/**
 * Utility for detecting and handling corrupted/empty envelopes
 * Addresses GitHub issue #539 - empty envelopes with no details
 */

/**
 * Check if an envelope is considered "empty" or corrupted
 * @param {Object} envelope - The envelope to check
 * @returns {boolean} - True if envelope is empty/corrupted
 */
export const isEmptyEnvelope = (envelope: EnvelopeWithOptionalFields) => {
  if (!envelope) return true;

  // Critical fields that should be present
  const hasName = envelope.name && envelope.name.trim().length > 0;
  const hasCategory = envelope.category && envelope.category.trim().length > 0;

  // Additional checks for completely empty envelopes
  const hasAmount = envelope.monthlyAmount != null || envelope.currentBalance != null;
  const hasAnyContent = hasName || hasCategory || hasAmount;

  return !hasAnyContent || (!hasName && !hasCategory);
};

/**
 * Get all corrupted/empty envelopes from the database
 * @returns {Promise<Array>} - Array of corrupted envelopes
 */
export const findCorruptedEnvelopes = async () => {
  try {
    logger.debug("🔍 Scanning for corrupted envelopes...");

    const allEnvelopes =
      (await budgetDb.envelopes.toArray()) as unknown as EnvelopeWithOptionalFields[];
    const corruptedEnvelopes = allEnvelopes.filter(isEmptyEnvelope);

    if (corruptedEnvelopes.length > 0) {
      logger.warn("Found corrupted envelopes", {
        count: corruptedEnvelopes.length,
        envelopes: corruptedEnvelopes.map((env) => ({
          id: env.id,
          name: env.name || "[EMPTY]",
          category: env.category || "[EMPTY]",
          monthlyAmount: env.monthlyAmount,
          currentBalance: env.currentBalance,
          createdAt: env.createdAt,
        })),
      });
    } else {
      logger.debug("✅ No corrupted envelopes found");
    }

    return corruptedEnvelopes;
  } catch (error) {
    logger.error("❌ Failed to scan for corrupted envelopes", error);
    return [];
  }
};

/**
 * Remove corrupted envelopes from the database
 * @param {Array} envelopeIds - Array of envelope IDs to remove
 * @returns {Promise<Object>} - Result with success status and details
 */
export const removeCorruptedEnvelopes = async (envelopeIds: Array<string | number>) => {
  if (!envelopeIds || envelopeIds.length === 0) {
    return { success: true, removed: 0, message: "No envelopes to remove" };
  }

  try {
    logger.debug("🗑️ Removing corrupted envelopes", { ids: envelopeIds });

    // Get envelope details before deletion for logging
    const envelopesToDelete = await budgetDb.envelopes.where("id").anyOf(envelopeIds).toArray();

    // Delete the envelopes
    const deletedCount = await budgetDb.envelopes.where("id").anyOf(envelopeIds).delete();

    logger.production("Removed corrupted envelopes", {
      count: deletedCount,
      envelopes: envelopesToDelete.map((env) => ({
        id: env.id,
        name: env.name || "[EMPTY]",
        category: env.category || "[EMPTY]",
      })),
      issue: "GitHub #539 - envelope integrity cleanup",
    });

    // Trigger cloud sync for the deletions
    if (typeof window !== "undefined" && window.cloudSyncService) {
      window.cloudSyncService.triggerSyncForCriticalChange("envelope_integrity_cleanup");
    }

    return {
      success: true,
      removed: deletedCount,
      message: `Successfully removed ${deletedCount} corrupted envelope${deletedCount === 1 ? "" : "s"}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("❌ Failed to remove corrupted envelopes", error, {
      ids: envelopeIds,
    });
    return {
      success: false,
      removed: 0,
      error: errorMessage,
      message: "Failed to remove corrupted envelopes",
    };
  }
};

/**
 * Attempt to repair corrupted envelopes by filling in missing required fields
 * @param {Array} corruptedEnvelopes - Array of corrupted envelope objects
 * @returns {Promise<Object>} - Result with success status and details
 */
export const repairCorruptedEnvelopes = async (
  corruptedEnvelopes: EnvelopeWithOptionalFields[]
) => {
  if (!corruptedEnvelopes || corruptedEnvelopes.length === 0) {
    return { success: true, repaired: 0, message: "No envelopes to repair" };
  }

  try {
    logger.debug("🔧 Attempting to repair corrupted envelopes", {
      count: corruptedEnvelopes.length,
    });

    const repairedEnvelopes: EnvelopeWithOptionalFields[] = [];

    for (const envelope of corruptedEnvelopes) {
      const repaired = { ...envelope };
      let wasRepaired = false;

      // Fill in missing name
      if (!repaired.name || repaired.name.trim().length === 0) {
        const idStr = String(repaired.id);
        repaired.name = `Recovered Envelope ${idStr.slice(0, 8) || "Unknown"}`;
        wasRepaired = true;
      }

      // Fill in missing category
      if (!repaired.category || repaired.category.trim().length === 0) {
        repaired.category = "Other";
        wasRepaired = true;
      }

      // Set default values for other missing fields
      if (repaired.monthlyAmount == null) {
        repaired.monthlyAmount = 0;
        wasRepaired = true;
      }

      if (repaired.currentBalance == null) {
        repaired.currentBalance = 0;
        wasRepaired = true;
      }

      if (!repaired.color) {
        repaired.color = "#6B7280"; // Default gray
        wasRepaired = true;
      }

      if (!repaired.createdAt) {
        repaired.createdAt = new Date().toISOString();
        wasRepaired = true;
      }

      repaired.lastUpdated = new Date().toISOString();

      if (wasRepaired) {
        repairedEnvelopes.push(repaired);
      }
    }

    // Update the repaired envelopes in the database
    if (repairedEnvelopes.length > 0) {
      // Cast to the database type since we've ensured all required fields are present
      await budgetDb.envelopes.bulkPut(
        repairedEnvelopes as unknown as import("@/db/types").Envelope[]
      );

      logger.production("Repaired corrupted envelopes", {
        count: repairedEnvelopes.length,
        envelopes: repairedEnvelopes.map((env) => ({
          id: env.id,
          name: env.name,
          category: env.category,
        })),
        issue: "GitHub #539 - envelope integrity repair",
      });

      // Trigger cloud sync
      if (typeof window !== "undefined" && window.cloudSyncService) {
        window.cloudSyncService.triggerSyncForCriticalChange("envelope_integrity_repair");
      }
    }

    return {
      success: true,
      repaired: repairedEnvelopes.length,
      message: `Successfully repaired ${repairedEnvelopes.length} corrupted envelope${repairedEnvelopes.length === 1 ? "" : "s"}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("❌ Failed to repair corrupted envelopes", error);
    return {
      success: false,
      repaired: 0,
      error: errorMessage,
      message: "Failed to repair corrupted envelopes",
    };
  }
};

/**
 * Get detailed integrity report for all envelopes
 * @returns {Promise<Object>} - Comprehensive integrity report
 */
export const getEnvelopeIntegrityReport = async () => {
  try {
    logger.debug("📊 Generating envelope integrity report...");

    const allEnvelopes =
      (await budgetDb.envelopes.toArray()) as unknown as EnvelopeWithOptionalFields[];
    const corruptedEnvelopes = allEnvelopes.filter(isEmptyEnvelope);

    const report = {
      total: allEnvelopes.length,
      corrupted: corruptedEnvelopes.length,
      healthy: allEnvelopes.length - corruptedEnvelopes.length,
      corruptedEnvelopes: corruptedEnvelopes.map((env) => ({
        id: String(env.id),
        name: env.name || "[MISSING NAME]",
        category: env.category || "[MISSING CATEGORY]",
        monthlyAmount: env.monthlyAmount,
        currentBalance: env.currentBalance,
        createdAt: env.createdAt,
        issues: [
          !env.name ? "Missing name" : null,
          !env.category ? "Missing category" : null,
          env.monthlyAmount == null ? "Missing monthly amount" : null,
          env.currentBalance == null ? "Missing current balance" : null,
        ].filter(Boolean) as string[],
      })),
      recommendations:
        corruptedEnvelopes.length > 0
          ? [
              "Remove completely empty envelopes with no recoverable data",
              "Repair envelopes with missing names/categories but valid amounts",
              "Review envelope creation process to prevent future corruption",
            ]
          : ["All envelopes appear healthy"],
    };

    logger.debug("📊 Envelope integrity report generated", {
      total: report.total,
      corrupted: report.corrupted,
      healthy: report.healthy,
    });

    return report;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("❌ Failed to generate envelope integrity report", error);
    return {
      total: 0,
      corrupted: 0,
      healthy: 0,
      corruptedEnvelopes: [],
      recommendations: ["Failed to generate report"],
      error: errorMessage,
    };
  }
};
