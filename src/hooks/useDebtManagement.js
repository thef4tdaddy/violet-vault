import { useMemo } from "react";
import { useBudget } from "./useBudget";
import {
  DEBT_TYPES,
  DEBT_STATUS,
  PAYMENT_FREQUENCIES,
  COMPOUND_FREQUENCIES,
  calculateDebtStats,
  AUTO_CLASSIFY_DEBT_TYPE,
} from "../constants/debts";

/**
 * Business logic hook for debt management
 * Handles relationships between debts, bills, envelopes, and transactions
 */
export const useDebtManagement = () => {
  const budget = useBudget();
  const {
    debts = [],
    bills = [],
    envelopes = [],
    allTransactions = [],
    addDebt,
    updateDebt,
    deleteDebt,
    recordDebtPayment,
    addBill,
    updateBill,
  } = budget;

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
    return newDebt;
  };

  // Update debt and maintain relationships
  const updateDebtData = (debtId, updates) => {
    const debt = debts.find((d) => d.id === debtId);
    if (!debt) return;

    const updatedDebt = { ...debt, ...updates };
    updateDebt(updatedDebt);

    // Update related bill if payment amount changed
    if (updates.minimumPayment !== undefined) {
      const relatedBill = bills.find((bill) => bill.debtId === debtId);
      if (relatedBill) {
        updateBill({
          ...relatedBill,
          amount: updates.minimumPayment,
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

    // Utilities
    getUpcomingPayments,

    // Constants
    DEBT_TYPES,
    DEBT_STATUS,
    PAYMENT_FREQUENCIES,
    COMPOUND_FREQUENCIES,
  };
};

// Helper functions
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
  if (!debt.currentBalance || !debt.minimumPayment || !debt.interestRate) {
    return {
      monthsToPayoff: null,
      totalInterest: null,
      payoffDate: null,
    };
  }

  const monthlyRate = debt.interestRate / 100 / 12;
  const monthlyPayment = debt.minimumPayment;
  const balance = debt.currentBalance;

  // Calculate months to payoff using amortization formula
  const monthsToPayoff = Math.ceil(
    -Math.log(1 - (balance * monthlyRate) / monthlyPayment) /
      Math.log(1 + monthlyRate),
  );

  const totalPayments = monthlyPayment * monthsToPayoff;
  const totalInterest = totalPayments - balance;

  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + monthsToPayoff);

  return {
    monthsToPayoff: isFinite(monthsToPayoff) ? monthsToPayoff : null,
    totalInterest: isFinite(totalInterest) ? totalInterest : null,
    payoffDate: isFinite(monthsToPayoff) ? payoffDate.toISOString() : null,
  };
};

const calculateInterestPortion = (debt, paymentAmount) => {
  if (!debt.interestRate || !debt.currentBalance) {
    return 0;
  }

  const monthlyRate = debt.interestRate / 100 / 12;
  const interestPortion = debt.currentBalance * monthlyRate;

  return Math.min(interestPortion, paymentAmount);
};

const convertPaymentFrequency = (debtFrequency) => {
  // Convert debt payment frequency to bill frequency
  switch (debtFrequency) {
    case PAYMENT_FREQUENCIES.WEEKLY:
      return "weekly";
    case PAYMENT_FREQUENCIES.BIWEEKLY:
      return "biweekly";
    case PAYMENT_FREQUENCIES.QUARTERLY:
      return "quarterly";
    case PAYMENT_FREQUENCIES.ANNUALLY:
      return "yearly";
    default:
      return "monthly";
  }
};

const createSpecialTerms = (debtType, providedTerms = {}) => {
  // Create specialized terms based on debt type
  switch (debtType) {
    case DEBT_TYPES.MORTGAGE:
      return {
        pmi: providedTerms.pmi || 0,
        escrowPayment: providedTerms.escrowPayment || 0,
        ...providedTerms,
      };
    case DEBT_TYPES.CREDIT_CARD:
      return {
        creditLimit: providedTerms.creditLimit || 0,
        cashAdvanceLimit: providedTerms.cashAdvanceLimit || 0,
        ...providedTerms,
      };
    case DEBT_TYPES.CHAPTER13:
      return {
        planDuration: providedTerms.planDuration || 60, // months
        trusteePayment: providedTerms.trusteePayment || 0,
        priorityAmount: providedTerms.priorityAmount || 0,
        ...providedTerms,
      };
    default:
      return providedTerms;
  }
};

export default useDebtManagement;
