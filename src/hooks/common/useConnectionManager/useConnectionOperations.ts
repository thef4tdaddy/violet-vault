/**
 * Connection operations logic for useConnectionManager
 * Extracted for better maintainability and ESLint compliance
 */
import useToast from "../useToast";
import logger from "../../../utils/common/logger";
import { Envelope, Bill, Debt } from "../../../db/types";

const connectBill = async (entityId, targetId, envelopes, updateBill, addToast) => {
  const targetEnvelope = envelopes.find((e) => e.id === targetId);
  if (!targetEnvelope) throw new Error("Target envelope not found");

  await updateBill(entityId, { envelopeId: targetId });

  addToast({
    type: "success",
    title: "Connection Created",
    message: `Bill connected to ${targetEnvelope.name}`,
    duration: 3000,
  });
};

const connectEnvelope = async (entityId, targetId, bills, updateBill, addToast) => {
  const targetBill = bills.find((b) => b.id === targetId);
  if (!targetBill) throw new Error("Target bill not found");

  await updateBill(targetId, { envelopeId: entityId });

  addToast({
    type: "success",
    title: "Connection Created",
    message: `Connected to ${targetBill.provider}`,
    duration: 3000,
  });
};

const connectDebt = async (entityId, targetId, envelopes, updateDebt, addToast) => {
  const targetEnvelopeForDebt = envelopes.find((e) => e.id === targetId);
  if (!targetEnvelopeForDebt) throw new Error("Target envelope not found");

  await updateDebt({ id: entityId, updates: { envelopeId: targetId } });

  addToast({
    type: "success",
    title: "Connection Created",
    message: `Debt connected to ${targetEnvelopeForDebt.name}`,
    duration: 3000,
  });
};

interface ConnectParams {
  entityType: "bill" | "envelope" | "debt";
  entityId: string;
  targetId: string;
  currentEntity: Envelope | Bill | Debt;
  envelopes: Envelope[];
  bills: Bill[];
  debts?: Debt[];
  updateBill: (id: string, updates: Partial<Bill>) => Promise<void>;
  updateDebt: (params: { id: string; updates: Partial<Debt> }) => Promise<void>;
}

interface DisconnectParams {
  entityType: string;
  entityId: string;
  currentConnections: Bill[];
  updateBill: (id: string, updates: Partial<Bill>) => Promise<void>;
  updateDebt: (params: { id: string; updates: Partial<Debt> }) => Promise<void>;
}

export const useConnectionOperations = () => {
  const { addToast } = useToast();

  const handleConnect = async ({
    entityType,
    entityId,
    targetId,
    currentEntity,
    envelopes,
    bills,
    updateBill,
    updateDebt,
  }: ConnectParams) => {
    if (!targetId || !currentEntity) return { success: false };

    logger.debug("🔗 Creating connection", {
      entityType,
      entityId,
      targetId,
      currentEntity:
        (currentEntity as { name?: string; provider?: string }).name ||
        (currentEntity as { provider?: string }).provider,
    });

    try {
      switch (entityType) {
        case "bill":
          await connectBill(entityId, targetId, envelopes, updateBill, addToast);
          break;
        case "envelope":
          await connectEnvelope(entityId, targetId, bills, updateBill, addToast);
          break;
        case "debt":
          await connectDebt(entityId, targetId, envelopes, updateDebt, addToast);
          break;
        default:
          throw new Error(`Unknown entity type: ${entityType}`);
      }

      logger.debug("✅ Connection created successfully", {
        entityType,
        entityId,
        targetId,
      });
      return { success: true };
    } catch (error) {
      logger.error("❌ Failed to create connection", error, {
        entityType,
        entityId,
        targetId,
      });
      addToast({
        type: "error",
        title: "Connection Failed",
        message: error.message || "Failed to create connection",
        duration: 5000,
      });
      return { success: false, error: error.message };
    }
  };

  const handleDisconnect = async ({
    entityType,
    entityId,
    currentConnections,
    updateBill,
    updateDebt,
  }: DisconnectParams) => {
    if (currentConnections.length === 0) return { success: false };

    logger.debug("🔗 Removing connection", {
      entityType,
      entityId,
      currentConnections: currentConnections.map((c) => c.id),
    });

    try {
      switch (entityType) {
        case "bill":
          await updateBill(entityId, { envelopeId: null });

          addToast({
            type: "info",
            title: "Connection Removed",
            message: "Bill disconnected from envelope",
            duration: 3000,
          });
          break;

        case "envelope": {
          const connectedBillIds = currentConnections.map((c) => c.id);
          await Promise.all(
            connectedBillIds.map((billId) => updateBill(billId, { envelopeId: null }))
          );

          addToast({
            type: "info",
            title: "Connection Removed",
            message: `Disconnected ${connectedBillIds.length} bill(s)`,
            duration: 3000,
          });
          break;
        }

        case "debt":
          await updateDebt({ id: entityId, updates: { envelopeId: null } });

          addToast({
            type: "info",
            title: "Connection Removed",
            message: "Debt disconnected from envelope",
            duration: 3000,
          });
          break;

        default:
          throw new Error(`Unknown entity type: ${entityType}`);
      }

      logger.debug("✅ Connection removed successfully", {
        entityType,
        entityId,
      });
      return { success: true };
    } catch (error) {
      logger.error("❌ Failed to remove connection", error, {
        entityType,
        entityId,
      });
      addToast({
        type: "error",
        title: "Disconnection Failed",
        message: error.message || "Failed to remove connection",
        duration: 5000,
      });
      return { success: false, error: error.message };
    }
  };

  return {
    handleConnect,
    handleDisconnect,
  };
};
