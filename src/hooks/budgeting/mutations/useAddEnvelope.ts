import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, optimisticHelpers } from "@/utils/common/queryClient";
import { budgetDb } from "@/db/budgetDb";
import { AUTO_CLASSIFY_ENVELOPE_TYPE } from "@/constants/categories";
import logger from "@/utils/common/logger";
import { validateEnvelopeSafe } from "@/domain/schemas/envelope";
import type { Envelope } from "@/db/types";

interface AddEnvelopeData {
  name: string;
  category?: string;
  targetAmount?: number;
  description?: string;
  envelopeType?: string;
}

// Extend Window interface for cloudSyncService
declare global {
  interface Window {
    cloudSyncService?: {
      triggerSyncForCriticalChange: (changeType: string) => void;
    };
  }
}

// Helper to trigger sync for envelope changes
const triggerEnvelopeSync = (changeType: string) => {
  if (typeof window !== "undefined" && window.cloudSyncService) {
    window.cloudSyncService.triggerSyncForCriticalChange(`envelope_${changeType}`);
  }
};

export const useAddEnvelope = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["envelopes", "add"],
    mutationFn: async (envelopeData: AddEnvelopeData) => {
      const newEnvelope = {
        id: Date.now().toString(),
        currentBalance: 0,
        targetAmount: 0,
        category: "expenses",
        archived: false,
        createdAt: Date.now(),
        lastModified: Date.now(),
        ...envelopeData,
        envelopeType:
          envelopeData.envelopeType ||
          AUTO_CLASSIFY_ENVELOPE_TYPE(envelopeData.category || "expenses"),
      };

      // Validate with Zod schema before saving
      const validationResult = validateEnvelopeSafe(newEnvelope);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.issues
          .map((issue) => issue.message)
          .join(", ");
        logger.error("Envelope validation failed", { errors: validationResult.error.issues });
        throw new Error(`Invalid envelope data: ${errorMessages}`);
      }

      // Create properly typed update object for Dexie
      const dbUpdates = sanitizeEnvelopeForDb(validationResult.data);

      // Optimistic update
      await optimisticHelpers.addEnvelope(queryClient, dbUpdates as Envelope);

      await budgetDb.envelopes.put(dbUpdates as Envelope); // Cast to Envelope as put expects a full object

      return validationResult.data;
    },
    onSuccess: (envelope) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });

      // Log successful envelope addition
      logger.info("✅ Envelope added", {
        name: envelope.name,
        id: envelope.id,
      });

      triggerEnvelopeSync("created");
    },
    onError: (error) => {
      logger.error("Failed to add envelope:", error);
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
