/**
 * TanStack Query hooks for budget data
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../utils/common/queryClient";
import { queryFunctions } from "./queryFunctions";

export const useBudgetQueries = () => {
  const envelopesQuery = useQuery({
    queryKey: queryKeys.envelopes.all(),
    queryFn: queryFunctions.envelopes,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const transactionsQuery = useQuery({
    queryKey: queryKeys.transactions.all(),
    queryFn: () => queryFunctions.transactions(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const billsQuery = useQuery({
    queryKey: queryKeys.bills.all(),
    queryFn: queryFunctions.bills,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const savingsGoalsQuery = useQuery({
    queryKey: queryKeys.savings.all(),
    queryFn: queryFunctions.savingsGoals,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const paycheckHistoryQuery = useQuery({
    queryKey: queryKeys.paychecks.all(),
    queryFn: queryFunctions.paycheckHistory,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const dashboardQuery = useQuery({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: queryFunctions.dashboardSummary,
    staleTime: 1000 * 60 * 1, // 1 minute
  });

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
    isLoading:
      envelopesQuery.isLoading ||
      transactionsQuery.isLoading ||
      billsQuery.isLoading ||
      savingsGoalsQuery.isLoading ||
      paycheckHistoryQuery.isLoading ||
      dashboardQuery.isLoading,

    // Error states
    error:
      envelopesQuery.error ||
      transactionsQuery.error ||
      billsQuery.error ||
      savingsGoalsQuery.error ||
      paycheckHistoryQuery.error ||
      dashboardQuery.error,
  };
};
