// src/components/EnvelopeSystem.jsx - Enhanced Envelope Operations with TanStack Query
import React, { useEffect, useMemo, useCallback, useRef } from "react";
import { useBudgetStore } from "../../stores/budgetStore";
import { useEnvelopes } from "../../hooks/useEnvelopes";
import { useBills } from "../../hooks/useBills";
import {
  BIWEEKLY_MULTIPLIER,
  FREQUENCY_MULTIPLIERS,
} from "../../constants/frequency";

const useEnvelopeSystem = () => {
  // Enhanced TanStack Query integration
  const {
    data: envelopes = [],
    addEnvelope,
    updateEnvelope,
    deleteEnvelope,
    isLoading: envelopesLoading,
  } = useEnvelopes();

  const { data: bills = [], isLoading: billsLoading } = useBills();

  // Keep Zustand for non-migrated operations
  const {
    unassignedCash,
    setEnvelopes,
    setBiweeklyAllocation,
    setUnassignedCash,
  } = useBudgetStore();

  const lastBillsRef = useRef(null);
  const isCalculatingRef = useRef(false);

  // Calculate biweekly allocation needs from bills
  const calculateBiweeklyNeeds = useCallback(() => {
    if (isCalculatingRef.current) {
      return; // Prevent recursive calls
    }

    isCalculatingRef.current = true;

    let totalBiweeklyNeed = 0;

    // Calculate total first - convert to monthly then to biweekly
    bills.forEach((bill) => {
      const multiplier = FREQUENCY_MULTIPLIERS[bill.frequency] || 12;
      const annualAmount = bill.amount * multiplier;
      const monthlyAmount = annualAmount / 12;
      const biweeklyAmount = monthlyAmount / BIWEEKLY_MULTIPLIER; // Simple monthly / 2
      totalBiweeklyNeed += biweeklyAmount;
    });

    // Set the allocation outside of setEnvelopes
    setBiweeklyAllocation(totalBiweeklyNeed);

    setEnvelopes((currentEnvelopes) => {
      const updatedEnvelopes = [...currentEnvelopes];

      bills.forEach((bill) => {
        const multiplier = FREQUENCY_MULTIPLIERS[bill.frequency] || 12;
        const annualAmount = bill.amount * multiplier;
        const monthlyAmount = annualAmount / 12;
        const biweeklyAmount = monthlyAmount / BIWEEKLY_MULTIPLIER; // Simple monthly / 2

        // Find or create envelope for this bill
        let envelope = updatedEnvelopes.find(
          (env) => env.linkedBillId === bill.id,
        );

        if (!envelope) {
          // Create new envelope for this bill
          const newEnvelope = {
            id: `bill_${bill.id}`,
            name: bill.name,
            biweeklyAllocation: biweeklyAmount,
            currentBalance: 0,
            color: bill.color,
            linkedBillId: bill.id,
            spendingHistory: [],
            category: bill.category,
            isFromBill: true,
            targetAmount: biweeklyAmount * 2, // Two weeks buffer
          };
          updatedEnvelopes.push(newEnvelope);
        } else {
          // Update existing envelope
          envelope.biweeklyAllocation = biweeklyAmount;
          envelope.targetAmount = biweeklyAmount * 2;
        }
      });

      return updatedEnvelopes;
    });

    setTimeout(() => {
      isCalculatingRef.current = false;
    }, 100);
  }, [bills, setEnvelopes, setBiweeklyAllocation]);

  // Spend money from an envelope
  const spendFromEnvelope = useCallback(
    (envelopeId, amount, description = "Spending") => {
      setEnvelopes((currentEnvelopes) =>
        currentEnvelopes.map((envelope) => {
          if (envelope.id === envelopeId) {
            const newBalance = Math.max(0, envelope.currentBalance - amount);
            const spendingRecord = {
              id: Date.now(),
              amount: amount,
              description: description,
              date: new Date().toISOString(),
              balanceAfter: newBalance,
            };

            return {
              ...envelope,
              currentBalance: newBalance,
              spendingHistory: [
                ...(envelope.spendingHistory || []),
                spendingRecord,
              ],
            };
          }
          return envelope;
        }),
      );
    },
    [setEnvelopes],
  );

  // Transfer money between envelopes
  const transferBetweenEnvelopes = useCallback(
    (fromEnvelopeId, toEnvelopeId, amount) => {
      if (fromEnvelopeId === "unassigned") {
        // Transfer from unassigned cash to envelope
        setUnassignedCash((currentUnassigned) => {
          if (currentUnassigned >= amount) {
            setEnvelopes((currentEnvelopes) =>
              currentEnvelopes.map((envelope) => {
                if (envelope.id === toEnvelopeId) {
                  return {
                    ...envelope,
                    currentBalance: envelope.currentBalance + amount,
                  };
                }
                return envelope;
              }),
            );
            return currentUnassigned - amount;
          }
          return currentUnassigned;
        });
        return;
      }

      if (toEnvelopeId === "unassigned") {
        // Transfer from envelope to unassigned cash
        setEnvelopes((currentEnvelopes) => {
          const fromEnvelope = currentEnvelopes.find(
            (env) => env.id === fromEnvelopeId,
          );
          if (fromEnvelope && fromEnvelope.currentBalance >= amount) {
            setUnassignedCash((current) => current + amount);
            spendFromEnvelope(
              fromEnvelopeId,
              amount,
              "Transfer to unassigned cash",
            );
          }
          return currentEnvelopes;
        });
        return;
      }

      // Transfer between two envelopes
      setEnvelopes((currentEnvelopes) => {
        const fromEnvelope = currentEnvelopes.find(
          (env) => env.id === fromEnvelopeId,
        );
        if (!fromEnvelope || fromEnvelope.currentBalance < amount) {
          return currentEnvelopes; // Insufficient funds
        }

        return currentEnvelopes.map((envelope) => {
          if (envelope.id === fromEnvelopeId) {
            return {
              ...envelope,
              currentBalance: envelope.currentBalance - amount,
            };
          }
          if (envelope.id === toEnvelopeId) {
            return {
              ...envelope,
              currentBalance: envelope.currentBalance + amount,
            };
          }
          return envelope;
        });
      });
    },
    [setEnvelopes, setUnassignedCash, spendFromEnvelope],
  );

  // Process paycheck allocation to envelopes
  const allocatePaycheckToEnvelopes = useCallback(
    (paycheckAmount, allocationMode = "allocate") => {
      if (allocationMode === "leftover") {
        // All money goes to unassigned cash
        setUnassignedCash((current) => current + paycheckAmount);
        return {
          allocations: {},
          leftoverAmount: paycheckAmount,
        };
      }

      // Smart allocation based on envelope needs
      let remainingAmount = paycheckAmount;
      const allocations = {};

      setEnvelopes((currentEnvelopes) => {
        const updatedEnvelopes = [...currentEnvelopes];

        // First pass: Fill envelopes that are below their biweekly allocation
        currentEnvelopes.forEach((envelope) => {
          if (remainingAmount <= 0) return;

          const needed = Math.max(
            0,
            envelope.biweeklyAllocation - envelope.currentBalance,
          );
          const allocation = Math.min(needed, remainingAmount);

          if (allocation > 0) {
            allocations[envelope.id] = allocation;
            remainingAmount -= allocation;

            // Update envelope balance
            const envelopeIndex = updatedEnvelopes.findIndex(
              (env) => env.id === envelope.id,
            );
            if (envelopeIndex !== -1) {
              updatedEnvelopes[envelopeIndex] = {
                ...updatedEnvelopes[envelopeIndex],
                currentBalance:
                  updatedEnvelopes[envelopeIndex].currentBalance + allocation,
              };
            }
          }
        });

        return updatedEnvelopes;
      });

      // Remaining amount goes to unassigned cash
      setUnassignedCash((current) => current + remainingAmount);

      return {
        allocations,
        leftoverAmount: remainingAmount,
      };
    },
    [setEnvelopes, setUnassignedCash],
  );

  // Auto-calculate biweekly needs when bills change
  useEffect(() => {
    const billsStr = JSON.stringify(bills);
    if (bills.length > 0 && lastBillsRef.current !== billsStr) {
      lastBillsRef.current = billsStr;
      calculateBiweeklyNeeds();
    }
  }, [bills, calculateBiweeklyNeeds]);

  // Calculate total envelope balance
  const totalEnvelopeBalance = useMemo(() => {
    return envelopes.reduce((sum, env) => sum + env.currentBalance, 0);
  }, [envelopes]);

  // Get envelope by ID
  const getEnvelopeById = useCallback(
    (id) => {
      return envelopes.find((env) => env.id === id);
    },
    [envelopes],
  );

  // Get envelopes by category
  const getEnvelopesByCategory = useCallback(
    (category) => {
      return envelopes.filter((env) => env.category === category);
    },
    [envelopes],
  );

  // Check if envelope has sufficient funds
  const hasEnoughFunds = useCallback(
    (envelopeId, amount) => {
      if (envelopeId === "unassigned") {
        return unassignedCash >= amount;
      }
      const envelope = getEnvelopeById(envelopeId);
      return envelope ? envelope.currentBalance >= amount : false;
    },
    [unassignedCash, getEnvelopeById],
  );

  // Get envelope allocation status
  const getEnvelopeStatus = useCallback(
    (envelopeId) => {
      const envelope = getEnvelopeById(envelopeId);
      if (!envelope) return null;

      const percentFilled =
        envelope.biweeklyAllocation > 0
          ? (envelope.currentBalance / envelope.biweeklyAllocation) * 100
          : 0;

      return {
        isUnderfunded: envelope.currentBalance < envelope.biweeklyAllocation,
        isOverfunded: envelope.currentBalance > envelope.biweeklyAllocation,
        percentFilled,
        amountNeeded: Math.max(
          0,
          envelope.biweeklyAllocation - envelope.currentBalance,
        ),
        amountOver: Math.max(
          0,
          envelope.currentBalance - envelope.biweeklyAllocation,
        ),
      };
    },
    [getEnvelopeById],
  );

  return {
    // Data with enhanced TanStack Query integration
    envelopes,
    totalEnvelopeBalance,
    isLoading: envelopesLoading || billsLoading,
    isEnvelopesLoading: envelopesLoading,
    isBillsLoading: billsLoading,

    // Core operations
    spendFromEnvelope,
    transferBetweenEnvelopes,
    allocatePaycheckToEnvelopes,

    // Enhanced CRUD operations with optimistic updates
    addEnvelope,
    updateEnvelope,
    deleteEnvelope,

    // Utility functions
    calculateBiweeklyNeeds,
    getEnvelopeById,
    getEnvelopesByCategory,
    hasEnoughFunds,
    getEnvelopeStatus,
  };
};

export default useEnvelopeSystem;
