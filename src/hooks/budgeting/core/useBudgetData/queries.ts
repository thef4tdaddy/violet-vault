/**
 * TanStack Query hooks for budget data
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { queryKeys } from "@/utils/common/queryClient";
import { queryFunctions } from "./queryFunctions";

const computeLoadingState = (queries: UseQueryResult[]): boolean => {
  return queries.some((query) => query.isLoading);
};

const computeErrorState = (queries: UseQueryResult[]): Error | null => {
  return queries.find((query) => query.error)?.error || null;
};

export const useBudgetQueries = () => {
  const envelopesQuery = useQuery({
    queryKey: queryKeys.envelopesList(),
    queryFn: queryFunctions.envelopes,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const transactionsQuery = useQuery({
    queryKey: queryKeys.transactionsList(),
    queryFn: () => queryFunctions.transactions(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const billsQuery = useQuery({
    queryKey: queryKeys.billsList(),
    queryFn: queryFunctions.bills,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const savingsGoalsQuery = useQuery({
    queryKey: queryKeys.savingsGoalsList(),
    queryFn: queryFunctions.savingsGoals,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const paycheckHistoryQuery = useQuery({
    queryKey: queryKeys.paychecks,
    queryFn: queryFunctions.paycheckHistory,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const dashboardQuery = useQuery({
    queryKey: queryKeys.dashboardSummary(),
    queryFn: queryFunctions.dashboardSummary,
    staleTime: 1000 * 60 * 1, // 1 minute
  });

  const allQueries = [
    envelopesQuery,
    transactionsQuery,
    billsQuery,
    savingsGoalsQuery,
    paycheckHistoryQuery,
    dashboardQuery,
  ];

  return {
    envelopesQuery,
    transactionsQuery,
    billsQuery,
    savingsGoalsQuery,
    paycheckHistoryQuery,
    dashboardQuery,

    // Data extracts for convenience
    envelopes: envelopesQuery.data || [],
    transactions: transactionsQuery.data || [],
    bills: billsQuery.data || [],
    savingsGoals: savingsGoalsQuery.data || [],
    paycheckHistory: paycheckHistoryQuery.data || [],
    dashboardSummary: dashboardQuery.data || {},

    // Loading states
    isLoading: computeLoadingState(allQueries),

    // Error states
    error: computeErrorState(allQueries),
  };
};
