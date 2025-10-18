import { useMemo } from "react";
import { useDebts } from "./useDebts";
import useBills from "../bills/useBills";
import useEnvelopes from "../budgeting/useEnvelopes";
import useTransactions from "../common/useTransactions";
import {
  DEBT_TYPES,
  DEBT_STATUS,
  PAYMENT_FREQUENCIES,
  COMPOUND_FREQUENCIES,
  calculateDebtStats,
} from "../../constants/debts";
import {
  calculateInterestPortion,
  convertPaymentFrequency,
  enrichDebt,
  getUpcomingPayments,
} from "../../utils/debts/debtCalculations";
import logger from "../../utils/common/logger.ts";

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

  const debts = useMemo(() => debtsHook?.debts || [], [debtsHook?.debts]);
  const createDebtData = debtsHook?.addDebtAsync;
  const updateDebtData = debtsHook?.updateDebtAsync;
  const deleteDebtData = debtsHook?.deleteDebtAsync;

  // Enrich debts with related data and calculations FIRST
  const enrichedDebts = useMemo(() => {
    if (!debts?.length) return [];

    logger.debug("🔧 Enriching debts:", {
      rawDebtsCount: debts.length,
      billsCount: bills.length,
      envelopesCount: envelopes.length,
      transactionsCount: transactions.length,
      sampleDebt: debts[0],
    });

    const enriched = debts.map((debt, index) => {
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
      const enrichedDebt = enrichDebt(debt, relatedBill, relatedEnvelope, relatedTransactions);

      // Log first debt enrichment details
      if (index === 0) {
        logger.debug("🔧 First debt enrichment details:", {
          originalDebt: {
            id: debt.id,
            name: debt.name,
            currentBalance: debt.currentBalance,
            minimumPayment: debt.minimumPayment,
            interestRate: debt.interestRate,
          },
          enrichedDebt: {
            id: enrichedDebt.id,
            name: enrichedDebt.name,
            status: enrichedDebt.status,
            currentBalance: enrichedDebt.currentBalance,
            minimumPayment: enrichedDebt.minimumPayment,
            interestRate: enrichedDebt.interestRate,
            payoffInfo: enrichedDebt.payoffInfo,
            nextPaymentDate: enrichedDebt.nextPaymentDate,
          },
          relatedBill,
          relatedEnvelope,
          relatedTransactionsCount: relatedTransactions.length,
        });
      }

      return enrichedDebt;
    });

    logger.debug("🔧 Debt enrichment complete:", {
      enrichedCount: enriched.length,
    });

    return enriched;
  }, [debts, bills, envelopes, transactions]);

  // Calculate debt statistics using enriched debts
  const debtStats = useMemo(() => {
    if (!enrichedDebts?.length) {
      const emptyStats = {
        totalDebt: 0,
        totalMonthlyPayments: 0,
        averageInterestRate: 0,
        debtsByType: {},
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
      firstDebtBalance: enrichedDebts[0]?.currentBalance,
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

  // Create envelope and bill for new debt
  const createEnvelopeAndBill = async (cleanDebtData, createdDebt, newEnvelopeName) => {
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

  // Helper: Handle bill connections for debt
  const handleBillConnections = async (
    connectionData,
    cleanDebtData,
    createdDebt
  ) => {
    if (!connectionData) return;

    const { paymentMethod, createBill: shouldCreateBill, existingBillId, newEnvelopeName } =
      connectionData;

    if (paymentMethod === "create_new" && shouldCreateBill) {
      await createEnvelopeAndBill(cleanDebtData, createdDebt, newEnvelopeName);
    } else if (paymentMethod === "connect_existing_bill" && existingBillId) {
      await updateBill(existingBillId, { debtId: createdDebt.id });
      logger.info("Connected debt to existing bill");
    }
  };

  // Create a new debt with optional bill and envelope integration
  const createDebt = async (debtData) => {
    try {
      logger.info("Creating debt with data:", debtData);

      const { connectionData, ...cleanDebtData } = debtData;
      const createdDebt = await createDebtData(cleanDebtData);
      logger.info("Debt created:", createdDebt);

      await handleBillConnections(connectionData, cleanDebtData, createdDebt);

      return createdDebt;
    } catch (error) {
      logger.error("Error creating debt:", error);
      throw error;
    }
  };

  // Helper: Build updated debt with payment
  const buildDebtWithPayment = (debt, amount, paymentDate, interestPortion, principalPortion) => {
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

  // Record a debt payment
  const recordPayment = async (debtId, paymentData) => {
    try {
      const debt = debts.find((d) => d.id === debtId);
      if (!debt) throw new Error("Debt not found");

      const { amount, paymentDate, notes } = paymentData;

      const interestPortion = calculateInterestPortion(debt, amount);
      const principalPortion = amount - interestPortion;

      const updatedDebt = buildDebtWithPayment(debt, amount, paymentDate, interestPortion, principalPortion);

      await updateDebtData({ id: debtId, updates: updatedDebt });

      await createTransaction({
        amount: -amount,
        description: `${debt.name} Payment`,
        category: "Debt Payment",
        debtId,
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

  // Sync debt due dates with linked bills
  const syncDebtDueDates = async () => {
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

  // Update a debt with proper parameter formatting
  const updateDebt = async (debtId, updates, author = "Unknown User") => {
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
      await deleteDebtData({ id: debtId });
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
