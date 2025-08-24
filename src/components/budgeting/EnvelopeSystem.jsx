// src/components/budgeting/EnvelopeSystem.jsx - Refactored with separated logic
import React, { useEffect, useCallback, useRef } from "react";
import { useBudgetStore } from "../../stores/uiStore";
import { useEnvelopes } from "../../hooks/useEnvelopes";
import { useBills } from "../../hooks/useBills";
import { calculateBiweeklyNeeds } from "../../utils/budgeting";
import {
  FREQUENCY_MULTIPLIERS,
  BIWEEKLY_MULTIPLIER,
} from "../../constants/categories";
import logger from "../../utils/logger";

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

  // Keep Zustand for non-migrated operations
  const {
    unassignedCash,
    setEnvelopes,
    setBiweeklyAllocation,
    setUnassignedCash,
  } = useBudgetStore();

  const lastBillsRef = useRef(null);
  const isCalculatingRef = useRef(false);

  // Calculate biweekly allocation needs from bills using utility function
  const updateBiweeklyAllocations = useCallback(() => {
    if (isCalculatingRef.current) {
      logger.debug(
        "Skipping biweekly allocation update - calculation already in progress",
      );
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
    const totalBiweeklyNeed = calculateBiweeklyNeeds(bills);

    logger.info("Calculated total biweekly need", {
      totalBiweeklyNeed,
      billsProcessed: bills.length,
    });

    // Set the allocation outside of setEnvelopes
    setBiweeklyAllocation(totalBiweeklyNeed);

    setEnvelopes((currentEnvelopes) => {
      const updatedEnvelopes = [...currentEnvelopes];
      let envelopesUpdated = 0;

      // Update each bill envelope's biweekly allocation
      bills.forEach((bill) => {
        if (bill.envelopeId) {
          const envelopeIndex = updatedEnvelopes.findIndex(
            (env) => env.id === bill.envelopeId,
          );
          if (envelopeIndex >= 0) {
            const envelope = updatedEnvelopes[envelopeIndex];
            if (
              !envelope.biweeklyAllocation ||
              envelope.biweeklyAllocation === 0
            ) {
              // Calculate this bill's biweekly amount
              const multiplier = FREQUENCY_MULTIPLIERS[bill.frequency] || 12;
              const annualAmount = bill.amount * multiplier;
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
        previousBillsCount: lastBillsRef.current
          ? JSON.parse(lastBillsRef.current).length
          : 0,
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
    async (envelopeData) => {
      try {
        await addEnvelope(envelopeData);
        return { success: true };
      } catch (error) {
        logger.error("Failed to create envelope:", error);
        return { success: false, error: error.message };
      }
    },
    [addEnvelope],
  );

  const modifyEnvelope = useCallback(
    async (envelopeId, updates) => {
      try {
        await updateEnvelope({ id: envelopeId, updates });
        return { success: true };
      } catch (error) {
        logger.error("Failed to update envelope:", error);
        return { success: false, error: error.message };
      }
    },
    [updateEnvelope],
  );

  const removeEnvelope = useCallback(
    async (envelopeId) => {
      try {
        await deleteEnvelope(envelopeId);
        return { success: true };
      } catch (error) {
        logger.error("Failed to delete envelope:", error);
        return { success: false, error: error.message };
      }
    },
    [deleteEnvelope],
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
