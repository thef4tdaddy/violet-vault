/**
 * Helper functions for debt management operations
 * Extracted to reduce complexity in useDebtManagement
 */
import logger from "@/utils/core/common/logger";
import {
  convertPaymentFrequency,
  calculateInterestPortion,
  enrichDebt,
} from "@/utils/domain/debts/debtCalculations";
import { DEBT_STATUS } from "@/constants/debts";
import type { PaymentFrequency, DebtAccount } from "@/types/debt";

interface DebtData {
  name: string;
  minimumPayment: number;
  paymentDueDate: string;
  paymentFrequency: string;
  currentBalance?: number;
  interestRate?: number;
}
interface CreatedDebt {
  id: string;
}
interface Envelope {
  id: string;
}
interface Bill {
  id: string;
  debtId?: string;
  envelopeId?: string;
  amount?: number;
  dueDate?: string;
}
interface Debt {
  id: string;
  name: string;
  currentBalance: number;
  minimumPayment: number;
  paymentDueDate?: string;
  interestRate?: number;
  status?: string;
  envelopeId?: string;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  paymentHistory?: Array<{
    date: string;
    amount: number;
    interestPortion: number;
    principalPortion: number;
    balanceAfter: number;
    notes: string;
  }>;
}
interface ConnectionData {
  paymentMethod?: string;
  createBill?: boolean;
  existingBillId?: string;
  newEnvelopeName?: string;
}

interface BillConnectionOptions {
  connectionData: ConnectionData | null;
  cleanDebtData: DebtData;
  createdDebt: CreatedDebt;
  createEnvelope: (data: {
    name: string;
    targetAmount: number;
    currentBalance: number;
    category: string;
  }) => Promise<Envelope>;
  createBill: (data: {
    name: string;
    amount: number;
    dueDate: string;
    frequency: string;
    envelopeId: string;
    debtId: string;
    isActive: boolean;
  }) => Promise<Bill>;
  updateBill: (id: string, data: { debtId: string }) => Promise<void>;
}

interface CreateDebtOptions {
  connectionData?: ConnectionData;
  createEnvelope: BillConnectionOptions["createEnvelope"];
  createBill: BillConnectionOptions["createBill"];
  updateBill: BillConnectionOptions["updateBill"];
  createDebtData: (data: DebtData) => Promise<CreatedDebt>;
}

interface RecordPaymentOptions {
  debt: Debt;
  paymentData: { amount: number; paymentDate: string; notes?: string };
  updateDebtData: (params: { id: string; updates: Debt }) => Promise<void>;
  createTransaction: (data: {
    amount: number;
    description: string;
    category: string;
    debtId: string;
    date: string;
    notes: string;
    envelopeId: string;
  }) => Promise<void>;
}
interface LinkDebtToBillOptions {
  debtId: string;
  billId: string;
  debts: Debt[];
  bills: Bill[];
  updateBill: (id: string, data: { debtId: string; amount: number }) => Promise<void>;
  updateDebtData: (params: { id: string; updates: Partial<Debt> }) => Promise<void>;
}
interface SyncDebtDueDatesOptions {
  debts: Debt[];
  bills: Bill[];
  updateDebtData: (params: { id: string; updates: Partial<Debt> }) => Promise<void>;
}
interface UpdateDebtOptions {
  debtId: string;
  updates: Partial<Debt>;
  author?: string;
  updateDebtData: (params: {
    id: string;
    updates: Partial<Debt>;
    author?: string;
  }) => Promise<void>;
}
interface DeleteDebtOptions {
  debtId: string;
  bills: Bill[];
  deleteBill: (id: string) => Promise<void>;
  deleteDebtData: (params: { id: string }) => Promise<void>;
}

/**
 * Create envelope and bill for new debt
 */
export const createEnvelopeAndBillForDebt = async (
  cleanDebtData: DebtData,
  createdDebt: CreatedDebt,
  newEnvelopeName: string,
  createEnvelope: BillConnectionOptions["createEnvelope"],
  createBill: BillConnectionOptions["createBill"]
) => {
  const envelopeName = newEnvelopeName || `${cleanDebtData.name} Payment`;

  const newEnvelope = await createEnvelope({
    name: envelopeName,
    targetAmount: cleanDebtData.minimumPayment * 2,
    currentBalance: 0,
    category: "Fixed Expenses",
  });

  await createBill({
    name: `${cleanDebtData.name} Payment`,
    amount: cleanDebtData.minimumPayment,
    dueDate: cleanDebtData.paymentDueDate,
    frequency: convertPaymentFrequency(cleanDebtData.paymentFrequency as PaymentFrequency),
    envelopeId: newEnvelope.id,
    debtId: createdDebt.id,
    isActive: true,
  });

  logger.info("Created new envelope and bill for debt");
};

/**
 * Handle bill connections for debt
 */
export const handleBillConnectionsForDebt = async (options: BillConnectionOptions) => {
  const { connectionData, cleanDebtData, createdDebt, createEnvelope, createBill, updateBill } =
    options;

  if (!connectionData) return;

  const {
    paymentMethod,
    createBill: shouldCreateBill,
    existingBillId,
    newEnvelopeName,
  } = connectionData;

  if (paymentMethod === "create_new" && shouldCreateBill) {
    await createEnvelopeAndBillForDebt(
      cleanDebtData,
      createdDebt,
      newEnvelopeName || "",
      createEnvelope,
      createBill
    );
  } else if (paymentMethod === "connect_existing_bill" && existingBillId) {
    await updateBill(existingBillId, { debtId: createdDebt.id });
    logger.info("Connected debt to existing bill");
  }
};

/**
 * Build debt with payment history
 */
export const buildDebtWithPayment = (
  debt: Debt,
  paymentInfo: {
    amount: number;
    paymentDate: string;
    interestPortion: number;
    principalPortion: number;
    notes?: string;
  }
): Debt => {
  const { amount, paymentDate, interestPortion, principalPortion, notes } = paymentInfo;
  const newBalance = Math.max(0, debt.currentBalance - principalPortion);
  const updatedDebt: Debt = {
    ...debt,
    currentBalance: newBalance,
    lastPaymentDate: paymentDate,
    lastPaymentAmount: amount,
    status: newBalance === 0 ? DEBT_STATUS.PAID_OFF : debt.status,
  };

  if (!updatedDebt.paymentHistory) {
    updatedDebt.paymentHistory = [];
  }

  updatedDebt.paymentHistory.push({
    date: paymentDate,
    amount,
    interestPortion,
    principalPortion,
    balanceAfter: newBalance,
    notes: notes || "",
  });

  return updatedDebt;
};

/**
 * Create a new debt with optional bill and envelope integration
 */
export const createDebtOperation = async (
  debtData: DebtData & { connectionData?: ConnectionData },
  options: CreateDebtOptions
) => {
  const { connectionData, createEnvelope, createBill, updateBill, createDebtData } = options;

  try {
    logger.info("Creating debt with data", {
      debtData: debtData as unknown as Record<string, unknown>,
    });

    const { connectionData: _, ...cleanDebtData } = debtData;
    const createdDebt = await createDebtData(cleanDebtData);
    logger.info("Debt created", { createdDebt: createdDebt as unknown as Record<string, unknown> });

    await handleBillConnectionsForDebt({
      connectionData: connectionData || null,
      cleanDebtData,
      createdDebt,
      createEnvelope,
      createBill,
      updateBill,
    });

    return createdDebt;
  } catch (error) {
    logger.error("Error creating debt:", error);
    throw error;
  }
};

/**
 * Resolve envelope ID for a debt, checking direct link or bill relationship
 */
const resolveEnvelopeForDebt = async (debt: Debt): Promise<string> => {
  const { budgetDb } = await import("@/db/budgetDb");
  let envelopeId = debt.envelopeId;

  // In Unified Schema, Debt is a LiabilityEnvelope, so it IS the envelope.
  // We double check if debt.envelopeId exists (legacy link) or use debt.id.
  if (!envelopeId) {
    envelopeId = debt.id;
  }

  // Envelope is REQUIRED - all transactions must route through envelopes
  if (!envelopeId || envelopeId.trim() === "") {
    throw new Error(
      `Debt payment requires an envelope. Debt "${debt.name}" must be linked to an envelope (directly or through a bill).`
    );
  }

  // Validate envelope exists
  const envelope = await budgetDb.envelopes.get(envelopeId);
  if (!envelope) {
    throw new Error(`Cannot record debt payment: Envelope "${envelopeId}" does not exist.`);
  }

  return envelopeId;
};

/**
 * Record a debt payment
 */
export const recordPaymentOperation = async (options: RecordPaymentOptions) => {
  const { debt, paymentData, updateDebtData, createTransaction } = options;

  try {
    const { amount, paymentDate, notes } = paymentData;

    // ARCHITECTURE: Debts are bills with finite amount/time. Paying a debt = creating a transaction.
    // CRITICAL: Debt payments route through envelopes (envelopes are source of truth)
    const envelopeId = await resolveEnvelopeForDebt(debt);

    const interestPortion = calculateInterestPortion(debt, amount);
    const principalPortion = amount - interestPortion;

    const updatedDebt = buildDebtWithPayment(debt, {
      amount,
      paymentDate,
      interestPortion,
      principalPortion,
      notes,
    });

    await updateDebtData({ id: debt.id, updates: updatedDebt });

    // ARCHITECTURE: Debts are just bills with finite amount/time. Paying a debt = creating a transaction.
    // Envelopes are where all money is kept. The transaction will update the envelope balance.
    await createTransaction({
      amount: -amount, // Negative for expense
      description: `${debt.name} Payment`,
      category: "Debt Payment",
      envelopeId: envelopeId, // REQUIRED - transactions must have envelope (envelopes are source of truth)
      debtId: debt.id,
      date: paymentDate,
      notes: notes || "",
    });

    logger.info("Debt payment recorded successfully", {
      debtId: debt.id,
      envelopeId,
      amount,
    });
    return updatedDebt;
  } catch (error) {
    logger.error("Error recording debt payment:", error);
    throw error;
  }
};

/**
 * Link debt to an existing bill
 */
export const linkDebtToBillOperation = async (options: LinkDebtToBillOptions) => {
  const { debtId, billId, debts, bills, updateBill, updateDebtData } = options;

  try {
    const debt = debts.find((d) => d.id === debtId);
    const bill = bills.find((b) => b.id === billId);

    if (!debt || !bill) {
      throw new Error("Debt or bill not found");
    }

    // Update the bill to reference the debt
    await updateBill(billId, {
      debtId: debtId,
      amount: debt.minimumPayment, // Sync amount with debt
    });

    // Update debt with payment due date from bill
    await updateDebtData({
      id: debtId,
      updates: {
        paymentDueDate: bill.dueDate,
        envelopeId: bill.envelopeId, // Use bill's envelope
      },
    });

    logger.info("Debt linked to bill successfully");
  } catch (error) {
    logger.error("Error linking debt to bill:", error);
    throw error;
  }
};

/**
 * Sync debt due dates with linked bills
 */
export const syncDebtDueDatesOperation = async (options: SyncDebtDueDatesOptions) => {
  const { debts, bills, updateDebtData } = options;

  try {
    const syncPromises = debts.map(async (debt) => {
      const linkedBill = bills.find((bill) => bill.debtId === debt.id);
      if (linkedBill && debt.paymentDueDate !== linkedBill.dueDate) {
        await updateDebtData({
          id: debt.id,
          updates: {
            paymentDueDate: linkedBill.dueDate,
            minimumPayment: linkedBill.amount,
          },
        });
      }
    });

    await Promise.all(syncPromises);
    logger.info("Debt due dates synced with bills");
  } catch (error) {
    logger.error("Error syncing debt due dates:", error);
  }
};

/**
 * Update a debt with proper parameter formatting
 */
export const updateDebtOperation = async (options: UpdateDebtOptions) => {
  const { debtId, updates, author = "Unknown User", updateDebtData } = options;

  try {
    if (!debtId) {
      throw new Error("Debt ID is required for update");
    }

    logger.debug("Updating debt:", { debtId, updates, author });

    return await updateDebtData({
      id: debtId,
      updates,
      author,
    });
  } catch (error) {
    logger.error("Error updating debt:", error);
    throw error;
  }
};

/**
 * Delete a debt and its related connections
 */
export const deleteDebtOperation = async (options: DeleteDebtOptions): Promise<void> => {
  const { debtId, bills, deleteBill, deleteDebtData } = options;

  try {
    // Find and delete related bill
    const relatedBill = bills.find((bill) => bill.debtId === debtId);
    if (relatedBill) {
      await deleteBill(relatedBill.id);
      logger.info("Deleted related bill for debt");
    }

    // Delete the debt
    await deleteDebtData({ id: debtId });
    logger.info("Debt deleted successfully");
  } catch (error) {
    logger.error("Error deleting debt:", error);
    throw error;
  }
};

/**
 * Enrich debts with related data and calculations
 */
export const enrichDebtsWithRelations = (
  debts: Debt[],
  bills: Bill[],
  envelopes: Envelope[],
  transactions: Array<{ debtId?: string }>
) => {
  if (!debts?.length) return [];

  logger.debug("🔧 Enriching debts:", { count: debts.length });

  const enriched = debts.map((debt) => {
    const relatedBill = bills.find((bill) => bill.debtId === debt.id);
    const relatedEnvelope = relatedBill
      ? envelopes.find((env) => env.id === relatedBill.envelopeId)
      : debt.envelopeId
        ? envelopes.find((env) => env.id === debt.envelopeId)
        : null;
    const relatedTransactions = transactions.filter((t) => t.debtId === debt.id);

    return enrichDebt(
      debt as unknown as DebtAccount,
      (relatedBill as unknown as import("@/db/types").Bill) || null,
      relatedEnvelope as unknown as import("@/db/types").Envelope,
      relatedTransactions as unknown as import("@/db/types").Transaction[]
    );
  });

  return enriched;
};

// Re-export API wrapper functions from separate file
export { createAPIWrappers, groupDebtsByStatus, groupDebtsByType } from "./debtApiWrappers";
