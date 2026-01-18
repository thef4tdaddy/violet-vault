/**
 * Connection data management for useConnectionManager
 * Extracted for better maintainability and ESLint compliance
 */
import { useMemo } from "react";
import { Envelope, Bill, Debt } from "@/db/types";

interface ConnectionDataParams {
  entityType: "bill" | "envelope" | "debt";
  entityId: string;
  currentEntity: Envelope | Bill | Debt | null;
  bills: Bill[];
  envelopes: Envelope[];
  debts?: Debt[];
}

export const useConnectionData = ({
  entityType,
  entityId,
  currentEntity,
  bills,
  envelopes,
}: ConnectionDataParams) => {
  // Get current connections based on entity type
  const currentConnections = useMemo(() => {
    if (!currentEntity) return [];

    switch (entityType) {
      case "bill": {
        const billEntity = currentEntity as Bill;
        return billEntity.envelopeId ? envelopes.filter((e) => e.id === billEntity.envelopeId) : [];
      }

      case "envelope":
        return bills.filter((b) => b.envelopeId === entityId);

      case "debt": {
        const debtEntity = currentEntity as Debt;
        return debtEntity.envelopeId ? envelopes.filter((e) => e.id === debtEntity.envelopeId) : [];
      }

      default:
        return [];
    }
  }, [entityType, entityId, currentEntity, bills, envelopes]);

  // Get available options for new connections
  // Note: Connections are defined on the Bill/Debt side via envelopeId, not on the Envelope side.
  // We just return all eligible envelopes for Bills/Debts, or all eligible Bills for Envelopes.
  const availableOptions = useMemo(() => {
    switch (entityType) {
      case "bill":
        // Logic: Envelopes don't have billId anymore. We select envelopes that are suitable.
        // For now, return all standard/liability envelopes or filter as needed by business logic.
        return envelopes;

      case "envelope":
        return bills.filter((bill) => !bill.envelopeId || bill.envelopeId === entityId);

      case "debt":
        // Logic: Envelopes don't have debtId anymore.
        return envelopes;

      default:
        return [];
    }
  }, [entityType, entityId, bills, envelopes]);

  return {
    currentConnections,
    availableOptions,
    hasConnections: currentConnections.length > 0,
    hasAvailableOptions: availableOptions.length > 0,
  };
};
