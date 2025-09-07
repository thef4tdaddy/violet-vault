/**
 * Paycheck-related mutations
 * Complex paycheck processing logic extracted from useBudgetData
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../utils/common/queryClient";
import {
  budgetDb,
  getBudgetMetadata,
  setBudgetMetadata,
} from "../../../db/budgetDb";
import {
  calculatePaycheckBalances,
  validateBalances,
} from "../../../utils/common/balanceCalculator";
import logger from "../../../utils/common/logger.js";

export const usePaycheckMutations = (envelopesQuery, savingsGoalsQuery) => {
  const queryClient = useQueryClient();

  const processPaycheckMutation = useMutation({
    mutationKey: ["paychecks", "process"],
    mutationFn: async (paycheckData) => {
      logger.info("Starting paycheck processing", {
        amount: paycheckData.amount,
        mode: paycheckData.mode,
        allocations: paycheckData.envelopeAllocations?.length || 0,
        paycheckData,
      });

      // Get current metadata from Dexie (proper data source)
      const currentMetadata = await getBudgetMetadata();
      const currentActualBalance = currentMetadata?.actualBalance || 0;
      const currentUnassignedCash = currentMetadata?.unassignedCash || 0;

      // Calculate current virtual balance from envelope balances
      const currentEnvelopes = envelopesQuery.data || [];
      const currentSavings = savingsGoalsQuery.data || [];

      const currentTotalEnvelopeBalance = currentEnvelopes.reduce(
        (sum, env) => sum + (parseFloat(env.currentBalance) || 0),
        0,
      );
      const currentTotalSavingsBalance = currentSavings.reduce(
        (sum, saving) => sum + (parseFloat(saving.currentBalance) || 0),
        0,
      );
      const currentVirtualBalance =
        currentTotalEnvelopeBalance + currentTotalSavingsBalance;

      logger.info("Current balances before paycheck", {
        currentActualBalance,
        currentUnassignedCash,
        currentVirtualBalance,
        currentTotalEnvelopeBalance,
        currentTotalSavingsBalance,
        currentMetadata,
      });

      // Prepare current balances for calculator
      const currentBalances = {
        actualBalance: currentActualBalance,
        virtualBalance: currentVirtualBalance,
        unassignedCash: currentUnassignedCash,
        isActualBalanceManual: currentMetadata?.isActualBalanceManual || false,
      };

      // Prepare allocations for calculator
      const allocations =
        paycheckData.envelopeAllocations?.map((alloc) => ({
          envelopeId: alloc.envelopeId,
          amount: alloc.amount,
        })) || [];

      // Use centralized balance calculator to ensure consistency
      const newBalances = calculatePaycheckBalances(
        currentBalances,
        paycheckData,
        allocations,
      );

      // Validate the calculation
      const validation = validateBalances(newBalances);
      if (!validation.isValid) {
        logger.warn("Balance validation failed after paycheck processing", {
          errors: validation.errors,
          warnings: validation.warnings,
          paycheck: paycheckData,
          newBalances,
        });
      }

      logger.info("Calculated new balances using centralized calculator", {
        actualBalance: `${currentActualBalance} → ${newBalances.actualBalance}`,
        unassignedCash: `${currentUnassignedCash} → ${newBalances.unassignedCash}`,
        paycheckAmount: paycheckData.amount,
        paycheckMode: paycheckData.mode,
        allocationsCount: allocations.length,
      });

      // Update budget metadata in Dexie using calculated balances
      await setBudgetMetadata({
        actualBalance: newBalances.actualBalance,
        unassignedCash: newBalances.unassignedCash,
      });

      logger.info("Budget metadata updated in Dexie with validated balances");

      // Update envelope balances in Dexie if allocating
      if (allocations.length > 0) {
        logger.info("Updating envelope balances", {
          envelopeCount: allocations.length,
          allocations,
        });

        for (const allocation of allocations) {
          const envelope = await budgetDb.envelopes.get(allocation.envelopeId);
          if (envelope) {
            const oldBalance = envelope.currentBalance || 0;
            const newBalance = oldBalance + allocation.amount;

            await budgetDb.envelopes.update(allocation.envelopeId, {
              currentBalance: newBalance,
            });

            logger.info("Updated envelope balance", {
              envelopeId: allocation.envelopeId,
              oldBalance,
              newBalance,
              allocation: allocation.amount,
            });
          }
        }
      }

      // Create paycheck history record
      const paycheckRecord = {
        id: `paycheck_${Date.now()}`,
        date: new Date(),
        amount: paycheckData.amount,
        mode: paycheckData.mode,
        unassignedCashBefore: currentUnassignedCash,
        unassignedCashAfter: newBalances.unassignedCash,
        actualBalanceBefore: currentActualBalance,
        actualBalanceAfter: newBalances.actualBalance,
        envelopeAllocations: allocations,
        notes: paycheckData.notes || "",
      };

      // Save paycheck record to Dexie
      await budgetDb.paycheckHistory.add(paycheckRecord);

      logger.info("Paycheck processing completed successfully", {
        paycheckId: paycheckRecord.id,
        finalBalances: newBalances,
      });

      return paycheckRecord;
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.paychecks });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });
    },
    onError: (error) => {
      logger.error("Paycheck processing failed", error, {
        source: "processPaycheckMutation",
      });
    },
  });

  const deletePaycheckMutation = useMutation({
    mutationKey: ["paychecks", "delete"],
    mutationFn: async (paycheckId) => {
      logger.info("Starting paycheck deletion", { paycheckId });

      // Get paycheck record
      const paycheckRecord = await budgetDb.paycheckHistory.get(paycheckId);
      if (!paycheckRecord) {
        throw new Error("Paycheck record not found");
      }

      // Reverse the balance changes
      const currentMetadata = await getBudgetMetadata();
      const currentActualBalance = currentMetadata?.actualBalance || 0;
      const currentUnassignedCash = currentMetadata?.unassignedCash || 0;

      // Calculate new balances by reversing the paycheck
      const newActualBalance = currentActualBalance - paycheckRecord.amount;
      const unassignedCashChange =
        paycheckRecord.unassignedCashAfter -
        paycheckRecord.unassignedCashBefore;
      const newUnassignedCash = currentUnassignedCash - unassignedCashChange;

      // Update budget metadata
      await setBudgetMetadata({
        actualBalance: newActualBalance,
        unassignedCash: newUnassignedCash,
      });

      // Reverse envelope allocations if any
      if (paycheckRecord.envelopeAllocations?.length > 0) {
        for (const allocation of paycheckRecord.envelopeAllocations) {
          const envelope = await budgetDb.envelopes.get(allocation.envelopeId);
          if (envelope) {
            const newBalance = envelope.currentBalance - allocation.amount;
            await budgetDb.envelopes.update(allocation.envelopeId, {
              currentBalance: Math.max(0, newBalance),
            });
          }
        }
      }

      // Delete the paycheck record
      await budgetDb.paycheckHistory.delete(paycheckId);

      logger.info("Paycheck deleted and effects reversed", {
        paycheckId,
        actualBalanceChange: newActualBalance - currentActualBalance,
        unassignedCashChange: newUnassignedCash - currentUnassignedCash,
      });

      return { success: true, paycheckId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.paychecks });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });
    },
  });

  return {
    processPaycheck: processPaycheckMutation.mutate,
    processPaycheckAsync: processPaycheckMutation.mutateAsync,
    deletePaycheck: deletePaycheckMutation.mutate,
    deletePaycheckAsync: deletePaycheckMutation.mutateAsync,

    isProcessingPaycheck: processPaycheckMutation.isPending,
    isDeletingPaycheck: deletePaycheckMutation.isPending,
  };
};
