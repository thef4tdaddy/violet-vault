/**
 * Auto-populate functionality for connection manager
 * Extracted for better maintainability and ESLint compliance
 */
import useToast from "@/hooks/platform/ux/useToast";
import logger from "@/utils/common/logger";
import { Envelope, Bill } from "@/db/types";

interface AutoPopulateParams {
  entityType: string;
  entityId: string;
  billId: string | null;
  bills: Bill[];
  currentEntity: Envelope;
  updateEnvelope: (id: string, updates: Partial<Envelope>) => Promise<void>;
}

export const useAutoPopulate = () => {
  const { addToast } = useToast();

  const handleAutoPopulate = async ({
    entityType,
    entityId,
    billId,
    bills,
    currentEntity,
    updateEnvelope,
  }: AutoPopulateParams) => {
    if (entityType !== "envelope" || !billId) return;

    const targetBill = bills.find((b) => b.id === billId);
    if (!targetBill || !currentEntity) return;

    logger.debug("📝 Auto-populating envelope from bill", {
      envelopeId: entityId,
      billId,
      billName: targetBill.name,
    });

    try {
      const updates: Partial<Envelope> = {};

      // Only update empty fields
      if (!currentEntity.name && targetBill.name) {
        updates.name = targetBill.name;
      }

      if (!currentEntity.category && targetBill.category) {
        updates.category = targetBill.category;
      }

      if (Object.keys(updates).length > 0) {
        await updateEnvelope(entityId, updates);

        addToast({
          type: "success",
          title: "Details Auto-filled",
          message: `Envelope details populated from ${targetBill.name}`,
          duration: 3000,
        });

        logger.debug("✅ Envelope auto-populated", {
          envelopeId: entityId,
          updates,
        });
      }
    } catch (error) {
      logger.error("❌ Failed to auto-populate envelope", error, {
        envelopeId: entityId,
        billId,
      });
    }
  };

  return {
    handleAutoPopulate,
  };
};
