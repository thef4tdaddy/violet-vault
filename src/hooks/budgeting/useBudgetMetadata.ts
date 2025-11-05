// Main budget metadata hook that combines all focused hooks
import { useBudgetMetadataQuery } from "./metadata/useBudgetMetadataQuery";
import { useBudgetMetadataMutation } from "./metadata/useBudgetMetadataMutation";
import { useUnassignedCashOperations } from "./metadata/useUnassignedCashOperations";
import { useActualBalanceOperations } from "./metadata/useActualBalanceOperations";
import { useBudgetMetadataUtils } from "./metadata/useBudgetMetadataUtils";

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
export { useUnassignedCash } from "./metadata/useUnassignedCash";
export { useActualBalance } from "./metadata/useActualBalance";
export { useBudgetMetadataQuery } from "./metadata/useBudgetMetadataQuery";
export { useBudgetMetadataMutation } from "./metadata/useBudgetMetadataMutation";
export { useUnassignedCashOperations } from "./metadata/useUnassignedCashOperations";
export { useActualBalanceOperations } from "./metadata/useActualBalanceOperations";
export { useBudgetMetadataUtils } from "./metadata/useBudgetMetadataUtils";
