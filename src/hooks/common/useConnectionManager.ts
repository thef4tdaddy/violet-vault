import { useState, useMemo } from "react";
import useBills from "../bills/useBills";
import useEnvelopes from "../budgeting/useEnvelopes";
import { useDebts } from "../debts/useDebts";
import { useConnectionConfig } from "./useConnectionManager/useConnectionConfig";
import { useConnectionOperations } from "./useConnectionManager/useConnectionOperations";
import { useConnectionData } from "./useConnectionManager/useConnectionData";
import { useAutoPopulate } from "./useConnectionManager/useAutoPopulate";

/**
 * Smart connection manager hook that handles relationships between bills, envelopes, and debts
 * Context-aware: Envelopes get Bills, Bills and Debts get Envelopes
 */
const useConnectionManager = (entityType, entityId) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState("");

  const { bills, updateBill } = useBills();
  const { envelopes, updateEnvelope } = useEnvelopes();
  const { debts, updateDebt } = useDebts();

  const { getConnectionConfig } = useConnectionConfig();
  const { handleConnect, handleDisconnect } = useConnectionOperations();
  const { handleAutoPopulate } = useAutoPopulate();

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

  // Get connection data using extracted hook
  const { currentConnections, availableOptions, hasConnections, hasAvailableOptions } =
    useConnectionData({ entityType, entityId, currentEntity, bills, envelopes, debts });

  // Connection operations with state management
  const connectWithState = async (targetId) => {
    if (!targetId || !currentEntity) return { success: false };

    setIsConnecting(true);
    try {
      const result = await handleConnect({
        entityType,
        entityId,
        targetId,
        currentEntity,
        envelopes,
        bills,
        debts,
        updateBill,
        updateDebt,
      });
      if (result.success) setSelectedConnectionId("");
      return result;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWithState = async () => {
    if (!currentEntity || currentConnections.length === 0) return { success: false };

    setIsConnecting(true);
    try {
      return await handleDisconnect({
        entityType,
        entityId,
        currentConnections,
        updateBill,
        updateDebt,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSelectionChange = async (targetId) => {
    setSelectedConnectionId(targetId);
    if (entityType === "envelope" && targetId) {
      await handleAutoPopulate({
        entityType,
        entityId,
        billId: targetId,
        bills,
        currentEntity,
        updateEnvelope,
      });
    }
  };

  return {
    // State
    currentConnections,
    availableOptions,
    selectedConnectionId,
    isConnecting,
    hasConnections,
    hasAvailableOptions,

    // Actions
    handleConnect: () => connectWithState(selectedConnectionId),
    handleDisconnect: disconnectWithState,
    handleSelectionChange,

    // Utilities
    canConnect:
      !isConnecting &&
      selectedConnectionId &&
      availableOptions.some((o) => o.id === selectedConnectionId),
    getConnectionConfig: () => getConnectionConfig(entityType),
  };
};

export { useConnectionManager };
