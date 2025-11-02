import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, optimisticHelpers } from "@/utils/common/queryClient";
import { budgetDb } from "@/db/budgetDb";
import logger from "@/utils/common/logger";

interface UpdateEnvelopeData {
  id: string;
  updates: Record<string, unknown>;
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
      const safeUpdates = {
        ...updates,
        name: updates.name !== undefined ? updates.name : existingEnvelope.name,
        category: updates.category !== undefined ? updates.category : existingEnvelope.category,
      };

      // Create properly typed update object for Dexie
      const dbUpdates: Partial<
        Pick<typeof existingEnvelope, "name" | "category" | "lastModified">
      > &
        Record<string, unknown> = {
        name: safeUpdates.name as string,
        category: safeUpdates.category as string,
        lastModified: Date.now(),
      };

      // Log envelope updates for debugging corruption issues
      logger.info("Updating envelope", {
        envelopeId: id,
        existingName: existingEnvelope.name,
        newName: safeUpdates.name,
        updates: Object.keys(updates),
        source: "updateEnvelopeMutation",
      });

      // Apply optimistic update with validated data
      await optimisticHelpers.updateEnvelope(queryClient, id, safeUpdates);

      // Apply to Dexie directly with safe updates
      await budgetDb.envelopes.update(id, dbUpdates);

      return { id, updates };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });

      // Log successful envelope update (already logged in mutationFn, so just log confirmation)
      logger.info("✅ Envelope update completed", {
        envelopeId: data.id,
      });

      triggerEnvelopeSync("updated");
    },
    onError: (error) => {
      logger.error("Failed to update envelope:", error);
    },
  });
};
