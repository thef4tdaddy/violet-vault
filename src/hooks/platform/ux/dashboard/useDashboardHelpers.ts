import { useCallback } from "react";
import type { Transaction } from "./types";

/**
 * Hook for dashboard data processing and display helpers
 * Provides utility functions for dashboard data rendering
 */
export const useDashboardHelpers = () => {
  const getRecentTransactions = useCallback(
    (transactions: Transaction[] = [], limit: number = 10) => {
      return (transactions || []).slice(0, limit);
    },
    []
  );

  const formatCurrency = useCallback((amount: number) => {
    return `$${Math.abs(amount || 0).toFixed(2)}`;
  }, []);

  const getTransactionIcon = useCallback((amount: number) => {
    return amount > 0 ? "TrendingUp" : "TrendingDown";
  }, []);

  const getTransactionColor = useCallback((amount: number) => {
    return amount > 0 ? "text-green-600" : "text-red-600";
  }, []);

  const getBalanceStatusColor = useCallback((isBalanced: boolean, difference: number) => {
    if (isBalanced) return "bg-green-50";
    return Math.abs(difference) > 10 ? "bg-red-50" : "bg-yellow-50";
  }, []);

  const getBalanceStatusIcon = useCallback((isBalanced: boolean, difference: number) => {
    if (isBalanced) return "CheckCircle";
    return Math.abs(difference) > 10 ? "AlertTriangle" : "AlertTriangle";
  }, []);

  return {
    getRecentTransactions,
    formatCurrency,
    getTransactionIcon,
    getTransactionColor,
    getBalanceStatusColor,
    getBalanceStatusIcon,
  };
};
