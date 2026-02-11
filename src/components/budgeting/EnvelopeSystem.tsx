// src/components/budgeting/EnvelopeSystem.tsx - Refactored with separated logic
import { useEffect, useCallback, useRef } from "react";
import { useEnvelopes } from "../../hooks/budgeting/envelopes/useEnvelopes";
import useBills from "../../hooks/budgeting/transactions/scheduled/expenses/useBills";
import { useUnassignedCash } from "../../hooks/budgeting/metadata/useUnassignedCash";
import { calculateBiweeklyNeeds } from "@/utils/domain/budgeting";
import { calculateBiweeklyAllocations } from "@/utils/domain/budgeting/allocationCalculations";
import logger from "@/utils/core/common/logger";
import type { Bill } from "@/utils/domain/budgeting/envelopeCalculations";
import type { Envelope } from "../../db/types";

// Define types for our functions
interface AddEnvelopeData {
  name: string;
  category?: string;
  targetAmount?: number;
  description?: string;
  envelopeType?: string;
  [key: string]: unknown;
}

interface CreateEnvelopeResult {
  success: boolean;
  error?: string;
}

interface UpdateEnvelopeResult {
  success: boolean;
  error?: string;
}

interface DeleteEnvelopeResult {
  success: boolean;
  error?: string;
}

const useEnvelopeSystem = () => {
  // Enhanced TanStack Query integration
  const {
    envelopes = [],
    addEnvelope,
    updateEnvelope,
    deleteEnvelope,
    isLoading: envelopesLoading,
  } = useEnvelopes();

  const { bills = [], isLoading: billsLoading } = useBills();

  // Use proper hook for unassigned cash
  const { unassignedCash = 0, updateUnassignedCash: setUnassignedCashDb } = useUnassignedCash();

  const lastBillsRef = useRef<string | null>(null);
  const isCalculatingRef = useRef(false);

  // Calculate biweekly allocation needs from bills using utility function
  const updateBiweeklyAllocations = useCallback(() => {
    if (isCalculatingRef.current) {
      logger.debug("Skipping biweekly allocation update - calculation already in progress");
      return; // Prevent recursive calls
    }

    logger.debug("Starting biweekly allocation calculation", {
      billsCount: bills.length,
      bills: bills.map((b) => ({
        id: b.id,
        name: b.description || "Unknown Bill",
        amount: b.amount,
        frequency: b.recurrenceRule
          ? b.recurrenceRule.split(";")[0].split("=")[1].toLowerCase()
          : "monthly",
      })),
    });

    isCalculatingRef.current = true;

    // Use the utility function for calculation
    const totalBiweeklyNeed = calculateBiweeklyNeeds(bills as unknown as Bill[]);

    logger.info("Calculated total biweekly need", {
      totalBiweeklyNeed,
      billsProcessed: bills.length,
    });

    // Use utility function to calculate allocations
    const { updatedEnvelopes, envelopesUpdated } = calculateBiweeklyAllocations(
      envelopes,
      bills,
      billsLoading
    );

    if (envelopesUpdated > 0) {
      logger.info(`Updated ${envelopesUpdated} envelopes with biweekly allocations`);

      // Batch update the envelopes
      Promise.all(updatedEnvelopes.map((env) => updateEnvelope(env.id, env)))
        .then(() => {
          isCalculatingRef.current = false;
        })
        .catch((err) => {
          logger.error("Failed to update envelopes with biweekly allocations", err);
          isCalculatingRef.current = false;
        });
    } else {
      isCalculatingRef.current = false;
    }
  }, [
    bills,
    envelopes,
    billsLoading,
    updateEnvelope,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    bills
      .map(
        (b) =>
          `${b.id}-${b.amount}-${b.recurrenceRule}-${(b as unknown as Record<string, unknown>).frequency}`
      )
      .join(","),
  ]);

  // Auto-update allocations when bills change
  useEffect(() => {
    if (bills.length > 0 && JSON.stringify(bills) !== lastBillsRef.current) {
      logger.debug("Bills changed, triggering biweekly allocation update", {
        previousBillsCount: lastBillsRef.current ? JSON.parse(lastBillsRef.current).length : 0,
        currentBillsCount: bills.length,
      });
      updateBiweeklyAllocations();
      lastBillsRef.current = JSON.stringify(bills);
    } else if (bills.length === 0 && lastBillsRef.current !== null) {
      logger.debug("All bills removed, clearing biweekly allocations");
      lastBillsRef.current = null;
    }
  }, [bills, updateBiweeklyAllocations]);

  // Envelope operations with TanStack integration
  const createEnvelope = useCallback(
    async (envelopeData: AddEnvelopeData): Promise<CreateEnvelopeResult> => {
      try {
        await addEnvelope(envelopeData);
        return { success: true };
      } catch (error) {
        logger.error("Failed to create envelope:", error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      }
    },
    [addEnvelope]
  );

  const modifyEnvelope = useCallback(
    async (envelopeId: string, updates: Partial<Envelope>): Promise<UpdateEnvelopeResult> => {
      try {
        await updateEnvelope(envelopeId, updates);
        return { success: true };
      } catch (error) {
        logger.error("Failed to update envelope:", error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      }
    },
    [updateEnvelope]
  );

  const removeEnvelope = useCallback(
    async (envelopeId: string, deleteBillsToo: boolean = false): Promise<DeleteEnvelopeResult> => {
      try {
        await deleteEnvelope({ envelopeId, deleteBillsToo });
        return { success: true };
      } catch (error) {
        logger.error("Failed to delete envelope:", error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      }
    },
    [deleteEnvelope]
  );

  return {
    // Data
    envelopes,
    bills,
    unassignedCash,

    // Loading states
    isLoading: envelopesLoading || billsLoading,

    // Operations
    createEnvelope,
    updateEnvelope: modifyEnvelope,
    deleteEnvelope: removeEnvelope,
    updateBiweeklyAllocations,

    // Zustand operations (for legacy compatibility)
    setUnassignedCash: setUnassignedCashDb,
  };
};

export default useEnvelopeSystem;
