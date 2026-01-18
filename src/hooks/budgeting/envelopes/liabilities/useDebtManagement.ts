import { useMemo } from "react";
import { useDebts } from "./useDebts";
import useBills from "@/hooks/budgeting/transactions/scheduled/expenses/useBills";
import useEnvelopes from "@/hooks/budgeting/envelopes/useEnvelopes";
import { useTransactionQuery } from "@/hooks/budgeting/transactions/useTransactionQuery";
import { useTransactionOperations } from "@/hooks/budgeting/transactions/useTransactionOperations";
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
import { getUpcomingPayments } from "@/utils/domain/debts/debtCalculations";
import { makeRecordCompatible, transformBillFromDB } from "@/utils/core/common/typeTransforms";
import {
  enrichDebtsWithRelations,
  createDebtOperation,
  recordPaymentOperation,
  linkDebtToBillOperation,
  syncDebtDueDatesOperation,
  updateDebtOperation,
  deleteDebtOperation,
  createAPIWrappers,
  groupDebtsByStatus,
  groupDebtsByType,
} from "./helpers/debtManagementHelpers";

// Helper types to bridge inconsistencies
type BillWithDebtId = Bill & { debtId?: string };
// Helper bill shape expected by debt helpers (dueDate as string)
type HelperBill = {
  id: string;
  debtId?: string;
  envelopeId?: string;
  amount?: number;
  dueDate?: string;
  name?: string;
  category?: string;
  isPaid?: boolean;
  isRecurring?: boolean;
  frequency?: string;
  lastModified?: number;
  [key: string]: unknown;
};
type TransactionWithDebtId = Transaction & { debtId?: string };
type DebtForHelper = DebtAccount & { currentBalance: number };

// Connection data + payload types (restore missing types)
interface ConnectionData {
  paymentMethod?: string;
  createBill?: boolean;
  existingBillId?: string;
  newEnvelopeName?: string;
}

type CreateDebtPayload = DebtFormData & { connectionData?: ConnectionData; paymentDueDate: string };

// eslint-disable-next-line max-lines-per-function, max-statements -- Complex hook managing debt operations, bill/envelope connections, and data transformations
export const useDebtManagement = () => {
  const debtsHook = useDebts();
  const { bills = [], addBillAsync, updateBillAsync, deleteBillAsync } = useBills();
  const normalizedBills = (bills || []).map((b) => {
    // Adapter: BillTransaction has 'date', Debt helpers expect 'dueDate'
    const record = b as unknown as Record<string, unknown>;
    const dateVal =
      b.date ||
      (typeof record.dueDate === "string" || record.dueDate instanceof Date
        ? record.dueDate
        : undefined);
    return {
      ...b,
      dueDate: dateVal
        ? typeof dateVal === "string"
          ? dateVal
          : (dateVal as Date).toISOString()
        : undefined,
    };
  });
  const { envelopes = [], addEnvelope: createEnvelope, addEnvelopeAsync } = useEnvelopes();
  const { transactions = [] } = useTransactionQuery();
  const { addTransaction: createTransaction } = useTransactionOperations();

  const { createEnvelopeWrapper, createBillWrapper, updateBillWrapper, createTransactionWrapper } =
    createAPIWrappers(
      addEnvelopeAsync as unknown as (data: unknown) => unknown,
      createEnvelope as unknown as (data: unknown) => unknown,
      addBillAsync as never,
      (id: string, updates: unknown) =>
        updateBillAsync({ billId: id, updates: updates as Record<string, unknown> }),
      createTransaction as never
    );

  const debts = useMemo(() => debtsHook?.debts || [], [debtsHook?.debts]);

  // Wrap mutation functions to match expected types
  const createDebtDataWrapper = () => {
    if (!debtsHook?.addDebtAsync) return undefined;
    return async (data: {
      name: string;
      minimumPayment: number;
      paymentDueDate: string;
      paymentFrequency: string;
      currentBalance?: number;
      interestRate?: number;
    }) => {
      const result = await debtsHook.addDebtAsync(data as { [key: string]: unknown });
      return { id: result.id };
    };
  };

  const updateDebtDataWrapper = () => {
    if (!debtsHook?.updateDebtAsync) return undefined;
    return (async (params: {
      id: string;
      updates:
        | {
            id: string;
            name: string;
            currentBalance: number;
            minimumPayment: number;
            [key: string]: unknown;
          }
        | Partial<{
            id: string;
            name: string;
            currentBalance: number;
            minimumPayment: number;
            [key: string]: unknown;
          }>;
      author?: string;
    }) => {
      await debtsHook.updateDebtAsync({
        id: params.id,
        updates: params.updates as Record<string, unknown>,
        author: params.author,
      });
    }) as unknown as (params: {
      id: string;
      updates: {
        id: string;
        name: string;
        currentBalance: number;
        minimumPayment: number;
        [key: string]: unknown;
      };
    }) => Promise<void>;
  };

  const deleteDebtDataWrapper = () => {
    if (!debtsHook?.deleteDebtAsync) return undefined;
    return async (params: { id: string }) => {
      await debtsHook.deleteDebtAsync(params);
    };
  };

  const createDebtData = createDebtDataWrapper();
  const updateDebtData = updateDebtDataWrapper();
  const deleteDebtData = deleteDebtDataWrapper();

  const enrichedDebts = useMemo(
    () =>
      enrichDebtsWithRelations(
        debts as unknown as DebtForHelper[],
        normalizedBills as unknown as HelperBill[],
        envelopes as Envelope[],
        transactions as TransactionWithDebtId[]
      ),
    [debts, envelopes, transactions, normalizedBills]
  );

  const debtStats = useMemo(
    () =>
      enrichedDebts?.length
        ? calculateDebtStats(enrichedDebts)
        : {
            totalDebt: 0,
            totalMonthlyPayments: 0,
            averageInterestRate: 0,
            debtsByType: {} as Record<DebtType, DebtAccount[]>,
            totalInterestPaid: 0,
            activeDebtCount: 0,
            totalDebtCount: 0,
            dueSoonAmount: 0,
            dueSoonCount: 0,
          },
    [enrichedDebts]
  );

  const debtsByStatus = useMemo(
    () => groupDebtsByStatus(enrichedDebts, DEBT_STATUS),
    [enrichedDebts]
  );

  const debtsByType = useMemo(() => groupDebtsByType(enrichedDebts, DEBT_TYPES), [enrichedDebts]);

  const createDebt = async (debtData: CreateDebtPayload) => {
    if (!createDebtData || !addBillAsync) throw new Error("Create functions not available");
    return createDebtOperation(debtData, {
      connectionData: debtData.connectionData,
      createEnvelope: createEnvelopeWrapper,
      createBill: createBillWrapper,
      updateBill: updateBillWrapper,
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
      updateDebtData: updateDebtData as never,
      createTransaction: createTransactionWrapper,
    });
  };

  const linkDebtToBill = async (debtId: string, billId: string) => {
    if (!updateDebtData || !updateBillAsync) throw new Error("Update functions not available");
    return linkDebtToBillOperation({
      debtId,
      billId,
      debts: debts as unknown as DebtForHelper[],
      bills: normalizedBills as unknown as HelperBill[],
      updateBill: updateBillWrapper,
      updateDebtData: updateDebtData as never,
    });
  };

  const syncDebtDueDates = async () => {
    if (!updateDebtData) throw new Error("Update debt function not available");
    return syncDebtDueDatesOperation({
      debts: debts as unknown as DebtForHelper[],
      bills: normalizedBills as unknown as HelperBill[],
      updateDebtData: updateDebtData as never,
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
      updateDebtData: updateDebtData as never,
    });
  };

  const transformBillsForDelete = () => {
    return (bills || []).map((bill) => {
      const tb = makeRecordCompatible(
        transformBillFromDB(bill as unknown as import("@/db/types").Bill) as BillWithDebtId
      );
      return {
        ...tb,
        dueDate: tb.dueDate
          ? typeof tb.dueDate === "string"
            ? tb.dueDate
            : (tb.dueDate as Date).toISOString()
          : undefined,
      } as unknown as HelperBill & Record<string, unknown>;
    });
  };

  const deleteDebt = async (debtId: string) => {
    if (!deleteDebtData || !deleteBillAsync) throw new Error("Delete functions not available");
    const transformedBills = transformBillsForDelete();
    await deleteDebtOperation({
      debtId,
      bills: transformedBills as unknown as HelperBill[],
      deleteBill: (id) => deleteBillAsync(id).then(() => {}),
      deleteDebtData,
    });
  };

  const getUpcomingPaymentsData = (daysAhead = 30) => getUpcomingPayments(enrichedDebts, daysAhead);

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
