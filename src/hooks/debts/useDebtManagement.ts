import { useMemo } from "react";
import { useDebts } from "./useDebts";
import useBills from "@/hooks/bills/useBills";
import useEnvelopes from "@/hooks/budgeting/useEnvelopes";
import useTransactions from "@/hooks/common/useTransactions";
import type { DebtType, DebtAccount } from "@/types/debt";
import {
  DEBT_TYPES,
  DEBT_STATUS,
  PAYMENT_FREQUENCIES,
  COMPOUND_FREQUENCIES,
  calculateDebtStats,
} from "@/constants/debts";
import {
  getUpcomingPayments,
} from "@/utils/debts/debtCalculations";
import logger from "@/utils/common/logger";
import {
  enrichDebtsWithRelations,
  createDebtOperation,
  recordPaymentOperation,
  linkDebtToBillOperation,
  syncDebtDueDatesOperation,
  updateDebtOperation,
  deleteDebtOperation,
} from "./helpers/debtManagementHelpers";

/**
 * Business logic hook for debt management
 * Handles relationships between debts, bills, envelopes, and transactions
 */
export const useDebtManagement = () => {
  // Get data dependencies
  const debtsHook = useDebts();
  const { bills = [], addBill: createBill, updateBill, deleteBill } = useBills();
  const { envelopes = [], addEnvelope: createEnvelope } = useEnvelopes();
  const { transactions = [], addTransaction: createTransaction } = useTransactions();

  const debts = useMemo(() => debtsHook?.debts || [], [debtsHook?.debts]);
  const createDebtData = debtsHook?.addDebtAsync;
  const updateDebtData = debtsHook?.updateDebtAsync;
  const deleteDebtData = debtsHook?.deleteDebtAsync;

  // Enrich debts with related data and calculations FIRST
  const enrichedDebts = useMemo(() => {
    return enrichDebtsWithRelations(debts, bills as unknown[], envelopes as unknown[], transactions as unknown[]);
  }, [debts, bills, envelopes, transactions]);

  // Calculate debt statistics using enriched debts
  const debtStats = useMemo(() => {
    if (!enrichedDebts?.length) {
      const emptyStats = {
        totalDebt: 0,
        totalMonthlyPayments: 0,
        averageInterestRate: 0,
        debtsByType: {} as Record<DebtType, DebtAccount[]>,
        totalInterestPaid: 0,
        activeDebtCount: 0,
        totalDebtCount: 0,
        dueSoonAmount: 0,
        dueSoonCount: 0,
      };
      logger.debug("📊 Using empty debt stats (no enriched debts):", emptyStats);
      return emptyStats;
    }

    const calculatedStats = calculateDebtStats(enrichedDebts);
    logger.debug("📊 Calculated debt stats:", {
      inputDebtsCount: enrichedDebts.length,
      calculatedStats,
      firstDebtBalance: enrichedDebts[0]?.balance,
      firstDebtMinPayment: enrichedDebts[0]?.minimumPayment,
    });

    return calculatedStats;
  }, [enrichedDebts]);

  // Group debts by status and type for easy filtering
  const debtsByStatus = useMemo(() => {
    const grouped = {};
    Object.values(DEBT_STATUS).forEach((status) => {
      grouped[status] = enrichedDebts.filter((debt) => debt.status === status);
    });
    return grouped;
  }, [enrichedDebts]);

  const debtsByType = useMemo(() => {
    const grouped = {};
    Object.values(DEBT_TYPES).forEach((type) => {
      grouped[type] = enrichedDebts.filter((debt) => debt.type === type);
    });
    return grouped;
  }, [enrichedDebts]);

  // Create a new debt with optional bill and envelope integration
  const createDebt = async (debtData: Record<string, unknown>) => {
    return createDebtOperation(debtData, {
      connectionData: debtData.connectionData as Record<string, unknown> | undefined,
      createEnvelope: createEnvelope as (data: Record<string, unknown>) => Promise<void>,
      createBill: createBill as (data: Record<string, unknown>) => void,
      updateBill: updateBill as (id: string, data: Record<string, unknown>) => void,
      createDebtData: createDebtData as (data: Record<string, unknown>) => Promise<unknown>,
    });
  };

  // Record a debt payment
  const recordPayment = async (debtId: string, paymentData: Record<string, unknown>) => {
    const debt = debts.find((d: { id: string }) => d.id === debtId);
    if (!debt) throw new Error("Debt not found");

    return recordPaymentOperation({
      debt,
      paymentData,
      updateDebtData: updateDebtData as (id: string, data: Record<string, unknown>) => Promise<unknown>,
      createTransaction: createTransaction as (data: Record<string, unknown>) => void,
    });
  };

  // Link debt to an existing bill
  const linkDebtToBill = async (debtId: string, billId: string) => {
    return linkDebtToBillOperation({
      debtId,
      billId,
      debts: debts as unknown[],
      bills: bills as unknown[],
      updateBill: updateBill as (id: string, data: Record<string, unknown>) => void,
      updateDebtData: updateDebtData as (id: string, data: Record<string, unknown>) => Promise<unknown>,
    });
  };

  // Sync debt due dates with linked bills
  const syncDebtDueDates = async () => {
    return syncDebtDueDatesOperation({
      debts: debts as unknown[],
      bills: bills as unknown[],
      updateDebtData: updateDebtData as unknown as (id: string, data: Record<string, unknown>) => Promise<unknown>,
    });
  };

  // Update a debt with proper parameter formatting
  const updateDebt = async (debtId: string, updates: Record<string, unknown>, author = "Unknown User") => {
    return updateDebtOperation({
      debtId,
      updates,
      author,
      updateDebtData: updateDebtData as unknown as (id: string, data: Record<string, unknown>) => Promise<unknown>,
    });
  };

  // Delete a debt and its related connections
  const deleteDebt = async (debtId: string) => {
    return deleteDebtOperation({
      debtId,
      bills: bills as unknown[],
      deleteBill: deleteBill as unknown as (id: string) => Promise<void>,
      deleteDebtData: deleteDebtData as unknown as (id: string) => Promise<unknown>,
    });
  };

  // Get upcoming payments
  const getUpcomingPaymentsData = (daysAhead = 30) => {
    return getUpcomingPayments(enrichedDebts, daysAhead);
  };

  return {
    // Data
    debts: enrichedDebts,
    debtStats,
    debtsByStatus,
    debtsByType,

    // Actions
    createDebt,
    updateDebt,
    deleteDebt,
    recordPayment,
    linkDebtToBill,
    syncDebtDueDates,

    // Utilities
    getUpcomingPayments: getUpcomingPaymentsData,

    // Constants
    DEBT_TYPES,
    DEBT_STATUS,
    PAYMENT_FREQUENCIES,
    COMPOUND_FREQUENCIES,
  };
};
