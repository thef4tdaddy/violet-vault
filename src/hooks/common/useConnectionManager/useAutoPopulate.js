/**
 * Auto-populate functionality for connection manager
 * Extracted for better maintainability and ESLint compliance
 */
import useToast from "../useToast";
import logger from "../../../utils/common/logger";

export const useAutoPopulate = () => {
  const { addToast } = useToast();

  const handleAutoPopulate = async (entityType, entityId, billId, bills, currentEntity, updateEnvelope) => {
    if (entityType !== "envelope" || !billId) return;

    const targetBill = bills.find((b) => b.id === billId);
    if (!targetBill || !currentEntity) return;

    logger.debug("📝 Auto-populating envelope from bill", {
      envelopeId: entityId,
      billId,
      billProvider: targetBill.provider,
    });

    try {
      const updates = {};

      // Only update empty fields
      if (!currentEntity.name && targetBill.provider) {
        updates.name = targetBill.provider;
      }

      if (!currentEntity.amount && targetBill.amount) {
        updates.amount = targetBill.amount;
      }

      if (!currentEntity.frequency && targetBill.frequency) {
        updates.frequency = targetBill.frequency;
      }

      if (!currentEntity.category && targetBill.category) {
        updates.category = targetBill.category;
      }

      if (Object.keys(updates).length > 0) {
        await updateEnvelope(entityId, updates);

        addToast({
          type: "success",
          title: "Details Auto-filled",
          message: `Envelope details populated from ${targetBill.provider}`,
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