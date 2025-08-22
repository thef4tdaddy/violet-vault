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
import logger from "../utils/logger.js";

// Helper functions (moved to top to avoid temporal dead zone issues)
const calculateNextPaymentDate = (debt, relatedBill) => {
  // Use bill due date if available
  if (relatedBill?.dueDate) {
    return relatedBill.dueDate;
  }

  // Use debt payment due date
  if (debt.paymentDueDate) {
    return debt.paymentDueDate;
  }

  // Calculate based on payment frequency and last payment
  const lastPayment = debt.paymentHistory?.[debt.paymentHistory.length - 1];
  if (!lastPayment) {
    return null;
  }

  const lastPaymentDate = new Date(lastPayment.date);
  const nextDate = new Date(lastPaymentDate);

  switch (debt.paymentFrequency) {
    case PAYMENT_FREQUENCIES.WEEKLY:
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case PAYMENT_FREQUENCIES.BIWEEKLY:
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case PAYMENT_FREQUENCIES.QUARTERLY:
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case PAYMENT_FREQUENCIES.ANNUALLY:
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    default: // monthly
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
  }

  return nextDate.toISOString();
};

const calculatePayoffProjection = (debt) => {
  // Ensure we have valid numeric values
  const currentBalance = parseFloat(debt.currentBalance) || 0;
  const minimumPayment = parseFloat(debt.minimumPayment) || 0;
  const interestRate = parseFloat(debt.interestRate) || 0;

  // Return null projection if missing essential data
  if (currentBalance <= 0 || minimumPayment <= 0 || interestRate <= 0) {
    return {
      monthsToPayoff: null,
      totalInterest: null,
      payoffDate: null,
    };
  }

  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayment = minimumPayment;
  const balance = currentBalance;

  // Check if payment covers interest (prevents infinite payoff scenarios)
  const monthlyInterest = balance * monthlyRate;
  if (monthlyPayment <= monthlyInterest) {
    return {
      monthsToPayoff: null,
      totalInterest: null,
      payoffDate: null,
    };
  }

  // Calculate months to payoff using amortization formula
  const monthsToPayoff = Math.ceil(
    -Math.log(1 - (balance * monthlyRate) / monthlyPayment) /
      Math.log(1 + monthlyRate),
  );

  const totalPayments = monthlyPayment * monthsToPayoff;
  const totalInterest = totalPayments - balance;

  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + monthsToPayoff);

  // Validate all calculations are finite numbers
  const validMonthsToPayoff =
    isFinite(monthsToPayoff) && monthsToPayoff > 0 ? monthsToPayoff : null;
  const validTotalInterest =
    isFinite(totalInterest) && totalInterest >= 0 ? totalInterest : null;
  const validPayoffDate = validMonthsToPayoff ? payoffDate.toISOString() : null;

  return {
    monthsToPayoff: validMonthsToPayoff,
    totalInterest: validTotalInterest,
    payoffDate: validPayoffDate,
  };
};

/**
 * Business logic hook for debt management
 * Handles relationships between debts, bills, envelopes, and transactions
 */
export const useDebtManagement = () => {
  const { bills = [], addBill, updateBill } = useBills();
  const { envelopes = [] } = useEnvelopes();
  const { allTransactions = [] } = useTransactions();
  const {
    debts = [],
    addDebt,
    updateDebt,
    deleteDebt,
    recordDebtPayment,
  } = useDebts();

  // Calculate comprehensive debt statistics
  const debtStats = useMemo(() => calculateDebtStats(debts), [debts]);

  // Get debts with their related bills and envelopes
  const enrichedDebts = useMemo(() => {
    return debts.map((debt) => {
      // Find related bill (bill that references this debt)
      const relatedBill = bills.find((bill) => bill.debtId === debt.id);

      // Find related envelope (envelope the bill payment comes from)
      const relatedEnvelope = relatedBill
        ? envelopes.find((env) => env.id === relatedBill.envelopeId)
        : null;

      // Get payment transactions for this debt
      const relatedTransactions = allTransactions.filter(
        (tx) =>
          tx.debtId === debt.id ||
          (relatedBill && tx.billId === relatedBill.id),
      );

      // Calculate next payment date
      const nextPaymentDate = calculateNextPaymentDate(debt, relatedBill);

      // Calculate payoff information
      const payoffInfo = calculatePayoffProjection(debt);

      return {
        ...debt,
        relatedBill,
        relatedEnvelope,
        relatedTransactions,
        nextPaymentDate,
        payoffInfo,
      };
    });
  }, [debts, bills, envelopes, allTransactions]);

  // Get debts by status
  const debtsByStatus = useMemo(() => {
    return enrichedDebts.reduce((acc, debt) => {
      const status = debt.status || DEBT_STATUS.ACTIVE;
      if (!acc[status]) acc[status] = [];
      acc[status].push(debt);
      return acc;
    }, {});
  }, [enrichedDebts]);

  // Get debts by type
  const debtsByType = useMemo(() => {
    return enrichedDebts.reduce((acc, debt) => {
      const type = debt.type || DEBT_TYPES.OTHER;
      if (!acc[type]) acc[type] = [];
      acc[type].push(debt);
      return acc;
    }, {});
  }, [enrichedDebts]);

  // Create a new debt with auto-classification
  const createDebt = (debtData) => {
    const autoType = AUTO_CLASSIFY_DEBT_TYPE(
      debtData.creditor || "",
      debtData.name || "",
    );

    const newDebt = {
      id: crypto.randomUUID(),
      name: debtData.name,
      type: debtData.type || autoType,
      creditor: debtData.creditor,
      accountNumber: debtData.accountNumber || "",

      // Financial details
      originalBalance: debtData.originalBalance || debtData.currentBalance || 0,
      currentBalance: debtData.currentBalance || 0,
      interestRate: debtData.interestRate || 0,
      compoundFrequency:
        debtData.compoundFrequency || COMPOUND_FREQUENCIES.MONTHLY,

      // Payment information
      minimumPayment: debtData.minimumPayment || 0,
      paymentFrequency:
        debtData.paymentFrequency || PAYMENT_FREQUENCIES.MONTHLY,
      paymentDueDate: debtData.paymentDueDate,

      // Status and tracking
      status: debtData.status || DEBT_STATUS.ACTIVE,
      paymentHistory: [],

      // Specialized terms based on debt type
      specialTerms: createSpecialTerms(
        debtData.type || autoType,
        debtData.specialTerms,
      ),

      // Metadata
      notes: debtData.notes || "",
    };

    addDebt(newDebt);

    // Automatically create a bill if requested
    if (debtData.createBill && debtData.minimumPayment > 0) {
      const billData = {
        name: `${newDebt.name} Payment`,
        provider: newDebt.creditor,
        category: "Bills & Utilities",
        amount: newDebt.minimumPayment,
        frequency: convertPaymentFrequency(newDebt.paymentFrequency),
        dueDate: newDebt.paymentDueDate,
        envelopeId: debtData.envelopeId || "", // Connect to specified envelope
        debtId: newDebt.id, // Link back to debt
        isRecurring: true,
        isPaid: false,
        notes: `Automatic bill created for ${newDebt.name} debt payments`,
      };

      addBill(billData);
      logger.info("Created automatic bill for debt", {
        debtId: newDebt.id,
        billName: billData.name,
        envelopeId: billData.envelopeId,
        source: "useDebtManagement.createDebt",
      });
    }

    return newDebt;
  };

  // Sync debt due dates with connected bills
  const syncDebtDueDates = () => {
    debts.forEach((debt) => {
      const relatedBill = bills.find((bill) => bill.debtId === debt.id);
      if (
        relatedBill &&
        relatedBill.dueDate &&
        debt.paymentDueDate !== relatedBill.dueDate
      ) {
        logger.debug("Syncing debt due date with connected bill", {
          debtId: debt.id,
          debtName: debt.name,
          oldDueDate: debt.paymentDueDate,
          newDueDate: relatedBill.dueDate,
          billId: relatedBill.id,
        });

        updateDebt({
          id: debt.id,
          updates: {
            paymentDueDate: relatedBill.dueDate,
          },
        });
      }
    });
  };

  // Update debt and maintain relationships
  const updateDebtData = (debtId, updates) => {
    const debt = debts.find((d) => d.id === debtId);
    if (!debt) return;

    const updatedDebt = { ...debt, ...updates };
    updateDebt({ id: debtId, updates });

    // Update related bill if payment amount changed
    if (updates.minimumPayment !== undefined) {
      const relatedBill = bills.find((bill) => bill.debtId === debtId);
      if (relatedBill) {
        updateBill({
          id: relatedBill.id,
          updates: {
            amount: updates.minimumPayment,
          },
        });
      }
    }

    return updatedDebt;
  };

  // Create or link a bill for debt payments
  const linkDebtToBill = (debtId, billData = {}) => {
    const debt = debts.find((d) => d.id === debtId);
    if (!debt) return null;

    // Check if debt already has a linked bill
    const existingBill = bills.find((bill) => bill.debtId === debtId);
    if (existingBill) {
      return existingBill;
    }

    // Create new bill for debt payments
    const newBill = {
      id: crypto.randomUUID(),
      name: billData.name || `${debt.name} Payment`,
      provider: billData.provider || debt.creditor,
      category: billData.category || "Bills & Utilities",
      amount: debt.minimumPayment || 0,
      frequency: convertPaymentFrequency(debt.paymentFrequency),
      dueDate: debt.paymentDueDate,
      isPaid: false,
      isRecurring: true,

      // Link to debt
      debtId: debtId,

      // Link to envelope if specified
      envelopeId: billData.envelopeId || null,

      // Metadata
      notes: `Auto-created for ${debt.name} debt payments`,
    };

    addBill(newBill);
    return newBill;
  };

  // Record a payment and update relationships
  const recordPayment = (debtId, paymentData) => {
    const debt = debts.find((d) => d.id === debtId);
    if (!debt) return;

    // Calculate interest and principal portions
    const interestAmount = calculateInterestPortion(debt, paymentData.amount);
    const principalAmount = paymentData.amount - interestAmount;

    const payment = {
      amount: paymentData.amount,
      principalAmount,
      interestAmount,
      date: paymentData.date || new Date().toISOString(),
      paymentMethod: paymentData.paymentMethod || "manual",
      notes: paymentData.notes || "",
    };

    // Record payment in debt
    recordDebtPayment(debtId, payment);

    // Mark related bill as paid if exists
    const relatedBill = bills.find((bill) => bill.debtId === debtId);
    if (relatedBill && !relatedBill.isPaid) {
      updateBill({
        ...relatedBill,
        isPaid: true,
        paidAmount: paymentData.amount,
        paidDate: paymentData.date,
      });
    }

    return payment;
  };

  // Get upcoming payments across all debts
  const getUpcomingPayments = (daysAhead = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + daysAhead);

    return enrichedDebts
      .filter(
        (debt) => debt.status === DEBT_STATUS.ACTIVE && debt.nextPaymentDate,
      )
      .filter((debt) => new Date(debt.nextPaymentDate) <= cutoffDate)
      .sort(
        (a, b) => new Date(a.nextPaymentDate) - new Date(b.nextPaymentDate),
      );
  };

  // Auto-sync debt due dates when bills change
  useEffect(() => {
    if (bills.length > 0 && debts.length > 0) {
      syncDebtDueDates();
    }
  }, [bills]);

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
    getUpcomingPayments,

    // Constants
    DEBT_TYPES,
    DEBT_STATUS,
    PAYMENT_FREQUENCIES,
    COMPOUND_FREQUENCIES,
  };
};

export default useDebtManagement;
