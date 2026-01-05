import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, optimisticHelpers } from "@/utils/common/queryClient";
import { budgetDb } from "@/db/budgetDb";
import logger from "@/utils/common/logger";
import type { Envelope } from "@/db/types";
import { validateEnvelopePartialSafe } from "@/domain/schemas/envelope";

interface UpdateEnvelopeData {
  id: string;
  updates: Partial<Envelope>;
}

// Helper to trigger sync for envelope changes
const triggerEnvelopeSync = (changeType: string) => {
  if (typeof window !== "undefined" && window.cloudSyncService) {
    window.cloudSyncService.triggerSyncForCriticalChange(`envelope_${changeType}`);
  }
};

export const useUpdateEnvelope = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["envelopes", "update"],
    mutationFn: async ({ id, updates }: UpdateEnvelopeData) => {
      // Validate envelope data before update to prevent corruption
      const existingEnvelope = await budgetDb.envelopes.get(id);
      if (!existingEnvelope) {
        throw new Error(`Envelope ${id} not found`);
      }

      // Ensure critical fields aren't accidentally cleared
      const safeName =
        typeof updates.name === "string" && updates.name.trim().length > 0
          ? updates.name
          : existingEnvelope.name;
      const safeCategory =
        typeof updates.category === "string" && updates.category.trim().length > 0
          ? updates.category
          : existingEnvelope.category;

      const safeUpdates: Partial<Envelope> = {
        ...updates,
        name: safeName,
        category: safeCategory,
      };

      // Validate updates with Zod schema
      const validationResult = validateEnvelopePartialSafe(safeUpdates);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.issues
          .map((issue) => issue.message)
          .join(", ");
        logger.error("Envelope update validation failed", {
          envelopeId: id,
          errors: validationResult.error.issues,
        });
        throw new Error(`Invalid envelope update data: ${errorMessages}`);
      }

      // Log envelope updates for debugging corruption issues
      logger.info("Updating envelope", {
        envelopeId: id,
        existingName: existingEnvelope.name,
        newName: safeUpdates.name,
        updates: Object.keys(updates),
        source: "updateEnvelopeMutation",
      });

      // Create properly typed update object for Dexie
      const dbUpdates = sanitizeEnvelopeForDb(validationResult.data);

      // Apply optimistic update with validated data
      await optimisticHelpers.updateEnvelope(queryClient, id, dbUpdates);

      // Apply to Dexie directly with safe updates
      await budgetDb.envelopes.update(id, dbUpdates);

      // Log successful envelope update (already logged in mutationFn, so just log confirmation)
      logger.info("✅ Envelope update completed", {
        envelopeId: id,
      });

      triggerEnvelopeSync("updated");

      return { id, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.budget });
    },
    onError: (error) => {
      logger.error("Failed to update envelope:", error);
    },
  });
};

/**
 * Helper to ensure Zod-validated envelope data strictly matches Dexie Envelope type.
 * Converts explicit `null`s (allowed by Zod) to `undefined` (required by optional DB fields).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sanitizeEnvelopeForDb = (data: any): Partial<Envelope> => ({
  ...data,
  billId: data.billId ?? undefined,
  debtId: data.debtId ?? undefined,
  priority: data.priority ?? undefined,
  isPaused: typeof data.isPaused === "boolean" ? data.isPaused : undefined,
  targetAmount: data.targetAmount === null ? undefined : data.targetAmount,
  envelopeType: data.envelopeType ?? undefined,
  currentBalance: data.currentBalance ?? 0,
  description: data.description ?? undefined,
  autoAllocate: typeof data.autoAllocate === "boolean" ? data.autoAllocate : undefined,
  monthlyBudget: data.monthlyBudget ?? 0,
  biweeklyAllocation: data.biweeklyAllocation ?? 0,
  lastModified: Date.now(),
});
