import { useState, useMemo } from "react";
import useBills from "../bills/useBills";
import useEnvelopes from "../budgeting/useEnvelopes";
import useDebts from "../debts/useDebts";
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
  const { currentConnections, availableOptions, hasConnections, hasAvailableOptions } = useConnectionData(
    entityType,
    entityId,
    currentEntity,
    bills,
    envelopes,
    debts
  );

  // Handle connection creation with extracted operations
  const handleConnectWrapper = async (targetId) => {
    if (!targetId || !currentEntity) return { success: false };

    setIsConnecting(true);
    try {
      const result = await handleConnect(
        entityType,
        entityId,
        targetId,
        currentEntity,
        envelopes,
        bills,
        debts,
        updateBill,
        updateDebt
      );
      
      if (result.success) {
        setSelectedConnectionId("");
      }
      
      return result;
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle connection removal with extracted operations
  const handleDisconnectWrapper = async () => {
    if (!currentEntity || currentConnections.length === 0) return { success: false };

    setIsConnecting(true);
    try {
      const result = await handleDisconnect(
        entityType,
        entityId,
        currentConnections,
        updateBill,
        updateDebt
      );
      return result;
    } finally {
      setIsConnecting(false);
    }
  };

  // Auto-populate envelope details when connecting to a bill
  const handleAutoPopulateWrapper = async (billId) => {
    await handleAutoPopulate(
      entityType,
      entityId,
      billId,
      bills,
      currentEntity,
      updateEnvelope
    );
  };

  // Handle selection change with auto-populate logic
  const handleSelectionChange = async (targetId) => {
    setSelectedConnectionId(targetId);

    // Auto-populate envelope when bill is selected
    if (entityType === "envelope" && targetId) {
      await handleAutoPopulateWrapper(targetId);
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
    handleConnect: () => handleConnectWrapper(selectedConnectionId),
    handleDisconnect: handleDisconnectWrapper,
    handleSelectionChange,

    // Utilities
    canConnect:
      !isConnecting &&
      selectedConnectionId &&
      availableOptions.some((o) => o.id === selectedConnectionId),
    getConnectionConfig: () => getConnectionConfig(entityType),
  };
};

export default useConnectionManager;
