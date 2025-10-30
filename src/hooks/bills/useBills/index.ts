// Main useBills Hook - Orchestrates all bill-related functionality
import { useQueryClient } from "@tanstack/react-query";
import { useBillsQuery, useUpcomingBillsQuery, useBillQueryEvents } from "./billQueries.ts";
import {
  useAddBillMutation,
  useUpdateBillMutation,
  useDeleteBillMutation,
  useMarkBillPaidMutation,
} from "./billMutations.ts";
import { useBillAnalytics, useAvailableCategories, useBillUtilities } from "./billAnalytics.ts";
import { queryKeys } from "../../../utils/common/queryClient";

/**
 * Main useBills hook - Combines all bill functionality
 * Provides bill operations with smart filtering, due date tracking, and envelope integration
 */
const useBills = (options: { daysAhead?: number; [key: string]: unknown } = {}) => {
  const queryClient = useQueryClient();

  // Query hooks
  const billsQuery = useBillsQuery(options);
  const upcomingBillsQuery = useUpcomingBillsQuery(options.daysAhead || 30, billsQuery.data);
  useBillQueryEvents();

  // Mutation hooks
  const addBillMutation = useAddBillMutation();
  const updateBillMutation = useUpdateBillMutation();
  const deleteBillMutation = useDeleteBillMutation();
  const markBillPaidMutation = useMarkBillPaidMutation();

  // Analytics and utilities
  const analytics = useBillAnalytics(billsQuery.data || []);
  const availableCategories = useAvailableCategories(billsQuery.data || []);
  const utilities = useBillUtilities(billsQuery.data || []);

  // Main data
  const bills = billsQuery.data || [];
  const upcomingBills = upcomingBillsQuery.data || [];

  return {
    // Data
    bills,
    upcomingBills,
    ...analytics,
    availableCategories,

    // Loading states
    isLoading: billsQuery.isLoading,
    isFetching: billsQuery.isFetching,
    isError: billsQuery.isError,
    error: billsQuery.error,

    // Upcoming bills specific states
    upcomingLoading: upcomingBillsQuery.isLoading,
    upcomingError: upcomingBillsQuery.error,

    // Mutation functions
    addBill: addBillMutation.mutate,
    addBillAsync: addBillMutation.mutateAsync,
    updateBill: updateBillMutation.mutate,
    updateBillAsync: updateBillMutation.mutateAsync,
    deleteBill: deleteBillMutation.mutate,
    deleteBillAsync: deleteBillMutation.mutateAsync,
    markBillPaid: markBillPaidMutation.mutate,
    markBillPaidAsync: markBillPaidMutation.mutateAsync,

    // Mutation states
    isAdding: addBillMutation.isPending,
    isUpdating: updateBillMutation.isPending,
    isDeleting: deleteBillMutation.isPending,
    isMarkingPaid: markBillPaidMutation.isPending,

    // Utility functions
    ...utilities,

    // Query controls
    refetch: billsQuery.refetch,
    invalidate: () => queryClient.invalidateQueries({ queryKey: queryKeys.bills }),
  };
};

export default useBills;
