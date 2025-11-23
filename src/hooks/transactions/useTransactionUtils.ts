import { useCallback } from "react";
import type { Transaction } from "@/types/finance";

export const useTransactionUtils = (transactions: Transaction[] = []) => {
  // Utility functions
  const getTransactionById = useCallback(
    (id: string | number) => transactions.find((t) => t.id === id),
    [transactions]
  );

  const getTransactionsByEnvelope = useCallback(
    (envId: string | number) => transactions.filter((t) => t.envelopeId === envId),
    [transactions]
  );

  const getTransactionsByCategory = useCallback(
    (cat: string) => transactions.filter((t) => t.category === cat),
    [transactions]
  );

  const getAvailableCategories = useCallback(() => {
    const categories = new Set(transactions.map((t) => t.category));
    return Array.from(categories).filter(Boolean).sort();
  }, [transactions]);

  // Date range helpers
  const getThisMonth = useCallback(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start, end };
  }, []);

  const getLastMonth = useCallback(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { start, end };
  }, []);

  const getLast30Days = useCallback(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return { start, end };
  }, []);

  return {
    // Utility functions
    getTransactionById,
    getTransactionsByEnvelope,
    getTransactionsByCategory,
    availableCategories: getAvailableCategories(),

    // Date range helpers
    getThisMonth,
    getLastMonth,
    getLast30Days,
  };
};
