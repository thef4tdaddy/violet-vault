import { useAddEnvelope } from "./mutations/useAddEnvelope";
import { useUpdateEnvelope } from "./mutations/useUpdateEnvelope";
import { useDeleteEnvelope } from "./mutations/useDeleteEnvelope";
import { useTransferFunds } from "./mutations/useTransferFunds";

/**
 * Hook for envelope mutation operations
 * Composes individual mutation hooks for clean separation of concerns
 */
export const useEnvelopeOperations = () => {
  // Use individual mutation hooks
  const addMutation = useAddEnvelope();
  const updateMutation = useUpdateEnvelope();
  const deleteMutation = useDeleteEnvelope();
  const transferMutation = useTransferFunds();

  return {
    // Mutation functions
    addEnvelope: addMutation.mutate,
    addEnvelopeAsync: addMutation.mutateAsync,
    updateEnvelope: updateMutation.mutate,
    updateEnvelopeAsync: updateMutation.mutateAsync,
    deleteEnvelope: deleteMutation.mutate,
    deleteEnvelopeAsync: deleteMutation.mutateAsync,
    transferFunds: transferMutation.mutate,
    transferFundsAsync: transferMutation.mutateAsync,

    // Mutation states
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isTransferring: transferMutation.isPending,
  };
};
