import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, optimisticHelpers } from "@/utils/common/queryClient";
import { budgetDb } from "@/db/budgetDb";
import { AUTO_CLASSIFY_ENVELOPE_TYPE } from "@/constants/categories";
import logger from "@/utils/common/logger";

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

      // Optimistic update
      await optimisticHelpers.addEnvelope(queryClient, newEnvelope);

      // Use put() instead of add() to handle duplicates gracefully
      await budgetDb.envelopes.put(newEnvelope);

      return newEnvelope;
    },
    onSuccess: (envelope) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      
      // Log successful envelope addition
      logger.info("✅ Envelope added", {
        name: envelope.name,
        category: envelope.category,
        envelopeType: envelope.envelopeType,
        targetAmount: envelope.targetAmount,
      });
      
      triggerEnvelopeSync("added");
    },
    onError: (error) => {
      logger.error("Failed to add envelope:", error);
    },
  });
};
