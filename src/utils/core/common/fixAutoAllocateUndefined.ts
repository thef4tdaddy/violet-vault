import { budgetDb } from "../../db/budgetDb";
import logger from "../common/logger";

type EnvelopeWithAutoAllocate = {
  id: string | number;
  name: string;
  autoAllocate?: boolean;
  [key: string]: unknown;
};

/**
 * Fix auto-allocate undefined values in envelopes
 * Issue: 20 envelopes have autoAllocate: undefined instead of boolean values
 * This causes filtering to fail since undefined !== true
 */
export async function fixAutoAllocateUndefined() {
  try {
    logger.info("🔧 Starting auto-allocate undefined value fix...");

    // Get all envelopes
    const allEnvelopes =
      (await budgetDb.envelopes.toArray()) as unknown as EnvelopeWithAutoAllocate[];
    logger.info(`Found ${allEnvelopes.length} envelopes to check`);

    // Find envelopes with undefined autoAllocate
    const undefinedEnvelopes = allEnvelopes.filter((env) => env.autoAllocate === undefined);
    logger.info(`Found ${undefinedEnvelopes.length} envelopes with autoAllocate: undefined`);

    if (undefinedEnvelopes.length === 0) {
      logger.info("✅ No undefined autoAllocate values found");
      return { success: true, fixed: 0 };
    }

    // Fix each envelope by setting autoAllocate to false (safer default)
    let fixedCount = 0;
    for (const envelope of undefinedEnvelopes) {
      await budgetDb.envelopes.update(String(envelope.id), {
        autoAllocate: false,
      } as never);
      fixedCount++;
      logger.debug(`Fixed envelope "${envelope.name}" - set autoAllocate to false`);
    }

    logger.info(`✅ Fixed ${fixedCount} envelopes with undefined autoAllocate values`);

    // Verify the fix
    const verification =
      (await budgetDb.envelopes.toArray()) as unknown as EnvelopeWithAutoAllocate[];
    const stillUndefined = verification.filter((env) => env.autoAllocate === undefined);

    if (stillUndefined.length > 0) {
      logger.error(
        `❌ Fix verification failed: ${stillUndefined.length} envelopes still have undefined autoAllocate`
      );
      return {
        success: false,
        fixed: fixedCount,
        remaining: stillUndefined.length,
      };
    }

    logger.info("🎉 Auto-allocate fix completed successfully!");
    return { success: true, fixed: fixedCount };
  } catch (error) {
    logger.error("❌ Auto-allocate fix failed:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Make it available globally for console debugging
if (typeof window !== "undefined") {
  window.fixAutoAllocateUndefined = fixAutoAllocateUndefined;
}
