// src/components/EnvelopeSystem.jsx - Focused Envelope Operations
import React, { useEffect, useMemo, useCallback } from "react";
import { useBudget } from "../../contexts/BudgetContext";

const useEnvelopeSystem = () => {
  const {
    envelopes,
    bills,
    unassignedCash,
    setEnvelopes,
    setBiweeklyAllocation,
    setUnassignedCash,
    addEnvelope,
    updateEnvelope,
    deleteEnvelope,
  } = useBudget();

  // Calculate biweekly allocation needs from bills
  const calculateBiweeklyNeeds = useCallback(() => {
    const frequencyMultipliers = {
      weekly: 52,
      biweekly: 26,
      monthly: 12,
      quarterly: 4,
      semiannual: 2,
      yearly: 1,
      custom: 12, // Default to monthly for custom
    };

    let totalBiweeklyNeed = 0;
    const updatedEnvelopes = [...envelopes];

    bills.forEach((bill) => {
      const multiplier = frequencyMultipliers[bill.frequency] || 12;
      const annualAmount = bill.amount * multiplier;
      const biweeklyAmount = annualAmount / 26;
      totalBiweeklyNeed += biweeklyAmount;

      // Find or create envelope for this bill
      let envelope = updatedEnvelopes.find(
        (env) => env.linkedBillId === bill.id
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

    setEnvelopes(updatedEnvelopes);
    setBiweeklyAllocation(totalBiweeklyNeed);
  }, [bills, setEnvelopes, setBiweeklyAllocation]); // Removed envelopes dependency to prevent infinite loop

  // Spend money from an envelope
  const spendFromEnvelope = useCallback(
    (envelopeId, amount, description = "Spending") => {
      const updatedEnvelopes = envelopes.map((envelope) => {
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
      });

      setEnvelopes(updatedEnvelopes);
    },
    [envelopes, setEnvelopes]
  );

  // Transfer money between envelopes
  const transferBetweenEnvelopes = useCallback(
    (fromEnvelopeId, toEnvelopeId, amount) => {
      if (fromEnvelopeId === "unassigned") {
        // Transfer from unassigned cash to envelope
        if (unassignedCash >= amount) {
          setUnassignedCash(unassignedCash - amount);

          const updatedEnvelopes = envelopes.map((envelope) => {
            if (envelope.id === toEnvelopeId) {
              return {
                ...envelope,
                currentBalance: envelope.currentBalance + amount,
              };
            }
            return envelope;
          });

          setEnvelopes(updatedEnvelopes);
        }
        return;
      }

      if (toEnvelopeId === "unassigned") {
        // Transfer from envelope to unassigned cash
        const fromEnvelope = envelopes.find((env) => env.id === fromEnvelopeId);
        if (fromEnvelope && fromEnvelope.currentBalance >= amount) {
          setUnassignedCash(unassignedCash + amount);
          spendFromEnvelope(
            fromEnvelopeId,
            amount,
            "Transfer to unassigned cash"
          );
        }
        return;
      }

      // Transfer between two envelopes
      const fromEnvelope = envelopes.find((env) => env.id === fromEnvelopeId);
      if (!fromEnvelope || fromEnvelope.currentBalance < amount) {
        return; // Insufficient funds
      }

      const updatedEnvelopes = envelopes.map((envelope) => {
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

      setEnvelopes(updatedEnvelopes);
    },
    [
      envelopes,
      unassignedCash,
      setEnvelopes,
      setUnassignedCash,
      spendFromEnvelope,
    ]
  );

  // Process paycheck allocation to envelopes
  const allocatePaycheckToEnvelopes = useCallback(
    (paycheckAmount, allocationMode = "allocate") => {
      if (allocationMode === "leftover") {
        // All money goes to unassigned cash
        setUnassignedCash(unassignedCash + paycheckAmount);
        return {
          allocations: {},
          leftoverAmount: paycheckAmount,
        };
      }

      // Smart allocation based on envelope needs
      let remainingAmount = paycheckAmount;
      const allocations = {};
      const updatedEnvelopes = [...envelopes];

      // First pass: Fill envelopes that are below their biweekly allocation
      envelopes.forEach((envelope) => {
        if (remainingAmount <= 0) return;

        const needed = Math.max(
          0,
          envelope.biweeklyAllocation - envelope.currentBalance
        );
        const allocation = Math.min(needed, remainingAmount);

        if (allocation > 0) {
          allocations[envelope.id] = allocation;
          remainingAmount -= allocation;

          // Update envelope balance
          const envelopeIndex = updatedEnvelopes.findIndex(
            (env) => env.id === envelope.id
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

      // Remaining amount goes to unassigned cash
      setUnassignedCash(unassignedCash + remainingAmount);
      setEnvelopes(updatedEnvelopes);

      return {
        allocations,
        leftoverAmount: remainingAmount,
      };
    },
    [envelopes, unassignedCash, setEnvelopes, setUnassignedCash]
  );

  // Auto-calculate biweekly needs when bills change
  useEffect(() => {
    if (bills.length > 0) {
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
    [envelopes]
  );

  // Get envelopes by category
  const getEnvelopesByCategory = useCallback(
    (category) => {
      return envelopes.filter((env) => env.category === category);
    },
    [envelopes]
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
    [unassignedCash, getEnvelopeById]
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
          envelope.biweeklyAllocation - envelope.currentBalance
        ),
        amountOver: Math.max(
          0,
          envelope.currentBalance - envelope.biweeklyAllocation
        ),
      };
    },
    [getEnvelopeById]
  );

  return {
    // Data
    envelopes,
    totalEnvelopeBalance,

    // Core operations
    spendFromEnvelope,
    transferBetweenEnvelopes,
    allocatePaycheckToEnvelopes,

    // CRUD operations
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
