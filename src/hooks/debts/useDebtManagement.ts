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

// Factory helpers to create lightweight wrappers outside the hook to reduce function length
const makeCreateEnvelopeWrapper =
  (fn: (...args: unknown[]) => unknown) =>
  async (data: unknown): Promise<{ id: string }> => {
    const res = await Promise.resolve(fn(data) as unknown);
    return res as unknown as { id: string };
  };

const makeCreateBillWrapper =
  (fn: (...args: unknown[]) => unknown) =>
  async (data: unknown): Promise<HelperBill> => {
    const res = await Promise.resolve(fn(data) as unknown);
    const raw = res as unknown as Record<string, unknown>;
    const rawDue = raw.dueDate as unknown;
    const dueDate =
      typeof rawDue === "string"
        ? (rawDue as string)
        : rawDue instanceof Date
          ? (rawDue as Date).toISOString()
          : undefined;
    const transformed: HelperBill = {
      ...raw,
      dueDate,
    } as HelperBill;
    return transformed;
  };

const makeUpdateBillWrapper =
  (fn: (...args: unknown[]) => unknown) =>
  async (id: string, data: unknown): Promise<void> => {
    await Promise.resolve(fn({ billId: id, updates: data as Record<string, unknown> }));
  };

const makeCreateTransactionWrapper =
  (fn: (...args: unknown[]) => unknown) =>
  async (data: unknown): Promise<void> => {
    await Promise.resolve(fn(data));
  };

export const useDebtManagement = () => {
  const debtsHook = useDebts();
  const { bills = [], addBillAsync, updateBillAsync, deleteBillAsync } = useBills();
  // Normalize DB bill shapes to helper-friendly shapes (convert Date dueDate -> string)
  const normalizedBills = (bills || []).map((b) => ({
    ...b,
    dueDate: b.dueDate
      ? typeof b.dueDate === "string"
        ? b.dueDate
        : (b.dueDate as Date).toISOString()
      : undefined,
  }));
  const { envelopes = [], addEnvelope: createEnvelope, addEnvelopeAsync } = useEnvelopes();
  const { transactions = [], addTransaction: createTransaction } = useTransactions();

  // Helper wrappers to adapt external hooks' APIs to the helper expectations
  // Prefer async variants when available (addEnvelopeAsync may be provided by the envelopes hook)
  const createEnvelopeWrapper = makeCreateEnvelopeWrapper(addEnvelopeAsync || createEnvelope);
  const createBillWrapper = makeCreateBillWrapper(addBillAsync);
  const updateBillWrapper = makeUpdateBillWrapper(updateBillAsync);
  const createTransactionWrapper = makeCreateTransactionWrapper(createTransaction);

  const debts = useMemo(() => debtsHook?.debts || [], [debtsHook?.debts]);
  const createDebtData = debtsHook?.addDebtAsync;
  const updateDebtData = debtsHook?.updateDebtAsync;
  const deleteDebtData = debtsHook?.deleteDebtAsync;

  const enrichedDebts = useMemo(() => {
    return enrichDebtsWithRelations(
      debts as unknown as DebtForHelper[],
      normalizedBills as unknown as HelperBill[],
      envelopes as Envelope[],
      transactions as TransactionWithDebtId[]
    );
  }, [debts, envelopes, transactions, normalizedBills]);

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
      updateDebtData: (params) => updateDebtData(params),
      createTransaction: (data) => createTransactionWrapper(data),
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
      updateDebtData: (params) => updateDebtData(params),
    });
  };

  const syncDebtDueDates = async () => {
    if (!updateDebtData) throw new Error("Update debt function not available");
    return syncDebtDueDatesOperation({
      debts: debts as unknown as DebtForHelper[],
      bills: normalizedBills as unknown as HelperBill[],
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
    const transformedBills = (bills || []).map((bill) => {
      const tb = makeRecordCompatible(transformBillFromDB(bill) as BillWithDebtId);
      return {
        ...tb,
        dueDate: tb.dueDate
          ? typeof tb.dueDate === "string"
            ? tb.dueDate
            : (tb.dueDate as Date).toISOString()
          : undefined,
      } as unknown as HelperBill & Record<string, unknown>;
    });

    await deleteDebtOperation({
      debtId,
      bills: transformedBills as unknown as HelperBill[],
      deleteBill: (id) => deleteBillAsync(id).then(() => {}),
      deleteDebtData: (params) => deleteDebtData(params),
    });
    return;
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
