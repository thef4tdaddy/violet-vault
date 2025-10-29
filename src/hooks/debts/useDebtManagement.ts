import { useMemo } from "react";
import { useDebts } from "./useDebts";
import useBills from "@/hooks/bills/useBills";
import useEnvelopes from "@/hooks/budgeting/useEnvelopes";
import useTransactions from "@/hooks/common/useTransactions";
import type { DebtType, DebtAccount, DebtFormData } from "@/types/debt";
import type { Bill } from "@/db/types"; // Correct Bill type from Dexie
import type { Envelope } from "@/db/types";
import type { Transaction } from "@/db/types";
import {
  DEBT_TYPES,
  DEBT_STATUS,
  PAYMENT_FREQUENCIES,
  COMPOUND_FREQUENCIES,
  calculateDebtStats,
} from "@/constants/debts";
import { getUpcomingPayments } from "@/utils/debts/debtCalculations";
import { makeRecordCompatible, transformBillFromDB } from "@/utils/common/typeTransforms";
import {
  enrichDebtsWithRelations,
  createDebtOperation,
  recordPaymentOperation,
  linkDebtToBillOperation,
  syncDebtDueDatesOperation,
  updateDebtOperation,
  deleteDebtOperation,
} from "./helpers/debtManagementHelpers";

// Helper types to bridge inconsistencies
type BillWithDebtId = Bill & { debtId?: string };
type TransactionWithDebtId = Transaction & { debtId?: string };
type DebtForHelper = DebtAccount & { currentBalance: number };

interface ConnectionData {
  paymentMethod?: string;
  createBill?: boolean;
  existingBillId?: string;
  newEnvelopeName?: string;
}

type CreateDebtPayload = DebtFormData & { connectionData?: ConnectionData; paymentDueDate: string };

export const useDebtManagement = () => {
  const debtsHook = useDebts();
  const { bills = [], addBillAsync, updateBillAsync, deleteBillAsync } = useBills();
  const { envelopes = [], addEnvelope: createEnvelope } = useEnvelopes();
  const { transactions = [], addTransaction: createTransaction } = useTransactions();

  const debts = useMemo(() => debtsHook?.debts || [], [debtsHook?.debts]);
  const createDebtData = debtsHook?.addDebtAsync;
  const updateDebtData = debtsHook?.updateDebtAsync;
  const deleteDebtData = debtsHook?.deleteDebtAsync;

  const enrichedDebts = useMemo(() => {
    return enrichDebtsWithRelations(
      debts as unknown as DebtForHelper[],
      bills as unknown as BillWithDebtId[],
      envelopes as Envelope[],
      transactions as TransactionWithDebtId[]
    );
  }, [debts, bills, envelopes, transactions]);

  const debtStats = useMemo(() => {
    if (!enrichedDebts?.length) {
      return {
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
    }
    return calculateDebtStats(enrichedDebts);
  }, [enrichedDebts]);

  const debtsByStatus = useMemo(() => {
    const grouped: Record<string, DebtAccount[]> = {};
    Object.values(DEBT_STATUS).forEach((status) => {
      grouped[status] = enrichedDebts.filter((debt) => debt.status === status);
    });
    return grouped;
  }, [enrichedDebts]);

  const debtsByType = useMemo(() => {
    const grouped: Record<string, DebtAccount[]> = {};
    Object.values(DEBT_TYPES).forEach((type) => {
      grouped[type] = enrichedDebts.filter((debt) => debt.type === type);
    });
    return grouped;
  }, [enrichedDebts]);

  const createDebt = async (debtData: CreateDebtPayload) => {
    if (!createDebtData || !addBillAsync) throw new Error("Create functions not available");
    return createDebtOperation(debtData, {
      connectionData: debtData.connectionData,
      createEnvelope,
      createBill: (data) => addBillAsync(data),
      updateBill: (id, data) => updateBillAsync({ billId: id, updates: data }),
      createDebtData,
    });
  };

  const recordPayment = async (
    debtId: string,
    paymentData: { amount: number; paymentDate: string; notes?: string }
  ) => {
    if (!updateDebtData) throw new Error("Update debt function not available");
    const debt = debts.find((d) => d.id === debtId);
    if (!debt) throw new Error("Debt not found");

    return recordPaymentOperation({
      debt: debt as unknown as DebtForHelper,
      paymentData,
      updateDebtData: (params) => updateDebtData(params),
      createTransaction: (data) => createTransaction(data),
    });
  };

  const linkDebtToBill = async (debtId: string, billId: string) => {
    if (!updateDebtData || !updateBillAsync) throw new Error("Update functions not available");
    return linkDebtToBillOperation({
      debtId,
      billId,
      debts: debts as unknown as DebtForHelper[],
      bills: bills as unknown as BillWithDebtId[],
      updateBill: (id, data) => updateBillAsync({ billId: id, updates: data }),
      updateDebtData: (params) => updateDebtData(params),
    });
  };

  const syncDebtDueDates = async () => {
    if (!updateDebtData) throw new Error("Update debt function not available");
    return syncDebtDueDatesOperation({
      debts: debts as unknown as DebtForHelper[],
      bills: bills as unknown as BillWithDebtId[],
      updateDebtData: (params) => updateDebtData(params),
    });
  };

  const updateDebt = async (
    debtId: string,
    updates: Partial<DebtAccount>,
    author = "Unknown User"
  ) => {
    if (!updateDebtData) throw new Error("Update debt function not available");
    return updateDebtOperation({
      debtId,
      updates,
      author,
      updateDebtData: (params) => updateDebtData(params),
    });
  };

  const deleteDebt = async (debtId: string) => {
    if (!deleteDebtData || !deleteBillAsync) throw new Error("Delete functions not available");
    const transformedBills = bills.map((bill) =>
      makeRecordCompatible(transformBillFromDB(bill) as BillWithDebtId)
    );

    const result = await deleteDebtOperation({
      debtId,
      bills: transformedBills,
      deleteBill: (id) => deleteBillAsync(id),
      deleteDebtData: (params) => deleteDebtData(params),
    });
    return result;
  };

  const getUpcomingPaymentsData = (daysAhead = 30) => {
    return getUpcomingPayments(enrichedDebts, daysAhead);
  };

  return {
    debts: enrichedDebts,
    debtStats,
    debtsByStatus,
    debtsByType,
    createDebt,
    updateDebt,
    deleteDebt,
    recordPayment,
    linkDebtToBill,
    syncDebtDueDates,
    getUpcomingPayments: getUpcomingPaymentsData,
    DEBT_TYPES,
    DEBT_STATUS,
    PAYMENT_FREQUENCIES,
    COMPOUND_FREQUENCIES,
  };
};
