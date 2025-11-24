import { useCallback } from "react";

/**
 * Hook for execution summary utilities
 * Extracted from useAutoFundingExecution.js for better maintainability
 */
interface LastExecution {
  id: string;
  trigger: string;
  executedAt: string;
  rulesExecuted: number;
  totalFunded: number;
  remainingCash: number;
  initialCash: number;
  success?: boolean;
  results?: Array<{ success: boolean; [key: string]: unknown }>;
  [key: string]: unknown;
}

export const useExecutionSummary = (lastExecution: LastExecution | null) => {
  // Get execution summary for display
  const getExecutionSummary = useCallback(() => {
    if (!lastExecution) {
      return null;
    }

    return {
      id: lastExecution.id,
      trigger: lastExecution.trigger,
      executedAt: lastExecution.executedAt,
      rulesExecuted: lastExecution.rulesExecuted,
      totalFunded: lastExecution.totalFunded,
      remainingCash: lastExecution.remainingCash,
      initialCash: lastExecution.initialCash,
      success: lastExecution.success !== false,
      hasErrors: lastExecution.results?.some((r) => !r.success) || false,
    };
  }, [lastExecution]);

  return {
    getExecutionSummary,
  };
};
