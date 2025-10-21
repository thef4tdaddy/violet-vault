import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import logger from "../../utils/common/logger";

// Import individual mutation hooks
import { useLoginMutation } from "./mutations/useLoginMutations";
import { useJoinBudgetMutation } from "./mutations/useJoinBudgetMutation";
import { useChangePasswordMutation } from "./mutations/usePasswordMutations";
import { useUpdateProfileMutation } from "./mutations/useProfileMutations";
import { usePasswordValidation } from "./queries/usePasswordValidation";

/**
 * TanStack Query hooks for authentication operations
 *
 * Replaces Zustand authStore methods with proper query/mutation patterns
 * Part of Epic #665: Migrate Auth from Zustand to React Context + TanStack Query
 */

/**
 * Logout result type
 */
interface LogoutResult {
  success: boolean;
}

// Query Keys
export const authQueryKeys = {
  all: ["auth"] as const,
  user: () => [...authQueryKeys.all, "user"] as const,
  session: () => [...authQueryKeys.all, "session"] as const,
  validation: (password: string) => [...authQueryKeys.all, "validation", password] as const,
};

/**
 * Hook for logout mutation
 */
export const useLogoutMutation = (): UseMutationResult<LogoutResult, Error, void, unknown> => {
  const { clearAuth } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<LogoutResult> => {
      logger.auth("Logging out and clearing auth state.");
      // Clear any sensitive data if needed
      return { success: true };
    },
    onSuccess: () => {
      clearAuth();
      queryClient.clear(); // Clear all cached data on logout
    },
    onError: (error: Error) => {
      logger.error("Logout failed", error);
      // Still clear auth state even if something goes wrong
      clearAuth();
    },
  });
};

// Re-export all the mutation hooks for backwards compatibility
export {
  useLoginMutation,
  useJoinBudgetMutation,
  useChangePasswordMutation,
  useUpdateProfileMutation,
  usePasswordValidation,
};
