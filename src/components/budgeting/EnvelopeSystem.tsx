// src/components/budgeting/EnvelopeSystem.tsx - Refactored with separated logic
import { useEffect, useCallback, useRef } from "react";
import { useBudgetStore, type UiStore } from "@/stores/ui/uiStore";
import { useEnvelopes } from "@/hooks/budgeting/useEnvelopes";
import useBills from "@/hooks/bills/useBills";
import { calculateBiweeklyNeeds } from "@/utils/budgeting";
import logger from "@/utils/common/logger";

// Define frequency multipliers
const FREQUENCY_MULTIPLIERS: Record<string, number> = {
  weekly: 52,
  biweekly: 26,
  monthly: 12,
  quarterly: 4,
  semiannual: 2,
  annual: 1,
};

const BIWEEKLY_MULTIPLIER = 2.17;

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

  // Keep Zustand for non-migrated operations - selective subscriptions
  const unassignedCash = useBudgetStore((state: UiStore) => (state as any).unassignedCash ?? 0);
  const setEnvelopes = useBudgetStore((state: UiStore) => (state as any).setEnvelopes);
  const setBiweeklyAllocation = useBudgetStore(
    (state: UiStore) => (state as any).setBiweeklyAllocation
  );
  const setUnassignedCash = useBudgetStore((state: UiStore) => (state as any).setUnassignedCash);

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
        name: b.name,
        amount: b.amount,
        frequency: b.frequency,
      })),
    });

    isCalculatingRef.current = true;

    // Use the utility function for calculation
    const totalBiweeklyNeed = calculateBiweeklyNeeds(
      bills as Parameters<typeof calculateBiweeklyNeeds>[0]
    );

    logger.info("Calculated total biweekly need", {
      totalBiweeklyNeed,
      billsProcessed: bills.length,
    });

    // Set the allocation outside of setEnvelopes
    setBiweeklyAllocation(totalBiweeklyNeed);

    setEnvelopes((currentEnvelopes: any[]) => {
      const updatedEnvelopes = [...currentEnvelopes];
      let envelopesUpdated = 0;

      // Update each bill envelope's biweekly allocation
      bills.forEach((bill) => {
        if (bill.envelopeId) {
          const envelopeIndex = updatedEnvelopes.findIndex((env) => env.id === bill.envelopeId);
          if (envelopeIndex >= 0) {
            const envelope = updatedEnvelopes[envelopeIndex];
            if (!envelope.biweeklyAllocation || envelope.biweeklyAllocation === 0) {
              // Calculate this bill's biweekly amount
              const multiplier = bill.frequency ? FREQUENCY_MULTIPLIERS[bill.frequency] : undefined;
              const annualAmount = bill.amount * (multiplier ?? 12);
              const monthlyAmount = annualAmount / 12;
              const biweeklyAmount = monthlyAmount / BIWEEKLY_MULTIPLIER;

              logger.debug("Updating envelope biweekly allocation", {
                billId: bill.id,
                billName: bill.name,
                envelopeId: bill.envelopeId,
                envelopeName: envelope.name,
                billAmount: bill.amount,
                frequency: bill.frequency,
                calculatedBiweekly: biweeklyAmount,
              });

              updatedEnvelopes[envelopeIndex] = {
                ...envelope,
                biweeklyAllocation: biweeklyAmount,
                envelopeType: "bill", // Ensure bill envelopes are typed correctly
              };
              envelopesUpdated++;
            }
          } else {
            logger.warn("Bill references non-existent envelope", {
              billId: bill.id,
              billName: bill.name,
              envelopeId: bill.envelopeId,
            });
          }
        }
      });

      logger.info("Envelope biweekly allocation update completed", {
        envelopesUpdated,
        totalEnvelopes: updatedEnvelopes.length,
      });

      isCalculatingRef.current = false;
      return updatedEnvelopes;
    });
  }, [bills, setBiweeklyAllocation, setEnvelopes]);

  // Auto-update allocations when bills change
  useEffect(() => {
    if (bills.length > 0 && JSON.stringify(bills) !== lastBillsRef.current) {
      logger.debug("Bills changed, triggering biweekly allocation update", {
        previousBillsCount: lastBillsRef.current ? JSON.parse(lastBillsRef.current).length : 0,
        currentBillsCount: bills.length,
      });
      updateBiweeklyAllocations();
      lastBillsRef.current = JSON.stringify(bills) as string;
    } else if (bills.length === 0 && lastBillsRef.current !== null) {
      logger.debug("All bills removed, clearing biweekly allocations");
      lastBillsRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- updateBiweeklyAllocations is stable Zustand action
  }, [bills]);

  // Envelope operations with TanStack integration
  const createEnvelope = useCallback(
    async (envelopeData: any) => {
      try {
        await addEnvelope(envelopeData);
        return { success: true };
      } catch (error) {
        logger.error(
          "Failed to create envelope:",
          error instanceof Error ? error : new Error(String(error))
        );
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      }
    },
    [addEnvelope]
  );

  const modifyEnvelope = useCallback(
    async (envelopeId: string, updates: any) => {
      try {
        await updateEnvelope({ id: envelopeId, updates });
        return { success: true };
      } catch (error) {
        logger.error(
          "Failed to update envelope:",
          error instanceof Error ? error : new Error(String(error))
        );
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      }
    },
    [updateEnvelope]
  );

  const removeEnvelope = useCallback(
    async (envelopeId: string, deleteBillsToo = false) => {
      try {
        await deleteEnvelope(envelopeId, deleteBillsToo);
        return { success: true };
      } catch (error) {
        logger.error(
          "Failed to delete envelope:",
          error instanceof Error ? error : new Error(String(error))
        );
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
    setUnassignedCash,
  };
};

export default useEnvelopeSystem;
