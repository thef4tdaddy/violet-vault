import { useState, useCallback } from "react";
import useToast from "../common/useToast";
import logger from "../../utils/common/logger";

/**
 * Hook for managing FAB action loading states and error handling
 * Provides loading indicators and error handling for FAB actions
 */
export const useFABLoadingStates = () => {
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());
  const { showError } = useToast();

  // Check if a specific action is loading
  const isActionLoading = useCallback(
    (actionId: string) => {
      return loadingActions.has(actionId);
    },
    [loadingActions]
  );

  // Check if any action is loading
  const isAnyActionLoading = useCallback(() => {
    return loadingActions.size > 0;
  }, [loadingActions]);

  // Start loading for an action
  const startLoading = useCallback((actionId: string) => {
    setLoadingActions((prev) => new Set(prev).add(actionId));
  }, []);

  // Stop loading for an action
  const stopLoading = useCallback((actionId: string) => {
    setLoadingActions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(actionId);
      return newSet;
    });
  }, []);

  // Wrap an action with loading state and error handling
  const wrapActionWithLoading = useCallback(
    <T extends unknown[]>(
      actionId: string,
      actionFn: (...args: T) => Promise<unknown> | unknown,
      actionLabel = "Action"
    ) => {
      return async (...args: T) => {
        if (isActionLoading(actionId)) {
          logger.debug(`FAB: Action ${actionId} already in progress, ignoring`);
          return;
        }

        try {
          startLoading(actionId);
          logger.debug(`FAB: Starting action ${actionId}`, {
            label: actionLabel,
          });

          // Execute the action
          const result = await Promise.resolve(actionFn(...args));

          logger.debug(`FAB: Action ${actionId} completed successfully`);
          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const errorStack = error instanceof Error ? error.stack : undefined;

          logger.error(`FAB: Action ${actionId} failed`, {
            error: errorMessage,
            label: actionLabel,
            stack: errorStack,
          });

          // Show error toast
          showError(`${actionLabel} Failed`, errorMessage || "An unexpected error occurred", 5000);

          // Re-throw for component error boundaries if needed
          throw error;
        } finally {
          stopLoading(actionId);
        }
      };
    },
    [isActionLoading, startLoading, stopLoading, showError]
  );

  // Create a loading wrapper for FAB actions
  const createLoadingAction = useCallback(
    <T extends unknown[]>(
      actionId: string,
      actionFn: (...args: T) => Promise<unknown> | unknown,
      actionLabel: string
    ) => {
      return wrapActionWithLoading(actionId, actionFn, actionLabel);
    },
    [wrapActionWithLoading]
  );

  // Bulk operations
  const clearAllLoading = useCallback(() => {
    setLoadingActions(new Set());
  }, []);

  // Get loading state for UI
  const getLoadingState = useCallback(() => {
    return {
      hasLoading: loadingActions.size > 0,
      loadingCount: loadingActions.size,
      loadingActions: Array.from(loadingActions),
    };
  }, [loadingActions]);

  return {
    // Loading state checkers
    isActionLoading,
    isAnyActionLoading,
    getLoadingState,

    // Loading state setters
    startLoading,
    stopLoading,
    clearAllLoading,

    // Action wrappers
    wrapActionWithLoading,
    createLoadingAction,
  };
};
