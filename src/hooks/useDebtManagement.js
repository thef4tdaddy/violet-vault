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
  // COMPLETELY MINIMAL VERSION TO ISOLATE TDZ ERROR
  const debtsHook = useDebts();
  const debts = debtsHook?.debts || [];

  // Minimal debt stats - no complex calculations
  const debtStats = {
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

  // Just return raw debts without enrichment
  const enrichedDebts = debts;
  const debtsByStatus = {};
  const debtsByType = {};

  // Minimal stub functions to prevent errors
  const createDebt = () => null;
  const updateDebtData = () => null;
  const deleteDebt = () => null;
  const recordPayment = () => null;
  const linkDebtToBill = () => null;
  const syncDebtDueDates = () => null;
  const getUpcomingPaymentsData = () => [];

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
