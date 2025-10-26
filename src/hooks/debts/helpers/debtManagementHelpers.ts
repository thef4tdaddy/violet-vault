/**
 * Helper functions for debt management operations
 * Extracted to reduce complexity in useDebtManagement
 */
import logger from "../../../utils/common/logger.ts";
import { convertPaymentFrequency } from "../../../utils/debts/debtCalculations";
import { DEBT_STATUS } from "../../../constants/debts";

interface DebtData {
  name: string;
  minimumPayment: number;
  paymentDueDate: string;
  paymentFrequency: string;
}

interface CreatedDebt {
  id: string;
}

interface Envelope {
  id: string;
}

interface Bill {
  id: string;
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
    category: string 
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
    frequency: convertPaymentFrequency(cleanDebtData.paymentFrequency),
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
  const {
    connectionData,
    cleanDebtData,
    createdDebt,
    createEnvelope,
    createBill,
    updateBill,
  } = options;

  if (!connectionData) return;

  const { paymentMethod, createBill: shouldCreateBill, existingBillId, newEnvelopeName } =
    connectionData;

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
export const buildDebtWithPayment = (debt, amount, paymentDate, interestPortion, principalPortion) => {
  const newBalance = Math.max(0, debt.currentBalance - principalPortion);
  const updatedDebt = {
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
    notes: paymentDate.notes || "",
  });

  return updatedDebt;
};
