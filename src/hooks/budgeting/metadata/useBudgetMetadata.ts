// Main budget metadata hook that combines all focused hooks
import { useBudgetMetadataQuery } from "./useBudgetMetadataQuery";
import { useBudgetMetadataMutation } from "./useBudgetMetadataMutation";
import { useUnassignedCashOperations } from "./useUnassignedCashOperations";
import { useActualBalanceOperations } from "./useActualBalanceOperations";
import { useBudgetMetadataUtils } from "./useBudgetMetadataUtils";

/**
 * Combined hook for budget metadata (unassigned cash, actual balance, etc.)
 * Follows the proper data flow: TanStack Query ↔ Dexie ↔ Cloud Sync
 * Zustand is no longer involved in data management for these fields
 */
export const useBudgetMetadata = () => {
  // Core data query
  const {
    metadata,
    unassignedCash,
    actualBalance,
    isActualBalanceManual,
    biweeklyAllocation,
    supplementalAccounts,
    isLoading,
    error,
    refetch,
  } = useBudgetMetadataQuery();

  // Mutation operations
  const { updateMetadata, isUpdating } = useBudgetMetadataMutation();

  // Specific operations
  const { updateUnassignedCash } = useUnassignedCashOperations();
  const { updateActualBalance } = useActualBalanceOperations();

  // Utility functions
  const {
    setBiweeklyAllocation,
    getBalanceDifference,
    shouldConfirmChange,
    formatBalance,
    validateBalanceInput,
  } = useBudgetMetadataUtils();

  return {
    // State
    metadata,
    unassignedCash,
    actualBalance,
    isActualBalanceManual,
    biweeklyAllocation,
    supplementalAccounts,

    // Loading states
    isLoading,
    error,
    isUpdating,

    // Actions
    updateUnassignedCash,
    updateActualBalance,
    setBiweeklyAllocation,
    updateMetadata,
    refetch,

    // Utility functions
    getBalanceDifference,
    shouldConfirmChange,
    formatBalance,
    validateBalanceInput,
  };
};

// Re-export specialized hooks for direct use
export { useUnassignedCash } from "./useUnassignedCash";
export { useActualBalance } from "./useActualBalance";
export { useBudgetMetadataQuery } from "./useBudgetMetadataQuery";
export { useBudgetMetadataMutation } from "./useBudgetMetadataMutation";
export { useUnassignedCashOperations } from "./useUnassignedCashOperations";
export { useActualBalanceOperations } from "./useActualBalanceOperations";
export { useBudgetMetadataUtils } from "./useBudgetMetadataUtils";
