import { useMemo, useEffect } from "react";
import useDebts from "./useDebts";
import useBills from "./useBills";
import useEnvelopes from "./useEnvelopes";
import useTransactions from "./useTransactions";
import {
  DEBT_TYPES,
  DEBT_STATUS,
  PAYMENT_FREQUENCIES,
  COMPOUND_FREQUENCIES,
  calculateDebtStats,
  AUTO_CLASSIFY_DEBT_TYPE,
} from "../constants/debts";
import {
  calculateInterestPortion,
  convertPaymentFrequency,
  createSpecialTerms,
  enrichDebt,
  getUpcomingPayments,
} from "../utils/debtCalculations";
import logger from "../utils/logger.js";

/**
 * Business logic hook for debt management
 * Handles relationships between debts, bills, envelopes, and transactions
 */
export const useDebtManagement = () => {
  // Get data dependencies
  const debtsHook = useDebts();
  const { bills = [], createBill, updateBill, deleteBill } = useBills();
  const { envelopes = [], createEnvelope } = useEnvelopes();
  const { transactions = [], createTransaction } = useTransactions();

  const debts = debtsHook?.debts || [];
  const createDebtData = debtsHook?.createDebt;
  const updateDebtData = debtsHook?.updateDebt;
  const deleteDebtData = debtsHook?.deleteDebt;

  // Calculate debt statistics
  const debtStats = useMemo(() => {
    if (!debts?.length) {
      return {
        totalDebt: 0,
        totalMonthlyPayments: 0,
        averageInterestRate: 0,
        debtsByType: {},
        totalInterestPaid: 0,
        activeDebtCount: 0,
        totalDebtCount: debts.length,
        dueSoonAmount: 0,
        dueSoonCount: 0,
      };
    }

    return calculateDebtStats(debts);
  }, [debts]);

  // Enrich debts with related data and calculations
  const enrichedDebts = useMemo(() => {
    if (!debts?.length) return [];

    return debts.map((debt) => {
      // Find related bill and envelope
      const relatedBill = bills.find((bill) => bill.debtId === debt.id);
      const relatedEnvelope = relatedBill
        ? envelopes.find((env) => env.id === relatedBill.envelopeId)
        : debt.envelopeId
          ? envelopes.find((env) => env.id === debt.envelopeId)
          : null;

      // Find related transactions
      const relatedTransactions = transactions.filter(
        (transaction) => transaction.debtId === debt.id
      );

      // Enrich the debt with calculated properties
      return enrichDebt(debt, relatedBill, relatedEnvelope, relatedTransactions);
    });
  }, [debts, bills, envelopes, transactions]);

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
  const createDebt = async (debtData) => {
    try {
      logger.info("Creating debt with data:", debtData);

      // Extract connection data
      const { connectionData, ...cleanDebtData } = debtData;
      const {
        paymentMethod,
        createBill: shouldCreateBill,
        envelopeId,
        existingBillId,
        newEnvelopeName,
      } = connectionData || {};

      // Step 1: Create the debt first
      const createdDebt = await createDebtData(cleanDebtData);
      logger.info("Debt created:", createdDebt);

      // Step 2: Handle bill and envelope connections
      if (paymentMethod === "create_new" && shouldCreateBill) {
        // Create new envelope and bill
        const envelopeName = newEnvelopeName || `${cleanDebtData.name} Payment`;

        // Create envelope
        const newEnvelope = await createEnvelope({
          name: envelopeName,
          targetAmount: cleanDebtData.minimumPayment * 2, // Buffer for 2 payments
          currentBalance: 0,
          category: "Fixed Expenses",
        });

        // Create bill linked to the debt and envelope
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
      } else if (paymentMethod === "connect_existing_bill" && existingBillId) {
        // Connect to existing bill (will use bill's envelope)
        await updateBill(existingBillId, { debtId: createdDebt.id });
        logger.info("Connected debt to existing bill");
      }

      return createdDebt;
    } catch (error) {
      logger.error("Error creating debt:", error);
      throw error;
    }
  };

  // Record a debt payment
  const recordPayment = async (debtId, paymentData) => {
    try {
      const debt = debts.find((d) => d.id === debtId);
      if (!debt) throw new Error("Debt not found");

      const { amount, paymentDate, notes } = paymentData;

      // Calculate interest and principal portions
      const interestPortion = calculateInterestPortion(debt, amount);
      const principalPortion = amount - interestPortion;

      // Update debt balance
      const newBalance = Math.max(0, debt.currentBalance - principalPortion);
      const updatedDebt = {
        ...debt,
        currentBalance: newBalance,
        lastPaymentDate: paymentDate,
        lastPaymentAmount: amount,
        status: newBalance === 0 ? DEBT_STATUS.PAID_OFF : debt.status,
      };

      // Add payment to history
      if (!updatedDebt.paymentHistory) {
        updatedDebt.paymentHistory = [];
      }
      updatedDebt.paymentHistory.push({
        date: paymentDate,
        amount: amount,
        interestPortion: interestPortion,
        principalPortion: principalPortion,
        balanceAfter: newBalance,
        notes: notes || "",
      });

      // Update the debt
      await updateDebtData(debtId, updatedDebt);

      // Create a transaction record
      await createTransaction({
        amount: -amount, // Negative for outgoing payment
        description: `${debt.name} Payment`,
        category: "Debt Payment",
        debtId: debtId,
        date: paymentDate,
        notes: notes || "",
      });

      logger.info("Debt payment recorded successfully");
      return updatedDebt;
    } catch (error) {
      logger.error("Error recording debt payment:", error);
      throw error;
    }
  };

  // Link debt to an existing bill
  const linkDebtToBill = async (debtId, billId) => {
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
      await updateDebtData(debtId, {
        paymentDueDate: bill.dueDate,
        envelopeId: bill.envelopeId, // Use bill's envelope
      });

      logger.info("Debt linked to bill successfully");
    } catch (error) {
      logger.error("Error linking debt to bill:", error);
      throw error;
    }
  };

  // Sync debt due dates with linked bills
  const syncDebtDueDates = async () => {
    try {
      const syncPromises = debts.map(async (debt) => {
        const linkedBill = bills.find((bill) => bill.debtId === debt.id);
        if (linkedBill && debt.paymentDueDate !== linkedBill.dueDate) {
          await updateDebtData(debt.id, {
            paymentDueDate: linkedBill.dueDate,
            minimumPayment: linkedBill.amount,
          });
        }
      });

      await Promise.all(syncPromises);
      logger.info("Debt due dates synced with bills");
    } catch (error) {
      logger.error("Error syncing debt due dates:", error);
    }
  };

  // Delete a debt and its related connections
  const deleteDebt = async (debtId) => {
    try {
      // Find and delete related bill
      const relatedBill = bills.find((bill) => bill.debtId === debtId);
      if (relatedBill) {
        await deleteBill(relatedBill.id);
        logger.info("Deleted related bill for debt");
      }

      // Delete the debt
      await deleteDebtData(debtId);
      logger.info("Debt deleted successfully");
    } catch (error) {
      logger.error("Error deleting debt:", error);
      throw error;
    }
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
    updateDebt: updateDebtData,
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

export default useDebtManagement;
