/**
 * Connection operations logic for useConnectionManager
 * Extracted for better maintainability and ESLint compliance
 */
import useToast from "@/hooks/platform/ux/useToast";
import logger from "@/utils/core/common/logger";
import type { Envelope, Bill, Debt } from "@/db/types";

// Type for toast function
type ToastFunction = (options: {
  type: "success" | "error" | "info";
  title: string;
  message: string;
  duration: number;
}) => void;

// Type for update functions
type UpdateBillFunction = (id: string, updates: Partial<Bill>) => Promise<void>;
type UpdateDebtFunction = (params: { id: string; updates: Partial<Debt> }) => Promise<void>;

// Type for operation result
type OperationResult = { success: true } | { success: false; error?: string };

const connectBill = async (
  entityId: string,
  targetId: string,
  envelopes: Envelope[],
  updateBill: UpdateBillFunction,
  addToast: ToastFunction
): Promise<void> => {
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

const connectEnvelope = async (
  entityId: string,
  targetId: string,
  bills: Bill[],
  updateBill: UpdateBillFunction,
  addToast: ToastFunction
): Promise<void> => {
  const targetBill = bills.find((b) => b.id === targetId);
  if (!targetBill) throw new Error("Target bill not found");

  await updateBill(targetId, { envelopeId: entityId });

  addToast({
    type: "success",
    title: "Connection Created",
    message: `Connected to ${targetBill.name}`,
    duration: 3000,
  });
};

const connectDebt = async (
  entityId: string,
  targetId: string,
  envelopes: Envelope[],
  updateDebt: UpdateDebtFunction,
  addToast: ToastFunction
): Promise<void> => {
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
  updateBill: UpdateBillFunction;
  updateDebt: UpdateDebtFunction;
}

interface DisconnectParams {
  entityType: "bill" | "envelope" | "debt";
  entityId: string;
  currentConnections: Bill[];
  updateBill: UpdateBillFunction;
  updateDebt: UpdateDebtFunction;
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
  }: ConnectParams): Promise<OperationResult> => {
    if (!targetId || !currentEntity) return { success: false };

    logger.debug("🔗 Creating connection", {
      entityType,
      entityId,
      targetId,
      currentEntity:
        (currentEntity as { name?: string }).name || (currentEntity as { name?: string }).name,
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
      const errorMessage = error instanceof Error ? error.message : "Failed to create connection";
      logger.error("❌ Failed to create connection", error, {
        entityType,
        entityId,
        targetId,
      });
      addToast({
        type: "error",
        title: "Connection Failed",
        message: errorMessage,
        duration: 5000,
      });
      return { success: false, error: errorMessage };
    }
  };

  const handleDisconnect = async ({
    entityType,
    entityId,
    currentConnections,
    updateBill,
    updateDebt,
  }: DisconnectParams): Promise<OperationResult> => {
    if (currentConnections.length === 0) return { success: false };

    logger.debug("🔗 Removing connection", {
      entityType,
      entityId,
      currentConnections: currentConnections.map((c) => c.id),
    });

    try {
      switch (entityType) {
        case "bill":
          await updateBill(entityId, { envelopeId: undefined });

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
            connectedBillIds.map((billId) => updateBill(billId, { envelopeId: undefined }))
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
          await updateDebt({ id: entityId, updates: { envelopeId: undefined } });

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
      const errorMessage = error instanceof Error ? error.message : "Failed to remove connection";
      logger.error("❌ Failed to remove connection", error, {
        entityType,
        entityId,
      });
      addToast({
        type: "error",
        title: "Disconnection Failed",
        message: errorMessage,
        duration: 5000,
      });
      return { success: false, error: errorMessage };
    }
  };

  return {
    handleConnect,
    handleDisconnect,
  };
};
