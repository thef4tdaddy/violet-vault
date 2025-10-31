import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, optimisticHelpers } from "@/utils/common/queryClient";
import { budgetDb } from "@/db/budgetDb";
import logger from "@/utils/common/logger";

interface DeleteEnvelopeData {
  envelopeId: string;
  deleteBillsToo?: boolean;
}

// Helper to trigger sync for envelope changes
const triggerEnvelopeSync = (changeType: string) => {
  if (typeof window !== "undefined" && window.cloudSyncService) {
    window.cloudSyncService.triggerSyncForCriticalChange(`envelope_${changeType}`);
  }
};

export const useDeleteEnvelope = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["envelopes", "delete"],
    mutationFn: async ({ envelopeId, deleteBillsToo = false }: DeleteEnvelopeData) => {
      // Get the envelope to check if it has money
      const envelope = await budgetDb.envelopes.get(envelopeId);

      if (envelope && envelope.currentBalance > 0) {
        // Transfer the money to unassigned cash before deletion
        const { getUnassignedCash, setUnassignedCash } = await import("../../../db/budgetDb");
        const currentUnassignedCash = await getUnassignedCash();
        const newUnassignedCash = currentUnassignedCash + envelope.currentBalance;

        await setUnassignedCash(newUnassignedCash);

        logger.info(
          `Transferred $${envelope.currentBalance.toFixed(2)} from deleted envelope "${envelope.name}" to unassigned cash`
        );
      }

      // Handle connected bills if requested
      if (deleteBillsToo) {
        logger.info(`Deleting envelope ${envelopeId} and connected bills`);

        // Get all bills connected to this envelope
        const connectedBills = await budgetDb.bills
          .where("envelopeId")
          .equals(envelopeId)
          .toArray();

        if (connectedBills.length > 0) {
          logger.info(`Found ${connectedBills.length} connected bills to delete`);

          // Delete each connected bill
          for (const bill of connectedBills) {
            await budgetDb.bills.delete(bill.id);
            // Note: removeBill optimistic helper doesn't exist, bills are handled separately
          }
        }
      } else {
        // Disconnect bills but don't delete them
        const connectedBills = await budgetDb.bills
          .where("envelopeId")
          .equals(envelopeId)
          .toArray();

        if (connectedBills.length > 0) {
          logger.info(`Disconnecting ${connectedBills.length} bills from envelope ${envelopeId}`);

          // Remove envelope connection from bills
          for (const bill of connectedBills) {
            await budgetDb.bills.update(bill.id, { envelopeId: null });
            await optimisticHelpers.updateBill(queryClient, bill.id, { envelopeId: null });
          }
        }
      }

      // Apply optimistic update
      await optimisticHelpers.removeEnvelope(queryClient, envelopeId);

      // Apply to Dexie directly
      await budgetDb.envelopes.delete(envelopeId);

      return {
        envelopeId,
        deleteBillsToo,
        transferredAmount: envelope?.currentBalance || 0,
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
      
      // Log successful envelope deletion
      logger.info("✅ Envelope deleted", {
        envelopeName: data.envelopeName,
        balanceTransferredToUnassigned: data.transferredAmount,
        billsDeleted: data.deleteBillsToo,
      });
      
      triggerEnvelopeSync("deleted");
    },
    onError: (error) => {
      logger.error("Failed to delete envelope:", error);
    },
  });
};
