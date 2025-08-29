import { useState, useEffect, useMemo } from "react";
import useBills from "../bills/useBills";
import useEnvelopes from "../budgeting/useEnvelopes";
import useDebts from "../debts/useDebts";
import useToast from "./useToast";
import logger from "../../utils/common/logger";

/**
 * Smart connection manager hook that handles relationships between bills, envelopes, and debts
 * Context-aware: Envelopes get Bills, Bills and Debts get Envelopes
 */
const useConnectionManager = (entityType, entityId) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState("");

  const { addToast } = useToast();
  const { bills, updateBill } = useBills();
  const { envelopes, updateEnvelope } = useEnvelopes();
  const { debts, updateDebt } = useDebts();

  // Get the current entity
  const currentEntity = useMemo(() => {
    switch (entityType) {
      case "bill":
        return bills.find((b) => b.id === entityId);
      case "envelope":
        return envelopes.find((e) => e.id === entityId);
      case "debt":
        return debts.find((d) => d.id === entityId);
      default:
        return null;
    }
  }, [entityType, entityId, bills, envelopes, debts]);

  // Get current connections based on entity type
  const currentConnections = useMemo(() => {
    if (!currentEntity) return [];

    switch (entityType) {
      case "bill":
        // Bills connect to envelopes
        return currentEntity.envelopeId
          ? envelopes.filter((e) => e.id === currentEntity.envelopeId)
          : [];

      case "envelope":
        // Envelopes connect to bills
        return bills.filter((b) => b.envelopeId === entityId);

      case "debt":
        // Debts connect to envelopes
        return currentEntity.envelopeId
          ? envelopes.filter((e) => e.id === currentEntity.envelopeId)
          : [];

      default:
        return [];
    }
  }, [entityType, entityId, currentEntity, bills, envelopes, debts]);

  // Get available options for new connections
  const availableOptions = useMemo(() => {
    switch (entityType) {
      case "bill":
        // Bills can connect to envelopes that aren't connected to other bills (or this one)
        return envelopes.filter(
          (envelope) => !envelope.billId || envelope.billId === entityId,
        );

      case "envelope":
        // Envelopes can connect to bills that aren't connected to other envelopes (or this one)
        return bills.filter(
          (bill) => !bill.envelopeId || bill.envelopeId === entityId,
        );

      case "debt":
        // Debts can connect to envelopes that aren't connected to other debts (or this one)
        return envelopes.filter(
          (envelope) => !envelope.debtId || envelope.debtId === entityId,
        );

      default:
        return [];
    }
  }, [entityType, entityId, bills, envelopes, debts]);

  // Handle connection creation
  const handleConnect = async (targetId) => {
    if (!targetId || !currentEntity) return { success: false };

    setIsConnecting(true);
    logger.debug("🔗 Creating connection", {
      entityType,
      entityId,
      targetId,
      currentEntity: currentEntity.name || currentEntity.provider,
    });

    try {
      switch (entityType) {
        case "bill":
          // Connect bill to envelope
          const targetEnvelope = envelopes.find((e) => e.id === targetId);
          if (!targetEnvelope) throw new Error("Target envelope not found");

          await updateBill(entityId, { envelopeId: targetId });

          addToast({
            type: "success",
            title: "Connection Created",
            message: `Bill connected to ${targetEnvelope.name}`,
            duration: 3000,
          });
          break;

        case "envelope":
          // Connect envelope to bill
          const targetBill = bills.find((b) => b.id === targetId);
          if (!targetBill) throw new Error("Target bill not found");

          await updateBill(targetId, { envelopeId: entityId });

          addToast({
            type: "success",
            title: "Connection Created",
            message: `Connected to ${targetBill.provider}`,
            duration: 3000,
          });
          break;

        case "debt":
          // Connect debt to envelope
          const targetEnvelopeForDebt = envelopes.find(
            (e) => e.id === targetId,
          );
          if (!targetEnvelopeForDebt)
            throw new Error("Target envelope not found");

          await updateDebt({ id: entityId, updates: { envelopeId: targetId } });

          addToast({
            type: "success",
            title: "Connection Created",
            message: `Debt connected to ${targetEnvelopeForDebt.name}`,
            duration: 3000,
          });
          break;

        default:
          throw new Error(`Unknown entity type: ${entityType}`);
      }

      setSelectedConnectionId("");
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
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle connection removal
  const handleDisconnect = async () => {
    if (!currentEntity || currentConnections.length === 0)
      return { success: false };

    setIsConnecting(true);
    logger.debug("🔗 Removing connection", {
      entityType,
      entityId,
      currentConnections: currentConnections.map((c) => c.id),
    });

    try {
      switch (entityType) {
        case "bill":
          // Remove bill's envelope connection
          await updateBill(entityId, { envelopeId: null });

          addToast({
            type: "info",
            title: "Connection Removed",
            message: "Bill disconnected from envelope",
            duration: 3000,
          });
          break;

        case "envelope":
          // Remove all bills connected to this envelope
          const connectedBillIds = currentConnections.map((c) => c.id);
          await Promise.all(
            connectedBillIds.map((billId) =>
              updateBill(billId, { envelopeId: null }),
            ),
          );

          addToast({
            type: "info",
            title: "Connection Removed",
            message: `Disconnected ${connectedBillIds.length} bill(s)`,
            duration: 3000,
          });
          break;

        case "debt":
          // Remove debt's envelope connection
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
    } finally {
      setIsConnecting(false);
    }
  };

  // Auto-populate envelope details when connecting to a bill
  const handleAutoPopulate = async (billId) => {
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

  // Handle selection change with auto-populate logic
  const handleSelectionChange = async (targetId) => {
    setSelectedConnectionId(targetId);

    // Auto-populate envelope when bill is selected
    if (entityType === "envelope" && targetId) {
      await handleAutoPopulate(targetId);
    }
  };

  return {
    // State
    currentConnections,
    availableOptions,
    selectedConnectionId,
    isConnecting,
    hasConnections: currentConnections.length > 0,
    hasAvailableOptions: availableOptions.length > 0,

    // Actions
    handleConnect: () => handleConnect(selectedConnectionId),
    handleDisconnect,
    handleSelectionChange,

    // Utilities
    canConnect:
      !isConnecting &&
      selectedConnectionId &&
      availableOptions.some((o) => o.id === selectedConnectionId),
    getConnectionConfig: () => {
      switch (entityType) {
        case "bill":
          return {
            displayTitle: "Connected Envelopes",
            selectTitle: "Connect to Envelope",
            connectionType: "envelope",
            selectPrompt: "Choose an envelope to connect this bill to...",
            tip: "Connect to an envelope to automatically allocate bill payments.",
          };
        case "envelope":
          return {
            displayTitle: "Connected Bills",
            selectTitle: "Connect to Bill",
            connectionType: "bill",
            selectPrompt: "Choose a bill to auto-populate envelope settings...",
            tip: "Connect to a bill to automatically fill envelope details.",
          };
        case "debt":
          return {
            displayTitle: "Connected Envelopes",
            selectTitle: "Connect to Envelope",
            connectionType: "envelope",
            selectPrompt: "Choose an envelope to allocate debt payments to...",
            tip: "Connect to an envelope to track debt payment allocations.",
          };
        default:
          return {
            displayTitle: "Connected Items",
            selectTitle: "Connect Item",
            connectionType: "item",
            selectPrompt: "Choose an item to connect...",
            tip: "Connect related items for better organization.",
          };
      }
    },
  };
};

export default useConnectionManager;
