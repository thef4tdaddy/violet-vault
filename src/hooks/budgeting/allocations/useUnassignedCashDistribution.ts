import { useState, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUnassignedCash } from "@/hooks/budgeting/metadata/useBudgetMetadata";
import { useEnvelopes } from "@/hooks/budgeting/envelopes/useEnvelopes";
import useBills from "@/hooks/budgeting/transactions/scheduled/expenses/useBills";
import { ENVELOPE_TYPES, AUTO_CLASSIFY_ENVELOPE_TYPE } from "@/constants/categories";
import { budgetDb } from "@/db/budgetDb";
import { queryKeys } from "@/utils/common/queryClient";
import logger from "@/utils/common/logger";
import type { Envelope as DbEnvelope } from "@/db/types";
import {
  calculateTotalBudget,
  createProportionalDistributions,
  createBillPriorityDistributions,
  type EnvelopeRecord,
  type BillRecord,
} from "./useUnassignedCashDistributionHelpers";

// Type for distribution state
type Distributions = Record<string, number>;

// Type for distribution preview item
export type DistributionPreviewItem = EnvelopeRecord & {
  distributionAmount: number;
  newBalance: number;
};

/**
 * Custom hook for managing unassigned cash distribution logic
 */
const useUnassignedCashDistribution = () => {
  const { unassignedCash, updateUnassignedCash } = useUnassignedCash();
  const { envelopes: rawEnvelopes } = useEnvelopes();
  const { bills = [] } = useBills();
  const queryClient = useQueryClient();

  // state
  const [distributions, setDistributions] = useState<Distributions>({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // memos
  const envelopeList = useMemo<EnvelopeRecord[]>(
    () => (rawEnvelopes ?? []).map((env) => env as EnvelopeRecord),
    [rawEnvelopes]
  );

  const billList = useMemo<BillRecord[]>(
    () => (bills ?? []).map((bill) => bill as unknown as BillRecord),
    [bills]
  );

  const totalDistributed = useMemo(() => {
    return Object.values(distributions).reduce<number>((sum, amount) => {
      return sum + (parseFloat(String(amount)) || 0);
    }, 0);
  }, [distributions]);

  const remainingCash = useMemo(() => {
    const cash = Number(unassignedCash) || 0;
    return cash - totalDistributed;
  }, [unassignedCash, totalDistributed]);

  // callbacks
  const updateDistribution = useCallback((envelopeId: string, amount: string | number) => {
    const numericAmount = parseFloat(String(amount)) || 0;
    setDistributions((prev) => ({ ...prev, [envelopeId]: Math.max(0, numericAmount) }));
  }, []);

  const clearDistributions = useCallback(() => setDistributions({}), []);

  const distributeEqually = useCallback(() => {
    if (envelopeList.length === 0) return;
    const amountPerEnvelope = Math.floor((unassignedCash * 100) / envelopeList.length) / 100;
    const newDistributions: Distributions = {};
    envelopeList.forEach((env) => {
      newDistributions[env.id] = amountPerEnvelope;
    });
    setDistributions(newDistributions);
  }, [envelopeList, unassignedCash]);

  const distributeProportionally = useCallback(() => {
    if (envelopeList.length === 0) return;
    const totalBudget = calculateTotalBudget(envelopeList);
    if (totalBudget === 0) {
      distributeEqually();
      return;
    }
    setDistributions(createProportionalDistributions(envelopeList, unassignedCash, totalBudget));
  }, [envelopeList, unassignedCash, distributeEqually]);

  const distributeBillPriority = useCallback(() => {
    if (envelopeList.length === 0) return;
    const billEnvelopes = envelopeList.filter((envelope) => {
      const type =
        (envelope as unknown as Record<string, string>).envelopeType ||
        AUTO_CLASSIFY_ENVELOPE_TYPE(envelope.category);
      return type === ENVELOPE_TYPES.BILL;
    });
    if (billEnvelopes.length === 0) return;
    setDistributions(createBillPriorityDistributions(billEnvelopes, billList, unassignedCash));
  }, [envelopeList, unassignedCash, billList]);

  const applyDistribution = useCallback(async () => {
    if (totalDistributed <= 0) return;
    setIsProcessing(true);
    try {
      const updates: EnvelopeRecord[] = [];
      Object.entries(distributions).forEach(([id, amount]) => {
        const amt = parseFloat(String(amount)) || 0;
        const env = envelopeList.find((e) => e.id === id);
        if (amt > 0 && env) {
          updates.push({ ...env, currentBalance: (env.currentBalance || 0) + amt });
        }
      });
      if (updates.length > 0) {
        await budgetDb.bulkUpsertEnvelopes(updates as DbEnvelope[]);
        await updateUnassignedCash(remainingCash, {
          author: "Family Member",
          source: "distribution",
        });
        queryClient.invalidateQueries({ queryKey: [queryKeys.envelopes] });
      }
      setDistributions({});
    } catch (e) {
      logger.error("Error applying distribution:", e);
    } finally {
      setIsProcessing(false);
    }
  }, [
    totalDistributed,
    distributions,
    envelopeList,
    queryClient,
    updateUnassignedCash,
    remainingCash,
  ]);

  const getDistributionPreview = useCallback((): DistributionPreviewItem[] => {
    return envelopeList
      .map((envelope) => {
        const distributionAmount = distributions[envelope.id] || 0;
        return {
          ...envelope,
          distributionAmount,
          newBalance: (envelope.currentBalance || 0) + distributionAmount,
        };
      })
      .filter((envelope) => envelope.distributionAmount > 0);
  }, [envelopeList, distributions]);

  return {
    distributions,
    isProcessing,
    totalDistributed,
    remainingCash,
    isValidDistribution: totalDistributed > 0,
    resetDistributions: useCallback(() => {
      setDistributions({});
      setIsProcessing(false);
    }, []),
    updateDistribution,
    clearDistributions,
    distributeEqually,
    distributeProportionally,
    distributeBillPriority,
    applyDistribution,
    envelopes: envelopeList,
    bills: billList,
    unassignedCash,
    getDistributionPreview,
  };
};

export default useUnassignedCashDistribution;
