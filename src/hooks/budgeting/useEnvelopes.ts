import { useEnvelopesQuery } from "./useEnvelopesQuery";
import { useEnvelopeOperations } from "./useEnvelopeOperations";
import { useEnvelopeCalculations } from "./useEnvelopeCalculations";

/**
 * Specialized hook for envelope management
 * Orchestrates envelope operations using focused sub-hooks
 */
const useEnvelopes = (options = {}) => {
  // Extract data fetching logic
  const queryResult = useEnvelopesQuery(options);

  // Extract mutation operations
  const operationsResult = useEnvelopeOperations();

  // Extract calculations and utilities
  const calculationsResult = useEnvelopeCalculations(
    queryResult.envelopes as unknown as Array<{
      id?: string;
      currentBalance?: number;
      targetAmount?: number;
      category?: string;
      [key: string]: unknown;
    }>
  );

  // Wrapper functions for envelope deletion with bill handling
  const deleteEnvelopeWrapper = (envelopeId: string, deleteBillsToo: boolean = false) => {
    operationsResult.deleteEnvelope({ envelopeId, deleteBillsToo });
  };

  const deleteEnvelopeAsyncWrapper = (envelopeId: string, deleteBillsToo: boolean = false) => {
    return operationsResult.deleteEnvelopeAsync({ envelopeId, deleteBillsToo });
  };

  // Repair corrupted envelopes (combines calculation + operation)
  const repairCorruptedEnvelope = async (
    envelopeId: string,
    name: string,
    category: string = "utilities"
  ) => {
    const updates = await calculationsResult.repairCorruptedEnvelope(envelopeId, name, category);
    return operationsResult.updateEnvelopeAsync({ id: envelopeId, updates });
  };

  return {
    // Data
    envelopes: queryResult.envelopes,
    totalBalance: calculationsResult.totalBalance,
    totalTargetAmount: calculationsResult.totalTargetAmount,
    underfundedEnvelopes: calculationsResult.underfundedEnvelopes,
    overfundedEnvelopes: calculationsResult.overfundedEnvelopes,
    availableCategories: calculationsResult.availableCategories,

    // Loading states
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    isError: queryResult.isError,
    error: queryResult.error,

    // Mutation functions
    addEnvelope: operationsResult.addEnvelope,
    addEnvelopeAsync: operationsResult.addEnvelopeAsync,
    updateEnvelope: operationsResult.updateEnvelope,
    updateEnvelopeAsync: operationsResult.updateEnvelopeAsync,
    deleteEnvelope: deleteEnvelopeWrapper,
    deleteEnvelopeAsync: deleteEnvelopeAsyncWrapper,
    transferFunds: operationsResult.transferFunds,
    transferFundsAsync: operationsResult.transferFundsAsync,

    // Mutation states
    isAdding: operationsResult.isAdding,
    isUpdating: operationsResult.isUpdating,
    isDeleting: operationsResult.isDeleting,
    isTransferring: operationsResult.isTransferring,

    // Utility functions
    getEnvelopeById: calculationsResult.getEnvelopeById,
    getEnvelopesByCategory: calculationsResult.getEnvelopesByCategory,
    repairCorruptedEnvelope,

    // Query controls
    refetch: queryResult.refetch,
    invalidate: queryResult.invalidate,
  };
};

export { useEnvelopes };
export default useEnvelopes;
