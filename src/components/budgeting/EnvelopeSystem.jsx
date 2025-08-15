// src/components/budgeting/EnvelopeSystem.jsx - Refactored with separated logic
import React, { useEffect, useCallback, useRef } from "react";
import { useBudgetStore } from "../../stores/budgetStore";
import { useEnvelopes } from "../../hooks/useEnvelopes";
import { useBills } from "../../hooks/useBills";
import { calculateBiweeklyNeeds } from "../../utils/budgeting";
import {
  FREQUENCY_MULTIPLIERS,
  BIWEEKLY_MULTIPLIER,
} from "../../constants/categories";

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
      return; // Prevent recursive calls
    }

    isCalculatingRef.current = true;

    // Use the utility function for calculation
    const totalBiweeklyNeed = calculateBiweeklyNeeds(bills);

    // Set the allocation outside of setEnvelopes
    setBiweeklyAllocation(totalBiweeklyNeed);

    setEnvelopes((currentEnvelopes) => {
      const updatedEnvelopes = [...currentEnvelopes];

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

              updatedEnvelopes[envelopeIndex] = {
                ...envelope,
                biweeklyAllocation: biweeklyAmount,
                envelopeType: "bill", // Ensure bill envelopes are typed correctly
              };
            }
          }
        }
      });

      isCalculatingRef.current = false;
      return updatedEnvelopes;
    });
  }, [bills, setBiweeklyAllocation, setEnvelopes]);

  // Auto-update allocations when bills change
  useEffect(() => {
    if (bills.length > 0 && JSON.stringify(bills) !== lastBillsRef.current) {
      updateBiweeklyAllocations();
      lastBillsRef.current = JSON.stringify(bills);
    }
  }, [bills, updateBiweeklyAllocations]);

  // Envelope operations with TanStack integration
  const createEnvelope = useCallback(
    async (envelopeData) => {
      try {
        await addEnvelope(envelopeData);
        return { success: true };
      } catch (error) {
        console.error("Failed to create envelope:", error);
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
        console.error("Failed to update envelope:", error);
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
        console.error("Failed to delete envelope:", error);
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
