import { useState, useMemo } from "react";
import useBills from "@/hooks/budgeting/transactions/scheduled/expenses/useBills";
import useEnvelopes from "@/hooks/budgeting/envelopes/useEnvelopes";
import { useDebts } from "@/hooks/budgeting/envelopes/liabilities/useDebts";
import { useConnectionConfig } from "./useConnectionConfig";
import { useConnectionOperations } from "./useConnectionOperations";
import { useConnectionData } from "./useConnectionData";
import { useAutoPopulate } from "./useAutoPopulate";
import type { Envelope, Bill, Debt } from "@/db/types";

type EntityType = "bill" | "envelope" | "debt";

/**
 * Smart connection manager hook that handles relationships between bills, envelopes, and debts
 * Context-aware: Envelopes get Bills, Bills and Debts get Envelopes
 */
const useConnectionManager = (entityType: EntityType, entityId: string) => {
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
    useConnectionData({
      entityType,
      entityId,
      currentEntity: currentEntity as Envelope | Bill | Debt | null,
      bills: bills as unknown as Bill[],
      envelopes,
      debts: debts as unknown as Debt[],
    });

  // Connection operations with state management
  const connectWithState = async (targetId: string) => {
    if (!targetId || !currentEntity) return { success: false };

    setIsConnecting(true);
    try {
      const result = await handleConnect({
        entityType,
        entityId,
        targetId,
        currentEntity: currentEntity as Envelope | Bill | Debt,
        envelopes,
        bills: bills as unknown as Bill[],
        debts: debts as unknown as Debt[],
        updateBill: updateBill as unknown as (id: string, updates: unknown) => Promise<void>,
        updateDebt: updateDebt as unknown as (params: {
          id: string;
          updates: unknown;
        }) => Promise<void>,
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
        currentConnections: currentConnections as never,
        updateBill: updateBill as unknown as (id: string, updates: unknown) => Promise<void>,
        updateDebt: updateDebt as unknown as (params: {
          id: string;
          updates: unknown;
        }) => Promise<void>,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSelectionChange = async (targetId: string) => {
    setSelectedConnectionId(targetId);
    if (entityType === "envelope" && targetId) {
      await handleAutoPopulate({
        entityType,
        entityId,
        billId: targetId,
        bills: bills as unknown as Bill[],
        currentEntity: currentEntity as unknown as import("@/db/types").Envelope,
        updateEnvelope: updateEnvelope as unknown as (
          id: string,
          updates: unknown
        ) => Promise<void>,
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
